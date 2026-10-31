import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  Terminal, 
  Code2, 
  Flame, 
  Zap, 
  ChevronDown, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Sparkles, 
  ShieldAlert, 
  Check, 
  Plus,
  Box,
  LayoutGrid
} from 'lucide-react';
import { useLabData, DEPARTMENT_ROOMS } from '../../context/LabDataContext';
import { useAuth } from '../../context/AuthContext';

export default function RoomSelector({
  onOpenClaimModal,
  onOpenTeacherExamModal,
  viewMode = '3d',
  setViewMode = () => {},
}) {
  const {
    rooms,
    activeRoomId,
    setActiveRoomId,
    activeRoom,
    workingCount,
    needsRepairCount,
    allocatedCount,
    unallocatedCount,
    unallocatedOnly,
    setUnallocatedOnly,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    workstations,
  } = useLabData();

  const { role, user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target) && 
        buttonRef.current && 
        !buttonRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoomIcon = (id) => {
    switch (id) {
      case 'lab_101': return Zap;
      case 'lab_201': return Terminal;
      case 'lab_203': return Code2;
      case 'lab_302': return Flame;
      default: return Building2;
    }
  };

  const ActiveIcon = getRoomIcon(activeRoomId);

  // Guarantee that all 4 department labs are always available in the switcher
  const displayRooms = (rooms && rooms.length >= 4) ? rooms : DEPARTMENT_ROOMS;

  return (
    <div className="relative z-50 w-full bg-zinc-950/95 backdrop-blur-2xl border-b border-gold-500/20 p-4 sm:px-6 select-none space-y-4 shadow-xl">
      
      {/* Top Bar: Room Dropdown Switcher + Room Info + Exam Notice */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left: Dropdown Room Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          
          <div className="relative">
            <button
              ref={buttonRef}
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center space-x-3 px-4 py-2.5 rounded-2xl bg-zinc-900 border border-gold-500/40 hover:border-gold-400 text-white font-bold text-sm transition-all shadow-glow-maroon"
            >
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center p-0.5 border"
                style={{ 
                  backgroundColor: `${activeRoom?.accentColor || '#d49b25'}20`, 
                  borderColor: `${activeRoom?.accentColor || '#d49b25'}60` 
                }}
              >
                <ActiveIcon className="w-4 h-4" style={{ color: activeRoom?.accentColor || '#d49b25' }} />
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-gold-300">{activeRoom?.roomCode || 'Select Room'}</span>
                  <span className="text-[11px] text-slate-400 font-normal">({activeRoom?.floor})</span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium truncate max-w-[200px]">
                  {activeRoom?.shortName || activeRoom?.name}
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gold-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu - Highest Z-Index, Always Floating On Top */}
            {dropdownOpen && (
              <div 
                ref={dropdownRef}
                className="absolute left-0 top-full mt-2 w-84 rounded-2xl glass-card bg-zinc-950/98 border border-gold-500/50 shadow-2xl py-2 z-[100] divide-y divide-white/5 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest text-gold-400 flex items-center justify-between">
                  <span>Select Department Lab Room</span>
                  <span>4 Labs Available</span>
                </div>

                {displayRooms.map((room) => {
                  const rId = room.roomId || room.id;
                  const Icon = getRoomIcon(rId);
                  const isSelected = activeRoomId === rId;

                  return (
                    <button
                      key={rId}
                      type="button"
                      onClick={() => {
                        setActiveRoomId(rId);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 flex items-center space-x-3 transition-colors ${
                        isSelected ? 'bg-gold-500/20 text-white font-bold' : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <div 
                        className="w-8 h-8 rounded-xl flex items-center justify-center p-0.5 border shrink-0"
                        style={{ 
                          backgroundColor: `${room.accentColor || '#d49b25'}20`, 
                          borderColor: `${room.accentColor || '#d49b25'}50` 
                        }}
                      >
                        <Icon className="w-4 h-4" style={{ color: room.accentColor || '#d49b25' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-white">{room.roomCode}</span>
                          <span className="text-[10px] text-gold-400/90 font-mono">({room.floor})</span>
                          {room.type === 'ec_lab' ? (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 font-mono">8 Tables • 2 PCs</span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 font-mono">8×4 Grid • 128 PCs</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{room.name}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-gold-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Stats Badges for Active Room */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/5 text-slate-300 flex items-center space-x-1.5">
              <span className="text-slate-400">Total:</span>
              <span className="font-bold text-white">
                {activeRoom?.type === 'ec_lab' ? '8 Tables (2 PCs)' : `${workstations.length || 128} PCs (8×4 Grid)`}
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{workingCount} Working</span>
            </div>

            {needsRepairCount > 0 && (
              <div className="px-3 py-1.5 rounded-xl bg-maroon-950/70 border border-rose-500/50 text-rose-300 flex items-center space-x-1.5 shadow-glow-maroon">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>{needsRepairCount} Needs Repair</span>
              </div>
            )}

            <div className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/5 text-slate-300 flex items-center space-x-1.5">
              <span className="text-gold-400 font-bold">{allocatedCount}</span>
              <span className="text-slate-400">Claimed</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">{unallocatedCount}</span>
              <span className="text-slate-400">Vacant</span>
            </div>
          </div>
        </div>

        {/* Right: View Mode Toggle & Seating Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* 3D vs 2D View Switcher */}
          <div className="bg-zinc-900 p-1 rounded-xl border border-white/10 flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                viewMode === '3d'
                  ? 'bg-gradient-to-r from-maroon-700 to-gold-700 text-white shadow-glow-maroon font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Interactive 3D University Lab Digital Twin"
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Lab Twin</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                viewMode === '2d'
                  ? 'bg-gradient-to-r from-maroon-700 to-gold-700 text-white shadow-glow-maroon font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="2D Tactical Floor Plan Overview"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>2D Tactical Plan</span>
            </button>
          </div>

          {/* Day-One Claim My Seat Button */}
          <button
            type="button"
            onClick={onOpenClaimModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-maroon-700 via-maroon-800 to-gold-600 hover:from-maroon-600 hover:to-gold-500 text-white font-bold text-xs flex items-center space-x-2 transition-all shadow-glow-maroon"
            title="Claim your designated seat for the semester using [Student ID] + [Batch] (e.g. 364-32)"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Claim Seat (Day One)</span>
          </button>

          {/* Teacher Exam Override Button (Teachers/Staff/Admin) */}
          <button
            type="button"
            onClick={onOpenTeacherExamModal}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-gold-300 border border-gold-500/40 font-bold text-xs flex items-center space-x-2 transition-all shadow-sm"
            title="Teacher Exam Override: Randomly or manually reallocate students across verified working PCs only"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-gold-400" />
            <span>Teacher Exam Override</span>
          </button>

        </div>

      </div>

      {/* Bottom Filter & Tracker Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/5 text-xs">
        
        {/* Left: Unallocated Tracker & Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Unallocated Tracker Toggle Button */}
          <button
            type="button"
            onClick={() => setUnallocatedOnly(!unallocatedOnly)}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-2 transition-all ${
              unallocatedOnly
                ? 'bg-gradient-to-r from-emerald-900 to-emerald-700 text-white border border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-zinc-900 text-slate-300 border border-white/10 hover:border-gold-500/30'
            }`}
            title="Toggle Unallocated Tracker: Highlights open vacant PCs for students who missed day one"
          >
            <Sparkles className={`w-3.5 h-3.5 ${unallocatedOnly ? 'text-emerald-300 animate-spin' : 'text-slate-400'}`} />
            <span>Vacant Seat Tracker {unallocatedOnly ? 'ON' : 'OFF'}</span>
            <span className="px-1.5 py-0.2 rounded bg-zinc-950 text-[10px] text-emerald-400 font-mono">
              {unallocatedCount} Vacant
            </span>
          </button>

          {/* Status Filters: All | Working | Needs Repair | Fixed */}
          <div className="bg-zinc-900 p-1 rounded-xl border border-white/5 flex items-center space-x-1">
            {['All', 'Working', 'Needs Repair', 'Fixed'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  statusFilter === s
                    ? 'bg-white/10 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Quick Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search PC ID, student tag (e.g. 364-32)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 pl-8 pr-3 py-1.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-gold-400 font-mono"
          />
        </div>

      </div>

    </div>
  );
}
