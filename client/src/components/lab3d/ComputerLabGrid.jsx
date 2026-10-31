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
    return workstations
      .filter((w) => w.slotRow === r && w.slotCol === c)
      .sort((a, b) => a.pcIndex - b.pcIndex);
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
      const matchId = pc.pcId.toLowerCase().includes(q) || pc.displayId.toLowerCase().includes(q);
      const matchTag = pc.allocatedTo?.tag?.toLowerCase().includes(q);
      const matchStudent = pc.allocatedTo?.studentName?.toLowerCase().includes(q);
      return matchId || matchTag || matchStudent;
    }

    return true;
  };

  return (
    <div className="w-full p-4 sm:p-8 bg-zinc-975 bg-cyber-grid min-h-[800px] space-y-8 select-none">
      
      {/* North Wall: Smart 4K Projection Matrix & Instructor Podium */}
      <div className="max-w-7xl mx-auto rounded-3xl glass-card p-4 sm:p-5 border-gold-500/25 bg-zinc-950/80 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <span className="font-mono text-xs font-extrabold uppercase tracking-widest text-slate-200">
              NORTH WALL • 4K SMART PROJECTION MATRIX & INSTRUCTOR PODIUM
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {activeRoom?.name} • 10 GbE Core Backbone • Verified Working PC Cluster
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/5 text-gold-300">
            Layout: 8 Rows × 4 Columns
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/5 text-cyan-300">
            4 PCs Per Slot Grid
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/5 text-white font-bold">
            128 PCs Total
          </span>
        </div>
      </div>

      {/* 8 Rows x 4 Columns Grid Architecture */}
      <div className="max-w-7xl mx-auto space-y-6">
        {rows.map((rowNum) => (
          <div key={rowNum} className="space-y-2">
            
            {/* Row Number Marker */}
            <div className="flex items-center justify-between px-2 text-xs font-mono">
              <span className="font-extrabold text-gold-400/90 tracking-widest uppercase flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-gold-400" />
                <span>Row {rowNum} (Slots {rowNum}-1 to {rowNum}-4)</span>
              </span>
              <span className="text-[10px] text-slate-500">16 PCs in Row {rowNum}</span>
            </div>

            {/* 4 Table Columns in this Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cols.map((colNum) => {
                const slotPcs = getSlotPcs(rowNum, colNum);
                const hasMatchingPc = slotPcs.some((pc) => pcMatchesFilter(pc));

                return (
                  <div
                    key={`${rowNum}-${colNum}`}
                    className={`rounded-2xl glass-card p-3.5 border transition-all duration-200 ${
                      hasMatchingPc
                        ? 'border-white/10 bg-zinc-950/80 hover:border-gold-500/40'
                        : 'border-white/5 bg-zinc-950/40 opacity-40'
                    }`}
                  >
                    {/* Slot Header: e.g. Slot R1-C1 */}
                    <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/5 text-xs font-mono">
                      <span className="font-bold text-slate-200">
                        Slot R{rowNum}-C{colNum}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Table {colNum}
                      </span>
                    </div>

                    {/* 4 PCs inside this Slot (2x2 mini grid or vertical stack) */}
                    <div className="grid grid-cols-2 gap-2">
                      {slotPcs.map((pc) => {
                        const isVisible = pcMatchesFilter(pc);
                        const isAllocated = !!pc.allocatedTo?.tag;

                        return (
                          <div
                            key={pc.pcId}
                            onClick={() => onSelectStation(pc)}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all duration-200 relative group ${
                              !isVisible
                                ? 'opacity-25 pointer-events-none'
                                : pc.status === 'Needs Repair'
                                ? 'bg-maroon-950/80 border-rose-500/60 shadow-glow-maroon hover:border-rose-400'
                                : unallocatedOnly && !isAllocated
                                ? 'bg-emerald-950/50 border-emerald-400/80 shadow-[0_0_12px_rgba(16,185,129,0.3)] hover:border-emerald-300'
                                : pc.status === 'Fixed'
                                ? 'bg-zinc-900/90 border-cyan-500/40 hover:border-cyan-300'
                                : 'bg-zinc-900/80 border-white/10 hover:border-gold-500/60 hover:bg-zinc-850'
                            }`}
                          >
                            {/* Top Line: PC index (P1..P4) & Status Dot */}
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-mono text-xs font-extrabold text-white group-hover:text-gold-300 transition-colors">
                                PC-{pc.pcIndex}
                              </span>
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  pc.status === 'Needs Repair'
                                    ? 'bg-rose-500 animate-ping'
                                    : pc.status === 'Fixed'
                                    ? 'bg-cyan-400'
                                    : 'bg-emerald-400'
                                }`}
                                title={`Status: ${pc.status}`}
                              />
                            </div>

                            {/* Seating Allocation Tag: [Student ID] + [Batch] (e.g. 364-32) */}
                            <div className="min-h-[22px] flex items-center mb-1">
                              {isAllocated ? (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-maroon-700/40 text-gold-300 border border-gold-500/30 truncate max-w-full">
                                  🪑 {pc.allocatedTo.tag}
                                </span>
                              ) : (
                                <span className={`text-[10px] font-mono font-semibold ${
                                  unallocatedOnly ? 'text-emerald-300 font-bold animate-pulse' : 'text-slate-500'
                                }`}>
                                  Vacant
                                </span>
                              )}
                            </div>

                            {/* PC Status Badge Label */}
                            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 border-t border-white/5 pt-1">
                              <span className={pc.status === 'Needs Repair' ? 'text-rose-400 font-bold' : pc.status === 'Fixed' ? 'text-cyan-400' : 'text-slate-400'}>
                                {pc.status}
                              </span>
                              {pc.notes?.length > 0 && (
                                <span className="text-gold-400 font-semibold" title={`${pc.notes.length} custom notes logged`}>
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
      <div className="max-w-7xl mx-auto p-4 rounded-3xl border border-dashed border-gold-500/30 bg-gold-950/10 flex items-center justify-between text-xs text-slate-400 font-mono">
        <span>SOUTH ENTRANCE & WALKWAY AISLE • ALL WORKSTATIONS NETWORK TERMINATED</span>
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-300">CAMPUS CORRIDOR EXIT</span>
          <span className="w-2.5 h-2.5 rounded-full bg-gold-400" />
        </div>
      </div>

    </div>
  );
}
