import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export default function WorkstationMesh({
  station,
  isSelected,
  onSelect,
  unallocatedOnly = false,
  rotation = [0, 0, 0],
}) {
  const groupRef = useRef();
  const screenRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Status & allocation resolution
  const isNeedsRepair = station.status === 'Needs Repair' || station.status === 'faulty';
  const isFixed = station.status === 'Fixed';
  const isClaimed = Boolean(station.allocatedTo && station.allocatedTo.tag);
  const isVacant = !isClaimed;

  // Status screen & LED color
  const statusColor = isNeedsRepair
    ? '#e11d48' // Red / Crimson (Needs Repair)
    : isFixed
    ? '#06b6d4' // Cyan / Electric Blue (Fixed)
    : isClaimed
    ? '#d49b25' // Gold (Claimed seat)
    : '#10b981'; // Cyber Green (Working)

  // Pulsing animation for Needs Repair stations
  useFrame((state) => {
    if (screenRef.current && isNeedsRepair) {
      const t = state.clock.getElapsedTime();
      const intensity = 1.4 + Math.sin(t * 4) * 0.7;
      screenRef.current.emissiveIntensity = intensity;
    }
  });

  // Display floating tag only when relevant to maintain clean uncluttered 3D view
  const showMarker = hovered || isSelected || isNeedsRepair || isClaimed || (unallocatedOnly && isVacant);

  const displayLabel = station.displayId || station.pcId || station.id;

  return (
    <group
      ref={groupRef}
      position={station.position || [0, 0, 0]}
      rotation={rotation}
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
      {/* 3D Holographic Indicator - only shown when needed */}
      {showMarker && (
        <Html position={[0, 2.1, 0]} center distanceFactor={14} zIndexRange={[80, 0]}>
          <div
            className={`pointer-events-none select-none flex flex-col items-center transition-all duration-200 ${
              hovered || isSelected ? 'scale-110 z-30' : 'scale-90 opacity-90'
            }`}
          >
            <div
              className={`px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold tracking-wider shadow-lg flex items-center space-x-1 backdrop-blur-md ${
                isNeedsRepair
                  ? 'bg-maroon-950/95 text-rose-300 border-rose-500/80 shadow-glow-maroon'
                  : isClaimed
                  ? 'bg-zinc-950/95 text-gold-300 border-gold-500/70 shadow-sm'
                  : isFixed
                  ? 'bg-cyan-950/95 text-cyan-300 border-cyan-500/70'
                  : (unallocatedOnly && isVacant)
                  ? 'bg-emerald-950/95 text-emerald-300 border-emerald-400 shadow-md ring-1 ring-emerald-400/50'
                  : 'bg-zinc-950/90 text-emerald-300 border-emerald-500/40'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isNeedsRepair
                    ? 'bg-rose-500 animate-ping'
                    : isClaimed
                    ? 'bg-gold-400'
                    : isFixed
                    ? 'bg-cyan-400'
                    : 'bg-emerald-400'
                }`}
              />
              <span className="text-white font-bold">{displayLabel}</span>
              {isClaimed && (
                <>
                  <span className="text-gold-400">•</span>
                  <span className="text-gold-300 font-extrabold">{station.allocatedTo.tag}</span>
                </>
              )}
              {isNeedsRepair && (
                <>
                  <span className="text-rose-400">•</span>
                  <span className="text-rose-300 uppercase text-[8px]">Repair</span>
                </>
              )}
              {unallocatedOnly && isVacant && (
                <>
                  <span className="text-emerald-400">•</span>
                  <span className="text-emerald-300 uppercase text-[8px]">Open</span>
                </>
              )}
            </div>

            {/* Quick hover info preview */}
            {hovered && (
              <div className="mt-1 px-2 py-1 rounded-lg bg-zinc-950/95 border border-gold-500/40 text-[9px] text-slate-200 text-center shadow-2xl backdrop-blur-md max-w-[150px]">
                <p className="font-bold text-gold-300 font-mono">{station.pcId || station.id}</p>
                <p className="text-slate-300">
                  {isClaimed ? `Claimed: ${station.allocatedTo.studentName || station.allocatedTo.tag}` : 'Status: Vacant'}
                </p>
                <p className={`font-semibold ${isNeedsRepair ? 'text-rose-400' : isFixed ? 'text-cyan-400' : 'text-emerald-400'}`}>
                  {station.status || 'Working'}
                </p>
              </div>
            )}
          </div>
        </Html>
      )}

      {/* 1. Computer Desk Top */}
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.05, 0.8]} />
        <meshStandardMaterial
          color={hovered || isSelected ? '#2a1e0b' : '#141419'}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Desk Metallic Steel Legs */}
      <mesh position={[-0.68, 0.35, 0.3]} castShadow>
        <boxGeometry args={[0.04, 0.7, 0.04]} />
        <meshStandardMaterial color="#2d2d38" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.68, 0.35, 0.3]} castShadow>
        <boxGeometry args={[0.04, 0.7, 0.04]} />
        <meshStandardMaterial color="#2d2d38" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[-0.68, 0.35, -0.3]} castShadow>
        <boxGeometry args={[0.04, 0.7, 0.04]} />
        <meshStandardMaterial color="#2d2d38" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.68, 0.35, -0.3]} castShadow>
        <boxGeometry args={[0.04, 0.7, 0.04]} />
        <meshStandardMaterial color="#2d2d38" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* 2. Monitor Stand & Screen */}
      <group position={[0, 1.05, -0.18]}>
        {/* Base */}
        <mesh position={[0, -0.28, 0]}>
          <cylinderGeometry args={[0.1, 0.12, 0.02, 16]} />
          <meshStandardMaterial color="#1a1a24" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Pillar */}
        <mesh position={[0, -0.12, 0]}>
          <boxGeometry args={[0.03, 0.3, 0.03]} />
          <meshStandardMaterial color="#1a1a24" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Bezel */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.88, 0.44, 0.03]} />
          <meshStandardMaterial color="#0b0b10" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Glowing Display Screen */}
        <mesh position={[0, 0, 0.016]}>
          <planeGeometry args={[0.84, 0.4]} />
          <meshStandardMaterial
            ref={screenRef}
            color="#08080c"
            emissive={statusColor}
            emissiveIntensity={hovered || isSelected ? 1.6 : 0.9}
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* 3. Desktop Tower Chassis */}
      <group position={[0.55, 0.95, -0.08]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.18, 0.4, 0.38]} />
          <meshStandardMaterial color="#0c0d12" metalness={0.7} roughness={0.2} />
        </mesh>
        {/* RGB Glass Panel */}
        <mesh position={[-0.091, 0, 0]}>
          <planeGeometry args={[0.34, 0.34]} />
          <meshStandardMaterial
            color="#000000"
            emissive={statusColor}
            emissiveIntensity={0.6}
            transparent
            opacity={0.8}
          />
        </mesh>
        {/* Front Power LED */}
        <mesh position={[0, 0.16, 0.191]}>
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshBasicMaterial color={statusColor} />
        </mesh>
      </group>

      {/* 4. Keyboard & Mouse */}
      <mesh position={[-0.05, 0.75, 0.1]} receiveShadow>
        <boxGeometry args={[0.42, 0.015, 0.15]} />
        <meshStandardMaterial color="#1e1e24" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[0.26, 0.752, 0.1]} receiveShadow>
        <boxGeometry args={[0.06, 0.018, 0.1]} />
        <meshStandardMaterial color="#22222a" metalness={0.4} roughness={0.3} />
      </mesh>

      {/* 5. Ergonomic Lab Chair */}
      <group position={[0, 0, 0.55]} rotation={[0, Math.PI, 0]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[0.42, 0.07, 0.4]} />
          <meshStandardMaterial color={isClaimed ? '#261c0d' : '#17151c'} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.74, -0.17]} rotation={[-0.1, 0, 0]} castShadow>
          <boxGeometry args={[0.38, 0.48, 0.05]} />
          <meshStandardMaterial color={isClaimed ? '#38280f' : '#141217'} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.23, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.38, 12]} />
          <meshStandardMaterial color="#333" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.03, 5]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* 6. Floor Selection / Unallocated Beacon Ring */}
      {(hovered || isSelected || (unallocatedOnly && isVacant) || isNeedsRepair) && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.85, 0.98, 32]} />
          <meshBasicMaterial
            color={
              isSelected ? '#d49b25' :
              isNeedsRepair ? '#e11d48' :
              (unallocatedOnly && isVacant) ? '#10b981' :
              '#a4773a'
            }
            side={THREE.DoubleSide}
            transparent
            opacity={unallocatedOnly && isVacant ? 0.9 : 0.6}
          />
        </mesh>
      )}
    </group>
  );
}
