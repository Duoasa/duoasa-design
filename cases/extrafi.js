const questHtml = document.documentElement;
const questNav = document.getElementById("nav");
const questThemeBtn = document.getElementById("themeBtn");
const questThemeIcon = document.getElementById("themeIcon");
const questThemeLabel = document.getElementById("themeLabel");
const questPreloader = document.getElementById("questPreloader");
const questCursor = document.getElementById("cursor");
const questCursorLabel = document.getElementById("cursorLabelText");
const questReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
}

function initQuestAnimations() {
  if (!window.gsap || !window.ScrollTrigger || questReduceMotion) {
    initFrameSequences(false);
    questPreloader.style.display = "none";
    revealQuestFallback();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  initFrameSequences(true);

  gsap.set("[data-reveal]:not(.ui-scroll-stack-wrap)", { opacity: 0, y: 24 });
  gsap.set(".quest-phone-card, .quest-task, .motion-phone, .quest-metrics article, .quest-lesson-list article", { opacity: 0, y: 24 });

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

    gsap.utils.toArray(".quest-task, .quest-phone-card, .motion-phone, .quest-metrics article, .quest-lesson-list article").forEach((item) => {
      gsap.to(item, {
        opacity: 1,
        y: 0,
        duration: 0.65,
        ease: "power2.out",
        scrollTrigger: { trigger: item, start: "top 92%" }
      });
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
  if ((window.gsap && window.ScrollTrigger) || questReduceMotion) {
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

initBadgeGalleries();
initScrollStacks();
bootQuestAnimations();
