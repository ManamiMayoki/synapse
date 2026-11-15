import React from 'react';
import StatusBadge from '../common/StatusBadge';
import { DEPARTMENT_LABS } from '../../context/LabDataContext';
import { 
  Monitor, 
  Cpu, 
  Sparkles, 
  HardDrive, 
  Wifi, 
  Terminal, 
  Code2, 
  Flame, 
  Zap, 
  Building2,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export default function TacticalFloorPlan({
  activeLabId,
  onSelectLab,
  workstations,
  onSelectStation,
  activeFilter,
}) {
  const getLabIcon = (id) => {
    switch (id) {
      case 'lab_201': return Terminal;
      case 'lab_203': return Code2;
      case 'lab_302': return Flame;
      case 'lab_ec': return Zap;
      default: return Building2;
    }
  };

  // Render a single lab room's 2-column tactical grid
  const renderLabRoomGrid = (lab) => {
    const labStations = workstations.filter((w) => w.labId === lab.id);
    const colA = labStations.filter((w) => w.column === 'A' || w.number <= 4).sort((a, b) => a.number - b.number);
    const colB = labStations.filter((w) => w.column === 'B' || w.number > 4).sort((a, b) => a.number - b.number);
    const Icon = getLabIcon(lab.id);

    return (
      <div 
        key={lab.id} 
        className="rounded-3xl glass-card p-6 border border-gold-500/20 bg-zinc-950/80 shadow-2xl space-y-6"
      >
        {/* Lab Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center p-0.5 border"
              style={{ 
                backgroundColor: `${lab.accentColor}15`, 
                borderColor: `${lab.accentColor}50` 
              }}
            >
              <Icon className="w-5 h-5" style={{ color: lab.accentColor }} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-lg font-extrabold text-white tracking-wide">{lab.code} — {lab.name}</h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-900 border border-white/10 text-gold-300">
                  {lab.floor}
                </span>
              </div>
              <p className="text-xs text-slate-400">{lab.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <div className="px-3 py-1 rounded-xl bg-zinc-900 border border-white/5 text-slate-300">
              <span className="text-gold-400 font-bold">2 Columns:</span> 8 PCs Total
            </div>
            <div className="px-3 py-1 rounded-xl bg-zinc-900 border border-white/5 text-emerald-400">
              <span className="font-bold">{labStations.filter((s) => s.status === 'healthy').length}/8</span> Operational
            </div>
          </div>
        </div>

        {/* North Wall: Smart Board & Instructor Podium */}
        <div className="w-full p-2.5 rounded-xl border border-dashed border-gold-500/30 bg-gold-950/15 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono font-bold text-slate-200">NORTH WALL • INSTRUCTOR PODIUM & 4K SMART PROJECTION MATRIX</span>
          </div>
          <span className="font-mono text-[11px] text-gold-400">10 GbE Core Backbone</span>
        </div>

        {/* 2-Column Workstation Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
          
          {/* COLUMN A: Exactly 4 PCs (PC-01 to PC-04) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2 pb-1 border-b border-white/5">
              <span className="font-mono text-xs font-extrabold text-gold-300 uppercase tracking-widest flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-gold-400" />
                <span>Column A (PC-01 to PC-04)</span>
              </span>
              <span className="text-[11px] text-slate-400">Left Row</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {colA.map((ws) => renderWorkstationCard(ws))}
            </div>
          </div>

          {/* COLUMN B: Exactly 4 PCs (PC-05 to PC-08) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2 pb-1 border-b border-white/5">
              <span className="font-mono text-xs font-extrabold text-gold-300 uppercase tracking-widest flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-gold-400" />
                <span>Column B (PC-05 to PC-08)</span>
              </span>
              <span className="text-[11px] text-slate-400">Right Row</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {colB.map((ws) => renderWorkstationCard(ws))}
            </div>
          </div>

        </div>

        {/* South Wall & Entry Corridor */}
        <div className="w-full p-2.5 rounded-xl border border-dashed border-white/10 bg-zinc-900/40 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[11px] text-slate-400">
            Equipped with: {lab.specialGear.join(' • ')}
          </span>
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold text-slate-300">CENTRAL AISLE ENTRYWAY</span>
            <span className="w-2 h-2 rounded-full bg-gold-400" />
          </div>
        </div>
      </div>
    );
  };

  // Render individual workstation card
  const renderWorkstationCard = (ws) => {
    const isFilteredOut = activeFilter !== 'all' && ws.status !== activeFilter;

    return (
      <div
        key={ws.id}
        onClick={() => onSelectStation(ws)}
        className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer text-left relative overflow-hidden group select-none ${
          isFilteredOut
            ? 'opacity-30 pointer-events-none'
            : ws.status === 'faulty'
            ? 'bg-maroon-950/70 border-rose-500/60 shadow-glow-maroon hover:border-rose-400 hover:scale-102'
            : ws.status === 'warning'
            ? 'bg-amber-950/50 border-amber-500/50 hover:border-amber-400 hover:scale-102'
            : 'bg-zinc-900/80 border-white/10 hover:border-gold-500/60 hover:bg-zinc-850 hover:scale-102'
        }`}
      >
        {/* Top Header with ID & Live Status */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="w-7 h-7 rounded-lg bg-zinc-950 border border-white/10 flex items-center justify-center font-mono font-bold text-xs text-gold-300">
              {ws.displayId.replace('PC-', '')}
            </span>
            <div>
              <span className="font-mono font-bold text-sm text-white group-hover:text-gold-300 transition-colors">
                {ws.displayId}
              </span>
              <p className="text-[10px] text-slate-400 font-mono">{ws.columnLabel}</p>
            </div>
          </div>
          <StatusBadge status={ws.status} size="xs" />
        </div>

        {/* Specs Overview */}
        <div className="text-[11px] text-slate-300 space-y-1 mb-2">
          <p className="truncate font-semibold text-slate-200">
            {ws.specs.gpu.split('(')[0]}
          </p>
          <p className="text-[10px] text-slate-400 font-mono truncate">
            {ws.specs.cpu.split('(')[0]}
          </p>
          <p className="text-[10px] font-mono text-gold-400/90">
            IP: {ws.specs.ipAddress}
          </p>
        </div>

        {/* Alert note if any */}
        {ws.alertMessage && (
          <div className="p-1.5 rounded-lg bg-zinc-950/90 border border-maroon-600/40 text-[10px] text-rose-300 truncate mb-2">
            ⚠️ {ws.alertMessage}
          </div>
        )}

        {/* Card Footer */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
          <span className="text-slate-400 truncate max-w-[90px]">
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
  };

  const displayedLabs = activeLabId === 'all'
    ? DEPARTMENT_LABS
    : DEPARTMENT_LABS.filter((l) => l.id === activeLabId);

  return (
    <div className="w-full h-full p-6 sm:p-8 overflow-y-auto bg-zinc-975 bg-cyber-grid flex flex-col items-center min-h-[700px] select-none">
      <div className="max-w-6xl w-full space-y-8">
        
        {/* Department Schematic Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gold-500/20 pb-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-gold-400">
              Department of Computer Science & Engineering
            </span>
            <h3 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
              <span>Departmental Lab Architecture & Tactical Twin</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Exact 2-column workstation layout (Column A: PC-01 to PC-04 • Column B: PC-05 to PC-08) across all university labs.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {DEPARTMENT_LABS.map((lab) => (
              <button
                key={lab.id}
                onClick={() => onSelectLab(lab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeLabId === lab.id
                    ? 'bg-gradient-to-r from-maroon-800 to-gold-700 text-white font-bold border border-gold-400 shadow-md'
                    : 'bg-zinc-900 text-slate-300 border border-white/5 hover:text-white'
                }`}
              >
                {lab.code}
              </button>
            ))}
            <button
              onClick={() => onSelectLab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeLabId === 'all'
                  ? 'bg-gradient-to-r from-maroon-800 to-gold-700 text-white font-bold border border-gold-400 shadow-md'
                  : 'bg-zinc-900 text-slate-300 border border-white/5 hover:text-white'
              }`}
            >
              All Labs
            </button>
          </div>
        </div>

        {/* Display Lab Grids */}
        <div className="space-y-8">
          {displayedLabs.map((lab) => renderLabRoomGrid(lab))}
        </div>

      </div>
    </div>
  );
}
