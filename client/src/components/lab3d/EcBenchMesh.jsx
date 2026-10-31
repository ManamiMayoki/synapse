import React, { useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import WorkstationMesh from './WorkstationMesh';

export default function EcBenchMesh({
  table,
  pcStation,
  isSelected,
  onSelectStation,
  onSelectBench,
  unallocatedOnly,
}) {
  const [hovered, setHovered] = useState(false);

  if (!table) return null;

  // Position based on row (1..4) and col (1..2)
  const r = table.row || 1;
  const c = table.col || 1;
  const spacingX = 6.2;
  const spacingZ = 4.8;
  const posX = (c - 1.5) * spacingX;
  const posZ = (r - 2.5) * spacingZ;

  const hasPc = Boolean(table.hasPc && pcStation);

  return (
    <group position={[posX, 0, posZ]}>
      {/* Bench Table Top (Dark Hardwood / Lab Laminate) */}
      <mesh
        position={[0, 0.72, 0]}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelectBench(table);
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
        <boxGeometry args={[3.2, 0.08, 1.2]} />
        <meshStandardMaterial
          color={hovered ? '#261b0c' : '#14141c'}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* Bench Metallic Steel Frame Legs */}
      {[-1.45, 1.45].map((x, i) =>
        [-0.48, 0.48].map((z, j) => (
          <mesh key={`${i}-${j}`} position={[x, 0.35, z]} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.7, 16]} />
            <meshStandardMaterial color="#33333f" metalness={0.9} roughness={0.2} />
          </mesh>
        ))
      )}

      {/* Bench Floating Hologram Label - ONLY on hover or selection to keep normal mode pristine */}
      {(hovered || isSelected) && (
        <Html position={[0, 1.7, 0]} center zIndexRange={[70, 0]}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelectBench(table);
            }}
            className="cursor-pointer select-none flex flex-col items-center animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="px-3 py-1.5 rounded-xl border border-gold-500/60 bg-zinc-950/98 text-gold-300 font-mono text-[10px] font-bold shadow-2xl flex items-center space-x-1.5 backdrop-blur-xl">
              <span className="w-2 h-2 rounded-full bg-gold-400" />
              <span>{table.tableId || `Table-${table.row}${table.col}`}</span>
              {hasPc && (
                <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 text-[8px] font-extrabold uppercase">
                  PC Online
                </span>
              )}
            </div>
            <div className="mt-1 px-2.5 py-1 rounded-lg bg-zinc-950/98 border border-gold-500/30 text-[9px] text-slate-300 text-center shadow-xl backdrop-blur-md">
              <p className="font-bold text-white">{table.label}</p>
              <p className="text-gold-300/90 font-mono">
                {table.equipment?.breadboards || 4} Breadboards • {table.equipment?.voltageMeters || 2} Meters
              </p>
              <p className="text-slate-400 text-[8px] mt-0.5">Click to configure bench gear</p>
            </div>
          </div>
        </Html>
      )}

      {/* Equipment Shelf Layer */}
      <mesh position={[0, 1.05, -0.42]}>
        <boxGeometry args={[3.0, 0.04, 0.32]} />
        <meshStandardMaterial color="#0c0d12" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Digital Oscilloscope on Shelf */}
      <group position={[-0.9, 1.22, -0.42]}>
        <mesh castShadow>
          <boxGeometry args={[0.55, 0.3, 0.22]} />
          <meshStandardMaterial color="#1a1c24" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Oscilloscope Screen (Glowing Cyan Waveform) */}
        <mesh position={[0, 0, 0.112]}>
          <planeGeometry args={[0.42, 0.22]} />
          <meshStandardMaterial
            color="#04121a"
            emissive="#06b6d4"
            emissiveIntensity={0.8}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Dual Voltmeter / Ammeter Module */}
      <group position={[0.9, 1.2, -0.42]}>
        <mesh castShadow>
          <boxGeometry args={[0.45, 0.26, 0.2]} />
          <meshStandardMaterial color="#12131a" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Voltmeter LED Display (Red) */}
        <mesh position={[-0.1, 0.04, 0.102]}>
          <planeGeometry args={[0.16, 0.08]} />
          <meshStandardMaterial color="#1a0404" emissive="#ef4444" emissiveIntensity={1.2} />
        </mesh>
        {/* Ammeter LED Display (Green) */}
        <mesh position={[0.1, 0.04, 0.102]}>
          <planeGeometry args={[0.16, 0.08]} />
          <meshStandardMaterial color="#041a08" emissive="#10b981" emissiveIntensity={1.2} />
        </mesh>
      </group>

      {/* Solderless Prototyping Breadboards on Bench Surface */}
      <group position={[-0.6, 0.77, 0.1]}>
        <mesh receiveShadow>
          <boxGeometry args={[0.4, 0.02, 0.18]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.6} />
        </mesh>
      </group>
      <group position={[-0.1, 0.77, 0.1]}>
        <mesh receiveShadow>
          <boxGeometry args={[0.4, 0.02, 0.18]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.6} />
        </mesh>
      </group>

      {/* If this bench has a PC (Bench 1 or Bench 8): Render the 3D Workstation Mesh */}
      {hasPc && (
        <group position={[0.55, 0, 0.1]}>
          <WorkstationMesh
            station={pcStation}
            isSelected={isSelected}
            onSelect={onSelectStation}
            unallocatedOnly={unallocatedOnly}
          />
        </group>
      )}

      {/* Selection Glow on Floor */}
      {(hovered || isSelected) && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.8, 2.0, 32]} />
          <meshBasicMaterial
            color={isSelected ? '#d49b25' : '#a4773a'}
            side={THREE.DoubleSide}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
    </group>
  );
}
