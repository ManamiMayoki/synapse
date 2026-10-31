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
  LayoutGrid,
  Filter
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
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(true);
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
    <div className="absolute top-3 left-4 right-4 z-40 pointer-events-none flex flex-col gap-2 select-none">
      
      {/* Top Floating Glass HUD Bar */}
      <div className="w-full bg-zinc-950/90 backdrop-blur-2xl border border-gold-500/30 p-2 sm:px-4 rounded-2xl shadow-2xl flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        
        {/* Left: Dropdown Room Switcher + Stats Badge */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          <div className="relative">
            <button
              ref={buttonRef}
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center space-x-2.5 px-3.5 py-2 rounded-xl bg-zinc-900 border border-gold-500/40 hover:border-gold-400 text-white font-bold text-xs transition-all shadow-glow-maroon"
            >
              <div 
                className="w-6 h-6 rounded-lg flex items-center justify-center p-0.5 border"
                style={{ 
                  backgroundColor: `${activeRoom?.accentColor || '#d49b25'}25`, 
                  borderColor: `${activeRoom?.accentColor || '#d49b25'}60` 
                }}
              >
                <ActiveIcon className="w-3.5 h-3.5" style={{ color: activeRoom?.accentColor || '#d49b25' }} />
              </div>
              <div className="text-left">
                <span className="font-extrabold text-gold-300">{activeRoom?.roomCode || 'Select Room'}</span>
                <span className="text-[10px] text-slate-400 ml-1">({activeRoom?.floor})</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gold-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu - Always floating on top */}
            {dropdownOpen && (
              <div 
                ref={dropdownRef}
                className="absolute left-0 top-full mt-2 w-80 rounded-2xl glass-card bg-zinc-950/98 border border-gold-500/50 shadow-2xl py-2 z-[100] divide-y divide-white/5 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest text-gold-400 flex items-center justify-between">
                  <span>Department CSE Labs</span>
                  <span>4 Rooms</span>
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
                      className={`w-full text-left px-3.5 py-2.5 flex items-center space-x-3 transition-colors ${
                        isSelected ? 'bg-gold-500/20 text-white font-bold' : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <div 
                        className="w-7 h-7 rounded-lg flex items-center justify-center p-0.5 border shrink-0"
                        style={{ 
                          backgroundColor: `${room.accentColor || '#d49b25'}20`, 
                          borderColor: `${room.accentColor || '#d49b25'}50` 
                        }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: room.accentColor || '#d49b25' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-white">{room.roomCode}</span>
                          <span className="text-[10px] text-gold-400/90 font-mono">({room.floor})</span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{room.name}</p>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-gold-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Room Stats Badges */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <div className="px-2.5 py-1.5 rounded-xl bg-zinc-900/90 border border-white/5 text-slate-300 flex items-center space-x-1.5 hidden md:flex">
              <span className="text-slate-400">Total:</span>
              <span className="font-bold text-white">
                {activeRoom?.type === 'ec_lab' ? '8 Benches (2 PCs)' : `${workstations.length || 128} PCs`}
              </span>
            </div>

            <div className="px-2.5 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>{workingCount} Working</span>
            </div>

            {needsRepairCount > 0 && (
              <div className="px-2.5 py-1.5 rounded-xl bg-maroon-950/80 border border-rose-500/50 text-rose-300 flex items-center space-x-1.5 shadow-glow-maroon">
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                <span>{needsRepairCount} Broken</span>
              </div>
            )}

            <div className="px-2.5 py-1.5 rounded-xl bg-zinc-900/90 border border-white/5 text-slate-300 flex items-center space-x-1.5 hidden sm:flex">
              <span className="text-gold-400 font-bold">{allocatedCount}</span>
              <span className="text-slate-400">Claimed</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">{unallocatedCount}</span>
              <span className="text-slate-400">Vacant</span>
            </div>
          </div>
        </div>

        {/* Right: View Mode Toggle & Actions */}
        <div className="flex items-center gap-2">
          
          {/* 3D vs 2D View Switcher */}
          <div className="bg-zinc-900 p-0.5 rounded-xl border border-white/10 flex items-center">
            <button
              type="button"
              onClick={() => setViewMode('3d')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                viewMode === '3d'
                  ? 'bg-gradient-to-r from-maroon-700 to-gold-700 text-white shadow-glow-maroon font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Full-Page 3D University Lab Twin"
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Lab</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('2d')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                viewMode === '2d'
                  ? 'bg-gradient-to-r from-maroon-700 to-gold-700 text-white shadow-glow-maroon font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="2D Tactical Floor Plan"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>2D Plan</span>
            </button>
          </div>

          {/* Toggle Search & Filter Drawer */}
          <button
            type="button"
            onClick={() => setFilterDrawerOpen((prev) => !prev)}
            className={`p-2 rounded-xl border transition-all ${
              filterDrawerOpen || unallocatedOnly || statusFilter !== 'All' || searchQuery
                ? 'bg-gold-500/20 text-gold-300 border-gold-500/60'
                : 'bg-zinc-900 text-slate-300 border-white/10 hover:text-white'
            }`}
            title="Filter by status or search PC / Student ID"
          >
            <Filter className="w-3.5 h-3.5" />
          </button>

          {/* Day-One Claim My Seat Button */}
          <button
            type="button"
            onClick={onOpenClaimModal}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-maroon-700 via-maroon-800 to-gold-600 hover:from-maroon-600 hover:to-gold-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-glow-maroon"
            title="Claim your designated seat for the semester using [Student ID] + [Batch]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Claim Seat</span>
          </button>

          {/* Teacher Exam Override Button */}
          <button
            type="button"
            onClick={onOpenTeacherExamModal}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-gold-300 border border-gold-500/40 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm hidden md:flex"
            title="Teacher Exam Override: Randomly or manually reallocate students across verified working PCs only"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-gold-400" />
            <span>Exam Override</span>
          </button>

        </div>

      </div>

      {/* Floating Filter Drawer (Expands below top HUD when toggled) */}
      {filterDrawerOpen && (
        <div className="w-full bg-zinc-950/95 backdrop-blur-2xl border border-gold-500/30 p-2.5 sm:px-4 rounded-2xl shadow-2xl flex flex-wrap items-center justify-between gap-3 pointer-events-auto animate-in fade-in slide-in-from-top-1 duration-150">
          
          {/* Left: Vacant Seat Tracker & Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Vacant Seat Tracker Toggle Button */}
            <button
              type="button"
              onClick={() => setUnallocatedOnly(!unallocatedOnly)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all ${
                unallocatedOnly
                  ? 'bg-gradient-to-r from-emerald-900 to-emerald-700 text-white border border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-zinc-900 text-slate-300 border border-white/10 hover:border-gold-500/30'
              }`}
              title="Highlights open vacant PCs for students who missed day one"
            >
              <Sparkles className={`w-3 h-3 ${unallocatedOnly ? 'text-emerald-300 animate-spin' : 'text-slate-400'}`} />
              <span>Vacant Tracker {unallocatedOnly ? 'ON' : 'OFF'}</span>
              <span className="px-1.5 py-0.2 rounded bg-zinc-950 text-[10px] text-emerald-400 font-mono">
                {unallocatedCount} Open
              </span>
            </button>

            {/* Status Filters */}
            <div className="bg-zinc-900 p-0.5 rounded-xl border border-white/5 flex items-center space-x-0.5">
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

          {/* Right: Search Box */}
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
      )}

    </div>
  );
}
