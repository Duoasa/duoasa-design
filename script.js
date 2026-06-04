const html = document.documentElement;
const nav = document.getElementById("nav");
const themeBtn = document.getElementById("themeBtn");
const themeIcon = document.getElementById("themeIcon");
const themeLabel = document.getElementById("themeLabel");
const preloader = document.getElementById("preloader");
const plBar = document.getElementById("plBar");
const cursor = document.getElementById("cursor");
const cursorLabelText = document.getElementById("cursorLabelText");
const heroEmailBtn = document.querySelector(".email-pill");
const heroGridScanBackground = document.querySelector(".hero-grid-scan-background");
const reduceMotion = false;

let isDark = html.getAttribute("data-theme") === "dark";

function saveTheme(theme) {
  try {
    localStorage.setItem("theme", theme);
  } catch (error) {}
}

function updateThemeLabel() {
  themeIcon.textContent = isDark ? "◐" : "◑";
  themeLabel.textContent = isDark ? "Light" : "Dark";
}

updateThemeLabel();

themeBtn.addEventListener("click", () => {
  isDark = !isDark;
  html.setAttribute("data-theme", isDark ? "dark" : "light");
  saveTheme(isDark ? "dark" : "light");
  updateThemeLabel();
});

window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 60);
}, { passive: true });

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  });
});

document.querySelectorAll(".project-card[data-link]").forEach((card) => {
  card.addEventListener("click", () => {
    const link = card.dataset.link;
    if (link) window.location.href = link;
  });

  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    const link = card.dataset.link;
    if (link) window.location.href = link;
  });
});

if (window.matchMedia("(pointer: fine)").matches && cursor) {
  document.addEventListener("mousemove", (event) => {
    cursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
    cursor.style.opacity = "1";
  });

  document.addEventListener("mouseleave", () => {
    cursor.style.opacity = "0";
  });

  document.addEventListener("mouseenter", () => {
    cursor.style.opacity = "1";
  });

  document.querySelectorAll("a, button, .project-card[data-link]").forEach((item) => {
    item.addEventListener("mouseenter", () => {
      document.body.classList.add("is-hovering");
      if (item.dataset.cursor === "hi") {
        cursorLabelText.style.opacity = "0";
        setTimeout(() => {
          cursorLabelText.textContent = "Say hi!";
          cursorLabelText.style.opacity = "1";
        }, 120);
      } else if (item.dataset.cursor === "hello") {
        document.body.classList.add("is-contact-hover");
        cursorLabelText.style.opacity = "0";
        setTimeout(() => {
          cursorLabelText.textContent = "Hello! 👋";
          cursorLabelText.style.opacity = "1";
        }, 120);
      } else if (item.dataset.cursor === "qr") {
        document.body.classList.add("is-wechat-hover");
        cursorLabelText.style.opacity = "0";
        setTimeout(() => {
          cursorLabelText.textContent = "Wechat Me!";
          cursorLabelText.style.opacity = "1";
        }, 120);
      }
    });

    item.addEventListener("mouseleave", () => {
      document.body.classList.remove("is-hovering");
      document.body.classList.remove("is-contact-hover");
      document.body.classList.remove("is-wechat-hover");
      if (cursorLabelText.textContent !== "Welcom") {
        cursorLabelText.style.opacity = "0";
        setTimeout(() => {
          cursorLabelText.textContent = "Welcom";
          cursorLabelText.style.opacity = "1";
        }, 120);
      }
    });
  });
}

function setCursorLabel(text) {
  if (!cursorLabelText) return;
  cursorLabelText.style.opacity = "0";
  setTimeout(() => {
    cursorLabelText.textContent = text;
    cursorLabelText.style.opacity = "1";
  }, 120);
}

function fallbackCopyText(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  return copied ? Promise.resolve() : Promise.reject(new Error("Copy failed"));
}

function copyText(text) {
  return fallbackCopyText(text).catch(() => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return Promise.reject(new Error("Copy failed"));
  });
}

function initHobbySwitcher() {
  const section = document.getElementById("hobbies");
  if (!section) return;

  const shell = section.querySelector("[data-active-hobby]") || section;
  const choices = Array.from(section.querySelectorAll("[data-hobby-target]"));
  if (!choices.length) return;

  const setActiveHobby = (target) => {
    const previousTarget = shell.dataset.activeHobby;
    shell.dataset.activeHobby = target;

    choices.forEach((choice) => {
      const isActive = choice.dataset.hobbyTarget === target;
      choice.classList.toggle("is-active", isActive);
      choice.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    if (previousTarget !== target) {
      document.dispatchEvent(new CustomEvent("hobbychange", { detail: { target } }));
    }
  };

  choices.forEach((choice) => {
    const target = choice.dataset.hobbyTarget;
    choice.addEventListener("click", () => setActiveHobby(target));
    choice.addEventListener("focus", () => setActiveHobby(target));
    choice.addEventListener("mouseenter", () => setActiveHobby(target));
  });

  const initialChoice = choices.find((choice) => choice.classList.contains("is-active")) || choices[0];
  setActiveHobby(initialChoice.dataset.hobbyTarget);
}

function getMasonryAnimationStart(animateFrom, x, y) {
  if (animateFrom === "top") return { x, y: y - 100, opacity: 0 };
  if (animateFrom === "left") return { x: x - 100, y, opacity: 0 };
  if (animateFrom === "right") return { x: x + 100, y, opacity: 0 };
  if (animateFrom === "center") return { x, y, scale: 0.5, opacity: 0 };
  if (animateFrom === "random") {
    return {
      x: x + (Math.random() * 200 - 100),
      y: y + (Math.random() * 200 - 100),
      opacity: 0
    };
  }
  return { x, y: y + 100, opacity: 0 };
}

const hobbyMasonryItems = {
  gaming: [
    "sc01", "sc02", "sc03", "sc04", "sc05", "sc06", "sc07", "sc08"
  ].map((name, index) => ({
    id: `gaming-${index + 1}`,
    img: `assets/interests/sc4/${name}.jpg`,
    height: [500, 620, 430, 560, 460, 610, 540, 480][index]
  })),
  photography: [
    "ph01", "ph02", "ph03", "ph04", "ph05", "ph06", "ph07", "ph08"
  ].map((name, index) => ({
    id: `photography-${index + 1}`,
    img: `assets/interests/photo/${name}.jpg`,
    height: [560, 440, 640, 500, 600, 460, 540, 620][index]
  }))
};

function initHobbyMasonry() {
  const container = document.querySelector("[data-masonry-gallery]");
  if (!container) return;
  const shell = document.querySelector("[data-active-hobby]");

  const columnCount = 3;
  const gap = 16;
  const duration = 0.6;
  const stagger = 0.05;
  const ease = "power3.out";
  const animateFrom = "bottom";
  const scaleOnHover = true;
  const hoverScale = 0.95;
  const blurToFocus = true;

  let wrappers = [];

  const layout = (animate = true) => {
    const containerWidth = container.clientWidth;
    if (!containerWidth) return;

    const columnHeights = Array(columnCount).fill(0);
    const columnWidth = containerWidth / columnCount;

    wrappers.forEach((wrapper, index) => {
      const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
      const x = shortestColumn * columnWidth;
      const y = columnHeights[shortestColumn];
      const width = Math.max(0, columnWidth - gap);
      const height = Number(wrapper.dataset.masonryHeight) / 2;

      columnHeights[shortestColumn] += height + gap;

      if (typeof gsap === "undefined") {
        wrapper.style.width = `${width}px`;
        wrapper.style.height = `${height}px`;
        wrapper.style.transform = `translate(${x}px, ${y}px)`;
        wrapper.style.opacity = "1";
        return;
      }

      gsap.set(wrapper, { width, height });

      if (!animate || reduceMotion) {
        gsap.set(wrapper, { x, y, opacity: 1 });
        return;
      }

      const hasEntered = wrapper.dataset.masonryEntered === "true";
      if (hasEntered) {
        gsap.to(wrapper, { x, y, width, height, duration, ease, overwrite: "auto" });
      } else {
        gsap.fromTo(
          wrapper,
          getMasonryAnimationStart(animateFrom, x, y),
          {
            x,
            y,
            opacity: 1,
            scale: 1,
            duration,
            ease,
            delay: index * stagger,
            onComplete: () => {
              wrapper.dataset.masonryEntered = "true";
            }
          }
        );
      }
    });

    container.style.height = `${Math.max(...columnHeights) - gap}px`;
  };

  const attachItemAnimations = () => {
    wrappers.forEach((wrapper) => {
      const image = wrapper.querySelector(".masonry-item-img");
      if (!image || typeof gsap === "undefined") return;

      if (blurToFocus && !reduceMotion) {
        gsap.fromTo(image, { filter: "blur(10px)" }, { filter: "blur(0px)", duration, ease });
      }

      if (!scaleOnHover || reduceMotion) return;

      wrapper.addEventListener("mouseenter", () => {
        gsap.to(image, { scale: hoverScale, duration: 0.3, ease, overwrite: "auto" });
      });

      wrapper.addEventListener("mouseleave", () => {
        gsap.to(image, { scale: 1, duration: 0.3, ease, overwrite: "auto" });
      });
    });
  };

  const renderItems = (target) => {
    const items = hobbyMasonryItems[target] || hobbyMasonryItems.gaming;

    if (typeof gsap !== "undefined") {
      gsap.killTweensOf(container.querySelectorAll(".masonry-item-wrapper, .masonry-item-img"));
    }

    container.innerHTML = "";
    items.forEach((item) => {
      const wrapper = document.createElement("div");
      wrapper.className = "masonry-item-wrapper item-wrapper";
      wrapper.dataset.masonryId = item.id;
      wrapper.dataset.masonryHeight = String(item.height);

      const image = document.createElement("div");
      image.className = "masonry-item-img item-img";
      image.style.backgroundImage = `url("${item.img}")`;

      wrapper.appendChild(image);
      container.appendChild(wrapper);
    });

    wrappers = Array.from(container.querySelectorAll(".masonry-item-wrapper"));
    attachItemAnimations();
    layout(true);
  };

  renderItems(shell?.dataset.activeHobby || "gaming");

  document.addEventListener("hobbychange", (event) => {
    renderItems(event.detail?.target || "gaming");
  });

  let resizeFrame = 0;
  const handleResize = () => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(() => layout(true));
  };

  window.addEventListener("resize", handleResize, { passive: true });
}

function initLazyBackgroundVideos() {
  const holders = document.querySelectorAll("[data-lazy-video]");
  if (!holders.length || reduceMotion) return;

  const loadVideo = (holder) => {
    const video = holder.querySelector("video");
    if (!video || video.dataset.loaded) return;

    video.querySelectorAll("source[data-src]").forEach((source) => {
      source.src = source.dataset.src;
      source.removeAttribute("data-src");
    });

    video.dataset.loaded = "true";
    video.addEventListener("loadeddata", () => {
      holder.classList.add("is-video-ready");
      if (!document.hidden && holder.dataset.videoInView === "true") {
        video.play().catch(() => {});
      }
    }, { once: true });
    video.load();
  };

  const playOrPause = (holder, shouldPlay) => {
    const video = holder.querySelector("video");
    if (!video || !video.dataset.loaded) return;
    if (shouldPlay && !document.hidden) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const holder = entry.target;
        holder.dataset.videoInView = entry.isIntersecting ? "true" : "false";
        if (entry.isIntersecting) {
          loadVideo(holder);
          playOrPause(holder, true);
        } else {
          playOrPause(holder, false);
        }
      });
    }, { rootMargin: "360px 0px", threshold: 0.01 });

    holders.forEach((holder) => observer.observe(holder));
  } else {
    holders.forEach((holder) => {
      holder.dataset.videoInView = "true";
      loadVideo(holder);
    });
  }

  document.addEventListener("visibilitychange", () => {
    holders.forEach((holder) => {
      playOrPause(holder, holder.dataset.videoInView === "true");
    });
  });
}

function initHeroGridScanBackground() {
  if (!heroGridScanBackground || reduceMotion) return;

  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false
  });

  if (!gl || !gl.getExtension("OES_standard_derivatives")) return;

  heroGridScanBackground.appendChild(canvas);
  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  const config = {
    sensitivity: 0,
    lineThickness: 0.5,
    linesColor: "#2F293A",
    scanColor: "#1677ff",
    scanOpacity: 0.3,
    gridScale: 0.04,
    lineStyle: "solid",
    lineJitter: 0,
    scanDirection: "pingpong",
    noiseIntensity: 0.01,
    scanGlow: 0.4,
    scanSoftness: 2,
    scanDuration: 2.5,
    scanDelay: 2.5,
    scanOnClick: false
  };

  const bloomIntensity = 0.42;
  const bloomRadius = 1.15;
  const chromaticAberration = 0.002;
  const scanPhaseTaper = 0.9;
  const snapBackDelay = 250;

  const vertexSource = `
    precision highp float;
    attribute vec2 position;
    attribute vec2 uv;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `;

  // React Bits Grid Scan export adapted for this static page mount.
  const fragmentSource = `
    #extension GL_OES_standard_derivatives : enable
    precision highp float;
    uniform vec3 iResolution;
    uniform float iTime;
    uniform vec2 uSkew;
    uniform float uTilt;
    uniform float uYaw;
    uniform float uLineThickness;
    uniform vec3 uLinesColor;
    uniform vec3 uScanColor;
    uniform float uGridScale;
    uniform float uLineStyle;
    uniform float uLineJitter;
    uniform float uScanOpacity;
    uniform float uScanDirection;
    uniform float uNoise;
    uniform float uBloomOpacity;
    uniform float uScanGlow;
    uniform float uScanSoftness;
    uniform float uPhaseTaper;
    uniform float uScanDuration;
    uniform float uScanDelay;
    varying vec2 vUv;

    uniform float uScanStarts[8];
    uniform float uScanCount;

    const int MAX_SCANS = 8;

    float smoother01(float a, float b, float x) {
      float t = clamp((x - a) / max(1e-5, (b - a)), 0.0, 1.0);
      return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
    }

    vec3 linearToSrgb(vec3 value) {
      bvec3 cutoff = lessThanEqual(value, vec3(0.0031308));
      vec3 lower = value * 12.92;
      vec3 higher = 1.055 * pow(max(value, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055;
      return mix(higher, lower, vec3(cutoff));
    }

    void mainImage(out vec4 fragColor, in vec2 fragCoord) {
      vec2 p = (2.0 * fragCoord - iResolution.xy) / iResolution.y;

      vec3 ro = vec3(0.0);
      vec3 rd = normalize(vec3(p, 2.0));

      float cR = cos(uTilt), sR = sin(uTilt);
      rd.xy = mat2(cR, -sR, sR, cR) * rd.xy;

      float cY = cos(uYaw), sY = sin(uYaw);
      rd.xz = mat2(cY, -sY, sY, cY) * rd.xz;

      vec2 skew = clamp(uSkew, vec2(-0.7), vec2(0.7));
      rd.xy += skew * rd.z;

      vec3 color = vec3(0.0);
      float minT = 1e20;
      float gridScale = max(1e-5, uGridScale);
      float fadeStrength = 2.0;
      vec2 gridUV = vec2(0.0);

      float hitIsY = 1.0;
      for (int i = 0; i < 4; i++) {
        float isY = float(i < 2);
        float pos = mix(-0.2, 0.2, float(i)) * isY + mix(-0.5, 0.5, float(i - 2)) * (1.0 - isY);
        float num = pos - (isY * ro.y + (1.0 - isY) * ro.x);
        float den = isY * rd.y + (1.0 - isY) * rd.x;
        float t = num / den;
        vec3 h = ro + rd * t;

        float depthBoost = smoothstep(0.0, 3.0, h.z);
        h.xy += skew * 0.15 * depthBoost;

        bool use = t > 0.0 && t < minT;
        gridUV = use ? mix(h.zy, h.xz, isY) / gridScale : gridUV;
        minT = use ? t : minT;
        hitIsY = use ? isY : hitIsY;
      }

      vec3 hit = ro + rd * minT;
      float dist = length(hit - ro);

      float jitterAmt = clamp(uLineJitter, 0.0, 1.0);
      if (jitterAmt > 0.0) {
        vec2 j = vec2(
          sin(gridUV.y * 2.7 + iTime * 1.8),
          cos(gridUV.x * 2.3 - iTime * 1.6)
        ) * (0.15 * jitterAmt);
        gridUV += j;
      }
      float fx = fract(gridUV.x);
      float fy = fract(gridUV.y);
      float ax = min(fx, 1.0 - fx);
      float ay = min(fy, 1.0 - fy);
      float wx = fwidth(gridUV.x);
      float wy = fwidth(gridUV.y);
      float halfPx = max(0.0, uLineThickness) * 0.5;

      float tx = halfPx * wx;
      float ty = halfPx * wy;

      float aax = wx;
      float aay = wy;

      float lineX = 1.0 - smoothstep(tx, tx + aax, ax);
      float lineY = 1.0 - smoothstep(ty, ty + aay, ay);
      if (uLineStyle > 0.5) {
        float dashRepeat = 4.0;
        float dashDuty = 0.5;
        float vy = fract(gridUV.y * dashRepeat);
        float vx = fract(gridUV.x * dashRepeat);
        float dashMaskY = step(vy, dashDuty);
        float dashMaskX = step(vx, dashDuty);
        if (uLineStyle < 1.5) {
          lineX *= dashMaskY;
          lineY *= dashMaskX;
        } else {
          float dotRepeat = 6.0;
          float dotWidth = 0.18;
          float cy = abs(fract(gridUV.y * dotRepeat) - 0.5);
          float cx = abs(fract(gridUV.x * dotRepeat) - 0.5);
          float dotMaskY = 1.0 - smoothstep(dotWidth, dotWidth + fwidth(gridUV.y * dotRepeat), cy);
          float dotMaskX = 1.0 - smoothstep(dotWidth, dotWidth + fwidth(gridUV.x * dotRepeat), cx);
          lineX *= dotMaskY;
          lineY *= dotMaskX;
        }
      }
      float primaryMask = max(lineX, lineY);

      vec2 gridUV2 = (hitIsY > 0.5 ? hit.xz : hit.zy) / gridScale;
      if (jitterAmt > 0.0) {
        vec2 j2 = vec2(
          cos(gridUV2.y * 2.1 - iTime * 1.4),
          sin(gridUV2.x * 2.5 + iTime * 1.7)
        ) * (0.15 * jitterAmt);
        gridUV2 += j2;
      }
      float fx2 = fract(gridUV2.x);
      float fy2 = fract(gridUV2.y);
      float ax2 = min(fx2, 1.0 - fx2);
      float ay2 = min(fy2, 1.0 - fy2);
      float wx2 = fwidth(gridUV2.x);
      float wy2 = fwidth(gridUV2.y);
      float tx2 = halfPx * wx2;
      float ty2 = halfPx * wy2;
      float aax2 = wx2;
      float aay2 = wy2;
      float lineX2 = 1.0 - smoothstep(tx2, tx2 + aax2, ax2);
      float lineY2 = 1.0 - smoothstep(ty2, ty2 + aay2, ay2);
      if (uLineStyle > 0.5) {
        float dashRepeat2 = 4.0;
        float dashDuty2 = 0.5;
        float vy2m = fract(gridUV2.y * dashRepeat2);
        float vx2m = fract(gridUV2.x * dashRepeat2);
        float dashMaskY2 = step(vy2m, dashDuty2);
        float dashMaskX2 = step(vx2m, dashDuty2);
        if (uLineStyle < 1.5) {
          lineX2 *= dashMaskY2;
          lineY2 *= dashMaskX2;
        } else {
          float dotRepeat2 = 6.0;
          float dotWidth2 = 0.18;
          float cy2 = abs(fract(gridUV2.y * dotRepeat2) - 0.5);
          float cx2 = abs(fract(gridUV2.x * dotRepeat2) - 0.5);
          float dotMaskY2 = 1.0 - smoothstep(dotWidth2, dotWidth2 + fwidth(gridUV2.y * dotRepeat2), cy2);
          float dotMaskX2 = 1.0 - smoothstep(dotWidth2, dotWidth2 + fwidth(gridUV2.x * dotRepeat2), cx2);
          lineX2 *= dotMaskY2;
          lineY2 *= dotMaskX2;
        }
      }
      float altMask = max(lineX2, lineY2);

      float edgeDistX = min(abs(hit.x - (-0.5)), abs(hit.x - 0.5));
      float edgeDistY = min(abs(hit.y - (-0.2)), abs(hit.y - 0.2));
      float edgeDist = mix(edgeDistY, edgeDistX, hitIsY);
      float edgeGate = 1.0 - smoothstep(gridScale * 0.5, gridScale * 2.0, edgeDist);
      altMask *= edgeGate;

      float lineMask = max(primaryMask, altMask);
      float fade = exp(-dist * fadeStrength);

      float dur = max(0.05, uScanDuration);
      float del = max(0.0, uScanDelay);
      float scanZMax = 2.0;
      float widthScale = max(0.1, uScanGlow);
      float sigma = max(0.001, 0.18 * widthScale * uScanSoftness);
      float sigmaA = sigma * 2.0;

      float combinedPulse = 0.0;
      float combinedAura = 0.0;

      float cycle = dur + del;
      float tCycle = mod(iTime, cycle);
      float scanPhase = clamp((tCycle - del) / dur, 0.0, 1.0);
      float phase = scanPhase;
      if (uScanDirection > 0.5 && uScanDirection < 1.5) {
        phase = 1.0 - phase;
      } else if (uScanDirection > 1.5) {
        float t2 = mod(max(0.0, iTime - del), 2.0 * dur);
        phase = (t2 < dur) ? (t2 / dur) : (1.0 - (t2 - dur) / dur);
      }
      float scanZ = phase * scanZMax;
      float dz = abs(hit.z - scanZ);
      float lineBand = exp(-0.5 * (dz * dz) / (sigma * sigma));
      float taper = clamp(uPhaseTaper, 0.0, 0.49);
      float headW = taper;
      float tailW = taper;
      float headFade = smoother01(0.0, headW, phase);
      float tailFade = 1.0 - smoother01(1.0 - tailW, 1.0, phase);
      float phaseWindow = headFade * tailFade;
      float pulseBase = lineBand * phaseWindow;
      combinedPulse += pulseBase * clamp(uScanOpacity, 0.0, 1.0);
      float auraBand = exp(-0.5 * (dz * dz) / (sigmaA * sigmaA));
      combinedAura += (auraBand * 0.25) * phaseWindow * clamp(uScanOpacity, 0.0, 1.0);

      for (int i = 0; i < MAX_SCANS; i++) {
        if (float(i) >= uScanCount) break;
        float tActiveI = iTime - uScanStarts[i];
        float phaseI = clamp(tActiveI / dur, 0.0, 1.0);
        if (uScanDirection > 0.5 && uScanDirection < 1.5) {
          phaseI = 1.0 - phaseI;
        } else if (uScanDirection > 1.5) {
          phaseI = (phaseI < 0.5) ? (phaseI * 2.0) : (1.0 - (phaseI - 0.5) * 2.0);
        }
        float scanZI = phaseI * scanZMax;
        float dzI = abs(hit.z - scanZI);
        float lineBandI = exp(-0.5 * (dzI * dzI) / (sigma * sigma));
        float headFadeI = smoother01(0.0, headW, phaseI);
        float tailFadeI = 1.0 - smoother01(1.0 - tailW, 1.0, phaseI);
        float phaseWindowI = headFadeI * tailFadeI;
        combinedPulse += lineBandI * phaseWindowI * clamp(uScanOpacity, 0.0, 1.0);
        float auraBandI = exp(-0.5 * (dzI * dzI) / (sigmaA * sigmaA));
        combinedAura += (auraBandI * 0.25) * phaseWindowI * clamp(uScanOpacity, 0.0, 1.0);
      }

      float lineVis = lineMask;
      vec3 gridCol = uLinesColor * lineVis * fade;
      vec3 scanCol = uScanColor * combinedPulse;
      vec3 scanAura = uScanColor * combinedAura;

      color = gridCol + scanCol + scanAura;

      float n = fract(sin(dot(gl_FragCoord.xy + vec2(iTime * 123.4), vec2(12.9898,78.233))) * 43758.5453123);
      color += (n - 0.5) * uNoise;
      color = clamp(color, 0.0, 1.0);
      float alpha = clamp(max(lineVis, combinedPulse), 0.0, 1.0);
      float gx = 1.0 - smoothstep(tx * 2.0, tx * 2.0 + aax * 2.0, ax);
      float gy = 1.0 - smoothstep(ty * 2.0, ty * 2.0 + aay * 2.0, ay);
      float halo = max(gx, gy) * fade;
      alpha = max(alpha, combinedAura * 2.0);
      alpha = max(alpha, halo * clamp(uBloomOpacity, 0.0, 1.0));
      fragColor = vec4(linearToSrgb(color), alpha);
    }

    void main() {
      vec4 c;
      mainImage(c, vUv * iResolution.xy);
      gl_FragColor = c;
    }
  `;

  const postFragmentSource = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uScene;
    uniform vec2 uResolution;
    uniform float uBloomIntensity;
    uniform float uBloomRadius;
    uniform float uChromaticAberration;

    vec4 sampleScene(vec2 uv) {
      return texture2D(uScene, clamp(uv, vec2(0.0), vec2(1.0)));
    }

    void main() {
      vec4 base = sampleScene(vUv);
      vec2 radial = (vUv - 0.5) * uChromaticAberration;
      vec3 chroma = vec3(
        sampleScene(vUv + radial).r,
        base.g,
        sampleScene(vUv - radial).b
      );

      vec2 px = uBloomRadius / uResolution;
      vec3 bloom = vec3(0.0);
      float bloomAlpha = 0.0;

      vec4 s01 = sampleScene(vUv + vec2(px.x * 2.0, 0.0));
      vec4 s02 = sampleScene(vUv - vec2(px.x * 2.0, 0.0));
      vec4 s03 = sampleScene(vUv + vec2(0.0, px.y * 2.0));
      vec4 s04 = sampleScene(vUv - vec2(0.0, px.y * 2.0));
      vec4 s05 = sampleScene(vUv + vec2(px.x * 4.0, px.y * 4.0));
      vec4 s06 = sampleScene(vUv - vec2(px.x * 4.0, px.y * 4.0));
      vec4 s07 = sampleScene(vUv + vec2(px.x * 6.0, -px.y * 6.0));
      vec4 s08 = sampleScene(vUv + vec2(-px.x * 6.0, px.y * 6.0));
      vec4 s09 = sampleScene(vUv + vec2(px.x * 10.0, 0.0));
      vec4 s10 = sampleScene(vUv - vec2(px.x * 10.0, 0.0));
      vec4 s11 = sampleScene(vUv + vec2(0.0, px.y * 10.0));
      vec4 s12 = sampleScene(vUv - vec2(0.0, px.y * 10.0));

      bloom += s01.rgb * s01.a + s02.rgb * s02.a + s03.rgb * s03.a + s04.rgb * s04.a;
      bloom += s05.rgb * s05.a + s06.rgb * s06.a + s07.rgb * s07.a + s08.rgb * s08.a;
      bloom += s09.rgb * s09.a + s10.rgb * s10.a + s11.rgb * s11.a + s12.rgb * s12.a;
      bloomAlpha += s01.a + s02.a + s03.a + s04.a + s05.a + s06.a;
      bloomAlpha += s07.a + s08.a + s09.a + s10.a + s11.a + s12.a;

      bloom /= 12.0;
      bloomAlpha /= 12.0;

      float glowAlpha = smoothstep(0.015, 0.34, bloomAlpha) * uBloomIntensity;
      vec3 color = chroma + bloom * (1.0 + uBloomIntensity) * uBloomIntensity;
      float alpha = clamp(max(base.a, glowAlpha), 0.0, 1.0);
      gl_FragColor = vec4(clamp(color, 0.0, 1.0), alpha);
    }
  `;

  function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function createProgram(vertex, fragment) {
    const vertexShader = createShader(gl.VERTEX_SHADER, vertex);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragment);
    if (!vertexShader || !fragmentShader) return null;

    const nextProgram = gl.createProgram();
    gl.attachShader(nextProgram, vertexShader);
    gl.attachShader(nextProgram, fragmentShader);
    gl.linkProgram(nextProgram);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    if (!gl.getProgramParameter(nextProgram, gl.LINK_STATUS)) return null;
    return nextProgram;
  }

  const program = createProgram(vertexSource, fragmentSource);
  const postProgram = createProgram(vertexSource, postFragmentSource);
  if (!program || !postProgram) return;
  gl.useProgram(program);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
     1, -1,
     1,  1,
    -1,  1
  ]), gl.STATIC_DRAW);

  const uvBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0, 0,
    1, 0,
    0, 1,
    1, 0,
    1, 1,
    0, 1
  ]), gl.STATIC_DRAW);

  function bindGeometry(activeProgram) {
    const positionLocation = gl.getAttribLocation(activeProgram, "position");
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uvLocation = gl.getAttribLocation(activeProgram, "uv");
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.enableVertexAttribArray(uvLocation);
    gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);
  }

  const uniforms = {
    iTime: gl.getUniformLocation(program, "iTime"),
    iResolution: gl.getUniformLocation(program, "iResolution"),
    uSkew: gl.getUniformLocation(program, "uSkew"),
    uTilt: gl.getUniformLocation(program, "uTilt"),
    uYaw: gl.getUniformLocation(program, "uYaw"),
    uLineThickness: gl.getUniformLocation(program, "uLineThickness"),
    uLinesColor: gl.getUniformLocation(program, "uLinesColor"),
    uScanColor: gl.getUniformLocation(program, "uScanColor"),
    uGridScale: gl.getUniformLocation(program, "uGridScale"),
    uLineStyle: gl.getUniformLocation(program, "uLineStyle"),
    uLineJitter: gl.getUniformLocation(program, "uLineJitter"),
    uScanOpacity: gl.getUniformLocation(program, "uScanOpacity"),
    uScanDirection: gl.getUniformLocation(program, "uScanDirection"),
    uNoise: gl.getUniformLocation(program, "uNoise"),
    uBloomOpacity: gl.getUniformLocation(program, "uBloomOpacity"),
    uScanGlow: gl.getUniformLocation(program, "uScanGlow"),
    uScanSoftness: gl.getUniformLocation(program, "uScanSoftness"),
    uPhaseTaper: gl.getUniformLocation(program, "uPhaseTaper"),
    uScanDuration: gl.getUniformLocation(program, "uScanDuration"),
    uScanDelay: gl.getUniformLocation(program, "uScanDelay"),
    uScanCount: gl.getUniformLocation(program, "uScanCount")
  };

  const postUniforms = {
    uScene: gl.getUniformLocation(postProgram, "uScene"),
    uResolution: gl.getUniformLocation(postProgram, "uResolution"),
    uBloomIntensity: gl.getUniformLocation(postProgram, "uBloomIntensity"),
    uBloomRadius: gl.getUniformLocation(postProgram, "uBloomRadius"),
    uChromaticAberration: gl.getUniformLocation(postProgram, "uChromaticAberration")
  };

  const sceneTexture = gl.createTexture();
  const sceneFramebuffer = gl.createFramebuffer();

  function resizeRenderTarget(width, height) {
    gl.bindTexture(gl.TEXTURE_2D, sceneTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, sceneFramebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sceneTexture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  function resize() {
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const width = Math.max(1, Math.floor(heroGridScanBackground.clientWidth * dpr));
    const height = Math.max(1, Math.floor(heroGridScanBackground.clientHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      resizeRenderTarget(width, height);
    }
    gl.useProgram(program);
    gl.uniform3f(uniforms.iResolution, width, height, dpr);
    gl.useProgram(postProgram);
    gl.uniform2f(postUniforms.uResolution, width, height);
  }

  const resizeObserver = "ResizeObserver" in window ? new ResizeObserver(resize) : null;
  if (resizeObserver) {
    resizeObserver.observe(heroGridScanBackground);
  } else {
    window.addEventListener("resize", resize, { passive: true });
  }
  resize();

  const s = clamp(config.sensitivity, 0, 1);
  const skewScale = 0.026;
  const tiltScale = 0;
  const yawScale = 0;
  const smoothTime = lerp(0.45, 0.12, s);
  const yBoost = 1;
  const maxSpeed = Infinity;

  const lookTarget = { x: 0, y: 0 };
  const lookCurrent = { x: 0, y: 0 };
  const lookVelocity = { x: 0, y: 0 };
  const tiltVelocity = { value: 0 };
  const yawVelocity = { value: 0 };
  let tiltCurrent = 0;
  let yawCurrent = 0;
  let raf = 0;
  let lastTime = 0;
  let isVisible = true;
  let leaveTimer = 0;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function lerp(from, to, amount) {
    return from + (to - from) * amount;
  }

  function hexToLinearRgb(hex) {
    const normalized = hex.replace("#", "");
    const number = parseInt(normalized.length === 3
      ? normalized.split("").map((char) => char + char).join("")
      : normalized, 16);
    const rgb = [
      (number >> 16) & 255,
      (number >> 8) & 255,
      number & 255
    ].map((channel) => {
      const srgb = channel / 255;
      return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
    });
    return rgb;
  }

  function smoothDampFloat(current, target, velocityRef, time, speed, delta) {
    const safeTime = Math.max(0.0001, time);
    const omega = 2 / safeTime;
    const x = omega * delta;
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    let change = current - target;
    const originalTarget = target;
    const maxChange = Number.isFinite(speed) ? speed * safeTime : Infinity;

    change = Math.sign(change) * Math.min(Math.abs(change), maxChange);
    target = current - change;
    const temp = (velocityRef.value + omega * change) * delta;
    velocityRef.value = (velocityRef.value - omega * temp) * exp;

    let output = target + (change + temp) * exp;
    if ((originalTarget - current) * (output - originalTarget) > 0) {
      output = originalTarget;
      velocityRef.value = 0;
    }

    return output;
  }

  function smoothDampVec2(current, target, velocity, time, speed, delta) {
    const safeTime = Math.max(0.0001, time);
    const omega = 2 / safeTime;
    const x = omega * delta;
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    let changeX = current.x - target.x;
    let changeY = current.y - target.y;
    const originalX = target.x;
    const originalY = target.y;
    const maxChange = Number.isFinite(speed) ? speed * safeTime : Infinity;
    const changeLength = Math.hypot(changeX, changeY);

    if (changeLength > maxChange) {
      const scale = maxChange / changeLength;
      changeX *= scale;
      changeY *= scale;
    }

    const targetX = current.x - changeX;
    const targetY = current.y - changeY;
    const tempX = (velocity.x + omega * changeX) * delta;
    const tempY = (velocity.y + omega * changeY) * delta;
    velocity.x = (velocity.x - omega * tempX) * exp;
    velocity.y = (velocity.y - omega * tempY) * exp;

    let outputX = targetX + (changeX + tempX) * exp;
    let outputY = targetY + (changeY + tempY) * exp;
    const originalDeltaX = originalX - current.x;
    const originalDeltaY = originalY - current.y;
    const outputDeltaX = outputX - originalX;
    const outputDeltaY = outputY - originalY;

    if (originalDeltaX * outputDeltaX + originalDeltaY * outputDeltaY > 0) {
      outputX = originalX;
      outputY = originalY;
      velocity.x = 0;
      velocity.y = 0;
    }

    current.x = outputX;
    current.y = outputY;
  }

  function recenterLook() {
    lookTarget.x = 0;
    lookTarget.y = 0;
  }

  function updatePointer(event) {
    const rect = heroGridScanBackground.getBoundingClientRect();
    const inside = event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (!inside) {
      if (!leaveTimer) {
        leaveTimer = window.setTimeout(() => {
          recenterLook();
          leaveTimer = 0;
        }, snapBackDelay);
      }
      return;
    }

    if (leaveTimer) {
      clearTimeout(leaveTimer);
      leaveTimer = 0;
    }

    lookTarget.x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
    lookTarget.y = -(((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1);
  }

  window.addEventListener("pointermove", updatePointer, { passive: true });
  window.addEventListener("mouseleave", recenterLook);
  window.addEventListener("blur", recenterLook);

  const linesColor = hexToLinearRgb(config.linesColor);
  const scanColor = hexToLinearRgb(config.scanColor);
  const lineStyle = config.lineStyle === "dashed" ? 1 : config.lineStyle === "dotted" ? 2 : 0;
  const scanDirection = config.scanDirection === "backward" ? 1 : config.scanDirection === "pingpong" ? 2 : 0;
  const scanStartsLocation = gl.getUniformLocation(program, "uScanStarts[0]") || gl.getUniformLocation(program, "uScanStarts");

  gl.useProgram(program);
  gl.uniform1f(uniforms.uLineThickness, config.lineThickness);
  gl.uniform3f(uniforms.uLinesColor, linesColor[0], linesColor[1], linesColor[2]);
  gl.uniform3f(uniforms.uScanColor, scanColor[0], scanColor[1], scanColor[2]);
  gl.uniform1f(uniforms.uGridScale, config.gridScale);
  gl.uniform1f(uniforms.uLineStyle, lineStyle);
  gl.uniform1f(uniforms.uLineJitter, clamp(config.lineJitter, 0, 1));
  gl.uniform1f(uniforms.uScanOpacity, clamp(config.scanOpacity, 0, 1));
  gl.uniform1f(uniforms.uScanDirection, scanDirection);
  gl.uniform1f(uniforms.uNoise, Math.max(0, config.noiseIntensity));
  gl.uniform1f(uniforms.uBloomOpacity, bloomIntensity);
  gl.uniform1f(uniforms.uScanGlow, config.scanGlow);
  gl.uniform1f(uniforms.uScanSoftness, config.scanSoftness);
  gl.uniform1f(uniforms.uPhaseTaper, scanPhaseTaper);
  gl.uniform1f(uniforms.uScanDuration, Math.max(0.05, config.scanDuration));
  gl.uniform1f(uniforms.uScanDelay, Math.max(0, config.scanDelay));
  gl.uniform1fv(scanStartsLocation, new Float32Array(8));
  gl.uniform1f(uniforms.uScanCount, 0);

  gl.useProgram(postProgram);
  gl.uniform1i(postUniforms.uScene, 0);
  gl.uniform1f(postUniforms.uBloomIntensity, bloomIntensity);
  gl.uniform1f(postUniforms.uBloomRadius, bloomRadius);
  gl.uniform1f(postUniforms.uChromaticAberration, chromaticAberration);

  function render(timeNow) {
    raf = 0;
    if (!isVisible) return;

    const time = timeNow * 0.001;
    const dt = lastTime ? Math.max(0, time - lastTime) : 0;
    lastTime = time;
    smoothDampVec2(lookCurrent, lookTarget, lookVelocity, smoothTime, maxSpeed, dt);
    tiltCurrent = smoothDampFloat(tiltCurrent, 0, tiltVelocity, smoothTime, maxSpeed, dt);
    yawCurrent = smoothDampFloat(yawCurrent, 0, yawVelocity, smoothTime, maxSpeed, dt);

    gl.bindFramebuffer(gl.FRAMEBUFFER, sceneFramebuffer);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.disable(gl.BLEND);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    bindGeometry(program);
    gl.uniform1f(uniforms.iTime, time);
    gl.uniform2f(uniforms.uSkew, lookCurrent.x * skewScale, -lookCurrent.y * yBoost * skewScale);
    gl.uniform1f(uniforms.uTilt, tiltCurrent * tiltScale);
    gl.uniform1f(uniforms.uYaw, clamp(yawCurrent * yawScale, -0.6, 0.6));
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.BLEND);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(postProgram);
    bindGeometry(postProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sceneTexture);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    start();
  }

  function start() {
    if (!raf) raf = requestAnimationFrame(render);
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      isVisible = entries.some((entry) => entry.isIntersecting);
      if (isVisible && document.visibilityState !== "hidden") start();
      if (!isVisible) stop();
    });
    observer.observe(heroGridScanBackground);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      stop();
    } else if (isVisible) {
      start();
    }
  });

  start();
}

function revealFallback() {
  document.querySelectorAll(".line > span, .hero-eyebrow span, .pl-name span").forEach((item) => {
    item.style.transform = "translateY(0)";
  });
  document.querySelectorAll(".nav-logo, .nav-right, .hero-desc, .pill, .scroll-hint, .project-card, .about-copy p, .about-side > div, .contact-footer").forEach((item) => {
    item.style.opacity = "1";
    item.style.transform = "none";
  });
}

function initAnimations() {
  if (!document.querySelector(".hero") || !window.gsap || !window.ScrollTrigger) {
    preloader.style.display = "none";
    revealFallback();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  function heroIn() {
    gsap.set(".nav-logo, .nav-right", { opacity: 0 });
    gsap.set(".hero-desc", { opacity: 0, y: 16 });
    gsap.set(".pill", { opacity: 0, x: 32 });
    gsap.set(".project-card", { opacity: 0, y: 40 });

    gsap.to(".nav-logo, .nav-right", {
      opacity: 1,
      duration: 0.7,
      stagger: 0.12,
      ease: "power2.out"
    });

    gsap.to(".hero-title .line > span", {
      y: 0,
      duration: 1.05,
      stagger: 0.1,
      ease: "power3.out",
      delay: 0.05
    });

    gsap.to(".hero-eyebrow span", {
      y: 0,
      duration: 0.75,
      ease: "power3.out",
      delay: 0.5
    });

    gsap.to(".hero-desc", {
      opacity: 1,
      y: 0,
      duration: 0.75,
      ease: "power2.out",
      delay: 0.65
    });

    gsap.to(".pill", {
      opacity: 1,
      x: 0,
      duration: 0.55,
      stagger: 0.1,
      ease: "power2.out",
      delay: 0.75
    });

    gsap.to(".scroll-hint", {
      opacity: 1,
      duration: 0.6,
      delay: 1.2
    });

    initScrollAnimations();
  }

  function initScrollAnimations() {
    gsap.utils.toArray(".section-title").forEach((title) => {
      gsap.to(title.querySelectorAll(".line > span"), {
        y: 0,
        duration: 1.05,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: title, start: "top 88%" }
      });
    });

    gsap.utils.toArray(".project-card").forEach((card, index) => {
      gsap.to(card, {
        opacity: 1,
        y: 0,
        duration: 0.75,
        delay: index * 0.08,
        ease: "power2.out",
        scrollTrigger: { trigger: card, start: "top 88%" }
      });
    });

    gsap.utils.toArray(".about-copy p").forEach((paragraph, index) => {
      gsap.fromTo(paragraph,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          delay: index * 0.08,
          ease: "power2.out",
          scrollTrigger: { trigger: paragraph, start: "top 90%" }
        }
      );
    });

    gsap.utils.toArray(".about-side > div").forEach((block, index) => {
      gsap.fromTo(block,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          delay: index * 0.1,
          ease: "power2.out",
          scrollTrigger: { trigger: block, start: "top 88%" }
        }
      );
    });

    gsap.utils.toArray(".contact-headline .line > span").forEach((line, index) => {
      gsap.fromTo(line,
        { y: "112%" },
        {
          y: "0%",
          duration: 0.9,
          delay: index * 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: ".contact-headline", start: "top 90%" }
        }
      );
    });

    gsap.fromTo(".contact-footer",
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: { trigger: ".contact-footer", start: "top 90%" }
      }
    );

    setTimeout(() => ScrollTrigger.refresh(), 400);
    window.addEventListener("load", () => ScrollTrigger.refresh());
  }

  if (sessionStorage.getItem("portfolio_visited")) {
    preloader.style.display = "none";
    heroIn();
  } else {
    sessionStorage.setItem("portfolio_visited", "1");
    gsap.to(".pl-name span", { y: 0, duration: 0.7, ease: "power3.out", delay: 0.1 });
    setTimeout(() => { plBar.style.width = "100%"; }, 150);
    setTimeout(() => {
      gsap.to(preloader, {
        yPercent: -100,
        duration: 0.9,
        ease: "power3.inOut",
        onComplete: () => {
          preloader.style.display = "none";
          heroIn();
        }
      });
    }, 1300);
  }
}

if (heroEmailBtn) {
  const heroEmails = (heroEmailBtn.dataset.emails || heroEmailBtn.dataset.copyEmail || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
  let heroEmailIndex = 0;

  function setHeroEmail(index) {
    if (!heroEmails.length) return;
    heroEmailIndex = index % heroEmails.length;
    heroEmailBtn.dataset.copyEmail = heroEmails[heroEmailIndex];
    heroEmailBtn.classList.toggle("is-email-alt", heroEmailIndex === 1);
  }

  setHeroEmail(0);

  if (heroEmails.length > 1) {
    setInterval(() => {
      setHeroEmail(heroEmailIndex + 1);
    }, 5000);
  }

  heroEmailBtn.addEventListener("click", () => {
    const email = heroEmailBtn.dataset.copyEmail;
    heroEmailBtn.classList.add("copied");
    setCursorLabel("copied");
    copyText(email).catch(() => {});
  });

  heroEmailBtn.addEventListener("mouseleave", () => {
    heroEmailBtn.classList.remove("copied");
    setCursorLabel("Welcom");
  });
}

initHeroGridScanBackground();
initLazyBackgroundVideos();
initHobbySwitcher();
initHobbyMasonry();
initAnimations();
