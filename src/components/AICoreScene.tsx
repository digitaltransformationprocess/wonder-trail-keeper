import { Canvas, useFrame } from "@react-three/fiber";
import {
  AdaptiveDpr,
  Environment,
  Html,
  MeshTransmissionMaterial,
  RoundedBox,
} from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { Group, Mesh } from "three";

type OrbitCategory = {
  label: string;
  radius: number;
  speed: number;
  offset: number;
  query: string;
  yBias: number;
};

const CATEGORIES: OrbitCategory[] = [
  { label: "AI Models", radius: 1.95, speed: 0.09, offset: 0.55, query: "AI models", yBias: 0.72 },
  { label: "AI Agents", radius: 1.72, speed: 0.12, offset: 3.4, query: "AI agents automation", yBias: -0.55 },
  { label: "AI APIs", radius: 2.05, speed: 0.08, offset: 5.1, query: "AI API", yBias: 0.18 },
];

function GlassCore({ animate, compact }: { animate: boolean; compact: boolean }) {
  const core = useRef<Group>(null);
  const gem = useRef<Mesh>(null);
  const satellite = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (!animate) return;
    const d = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    if (core.current) {
      core.current.rotation.y += d * 0.16;
      core.current.rotation.x = Math.sin(t * 0.35) * 0.07;
    }
    if (gem.current) {
      gem.current.rotation.y -= d * 0.22;
      gem.current.rotation.x += d * 0.08;
    }
    if (satellite.current) {
      satellite.current.position.y = 0.72 + Math.sin(t * 1.4) * 0.035;
      satellite.current.rotation.y += d * 0.4;
    }
  });

  return (
    <group ref={core}>
      <RoundedBox args={[1.42, 1.42, 1.42]} radius={0.04} smoothness={4}>
        <MeshTransmissionMaterial
          backside
          samples={compact ? 3 : 5}
          resolution={compact ? 192 : 320}
          transmission={1}
          roughness={0.02}
          thickness={1.6}
          ior={1.5}
          chromaticAberration={0.42}
          anisotropy={0.15}
          distortion={0.18}
          distortionScale={0.28}
          temporalDistortion={0.12}
          color="#ffffff"
          attenuationColor="#eaf2ff"
          attenuationDistance={1.8}
          clearcoat={1}
          clearcoatRoughness={0.02}
        />
      </RoundedBox>

      {/* Bright caustic core — matches the glowing bottom of the reference */}
      <mesh position={[0, -0.28, 0]} scale={[0.55, 0.22, 0.55]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.55} />
      </mesh>

      <mesh ref={gem} scale={0.3}>
        <octahedronGeometry args={[1, 0]} />
        <meshPhysicalMaterial
          color="#ffffff"
          metalness={0}
          roughness={0.08}
          transmission={0.7}
          thickness={0.5}
          ior={1.7}
          iridescence={1}
          iridescenceThicknessRange={[100, 520]}
          transparent
          opacity={0.9}
          emissive="#9eb6ff"
          emissiveIntensity={0.15}
        />
      </mesh>

      <mesh ref={satellite} position={[0.78, 0.72, 0.55]} scale={0.14}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#f2f4f7" roughness={0.2} metalness={0.08} />
      </mesh>
    </group>
  );
}

function OrbitRings({ animate }: { animate: boolean }) {
  const rings = useRef<Group>(null);

  useFrame((_, delta) => {
    if (!animate || !rings.current) return;
    const d = Math.min(delta, 0.05);
    rings.current.rotation.z += d * 0.05;
    rings.current.rotation.x += d * 0.015;
  });

  return (
    <group ref={rings}>
      <mesh rotation={[Math.PI / 2.08, 0.1, 0.15]}>
        <torusGeometry args={[1.78, 0.0024, 8, 128]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.38} />
      </mesh>
      <mesh rotation={[1.05, 0.35, 0.55]}>
        <torusGeometry args={[2.08, 0.0016, 8, 128]} />
        <meshBasicMaterial color="#e8ecf2" transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

function OrbitNode({
  label,
  radius,
  speed,
  offset,
  query,
  yBias,
  animate,
  showLabel,
  onSelect,
}: OrbitCategory & {
  animate: boolean;
  showLabel: boolean;
  onSelect?: (query: string) => void;
}) {
  const ref = useRef<Group>(null);

  useFrame((state) => {
    if (!animate || !ref.current) return;
    const t = state.clock.elapsedTime * speed + offset;
    ref.current.position.set(
      Math.cos(t) * radius,
      yBias + Math.sin(t * 0.85) * 0.18,
      Math.sin(t) * 0.42,
    );
  });

  useEffect(() => {
    if (animate || !ref.current) return;
    ref.current.position.set(Math.cos(offset) * radius, yBias, Math.sin(offset) * 0.42);
  }, [animate, offset, radius, yBias]);

  return (
    <group ref={ref}>
      <mesh
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
        <boxGeometry args={[0.09, 0.09, 0.09]} />
        <meshStandardMaterial color="#e8edf3" roughness={0.22} metalness={0.1} />
      </mesh>
      {showLabel ? (
        <Html
          center
          distanceFactor={8.5}
          position={[0, 0.22, 0]}
          zIndexRange={[30, 0]}
          style={{ pointerEvents: "auto" }}
          occlude={false}
        >
          <button
            type="button"
            className="orbit-label"
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(query);
            }}
          >
            <span className="orbit-dot" />
            {label}
          </button>
        </Html>
      ) : null}
    </group>
  );
}

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

  useFrame((state) => {
    if (!animate || !tilt.current) return;
    const tx = state.pointer.y * -0.08;
    const ty = state.pointer.x * 0.12;
    tilt.current.rotation.x += (tx - tilt.current.rotation.x) * 0.045;
    tilt.current.rotation.y += (ty - tilt.current.rotation.y) * 0.045;
  });

  return (
    <group ref={tilt}>
      {/* Opaque plate for MeshTransmissionMaterial to refract (transparent canvas alone = grey cube) */}
      <mesh position={[compact ? 0 : 2.15, 0.1, -2.4]} scale={[10, 10, 1]}>
        <planeGeometry />
        <meshBasicMaterial color="#050506" />
      </mesh>

      <ambientLight intensity={0.45} />
      <directionalLight position={[3.5, 5.5, 2.5]} intensity={1.8} color="#ffffff" />
      <directionalLight position={[-3.2, 1.2, -2]} intensity={0.35} color="#b8c4d6" />
      <pointLight position={[compact ? 0 : 2.15, -1.4, 1.4]} intensity={28} distance={9} decay={2} color="#ffffff" />
      <pointLight position={[compact ? 1.2 : 3.4, 2.2, 1.8]} intensity={14} distance={8} decay={2} color="#dbe7ff" />

      <group position={[compact ? 0 : 2.15, compact ? 0.05 : 0.1, 0]} scale={compact ? 0.82 : 0.78}>
        <GlassCore animate={animate} compact={compact} />
        <OrbitRings animate={animate} />
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
  compact?: boolean;
}) {
  const reducedMotion = useReducedMotionPref();
  const compactHook = useIsCompact();
  const compact = compactProp ?? compactHook;
  const pageVisible = usePageVisible();
  const animate = !reducedMotion && pageVisible;

  const dpr = useMemo<[number, number]>(() => {
    if (compact) return [1, 1.6];
    return [1, 1.85];
  }, [compact]);

  return (
    <div className="hero-visual" aria-label="Glass AI core">
      <div className="visual-glow" />
      <Canvas
        camera={{ position: [0, 0.15, compact ? 6 : 7.1], fov: compact ? 36 : 32 }}
        dpr={dpr}
        frameloop={animate ? "always" : "never"}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        performance={{ min: 0.55 }}
      >
        <AdaptiveDpr pixelated={false} />
        <Suspense fallback={null}>
          <Environment preset="studio" environmentIntensity={1.25} />
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
