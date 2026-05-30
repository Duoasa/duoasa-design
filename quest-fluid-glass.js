import * as THREE from "https://esm.sh/three@0.160.1";
import React, {
  createElement as h,
  memo,
  useEffect,
  useRef,
  useState,
} from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";
import {
  Canvas,
  createPortal,
  useFrame,
  useThree,
} from "https://esm.sh/@react-three/fiber@8.17.10?deps=react@18.3.1,react-dom@18.3.1,three@0.160.1";
import {
  MeshTransmissionMaterial,
  useFBO,
  useGLTF,
} from "https://esm.sh/@react-three/drei@9.112.0?deps=react@18.3.1,react-dom@18.3.1,three@0.160.1,@react-three/fiber@8.17.10";
import * as easing from "https://esm.sh/maath@0.10.8/easing?deps=three@0.160.1";

const MODEL_PATH = "/assets/3d/cube.glb";
const CUBE_THICKNESS = 1;

function FluidGlass({ mode = "cube", lensProps = {}, barProps = {}, cubeProps = {}, backgroundTexture }) {
  const Wrapper = mode === "cube" ? Cube : Cube;
  const rawOverrides = mode === "cube" ? cubeProps : mode === "bar" ? barProps : lensProps;
  const { navItems = [], ...modeProps } = rawOverrides;

  return h(
    Canvas,
    {
      camera: { position: [0, 0, 20], fov: 15 },
      dpr: [1, 1.5],
      gl: { alpha: true, antialias: true },
      onCreated: ({ gl }) => {
        gl.setClearColor(0x000000, 0);
      },
    },
    h(Wrapper, { modeProps, navItems, backgroundTexture })
  );
}

const ModeWrapper = memo(function ModeWrapper({
  modeProps = {},
  followPointer = true,
  lockToBottom = false,
  backgroundTexture,
}) {
  const ref = useRef();
  const { nodes } = useGLTF(MODEL_PATH);
  const buffer = useFBO();
  const { viewport: vp } = useThree();
  const [scene] = useState(() => new THREE.Scene());
  const geoWidthRef = useRef(1);

  useEffect(() => {
    const geo = nodes.Cube?.geometry;
    if (!geo) return;
    geo.computeBoundingBox();
    geoWidthRef.current = geo.boundingBox.max.x - geo.boundingBox.min.x || 1;
  }, [nodes]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const { gl, viewport, pointer, camera } = state;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);

    const destX = followPointer ? (pointer.x * v.width) / 2 : 0;
    const destY = lockToBottom ? -v.height / 2 + 0.2 : followPointer ? (pointer.y * v.height) / 2 : 0;
    easing.damp3(ref.current.position, [destX, destY, 15], 0.15, delta);

    if (modeProps.scale == null) {
      const maxWorld = v.width * 0.9;
      const desired = maxWorld / geoWidthRef.current;
      ref.current.scale.setScalar(Math.min(0.15, desired));
    }

    gl.setClearColor(0x000000, 0);
    gl.setRenderTarget(buffer);
    gl.clear(true, true, true);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
    gl.setClearColor(0x000000, 0);
  });

  const {
    scale,
    ior,
    thickness,
    anisotropy,
    chromaticAberration,
    ...extraMat
  } = modeProps;

  return h(
    React.Fragment,
    null,
    backgroundTexture
      ? createPortal(
        h(
          "mesh",
          { scale: [vp.width, vp.height, 1] },
          h("planeGeometry", null),
          h("meshBasicMaterial", {
            map: backgroundTexture,
            transparent: true,
            toneMapped: false,
          })
        ),
        scene
      )
      : null,
    h(
      "mesh",
      {
        ref,
        scale: scale ?? 0.15,
        "rotation-x": Math.PI / 2,
        geometry: nodes.Cube?.geometry,
      },
      h(MeshTransmissionMaterial, {
        buffer: buffer.texture,
        samples: 8,
        resolution: 256,
        ior: ior ?? 1.15,
        thickness: thickness ?? CUBE_THICKNESS,
        anisotropy: anisotropy ?? 0.01,
        chromaticAberration: chromaticAberration ?? 0.1,
        transmission: 1,
        roughness: 0.02,
        color: "#ffffff",
        attenuationColor: "#ffffff",
        attenuationDistance: 4,
        transparent: true,
        opacity: 0.76,
        depthWrite: false,
        ...extraMat,
      })
    )
  );
});

function Cube(props) {
  return h(ModeWrapper, props);
}

function createWrappedLines(ctx, text, maxWidth) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines = [];
  let line = "";

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  });

  if (line) lines.push(line);
  return lines;
}

function drawElementText(ctx, element, hostRect, ratio) {
  if (!element) return;
  const rect = element.getBoundingClientRect();
  const styles = window.getComputedStyle(element);
  const fontSize = Number.parseFloat(styles.fontSize) * ratio;
  const lineHeight = (Number.parseFloat(styles.lineHeight) || Number.parseFloat(styles.fontSize) * 1.2) * ratio;
  const x = (rect.left - hostRect.left) * ratio;
  let y = (rect.top - hostRect.top) * ratio + fontSize * 0.86;
  const maxWidth = rect.width * ratio;

  ctx.font = `${styles.fontWeight} ${fontSize}px ${styles.fontFamily}`;
  ctx.fillStyle = styles.color;
  ctx.textBaseline = "alphabetic";

  createWrappedLines(ctx, element.textContent || "", maxWidth).forEach((line) => {
    ctx.fillText(line, x, y);
    y += lineHeight;
  });
}

function createBackgroundTexture(container) {
  const host = container.closest(".brand-operations-copy");
  const textColumn = host?.querySelector(".brand-operations-copy-text");
  if (!host || !textColumn) return null;

  const hostRect = host.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(hostRect.width * ratio));
  canvas.height = Math.max(1, Math.round(hostRect.height * ratio));

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawElementText(ctx, textColumn.querySelector("span"), hostRect, ratio);
  drawElementText(ctx, textColumn.querySelector("h3"), hostRect, ratio);
  textColumn.querySelectorAll("p").forEach((paragraph) => drawElementText(ctx, paragraph, hostRect, ratio));

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

useGLTF.preload(MODEL_PATH);

document.querySelectorAll("[data-fluid-glass-preview]").forEach((container) => {
  const backgroundTexture = createBackgroundTexture(container);
  createRoot(container).render(
    h(FluidGlass, {
      mode: "cube",
      backgroundTexture,
      cubeProps: {
        scale: 0.22,
        ior: 1.15,
        thickness: CUBE_THICKNESS,
        chromaticAberration: 0.1,
        anisotropy: 0.01,
      },
    })
  );
});
