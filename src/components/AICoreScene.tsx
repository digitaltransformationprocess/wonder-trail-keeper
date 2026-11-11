import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Html, MeshTransmissionMaterial, RoundedBox } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { Group } from "three";

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

const DUST = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  radius: 2.15 + (i % 3) * 0.12,
  speed: 0.05 + (i % 3) * 0.02,
  offset: i * 1.05,
  size: 0.028 + (i % 2) * 0.01,
  y: ((i % 3) - 1) * 0.35,
}));

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

    if (spin.current) spin.current.rotation.y += delta * 0.12;

    if (rings.current) {
      rings.current.rotation.z += delta * 0.045;
      rings.current.rotation.x += delta * 0.012;
    }

    if (tilt.current) {
      const tx = state.pointer.y * -0.12;
      const ty = state.pointer.x * 0.16;
      tilt.current.rotation.x += (tx - tilt.current.rotation.x) * 0.04;
      tilt.current.rotation.y += (ty - tilt.current.rotation.y) * 0.04;
    }
  });

  return (
    <group ref={tilt}>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 5, 3]} intensity={1.35} color="#ffffff" />
      <directionalLight position={[-3.5, 1.2, -2]} intensity={0.28} color="#e7eaee" />
      <spotLight
        position={[0, 4.2, 1.2]}
        angle={0.45}
        penumbra={0.85}
        intensity={8}
        color="#ffffff"
        distance={12}
      />

      <group
        position={[compact ? 0 : 2.05, compact ? 0 : 0, 0]}
        scale={compact ? 0.78 : 0.72}
      >
        <group ref={spin}>
          <RoundedBox args={[1.35, 1.35, 1.35]} radius={0.08} smoothness={6}>
            <MeshTransmissionMaterial
              backside
              samples={compact ? 4 : 8}
              resolution={compact ? 192 : 384}
              transmission={1}
              thickness={0.85}
              ior={1.45}
              chromaticAberration={0.012}
              anisotropy={0.08}
              distortion={0}
              distortionScale={0}
              temporalDistortion={0}
              color="#f7f8fa"
              attenuationColor="#cfd4db"
              attenuationDistance={1.8}
              roughness={0.04}
              clearcoat={1}
              clearcoatRoughness={0.04}
            />
          </RoundedBox>

          <mesh scale={0.42}>
            <octahedronGeometry args={[1, 0]} />
            <meshPhysicalMaterial
              color="#f2f4f7"
              roughness={0.18}
              metalness={0.04}
              transmission={0.55}
              thickness={0.4}
              transparent
              opacity={0.9}
            />
          </mesh>
        </group>

        <group ref={rings}>
          <mesh rotation={[Math.PI / 2.05, 0.08, 0]}>
            <torusGeometry args={[1.7, 0.0028, 24, 240]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.34} />
          </mesh>
          <mesh rotation={[1.15, 0.2, 0.4]}>
            <torusGeometry args={[2.0, 0.0018, 24, 240]} />
            <meshBasicMaterial color="#e4e7ec" transparent opacity={0.16} />
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

        {DUST.map((d) => (
          <Dust key={d.id} {...d} animate={animate} />
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
      <Float speed={animate ? 1 : 0} rotationIntensity={0} floatIntensity={animate ? 0.15 : 0}>
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
          <boxGeometry args={[size, size, size]} />
          <meshPhysicalMaterial
            color="#f4f6f8"
            roughness={0.08}
            metalness={0.02}
            transmission={0.92}
            thickness={0.25}
            ior={1.4}
            transparent
            clearcoat={1}
            clearcoatRoughness={0.08}
          />
        </mesh>
        {showLabel && (
          <Html
            center
            distanceFactor={9}
            position={[0, size + 0.22, 0]}
            zIndexRange={[20, 0]}
            style={{ pointerEvents: "none" }}
          >
            <div className="orbit-label">
              <span className="orbit-dot" />
              {label}
            </div>
          </Html>
        )}
      </Float>
    </group>
  );
}

function Dust({
  radius,
  speed,
  offset,
  size,
  y,
  animate,
}: {
  radius: number;
  speed: number;
  offset: number;
  size: number;
  y: number;
  animate: boolean;
}) {
  const ref = useRef<Group>(null);

  useFrame((state) => {
    if (!animate || !ref.current) return;
    const t = state.clock.elapsedTime * speed + offset;
    ref.current.position.set(Math.cos(t) * radius, y + Math.sin(t * 1.4) * 0.12, Math.sin(t) * radius * 0.35);
    ref.current.rotation.y = t;
  });

  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[size, size, size]} />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.12}
          transmission={0.8}
          thickness={0.08}
          transparent
          opacity={0.7}
        />
      </mesh>
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
    const media = window.matchMedia("(max-width: 768px)");
    setCompact(media.matches);
    const update = (event: MediaQueryListEvent) => setCompact(event.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return compact;
}

export function AICoreScene({
  onCategorySelect,
}: {
  onCategorySelect?: (query: string) => void;
}) {
  const reducedMotion = useReducedMotionPref();
  const compact = useIsCompact();
  const animate = !reducedMotion;
  const dpr = useMemo<[number, number]>(() => (compact ? [1, 1.15] : [1, 1.6]), [compact]);

  return (
    <div className="hero-visual" aria-label="Transparent glass AI core">
      <div className="visual-glow" />
      <Canvas
        camera={{ position: [0, 0.1, compact ? 6.2 : 7.4], fov: compact ? 38 : 34 }}
        dpr={dpr}
        frameloop={animate ? "always" : "demand"}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <Environment preset="studio" environmentIntensity={0.55} />
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
