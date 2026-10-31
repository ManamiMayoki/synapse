import React, { useState } from 'react';
import RoomSelector from './RoomSelector';
import EcLabView from './EcLabView';
import ComputerLabGrid from './ComputerLabGrid';
import WorkstationModal from './WorkstationModal';
import { ClaimSeatModal, TeacherExamModal } from './SeatingModals';
import { useLabData } from '../../context/LabDataContext';

export default function LabCanvas() {
  const {
    activeRoomId,
    activeRoom,
    workstations,
    selectedStation,
    setSelectedStationId,
    loading,
  } = useLabData();

  // Modals state
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimDefaultPcId, setClaimDefaultPcId] = useState('');
  const [teacherExamModalOpen, setTeacherExamModalOpen] = useState(false);

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
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-4rem)] bg-zinc-975 flex flex-col select-none overflow-x-hidden">
      
      {/* 1. Lab Room Selector Dropdown & Seating Control Toolbar */}
      <RoomSelector
        onOpenClaimModal={() => handleOpenClaimModal('')}
        onOpenTeacherExamModal={() => setTeacherExamModalOpen(true)}
      />

      {/* 2. Room Content View based on Selected Lab */}
      <div className="flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12 text-center text-slate-400">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-mono">Loading {activeRoom?.roomCode} layout...</p>
            </div>
          </div>
        ) : activeRoomId === 'lab_101' ? (
          /* Lab 101 (EC Lab - 1st Floor): 4 rows x 2 columns (8 long tables) with electronic equipment tracking & exactly 2 PCs */
          <EcLabView onSelectStation={handleSelectStation} />
        ) : (
          /* Labs 201 (CP Lab), 203, and 302: 8 rows and 4 columns, with 4 PCs per slot grid */
          <ComputerLabGrid onSelectStation={handleSelectStation} />
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

    </div>
  );
}
