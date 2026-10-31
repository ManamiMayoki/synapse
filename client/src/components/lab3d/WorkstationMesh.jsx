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

  if (!station || !station.pcId) return null;

  // Status & allocation resolution
  const isNeedsRepair = station.status === 'Needs Repair' || station.status === 'faulty';
  const isFixed = station.status === 'Fixed';
  const isClaimed = Boolean(station.allocatedTo && station.allocatedTo.tag);
  const isVacant = !isClaimed;

  // Status screen & LED color (Vibrant cyber colors)
  const statusColor = isNeedsRepair
    ? '#ef4444' // Vibrant Red (Needs Repair)
    : isFixed
    ? '#06b6d4' // Electric Cyan (Fixed)
    : isClaimed
    ? '#f59e0b' // Regal Gold (Claimed seat)
    : '#10b981'; // Cyber Emerald Green (Working)

  // Pulsing animation for Needs Repair stations
  useFrame((state) => {
    if (screenRef.current && isNeedsRepair) {
      const t = state.clock.getElapsedTime();
      const intensity = 1.8 + Math.sin(t * 5) * 0.9;
      screenRef.current.emissiveIntensity = intensity;
    }
  });

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
      {/* 1. Large Computer Desk Top (Scaled up for prominence) */}
      <mesh position={[0, 0.82, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.06, 0.95]} />
        <meshStandardMaterial
          color={hovered || isSelected ? '#33230c' : '#14141c'}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Desk Metallic Steel Frame Legs */}
      {[-0.9, 0.9].map((x, i) =>
        [-0.38, 0.38].map((z, j) => (
          <mesh key={`${i}-${j}`} position={[x, 0.41, z]} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.82, 16]} />
            <meshStandardMaterial color="#2d2d3a" metalness={0.9} roughness={0.2} />
          </mesh>
        ))
      )}

      {/* 2. Large High-Resolution Monitor with Glowing Cyber Screen */}
      <group position={[0, 1.25, -0.22]}>
        {/* Base */}
        <mesh position={[0, -0.36, 0]}>
          <cylinderGeometry args={[0.15, 0.18, 0.025, 16]} />
          <meshStandardMaterial color="#1a1a24" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Pillar Stand */}
        <mesh position={[0, -0.16, 0]}>
          <boxGeometry args={[0.04, 0.38, 0.04]} />
          <meshStandardMaterial color="#1a1a24" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Screen Bezel */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[1.3, 0.62, 0.04]} />
          <meshStandardMaterial color="#0b0b12" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Glowing Display Screen (Primary visual status indicator) */}
        <mesh position={[0, 0, 0.022]}>
          <planeGeometry args={[1.24, 0.56]} />
          <meshStandardMaterial
            ref={screenRef}
            color="#08080c"
            emissive={statusColor}
            emissiveIntensity={hovered || isSelected ? 2.6 : 1.6}
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* 3. Gaming/Workstation Desktop Tower Chassis */}
      <group position={[0.72, 1.12, -0.1]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.26, 0.52, 0.46]} />
          <meshStandardMaterial color="#0b0c12" metalness={0.7} roughness={0.2} />
        </mesh>
        {/* RGB Glass Side Window */}
        <mesh position={[-0.132, 0, 0]}>
          <planeGeometry args={[0.42, 0.44]} />
          <meshStandardMaterial
            color="#000000"
            emissive={statusColor}
            emissiveIntensity={1.0}
            transparent
            opacity={0.85}
          />
        </mesh>
        {/* Top Emergency / Status LED Beacon */}
        <mesh position={[0, 0.27, 0]}>
          <sphereGeometry args={[0.03, 12, 12]} />
          <meshBasicMaterial color={statusColor} />
        </mesh>
      </group>

      {/* 4. Mechanical Keyboard */}
      <mesh position={[-0.05, 0.86, 0.14]} receiveShadow>
        <boxGeometry args={[0.55, 0.02, 0.18]} />
        <meshStandardMaterial color="#1e1e28" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* 5. Gaming Mouse & Mousepad */}
      <mesh position={[0.38, 0.855, 0.14]} receiveShadow>
        <boxGeometry args={[0.26, 0.006, 0.28]} />
        <meshStandardMaterial color="#0e0e16" roughness={0.9} />
      </mesh>
      <mesh position={[0.38, 0.87, 0.14]} receiveShadow>
        <boxGeometry args={[0.07, 0.022, 0.12]} />
        <meshStandardMaterial color="#252532" metalness={0.4} roughness={0.3} />
      </mesh>

      {/* 6. Ergonomic Mesh Lab Chair */}
      <group position={[0, 0, 0.72]} rotation={[0, Math.PI, 0]}>
        {/* Seat Cushion */}
        <mesh position={[0, 0.52, 0]} castShadow>
          <boxGeometry args={[0.54, 0.08, 0.5]} />
          <meshStandardMaterial color={isClaimed ? '#2a1e0c' : '#181620'} roughness={0.8} />
        </mesh>
        {/* Chair Backrest */}
        <mesh position={[0, 0.86, -0.22]} rotation={[-0.1, 0, 0]} castShadow>
          <boxGeometry args={[0.48, 0.6, 0.06]} />
          <meshStandardMaterial color={isClaimed ? '#3b290e' : '#14121a'} roughness={0.8} />
        </mesh>
        {/* Chair Central Column */}
        <mesh position={[0, 0.26, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.46, 12]} />
          <meshStandardMaterial color="#444" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* 5-Star Wheel Base */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.04, 5]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* 7. Floor Selection / Beacon Glow Ring */}
      {(hovered || isSelected || (unallocatedOnly && isVacant) || isNeedsRepair) && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.1, 1.28, 32]} />
          <meshBasicMaterial
            color={
              isSelected ? '#d49b25' :
              isNeedsRepair ? '#ef4444' :
              (unallocatedOnly && isVacant) ? '#10b981' :
              '#d49b25'
            }
            side={THREE.DoubleSide}
            transparent
            opacity={unallocatedOnly && isVacant ? 0.9 : 0.7}
          />
        </mesh>
      )}

      {/* 8. Interactive Tooltip - ONLY shown on Hover or Selection (No clutter / overlapping in normal mode!) */}
      {(hovered || isSelected) && (
        <Html position={[0, 2.3, 0]} center zIndexRange={[100, 0]}>
          <div className="pointer-events-none select-none flex flex-col items-center animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-1.5 rounded-xl bg-zinc-950/98 border border-gold-500/60 shadow-2xl backdrop-blur-xl flex flex-col items-center min-w-[140px] text-center">
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${isNeedsRepair ? 'bg-rose-500 animate-ping' : isClaimed ? 'bg-gold-400' : 'bg-emerald-400'}`} />
                <span className="font-extrabold text-white text-xs font-mono">{displayLabel}</span>
              </div>

              <div className="mt-1 flex items-center space-x-1.5 text-[10px] font-mono">
                <span className={`font-bold ${isNeedsRepair ? 'text-rose-400' : isFixed ? 'text-cyan-400' : 'text-emerald-400'}`}>
                  {station.status || 'Working'}
                </span>
                <span>•</span>
                {isClaimed && station.allocatedTo?.tag ? (
                  <span className="text-gold-300 font-extrabold bg-gold-950/90 px-1.5 py-0.2 rounded border border-gold-500/40">
                    [{station.allocatedTo.tag}]
                  </span>
                ) : (
                  <span className="text-emerald-300">Vacant</span>
                )}
              </div>

              {isClaimed && station.allocatedTo?.studentName && (
                <p className="text-[9px] text-slate-300 truncate max-w-[130px] mt-0.5">
                  {station.allocatedTo.studentName}
                </p>
              )}

              <p className="text-[8px] text-gold-400/80 mt-1 uppercase tracking-wider font-semibold">
                Click to inspect & ticket
              </p>
            </div>
          </div>
        </Html>
      )}

    </group>
  );
}
