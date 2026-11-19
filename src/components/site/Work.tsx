import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import bottleToxic from "@/assets/bottle-toxic.png";
import bottleHalls from "@/assets/bottle-halls.png";

interface FlavorItem {
  id: string;
  number: string;
  title: string;
  category: string;
  description: string;
  notes: string[];
  tags: string[];
  bottle: string;
  accentColor: string;
  align: "right" | "left";
  palette: {
    colorDeep: string;
    colorMid: string;
    colorHighlight: string;
  };
}

const FLAVORS_DATA: FlavorItem[] = [
  // 1: Красная линейка (смещена вправо)
  {
    id: "leggo",
    number: "01",
    title: "LEGGO",
    category: "Модульный ягодный концентрат",
    description:
      "Линейка-конструктор премиального уровня с выверенной сладостью и кристальной чистотой. Спелая земляника, лесная ежевика и сочный тропический ананас с мягкой цитрусовой кислинкой.",
    notes: ["Спелая земляника", "Лесная ежевика", "Тропический ананас"],
    tags: ["0% Никотина", "USP Стандарт", "Дозировка: 4–6%"],
    bottle: "/bottle-red.png",
    accentColor: "#F43F5E",
    align: "right",
    palette: {
      colorDeep: "#9f1239",
      colorMid: "#f43f5e",
      colorHighlight: "#ffe4e6",
    },
  },
  // 2: Зелёная линейка (смещена влево)
  {
    id: "toxic",
    number: "02",
    title: "ТОКСИК",
    category: "Экстремально кислый яблочно-цитрусовый профиль",
    description:
      "Ультра-интенсивный взрывной профиль для поклонников выраженной кислотности. Мощный стартовый акцент яблока Гренни Смит переходит в лаймовый фреш и шипучий покалывающий шлейф.",
    notes: ["Кислое яблоко Гренни Смит", "Лаймовый фреш", "Шипучая карамель"],
    tags: ["Супер-насыщенность", "0% Диацетила", "Дозировка: 5–8%"],
    bottle: bottleToxic,
    accentColor: "#D9FF00",
    align: "left",
    palette: {
      colorDeep: "#65a30d",
      colorMid: "#d9ff00",
      colorHighlight: "#ffffff",
    },
  },
  // 3: Линейка ХОЛС (смещена вправо, на одной оси с 1-й)
  {
    id: "halls",
    number: "03",
    title: "ХОЛС",
    category: "Ледяная лесная черника с морозным кулером",
    description:
      "Освежающая классика фармацевтического стандарта USP. Спелая дикая черника с безупречно чистым леденящим вдохом и благородными ментоловыми нотами, сохраняющими кристальную чистоту и свежесть вкуса.",
    notes: ["Лесная морозная черника", "Кристаллический ментол USP", "Арктический кулер"],
    tags: ["Кристаллический кулер", "USP Фармакопея", "Дозировка: 3–5%"],
    bottle: bottleHalls,
    accentColor: "#38BDF8",
    align: "right",
    palette: {
      colorDeep: "#0369a1",
      colorMid: "#38bdf8",
      colorHighlight: "#fbcfe8",
    },
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
    float t = u_time * 0.5;

    // Fluid distortion around mouse cursor
    vec2 mDelta = st - u_mouse;
    float mDist = length(mDelta);
    float mStrength = exp(-mDist * 3.8) * u_mouseActive;
    vec2 mPush = normalize(mDelta + vec2(0.0001)) * mStrength * 0.4;

    // Upward organic ascent vector + cursor push
    vec2 upDrift = vec2(sin(t * 0.6 + uv.y * 3.0) * 0.07, -t * 0.8) + mPush;

    // Multi-stage domain warping
    vec2 q = vec2(
      fbm(st * 1.8 + upDrift * 0.7),
      fbm(st * 1.8 + upDrift * 0.8 + vec2(5.2, 1.3))
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

    // Clean contrast
    col = clamp((col - 0.5) * 1.05 + 0.5, 0.0, 1.0);

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

interface WebGLSquareProps {
  palette: FlavorItem["palette"];
  isHovered: boolean;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerEnter: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerLeave: () => void;
  className?: string;
}

function WebGLSquare({
  palette,
  isHovered,
  onPointerMove,
  onPointerEnter,
  onPointerLeave,
  className = "rounded-[2.25rem]",
}: WebGLSquareProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const targetMouseRef = useRef({ x: 0.5, y: 0.5 });
  const currentMouseRef = useRef({ x: 0.5, y: 0.5 });
  const mouseActiveRef = useRef(0.0);

  const glRef = useRef<WebGLRenderingContext | null>(null);
  const uniformsRef = useRef<{
    uRes: WebGLUniformLocation | null;
    uTime: WebGLUniformLocation | null;
    uMouse: WebGLUniformLocation | null;
    uMouseActive: WebGLUniformLocation | null;
  } | null>(null);
  const startTimeRef = useRef(performance.now());
  const animFrameRef = useRef<number | null>(null);

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

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const vs = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

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

    const uRes = gl.getUniformLocation(program, "u_resolution");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uMouseActive = gl.getUniformLocation(program, "u_mouseActive");
    const uDeep = gl.getUniformLocation(program, "u_colorDeep");
    const uMid = gl.getUniformLocation(program, "u_colorMid");
    const uHighlight = gl.getUniformLocation(program, "u_colorHighlight");

    uniformsRef.current = { uRes, uTime, uMouse, uMouseActive };

    const rgbDeep = parseColor(palette.colorDeep);
    const rgbMid = parseColor(palette.colorMid);
    const rgbHighlight = parseColor(palette.colorHighlight);

    gl.uniform3f(uDeep, rgbDeep[0], rgbDeep[1], rgbDeep[2]);
    gl.uniform3f(uMid, rgbMid[0], rgbMid[1], rgbMid[2]);
    gl.uniform3f(uHighlight, rgbHighlight[0], rgbHighlight[1], rgbHighlight[2]);

    const render = (now: number) => {
      const c = canvasRef.current;
      const cnt = containerRef.current;
      const u = uniformsRef.current;
      if (gl && c && cnt && u) {
        const rect = cnt.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.round(rect.width * dpr);
        const h = Math.round(rect.height * dpr);

        if (w > 0 && h > 0 && (c.width !== w || c.height !== h)) {
          c.width = w;
          c.height = h;
          gl.viewport(0, 0, w, h);
          if (u.uRes) gl.uniform2f(u.uRes, w, h);
        }

        currentMouseRef.current.x +=
          (targetMouseRef.current.x - currentMouseRef.current.x) * 0.08;
        currentMouseRef.current.y +=
          (targetMouseRef.current.y - currentMouseRef.current.y) * 0.08;

        const elapsed = (now - startTimeRef.current) * 0.001;
        if (u.uTime) gl.uniform1f(u.uTime, elapsed);
        if (u.uMouse)
          gl.uniform2f(
            u.uMouse,
            currentMouseRef.current.x,
            currentMouseRef.current.y
          );
        if (u.uMouseActive)
          gl.uniform1f(u.uMouseActive, mouseActiveRef.current);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (buf) gl.deleteBuffer(buf);
      if (program) gl.deleteProgram(program);
      if (vs) gl.deleteShader(vs);
      if (fs) gl.deleteShader(fs);
    };
  }, [palette]);

  const handleLocalPointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height;
    targetMouseRef.current = { x, y };
    currentMouseRef.current = { x, y };
    mouseActiveRef.current = 1.0;
    onPointerEnter(e);
  };

  const handleLocalPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(
      0,
      Math.min(1, 1.0 - (e.clientY - rect.top) / rect.height)
    );
    targetMouseRef.current = { x, y };
    mouseActiveRef.current = 1.0;
    onPointerMove(e);
  };

  const handleLocalPointerLeave = () => {
    mouseActiveRef.current = 0.0;
    onPointerLeave();
  };

  return (
    <div
      ref={containerRef}
      onPointerEnter={handleLocalPointerEnter}
      onPointerMove={handleLocalPointerMove}
      onPointerLeave={handleLocalPointerLeave}
      className={`absolute inset-0 w-full h-full overflow-hidden bg-zinc-950 ${className}`}
    >
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full block pointer-events-none transition-all duration-700 ease-out ${
          isHovered
            ? "opacity-100 scale-[1.03] filter brightness-110"
            : "opacity-85 scale-100 filter brightness-95"
        }`}
      />
      {/* Soft inner vignette overlay */}
      <div className={`absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/15 ${className}`} />
    </div>
  );
}

function FlavorRow({ item }: { item: FlavorItem }) {
  const [isHovered, setIsHovered] = useState(false);
  const isAlignRight = item.align === "right";

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full overflow-hidden py-4 lg:py-6"
    >
      {/* ========================================================
          DESKTOP FULL-BLEED GRADIENT RECTANGLE
          Extends to the nearest edge of the screen!
         ======================================================== */}
      <motion.div
        initial={{ opacity: 0, x: isAlignRight ? 60 : -60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`hidden lg:block absolute inset-y-4 lg:inset-y-6 z-0 pointer-events-auto ${
          isAlignRight
            ? "right-0 left-[calc(50%+1.5rem)]"
            : "left-0 right-[calc(50%+1.5rem)]"
        }`}
      >
        <WebGLSquare
          palette={item.palette}
          isHovered={isHovered}
          onPointerEnter={() => setIsHovered(true)}
          onPointerMove={() => setIsHovered(true)}
          onPointerLeave={() => setIsHovered(false)}
          className={
            isAlignRight
              ? "rounded-l-[2.75rem] rounded-r-none"
              : "rounded-r-[2.75rem] rounded-l-none"
          }
        />
      </motion.div>

      {/* ========================================================
          CONTENT CONTAINER (Centered max-w-5xl, PNG bottle in place)
         ======================================================== */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 sm:gap-14 lg:gap-12 min-h-[440px] lg:min-h-[480px]">
          {/* ========================================================
              PNG BOTTLE SLOT (Stays in its exact grid column!)
             ======================================================== */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={`relative z-20 w-full flex justify-center items-center ${
              isAlignRight ? "order-1 lg:order-2" : "order-1 lg:order-1"
            }`}
          >
            <div className="group relative w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[440px] aspect-square flex items-center justify-center cursor-pointer">
              {/* Mobile-only background square (desktop uses bleed background) */}
              <div className="lg:hidden absolute inset-0 rounded-[2.25rem] overflow-hidden">
                <WebGLSquare
                  palette={item.palette}
                  isHovered={isHovered}
                  onPointerEnter={() => setIsHovered(true)}
                  onPointerMove={() => setIsHovered(true)}
                  onPointerLeave={() => setIsHovered(false)}
                  className="rounded-[2.25rem]"
                />
              </div>

              {/* PNG Bottle positioned above with 3D overflow */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                <img
                  src={item.bottle}
                  alt={item.title}
                  className={`h-[128%] max-h-[560px] w-auto object-contain transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] select-none ${
                    isHovered
                      ? "scale-110 -translate-y-4 drop-shadow-[0_32px_44px_rgba(0,0,0,0.7)]"
                      : "scale-100 translate-y-0 drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)]"
                  }`}
                />
              </div>

              {/* Accent Badge on top of the bottle area */}
              <div className="absolute top-5 left-5 z-40 flex items-center gap-2 pointer-events-none">
                <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20">
                  {item.number}
                </span>
              </div>
            </div>
          </motion.div>

          {/* ========================================================
              FLAVOR DESCRIPTION (Appears smoothly on scroll!)
             ======================================================== */}
          <motion.div
            initial={{ opacity: 0, x: isAlignRight ? -45 : 45, y: 15 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className={`w-full max-w-[460px] mx-auto lg:mx-0 ${
              isAlignRight
                ? "order-2 lg:order-1 lg:pr-4"
                : "order-2 lg:order-2 lg:pl-4"
            }`}
          >
            <div className="p-2 sm:p-4 text-left">
              {/* Title */}
              <h3 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-extrabold tracking-tight text-foreground mb-4 leading-[1.15]">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function Work() {
  return (
    <section id="flavors" className="py-20 md:py-32 overflow-hidden relative">
      {/* Vertical Stack with Staggered Alternating Rhythm and Bleed Edges */}
      <div className="flex flex-col gap-24 sm:gap-32 lg:gap-36 w-full">
        {FLAVORS_DATA.map((item) => (
          <FlavorRow key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
export default Work;
