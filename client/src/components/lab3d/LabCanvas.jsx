import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import WorkstationMesh from './WorkstationMesh';
import ServerRackMesh from './ServerRackMesh';
import WorkstationModal from './WorkstationModal';
import LabControls from './LabControls';
import TacticalFloorPlan from './TacticalFloorPlan';
import { useLabData } from '../../context/LabDataContext';
import { Loader2 } from 'lucide-react';

// Camera controller component that responds to camera presets and station clicks using GSAP
function CameraController({ targetPosition, targetLookAt, controlsRef }) {
  const { camera } = useThree();

  useEffect(() => {
    if (!targetPosition || !controlsRef.current) return;

    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(controlsRef.current.target);

    // Animate camera position
    gsap.to(camera.position, {
      x: targetPosition[0],
      y: targetPosition[1],
      z: targetPosition[2],
      duration: 1.4,
      ease: 'power2.inOut',
    });

    // Animate orbit controls target
    if (targetLookAt) {
      gsap.to(controlsRef.current.target, {
        x: targetLookAt[0],
        y: targetLookAt[1],
        z: targetLookAt[2],
        duration: 1.4,
        ease: 'power2.inOut',
        onUpdate: () => controlsRef.current.update(),
      });
    }
  }, [targetPosition, targetLookAt, camera, controlsRef]);

  return null;
}

// 3D Scene content
function Scene({
  workstations,
  activeFilter,
  selectedStation,
  onSelectStation,
  cameraTarget,
  controlsRef,
}) {
  return (
    <>
      <CameraController
        targetPosition={cameraTarget.position}
        targetLookAt={cameraTarget.lookAt}
        controlsRef={controlsRef}
      />

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        maxPolarAngle={Math.PI / 2.1} // Prevent going below floor
        minDistance={4}
        maxDistance={35}
      />

      {/* Lighting Rig */}
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[10, 18, 12]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      
      {/* Heritage Maroon Accent Spotlights */}
      <spotLight
        position={[-12, 8, -8]}
        intensity={2.5}
        color="#800000"
        angle={0.6}
        penumbra={0.8}
      />
      {/* Regal Gold Accent Spotlights */}
      <spotLight
        position={[12, 8, 8]}
        intensity={2.5}
        color="#d49b25"
        angle={0.6}
        penumbra={0.8}
      />

      {/* Lab Room Floor (Dark Ceramic / Reflective Carbon Tiles) */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[42, 34]} />
        <meshStandardMaterial
          color="#08080c"
          metalness={0.8}
          roughness={0.25}
        />
      </mesh>

      {/* Floor Grid Lines */}
      <gridHelper args={[40, 40, '#a4773a', '#1e1e28']} position={[0, 0.001, 0]} />

      {/* Ceiling Neon Light Beams (Aesthetic Lab Fixtures) */}
      {[-8, -2.5, 3, 8.5].map((z, idx) => (
        <group key={idx} position={[0, 5, z]}>
          <mesh>
            <boxGeometry args={[26, 0.06, 0.08]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#e2e8f0"
              emissiveIntensity={1.5}
            />
          </mesh>
        </group>
      ))}

      {/* Server Racks in Corner */}
      <ServerRackMesh position={[-14, 0, -10]} />
      <ServerRackMesh position={[-12.5, 0, -10]} />
      <ServerRackMesh position={[-14, 0, -8.5]} />

      {/* Glass Partition Wall (North Wall) */}
      <mesh position={[0, 2.5, -14]} receiveShadow>
        <boxGeometry args={[36, 5, 0.1]} />
        <meshStandardMaterial
          color="#0d1117"
          transparent
          opacity={0.3}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Render 24 Workstations */}
      {workstations.map((station) => {
        const isVisible =
          activeFilter === 'all' || station.status === activeFilter;

        if (!isVisible) return null;

        return (
          <WorkstationMesh
            key={station.id}
            station={station}
            isSelected={selectedStation?.id === station.id}
            onSelect={onSelectStation}
          />
        );
      })}

      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.6}
        scale={35}
        blur={1.5}
        far={6}
      />
    </>
  );
}

export default function LabCanvas() {
  const { workstations, selectedStation, setSelectedStationId } = useLabData();
  const [activeFilter, setActiveFilter] = useState('all');
  const [is2DView, setIs2DView] = useState(false);
  const controlsRef = useRef();

  // Camera presets
  const presets = {
    isometric: { position: [0, 16, 20], lookAt: [0, 0, 0] },
    row1: { position: [0, 6, -8], lookAt: [0, 0, -6.3] },
    row2: { position: [0, 6, -3], lookAt: [0, 0, -2.1] },
    row3: { position: [0, 6, 3], lookAt: [0, 0, 2.1] },
    row4: { position: [0, 6, 8], lookAt: [0, 0, 6.3] },
    topdown: { position: [0, 28, 0.1], lookAt: [0, 0, 0] },
  };

  const [cameraTarget, setCameraTarget] = useState(presets.isometric);

  const handleSetCameraPreset = (presetKey) => {
    if (presets[presetKey]) {
      setCameraTarget(presets[presetKey]);
    }
  };

  const handleSelectStation = (station) => {
    if (!station) {
      setSelectedStationId(null);
      return;
    }
    setSelectedStationId(station.id);

    // Zoom camera towards selected station
    setCameraTarget({
      position: [station.position[0], station.position[1] + 3.2, station.position[2] + 4.5],
      lookAt: [station.position[0], station.position[1] + 0.8, station.position[2]],
    });
  };

  const handleSelectStationById = (stationId) => {
    const found = workstations.find((w) => w.id === stationId);
    if (found) {
      handleSelectStation(found);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-zinc-975 overflow-hidden select-none">
      
      {/* Interactive Controls Overlay */}
      <LabControls
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        selectedStationId={selectedStation?.id}
        onSelectStationId={handleSelectStationById}
        workstations={workstations}
        onSetCameraPreset={handleSetCameraPreset}
        is2DView={is2DView}
        setIs2DView={setIs2DView}
      />

      {/* Visual Workspace: 3D Canvas or 2D Tactical Plan */}
      {is2DView ? (
        <TacticalFloorPlan
          workstations={workstations}
          onSelectStation={handleSelectStation}
          activeFilter={activeFilter}
        />
      ) : (
        <div className="canvas-container w-full h-full">
          <Canvas
            shadows
            camera={{ position: [0, 16, 20], fov: 45 }}
            gl={{ antialias: true, alpha: false }}
          >
            <Suspense
              fallback={
                null
              }
            >
              <Scene
                workstations={workstations}
                activeFilter={activeFilter}
                selectedStation={selectedStation}
                onSelectStation={handleSelectStation}
                cameraTarget={cameraTarget}
                controlsRef={controlsRef}
              />
            </Suspense>
          </Canvas>
        </div>
      )}

      {/* Floating Instructions Pill (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none hidden sm:block">
        <div className="glass-panel px-3.5 py-2 rounded-xl text-[11px] text-slate-400 border-white/10 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse"></span>
          <span>
            <strong>Interactive Mode:</strong> Click any workstation to inspect specs, report issues, or checkout gear.
          </span>
        </div>
      </div>

      {/* Workstation Details & Ticket Submission Modal */}
      {selectedStation && (
        <WorkstationModal
          station={selectedStation}
          onClose={() => setSelectedStationId(null)}
        />
      )}
    </div>
  );
}
