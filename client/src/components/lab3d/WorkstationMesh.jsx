import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export default function WorkstationMesh({
  station,
  isSelected,
  onSelect,
}) {
  const groupRef = useRef();
  const screenRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Status colors
  const statusColor =
    station.status === 'faulty'
      ? '#e11d48' // Crimson/Rose
      : station.status === 'warning'
      ? '#f59e0b' // Amber/Gold
      : '#10b981'; // Emerald

  // Subtle breathing pulse for warning/faulty stations
  useFrame((state) => {
    if (screenRef.current && (station.status === 'faulty' || station.status === 'warning')) {
      const t = state.clock.getElapsedTime();
      const intensity = station.status === 'faulty' ? 1.5 + Math.sin(t * 5) * 0.8 : 1.0 + Math.sin(t * 3) * 0.4;
      screenRef.current.emissiveIntensity = intensity;
    }
  });

  return (
    <group
      ref={groupRef}
      position={station.position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(station);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Station Holographic Floating Marker */}
      <Html position={[0, 2.3, 0]} center distanceFactor={11} zIndexRange={[100, 0]}>
        <div
          className={`pointer-events-none select-none flex flex-col items-center transition-all duration-300 ${
            hovered || isSelected ? 'scale-115' : 'scale-95 opacity-85'
          }`}
        >
          <div
            className={`px-2.5 py-1 rounded-full border text-[10px] font-mono font-bold tracking-wider shadow-lg flex items-center space-x-1.5 backdrop-blur-md ${
              station.status === 'faulty'
                ? 'bg-maroon-950/95 text-rose-300 border-rose-500/80 shadow-glow-maroon'
                : station.status === 'warning'
                ? 'bg-amber-950/95 text-amber-300 border-amber-500/70 shadow-sm'
                : 'bg-zinc-950/90 text-emerald-300 border-emerald-500/50'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                station.status === 'faulty'
                  ? 'bg-rose-500 animate-ping'
                  : station.status === 'warning'
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
            />
            <span className="text-gold-300/90 text-[9px]">Col {station.column || (station.number <= 4 ? 'A' : 'B')}</span>
            <span>•</span>
            <span className="text-white font-extrabold">{station.displayId || station.id}</span>
          </div>

          {/* Quick status alert flag on hover */}
          {hovered && (
            <div className="mt-1 px-2.5 py-1 rounded-lg bg-zinc-950/95 border border-gold-500/30 text-[9px] text-slate-200 max-w-[180px] text-center shadow-2xl backdrop-blur-md">
              <p className="font-semibold text-gold-300">{station.labCode} • {station.columnLabel || (station.number <= 4 ? 'Column A' : 'Column B')}</p>
              <p className="truncate text-slate-400">{station.alertMessage || (station.status === 'healthy' ? 'Status: Operational' : 'Action Required')}</p>
            </div>
          )}
        </div>
      </Html>

      {/* 1. Computer Desk Top */}
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.05, 0.9]} />
        <meshStandardMaterial
          color={hovered || isSelected ? '#332408' : '#141419'}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Desk Legs (Metallic Steel) */}
      <mesh position={[-0.8, 0.35, 0.35]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.7, 16]} />
        <meshStandardMaterial color="#33333e" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.8, 0.35, 0.35]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.7, 16]} />
        <meshStandardMaterial color="#33333e" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[-0.8, 0.35, -0.35]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.7, 16]} />
        <meshStandardMaterial color="#33333e" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.8, 0.35, -0.35]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.7, 16]} />
        <meshStandardMaterial color="#33333e" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* 2. Primary Ultrawide Monitor */}
      <group position={[0, 1.1, -0.2]}>
        {/* Monitor Stand Base */}
        <mesh position={[0, -0.33, 0]}>
          <cylinderGeometry args={[0.12, 0.14, 0.02, 16]} />
          <meshStandardMaterial color="#1a1a24" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Stand Pillar */}
        <mesh position={[0, -0.15, 0]}>
          <boxGeometry args={[0.04, 0.35, 0.04]} />
          <meshStandardMaterial color="#1a1a24" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Screen Bezel */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[1.05, 0.48, 0.03]} />
          <meshStandardMaterial color="#0b0b10" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Screen Display Face (Emits Status Color) */}
        <mesh position={[0, 0, 0.017]}>
          <planeGeometry args={[1.01, 0.44]} />
          <meshStandardMaterial
            ref={screenRef}
            color="#08080c"
            emissive={statusColor}
            emissiveIntensity={hovered || isSelected ? 1.6 : 0.8}
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* 3. High-Performance Desktop Tower (Right side of desk) */}
      <group position={[0.65, 0.98, -0.1]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.22, 0.44, 0.42]} />
          <meshStandardMaterial color="#0c0d12" metalness={0.7} roughness={0.2} />
        </mesh>
        {/* Glass RGB Side Panel */}
        <mesh position={[-0.112, 0, 0]}>
          <planeGeometry args={[0.4, 0.4]} />
          <meshStandardMaterial
            color="#000000"
            emissive={statusColor}
            emissiveIntensity={0.6}
            transparent
            opacity={0.7}
          />
        </mesh>
        {/* Front Power LED Indicator */}
        <mesh position={[0, 0.18, 0.212]}>
          <sphereGeometry args={[0.01, 8, 8]} />
          <meshBasicMaterial color={statusColor} />
        </mesh>
      </group>

      {/* 4. Mechanical Keyboard */}
      <mesh position={[-0.05, 0.75, 0.12]} receiveShadow>
        <boxGeometry args={[0.45, 0.018, 0.16]} />
        <meshStandardMaterial color="#1e1e24" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* 5. Mouse & Mousepad */}
      <mesh position={[0.3, 0.748, 0.12]} receiveShadow>
        <boxGeometry args={[0.22, 0.005, 0.25]} />
        <meshStandardMaterial color="#0f0f15" roughness={0.9} />
      </mesh>
      <mesh position={[0.3, 0.76, 0.12]} receiveShadow>
        <boxGeometry args={[0.06, 0.02, 0.1]} />
        <meshStandardMaterial color="#22222a" metalness={0.4} roughness={0.3} />
      </mesh>

      {/* 6. Ergonomic Office Chair */}
      <group position={[0, 0, 0.65]} rotation={[0, Math.PI, 0]}>
        {/* Seat Cushion */}
        <mesh position={[0, 0.48, 0]} castShadow>
          <boxGeometry args={[0.48, 0.08, 0.46]} />
          <meshStandardMaterial color="#1c1921" roughness={0.8} />
        </mesh>
        {/* Chair Backrest */}
        <mesh position={[0, 0.8, -0.2]} rotation={[-0.1, 0, 0]} castShadow>
          <boxGeometry args={[0.44, 0.55, 0.05]} />
          <meshStandardMaterial color="#18151c" roughness={0.8} />
        </mesh>
        {/* Chair Central Column */}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.4, 12]} />
          <meshStandardMaterial color="#444" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Wheel Base */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.04, 5]} />
          <meshStandardMaterial color="#222" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* Selection Glow Ring on Floor */}
      {(hovered || isSelected) && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.1, 1.25, 32]} />
          <meshBasicMaterial
            color={isSelected ? '#d49b25' : '#a4773a'}
            side={THREE.DoubleSide}
            transparent
            opacity={0.7}
          />
        </mesh>
      )}
    </group>
  );
}
