"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "motion/react";

/**
 * Route external product photos through Next's same-origin image optimizer
 * instead of fetching them directly — `zongii.co.tz` sends no CORS headers,
 * and a cross-origin WebGL texture upload without them throws mid-render
 * (SecurityError), silently killing the whole R3F frame loop (blank canvas).
 */
function sameOriginTextureUrl(src: string): string {
  if (!/^https?:\/\//.test(src)) return src;
  return `/_next/image?url=${encodeURIComponent(src)}&w=1080&q=85`;
}

/** Reads the active theme family's accent/background CSS vars, live. */
function useThemeColors() {
  const [colors, setColors] = useState(() => readColors());

  useEffect(() => {
    const update = () => setColors(readColors());
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return colors;
}

function readColors() {
  if (typeof window === "undefined") {
    return { accent: "#d4af6a", background: "#06121a", foreground: "#edf4f7" };
  }
  const style = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) =>
    style.getPropertyValue(name).trim() || fallback;
  return {
    accent: read("--color-gold", "#d4af6a"),
    background: read("--background", "#06121a"),
    foreground: read("--foreground", "#edf4f7"),
  };
}

/** Fallback texture for products whose photo failed to load. */
function buildPlaceholderTexture(accent: string, background: string, name: string): THREE.Texture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = accent;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 3;
  ctx.strokeRect(28, 28, size - 56, size - 56);
  ctx.globalAlpha = 1;
  ctx.fillStyle = accent;
  ctx.font = "600 20px ui-sans-serif, system-ui";
  ctx.textAlign = "center";
  ctx.fillText(name.slice(0, 28).toUpperCase(), size / 2, size / 2 + 8);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Deterministic pseudo-random in [0, 1) — avoids Math.random in render. */
function hash(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** Slow-drifting accent-tinted dust around the plate. */
function Dust({ accent }: { accent: string }) {
  const points = useRef<THREE.Points>(null!);
  const reduced = useReducedMotion();
  const { positions, seeds } = useMemo(() => {
    const count = 200;
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (hash(i * 3 + 0.1) - 0.5) * 7;
      positions[i * 3 + 1] = (hash(i * 3 + 0.2) - 0.5) * 5;
      positions[i * 3 + 2] = (hash(i * 3 + 0.3) - 0.5) * 4;
      seeds[i] = hash(i + 500) * Math.PI * 2;
    }
    return { positions, seeds };
  }, []);

  const texture = useMemo(() => {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, "rgba(255,255,255,0.9)");
    grad.addColorStop(0.4, "rgba(255,255,255,0.35)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
  }, []);

  const color = useMemo(() => new THREE.Color(accent), [accent]);

  useFrame((state) => {
    if (!points.current || reduced) return;
    const t = state.clock.elapsedTime;
    const pos = points.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const seed = seeds[i];
      pos.setY(i, pos.getY(i) + Math.sin(t * 0.4 + seed) * 0.0009 + 0.0012);
      pos.setX(i, pos.getX(i) + Math.cos(t * 0.3 + seed) * 0.0007);
      if (pos.getY(i) > 2.6) pos.setY(i, -2.6);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        color={color}
        size={0.05}
        transparent
        opacity={0.7}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

/** Accent-edged specimen plate carrying the product photo on its face. */
function Plate({
  image,
  name,
  accent,
  background,
}: {
  image: string;
  name: string;
  accent: string;
  background: string;
}) {
  const group = useRef<THREE.Group>(null!);
  const reduced = useReducedMotion();
  const pointer = useThree((s) => s.pointer);
  // Start on the placeholder so the plate never renders blank while the
  // (often externally-hosted) photo is still in flight.
  const [texture, setTexture] = useState<THREE.Texture>(() =>
    buildPlaceholderTexture(accent, background, name),
  );

  useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";
    loader.load(
      sameOriginTextureUrl(image),
      (tex) => {
        if (cancelled) return;
        tex.colorSpace = THREE.SRGBColorSpace;
        setTexture(tex);
      },
      undefined,
      () => {
        if (cancelled) return;
        setTexture(buildPlaceholderTexture(accent, background, name));
      },
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image]);

  const geometry = useMemo(() => new THREE.BoxGeometry(2.6, 1.95, 0.1), []);

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    if (!reduced) {
      group.current.rotation.y = Math.sin(t * 0.35) * 0.42 + 0.1;
      group.current.position.y = Math.sin(t * 0.6) * 0.08;
      const targetX = pointer.x * 0.3;
      const targetY = pointer.y * 0.16;
      group.current.rotation.y += targetX * 0.15;
      group.current.rotation.x += (-targetY - group.current.rotation.x) * Math.min(1, delta * 2.2);
    } else {
      group.current.rotation.y = 0.18;
    }
  });

  const edgeMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: accent, metalness: 0.8, roughness: 0.34 }),
    [accent],
  );
  const backMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: background, metalness: 0.3, roughness: 0.65 }),
    [background],
  );
  const faceMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ map: texture, metalness: 0.1, roughness: 0.55 }),
    [texture],
  );

  const materials = useMemo(
    () => [edgeMaterial, edgeMaterial, edgeMaterial, edgeMaterial, faceMaterial, backMaterial],
    [edgeMaterial, faceMaterial, backMaterial],
  );

  return (
    <group ref={group}>
      <mesh geometry={geometry} material={materials} />
    </group>
  );
}

export function ProductScene({ image, name }: { image: string; name: string }) {
  const { accent, background } = useThemeColors();

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 4.6], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      className="!absolute inset-0"
      aria-hidden
    >
      <fog attach="fog" args={[background, 6, 11]} />
      <ambientLight intensity={0.5} color={accent} />
      <directionalLight position={[3, 3, 5]} intensity={1.8} color="#ffffff" />
      <directionalLight position={[-4, -2, 2]} intensity={0.4} color={accent} />
      <pointLight position={[-2.5, 1.5, 3.5]} intensity={14} color={accent} distance={10} decay={2} />
      <Plate image={image} name={name} accent={accent} background={background} />
      <Dust accent={accent} />
    </Canvas>
  );
}
