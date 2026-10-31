import React, { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import RoomSelector from './RoomSelector';
import WorkstationMesh from './WorkstationMesh';
import EcBenchMesh from './EcBenchMesh';
import ServerRackMesh from './ServerRackMesh';
import WorkstationModal from './WorkstationModal';
import EcLabView from './EcLabView';
import ComputerLabGrid from './ComputerLabGrid';
import { ClaimSeatModal, TeacherExamModal } from './SeatingModals';
import Modal from '../common/Modal';
import { useLabData } from '../../context/LabDataContext';
import { 
  Plus, 
  Minus,
  RotateCcw
} from 'lucide-react';

// Smooth GSAP Camera Controller
function CameraController({ targetPosition, targetLookAt, controlsRef }) {
  const { camera } = useThree();

  useEffect(() => {
    if (!targetPosition || !controlsRef?.current) return;

    const controls = controlsRef.current;
    if (!controls?.target) return;

    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(controls.target);

    // Animate camera position smoothly
    gsap.to(camera.position, {
      x: targetPosition[0],
      y: targetPosition[1],
      z: targetPosition[2],
      duration: 1.1,
      ease: 'power2.inOut',
    });

    // Animate orbit controls target
    if (targetLookAt && Array.isArray(targetLookAt)) {
      gsap.to(controls.target, {
        x: targetLookAt[0],
        y: targetLookAt[1],
        z: targetLookAt[2],
        duration: 1.1,
        ease: 'power2.inOut',
        onUpdate: () => {
          try {
            controlsRef.current?.update?.();
          } catch {
            // Ignore during unmount transitions
          }
        },
      });
    }

    return () => {
      gsap.killTweensOf(camera.position);
      if (controls?.target) {
        gsap.killTweensOf(controls.target);
      }
    };
  }, [
    targetPosition?.[0],
    targetPosition?.[1],
    targetPosition?.[2],
    targetLookAt?.[0],
    targetLookAt?.[1],
    targetLookAt?.[2],
    camera,
    controlsRef
  ]);

  return null;
}

// 3D Department Lab Scene (Full Viewport)
function Scene({
  activeRoomId,
  activeRoom,
  workstations,
  ecTables,
  unallocatedOnly,
  statusFilter,
  searchQuery,
  selectedStation,
  onSelectStation,
  onSelectBench,
  cameraTarget,
  controlsRef,
}) {
  const isEcLab = activeRoomId === 'lab_101';

  // Compute 3D positions for the 128 computer lab workstations (8 rows x 4 columns = 32 pods x 4 PCs)
  const positionedWorkstations = useMemo(() => {
    const list = Array.isArray(workstations) ? workstations : [];
    if (isEcLab) {
      return list;
    }

    const spacingX = 5.2;
    const spacingZ = 4.0;

    return list.map((ws) => {
      if (!ws) return {};
      const r = ws.slotRow || 1;
      const c = ws.slotCol || 1;
      const p = ws.pcIndex || 1;

      // Central walkway aisle separating Column 2 and Column 3
      const aisleOffsetX = c <= 2 ? -1.3 : 1.3;
      const podCenterX = (c - 2.5) * spacingX + aisleOffsetX;
      const podCenterZ = (r - 4.5) * spacingZ;

      let pcOffsetX = -1.05;
      let pcOffsetZ = -0.58;
      let rotY = 0;

      if (p === 1) {
        pcOffsetX = -1.05;
        pcOffsetZ = -0.58;
        rotY = 0;
      } else if (p === 2) {
        pcOffsetX = 1.05;
        pcOffsetZ = -0.58;
        rotY = 0;
      } else if (p === 3) {
        pcOffsetX = -1.05;
        pcOffsetZ = 0.58;
        rotY = Math.PI;
      } else {
        pcOffsetX = 1.05;
        pcOffsetZ = 0.58;
        rotY = Math.PI;
      }

      return {
        ...ws,
        position: [podCenterX + pcOffsetX, 0, podCenterZ + pcOffsetZ],
        rotation: [0, rotY, 0],
      };
    });
  }, [workstations, isEcLab]);

  // Filter stations based on status filter & search query
  const visibleWorkstations = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    const list = Array.isArray(positionedWorkstations) ? positionedWorkstations : [];
    return list.filter((ws) => {
      if (!ws || !ws.pcId) return false;
      if (statusFilter !== 'All') {
        if (statusFilter === 'Working') {
          if (ws.status !== 'Working' && ws.status !== 'Fixed') return false;
        } else if (ws.status !== statusFilter) {
          return false;
        }
      }
      if (q) {
        const idMatch = (ws.pcId || '').toLowerCase().includes(q);
        const tagMatch = (ws.allocatedTo?.tag || '').toLowerCase().includes(q);
        const nameMatch = (ws.allocatedTo?.studentName || '').toLowerCase().includes(q);
        if (!idMatch && !tagMatch && !nameMatch) return false;
      }
      return true;
    });
  }, [positionedWorkstations, statusFilter, searchQuery]);

  // Map of PC stations for EC Lab Benches
  const ecPcMap = useMemo(() => {
    const map = {};
    const list = Array.isArray(workstations) ? workstations : [];
    list.forEach((w) => {
      if (w && w.pcId) {
        map[w.pcId] = w;
      }
    });
    return map;
  }, [workstations]);

  return (
    <>
      <CameraController
        targetPosition={cameraTarget.position}
        targetLookAt={cameraTarget.lookAt}
        controlsRef={controlsRef}
      />

      <OrbitControls
        ref={controlsRef}
        enableZoom={true}
        zoomSpeed={1.5}
        minDistance={2}
        maxDistance={65}
        enablePan={true}
        panSpeed={1.4}
        enableRotate={true}
        rotateSpeed={0.85}
        maxPolarAngle={Math.PI / 2.05} // Prevent camera going under the floor
        minPolarAngle={0.05}
        enableDamping={true}
        dampingFactor={0.07}
      />

      {/* Lighting Rig */}
      <ambientLight intensity={1.0} />
      <directionalLight
        position={[14, 24, 16]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />

      {/* Heritage Maroon and Regal Gold Spotlights */}
      <spotLight
        position={[-16, 14, -14]}
        intensity={2.6}
        color="#800000"
        angle={0.7}
        penumbra={0.8}
      />
      <spotLight
        position={[16, 14, 14]}
        intensity={2.6}
        color="#d49b25"
        angle={0.7}
        penumbra={0.8}
      />

      {/* Lab Room Floor: Dark Reflective Carbon Ceramic Tiles */}
      <mesh
        position={[0, -0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onClick={() => onSelectStation(null)}
      >
        <planeGeometry args={[isEcLab ? 30 : 34, isEcLab ? 36 : 44]} />
        <meshStandardMaterial
          color="#060609"
          metalness={0.85}
          roughness={0.22}
        />
      </mesh>

      {/* Floor Grid Lines */}
      <gridHelper
        args={[isEcLab ? 30 : 34, isEcLab ? 30 : 34, '#a4773a', '#171722']}
        position={[0, 0.001, 0]}
      />

      {/* Ceiling Neon Light Fixture Beams */}
      {[-14, -7, 0, 7, 14].map((z, idx) => (
        <group key={idx} position={[0, 6.2, z]}>
          <mesh>
            <boxGeometry args={[isEcLab ? 26 : 30, 0.08, 0.1]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#f1f5f9"
              emissiveIntensity={2.0}
            />
          </mesh>
        </group>
      ))}

      {/* North Wall: 4K Smart Projection Screen & Instructor Podium */}
      <group position={[0, 2.8, isEcLab ? -16 : -20]}>
        {/* Wall Partition */}
        <mesh receiveShadow>
          <boxGeometry args={[isEcLab ? 28 : 32, 5.6, 0.12]} />
          <meshStandardMaterial
            color="#0b0b14"
            transparent
            opacity={0.7}
            metalness={0.85}
            roughness={0.2}
          />
        </mesh>
        {/* 4K Smart Projection Screen */}
        <mesh position={[0, 0.5, 0.08]}>
          <planeGeometry args={[14, 3.8]} />
          <meshStandardMaterial
            color="#000000"
            emissive={activeRoom?.accentColor || '#d49b25'}
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>

      {/* Server Racks in Corner */}
      <ServerRackMesh position={[-13.5, 0, isEcLab ? -13 : -17]} />
      <ServerRackMesh position={[-12, 0, isEcLab ? -13 : -17]} />

      {/* ROOM WORKSTATIONS / BENCHES */}
      {isEcLab ? (
        /* Lab 101 (EC Lab - 1st Floor): 4 rows x 2 columns (8 long tables) with electronic gear & 2 PCs */
        (ecTables || []).map((table) => {
          const pcStation = ecPcMap[table.pcId];
          const isSelected = selectedStation?.pcId === table.pcId;

          return (
            <EcBenchMesh
              key={table.tableId || table._id}
              table={table}
              pcStation={pcStation}
              isSelected={isSelected}
              onSelectStation={onSelectStation}
              onSelectBench={onSelectBench}
              unallocatedOnly={unallocatedOnly}
            />
          );
        })
      ) : (
        /* Labs 201, 203, 302: 8 rows x 4 columns with 4 PCs per slot grid (128 PCs) */
        visibleWorkstations.map((station) => (
          <WorkstationMesh
            key={station.pcId || station.id}
            station={station}
            isSelected={selectedStation?.pcId === station.pcId}
            onSelect={onSelectStation}
            unallocatedOnly={unallocatedOnly}
            rotation={station.rotation || [0, 0, 0]}
          />
        ))
      )}

      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.7}
        scale={42}
        blur={1.8}
        far={8}
      />
    </>
  );
}

export default function LabCanvas() {
  const {
    activeRoomId,
    activeRoom,
    workstations,
    ecTables,
    selectedStation,
    setSelectedStationId,
    unallocatedOnly,
    statusFilter,
    loading,
    updateTableEquipment,
  } = useLabData();

  // View Mode: '3d' (Default Full-Page 3D Lab Twin) vs '2d' (Tactical Floor Plan)
  const [viewMode, setViewMode] = useState('3d');

  // Modals state
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimDefaultPcId, setClaimDefaultPcId] = useState('');
  const [teacherExamModalOpen, setTeacherExamModalOpen] = useState(false);

  // EC Table gear edit modal
  const [selectedBenchForEdit, setSelectedBenchForEdit] = useState(null);
  const [benchBreadboards, setBenchBreadboards] = useState(4);
  const [benchResistors, setBenchResistors] = useState(3);
  const [benchVoltmeters, setBenchVoltmeters] = useState(2);
  const [benchAmmeters, setBenchAmmeters] = useState(2);
  const [benchMultimeters, setBenchMultimeters] = useState(2);
  const [benchOscilloscopes, setBenchOscilloscopes] = useState(1);
  const [benchNotes, setBenchNotes] = useState('');

  const controlsRef = useRef();

  // Full-page camera presets: fills the entire viewport prominently with desks
  const presets = useMemo(() => ({
    isometric: { position: [0, 16, 22], lookAt: [0, 0, 0] },
    front: { position: [0, 9, -3], lookAt: [0, 0, -5] },
    back: { position: [0, 9, 11], lookAt: [0, 0, 7] },
    topdown: { position: [0, 28, 0.1], lookAt: [0, 0, 0] },
  }), []);

  const [cameraTarget, setCameraTarget] = useState(presets.isometric);

  // When room changes, reset camera to overview
  useEffect(() => {
    setCameraTarget(presets.isometric);
  }, [activeRoomId, presets]);

  // On-screen Zoom In handler (+ button)
  const handleZoomIn = () => {
    if (!controlsRef.current) return;
    const camera = controlsRef.current.object;
    const target = controlsRef.current.target;
    const dir = new THREE.Vector3().subVectors(camera.position, target).normalize();
    const currentDist = camera.position.distanceTo(target);
    const newDist = Math.max(3, currentDist * 0.72); // zoom in 28%
    const newPos = target.clone().add(dir.multiplyScalar(newDist));

    gsap.to(camera.position, {
      x: newPos.x,
      y: newPos.y,
      z: newPos.z,
      duration: 0.45,
      ease: 'power2.out',
      onUpdate: () => controlsRef.current?.update(),
    });
  };

  // On-screen Zoom Out handler (- button)
  const handleZoomOut = () => {
    if (!controlsRef.current) return;
    const camera = controlsRef.current.object;
    const target = controlsRef.current.target;
    const dir = new THREE.Vector3().subVectors(camera.position, target).normalize();
    const currentDist = camera.position.distanceTo(target);
    const newDist = Math.min(55, currentDist * 1.35); // zoom out 35%
    const newPos = target.clone().add(dir.multiplyScalar(newDist));

    gsap.to(camera.position, {
      x: newPos.x,
      y: newPos.y,
      z: newPos.z,
      duration: 0.45,
      ease: 'power2.out',
      onUpdate: () => controlsRef.current?.update(),
    });
  };

  const handleOpenClaimModal = (pcId) => {
    setClaimDefaultPcId(pcId || '');
    setClaimModalOpen(true);
  };

  const handleSelectStation = (station) => {
    if (!station) {
      setSelectedStationId(null);
      return;
    }
    setSelectedStationId(station.pcId);

    // Zoom camera towards clicked workstation
    if (station.position) {
      setCameraTarget({
        position: [station.position[0], station.position[1] + 3.0, station.position[2] + 4.0],
        lookAt: [station.position[0], station.position[1] + 0.9, station.position[2]],
      });
    }
  };

  const handleOpenBenchEdit = (table) => {
    setSelectedBenchForEdit(table);
    const eq = table.equipment || {};
    setBenchBreadboards(eq.breadboards ?? 4);
    setBenchResistors(eq.resistorKits ?? 3);
    setBenchVoltmeters(eq.voltageMeters ?? 2);
    setBenchAmmeters(eq.ammeters ?? 2);
    setBenchMultimeters(eq.multimeters ?? 2);
    setBenchOscilloscopes(eq.oscilloscopes ?? 1);
    setBenchNotes(eq.notes || '');
  };

  const handleSaveBenchEquipment = async (e) => {
    e.preventDefault();
    if (!selectedBenchForEdit) return;

    await updateTableEquipment(selectedBenchForEdit.tableId, {
      breadboards: Number(benchBreadboards),
      resistorKits: Number(benchResistors),
      voltageMeters: Number(benchVoltmeters),
      ammeters: Number(benchAmmeters),
      multimeters: Number(benchMultimeters),
      oscilloscopes: Number(benchOscilloscopes),
      notes: benchNotes,
    });

    setSelectedBenchForEdit(null);
  };

  return (
    <div className="relative w-full h-full bg-zinc-975 overflow-hidden select-none">
      
      {/* 1. Floating Glass HUD Toolbar (Room Selector, View Mode Toggle, Seating Actions) */}
      <RoomSelector
        onOpenClaimModal={() => handleOpenClaimModal('')}
        onOpenTeacherExamModal={() => setTeacherExamModalOpen(true)}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* 2. Visual Workspace: 100% Full-Page 3D Digital Twin or 2D Tactical Plan */}
      {loading ? (
        <div className="w-full h-full flex items-center justify-center text-center text-slate-400">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-10 h-10 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono">Loading {activeRoom?.roomCode} 3D digital twin...</p>
          </div>
        </div>
      ) : viewMode === '3d' ? (
        /* Full-Screen 3D Scene (Takes up 100% of remaining screen height) */
        <div className="w-full h-full absolute inset-0">
          
          <Canvas
            shadows
            camera={{ position: [0, 16, 22], fov: 44 }}
            gl={{ antialias: true, alpha: false }}
          >
            <Suspense fallback={null}>
              <Scene
                activeRoomId={activeRoomId}
                activeRoom={activeRoom}
                workstations={workstations}
                ecTables={ecTables}
                unallocatedOnly={unallocatedOnly}
                statusFilter={statusFilter}
                searchQuery={searchQuery}
                selectedStation={selectedStation}
                onSelectStation={handleSelectStation}
                onSelectBench={handleOpenBenchEdit}
                cameraTarget={cameraTarget}
                controlsRef={controlsRef}
              />
            </Suspense>
          </Canvas>

          {/* Interactive Zoom HUD & Camera Presets (Floating Bottom Right) */}
          <div className="absolute bottom-5 right-5 z-30 flex flex-wrap items-center gap-2 bg-zinc-950/95 backdrop-blur-2xl p-2 rounded-2xl border border-gold-500/40 shadow-2xl">
            
            {/* Quick Zoom In / Out Buttons (+ / -) */}
            <div className="flex items-center space-x-1 border-r border-white/10 pr-2">
              <button
                type="button"
                onClick={handleZoomIn}
                className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-gold-500/25 text-gold-300 hover:text-white border border-white/10 flex items-center justify-center font-bold text-base transition-colors"
                title="Zoom In (+)"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-gold-500/25 text-gold-300 hover:text-white border border-white/10 flex items-center justify-center font-bold text-base transition-colors"
                title="Zoom Out (-)"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>

            {/* Camera Presets */}
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setCameraTarget(presets.isometric)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Full Overview Room Angle"
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setCameraTarget(presets.front)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Close-Up on Front Desk Rows"
              >
                Front Rows
              </button>
              <button
                type="button"
                onClick={() => setCameraTarget(presets.back)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Close-Up on Back Desk Rows"
              >
                Back Rows
              </button>
              <button
                type="button"
                onClick={() => setCameraTarget(presets.topdown)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title="90° Top-Down Tactical View"
              >
                Top-Down
              </button>
            </div>
          </div>

          {/* Floating Instructions Pill (Bottom Left) */}
          <div className="absolute bottom-5 left-5 z-20 pointer-events-none hidden sm:block">
            <div className="glass-panel px-4 py-2 rounded-xl text-[11px] text-slate-300 border-white/10 flex items-center space-x-2.5 shadow-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                <strong>Interactive 3D Lab:</strong> Drag to rotate, scroll or use <strong className="text-gold-300 font-mono">+ / -</strong> to zoom, click any PC to inspect.
              </span>
            </div>
          </div>

        </div>
      ) : (
        /* 2D Tactical Plan Overview - Full Page Scrollable */
        <div className="w-full h-full overflow-y-auto pt-24 sm:pt-28 pb-12 px-4 sm:px-8">
          {activeRoomId === 'lab_101' ? (
            <EcLabView onSelectStation={handleSelectStation} />
          ) : (
            <ComputerLabGrid onSelectStation={handleSelectStation} />
          )}
        </div>
      )}

      {/* 3. Workstation Issue & Descriptive Note Inspector Modal */}
      {selectedStation && (
        <WorkstationModal
          station={selectedStation}
          onClose={() => setSelectedStationId(null)}
          onOpenClaimModal={(pcId) => handleOpenClaimModal(pcId)}
        />
      )}

      {/* 4. Semester Day-One Seating Claim Modal ([Student ID] + [Batch]) */}
      <ClaimSeatModal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        defaultPcId={claimDefaultPcId}
      />

      {/* 5. Teacher Exam Seating Override Modal (Working PCs Only) */}
      <TeacherExamModal
        isOpen={teacherExamModalOpen}
        onClose={() => setTeacherExamModalOpen(false)}
      />

      {/* 6. EC Lab Bench Electronic Equipment Configuration Modal */}
      {selectedBenchForEdit && (
        <Modal
          isOpen={Boolean(selectedBenchForEdit)}
          onClose={() => setSelectedBenchForEdit(null)}
          title={`Configure ${selectedBenchForEdit.label || selectedBenchForEdit.tableId}`}
          size="md"
        >
          <form onSubmit={handleSaveBenchEquipment} className="space-y-4">
            <p className="text-xs text-slate-400">
              Update electronic equipment allocation for this workbench in Lab 101 (1st Floor).
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Breadboards (Units)</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={benchBreadboards}
                  onChange={(e) => setBenchBreadboards(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Resistor Kits (Sets)</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={benchResistors}
                  onChange={(e) => setBenchResistors(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">DC Voltmeters (0-30V)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={benchVoltmeters}
                  onChange={(e) => setBenchVoltmeters(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">DC Ammeters (0-5A)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={benchAmmeters}
                  onChange={(e) => setBenchAmmeters(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Digital Multimeters</label>
                <input
                  type="number"
                  min="0"
                  max="6"
                  value={benchMultimeters}
                  onChange={(e) => setBenchMultimeters(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Oscilloscopes (50MHz)</label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  value={benchOscilloscopes}
                  onChange={(e) => setBenchOscilloscopes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-xs">Technician Notes</label>
              <textarea
                rows="2"
                value={benchNotes}
                onChange={(e) => setBenchNotes(e.target.value)}
                placeholder="Calibration records, terminal adjustments..."
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedBenchForEdit(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-slate-300 text-xs font-semibold hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-maroon-700 to-gold-600 text-white text-xs font-bold hover:from-maroon-600 hover:to-gold-500 shadow-glow-maroon"
              >
                Save Equipment
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
