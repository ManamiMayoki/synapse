import React from 'react';
import { 
  Monitor, 
  Cpu, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  User, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useLabData } from '../../context/LabDataContext';
import StatusBadge from '../common/StatusBadge';

export default function ComputerLabGrid({ onSelectStation }) {
  const {
    activeRoom,
    workstations,
    unallocatedOnly,
    statusFilter,
    searchQuery,
  } = useLabData();

  // 8 rows x 4 columns = 32 slots (each slot has 4 PCs)
  const rows = [1, 2, 3, 4, 5, 6, 7, 8];
  const cols = [1, 2, 3, 4];

  // Helper to get 4 PCs in a specific slot (row, col)
  const getSlotPcs = (r, c) => {
    return (workstations || [])
      .filter((w) => w && w.slotRow === r && w.slotCol === c)
      .sort((a, b) => (a.pcIndex || 0) - (b.pcIndex || 0));
  };

  // Check if a PC satisfies active filters
  const pcMatchesFilter = (pc) => {
    if (!pc) return false;

    // Unallocated tracker filter
    if (unallocatedOnly && pc.allocatedTo?.tag) {
      return false;
    }

    // Status filter (Working | Needs Repair | Fixed)
    if (statusFilter !== 'All') {
      if (statusFilter === 'Working' && pc.status !== 'Working' && pc.status !== 'Fixed') return false;
      if (statusFilter === 'Needs Repair' && pc.status !== 'Needs Repair') return false;
      if (statusFilter === 'Fixed' && pc.status !== 'Fixed') return false;
    }

    // Search query (matches PC ID, slot label, student tag)
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = (pc.pcId || '').toLowerCase().includes(q) || (pc.displayId || '').toLowerCase().includes(q);
      const matchTag = pc.allocatedTo?.tag?.toLowerCase().includes(q);
      const matchStudent = pc.allocatedTo?.studentName?.toLowerCase().includes(q);
      return matchId || matchTag || matchStudent;
    }

    return true;
  };

  return (
    <div className="w-full p-4 sm:p-8 bg-slate-50 min-h-[800px] space-y-8 select-none">
      
      {/* North Wall: Smart 4K Projection Matrix & Instructor Podium */}
      <div className="max-w-7xl mx-auto rounded-2xl bg-white p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <span className="font-mono text-sm font-bold uppercase tracking-wider text-slate-800">
              NORTH WALL • 4K SMART PROJECTION MATRIX & INSTRUCTOR PODIUM
            </span>
            <p className="text-sm text-slate-500 mt-0.5">
              {activeRoom?.name} • 10 GbE Core Backbone • Verified Working PC Cluster
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-semibold">
            Layout: 8 Rows × 4 Columns
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-semibold">
            4 PCs Per Slot
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-maroon-50 border border-maroon-200 text-maroon-800 font-bold">
            128 PCs Total
          </span>
        </div>
      </div>

      {/* 8 Rows x 4 Columns Grid Architecture */}
      <div className="max-w-7xl mx-auto space-y-6">
        {rows.map((rowNum) => (
          <div key={rowNum} className="space-y-3">
            
            {/* Row Number Marker */}
            <div className="flex items-center justify-between px-2 text-sm font-mono">
              <span className="font-bold text-slate-700 tracking-wider uppercase flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-maroon-600" />
                <span>Row {rowNum} (Slots {rowNum}-1 to {rowNum}-4)</span>
              </span>
              <span className="text-xs text-slate-500">16 PCs in Row {rowNum}</span>
            </div>

            {/* 4 Table Columns in this Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cols.map((colNum) => {
                const slotPcs = getSlotPcs(rowNum, colNum);
                const hasMatchingPc = slotPcs.some((pc) => pcMatchesFilter(pc));

                return (
                  <div
                    key={`${rowNum}-${colNum}`}
                    className={`rounded-2xl p-4 border transition-all duration-200 ${
                      hasMatchingPc
                        ? 'border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:shadow'
                        : 'border-slate-100 bg-slate-50 opacity-40'
                    }`}
                  >
                    {/* Slot Header */}
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 text-xs font-mono">
                      <span className="font-bold text-slate-800">
                        Slot R{rowNum}-C{colNum}
                      </span>
                      <span className="text-slate-500 font-medium">
                        Table {colNum}
                      </span>
                    </div>

                    {/* 4 PCs inside this Slot */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {slotPcs.map((pc) => {
                        const isVisible = pcMatchesFilter(pc);
                        const isAllocated = !!pc.allocatedTo?.tag;

                        return (
                          <div
                            key={pc.pcId}
                            onClick={() => onSelectStation(pc)}
                            className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 relative group ${
                              !isVisible
                                ? 'opacity-25 pointer-events-none'
                                : pc.status === 'Needs Repair'
                                ? 'bg-rose-50 border-rose-300 hover:border-rose-400'
                                : unallocatedOnly && !isAllocated
                                ? 'bg-emerald-50 border-emerald-300 hover:border-emerald-400'
                                : pc.status === 'Fixed'
                                ? 'bg-blue-50 border-blue-200 hover:border-blue-300'
                                : 'bg-slate-50 border-slate-200 hover:border-maroon-300 hover:bg-white'
                            }`}
                          >
                            {/* Top Line: PC index & Status Dot */}
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-mono text-sm font-bold text-slate-800 group-hover:text-maroon-700 transition-colors">
                                PC-{pc.pcIndex}
                              </span>
                              <span
                                className={`w-2.5 h-2.5 rounded-full ${
                                  pc.status === 'Needs Repair'
                                    ? 'bg-rose-500 animate-ping'
                                    : pc.status === 'Fixed'
                                    ? 'bg-blue-500'
                                    : 'bg-emerald-500'
                                }`}
                                title={`Status: ${pc.status}`}
                              />
                            </div>

                            {/* Seating Allocation Tag */}
                            <div className="min-h-[24px] flex items-center mb-1.5">
                              {isAllocated ? (
                                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-maroon-50 text-maroon-800 border border-maroon-200 truncate max-w-full">
                                  🪑 {pc.allocatedTo.tag}
                                </span>
                              ) : (
                                <span className={`text-xs font-mono font-semibold ${
                                  unallocatedOnly ? 'text-emerald-700 font-bold' : 'text-slate-400'
                                }`}>
                                  Vacant
                                </span>
                              )}
                            </div>

                            {/* PC Status Badge Label */}
                            <div className="flex items-center justify-between text-xs font-mono text-slate-500 border-t border-slate-200/60 pt-1.5">
                              <span className={pc.status === 'Needs Repair' ? 'text-rose-600 font-bold' : pc.status === 'Fixed' ? 'text-blue-600' : 'text-slate-600'}>
                                {pc.status}
                              </span>
                              {pc.notes?.length > 0 && (
                                <span className="text-amber-700 font-semibold" title={`${pc.notes.length} custom notes logged`}>
                                  📝 {pc.notes.length}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        ))}
      </div>

      {/* South Wall & Aisle Entryway */}
      <div className="max-w-7xl mx-auto p-4 rounded-2xl border border-dashed border-slate-300 bg-white flex items-center justify-between text-xs text-slate-600 font-mono">
        <span>SOUTH ENTRANCE & WALKWAY AISLE • ALL WORKSTATIONS NETWORK TERMINATED</span>
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-700">CAMPUS CORRIDOR EXIT</span>
          <span className="w-2.5 h-2.5 rounded-full bg-maroon-600" />
        </div>
      </div>

    </div>
  );
}
