import React, { useEffect, useRef, useState, useCallback } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Reveal, SectionTitle } from "./primitives";

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
    id: "lego-go",
    number: "01",
    title: "ЛЕГО ГО",
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
    bottle: "/bottle-green.png",
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
    title: "ХОЛС · ЧЕРНИКА",
    category: "Ледяная лесная черника с морозным кулером",
    description:
      "Освежающая классика фармацевтического стандарта USP. Спелая дикая черника с безупречно чистым леденящим вдохом и благородными ментоловыми нотами, сохраняющими спирали и хлопок чистыми в 2.5 раза дольше.",
    notes: ["Лесная морозная черника", "Кристаллический ментол USP", "Арктический кулер"],
    tags: ["Кристаллический кулер", "USP Фармакопея", "Дозировка: 3–5%"],
    bottle: "/bottle-blue.png",
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
}

function WebGLSquare({
  palette,
  isHovered,
  onPointerMove,
  onPointerEnter,
  onPointerLeave,
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
      className="absolute inset-0 w-full h-full overflow-hidden rounded-[2.25rem] bg-zinc-950"
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
      <div className="absolute inset-0 pointer-events-none rounded-[2.25rem] ring-1 ring-inset ring-white/15" />
    </div>
  );
}

function FlavorRow({ item }: { item: FlavorItem }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgSrc, setImgSrc] = useState(item.bottle);

  const isAlignRight = item.align === "right";

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative w-full flex flex-col items-center justify-center cursor-pointer"
    >
      {/* Row Container with Interactive Offset Physics */}
      <div className="relative w-full max-w-5xl flex flex-col lg:flex-row items-center justify-center">
        {/* ========================================================
            THE SQUARE + PNG BOTTLE
           ======================================================== */}
        <div
          className={`relative z-20 w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[440px] aspect-square transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isAlignRight
              ? isHovered
                ? "lg:translate-x-32 sm:translate-y-[-4px]"
                : "lg:translate-x-16"
              : isHovered
              ? "lg:-translate-x-32 sm:translate-y-[-4px]"
              : "lg:-translate-x-16"
          }`}
        >
          {/* Living WebGL Shader Square */}
          <WebGLSquare
            palette={item.palette}
            isHovered={isHovered}
            onPointerEnter={() => setIsHovered(true)}
            onPointerMove={() => setIsHovered(true)}
            onPointerLeave={() => setIsHovered(false)}
          />

          {/* PNG Bottle positioned above the square with 3D overflow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <img
              src={imgSrc}
              alt={item.title}
              onError={() => setImgSrc("/bottle-green.png")}
              className={`h-[128%] max-h-[560px] w-auto object-contain transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] select-none ${
                isHovered
                  ? "scale-110 -translate-y-4 drop-shadow-[0_28px_40px_rgba(0,0,0,0.65)]"
                  : "scale-100 translate-y-0 drop-shadow-[0_16px_28px_rgba(0,0,0,0.45)]"
              }`}
            />
          </div>

          {/* Accent Badge on top of the square */}
          <div className="absolute top-5 left-5 z-40 flex items-center gap-2 pointer-events-none">
            <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20">
              {item.number}
            </span>
          </div>
        </div>

        {/* ========================================================
            SLIDE-OUT FLAVOR DESCRIPTION
            - Desktop: Slides out in the opposite direction
            - Mobile: Sits neatly underneath the card
           ======================================================== */}
        <div
          className={`w-full max-w-[360px] sm:max-w-[420px] lg:max-w-[380px] mt-8 lg:mt-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isAlignRight
              ? // For right-aligned squares, text appears on the LEFT on desktop
                `lg:absolute lg:left-4 xl:left-8 ${
                  isHovered
                    ? "lg:opacity-100 lg:translate-x-0"
                    : "lg:opacity-0 lg:translate-x-12 lg:pointer-events-none"
                }`
              : // For left-aligned squares, text appears on the RIGHT on desktop
                `lg:absolute lg:right-4 xl:right-8 ${
                  isHovered
                    ? "lg:opacity-100 lg:translate-x-0"
                    : "lg:opacity-0 lg:-translate-x-12 lg:pointer-events-none"
                }`
          }`}
        >
          <div className="p-4 sm:p-6 text-left">
            {/* Category tag */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: item.accentColor }}
              />
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {item.category}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-3">
              {item.title}
            </h3>

            {/* Description */}
            <p className="text-sm leading-relaxed text-muted-foreground mb-5">
              {item.description}
            </p>

            {/* Flavor Notes */}
            <div className="space-y-1.5 mb-5 pb-5 border-b border-border/60">
              <div className="text-xs font-mono uppercase text-muted-foreground/70 mb-2 font-semibold">
                Вкусовая пирамида:
              </div>
              {item.notes.map((note, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground/90"
                >
                  <Sparkles className="size-3 text-purple-500 shrink-0" />
                  <span>{note}</span>
                </div>
              ))}
            </div>

            {/* Tags & Action */}
            <div className="flex flex-wrap items-center gap-2">
              {item.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md bg-secondary/80 text-[11px] font-mono text-secondary-foreground border border-border/40"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-5">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 text-xs font-bold text-foreground hover:text-purple-500 transition-colors"
              >
                <span>Запросить рецептуру</span>
                <ArrowUpRight className="size-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Work() {
  return (
    <section id="flavors" className="py-24 md:py-36 overflow-hidden">
      <div className="container-midu">
        {/* Section Header */}
        <Reveal>
          <SectionTitle
            lead="Коллекции вкусов."
            trail="Флагманские линейки чистой вкусопередачи."
          />
        </Reveal>

        {/* Vertical Stack with Staggered Alternating Rhythm */}
        <div className="mt-20 md:mt-28 flex flex-col gap-24 sm:gap-28 lg:gap-36">
          {FLAVORS_DATA.map((item) => (
            <Reveal key={item.id} y={35}>
              <FlavorRow item={item} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
export default Work;
