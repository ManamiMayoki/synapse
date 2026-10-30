import React from 'react';
import StatusBadge from '../common/StatusBadge';
import { Monitor, Cpu, Sparkles, HardDrive, Wifi } from 'lucide-react';

export default function TacticalFloorPlan({
  workstations,
  onSelectStation,
  activeFilter,
}) {
  // Group workstations by row (4 rows)
  const rows = [1, 2, 3, 4];

  return (
    <div className="w-full h-full p-6 overflow-y-auto bg-zinc-975 bg-cyber-grid flex flex-col items-center justify-center min-h-[600px]">
      <div className="max-w-5xl w-full">
        
        {/* Lab Architecture Schematic Header */}
        <div className="mb-6 flex items-center justify-between border-b border-gold-500/20 pb-3">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-gold-400">
              Department of Computer Science & Engineering
            </span>
            <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
              <span>Main High-Performance Computing Lab (HPC-101)</span>
            </h3>
          </div>
          <div className="text-right text-xs font-mono text-slate-400">
            <p>Capacity: 24 Workstations</p>
            <p className="text-gold-400/80">Network: 10 GbE Core Backbone</p>
          </div>
        </div>

        {/* Server Room & Network Rack Banner (Front of Lab) */}
        <div className="w-full mb-8 p-3 rounded-xl border border-dashed border-maroon-600/40 bg-maroon-950/20 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono font-bold text-slate-200">NORTH WALL • MAIN PROJECTOR & INSTRUCTOR CONSOLE</span>
          </div>
          <span className="font-mono text-[11px] text-gold-400">Rack-A / Storage Unit A1-A4</span>
        </div>

        {/* Workstation Rows */}
        <div className="space-y-6">
          {rows.map((rowNum) => {
            const rowStations = workstations.filter((w) => w.row === rowNum);
            return (
              <div key={rowNum} className="relative">
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-mono uppercase tracking-widest text-gold-400/60 font-bold hidden sm:block">
                  Row {rowNum}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:pl-6">
                  {rowStations.map((ws) => {
                    const isFilteredOut =
                      activeFilter !== 'all' && ws.status !== activeFilter;

                    return (
                      <div
                        key={ws.id}
                        onClick={() => onSelectStation(ws)}
                        className={`p-3.5 rounded-xl border transition-all duration-300 cursor-pointer text-left relative overflow-hidden group ${
                          isFilteredOut
                            ? 'opacity-30 pointer-events-none'
                            : ws.status === 'faulty'
                            ? 'bg-maroon-950/70 border-rose-500/60 shadow-glow-maroon hover:border-rose-400'
                            : ws.status === 'warning'
                            ? 'bg-amber-950/50 border-amber-500/50 hover:border-amber-400'
                            : 'bg-zinc-900/80 border-white/10 hover:border-gold-500/50 hover:bg-zinc-850'
                        }`}
                      >
                        {/* Top ID & Status Dot */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono font-bold text-sm text-white group-hover:text-gold-300 transition-colors">
                            {ws.id}
                          </span>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              ws.status === 'faulty'
                                ? 'bg-rose-500 animate-ping'
                                : ws.status === 'warning'
                                ? 'bg-amber-400'
                                : 'bg-emerald-400'
                            }`}
                          />
                        </div>

                        {/* Specs overview */}
                        <div className="text-[10px] text-slate-400 space-y-0.5 mb-2">
                          <p className="truncate text-slate-300 font-medium">
                            {ws.specs.gpu.split(' ')[2]} {ws.specs.gpu.split(' ')[3]}
                          </p>
                          <p className="font-mono text-slate-400">
                            {ws.specs.ipAddress.replace('10.14.', '..')}
                          </p>
                        </div>

                        {/* Occupant / Alert */}
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[9px]">
                          <span className="text-slate-400 truncate max-w-[80px]">
                            {ws.currentOccupant.split(' ')[0]}
                          </span>
                          <span
                            className={`font-mono font-bold ${
                              ws.riskScore > 80
                                ? 'text-rose-400'
                                : ws.riskScore > 50
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {ws.riskScore}% Risk
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* South Wall & Entrance */}
        <div className="w-full mt-8 p-3 rounded-xl border border-dashed border-gold-500/30 bg-gold-950/20 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[11px] text-gold-400">Hardware Prototyping Bench & Soldering Station</span>
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold text-slate-200">SOUTH ENTRY / LAB EXIT DOORS</span>
            <span className="w-2.5 h-2.5 rounded-full bg-gold-400"></span>
          </div>
        </div>

      </div>
    </div>
  );
}
