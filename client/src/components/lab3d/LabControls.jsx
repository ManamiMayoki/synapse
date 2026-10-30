import React from 'react';
import { 
  Eye, 
  RotateCcw, 
  Search, 
  Filter, 
  Compass, 
  Layers, 
  Map, 
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon
} from 'lucide-react';

export default function LabControls({
  activeFilter,
  setActiveFilter,
  selectedStationId,
  onSelectStationId,
  workstations,
  onSetCameraPreset,
  is2DView,
  setIs2DView,
}) {
  const healthyCount = workstations.filter((w) => w.status === 'healthy').length;
  const warningCount = workstations.filter((w) => w.status === 'warning').length;
  const faultyCount = workstations.filter((w) => w.status === 'faulty').length;

  return (
    <div className="absolute top-4 left-4 right-4 z-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pointer-events-none">
      
      {/* Left side: View Mode & Filter Badges */}
      <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
        {/* 2D / 3D View Toggle */}
        <div className="bg-zinc-950/85 backdrop-blur-xl p-1 rounded-xl border border-gold-500/30 shadow-lg flex items-center space-x-1 text-xs">
          <button
            onClick={() => setIs2DView(false)}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-medium transition-all ${
              !is2DView
                ? 'bg-gradient-to-r from-maroon-800 to-gold-800 text-white font-bold border border-gold-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-gold-300" />
            <span>3D Twin</span>
          </button>
          <button
            onClick={() => setIs2DView(true)}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-medium transition-all ${
              is2DView
                ? 'bg-gradient-to-r from-maroon-800 to-gold-800 text-white font-bold border border-gold-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Map className="w-3.5 h-3.5 text-gold-300" />
            <span>2D Tactical Grid</span>
          </button>
        </div>

        {/* Status Filters */}
        <div className="bg-zinc-950/85 backdrop-blur-xl p-1 rounded-xl border border-white/10 shadow-lg flex items-center space-x-1 text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeFilter === 'all'
                ? 'bg-white/10 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({workstations.length})
          </button>
          <button
            onClick={() => setActiveFilter('healthy')}
            className={`px-2.5 py-1 rounded-lg flex items-center space-x-1 transition-all ${
              activeFilter === 'healthy'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-semibold'
                : 'text-emerald-400/70 hover:text-emerald-300'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Healthy ({healthyCount})</span>
          </button>
          <button
            onClick={() => setActiveFilter('warning')}
            className={`px-2.5 py-1 rounded-lg flex items-center space-x-1 transition-all ${
              activeFilter === 'warning'
                ? 'bg-amber-950 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-amber-400/70 hover:text-amber-300'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>Warning ({warningCount})</span>
          </button>
          <button
            onClick={() => setActiveFilter('faulty')}
            className={`px-2.5 py-1 rounded-lg flex items-center space-x-1 transition-all ${
              activeFilter === 'faulty'
                ? 'bg-maroon-950 text-rose-300 border border-rose-500/50 shadow-glow-maroon font-semibold'
                : 'text-rose-400/80 hover:text-rose-300'
            }`}
          >
            <AlertOctagon className="w-3 h-3 text-rose-400" />
            <span>Faulty ({faultyCount})</span>
          </button>
        </div>
      </div>

      {/* Right side: Camera Angles & Quick Station Selector */}
      <div className="flex items-center space-x-2 pointer-events-auto">
        {/* Camera Preset Dropdown (3D Mode) */}
        {!is2DView && (
          <div className="bg-zinc-950/85 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-white/10 shadow-lg flex items-center space-x-2 text-xs">
            <Eye className="w-3.5 h-3.5 text-gold-400" />
            <select
              onChange={(e) => onSetCameraPreset(e.target.value)}
              defaultValue="isometric"
              className="bg-transparent text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="isometric" className="bg-zinc-900 text-white">Isometric View</option>
              <option value="row1" className="bg-zinc-900 text-white">Row 1 Focus</option>
              <option value="row2" className="bg-zinc-900 text-white">Row 2 Focus</option>
              <option value="row3" className="bg-zinc-900 text-white">Row 3 Focus</option>
              <option value="row4" className="bg-zinc-900 text-white">Row 4 Focus</option>
              <option value="topdown" className="bg-zinc-900 text-white">Top-Down Angle</option>
            </select>
          </div>
        )}

        {/* Workstation Quick Jump */}
        <div className="bg-zinc-950/85 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-gold-500/30 shadow-lg flex items-center space-x-2 text-xs">
          <Search className="w-3.5 h-3.5 text-gold-400" />
          <select
            value={selectedStationId || ''}
            onChange={(e) => onSelectStationId(e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer font-mono font-medium"
          >
            <option value="" className="bg-zinc-900 text-slate-400">Jump to Station...</option>
            {workstations.map((ws) => (
              <option key={ws.id} value={ws.id} className="bg-zinc-900 text-white">
                {ws.id} ({ws.status})
              </option>
            ))}
          </select>
        </div>

        {/* Reset Camera Button */}
        {!is2DView && (
          <button
            onClick={() => onSetCameraPreset('isometric')}
            className="p-2 rounded-xl bg-zinc-950/85 border border-white/10 text-slate-400 hover:text-white hover:border-gold-500/40 transition-colors shadow-lg"
            title="Reset Camera Position"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

    </div>
  );
}
