import React, { useEffect, useRef, useState, useCallback } from "react";
import { Reveal, SectionTitle } from "./primitives";

interface CardPalette {
  colorDeep: string;
  colorMid: string;
  colorHighlight: string;
}

const CARDS_DATA: CardPalette[] = [
  // 1: Синий (ледяной сине-голубой с мягким розовым бликом)
  {
    colorDeep: "#0284c7",
    colorMid: "#38bdf8",
    colorHighlight: "#f472b6",
  },
  // 2: Красный (ярко-малиновый / розовый с белым свечением)
  {
    colorDeep: "#be185d",
    colorMid: "#f43f5e",
    colorHighlight: "#ffffff",
  },
  // 3: Салатовый (лаймово-неоновый в фирменных цветах MOLECULA #d9ff00 / #77b80f)
  {
    colorDeep: "#77b80f",
    colorMid: "#d9ff00",
    colorHighlight: "#ffffff",
  },
];

const VERTEX_SHADER = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 v_uv;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec2 u_mouse;
  uniform float u_mouseActive;
  uniform vec3 u_colorDeep;
  uniform vec3 u_colorMid;
  uniform vec3 u_colorHighlight;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.02 + vec2(13.1, 17.5);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = v_uv;
    vec2 st = uv;
    float t = u_time * 0.55;

    // Fluid distortion around mouse cursor
    vec2 mDelta = st - u_mouse;
    float mDist = length(mDelta);
    float mStrength = exp(-mDist * 3.6) * u_mouseActive;
    vec2 mPush = normalize(mDelta + vec2(0.0001)) * mStrength * 0.42;

    // Upward flow ascent + interactive mouse ripple push
    vec2 upDrift = vec2(sin(t * 0.6 + uv.y * 3.2) * 0.07, -t * 0.85) + mPush;

    // Multi-stage domain warping
    vec2 q = vec2(
      fbm(st * 1.8 + upDrift * 0.72),
      fbm(st * 1.8 + upDrift * 0.82 + vec2(5.2, 1.3))
    );

    vec2 r = vec2(
      fbm(st * 2.2 + 2.1 * q + upDrift * 0.95 + vec2(1.7, 9.2)),
      fbm(st * 2.2 + 2.1 * q + upDrift * 1.05 + vec2(8.3, 2.8))
    );

    float f = fbm(st * 1.5 + 2.5 * r + upDrift * 1.25);

    // Color mixing: Deep -> Mid -> Highlight
    vec3 col = mix(u_colorDeep, u_colorMid, smoothstep(0.12, 0.68, f));
    col = mix(col, u_colorHighlight, smoothstep(0.38, 0.88, r.x * f) * 0.88);

    // Specular liquid ribbon
    float highlightRibbon = smoothstep(0.55, 0.68, fbm(r * 3.2 + upDrift * 1.35));
    col = mix(col, u_colorHighlight, highlightRibbon * 0.32);

    // Luminous aura under cursor
    float cursorGlow = exp(-mDist * 2.6) * 0.38 * u_mouseActive;
    col = mix(col, u_colorHighlight, cursorGlow);

    // Rich contrast polish
    col = clamp((col - 0.5) * 1.06 + 0.5, 0.0, 1.0);

    gl_FragColor = vec4(col, 1.0);
  }
`;

function parseColor(hex: string): [number, number, number] {
  let clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const intVal = parseInt(clean, 16);
  if (isNaN(intVal)) return [0.5, 0.5, 0.5];
  return [
    ((intVal >> 16) & 255) / 255,
    ((intVal >> 8) & 255) / 255,
    (intVal & 255) / 255,
  ];
}

interface InteractiveCardProps {
  palette: CardPalette;
}

function InteractiveCard({ palette }: InteractiveCardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isHovered, setIsHovered] = useState(false);
  const isRunningRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);
  const stopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mouse coordinates with smooth Lerp inertia
  const targetMouseRef = useRef({ x: 0.5, y: 0.5 });
  const currentMouseRef = useRef({ x: 0.5, y: 0.5 });
  const mouseActiveRef = useRef(0.0);

  // WebGL context & uniform locations cache
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const uniformsRef = useRef<{
    uRes: WebGLUniformLocation | null;
    uTime: WebGLUniformLocation | null;
    uMouse: WebGLUniformLocation | null;
    uMouseActive: WebGLUniformLocation | null;
    uDeep: WebGLUniformLocation | null;
    uMid: WebGLUniformLocation | null;
    uHighlight: WebGLUniformLocation | null;
  } | null>(null);
  const startTimeRef = useRef(performance.now());

  // Initialize WebGL once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext("webgl", { alpha: false, antialias: true }) ||
      (canvas.getContext("experimental-webgl", {
        alpha: false,
        antialias: true,
      }) as WebGLRenderingContext | null);

    if (!gl) return;
    glRef.current = gl;

    const compileShader = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        gl.deleteShader(s);
        return null;
      }
      return s;
    };

    const vs = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    programRef.current = program;
    gl.useProgram(program);

    // Quad buffer
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Cache uniforms
    uniformsRef.current = {
      uRes: gl.getUniformLocation(program, "u_resolution"),
      uTime: gl.getUniformLocation(program, "u_time"),
      uMouse: gl.getUniformLocation(program, "u_mouse"),
      uMouseActive: gl.getUniformLocation(program, "u_mouseActive"),
      uDeep: gl.getUniformLocation(program, "u_colorDeep"),
      uMid: gl.getUniformLocation(program, "u_colorMid"),
      uHighlight: gl.getUniformLocation(program, "u_colorHighlight"),
    };

    const rgbDeep = parseColor(palette.colorDeep);
    const rgbMid = parseColor(palette.colorMid);
    const rgbHighlight = parseColor(palette.colorHighlight);

    gl.uniform3f(uniformsRef.current.uDeep, rgbDeep[0], rgbDeep[1], rgbDeep[2]);
    gl.uniform3f(uniformsRef.current.uMid, rgbMid[0], rgbMid[1], rgbMid[2]);
    gl.uniform3f(
      uniformsRef.current.uHighlight,
      rgbHighlight[0],
      rgbHighlight[1],
      rgbHighlight[2]
    );

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (buf) gl.deleteBuffer(buf);
      if (program) gl.deleteProgram(program);
      if (vs) gl.deleteShader(vs);
      if (fs) gl.deleteShader(fs);
    };
  }, [palette]);

  // Render loop, running ONLY when active / fading out
  const startAnimation = useCallback(() => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;

    const render = (now: number) => {
      const gl = glRef.current;
      const canvas = canvasRef.current;
      const container = containerRef.current;
      const uniforms = uniformsRef.current;

      if (gl && canvas && container && uniforms) {
        // Resize viewport
        const rect = container.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.round(rect.width * dpr);
        const h = Math.round(rect.height * dpr);

        if (w > 0 && h > 0 && (canvas.width !== w || canvas.height !== h)) {
          canvas.width = w;
          canvas.height = h;
          gl.viewport(0, 0, w, h);
          if (uniforms.uRes) gl.uniform2f(uniforms.uRes, w, h);
        }

        // Smooth Lerp for cursor position
        currentMouseRef.current.x +=
          (targetMouseRef.current.x - currentMouseRef.current.x) * 0.08;
        currentMouseRef.current.y +=
          (targetMouseRef.current.y - currentMouseRef.current.y) * 0.08;

        const elapsed = (now - startTimeRef.current) * 0.001;
        if (uniforms.uTime) gl.uniform1f(uniforms.uTime, elapsed);
        if (uniforms.uMouse)
          gl.uniform2f(
            uniforms.uMouse,
            currentMouseRef.current.x,
            currentMouseRef.current.y
          );
        if (uniforms.uMouseActive)
          gl.uniform1f(uniforms.uMouseActive, mouseActiveRef.current);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }

      if (isRunningRef.current) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    animFrameRef.current = requestAnimationFrame(render);
  }, []);

  const stopAnimation = useCallback(() => {
    isRunningRef.current = false;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height;

    targetMouseRef.current = { x, y };
    currentMouseRef.current = { x, y };
    mouseActiveRef.current = 1.0;

    setIsHovered(true);
    startAnimation();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(
      0,
      Math.min(1, 1.0 - (e.clientY - rect.top) / rect.height)
    );

    targetMouseRef.current = { x, y };
    mouseActiveRef.current = 1.0;
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    mouseActiveRef.current = 0.0;

    // Pause WebGL rendering after 600ms once CSS fade-out finishes
    if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    stopTimeoutRef.current = setTimeout(() => {
      stopAnimation();
    }, 600);
  };

  return (
    <div
      ref={containerRef}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative aspect-square w-full bg-white select-none overflow-hidden cursor-pointer"
    >
      {/* Liquid WebGL Canvas with smooth 500ms opacity transition */}
      <div
        className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-out ${
          isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block pointer-events-none"
        />
      </div>
    </div>
  );
}

export function Work() {
  return (
    <section id="flavors" className="py-24 md:py-32 overflow-hidden">
      <div className="container-midu">
        {/* Section Header */}
        <Reveal>
          <SectionTitle
            lead="Коллекции вкусов."
            trail="Флагманские линейки чистой вкусопередачи."
          />
        </Reveal>

        {/* Minimalist 3-Card Grid (Biograph style, borderless, seamless gap-0, rounded-2xl container) */}
        <div className="mt-14 overflow-hidden rounded-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0">
            {CARDS_DATA.map((palette, index) => (
              <InteractiveCard key={index} palette={palette} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
export default Work;