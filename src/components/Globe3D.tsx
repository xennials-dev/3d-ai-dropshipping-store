"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";

/* deterministic pseudo-random for stable star dots */
function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function latLngToVec3(lat: number, lng: number, r: number): [number, number, number] {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return [
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  ];
}

const CITIES: [number, number][] = [
  [40.7, -74],   // New York
  [34, -118.2],  // Los Angeles
  [51.5, -0.1],  // London
  [48.8, 2.3],   // Paris
  [52.5, 13.4],  // Berlin
  [22.3, 114.2], // Hong Kong
  [31.2, 121.5], // Shanghai
  [35.6, 139.7], // Tokyo
  [-33.8, 151.2],// Sydney
  [1.35, 103.8], // Singapore
  [19, 72.8],    // Mumbai
  [-23.5, -46.6],// São Paulo
  [19.4, -99.1], // Mexico City
  [41, -87.6],   // Chicago
  [45.4, -122.6],// Portland
  [37.5, 127],   // Seoul
];

function NetworkNodes() {
  const positions = useMemo(() => CITIES.map(([la, ln]) => latLngToVec3(la, ln, 2.02)), []);
  return (
    <group>
      {positions.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.045 + (i % 3) * 0.018, 12, 12]} />
          <meshStandardMaterial
            color="#f6d68a"
            emissive="#e4b45c"
            emissiveIntensity={2.4}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function OrbitRing({ radius, tilt, opacity }: { radius: number; tilt: [number, number, number]; opacity: number }) {
  return (
    <mesh rotation={tilt}>
      <torusGeometry args={[radius, 0.006, 8, 128]} />
      <meshBasicMaterial color="#e4b45c" transparent opacity={opacity} />
    </mesh>
  );
}

function OrbitingPackage({
  radius,
  speed,
  tilt,
  phase,
  scale = 1,
}: {
  radius: number;
  speed: number;
  tilt: number;
  phase: number;
  scale?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + phase;
    const x = Math.cos(t) * radius;
    const z = Math.sin(t) * radius;
    const y = Math.sin(t) * Math.sin(tilt) * radius * 0.6;
    ref.current?.position.set(x, y, z * Math.cos(tilt * 0.4));
    ref.current?.rotateY(0.012);
    ref.current?.rotateX(0.008);
  });
  return (
    <group ref={ref} scale={scale}>
      <mesh>
        <boxGeometry args={[0.17, 0.14, 0.17]} />
        <meshStandardMaterial color="#c98f3d" roughness={0.55} metalness={0.25} emissive="#3a2a10" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0, 0.075, 0]}>
        <boxGeometry args={[0.175, 0.02, 0.06]} />
        <meshStandardMaterial color="#f6d68a" emissive="#e4b45c" emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
    </group>
  );
}

function GlobeCore() {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.12;
  });
  return (
    <group ref={group}>
      {/* dark inner sphere */}
      <mesh>
        <sphereGeometry args={[1.97, 48, 48]} />
        <meshStandardMaterial color="#101116" roughness={0.85} metalness={0.4} emissive="#1a1408" emissiveIntensity={0.35} />
      </mesh>
      {/* glowing wireframe shell */}
      <mesh>
        <sphereGeometry args={[2.0, 28, 20]} />
        <meshBasicMaterial color="#e4b45c" wireframe transparent opacity={0.32} toneMapped={false} />
      </mesh>
      <NetworkNodes />
    </group>
  );
}

function Atmosphere() {
  const moon = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.08;
    moon.current?.position.set(Math.cos(t) * 4.4, 1.6, Math.sin(t) * 4.4);
  });
  return (
    <mesh ref={moon}>
      <sphereGeometry args={[0.16, 16, 16]} />
      <meshStandardMaterial color="#f4efe6" emissive="#8f8b7d" emissiveIntensity={0.7} />
    </mesh>
  );
}

export default function Globe3D() {
  const stars = useMemo(() => rand(42), []);
  void stars;
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.7, 6.6], fov: 44 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 4, 6]} intensity={1.5} color="#ffe1ad" />
      <pointLight position={[-6, -2, -4]} intensity={30} color="#3d5a80" />
      <Stars radius={40} depth={30} count={1800} factor={3.2} saturation={0} fade speed={0.6} />
      <Atmosphere />
      <OrbitRing radius={2.75} tilt={[Math.PI / 2.6, 0, Math.PI / 7]} opacity={0.4} />
      <OrbitRing radius={3.35} tilt={[Math.PI / 1.9, 0.3, -Math.PI / 5]} opacity={0.25} />
      <OrbitRing radius={3.95} tilt={[Math.PI / 2.3, -0.2, Math.PI / 3]} opacity={0.16} />
      <GlobeCore />
      <OrbitingPackage radius={2.75} speed={0.42} tilt={0.7} phase={0} scale={0.9} />
      <OrbitingPackage radius={3.35} speed={0.3} tilt={1.1} phase={2.2} scale={1.15} />
      <OrbitingPackage radius={3.95} speed={0.22} tilt={0.5} phase={4.1} scale={0.75} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.6}
        autoRotate
        autoRotateSpeed={0.7}
        minPolarAngle={Math.PI / 3.2}
        maxPolarAngle={Math.PI / 1.55}
      />
    </Canvas>
  );
}
