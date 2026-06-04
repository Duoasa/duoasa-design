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
const heroOrbBackground = document.querySelector(".hero-orb-background");
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

function initHeroOrbBackground() {
  if (!heroOrbBackground || reduceMotion) return;

  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false
  });

  if (!gl) return;

  heroOrbBackground.appendChild(canvas);
  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);
  gl.disable(gl.BLEND);
  gl.clearColor(0, 0, 0, 0);

  const config = {
    hue: 0,
    hoverIntensity: 0.55,
    rotationSpeed: 0.3
  };

  const vertexSource = `
    precision highp float;
    attribute vec2 position;
    attribute vec2 uv;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  // Adapted from the React Bits Orb shader for this static page.
  const fragmentSource = `
    precision highp float;

    uniform float iTime;
    uniform vec3 iResolution;
    uniform float hue;
    uniform float hover;
    uniform float rot;
    uniform float hoverIntensity;
    uniform vec3 backgroundColor;
    varying vec2 vUv;

    vec3 rgb2yiq(vec3 c) {
      float y = dot(c, vec3(0.299, 0.587, 0.114));
      float i = dot(c, vec3(0.596, -0.274, -0.322));
      float q = dot(c, vec3(0.211, -0.523, 0.312));
      return vec3(y, i, q);
    }

    vec3 yiq2rgb(vec3 c) {
      float r = c.x + 0.956 * c.y + 0.621 * c.z;
      float g = c.x - 0.272 * c.y - 0.647 * c.z;
      float b = c.x - 1.106 * c.y + 1.703 * c.z;
      return vec3(r, g, b);
    }

    vec3 adjustHue(vec3 color, float hueDeg) {
      float hueRad = hueDeg * 3.14159265 / 180.0;
      vec3 yiq = rgb2yiq(color);
      float cosA = cos(hueRad);
      float sinA = sin(hueRad);
      float i = yiq.y * cosA - yiq.z * sinA;
      float q = yiq.y * sinA + yiq.z * cosA;
      yiq.y = i;
      yiq.z = q;
      return yiq2rgb(yiq);
    }

    vec3 hash33(vec3 p3) {
      p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));
      p3 += dot(p3, p3.yxz + 19.19);
      return -1.0 + 2.0 * fract(vec3(
        p3.x + p3.y,
        p3.x + p3.z,
        p3.y + p3.z
      ) * p3.zyx);
    }

    float snoise3(vec3 p) {
      const float K1 = 0.333333333;
      const float K2 = 0.166666667;
      vec3 i = floor(p + (p.x + p.y + p.z) * K1);
      vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
      vec3 e = step(vec3(0.0), d0 - d0.yzx);
      vec3 i1 = e * (1.0 - e.zxy);
      vec3 i2 = 1.0 - e.zxy * (1.0 - e);
      vec3 d1 = d0 - (i1 - K2);
      vec3 d2 = d0 - (i2 - K1);
      vec3 d3 = d0 - 0.5;
      vec4 h = max(0.6 - vec4(
        dot(d0, d0),
        dot(d1, d1),
        dot(d2, d2),
        dot(d3, d3)
      ), 0.0);
      vec4 n = h * h * h * h * vec4(
        dot(d0, hash33(i)),
        dot(d1, hash33(i + i1)),
        dot(d2, hash33(i + i2)),
        dot(d3, hash33(i + 1.0))
      );
      return dot(vec4(31.316), n);
    }

    vec4 extractAlpha(vec3 colorIn) {
      float a = max(max(colorIn.r, colorIn.g), colorIn.b);
      return vec4(colorIn.rgb / (a + 1e-5), a);
    }

    const vec3 baseColor1 = vec3(0.086275, 0.466667, 1.000000);
    const vec3 baseColor2 = vec3(0.392157, 0.780392, 1.000000);
    const vec3 baseColor3 = vec3(0.015686, 0.094118, 0.360784);
    const float innerRadius = 0.6;
    const float noiseScale = 0.65;

    float light1(float intensity, float attenuation, float dist) {
      return intensity / (1.0 + dist * attenuation);
    }

    float light2(float intensity, float attenuation, float dist) {
      return intensity / (1.0 + dist * dist * attenuation);
    }

    vec4 draw(vec2 uv) {
      vec3 color1 = adjustHue(baseColor1, hue);
      vec3 color2 = adjustHue(baseColor2, hue);
      vec3 color3 = adjustHue(baseColor3, hue);

      float ang = atan(uv.y, uv.x);
      float len = length(uv);
      float invLen = len > 0.0 ? 1.0 / len : 0.0;
      float bgLuminance = dot(backgroundColor, vec3(0.299, 0.587, 0.114));

      float n0 = snoise3(vec3(uv * noiseScale, iTime * 0.5)) * 0.5 + 0.5;
      float r0 = mix(mix(innerRadius, 1.0, 0.4), mix(innerRadius, 1.0, 0.6), n0);
      float d0 = distance(uv, (r0 * invLen) * uv);
      float v0 = light1(1.0, 10.0, d0);

      v0 *= smoothstep(r0 * 1.05, r0, len);
      float innerFade = smoothstep(r0 * 0.8, r0 * 0.95, len);
      v0 *= mix(innerFade, 1.0, bgLuminance * 0.7);
      float cl = cos(ang + iTime * 2.0) * 0.5 + 0.5;

      float a = iTime * -1.0;
      vec2 pos = vec2(cos(a), sin(a)) * r0;
      float d = distance(uv, pos);
      float v1 = light2(1.5, 5.0, d);
      v1 *= light1(1.0, 50.0, d0);

      float v2 = smoothstep(1.0, mix(innerRadius, 1.0, n0 * 0.5), len);
      float v3 = smoothstep(innerRadius, mix(innerRadius, 1.0, 0.5), len);

      vec3 colBase = mix(color1, color2, cl);
      float fadeAmount = mix(1.0, 0.1, bgLuminance);

      vec3 darkCol = mix(color3, colBase, v0);
      darkCol = (darkCol + v1) * v2 * v3;
      darkCol = clamp(darkCol, 0.0, 1.0);

      vec3 lightCol = (colBase + v1) * mix(1.0, v2 * v3, fadeAmount);
      lightCol = mix(backgroundColor, lightCol, v0);
      lightCol = clamp(lightCol, 0.0, 1.0);

      vec3 finalCol = mix(darkCol, lightCol, bgLuminance);
      return extractAlpha(finalCol);
    }

    vec4 mainImage(vec2 fragCoord) {
      vec2 center = iResolution.xy * 0.5;
      float size = min(iResolution.x, iResolution.y);
      vec2 uv = (fragCoord - center) / size * 2.0;

      float angle = rot;
      float s = sin(angle);
      float c = cos(angle);
      uv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);

      uv.x += hover * hoverIntensity * 0.1 * sin(uv.y * 10.0 + iTime);
      uv.y += hover * hoverIntensity * 0.1 * sin(uv.x * 10.0 + iTime);

      return draw(uv);
    }

    void main() {
      vec2 fragCoord = vUv * iResolution.xy;
      vec4 col = mainImage(fragCoord);
      gl_FragColor = vec4(col.rgb * col.a, col.a);
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

  const vertexShader = createShader(gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertexShader || !fragmentShader) return;

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
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

  const positionLocation = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

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

  const uvLocation = gl.getAttribLocation(program, "uv");
  gl.enableVertexAttribArray(uvLocation);
  gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);

  const uniforms = {
    iTime: gl.getUniformLocation(program, "iTime"),
    iResolution: gl.getUniformLocation(program, "iResolution"),
    hue: gl.getUniformLocation(program, "hue"),
    hover: gl.getUniformLocation(program, "hover"),
    rot: gl.getUniformLocation(program, "rot"),
    hoverIntensity: gl.getUniformLocation(program, "hoverIntensity"),
    backgroundColor: gl.getUniformLocation(program, "backgroundColor")
  };

  gl.uniform1f(uniforms.hue, config.hue);
  gl.uniform1f(uniforms.hover, 0);
  gl.uniform1f(uniforms.rot, 0);
  gl.uniform1f(uniforms.hoverIntensity, config.hoverIntensity);
  gl.uniform3f(uniforms.backgroundColor, 0, 0, 0);

  function resize() {
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const width = Math.max(1, Math.floor(heroOrbBackground.clientWidth * dpr));
    const height = Math.max(1, Math.floor(heroOrbBackground.clientHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
    gl.uniform3f(uniforms.iResolution, width, height, width / Math.max(1, height));
  }

  const resizeObserver = "ResizeObserver" in window ? new ResizeObserver(resize) : null;
  if (resizeObserver) {
    resizeObserver.observe(heroOrbBackground);
  } else {
    window.addEventListener("resize", resize, { passive: true });
  }
  resize();

  let targetHover = 0;
  let hover = 0;
  let rotation = 0;
  let raf = 0;
  let lastTime = 0;
  let isVisible = true;

  function updateHover(event) {
    const rect = heroOrbBackground.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height) || 1;
    const x = ((event.clientX - rect.left - rect.width / 2) / size) * 2;
    const y = ((event.clientY - rect.top - rect.height / 2) / size) * 2;
    targetHover = Math.sqrt(x * x + y * y) < 0.8 ? 1 : 0;
  }

  window.addEventListener("pointermove", updateHover, { passive: true });
  window.addEventListener("mouseleave", () => {
    targetHover = 0;
  });
  window.addEventListener("blur", () => {
    targetHover = 0;
  });

  function render(timeNow) {
    raf = 0;
    if (!isVisible) return;

    const time = timeNow * 0.001;
    const dt = lastTime ? Math.max(0, time - lastTime) : 0;
    lastTime = time;
    hover += (targetHover - hover) * 0.1;
    if (targetHover > 0.5) rotation += dt * config.rotationSpeed;

    gl.uniform1f(uniforms.iTime, time);
    gl.uniform1f(uniforms.hover, hover);
    gl.uniform1f(uniforms.rot, rotation);
    gl.clear(gl.COLOR_BUFFER_BIT);
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
    observer.observe(heroOrbBackground);
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

initHeroOrbBackground();
initLazyBackgroundVideos();
initHobbySwitcher();
initHobbyMasonry();
initAnimations();
