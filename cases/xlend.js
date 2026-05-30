const questHtml = document.documentElement;
const questNav = document.getElementById("nav");
const questThemeBtn = document.getElementById("themeBtn");
const questThemeIcon = document.getElementById("themeIcon");
const questThemeLabel = document.getElementById("themeLabel");
const questPreloader = document.getElementById("questPreloader");
const questCursor = document.getElementById("cursor");
const questCursorLabel = document.getElementById("cursorLabelText");
const questReduceMotion = false;

let questDark = questHtml.getAttribute("data-theme") === "dark";

function setQuestThemeLabel() {
  questThemeIcon.textContent = questDark ? "◐" : "◑";
  questThemeLabel.textContent = questDark ? "Light" : "Dark";
}

function saveQuestTheme(theme) {
  try {
    localStorage.setItem("theme", theme);
  } catch (error) {}
}

setQuestThemeLabel();

questThemeBtn.addEventListener("click", () => {
  questDark = !questDark;
  questHtml.setAttribute("data-theme", questDark ? "dark" : "light");
  saveQuestTheme(questDark ? "dark" : "light");
  setQuestThemeLabel();
});

window.addEventListener("scroll", () => {
  questNav.classList.toggle("scrolled", window.scrollY > 60);
}, { passive: true });

if (window.matchMedia("(pointer: fine)").matches && questCursor) {
  const defaultQuestCursorLabel = questCursorLabel ? questCursorLabel.textContent : "Guest";
  const setQuestCursorLabel = (text) => {
    if (questCursorLabel) questCursorLabel.textContent = text;
  };

  document.addEventListener("mousemove", (event) => {
    questCursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
    questCursor.style.opacity = "1";
  });

  document.addEventListener("mouseleave", () => {
    questCursor.style.opacity = "0";
  });

  document.addEventListener("mouseenter", () => {
    questCursor.style.opacity = "1";
  });

  document.querySelectorAll("a[href]").forEach((item) => {
    item.addEventListener("mouseenter", () => {
      document.body.classList.add("is-hovering");
      setQuestCursorLabel(item.dataset.cursorLabel || "Open");
    });
    item.addEventListener("mouseleave", () => {
      document.body.classList.remove("is-hovering");
      setQuestCursorLabel(defaultQuestCursorLabel);
    });
  });

  document.querySelectorAll(".abot-emoji-gallery").forEach((gallery) => {
    gallery.addEventListener("pointerover", (event) => {
      const card = event.target.closest(".badge-gallery-card");
      if (!card || !gallery.contains(card)) return;
      document.body.classList.add("is-hovering");
      setQuestCursorLabel(card.dataset.cursorLabel || card.querySelector("img")?.alt || defaultQuestCursorLabel);
    });

    gallery.addEventListener("pointerout", (event) => {
      const card = event.target.closest(".badge-gallery-card");
      if (!card || !gallery.contains(card)) return;
      const nextCard = event.relatedTarget && event.relatedTarget.closest
        ? event.relatedTarget.closest(".badge-gallery-card")
        : null;
      if (nextCard && gallery.contains(nextCard)) return;
      document.body.classList.remove("is-hovering");
      setQuestCursorLabel(defaultQuestCursorLabel);
    });
  });
}

function initPrismaticHeroBurstLegacy() {
  const burst = document.querySelector("[data-prismatic-burst]");
  const canvas = burst ? burst.querySelector("canvas") : null;
  if (!burst || !canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const parseHex = (value, fallback) => {
    const raw = String(value || fallback).replace("#", "").trim();
    const normalized = raw.length === 3
      ? raw.split("").map((item) => item + item).join("")
      : raw;
    const int = Number.parseInt(normalized, 16);
    if (!Number.isFinite(int)) return parseHex(fallback, "#ffffff");
    return {
      r: (int >> 16) & 255,
      g: (int >> 8) & 255,
      b: int & 255
    };
  };

  const getSeed = (index, salt = 1) => {
    const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
    return value - Math.floor(value);
  };

  const mixColor = (a, b, amount) => ({
    r: Math.round(a.r + (b.r - a.r) * amount),
    g: Math.round(a.g + (b.g - a.g) * amount),
    b: Math.round(a.b + (b.b - a.b) * amount)
  });

  const rgba = (color, alpha) => `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
  const colors = String(burst.dataset.colors || "#A855F7,#7C3AED,#6366F1")
    .split(",")
    .map((item) => parseHex(item, "#A855F7"));
  const palette = [
    colors[0],
    colors[1] || colors[0],
    colors[2] || colors[0],
    mixColor(colors[0], colors[2] || colors[0], 0.54),
    { r: 255, g: 255, b: 255 }
  ];
  const distort = Math.max(0, Math.min(1, Number(burst.dataset.distort || 0.25)));
  const isInteractive = burst.dataset.interactive !== "false";
  const hoverDampness = isInteractive
    ? Math.max(0.04, Math.min(0.8, Number(burst.dataset.hoverDampness || 0.25)))
    : 0;
  const shouldRotate = burst.dataset.animationType === "rotate";

  const rays = Array.from({ length: 84 }, (_, index) => {
    const unit = getSeed(index, 1);
    const unitTwo = getSeed(index, 2);
    return {
      angle: (index / 84) * Math.PI * 2 + (unit - 0.5) * distort * 0.18,
      width: 0.012 + unitTwo * 0.034,
      length: 0.58 + unit * 0.76,
      alpha: 0.05 + unitTwo * 0.14,
      phase: unit * Math.PI * 2,
      bend: (unit - 0.5) * distort,
      color: palette[index % palette.length]
    };
  });

  let width = 0;
  let height = 0;
  let dpr = 1;
  let rafId = 0;
  const pointer = { x: 0, y: 0 };
  const targetPointer = { x: 0, y: 0 };

  const resize = () => {
    const rect = burst.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const draw = (frameTime) => {
    const time = frameTime * 0.001;
    const maxDim = Math.max(width, height);
    if (isInteractive) {
      pointer.x += (targetPointer.x - pointer.x) * hoverDampness;
      pointer.y += (targetPointer.y - pointer.y) * hoverDampness;
    }

    const cx = width * (0.54 + pointer.x * 0.06);
    const cy = height * (0.43 + pointer.y * 0.08);
    const rotation = shouldRotate && !questReduceMotion ? time * 0.12 : 0;

    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#080214";
    ctx.fillRect(0, 0, width, height);

    const base = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxDim * 0.92);
    base.addColorStop(0, rgba(mixColor(palette[0], palette[1], 0.36), 0.82));
    base.addColorStop(0.22, rgba(palette[0], 0.48));
    base.addColorStop(0.48, rgba(palette[2], 0.2));
    base.addColorStop(1, "rgba(8, 2, 20, 0)");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation - 0.34 + Math.sin(time * 0.18) * distort * 0.08);
    ctx.globalCompositeOperation = "lighter";

    rays.forEach((ray, index) => {
      const wobble = Math.sin(time * 0.7 + ray.phase) * distort * 0.12;
      const angle = ray.angle + wobble + pointer.x * ray.bend * 0.18;
      const half = ray.width * (1 + Math.sin(time * 0.9 + ray.phase) * distort * 0.28);
      const inner = maxDim * 0.025;
      const outer = maxDim * ray.length;
      const gradient = ctx.createRadialGradient(0, 0, inner, 0, 0, outer);
      gradient.addColorStop(0, rgba(ray.color, Math.min(0.48, ray.alpha * 2.2)));
      gradient.addColorStop(0.22, rgba(ray.color, ray.alpha * 1.22));
      gradient.addColorStop(0.68, rgba(ray.color, ray.alpha * 0.42));
      gradient.addColorStop(1, rgba(ray.color, 0));

      ctx.beginPath();
      ctx.moveTo(Math.cos(angle - half) * inner, Math.sin(angle - half) * inner);
      ctx.lineTo(Math.cos(angle - half * 2.4) * outer, Math.sin(angle - half * 2.4) * outer);
      ctx.lineTo(Math.cos(angle + half * 2.4) * outer, Math.sin(angle + half * 2.4) * outer);
      ctx.lineTo(Math.cos(angle + half) * inner, Math.sin(angle + half) * inner);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      if (index % 4 === 0) {
        ctx.strokeStyle = rgba(ray.color, ray.alpha * 1.12);
        ctx.lineWidth = Math.max(1, maxDim * 0.001);
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * maxDim * 0.04, Math.sin(angle) * maxDim * 0.04);
        ctx.lineTo(Math.cos(angle) * outer * 0.96, Math.sin(angle) * outer * 0.96);
        ctx.stroke();
      }
    });

    ctx.restore();

    ctx.globalCompositeOperation = "screen";
    const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxDim * 0.38);
    bloom.addColorStop(0, "rgba(255, 255, 255, 0.52)");
    bloom.addColorStop(0.18, rgba(palette[0], 0.38));
    bloom.addColorStop(0.52, rgba(palette[2], 0.16));
    bloom.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = bloom;
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = "source-over";
    const edge = ctx.createRadialGradient(cx, cy, maxDim * 0.34, cx, cy, maxDim * 0.94);
    edge.addColorStop(0, "rgba(8, 2, 20, 0)");
    edge.addColorStop(0.78, "rgba(8, 2, 20, 0.12)");
    edge.addColorStop(1, "rgba(8, 2, 20, 0.44)");
    ctx.fillStyle = edge;
    ctx.fillRect(0, 0, width, height);

    if (!questReduceMotion) {
      rafId = window.requestAnimationFrame(draw);
    }
  };

  resize();
  draw(0);

  const resizeObserver = new ResizeObserver(() => {
    resize();
    if (questReduceMotion) draw(0);
  });
  resizeObserver.observe(burst);

  const onLegacyPointerMove = (event) => {
    const rect = burst.getBoundingClientRect();
    targetPointer.x = (event.clientX - rect.left) / rect.width - 0.5;
    targetPointer.y = (event.clientY - rect.top) / rect.height - 0.5;
  };

  const onLegacyPointerLeave = () => {
    targetPointer.x = 0;
    targetPointer.y = 0;
  };

  if (isInteractive) {
    burst.addEventListener("pointermove", onLegacyPointerMove, { passive: true });
    burst.addEventListener("pointerleave", onLegacyPointerLeave);
  }

  window.addEventListener("beforeunload", () => {
    if (rafId) window.cancelAnimationFrame(rafId);
    if (isInteractive) {
      burst.removeEventListener("pointermove", onLegacyPointerMove);
      burst.removeEventListener("pointerleave", onLegacyPointerLeave);
    }
    resizeObserver.disconnect();
  }, { once: true });
}

function initPrismaticHeroBurst() {
  const burst = document.querySelector("[data-prismatic-burst]");
  const canvas = burst ? burst.querySelector("canvas") : null;
  if (!burst || !canvas) return;

  const gl = canvas.getContext("webgl2", { alpha: false, antialias: false });
  if (!gl) {
    initPrismaticHeroBurstLegacy();
    return;
  }

  const vertexShaderSource = `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

  const fragmentShaderSource = `#version 300 es
precision highp float;
precision highp int;

out vec4 fragColor;

uniform vec2  uResolution;
uniform float uTime;
uniform float uIntensity;
uniform float uSpeed;
uniform int   uAnimType;
uniform vec2  uMouse;
uniform int   uColorCount;
uniform float uDistort;
uniform vec2  uOffset;
uniform sampler2D uGradient;
uniform float uNoiseAmount;
uniform int   uRayCount;

float hash21(vec2 p){
  p = floor(p);
  float f = 52.9829189 * fract(dot(p, vec2(0.065, 0.005)));
  return fract(f);
}

mat2 rot30(){ return mat2(0.8, -0.5, 0.5, 0.8); }

float layeredNoise(vec2 fragPx){
  vec2 p = mod(fragPx + vec2(uTime * 30.0, -uTime * 21.0), 1024.0);
  vec2 q = rot30() * p;
  float n = 0.0;
  n += 0.40 * hash21(q);
  n += 0.25 * hash21(q * 2.0 + 17.0);
  n += 0.20 * hash21(q * 4.0 + 47.0);
  n += 0.10 * hash21(q * 8.0 + 113.0);
  n += 0.05 * hash21(q * 16.0 + 191.0);
  return n;
}

vec3 rayDir(vec2 frag, vec2 res, vec2 offset, float dist){
  float focal = res.y * max(dist, 1e-3);
  return normalize(vec3(2.0 * (frag - offset) - res, focal));
}

float edgeFade(vec2 frag, vec2 res, vec2 offset){
  vec2 toC = frag - 0.5 * res - offset;
  float r = length(toC) / (0.5 * min(res.x, res.y));
  float x = clamp(r, 0.0, 1.0);
  float q = x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
  float s = q * 0.5;
  s = pow(s, 1.5);
  float tail = 1.0 - pow(1.0 - s, 2.0);
  s = mix(s, tail, 0.2);
  float dn = (layeredNoise(frag * 0.15) - 0.5) * 0.0015 * s;
  return clamp(s + dn, 0.0, 1.0);
}

mat3 rotX(float a){ float c = cos(a), s = sin(a); return mat3(1.0,0.0,0.0, 0.0,c,-s, 0.0,s,c); }
mat3 rotY(float a){ float c = cos(a), s = sin(a); return mat3(c,0.0,s, 0.0,1.0,0.0, -s,0.0,c); }
mat3 rotZ(float a){ float c = cos(a), s = sin(a); return mat3(c,-s,0.0, s,c,0.0, 0.0,0.0,1.0); }

vec3 sampleGradient(float t){
  t = clamp(t, 0.0, 1.0);
  return texture(uGradient, vec2(t, 0.5)).rgb;
}

vec2 rot2(vec2 v, float a){
  float s = sin(a), c = cos(a);
  return mat2(c, -s, s, c) * v;
}

float bendAngle(vec3 q, float t){
  float a = 0.8 * sin(q.x * 0.55 + t * 0.6)
          + 0.7 * sin(q.y * 0.50 - t * 0.5)
          + 0.6 * sin(q.z * 0.60 + t * 0.7);
  return a;
}

void main(){
  vec2 frag = gl_FragCoord.xy;
  float t = uTime * uSpeed;
  float jitterAmp = 0.1 * clamp(uNoiseAmount, 0.0, 1.0);
  vec3 dir = rayDir(frag, uResolution, uOffset, 1.0);
  float marchT = 0.0;
  vec3 col = vec3(0.0);
  float n = layeredNoise(frag);
  vec4 c = cos(t * 0.2 + vec4(0.0, 33.0, 11.0, 0.0));
  mat2 M2 = mat2(c.x, c.y, c.z, c.w);
  float amp = clamp(uDistort, 0.0, 50.0) * 0.15;
  mat3 rot3dMat = mat3(1.0);

  if(uAnimType == 1){
    vec3 ang = vec3(t * 0.31, t * 0.21, t * 0.17);
    rot3dMat = rotZ(ang.z) * rotY(ang.y) * rotX(ang.x);
  }

  mat3 hoverMat = mat3(1.0);
  if(uAnimType == 2){
    vec2 m = uMouse * 2.0 - 1.0;
    vec3 ang = vec3(m.y * 0.6, m.x * 0.6, 0.0);
    hoverMat = rotY(ang.y) * rotX(ang.x);
  }

  for (int i = 0; i < 44; ++i) {
    vec3 P = marchT * dir;
    P.z -= 2.0;
    float rad = length(P);
    vec3 Pl = P * (10.0 / max(rad, 1e-6));

    if(uAnimType == 0){
      Pl.xz *= M2;
    } else if(uAnimType == 1){
      Pl = rot3dMat * Pl;
    } else {
      Pl = hoverMat * Pl;
    }

    float stepLen = min(rad - 0.3, n * jitterAmp) + 0.1;
    float grow = smoothstep(0.35, 3.0, marchT);
    float a1 = amp * grow * bendAngle(Pl * 0.6, t);
    float a2 = 0.5 * amp * grow * bendAngle(Pl.zyx * 0.5 + 3.1, t * 0.9);
    vec3 Pb = Pl;
    Pb.xz = rot2(Pb.xz, a1);
    Pb.xy = rot2(Pb.xy, a2);

    float rayPattern = smoothstep(
      0.5, 0.7,
      sin(Pb.x + cos(Pb.y) * cos(Pb.z)) *
      sin(Pb.z + sin(Pb.y) * cos(Pb.x + t))
    );

    if (uRayCount > 0) {
      float ang = atan(Pb.y, Pb.x);
      float comb = 0.5 + 0.5 * cos(float(uRayCount) * ang);
      comb = pow(comb, 3.0);
      rayPattern *= smoothstep(0.15, 0.95, comb);
    }

    vec3 spectralDefault = 1.0 + vec3(
      cos(marchT * 3.0 + 0.0),
      cos(marchT * 3.0 + 1.0),
      cos(marchT * 3.0 + 2.0)
    );
    float saw = fract(marchT * 0.25);
    float tRay = saw * saw * (3.0 - 2.0 * saw);
    vec3 userGradient = 2.0 * sampleGradient(tRay);
    vec3 spectral = (uColorCount > 0) ? userGradient : spectralDefault;
    vec3 base = (0.05 / (0.4 + stepLen))
              * smoothstep(5.0, 0.0, rad)
              * spectral;

    col += base * rayPattern;
    marchT += stepLen;
  }

  col *= edgeFade(frag, uResolution, uOffset);
  col *= uIntensity;

  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

  const compileShader = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
  if (!vertexShader || !fragmentShader) {
    initPrismaticHeroBurstLegacy();
    return;
  }

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    initPrismaticHeroBurstLegacy();
    return;
  }

  const vertexArray = gl.createVertexArray();
  gl.bindVertexArray(vertexArray);

  const positionLocation = gl.getAttribLocation(program, "position");
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const uvLocation = gl.getAttribLocation(program, "uv");
  const uvBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 2, 0, 0, 2]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(uvLocation);
  gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);

  gl.bindVertexArray(null);

  const uniforms = {
    resolution: gl.getUniformLocation(program, "uResolution"),
    time: gl.getUniformLocation(program, "uTime"),
    intensity: gl.getUniformLocation(program, "uIntensity"),
    speed: gl.getUniformLocation(program, "uSpeed"),
    animType: gl.getUniformLocation(program, "uAnimType"),
    mouse: gl.getUniformLocation(program, "uMouse"),
    colorCount: gl.getUniformLocation(program, "uColorCount"),
    distort: gl.getUniformLocation(program, "uDistort"),
    offset: gl.getUniformLocation(program, "uOffset"),
    gradient: gl.getUniformLocation(program, "uGradient"),
    noiseAmount: gl.getUniformLocation(program, "uNoiseAmount"),
    rayCount: gl.getUniformLocation(program, "uRayCount")
  };

  const hexToRgbBytes = (hex) => {
    let h = String(hex || "").trim().replace("#", "");
    if (h.length === 3) h = h.split("").map((part) => part + part).join("");
    const intVal = Number.parseInt(h, 16);
    if (!Number.isFinite(intVal)) return [255, 255, 255];
    return [(intVal >> 16) & 255, (intVal >> 8) & 255, intVal & 255];
  };

  const colors = String(burst.dataset.colors || "#A855F7,#7C3AED,#6366F1")
    .split(",")
    .map((color) => color.trim())
    .filter(Boolean)
    .slice(0, 64);
  const gradientWidth = Math.max(1, colors.length);
  const gradientData = new Uint8Array(gradientWidth * 4);
  (colors.length ? colors : ["#ffffff"]).forEach((color, index) => {
    const [r, g, b] = hexToRgbBytes(color);
    gradientData[index * 4 + 0] = r;
    gradientData[index * 4 + 1] = g;
    gradientData[index * 4 + 2] = b;
    gradientData[index * 4 + 3] = 255;
  });

  const gradientTexture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, gradientTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gradientWidth, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, gradientData);

  const animationTypeMap = { rotate: 0, rotate3d: 1, hover: 2 };
  const animationType = animationTypeMap[burst.dataset.animationType] ?? 0;
  const isInteractive = burst.dataset.interactive !== "false" && animationType === 2;
  const intensity = Number(burst.dataset.intensity || 2);
  const speed = Number(burst.dataset.speed || 0.5);
  const distort = Number(burst.dataset.distort || 0);
  const hoverDampness = isInteractive
    ? Math.max(0, Math.min(1, Number(burst.dataset.hoverDampness || 0)))
    : 0;
  const rayCount = Math.max(0, Math.floor(Number(burst.dataset.rayCount || 0)));
  const offsetX = Number(burst.dataset.offsetX || 0);
  const offsetY = Number(burst.dataset.offsetY || 0);
  const dprCap = Math.max(0.5, Math.min(2, Number(burst.dataset.dpr || 0.75)));
  const fps = Math.max(12, Math.min(60, Number(burst.dataset.fps || 24)));
  const frameInterval = 1000 / fps;

  const mouseTarget = [0.5, 0.5];
  const mouseSmooth = [0.5, 0.5];
  let isVisible = true;
  let rafId = 0;
  let lastTime = performance.now();
  let lastRenderTime = 0;
  let accumulatedTime = 0;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    const width = Math.max(1, burst.clientWidth || 1);
    const height = Math.max(1, burst.clientHeight || 1);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    gl.viewport(0, 0, canvas.width, canvas.height);
  };

  const render = (now) => {
    const delta = Math.max(0, now - lastTime) * 0.001;
    lastTime = now;
    const visible = isVisible && !document.hidden;

    if (!questReduceMotion) accumulatedTime += delta;

    if (visible && !questReduceMotion && now - lastRenderTime < frameInterval) {
      rafId = window.requestAnimationFrame(render);
      return;
    }

    if (visible) {
      lastRenderTime = now;
      if (isInteractive) {
        const tau = 0.02 + hoverDampness * 0.5;
        const alpha = 1 - Math.exp(-delta / tau);
        mouseSmooth[0] += (mouseTarget[0] - mouseSmooth[0]) * alpha;
        mouseSmooth[1] += (mouseTarget[1] - mouseSmooth[1]) * alpha;
      }

      gl.useProgram(program);
      gl.bindVertexArray(vertexArray);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, gradientTexture);
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform1f(uniforms.time, accumulatedTime);
      gl.uniform1f(uniforms.intensity, intensity);
      gl.uniform1f(uniforms.speed, speed);
      gl.uniform1i(uniforms.animType, animationType);
      gl.uniform2f(uniforms.mouse, mouseSmooth[0], mouseSmooth[1]);
      gl.uniform1i(uniforms.colorCount, colors.length);
      gl.uniform1f(uniforms.distort, distort);
      gl.uniform2f(uniforms.offset, offsetX, offsetY);
      gl.uniform1i(uniforms.gradient, 0);
      gl.uniform1f(uniforms.noiseAmount, 0.8);
      gl.uniform1i(uniforms.rayCount, rayCount);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindVertexArray(null);
    }

    if (!questReduceMotion) rafId = window.requestAnimationFrame(render);
  };

  const onPointerMove = (event) => {
    const rect = burst.getBoundingClientRect();
    mouseTarget[0] = Math.min(Math.max((event.clientX - rect.left) / Math.max(rect.width, 1), 0), 1);
    mouseTarget[1] = Math.min(Math.max((event.clientY - rect.top) / Math.max(rect.height, 1), 0), 1);
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(burst);
  if (isInteractive) {
    burst.addEventListener("pointermove", onPointerMove, { passive: true });
  }

  let intersectionObserver = null;
  if ("IntersectionObserver" in window) {
    intersectionObserver = new IntersectionObserver((entries) => {
      if (entries[0]) isVisible = entries[0].isIntersecting;
    }, { threshold: 0.01 });
    intersectionObserver.observe(burst);
  }

  resize();
  render(lastTime);
  if (!questReduceMotion) rafId = window.requestAnimationFrame(render);

  window.addEventListener("beforeunload", () => {
    if (rafId) window.cancelAnimationFrame(rafId);
    if (isInteractive) burst.removeEventListener("pointermove", onPointerMove);
    resizeObserver.disconnect();
    if (intersectionObserver) intersectionObserver.disconnect();
    gl.deleteTexture(gradientTexture);
    gl.deleteBuffer(positionBuffer);
    gl.deleteBuffer(uvBuffer);
    gl.deleteVertexArray(vertexArray);
    gl.deleteProgram(program);
  }, { once: true });
}

function initBadgeGalleries() {
  document.querySelectorAll(".badge-gallery").forEach((gallery) => {
    const viewport = gallery.querySelector(".badge-gallery-viewport");
    const track = gallery.querySelector(".badge-gallery-track");
    const originals = Array.from(track ? track.children : []);

    if (!viewport || !track || originals.length === 0) return;

    if (questReduceMotion) {
      gallery.classList.add("is-static");
      return;
    }

    const speed = Number(gallery.dataset.scrollSpeed || 3);
    const ease = Number(gallery.dataset.scrollEase || 0.1);
    const autoSpeed = Number(gallery.dataset.autoSpeed || 0);
    const pauseMode = gallery.dataset.hoverPause || "gallery";
    let setWidth = 0;
    let current = 0;
    let target = 0;
    let isDragging = false;
    let isHovering = false;
    let pauseAutoUntil = 0;
    let startX = 0;
    let startTarget = 0;
    let rafId = 0;
    let lastFrameTime = 0;

    originals.forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });

    originals.slice().reverse().forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.insertBefore(clone, track.firstChild);
    });

    const measure = () => {
      const items = Array.from(track.children);
      const firstMiddleItem = items[originals.length];
      const firstTrailingItem = items[originals.length * 2];
      setWidth = firstMiddleItem && firstTrailingItem
        ? firstTrailingItem.offsetLeft - firstMiddleItem.offsetLeft
        : track.scrollWidth / 3;
      if (!Number.isFinite(setWidth) || setWidth <= 0) return;
      current = -setWidth;
      target = -setWidth;
      track.style.transform = `translate3d(${current}px, 0, 0)`;
    };

    const normalize = () => {
      if (!setWidth) return;
      if (current > -setWidth * 0.45) {
        current -= setWidth;
        target -= setWidth;
      } else if (current < -setWidth * 1.55) {
        current += setWidth;
        target += setWidth;
      }
    };

    const updateActiveCard = () => {
      const center = viewport.getBoundingClientRect().left + viewport.offsetWidth / 2;
      let closest = null;
      let closestDistance = Infinity;

      track.querySelectorAll(".badge-gallery-card").forEach((card) => {
        const rect = card.getBoundingClientRect();
        const distance = Math.abs(rect.left + rect.width / 2 - center);
        card.classList.remove("is-active");
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = card;
        }
      });

      if (closest) closest.classList.add("is-active");
    };

    const tick = (time) => {
      if (!lastFrameTime) lastFrameTime = time;
      const delta = Math.min(64, Math.max(0, time - lastFrameTime));
      const frameScale = delta / (1000 / 60);
      const easedStep = 1 - Math.pow(1 - ease, frameScale);
      lastFrameTime = time;

      if (!isDragging && !isHovering && autoSpeed && Date.now() > pauseAutoUntil) {
        target -= autoSpeed * frameScale;
      }
      current += (target - current) * easedStep;
      normalize();
      track.style.transform = `translate3d(${current}px, 0, 0)`;
      updateActiveCard();
      rafId = window.requestAnimationFrame(tick);
    };

    const handleWheel = (event) => {
      event.preventDefault();
      pauseAutoUntil = Date.now() + 900;
      target -= (event.deltaY + event.deltaX) * speed * 0.42;
    };

    gallery.addEventListener("wheel", handleWheel, { passive: false });

    if (pauseMode === "card") {
      gallery.addEventListener("pointerover", (event) => {
        const card = event.target.closest(".badge-gallery-card");
        if (!card || !gallery.contains(card)) return;
        isHovering = true;
      });

      gallery.addEventListener("pointerout", (event) => {
        const card = event.target.closest(".badge-gallery-card");
        if (!card || !gallery.contains(card)) return;
        const nextCard = event.relatedTarget && event.relatedTarget.closest
          ? event.relatedTarget.closest(".badge-gallery-card")
          : null;
        if (nextCard && gallery.contains(nextCard)) return;
        isHovering = false;
        pauseAutoUntil = Date.now() + 120;
      });
    } else {
      gallery.addEventListener("mouseenter", () => {
        isHovering = true;
      });

      gallery.addEventListener("mouseleave", () => {
        isHovering = false;
        pauseAutoUntil = Date.now() + 500;
      });
    }

    gallery.addEventListener("pointerdown", (event) => {
      isDragging = true;
      pauseAutoUntil = Date.now() + 1200;
      startX = event.clientX;
      startTarget = target;
      gallery.classList.add("is-dragging");
      gallery.setPointerCapture(event.pointerId);
    });

    gallery.addEventListener("pointermove", (event) => {
      if (!isDragging) return;
      target = startTarget + (event.clientX - startX) * speed;
    });

    const stopDrag = (event) => {
      if (!isDragging) return;
      isDragging = false;
      pauseAutoUntil = Date.now() + 900;
      gallery.classList.remove("is-dragging");
      if (gallery.hasPointerCapture(event.pointerId)) gallery.releasePointerCapture(event.pointerId);
    };

    gallery.addEventListener("pointerup", stopDrag);
    gallery.addEventListener("pointercancel", stopDrag);
    gallery.addEventListener("pointerleave", stopDrag);

    measure();
    rafId = window.requestAnimationFrame(tick);

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(viewport);

    window.addEventListener("beforeunload", () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    }, { once: true });
  });
}

function initScrollStacks() {
  const stacks = Array.from(document.querySelectorAll(".ui-scroll-stack"));
  if (!stacks.length) return;

  stacks.forEach((stack) => {
    const stage = stack.querySelector(".ui-stack-stage");
    const cards = Array.from(stack.querySelectorAll("[data-stack-card]"));
    const stackPosition = Number(stack.dataset.stackPosition || 35);
    const baseScale = Number(stack.dataset.baseScale || 0.8);
    const stackGap = Number(stack.dataset.stackGap || 48);
    const preferredStep = Number(stack.dataset.stackStep || 0);
    const opacityStart = Number(stack.dataset.stackOpacityStart || 0);
    const opacityEnd = Number(stack.dataset.stackOpacityEnd || 1);

    stack.style.setProperty("--stack-top", `${stackPosition}vh`);
    stack.style.setProperty("--stack-base-scale", baseScale);
    stack.style.setProperty("--stack-gap", `${stackGap}px`);

    if (questReduceMotion || !stage || !cards.length) {
      stack.classList.add("is-static");
      cards.forEach((card) => {
        card.style.setProperty("--stack-scale", 1);
        card.style.setProperty("--stack-y", "0px");
        card.style.setProperty("--stack-opacity", 1);
      });
      return;
    }

    let stackTop = 0;
    let step = 180;

    const measure = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      stackTop = stack.getBoundingClientRect().top + scrollY;
      step = preferredStep > 0 ? preferredStep : Math.max(148, Math.min(stage.offsetHeight * 0.28, 220));
      stack.style.height = `${stage.offsetHeight + ((cards.length - 1) * step) + stackGap * 2}px`;
    };

    const update = () => {
      const pinY = window.innerHeight * (stackPosition / 100);
      const scrollY = window.scrollY || window.pageYOffset;
      const progress = (scrollY - (stackTop - pinY)) / step;
      const active = Math.min(Math.max(progress, 0), cards.length - 1);
      const scaleStep = cards.length > 1 ? (1 - baseScale) / Math.min(cards.length - 1, 4) : 0;

      cards.forEach((card, index) => {
        const depth = Math.min(Math.max(active - index, 0), 4);
        const enterProgress = Math.min(Math.max(active - index + 1, 0), 1);
        const futureOffset = (1 - enterProgress) * Math.min(stage.offsetHeight * 0.34, 220);
        const scale = 1 - (scaleStep * depth);
        const y = futureOffset - (stackGap * Math.min(depth, 3));
        const opacityRange = Math.max(0.001, opacityEnd - opacityStart);
        const opacityProgress = Math.min(Math.max((enterProgress - opacityStart) / opacityRange, 0), 1);
        const easedOpacity = opacityProgress * opacityProgress * (3 - (2 * opacityProgress));
        const opacity = index === 0 ? 1 : easedOpacity;

        card.style.setProperty("--stack-scale", scale.toFixed(4));
        card.style.setProperty("--stack-y", `${y.toFixed(2)}px`);
        card.style.setProperty("--stack-opacity", opacity.toFixed(3));
        card.style.setProperty("--stack-z", index + 1);
      });
    };

    measure();
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", () => {
      measure();
      update();
    });
  });
}

function initFrameSequences(useScrollTrigger = false) {
  const sequences = Array.from(document.querySelectorAll("[data-frame-sequence]"));
  if (!sequences.length) return;

  sequences.forEach((sequence) => {
    if (sequence.dataset.sequenceReady === "true") return;
    sequence.dataset.sequenceReady = "true";

    const canvas = sequence.querySelector("canvas");
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const start = Number(sequence.dataset.sequenceStart || 0);
    const end = Number(sequence.dataset.sequenceEnd || start);
    const pad = Number(sequence.dataset.sequencePad || 3);
    const ext = sequence.dataset.sequenceExt || "png";
    const path = sequence.dataset.sequencePath || "";
    const version = sequence.dataset.sequenceVersion || "";
    const totalFrames = Math.max(1, end - start + 1);
    const images = [];
    let currentFrame = -1;

    const frameUrl = (frame) => {
      const fileName = String(frame).padStart(pad, "0");
      const url = `${path}${fileName}.${ext}`;
      return version ? `${url}${url.includes("?") ? "&" : "?"}v=${encodeURIComponent(version)}` : url;
    };

    const drawFrame = (frameIndex) => {
      const image = images[frameIndex];
      if (!image || !image.complete || !image.naturalWidth) return;

      if (canvas.width !== image.naturalWidth || canvas.height !== image.naturalHeight) {
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      sequence.dataset.currentFrame = String(start + frameIndex).padStart(pad, "0");
      sequence.classList.add("is-loaded");
    };

    const setProgress = (progress) => {
      const clamped = Math.min(Math.max(progress, 0), 1);
      const frameIndex = Math.min(totalFrames - 1, Math.round(clamped * (totalFrames - 1)));
      if (frameIndex === currentFrame) {
        drawFrame(frameIndex);
        return;
      }
      currentFrame = frameIndex;
      drawFrame(frameIndex);
    };

    for (let frame = start; frame <= end; frame += 1) {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        if (frame === start || currentFrame === frame - start) drawFrame(Math.max(currentFrame, 0));
      };
      image.src = frameUrl(frame);
      images.push(image);
    }

    setProgress(questReduceMotion ? 1 : 0);

    if (questReduceMotion) return;

    const scrollArea = sequence.closest(".website-motion-slot") || sequence;

    if (useScrollTrigger && window.ScrollTrigger) {
      const trigger = window.ScrollTrigger.create({
        trigger: scrollArea,
        start: "top 18%",
        end: "bottom 82%",
        scrub: true,
        onUpdate: (self) => setProgress(self.progress),
        onRefresh: (self) => setProgress(self.progress)
      });

      const refreshSequence = () => {
        window.ScrollTrigger.refresh();
        setProgress(trigger.progress || 0);
      };

      window.requestAnimationFrame(refreshSequence);
      window.addEventListener("load", refreshSequence, { once: true });
      window.addEventListener("pageshow", refreshSequence);
      return;
    }

    const updateFromScroll = () => {
      const rect = scrollArea.getBoundingClientRect();
      const startLine = window.innerHeight * 0.18;
      const endLine = window.innerHeight * 0.82;
      const travel = Math.max(1, rect.height - (endLine - startLine));
      const progress = (startLine - rect.top) / travel;
      setProgress(progress);
    };

    updateFromScroll();
    window.addEventListener("scroll", updateFromScroll, { passive: true });
    window.addEventListener("resize", updateFromScroll);
    window.addEventListener("pageshow", updateFromScroll);
  });
}

function revealQuestFallback() {
  document.body.classList.add("quest-ready");
  document.querySelectorAll(".quest-title .line > span").forEach((item) => {
    item.style.transform = "translateY(0)";
  });
  document.querySelectorAll("[data-reveal], .quest-meta-strip, .quest-scroll-hint").forEach((item) => {
    item.style.opacity = "1";
    item.style.transform = "none";
  });
  document.querySelectorAll(".highlight-ui-image").forEach((item) => {
    item.style.opacity = "1";
    item.style.transform = "none";
  });
}

function initQuestAnimations() {
  if (!window.gsap || !window.ScrollTrigger) {
    initFrameSequences(false);
    questPreloader.style.display = "none";
    revealQuestFallback();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  initFrameSequences(true);

  gsap.set("[data-reveal]:not(.ui-scroll-stack-wrap)", { opacity: 0, y: 24 });
  gsap.set(".quest-phone-card, .quest-task, .motion-phone, .quest-metrics article, .quest-lesson-list article", { opacity: 0, y: 24 });
  gsap.set(".highlight-ui-image", { opacity: 1, yPercent: 42 });

  const startHero = () => {
    document.body.classList.add("quest-ready");
    gsap.to(".quest-title .line > span", {
      y: 0,
      duration: 1,
      stagger: 0.1,
      ease: "power3.out",
      delay: 0.05
    });
    gsap.fromTo(".quest-meta-strip",
      { opacity: 0, y: 22 },
      {
      opacity: 1,
      y: 0,
      duration: 0.72,
      ease: "power2.out",
      delay: 0.58
      }
    );
    gsap.fromTo(".quest-scroll-hint",
      { opacity: 0 },
      {
      opacity: 1,
      duration: 0.5,
      delay: 1.1
      }
    );
    initQuestScrollAnimations();
  };

  const hidePreloader = () => {
    gsap.to(".quest-pl-top", { yPercent: -100, duration: 0.55, ease: "power3.inOut" });
    gsap.to(".quest-pl-bottom", {
      yPercent: 100,
      duration: 0.55,
      ease: "power3.inOut",
      onComplete: () => {
        questPreloader.style.display = "none";
        startHero();
      }
    });
  };

  function initQuestScrollAnimations() {
    gsap.utils.toArray("[data-reveal]:not(.ui-scroll-stack-wrap)").forEach((item) => {
      gsap.to(item, {
        opacity: 1,
        y: 0,
        duration: 0.68,
        ease: "power2.out",
        scrollTrigger: { trigger: item, start: "top 90%" }
      });
    });

    gsap.utils.toArray("[data-parallax-visual]").forEach((item) => {
      if (window.matchMedia("(max-width: 900px)").matches) return;

      gsap.fromTo(item,
        { yPercent: 6 },
        {
          yPercent: -6,
          ease: "none",
          scrollTrigger: {
            trigger: item,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        }
      );
    });

    gsap.utils.toArray(".quest-task, .quest-phone-card, .motion-phone, .quest-metrics article, .quest-lesson-list article").forEach((item) => {
      gsap.to(item, {
        opacity: 1,
        y: 0,
        duration: 0.65,
        ease: "power2.out",
        scrollTrigger: { trigger: item, start: "top 92%" }
      });
    });

    gsap.utils.toArray(".highlight-ui-image").forEach((item) => {
      const frame = item.closest(".highlight-ui-half") || item;

      gsap.fromTo(item,
        { yPercent: 42 },
        {
        opacity: 1,
        yPercent: 0,
        ease: "none",
        scrollTrigger: {
          trigger: frame,
          start: "top 70%",
          end: "top 32%",
          scrub: 1.15
        }
        }
      );
    });

    setTimeout(() => ScrollTrigger.refresh(), 400);
    window.addEventListener("load", () => ScrollTrigger.refresh());
  }

  window.addEventListener("load", () => {
    setTimeout(hidePreloader, 80);
  });

  setTimeout(() => {
    if (questPreloader && questPreloader.style.display !== "none") hidePreloader();
  }, 1600);
}

function bootQuestAnimations() {
  if (window.gsap && window.ScrollTrigger) {
    initQuestAnimations();
    return;
  }

  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    if ((window.gsap && window.ScrollTrigger) || attempts >= 12) {
      window.clearInterval(timer);
      initQuestAnimations();
    }
  }, 100);
}

initPrismaticHeroBurst();
initBadgeGalleries();
initScrollStacks();
bootQuestAnimations();
