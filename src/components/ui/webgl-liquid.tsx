import React, { useEffect, useRef } from "react";

export interface WebGLLiquidProps {
  colorDeep?: string;
  colorMid?: string;
  colorHighlight?: string;
  speed?: number;
  flowStrength?: number;
  grain?: number;
  contrast?: number;
  opacity?: number;
  title?: string;
  subtitle?: string;
  description?: string;
  reveal?: boolean;
  delayMs?: number;
  revealDuration?: number;
  children?: React.ReactNode;
  className?: string;
}

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
  uniform vec3 u_colorDeep;
  uniform vec3 u_colorMid;
  uniform vec3 u_colorHighlight;
  uniform float u_flowStrength;
  uniform float u_grain;
  uniform float u_contrast;
  uniform float u_opacity;

  // Hash & noise for organic fluid turbulence
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
    float aspect = u_resolution.x / max(1.0, u_resolution.y);
    vec2 st = vec2(uv.x * aspect, uv.y);

    float t = u_time * 0.45;
    float flow = u_flowStrength;

    // Upward drift vector: subtracting from Y coordinate makes the fluid rise UPWARDS
    vec2 upDrift = vec2(sin(t * 0.5 + uv.y * 2.5) * 0.08 * flow, -t * 0.85);

    // Multi-stage domain warping with continuous upward ascent
    vec2 q = vec2(
      fbm(st * 1.6 + upDrift * 0.75 + vec2(0.0, 0.0)),
      fbm(st * 1.6 + upDrift * 0.85 + vec2(5.2, 1.3))
    );

    vec2 r = vec2(
      fbm(st * 2.0 + 2.2 * q * flow + upDrift * 1.0 + vec2(1.7, 9.2)),
      fbm(st * 2.0 + 2.2 * q * flow + upDrift * 1.1 + vec2(8.3, 2.8))
    );

    float f = fbm(st * 1.4 + 2.6 * r * flow + upDrift * 1.25);

    // Color gradient mixing: Deep -> Mid -> Highlight
    vec3 col = mix(u_colorDeep, u_colorMid, smoothstep(0.12, 0.65, f));
    col = mix(col, u_colorHighlight, smoothstep(0.42, 0.86, r.x * f) * 0.9);

    // Liquid specular shine ribbons rising upward
    float highlightRibbon = smoothstep(0.56, 0.65, fbm(r * 3.2 + upDrift * 1.4));
    col = mix(col, u_colorHighlight, highlightRibbon * 0.35);

    // Contrast adjustment
    col = clamp((col - 0.5) * u_contrast + 0.5, 0.0, 1.0);

    // Optional grain / dither
    if (u_grain > 0.001) {
      float g = (hash(gl_FragCoord.xy + fract(u_time) * 100.0) - 0.5) * u_grain;
      col += g;
    }

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), u_opacity);
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
  if (isNaN(intVal)) return [0.8, 1.0, 0.0];
  return [
    ((intVal >> 16) & 255) / 255,
    ((intVal >> 8) & 255) / 255,
    (intVal & 255) / 255,
  ];
}

export function WebGLLiquid({
  colorDeep = "#d9ff00",
  colorMid = "#77b80f",
  colorHighlight = "#a2a2a2",
  speed = 1,
  flowStrength = 1,
  grain = 0,
  contrast = 1,
  opacity = 0.95,
  title,
  subtitle,
  description,
  children,
  className = "",
}: WebGLLiquidProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gl =
      canvas.getContext("webgl", { alpha: true, antialias: true }) ||
      (canvas.getContext("experimental-webgl", {
        alpha: true,
        antialias: true,
      }) as WebGLRenderingContext | null);

    if (!gl) return;

    const compileShader = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
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

    gl.useProgram(program);

    // Quad
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "u_resolution");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uDeep = gl.getUniformLocation(program, "u_colorDeep");
    const uMid = gl.getUniformLocation(program, "u_colorMid");
    const uHighlight = gl.getUniformLocation(program, "u_colorHighlight");
    const uFlow = gl.getUniformLocation(program, "u_flowStrength");
    const uGrain = gl.getUniformLocation(program, "u_grain");
    const uContrast = gl.getUniformLocation(program, "u_contrast");
    const uOpacity = gl.getUniformLocation(program, "u_opacity");

    const rgbDeep = parseColor(colorDeep);
    const rgbMid = parseColor(colorMid);
    const rgbHighlight = parseColor(colorHighlight);

    gl.uniform3f(uDeep, rgbDeep[0], rgbDeep[1], rgbDeep[2]);
    gl.uniform3f(uMid, rgbMid[0], rgbMid[1], rgbMid[2]);
    gl.uniform3f(uHighlight, rgbHighlight[0], rgbHighlight[1], rgbHighlight[2]);
    gl.uniform1f(uFlow, flowStrength);
    gl.uniform1f(uGrain, grain);
    gl.uniform1f(uContrast, contrast);
    gl.uniform1f(uOpacity, opacity);

    let animId: number;
    const start = performance.now();

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(rect.width * dpr);
      const h = Math.round(rect.height * dpr);

      if (w > 0 && h > 0 && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
        gl.uniform2f(uRes, w, h);
      }
    };

    const render = (now: number) => {
      resize();
      const elapsed = (now - start) * 0.001 * speed;
      gl.uniform1f(uTime, elapsed);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [
    colorDeep,
    colorMid,
    colorHighlight,
    speed,
    flowStrength,
    grain,
    contrast,
    opacity,
  ]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none"
      />

      {(title || subtitle || description || children) && (
        <div className="relative z-10 w-full h-full">
          {children ? (
            children
          ) : (
            <div className="flex h-full flex-col justify-end p-8 text-black">
              {subtitle && (
                <span className="font-mono text-xs uppercase tracking-wider opacity-75">
                  {subtitle}
                </span>
              )}
              {title && (
                <h3 className="mt-1 text-3xl font-bold tracking-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-3 max-w-md text-sm leading-relaxed opacity-85">
                  {description}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default WebGLLiquid;
