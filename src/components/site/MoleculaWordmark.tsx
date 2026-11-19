import { useEffect, useRef } from "react";

interface MoleculaWordmarkProps {
  className?: string;
  variant?: "hero" | "footer";
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
  uniform sampler2D u_textMask;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float u_isHero;
  uniform float u_isDark;

  // High-frequency hash for tactile stipple / film grain
  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  // Smooth 2D value noise for organic fluid distortion
  float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash12(i);
    float b = hash12(i + vec2(1.0, 0.0));
    float c = hash12(i + vec2(0.0, 1.0));
    float d = hash12(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      v += amp * valueNoise(p);
      p = p * 2.03 + vec2(17.1, 31.7);
      amp *= 0.5;
    }
    return v;
  }

  // Computes the undulating wave height at horizontal coordinate x in [0, 1]
  float getWaveHeight(float x, float t, float isHero) {
    float shift = sin(t * 0.45) * 0.12;
    float mainPeak = exp(-pow((x - (0.34 + shift)) / 0.24, 2.0)) * (isHero > 0.5 ? 0.28 : 0.58);
    float rightPeak = exp(-pow((x - (1.02 - shift * 0.7)) / 0.22, 2.0)) * (isHero > 0.5 ? 0.20 : 0.44);

    float wave1 = sin(x * 4.8 - t * 0.75) * (isHero > 0.5 ? 0.04 : 0.11);
    float wave2 = cos(x * 8.2 + t * 0.55) * (isHero > 0.5 ? 0.025 : 0.055);
    float wave3 = sin(x * 2.4 + t * 0.35) * (isHero > 0.5 ? 0.03 : 0.08);

    float baseLine = isHero > 0.5 ? 0.03 : 0.22;
    float scale = isHero > 0.5 ? 0.38 : 0.85;
    return baseLine + (mainPeak + rightPeak + wave1 + wave2 + wave3) * scale;
  }

  void main() {
    // v_uv.y: 0.0 at bottom, 1.0 at top
    vec2 uv = v_uv;
    // Flip Y for canvas texture sampling (canvas 0,0 is top-left)
    float textMask = texture2D(u_textMask, vec2(uv.x, 1.0 - uv.y)).a;

    float t = u_time;

    // Organic domain warping
    float warp = (fbm(vec2(uv.x * 3.2 + t * 0.18, uv.y * 2.4 - t * 0.14)) - 0.5) * 0.14;
    float waveH = getWaveHeight(uv.x + warp * 0.35, t, u_isHero) + warp * 0.45;

    // Vertical distance below the wave crest (positive inside the wave, negative above it)
    float dist = waveH - uv.y;

    // Per-pixel grain (disabled completely as requested)
    float grain = 0.0;
    float fineGrain = 0.0;

    // For Hero: clean solid purple text with multiply blend mode
    if (u_isHero > 0.5) {
      if (textMask < 0.01) {
        gl_FragColor = vec4(0.0);
        return;
      }

      // Brand purple #5D00FF
      vec3 textColor = vec3(0.365, 0.000, 1.000);
      float alpha = textMask * 0.92;

      gl_FragColor = vec4(textColor, alpha);
      return;
    }

    // --- 1. OUTSIDE LETTERS (Footer / non-hero variant) ---
    vec3 bgBase = u_isDark > 0.5 ? vec3(0.0, 0.0, 0.0) : vec3(0.980, 0.976, 0.996);

    float bgSoftness = 0.32;
    float bgWave = smoothstep(-bgSoftness, 0.18, dist);
    float bgCore = smoothstep(0.02, 0.26, dist);

    vec3 bgOuterViolet = vec3(0.769, 0.710, 0.992);
    vec3 bgMidPurple   = vec3(0.486, 0.227, 0.929);
    vec3 bgDeepPurple  = vec3(0.290, 0.016, 0.780);

    vec3 outsideColor = mix(bgBase, bgOuterViolet, bgWave * 0.45);
    outsideColor = mix(outsideColor, bgMidPurple, pow(bgWave, 1.45) * 0.85);
    outsideColor = mix(outsideColor, bgDeepPurple, bgCore * 0.92);

    float topFade = smoothstep(0.96, 0.40, uv.y);
    outsideColor = mix(bgBase, outsideColor, topFade);

    // --- 2. INSIDE LETTERS (Footer / non-hero variant) ---
    vec3 unlitLetter = u_isDark > 0.5 ? vec3(0.22, 0.20, 0.28) : vec3(0.890, 0.865, 0.965);

    float inSoftness = 0.24;
    float inWave = smoothstep(-inSoftness, 0.18, dist);
    float inMid  = smoothstep(-0.02, 0.26, dist);

    float stemStreak = 0.5 + 0.5 * sin(uv.x * 22.0 + sin(uv.x * 5.0 - t * 0.6) * 2.2);
    float inHotCore = smoothstep(0.06, 0.38, dist + stemStreak * 0.09);

    vec3 litEdgePurple = vec3(0.365, 0.000, 1.000);
    vec3 litVibrant    = vec3(0.600, 0.250, 0.990);
    vec3 litHotCore    = vec3(0.985, 0.975, 1.000);

    vec3 insideColor = mix(unlitLetter, litEdgePurple, inWave);
    insideColor = mix(insideColor, litVibrant, inMid);
    insideColor = mix(insideColor, litHotCore, inHotCore * 0.94);

    vec3 finalColor = mix(outsideColor, insideColor, textMask);

    gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
  }
`;

const WORDMARK_SVG_PATHS = typeof Path2D !== "undefined" ? [
  new Path2D("M576.44 78 553.05 23.59 529.65 78 513 78 545.71 2 560.39 2 593 78 576.44 78"),
  new Path2D("M508 78 455 78 455 2 470.11 2 470.11 63 492.89 63 492.89 48 508 48 508 78"),
  new Path2D("M412.55,80c-19.02,0-32.55-13.51-32.55-32.64V2h22v14h-6.8v31.36c0,10.26,7.16,17.45,17.35,17.45s17.35-7.2,17.35-17.45v-31.36h-6.9V2h22v45.36c0,19.13-13.43,32.64-32.45,32.64Z"),
  new Path2D("M291 17 250 17 250 32 287 32 287 48 250 48 250 63 291 63 291 78 235 78 235 2 291 2 291 17"),
  new Path2D("M225 78 172 78 172 2 187.11 2 187.11 63 209.89 63 209.89 48 225 48 225 78"),
  new Path2D("M124,15.19c-13.57,0-24.64,11.05-24.64,24.86s11.17,24.76,24.64,24.76,24.64-10.46,24.64-24.76-10.97-24.86-24.64-24.86ZM124,80c-22.14,0-40-17.85-40-39.95S101.46,0,124,0s40,17.76,40,40.05-17.56,39.95-40,39.95Z"),
  new Path2D("M15.28 78 0 78 0 2 15.08 2 38.05 41.63 61.02 2 76 2 76 78 60.82 78 60.82 32.66 46.82 56.81 59.14 78 41.6 78 38.05 71.89 34.5 78 16.95 78 29.28 56.81 15.28 32.66 15.28 78"),
  new Path2D("M356.52,21.97c-4.56-4.38-10.78-7.07-17.63-7.07-14.01,0-25.36,11.26-25.36,25.15s11.35,25.15,25.36,25.15c9.75,0,18.22-5.46,22.46-13.47l10.65,10.8c-7.16,10.95-19.79,17.46-33.12,17.46-21.98,0-39.88-17.66-39.88-39.95S316.8,0,338.88,0c10.74,0,20.69,4.04,28.25,11.54l-10.61,10.43Z"),
] : [];

export function MoleculaWordmarkSvg({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      id="_Слой_1"
      data-name="Слой 1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 593 80"
      className={className}
      style={style}
      fill="currentColor"
    >
      <polygon points="576.44 78 553.05 23.59 529.65 78 513 78 545.71 2 560.39 2 593 78 576.44 78" />
      <polygon points="508 78 455 78 455 2 470.11 2 470.11 63 492.89 63 492.89 48 508 48 508 78" />
      <path d="M412.55,80c-19.02,0-32.55-13.51-32.55-32.64V2h22v14h-6.8v31.36c0,10.26,7.16,17.45,17.35,17.45s17.35-7.2,17.35-17.45v-31.36h-6.9V2h22v45.36c0,19.13-13.43,32.64-32.45,32.64Z" />
      <polygon points="291 17 250 17 250 32 287 32 287 48 250 48 250 63 291 63 291 78 235 78 235 2 291 2 291 17" />
      <polygon points="225 78 172 78 172 2 187.11 2 187.11 63 209.89 63 209.89 48 225 48 225 78" />
      <path d="M124,15.19c-13.57,0-24.64,11.05-24.64,24.86s11.17,24.76,24.64,24.76,24.64-10.46,24.64-24.76-10.97-24.86-24.64-24.86ZM124,80c-22.14,0-40-17.85-40-39.95S101.46,0,124,0s40,17.76,40,40.05-17.56,39.95-40,39.95Z" />
      <polygon points="15.28 78 0 78 0 2 15.08 2 38.05 41.63 61.02 2 76 2 76 78 60.82 78 60.82 32.66 46.82 56.81 59.14 78 41.6 78 38.05 71.89 34.5 78 16.95 78 29.28 56.81 15.28 32.66 15.28 78" />
      <path d="M356.52,21.97c-4.56-4.38-10.78-7.07-17.63-7.07-14.01,0-25.36,11.26-25.36,25.15s11.35,25.15,25.36,25.15c9.75,0,18.22-5.46,22.46-13.47l10.65,10.8c-7.16,10.95-19.79,17.46-33.12,17.46-21.98,0-39.88-17.66-39.88-39.95S316.8,0,338.88,0c10.74,0,20.69,4.04,28.25,11.54l-10.61,10.43Z" />
    </svg>
  );
}

export function MoleculaStackedWordmarkSvg({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 294 156"
      className={className}
      style={style}
      fill="currentColor"
    >
      {/* ROW 1: M O L E */}
      <g>
        <polygon points="15.28 78 0 78 0 2 15.08 2 38.05 41.63 61.02 2 76 2 76 78 60.82 78 60.82 32.66 46.82 56.81 59.14 78 41.6 78 38.05 71.89 34.5 78 16.95 78 29.28 56.81 15.28 32.66 15.28 78" />
        <path d="M124,15.19c-13.57,0-24.64,11.05-24.64,24.86s11.17,24.76,24.64,24.76,24.64-10.46,24.64-24.76-10.97-24.86-24.64-24.86ZM124,80c-22.14,0-40-17.85-40-39.95S101.46,0,124,0s40,17.76,40,40.05-17.56,39.95-40,39.95Z" />
        <polygon points="225 78 172 78 172 2 187.11 2 187.11 63 209.89 63 209.89 48 225 48 225 78" />
        <polygon points="291 17 250 17 250 32 287 32 287 48 250 48 250 63 291 63 291 78 235 78 235 2 291 2 291 17" />
      </g>
      {/* ROW 2: C U L A */}
      <g transform="translate(-299, 76)">
        <path d="M356.52,21.97c-4.56-4.38-10.78-7.07-17.63-7.07-14.01,0-25.36,11.26-25.36,25.15s11.35,25.15,25.36,25.15c9.75,0,18.22-5.46,22.46-13.47l10.65,10.8c-7.16,10.95-19.79,17.46-33.12,17.46-21.98,0-39.88-17.66-39.88-39.95S316.8,0,338.88,0c10.74,0,20.69,4.04,28.25,11.54l-10.61,10.43Z" />
        <path d="M412.55,80c-19.02,0-32.55-13.51-32.55-32.64V2h22v14h-6.8v31.36c0,10.26,7.16,17.45,17.35,17.45s17.35-7.2,17.35-17.45v-31.36h-6.9V2h22v45.36c0,19.13-13.43,32.64-32.45,32.64Z" />
        <polygon points="508 78 455 78 455 2 470.11 2 470.11 63 492.89 63 492.89 48 508 48 508 78" />
        <polygon points="576.44 78 553.05 23.59 529.65 78 513 78 545.71 2 560.39 2 593 78 576.44 78" />
      </g>
    </svg>
  );
}

function MoleculaHeroWordmark({ className = "" }: { className?: string }) {
  return (
    <div className={`relative w-full select-none ${className}`}>
      {/* Mobile-only Stacked 2-row Wordmark (MOLE / CULA) */}
      <MoleculaStackedWordmarkSvg
        style={{ mixBlendMode: "multiply" }}
        className="block sm:hidden w-full max-w-[280px] xs:max-w-[320px] mx-auto h-auto text-[#5D00FF] opacity-92 select-none mix-blend-multiply drop-shadow-sm pb-1"
      />

      {/* Desktop / Tablet Horizontal Wordmark */}
      <MoleculaWordmarkSvg
        style={{ mixBlendMode: "multiply" }}
        className="hidden sm:block w-full h-auto text-[#5D00FF] opacity-92 select-none mix-blend-multiply drop-shadow-sm"
      />
      <span className="sr-only">MOLECULA</span>
    </div>
  );
}

function MoleculaFooterWordmark({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const isHero = false;

    // Offscreen 2D canvas to rasterize crisp "MOLECULA" mask at full resolution
    const maskCanvas = document.createElement("canvas");
    const maskCtx = maskCanvas.getContext("2d");

    const gl =
      canvas.getContext("webgl", { alpha: true, antialias: true }) ||
      (canvas.getContext("experimental-webgl", {
        alpha: true,
        antialias: true,
      }) as WebGLRenderingContext | null);

    if (!gl || !maskCtx) return;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
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

    // Fullscreen quad
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Create texture for the text mask
    const textTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const uTime = gl.getUniformLocation(program, "u_time");
    const uRes = gl.getUniformLocation(program, "u_resolution");
    const uIsHero = gl.getUniformLocation(program, "u_isHero");
    const uIsDark = gl.getUniformLocation(program, "u_isDark");
    const uTextMask = gl.getUniformLocation(program, "u_textMask");

    gl.uniform1i(uTextMask, 0);
    gl.uniform1f(uIsHero, isHero ? 1.0 : 0.0);

    let lastWidth = 0;
    let lastHeight = 0;

    const updateTextMask = (pixelW: number, pixelH: number, dpr: number) => {
      maskCanvas.width = pixelW;
      maskCanvas.height = pixelH;

      const cssW = pixelW / dpr;
      const cssH = pixelH / dpr;

      maskCtx.save();
      maskCtx.scale(dpr, dpr);
      maskCtx.clearRect(0, 0, cssW, cssH);

      if (WORDMARK_SVG_PATHS.length > 0) {
        // SVG native viewBox: 593 x 80.
        // Span 100% full screen width
        const targetWidth = cssW * 1.01;
        const scale = targetWidth / 593;
        const targetHeight = 80 * scale;
        const offsetX = (cssW - targetWidth) / 2;

        // Position: pull slightly downward beyond the screen bottom edge
        const offsetY = cssH - targetHeight * 0.84;

        maskCtx.translate(offsetX, offsetY);
        maskCtx.scale(scale, scale);
        maskCtx.fillStyle = "#FFFFFF";

        for (const p of WORDMARK_SVG_PATHS) {
          maskCtx.fill(p);
        }
      } else {
        const fontFamily = `Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        maskCtx.font = `900 100px ${fontFamily}`;
        const refMetrics = maskCtx.measureText("MOLECULA");
        const targetWidth = cssW * 0.98;
        const fontSize = (targetWidth / Math.max(1, refMetrics.width)) * 100;
        maskCtx.font = `900 ${fontSize}px ${fontFamily}`;
        maskCtx.textAlign = "center";
        maskCtx.fillStyle = "#FFFFFF";
        maskCtx.textBaseline = "middle";
        maskCtx.fillText("MOLECULA", cssW / 2, cssH * 0.7);
      }

      maskCtx.restore();

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textTexture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        maskCanvas
      );
    };

    let animationFrameId: number;
    const startTime = performance.now();

    const render = (now: number) => {
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (width > 0 && height > 0) {
        const pixelWidth = Math.round(width * dpr);
        const pixelHeight = Math.round(height * dpr);

        if (pixelWidth !== lastWidth || pixelHeight !== lastHeight) {
          lastWidth = pixelWidth;
          lastHeight = pixelHeight;
          canvas.width = pixelWidth;
          canvas.height = pixelHeight;
          gl.viewport(0, 0, pixelWidth, pixelHeight);
          updateTextMask(pixelWidth, pixelHeight, dpr);
        }

        const elapsed = (now - startTime) * 0.001;
        const isDark =
          typeof document !== "undefined" &&
          document.documentElement.classList.contains("dark");
        gl.uniform1f(uIsDark, isDark ? 1.0 : 0.0);
        gl.uniform1f(uTime, elapsed);
        gl.uniform2f(uRes, pixelWidth, pixelHeight);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    if (document.fonts) {
      document.fonts.ready.then(() => {
        lastWidth = 0; // Force re-rasterize with loaded font
        animationFrameId = requestAnimationFrame(render);
      });
    } else {
      animationFrameId = requestAnimationFrame(render);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      gl.deleteTexture(textTexture);
      gl.deleteBuffer(posBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full select-none overflow-hidden ${
        className || "aspect-[5.3/1]"
      }`}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none"
      />
      <span className="sr-only">MOLECULA</span>
    </div>
  );
}

export function MoleculaWordmark({
  className = "",
  variant = "footer",
}: MoleculaWordmarkProps) {
  if (variant === "hero") {
    return <MoleculaHeroWordmark className={className} />;
  }
  return <MoleculaFooterWordmark className={className} />;
}
