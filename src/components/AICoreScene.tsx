import { Canvas, useFrame } from "@react-three/fiber";
import { AdaptiveDpr, Html, RoundedBox } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { Group, Mesh } from "three";

type OrbitCategory = {
  label: string;
  radius: number;
  speed: number;
  offset: number;
  query: string;
  size: number;
};

const CATEGORIES: OrbitCategory[] = [
  { label: "AI Tools", radius: 1.85, speed: 0.14, offset: 0.4, query: "AI tools and applications", size: 0.1 },
  { label: "AI Models", radius: 1.98, speed: 0.11, offset: 2.0, query: "AI models", size: 0.085 },
  { label: "AI Agents", radius: 1.78, speed: 0.16, offset: 3.6, query: "AI agents automation", size: 0.095 },
  { label: "AI APIs", radius: 2.08, speed: 0.1, offset: 5.2, query: "AI API", size: 0.08 },
];

function Stage({
  animate,
  compact,
  onCategorySelect,
}: {
  animate: boolean;
  compact: boolean;
  onCategorySelect?: (query: string) => void;
}) {
  const tilt = useRef<Group>(null);
  const spin = useRef<Group>(null);
  const rings = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!animate) return;
    const d = Math.min(delta, 0.05);

    if (spin.current) spin.current.rotation.y += d * 0.12;
    if (rings.current) {
      rings.current.rotation.z += d * 0.045;
      rings.current.rotation.x += d * 0.012;
    }
    if (tilt.current) {
      const tx = state.pointer.y * -0.1;
      const ty = state.pointer.x * 0.14;
      tilt.current.rotation.x += (tx - tilt.current.rotation.x) * 0.05;
      tilt.current.rotation.y += (ty - tilt.current.rotation.y) * 0.05;
    }
  });

  return (
    <group ref={tilt}>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 5, 3]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-3, 1.5, -2]} intensity={0.35} color="#dfe5ee" />
      <pointLight position={[0, 2.4, 1.5]} intensity={18} distance={10} decay={2} color="#ffffff" />

      <group position={[compact ? 0 : 2.05, 0, 0]} scale={compact ? 0.78 : 0.72}>
        <group ref={spin}>
          {/* Glass core — physical material (no transmission framebuffer pass) */}
          <RoundedBox args={[1.35, 1.35, 1.35]} radius={0.08} smoothness={2}>
            <meshPhysicalMaterial
              color="#eef2f7"
              roughness={0.12}
              metalness={0.05}
              clearcoat={1}
              clearcoatRoughness={0.08}
              transparent
              opacity={0.72}
              reflectivity={0.6}
            />
          </RoundedBox>

          <mesh scale={0.4}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#f5f7fa" roughness={0.25} metalness={0.08} />
          </mesh>
        </group>

        <group ref={rings}>
          <mesh rotation={[Math.PI / 2.05, 0.08, 0]}>
            <torusGeometry args={[1.7, 0.0028, 8, 96]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.32} />
          </mesh>
          <mesh rotation={[1.15, 0.2, 0.4]}>
            <torusGeometry args={[2.0, 0.0018, 8, 96]} />
            <meshBasicMaterial color="#e4e7ec" transparent opacity={0.14} />
          </mesh>
        </group>

        {CATEGORIES.map((cat) => (
          <OrbitNode
            key={cat.label}
            {...cat}
            animate={animate}
            showLabel={!compact}
            {...(onCategorySelect ? { onSelect: onCategorySelect } : {})}
          />
        ))}
      </group>
    </group>
  );
}

function OrbitNode({
  label,
  radius,
  speed,
  offset,
  query,
  size,
  animate,
  showLabel,
  onSelect,
}: OrbitCategory & { animate: boolean; showLabel: boolean; onSelect?: (query: string) => void }) {
  const ref = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (!animate || !ref.current) return;
    const t = state.clock.elapsedTime * speed + offset;
    ref.current.position.set(Math.cos(t) * radius, Math.sin(t) * 0.55, Math.sin(t) * 0.35);
    ref.current.rotation.y = t;
    ref.current.rotation.x = t * 0.35;
  });

  useEffect(() => {
    if (animate || !ref.current) return;
    ref.current.position.set(Math.cos(offset) * radius, Math.sin(offset) * 0.55, Math.sin(offset) * 0.35);
  }, [animate, offset, radius]);

  return (
    <group ref={ref}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(query);
        }}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color="#f4f6f8" roughness={0.2} metalness={0.15} />
      </mesh>
      {showLabel && (
        <Html
          center
          distanceFactor={9}
          position={[0, size + 0.22, 0]}
          zIndexRange={[20, 0]}
          style={{ pointerEvents: "none" }}
          occlude={false}
        >
          <div className="orbit-label">
            <span className="orbit-dot" />
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

function useReducedMotionPref() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);
    const update = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}

function useIsCompact() {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    setCompact(media.matches);
    const update = (event: MediaQueryListEvent) => setCompact(event.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return compact;
}

function usePageVisible() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onVis = () => setVisible(document.visibilityState === "visible");
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return visible;
}

export function AICoreScene({
  onCategorySelect,
  compact: compactProp,
}: {
  onCategorySelect?: (query: string) => void;
  /** When provided by parent, avoids a second media-query race. */
  compact?: boolean;
}) {
  const reducedMotion = useReducedMotionPref();
  const compactHook = useIsCompact();
  const compact = compactProp ?? compactHook;
  const pageVisible = usePageVisible();
  const animate = !reducedMotion && pageVisible;

  // Sharp enough to kill pixelation, capped so GPU stays calm.
  const dpr = useMemo<[number, number]>(() => {
    if (compact) return [1, 1.5];
    return [1, 1.75];
  }, [compact]);

  return (
    <div className="hero-visual" aria-label="Transparent glass AI core">
      <div className="visual-glow" />
      <Canvas
        camera={{ position: [0, 0.1, compact ? 6.2 : 7.4], fov: compact ? 38 : 34 }}
        dpr={dpr}
        frameloop={animate ? "always" : "never"}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        performance={{ min: 0.5 }}
      >
        <AdaptiveDpr pixelated={false} />
        <Suspense fallback={null}>
          <Stage
            animate={animate}
            compact={compact}
            {...(onCategorySelect ? { onCategorySelect } : {})}
          />
        </Suspense>
      </Canvas>
      <div className="visual-caption">
        <span className="caption-line" />
        <span>THE AI ECOSYSTEM</span>
      </div>
    </div>
  );
}
