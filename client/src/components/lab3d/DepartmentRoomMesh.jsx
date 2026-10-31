import React, { useMemo } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import ServerRackMesh from './ServerRackMesh';

// Architectural 3D room twin for each university departmental lab space
export default function DepartmentRoomMesh({
  lab,
  isActive,
  onSelectLab,
}) {
  const [cx, cy, cz] = lab.roomCenter;
  const roomWidth = 15;
  const roomDepth = 17;

  const borderGeometry = useMemo(() => {
    return new THREE.EdgesGeometry(new THREE.PlaneGeometry(roomWidth - 0.2, roomDepth - 0.2));
  }, [roomWidth, roomDepth]);

  return (
    <group position={[cx, cy, cz]}>
      {/* 1. Room Floor Surface (Dark Reflective Carbon Tile) */}
      <mesh
        position={[0, 0.005, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelectLab(lab.id);
        }}
      >
        <planeGeometry args={[roomWidth, roomDepth]} />
        <meshStandardMaterial
          color={isActive ? '#0c0d14' : '#08080c'}
          metalness={0.75}
          roughness={0.3}
        />
      </mesh>

      {/* 2. Room Border Neon Line in Lab Accent Color */}
      <group position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <lineSegments geometry={borderGeometry}>
          <lineBasicMaterial
            color={isActive ? lab.accentColor : '#332408'}
            linewidth={2}
          />
        </lineSegments>
      </group>

      {/* 3. Central Walkway Aisle Separating Column A and Column B */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, roomDepth - 1.5]} />
        <meshStandardMaterial
          color="#0f0f18"
          roughness={0.4}
          metalness={0.8}
        />
      </mesh>

      {/* Glowing Aisle Runway Strips */}
      <mesh position={[-1.1, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.04, roomDepth - 1.5]} />
        <meshBasicMaterial color={lab.accentColor} transparent opacity={0.6} />
      </mesh>
      <mesh position={[1.1, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.04, roomDepth - 1.5]} />
        <meshBasicMaterial color={lab.accentColor} transparent opacity={0.6} />
      </mesh>

      {/* 4. Column A & Column B Tactical Floor Labels */}
      <Html position={[-3.2, 0.05, 6.8]} transform rotation={[-Math.PI / 2, 0, 0]} scale={0.5}>
        <div className="pointer-events-none select-none text-center">
          <span className="px-2 py-0.5 rounded bg-zinc-950/90 border border-white/20 text-[10px] font-mono font-bold tracking-widest text-gold-300">
            COLUMN A • PC-01..04
          </span>
        </div>
      </Html>

      <Html position={[3.2, 0.05, 6.8]} transform rotation={[-Math.PI / 2, 0, 0]} scale={0.5}>
        <div className="pointer-events-none select-none text-center">
          <span className="px-2 py-0.5 rounded bg-zinc-950/90 border border-white/20 text-[10px] font-mono font-bold tracking-widest text-gold-300">
            COLUMN B • PC-05..08
          </span>
        </div>
      </Html>

      {/* 5. Floating Holographic Room Sign above North entrance */}
      <Html position={[0, 4.4, -roomDepth / 2 + 0.5]} center distanceFactor={22} zIndexRange={[90, 0]}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelectLab(lab.id);
          }}
          className={`cursor-pointer transition-all duration-300 select-none flex flex-col items-center group ${
            isActive ? 'scale-105' : 'scale-90 opacity-70 hover:opacity-100'
          }`}
        >
          <div
            className="px-4 py-1.5 rounded-2xl glass-card backdrop-blur-xl border shadow-2xl flex items-center space-x-2.5 transition-all"
            style={{
              borderColor: isActive ? lab.accentColor : 'rgba(212, 155, 37, 0.3)',
              boxShadow: isActive ? `0 0 25px -5px ${lab.accentColor}66` : 'none',
            }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: lab.accentColor }}
            />
            <span className="font-extrabold text-xs tracking-wider text-white">
              {lab.code}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              • {lab.floor}
            </span>
          </div>
          <span className="mt-1 px-2 py-0.5 rounded bg-zinc-950/90 text-[9px] font-mono text-slate-300 border border-white/10">
            {lab.shortName}
          </span>
        </div>
      </Html>

      {/* 6. North Wall: Interactive Presentation Smart Screen & Instructor Podium */}
      <group position={[0, 2.5, -roomDepth / 2 + 0.2]}>
        {/* Smart Screen Bezel */}
        <mesh castShadow>
          <boxGeometry args={[7.2, 3.4, 0.12]} />
          <meshStandardMaterial color="#0a0a0f" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Display Screen Canvas with Cyberpunk/Lab Telemetry */}
        <mesh position={[0, 0, 0.07]}>
          <planeGeometry args={[7.0, 3.2]} />
          <meshStandardMaterial
            color="#08080f"
            emissive={lab.accentColor}
            emissiveIntensity={0.25}
            roughness={0.2}
          />
        </mesh>

        {/* Screen Content Overlay */}
        <Html position={[0, 0, 0.08]} transform scale={0.4} center>
          <div className="w-[680px] h-[310px] p-5 bg-zinc-950/95 border border-gold-500/30 rounded-xl font-mono text-slate-200 select-none flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lab.accentColor }} />
                <span className="font-bold text-xs text-white uppercase tracking-wider">
                  {lab.code} — {lab.name}
                </span>
              </div>
              <span className="text-[11px] text-gold-400 font-semibold">{lab.floor}</span>
            </div>

            {/* Room-specific live dashboard mock */}
            <div className="grid grid-cols-3 gap-3 my-2 text-xs">
              <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-white/5">
                <p className="text-[10px] text-slate-400">Layout Structure</p>
                <p className="text-sm font-bold text-white mt-0.5">2 Columns × 4 PCs</p>
                <p className="text-[10px] text-gold-400">8 Workstations Total</p>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-white/5">
                <p className="text-[10px] text-slate-400">Primary Focus</p>
                <p className="text-xs font-semibold text-white mt-0.5 truncate">
                  {lab.id === 'lab_302' ? 'Thesis & AI CUDA' : lab.id === 'lab_201' ? 'Competitive Programming' : lab.id === 'lab_203' ? 'Software & Database' : 'Digital Logic & Testing'}
                </p>
                <p className="text-[10px] text-emerald-400">Network: 10 GbE SAN</p>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-white/5">
                <p className="text-[10px] text-slate-400">Lab Operational SLA</p>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">99.8% Online</p>
                <p className="text-[10px] text-slate-400">Triage: Real-Time</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-slate-400">
              <span>Synapse 3D Digital Twin • Department of CSE</span>
              <span className="text-gold-300 font-semibold">Click any PC to inspect</span>
            </div>
          </div>
        </Html>
      </group>

      {/* 7. Instructor Smart Podium (Front Center of Room) */}
      <group position={[0, 0.55, -roomDepth / 2 + 2.2]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.4, 1.1, 0.7]} />
          <meshStandardMaterial color="#12121c" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Podium Top Angled Screen */}
        <mesh position={[0, 0.58, 0]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[0.7, 0.04, 0.4]} />
          <meshStandardMaterial
            color="#09090e"
            emissive={lab.accentColor}
            emissiveIntensity={0.6}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* 8. Room-Specific Hardware Units */}
      {lab.id === 'lab_302' && (
        <>
          {/* AI HPC Compute Cluster Server Racks */}
          <ServerRackMesh position={[-roomWidth / 2 + 1.2, 0, -roomDepth / 2 + 1.4]} />
          <ServerRackMesh position={[-roomWidth / 2 + 2.6, 0, -roomDepth / 2 + 1.4]} />
        </>
      )}

      {lab.id === 'lab_201' && (
        <>
          {/* Git & ICPC Local Judge Node */}
          <ServerRackMesh position={[roomWidth / 2 - 1.2, 0, -roomDepth / 2 + 1.4]} />
        </>
      )}

      {lab.id === 'lab_203' && (
        <>
          {/* Database / Virtualization Node */}
          <ServerRackMesh position={[-roomWidth / 2 + 1.2, 0, -roomDepth / 2 + 1.4]} />
        </>
      )}

      {lab.id === 'lab_ec' && (
        <>
          {/* Hardware Electronics Prototyping Bench */}
          <group position={[roomWidth / 2 - 1.4, 0.6, -roomDepth / 2 + 2.5]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.6, 0.8, 3.2]} />
              <meshStandardMaterial color="#1a1a24" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Oscilloscope instrument on bench */}
            <mesh position={[0, 0.55, 0]} castShadow>
              <boxGeometry args={[0.5, 0.35, 0.4]} />
              <meshStandardMaterial
                color="#0f172a"
                emissive="#d49b25"
                emissiveIntensity={0.8}
              />
            </mesh>
          </group>
        </>
      )}

      {/* 9. Glass Partition Walls (Translucent Cyber Glass) */}
      {/* North Wall glass segment */}
      <mesh position={[0, 2.0, -roomDepth / 2]} receiveShadow>
        <boxGeometry args={[roomWidth, 4.0, 0.08]} />
        <meshStandardMaterial
          color="#0d1117"
          transparent
          opacity={0.2}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* West Wall */}
      <mesh position={[-roomWidth / 2, 2.0, 0]} receiveShadow>
        <boxGeometry args={[0.08, 4.0, roomDepth]} />
        <meshStandardMaterial
          color="#0d1117"
          transparent
          opacity={0.15}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* East Wall */}
      <mesh position={[roomWidth / 2, 2.0, 0]} receiveShadow>
        <boxGeometry args={[0.08, 4.0, roomDepth]} />
        <meshStandardMaterial
          color="#0d1117"
          transparent
          opacity={0.15}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* South Wall with Center Entrance Door Gap */}
      <mesh position={[-roomWidth / 4 - 0.7, 2.0, roomDepth / 2]} receiveShadow>
        <boxGeometry args={[roomWidth / 2 - 1.4, 4.0, 0.08]} />
        <meshStandardMaterial
          color="#0d1117"
          transparent
          opacity={0.2}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      <mesh position={[roomWidth / 4 + 0.7, 2.0, roomDepth / 2]} receiveShadow>
        <boxGeometry args={[roomWidth / 2 - 1.4, 4.0, 0.08]} />
        <meshStandardMaterial
          color="#0d1117"
          transparent
          opacity={0.2}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Ceiling LED Light Tubes */}
      {[-4.5, -1.5, 1.5, 4.5].map((z, idx) => (
        <group key={idx} position={[0, 4.8, z]}>
          <mesh>
            <boxGeometry args={[roomWidth - 3, 0.04, 0.08]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#f8fafc"
              emissiveIntensity={1.2}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
