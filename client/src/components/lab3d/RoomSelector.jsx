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
  Box,
  LayoutGrid,
  Filter
} from 'lucide-react';
import { useLabData, DEPARTMENT_ROOMS } from '../../context/LabDataContext';
import { useAuth } from '../../context/AuthContext';

export default function RoomSelector({
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

  const { role } = useAuth();
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
  const displayRooms = (Array.isArray(rooms) && rooms.length >= 4) ? rooms : DEPARTMENT_ROOMS;

  return (
    <div className="absolute top-3 left-4 right-4 z-40 pointer-events-none flex flex-col gap-2 select-none">
      
      {/* Top Floating Light HUD Bar */}
      <div className="w-full bg-white/95 backdrop-blur-md border border-slate-200 p-2.5 sm:px-4 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        
        {/* Left: Dropdown Room Switcher + Stats Badge */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          <div className="relative">
            <button
              ref={buttonRef}
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center space-x-2.5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-900 font-bold text-xs transition-all shadow-xs"
            >
              <div 
                className="w-6 h-6 rounded-lg flex items-center justify-center p-0.5 border"
                style={{ 
                  backgroundColor: `${activeRoom?.accentColor || '#800000'}15`, 
                  borderColor: `${activeRoom?.accentColor || '#800000'}40` 
                }}
              >
                <ActiveIcon className="w-3.5 h-3.5" style={{ color: activeRoom?.accentColor || '#800000' }} />
              </div>
              <div className="text-left">
                <span className="font-extrabold text-slate-900">{activeRoom?.roomCode || 'Select Room'}</span>
                <span className="text-xs text-slate-500 ml-1">({activeRoom?.floor})</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div 
                ref={dropdownRef}
                className="absolute left-0 top-full mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-[100] divide-y divide-slate-100 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
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
                        isSelected ? 'bg-maroon-50 text-maroon-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div 
                        className="w-7 h-7 rounded-lg flex items-center justify-center p-0.5 border shrink-0"
                        style={{ 
                          backgroundColor: `${room.accentColor || '#800000'}15`, 
                          borderColor: `${room.accentColor || '#800000'}40` 
                        }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: room.accentColor || '#800000' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-slate-900">{room.roomCode}</span>
                          <span className="text-xs text-slate-500 font-mono">({room.floor})</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{room.name}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-maroon-700 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Room Stats Badges */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <div className="px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center space-x-1.5 hidden md:flex font-semibold">
              <span className="text-slate-500">Total:</span>
              <span className="font-bold text-slate-900">
                {activeRoom?.type === 'ec_lab' ? '8 Benches (2 PCs)' : `${(workstations || []).length || 128} PCs`}
              </span>
            </div>

            <div className="px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center space-x-1.5 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{workingCount} Working</span>
            </div>

            {needsRepairCount > 0 && (
              <div className="px-2.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center space-x-1.5 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>{needsRepairCount} Broken</span>
              </div>
            )}

            <div className="px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center space-x-1.5 hidden sm:flex font-semibold">
              <span className="text-slate-900 font-bold">{allocatedCount}</span>
              <span className="text-slate-500">Assigned</span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">{unallocatedCount}</span>
              <span className="text-slate-500">Vacant</span>
            </div>
          </div>
        </div>

        {/* Right: View Mode Toggle & Actions */}
        <div className="flex items-center gap-2">
          
          {/* 3D vs 2D View Switcher */}
          <div className="bg-slate-100 p-0.5 rounded-xl border border-slate-200 flex items-center">
            <button
              type="button"
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                viewMode === '3d'
                  ? 'bg-white text-maroon-800 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Full 3D Interactive Lab Twin"
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Lab</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                viewMode === '2d'
                  ? 'bg-white text-maroon-800 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="2D Floor Plan Overview"
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
                ? 'bg-maroon-50 text-maroon-800 border-maroon-300'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="Filter by status or search workstation"
          >
            <Filter className="w-4 h-4" />
          </button>

          {/* Teacher Exam Override Button (Staff/Admin) */}
          {(role === 'staff' || role === 'admin') && (
            <button
              type="button"
              onClick={onOpenTeacherExamModal}
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs hidden md:flex"
              title="Teacher Exam Override: Setup exam layout"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-maroon-700" />
              <span>Exam Layout</span>
            </button>
          )}

        </div>

      </div>

      {/* Floating Filter Drawer (Expands below top HUD when toggled) */}
      {filterDrawerOpen && (
        <div className="w-full bg-white/95 backdrop-blur-md border border-slate-200 p-2.5 sm:px-4 rounded-2xl shadow-md flex flex-wrap items-center justify-center gap-3 pointer-events-auto animate-in fade-in slide-in-from-top-1 duration-150">
          
          {/* Centered: Vacant Seat Tracker & Status Filters */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            
            {/* Vacant Seat Tracker Toggle Button */}
            <button
              type="button"
              onClick={() => setUnallocatedOnly(!unallocatedOnly)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all ${
                unallocatedOnly
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
              title="Highlights open vacant workstations"
            >
              <Sparkles className={`w-3 h-3 ${unallocatedOnly ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>Vacant Tracker {unallocatedOnly ? 'ON' : 'OFF'}</span>
              <span className="px-1.5 py-0.5 rounded bg-white text-xs text-emerald-700 font-mono border border-slate-200">
                {unallocatedCount} Open
              </span>
            </button>

            {/* Status Filters */}
            <div className="bg-slate-100 p-0.5 rounded-xl border border-slate-200 flex items-center space-x-0.5">
              {['All', 'Working', 'Needs Repair', 'Fixed'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === s
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
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
              placeholder="Search PC ID (e.g. Lab201-R01-C01-P1)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-maroon-600 font-mono"
            />
          </div>

        </div>
      )}

    </div>
  );
}
