const GLASS_DEFAULTS = {
  width: 250,
  height: 180,
  borderRadius: 32,
  borderWidth: 0.07,
  brightness: 50,
  opacity: 0.93,
  blur: 11,
  displace: 0,
  backgroundOpacity: 0,
  saturation: 1,
  distortionScale: -180,
  redOffset: 0,
  greenOffset: 10,
  blueOffset: 20,
  xChannel: "R",
  yChannel: "G",
  mixBlendMode: "difference",
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function supportsSVGFilters(filterId) {
  if (typeof window === "undefined" || typeof document === "undefined") return false;

  const isWebkit = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  const isFirefox = /Firefox/.test(navigator.userAgent);
  if (isWebkit || isFirefox) return false;

  const div = document.createElement("div");
  div.style.backdropFilter = `url(#${filterId})`;
  return div.style.backdropFilter !== "";
}

function generateDisplacementMap(surface, config, ids) {
  const rect = surface.getBoundingClientRect();
  const actualWidth = rect.width || config.width;
  const actualHeight = rect.height || config.height;
  const edgeSize = Math.min(actualWidth, actualHeight) * (config.borderWidth * 0.5);

  const svgContent = `
    <svg viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${ids.redGrad}" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#0000"/>
          <stop offset="100%" stop-color="red"/>
        </linearGradient>
        <linearGradient id="${ids.blueGrad}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0000"/>
          <stop offset="100%" stop-color="blue"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="black"></rect>
      <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${config.borderRadius}" fill="url(#${ids.redGrad})" />
      <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${config.borderRadius}" fill="url(#${ids.blueGrad})" style="mix-blend-mode: ${config.mixBlendMode}" />
      <rect x="${edgeSize}" y="${edgeSize}" width="${actualWidth - edgeSize * 2}" height="${actualHeight - edgeSize * 2}" rx="${config.borderRadius}" fill="hsl(0 0% ${config.brightness}% / ${config.opacity})" style="filter:blur(${config.blur}px)" />
    </svg>
  `;

  return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
}

function createGlassSurface(layer, config) {
  const id = `xlend-glass-${Math.random().toString(36).slice(2)}`;
  const ids = {
    filter: `glass-filter-${id}`,
    redGrad: `red-grad-${id}`,
    blueGrad: `blue-grad-${id}`,
  };

  const surface = document.createElement("div");
  surface.className = `glass-surface ${supportsSVGFilters(ids.filter) ? "glass-surface--svg" : "glass-surface--fallback"}`;
  surface.style.width = typeof config.width === "number" ? `${config.width}px` : config.width;
  surface.style.height = typeof config.height === "number" ? `${config.height}px` : config.height;
  surface.style.borderRadius = `${config.borderRadius}px`;
  surface.style.setProperty("--glass-frost", config.backgroundOpacity);
  surface.style.setProperty("--glass-saturation", config.saturation);
  surface.style.setProperty("--filter-id", `url(#${ids.filter})`);

  surface.innerHTML = `
    <svg class="glass-surface__filter" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="${ids.filter}" color-interpolation-filters="sRGB" x="0%" y="0%" width="100%" height="100%">
          <feImage x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />
          <feDisplacementMap in="SourceGraphic" in2="map" id="redchannel" result="dispRed" />
          <feColorMatrix in="dispRed" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="red" />
          <feDisplacementMap in="SourceGraphic" in2="map" id="greenchannel" result="dispGreen" />
          <feColorMatrix in="dispGreen" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="green" />
          <feDisplacementMap in="SourceGraphic" in2="map" id="bluechannel" result="dispBlue" />
          <feColorMatrix in="dispBlue" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" result="blue" />
          <feBlend in="red" in2="green" mode="screen" result="rg" />
          <feBlend in="rg" in2="blue" mode="screen" result="output" />
          <feGaussianBlur in="output" stdDeviation="${config.displace}" />
        </filter>
      </defs>
    </svg>
    <div class="glass-surface__content"></div>
  `;

  const feImage = surface.querySelector("feImage");
  const channels = surface.querySelectorAll("feDisplacementMap");
  const gaussianBlur = surface.querySelector("feGaussianBlur");

  const updateDisplacementMap = () => {
    feImage?.setAttribute("href", generateDisplacementMap(surface, config, ids));
    [
      { node: channels[0], offset: config.redOffset },
      { node: channels[1], offset: config.greenOffset },
      { node: channels[2], offset: config.blueOffset },
    ].forEach(({ node, offset }) => {
      if (!node) return;
      node.setAttribute("scale", (config.distortionScale + offset).toString());
      node.setAttribute("xChannelSelector", config.xChannel);
      node.setAttribute("yChannelSelector", config.yChannel);
    });
    gaussianBlur?.setAttribute("stdDeviation", config.displace.toString());
  };

  layer.appendChild(surface);
  updateDisplacementMap();

  const resizeObserver = new ResizeObserver(() => {
    window.setTimeout(updateDisplacementMap, 0);
  });
  resizeObserver.observe(surface);

  window.addEventListener("beforeunload", () => resizeObserver.disconnect(), { once: true });

  return { surface, updateDisplacementMap };
}

function initGlassSurfaceFollow(layer) {
  const host = layer.closest(".brand-operations-copy");
  if (!host) return;

  const copy = host.querySelector(".brand-operations-copy-text");
  const hostRect = host.getBoundingClientRect();
  const glassWidth = clamp(hostRect.width * 0.24, 190, 300);
  const glassHeight = clamp(hostRect.height * 0.42, 150, 230);
  const { surface, updateDisplacementMap } = createGlassSurface(layer, {
    ...GLASS_DEFAULTS,
    width: glassWidth,
    height: glassHeight,
    borderRadius: 32,
    backgroundOpacity: 0,
  });

  const reduceMotion = false;
  const getAnchorPosition = () => {
    const rect = host.getBoundingClientRect();
    const anchorRect = copy?.getBoundingClientRect() || rect;
    const width = surface.offsetWidth || glassWidth;
    const height = surface.offsetHeight || glassHeight;
    return {
      x: clamp(anchorRect.left - rect.left + anchorRect.width * 0.5 - width * 0.5, 0, Math.max(0, rect.width - width)),
      y: clamp(anchorRect.top - rect.top + anchorRect.height * 0.5 - height * 0.5, 0, Math.max(0, rect.height - height)),
    };
  };
  const current = getAnchorPosition();
  const target = { ...current };
  let rafId = 0;

  const setTarget = (clientX, clientY) => {
    const rect = host.getBoundingClientRect();
    const width = surface.offsetWidth || glassWidth;
    const height = surface.offsetHeight || glassHeight;
    target.x = clamp(clientX - rect.left - width * 0.5, 0, Math.max(0, rect.width - width));
    target.y = clamp(clientY - rect.top - height * 0.5, 0, Math.max(0, rect.height - height));
    if (reduceMotion) {
      current.x = target.x;
      current.y = target.y;
      surface.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
    }
  };

  const animate = () => {
    current.x += (target.x - current.x) * 0.18;
    current.y += (target.y - current.y) * 0.18;
    surface.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
    rafId = window.requestAnimationFrame(animate);
  };

  surface.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;

  host.addEventListener("pointermove", (event) => setTarget(event.clientX, event.clientY), { passive: true });
  host.addEventListener("pointerleave", () => {
    const anchor = getAnchorPosition();
    target.x = anchor.x;
    target.y = anchor.y;
  });

  const hostResizeObserver = new ResizeObserver(() => {
    updateDisplacementMap();
    const anchor = getAnchorPosition();
    target.x = anchor.x;
    target.y = anchor.y;
  });
  hostResizeObserver.observe(host);

  if (!reduceMotion) rafId = window.requestAnimationFrame(animate);

  window.addEventListener("beforeunload", () => {
    if (rafId) window.cancelAnimationFrame(rafId);
    hostResizeObserver.disconnect();
  }, { once: true });
}

document.querySelectorAll("[data-glass-surface-follow]").forEach(initGlassSurfaceFollow);
