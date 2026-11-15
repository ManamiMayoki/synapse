import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function ServerRackMesh({ position = [-12, 0, -8] }) {
  const ledGroupRef = useRef();

  useFrame((state) => {
    if (ledGroupRef.current) {
      // Periodic subtle flicker for activity LEDs
      const t = state.clock.getElapsedTime();
      ledGroupRef.current.children.forEach((child, i) => {
        if (child.material) {
          const blink = Math.sin(t * (10 + i * 3)) > 0 ? 1.5 : 0.2;
          child.material.emissiveIntensity = blink;
        }
      });
    }
  });

  return (
    <group position={position}>
      {/* 42U Server Cabinet Frame */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <boxGeometry args={[1.2, 3.2, 1.0]} />
        <meshStandardMaterial color="#0b0b10" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Perforated Mesh Front Door */}
      <mesh position={[0, 1.6, 0.51]}>
        <planeGeometry args={[1.1, 3.0]} />
        <meshStandardMaterial
          color="#12121c"
          metalness={0.8}
          roughness={0.4}
          wireframe={true}
        />
      </mesh>

      {/* Internal Rack Units / Blade Servers */}
      {[0.6, 1.0, 1.4, 1.8, 2.2, 2.6].map((y, idx) => (
        <group key={idx} position={[0, y, 0.2]}>
          <mesh>
            <boxGeometry args={[1.05, 0.25, 0.7]} />
            <meshStandardMaterial color="#1f1f28" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Status LED Activity Lights Array */}
      <group ref={ledGroupRef} position={[0, 1.8, 0.52]}>
        {[-0.4, -0.2, 0, 0.2, 0.4].map((x, i) => (
          <mesh key={i} position={[x, (i % 3) * 0.4 - 0.4, 0]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshStandardMaterial
              color="#10b981"
              emissive={i % 2 === 0 ? '#10b981' : '#f59e0b'}
              emissiveIntensity={1.0}
            />
          </mesh>
        ))}
      </group>

      {/* Top Heritage Gold Trim Line */}
      <mesh position={[0, 3.21, 0]}>
        <boxGeometry args={[1.22, 0.04, 1.02]} />
        <meshStandardMaterial color="#a4773a" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}
