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
  Camera, 
  RotateCcw, 
  Layers, 
  ArrowUp, 
  ArrowDown, 
  Maximize2, 
  Sliders, 
  Sparkles,
  Info
} from 'lucide-react';

// Smooth GSAP Camera Controller
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
      duration: 1.2,
      ease: 'power2.inOut',
    });

    // Animate orbit controls target
    if (targetLookAt) {
      gsap.to(controlsRef.current.target, {
        x: targetLookAt[0],
        y: targetLookAt[1],
        z: targetLookAt[2],
        duration: 1.2,
        ease: 'power2.inOut',
        onUpdate: () => controlsRef.current.update(),
      });
    }
  }, [targetPosition, targetLookAt, camera, controlsRef]);

  return null;
}

// 3D Department Lab Scene
function Scene({
  activeRoomId,
  activeRoom,
  workstations,
  ecTables,
  unallocatedOnly,
  statusFilter,
  selectedStation,
  onSelectStation,
  onSelectBench,
  cameraTarget,
  controlsRef,
}) {
  const isEcLab = activeRoomId === 'lab_101';

  // Compute 3D positions for the 128 computer lab workstations (8 rows x 4 columns = 32 pods x 4 PCs)
  const positionedWorkstations = useMemo(() => {
    if (isEcLab) {
      return workstations;
    }

    const spacingX = 4.2;
    const spacingZ = 3.6;

    return workstations.map((ws) => {
      const r = ws.slotRow || 1;
      const c = ws.slotCol || 1;
      const p = ws.pcIndex || 1;

      // Central aisle offset between Column 2 and Column 3
      const aisleOffsetX = c <= 2 ? -1.0 : 1.0;
      const podCenterX = (c - 2.5) * spacingX + aisleOffsetX;
      const podCenterZ = (r - 4.5) * spacingZ;

      let pcOffsetX = -0.72;
      let pcOffsetZ = -0.52;
      let rotY = 0;

      if (p === 1) {
        pcOffsetX = -0.72;
        pcOffsetZ = -0.52;
        rotY = 0;
      } else if (p === 2) {
        pcOffsetX = 0.72;
        pcOffsetZ = -0.52;
        rotY = 0;
      } else if (p === 3) {
        pcOffsetX = -0.72;
        pcOffsetZ = 0.52;
        rotY = Math.PI;
      } else {
        pcOffsetX = 0.72;
        pcOffsetZ = 0.52;
        rotY = Math.PI;
      }

      return {
        ...ws,
        position: [podCenterX + pcOffsetX, 0, podCenterZ + pcOffsetZ],
        rotation: [0, rotY, 0],
      };
    });
  }, [workstations, isEcLab]);

  // Filter stations based on status filter
  const visibleWorkstations = useMemo(() => {
    return positionedWorkstations.filter((ws) => {
      if (statusFilter === 'All') return true;
      if (statusFilter === 'Working') return ws.status === 'Working' || ws.status === 'Fixed';
      return ws.status === statusFilter;
    });
  }, [positionedWorkstations, statusFilter]);

  // Map of PC stations for EC Lab Benches
  const ecPcMap = useMemo(() => {
    const map = {};
    workstations.forEach((w) => {
      map[w.pcId] = w;
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
        enableDamping
        dampingFactor={0.06}
        maxPolarAngle={Math.PI / 2.05} // Prevent camera going under the floor
        minDistance={3}
        maxDistance={45}
      />

      {/* Lighting Rig */}
      <ambientLight intensity={0.9} />
      <directionalLight
        position={[12, 22, 14]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />

      {/* Heritage Maroon and Regal Gold Spotlights */}
      <spotLight
        position={[-14, 12, -12]}
        intensity={2.2}
        color="#800000"
        angle={0.65}
        penumbra={0.8}
      />
      <spotLight
        position={[14, 12, 12]}
        intensity={2.2}
        color="#d49b25"
        angle={0.65}
        penumbra={0.8}
      />

      {/* Lab Room Floor: Dark Reflective Carbon Ceramic Tiles */}
      <mesh
        position={[0, -0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onClick={() => onSelectStation(null)}
      >
        <planeGeometry args={[isEcLab ? 26 : 28, isEcLab ? 32 : 38]} />
        <meshStandardMaterial
          color="#07070a"
          metalness={0.8}
          roughness={0.25}
        />
      </mesh>

      {/* Floor Grid Lines */}
      <gridHelper
        args={[isEcLab ? 26 : 28, isEcLab ? 26 : 28, '#a4773a', '#1a1a24']}
        position={[0, 0.001, 0]}
      />

      {/* Ceiling Neon Light Fixture Beams */}
      {[-12, -6, 0, 6, 12].map((z, idx) => (
        <group key={idx} position={[0, 5.5, z]}>
          <mesh>
            <boxGeometry args={[isEcLab ? 22 : 24, 0.06, 0.08]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#e2e8f0"
              emissiveIntensity={1.8}
            />
          </mesh>
        </group>
      ))}

      {/* North Wall: 4K Smart Projection Screen & Instructor Podium */}
      <group position={[0, 2.5, isEcLab ? -15 : -18]}>
        {/* Wall Partition */}
        <mesh receiveShadow>
          <boxGeometry args={[isEcLab ? 24 : 26, 5, 0.1]} />
          <meshStandardMaterial
            color="#0b0b12"
            transparent
            opacity={0.6}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        {/* 4K Smart Projection Screen */}
        <mesh position={[0, 0.4, 0.06]}>
          <planeGeometry args={[10, 3.2]} />
          <meshStandardMaterial
            color="#000000"
            emissive={activeRoom?.accentColor || '#d49b25'}
            emissiveIntensity={0.4}
          />
        </mesh>
      </group>

      {/* Server Racks in Corner */}
      <ServerRackMesh position={[-11, 0, isEcLab ? -12 : -15]} />
      <ServerRackMesh position={[-9.6, 0, isEcLab ? -12 : -15]} />

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
        /* Labs 201, 203, 302: 8 rows x 4 columns with 4 PCs per slot grid */
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
        opacity={0.65}
        scale={36}
        blur={1.6}
        far={7}
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

  // View Mode: '3d' (Default 3D Interactive Lab Twin) vs '2d' (Tactical Floor Plan)
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

  // Camera presets
  const presets = useMemo(() => ({
    isometric: { position: [0, 22, 25], lookAt: [0, 0, 0] },
    front: { position: [0, 11, -7], lookAt: [0, 0, -5] },
    back: { position: [0, 11, 11], lookAt: [0, 0, 7] },
    topdown: { position: [0, 32, 0.1], lookAt: [0, 0, 0] },
  }), []);

  const [cameraTarget, setCameraTarget] = useState(presets.isometric);

  // When room changes, reset camera to overview
  useEffect(() => {
    setCameraTarget(presets.isometric);
  }, [activeRoomId, presets]);

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
        position: [station.position[0], station.position[1] + 2.8, station.position[2] + 3.8],
        lookAt: [station.position[0], station.position[1] + 0.8, station.position[2]],
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
    <div className="relative w-full min-h-[calc(100vh-4rem)] bg-zinc-975 flex flex-col select-none overflow-x-hidden">
      
      {/* 1. Lab Room Selector Dropdown, View Mode Toggle & Seating Control Toolbar */}
      <RoomSelector
        onOpenClaimModal={() => handleOpenClaimModal('')}
        onOpenTeacherExamModal={() => setTeacherExamModalOpen(true)}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* 2. Visual Workspace: 3D Digital Twin or 2D Tactical Plan */}
      <div className="flex-1 relative w-full h-[calc(100vh-10rem)] bg-zinc-975 overflow-hidden">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center p-12 text-center text-slate-400">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-9 h-9 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-mono">Loading {activeRoom?.roomCode} 3D digital twin...</p>
            </div>
          </div>
        ) : viewMode === '3d' ? (
          /* Real 3D University Lab Floor Scene */
          <div className="w-full h-full relative">
            
            <Canvas
              shadows
              camera={{ position: [0, 22, 25], fov: 45 }}
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
                  selectedStation={selectedStation}
                  onSelectStation={handleSelectStation}
                  onSelectBench={handleOpenBenchEdit}
                  cameraTarget={cameraTarget}
                  controlsRef={controlsRef}
                />
              </Suspense>
            </Canvas>

            {/* Camera Preset Quick Controls (Floating Bottom Right) */}
            <div className="absolute bottom-5 right-5 z-20 flex flex-wrap items-center gap-2 bg-zinc-950/90 backdrop-blur-xl p-1.5 rounded-2xl border border-gold-500/30 shadow-2xl">
              <div className="px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-gold-400 flex items-center space-x-1 hidden sm:flex">
                <Camera className="w-3.5 h-3.5" />
                <span>Angle:</span>
              </div>
              <button
                type="button"
                onClick={() => setCameraTarget(presets.isometric)}
                className="px-2.5 py-1 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Isometric Room Angle"
              >
                Isometric
              </button>
              <button
                type="button"
                onClick={() => setCameraTarget(presets.front)}
                className="px-2.5 py-1 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Front Desk Rows"
              >
                Front Rows
              </button>
              <button
                type="button"
                onClick={() => setCameraTarget(presets.back)}
                className="px-2.5 py-1 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Back Desk Rows"
              >
                Back Rows
              </button>
              <button
                type="button"
                onClick={() => setCameraTarget(presets.topdown)}
                className="px-2.5 py-1 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Top-Down Tactical Map"
              >
                Top-Down
              </button>
            </div>

            {/* Clean Floating Mode Guide (Bottom Left) */}
            <div className="absolute bottom-5 left-5 z-10 pointer-events-none hidden sm:block">
              <div className="glass-panel px-3.5 py-2 rounded-xl text-[11px] text-slate-300 border-white/10 flex items-center space-x-2.5 shadow-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  <strong>Interactive 3D Mode:</strong> Click any PC to inspect specs, log issue notes, or claim a vacant seat.
                </span>
              </div>
            </div>

          </div>
        ) : (
          /* 2D Tactical Plan Overview */
          <div className="w-full h-full overflow-y-auto">
            {activeRoomId === 'lab_101' ? (
              <EcLabView onSelectStation={handleSelectStation} />
            ) : (
              <ComputerLabGrid onSelectStation={handleSelectStation} />
            )}
          </div>
        )}
      </div>

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
