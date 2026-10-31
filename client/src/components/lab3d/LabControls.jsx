import React from 'react';
import { 
  Compass, 
  Map, 
  Search, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Eye, 
  Sparkles,
  Building2,
  Terminal,
  Code2,
  Flame,
  Zap
} from 'lucide-react';
import { DEPARTMENT_LABS } from '../../context/LabDataContext';

export default function LabControls({
  activeLabId,
  onSelectLab,
  activeFilter,
  setActiveFilter,
  selectedStationId,
  onSelectStationId,
  workstations,
  onSetCameraPreset,
  is2DView,
  setIs2DView,
}) {
  // Workstations in the active lab or all
  const filteredStations = activeLabId === 'all'
    ? workstations
    : workstations.filter((w) => w.labId === activeLabId);

  const operationalCount = filteredStations.filter((w) => w.status === 'healthy').length;
  const minorIssueCount = filteredStations.filter((w) => w.status === 'warning').length;
  const maintenanceCount = filteredStations.filter((w) => w.status === 'faulty').length;

  const getLabIcon = (id) => {
    switch (id) {
      case 'lab_201': return Terminal;
      case 'lab_203': return Code2;
      case 'lab_302': return Flame;
      case 'lab_ec': return Zap;
      default: return Building2;
    }
  };

  return (
    <div className="absolute top-4 left-4 right-4 z-20 flex flex-col gap-3 pointer-events-none">
      
      {/* Top Bar: Lab Switcher Navigation Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Department Lab Selector Tabs */}
        <div className="bg-zinc-950/90 backdrop-blur-xl p-1.5 rounded-2xl border border-gold-500/30 shadow-2xl flex flex-wrap items-center gap-1.5 pointer-events-auto">
          <div className="px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-gold-400 flex items-center space-x-1.5 border-r border-white/10 mr-1 hidden sm:flex">
            <Building2 className="w-3.5 h-3.5 text-gold-400" />
            <span>CSE Labs:</span>
          </div>

          {DEPARTMENT_LABS.map((lab) => {
            const Icon = getLabIcon(lab.id);
            const isSelected = activeLabId === lab.id;

            return (
              <button
                key={lab.id}
                onClick={() => onSelectLab(lab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-maroon-800 to-gold-800 text-white font-bold border border-gold-400/50 shadow-glow-maroon scale-102'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
                title={lab.description}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-gold-300' : 'text-slate-400'}`} />
                <span>{lab.code}</span>
                <span className="text-[10px] opacity-75 hidden md:inline">({lab.shortName})</span>
              </button>
            );
          })}

          <button
            onClick={() => onSelectLab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeLabId === 'all'
                ? 'bg-gradient-to-r from-maroon-800 to-gold-800 text-white font-bold border border-gold-400/50 shadow-glow-maroon'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            title="View all 4 Department Labs simultaneously in the 3D Digital Twin"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>All Labs Twin</span>
          </button>
        </div>

        {/* 2D / 3D Mode Toggle */}
        <div className="bg-zinc-950/90 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-xl flex items-center space-x-1 pointer-events-auto">
          <button
            onClick={() => setIs2DView(false)}
            className={`px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 font-medium transition-all ${
              !is2DView
                ? 'bg-gradient-to-r from-maroon-800 to-gold-700 text-white font-bold border border-gold-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-gold-300" />
            <span>3D Twin</span>
          </button>
          <button
            onClick={() => setIs2DView(true)}
            className={`px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 font-medium transition-all ${
              is2DView
                ? 'bg-gradient-to-r from-maroon-800 to-gold-700 text-white font-bold border border-gold-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Map className="w-3.5 h-3.5 text-gold-300" />
            <span>2D Tactical Grid</span>
          </button>
        </div>
      </div>

      {/* Secondary Bar: Live Status Filters & Quick Jump */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Status Filter Pills (Green = Operational, Yellow = Minor Issue, Red = Maintenance Needed) */}
        <div className="bg-zinc-950/90 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-lg flex items-center space-x-1.5 text-xs pointer-events-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded-xl transition-all ${
              activeFilter === 'all'
                ? 'bg-white/10 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All PCs ({filteredStations.length})
          </button>

          <button
            onClick={() => setActiveFilter('healthy')}
            className={`px-2.5 py-1 rounded-xl flex items-center space-x-1.5 transition-all ${
              activeFilter === 'healthy'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 font-bold'
                : 'text-emerald-400/80 hover:text-emerald-300'
            }`}
            title="Operational PCs (Green)"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Operational ({operationalCount})</span>
          </button>

          <button
            onClick={() => setActiveFilter('warning')}
            className={`px-2.5 py-1 rounded-xl flex items-center space-x-1.5 transition-all ${
              activeFilter === 'warning'
                ? 'bg-amber-950 text-amber-300 border border-amber-500/50 font-bold'
                : 'text-amber-400/80 hover:text-amber-300'
            }`}
            title="Minor Issue PCs (Yellow)"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Minor Issue ({minorIssueCount})</span>
          </button>

          <button
            onClick={() => setActiveFilter('faulty')}
            className={`px-2.5 py-1 rounded-xl flex items-center space-x-1.5 transition-all ${
              activeFilter === 'faulty'
                ? 'bg-maroon-950 text-rose-300 border border-rose-500/60 shadow-glow-maroon font-bold'
                : 'text-rose-400/80 hover:text-rose-300'
            }`}
            title="Maintenance Needed PCs (Red)"
          >
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
            <span>Maintenance Needed ({maintenanceCount})</span>
          </button>
        </div>

        {/* Right side: Camera Presets & Jump to Workstation */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          {!is2DView && (
            <div className="bg-zinc-950/90 backdrop-blur-xl px-3 py-1.5 rounded-2xl border border-white/10 shadow-lg flex items-center space-x-2 text-xs">
              <Eye className="w-3.5 h-3.5 text-gold-400" />
              <select
                onChange={(e) => onSetCameraPreset(e.target.value)}
                defaultValue="room"
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs"
              >
                <option value="room" className="bg-zinc-900 text-white">Lab Room Focus</option>
                <option value="colA" className="bg-zinc-900 text-white">Column A (PC 01-04)</option>
                <option value="colB" className="bg-zinc-900 text-white">Column B (PC 05-08)</option>
                <option value="topdown" className="bg-zinc-900 text-white">Top-Down Plan</option>
                <option value="campus" className="bg-zinc-900 text-white">All Labs Overview</option>
              </select>
            </div>
          )}

          {/* Jump to Specific PC */}
          <div className="bg-zinc-950/90 backdrop-blur-xl px-3 py-1.5 rounded-2xl border border-gold-500/30 shadow-lg flex items-center space-x-2 text-xs">
            <Search className="w-3.5 h-3.5 text-gold-400" />
            <select
              value={selectedStationId || ''}
              onChange={(e) => onSelectStationId(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer font-mono font-medium text-xs max-w-[170px]"
            >
              <option value="" className="bg-zinc-900 text-slate-400">Jump to Station...</option>
              {filteredStations.map((ws) => (
                <option key={ws.id} value={ws.id} className="bg-zinc-900 text-white">
                  {ws.labCode} • {ws.columnLabel} {ws.displayId} ({ws.status === 'healthy' ? 'Operational' : ws.status === 'warning' ? 'Minor Issue' : 'Maintenance'})
                </option>
              ))}
            </select>
          </div>

          {!is2DView && (
            <button
              onClick={() => onSetCameraPreset('room')}
              className="p-2 rounded-2xl bg-zinc-950/90 border border-white/10 text-slate-400 hover:text-white hover:border-gold-500/40 transition-colors shadow-lg"
              title="Reset Camera to Room Overview"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
