import React, { useState } from 'react';
import { 
  Zap, 
  Monitor, 
  Cpu, 
  Sliders, 
  Gauge, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Edit3, 
  Layers, 
  Wrench,
  Search,
  Sparkles
} from 'lucide-react';
import { useLabData } from '../../context/LabDataContext';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';

export default function EcLabView({ onSelectStation }) {
  const { 
    ecTables, 
    workstations, 
    updateTableEquipment,
    unallocatedOnly,
    statusFilter,
    searchQuery
  } = useLabData();
  const { role } = useAuth();

  const [editTableModal, setEditTableModal] = useState(null);
  const [editBreadboards, setEditBreadboards] = useState(4);
  const [editResistorKits, setEditResistorKits] = useState(3);
  const [editVoltageMeters, setEditVoltageMeters] = useState(2);
  const [editAmmeters, setEditAmmeters] = useState(2);
  const [editMultimeters, setEditMultimeters] = useState(2);
  const [editOscilloscopes, setEditOscilloscopes] = useState(1);
  const [editNotes, setEditNotes] = useState('');

  // 4 rows x 2 columns = 8 tables
  const rows = [1, 2, 3, 4];

  const handleOpenEdit = (table) => {
    setEditTableModal(table);
    setEditBreadboards(table.equipment.breadboards);
    setEditResistorKits(table.equipment.resistorKits);
    setEditVoltageMeters(table.equipment.voltageMeters);
    setEditAmmeters(table.equipment.ammeters);
    setEditMultimeters(table.equipment.multimeters);
    setEditOscilloscopes(table.equipment.oscilloscopes);
    setEditNotes(table.equipment.notes || '');
  };

  const handleSaveEquipment = async (e) => {
    e.preventDefault();
    if (!editTableModal) return;

    await updateTableEquipment(editTableModal.tableId, {
      breadboards: editBreadboards,
      resistorKits: editResistorKits,
      voltageMeters: editVoltageMeters,
      ammeters: editAmmeters,
      multimeters: editMultimeters,
      oscilloscopes: editOscilloscopes,
      notes: editNotes,
    });

    setEditTableModal(null);
  };

  // Find workstation by pcId
  const getWorkstation = (pcId) => {
    return workstations.find((w) => w.pcId === pcId) || null;
  };

  return (
    <div className="w-full p-6 sm:p-8 bg-zinc-975 bg-cyber-grid min-h-[700px] space-y-6">
      
      {/* EC Lab Architecture Header Banner */}
      <div className="rounded-3xl glass-card p-6 border-gold-500/30 bg-zinc-950/80 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-maroon-800 to-gold-600 flex items-center justify-center border border-gold-500/50 shadow-glow-maroon">
            <Zap className="w-6 h-6 text-gold-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-extrabold text-white tracking-wide">
                Lab 101 • Electrical & Electronics Lab (EC Lab)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gold-500/15 text-gold-300 border border-gold-500/30">
                1st Floor
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Layout: <strong className="text-white">4 rows × 2 columns (8 Long Workbenches)</strong> with Electronic Equipment Tracking. Contains <strong className="text-gold-300 font-bold">exactly 2 PCs</strong> (Bench 1 & Bench 8).
            </p>
          </div>
        </div>

        {/* Global Component Totals */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/5 text-slate-300">
            <span className="text-gold-400 font-bold">32</span> Breadboards
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/5 text-slate-300">
            <span className="text-gold-400 font-bold">16</span> Voltmeters
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/5 text-slate-300">
            <span className="text-gold-400 font-bold">16</span> Ammeters
          </div>
        </div>
      </div>

      {/* 4 Rows x 2 Columns Grid of Tables */}
      <div className="space-y-6">
        {rows.map((rowNum) => {
          const rowTables = ecTables.filter((t) => t.row === rowNum).sort((a, b) => a.col - b.col);

          return (
            <div key={rowNum} className="space-y-2">
              <div className="flex items-center space-x-2 px-1">
                <span className="w-2 h-2 rounded-full bg-gold-400" />
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-gold-300">
                  Bench Row {rowNum} (Tables {(rowNum - 1) * 2 + 1} & {(rowNum - 1) * 2 + 2})
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {rowTables.map((table) => {
                  const tablePc = table.hasPc ? getWorkstation(table.pcId) : null;
                  const isPcMatchesFilter = !tablePc || (
                    (statusFilter === 'All' || tablePc.status === statusFilter) &&
                    (!unallocatedOnly || (!tablePc.allocatedTo || !tablePc.allocatedTo.tag)) &&
                    (!searchQuery || tablePc.pcId.toLowerCase().includes(searchQuery.toLowerCase()) || tablePc.allocatedTo?.tag?.toLowerCase().includes(searchQuery.toLowerCase()))
                  );

                  return (
                    <div
                      key={table.tableId}
                      className={`rounded-3xl glass-card p-6 border transition-all duration-300 ${
                        table.hasPc
                          ? 'border-gold-500/40 bg-zinc-950/85 hover:border-gold-400'
                          : 'border-white/10 bg-zinc-900/60 hover:border-white/20'
                      }`}
                    >
                      {/* Table Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-gold-500/30 flex items-center justify-center font-mono font-extrabold text-sm text-gold-300">
                            {table.tableId.replace('Table-', 'T')}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">{table.label}</h4>
                            <p className="text-[11px] text-slate-400">
                              Electronic Prototyping Workstation
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {(role === 'staff' || role === 'teacher' || role === 'admin') && (
                            <button
                              onClick={() => handleOpenEdit(table)}
                              className="px-2.5 py-1 text-[11px] rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-300 hover:text-white flex items-center space-x-1 border border-white/5 transition-colors"
                              title="Update electronic equipment quantities"
                            >
                              <Edit3 className="w-3 h-3 text-gold-400" />
                              <span>Edit Gear</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Electronic Equipment Tracking Breakdown */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4 text-xs font-mono">
                        {/* 1. Breadboards */}
                        <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-white/5">
                          <div className="flex items-center space-x-1.5 text-slate-400 text-[10px]">
                            <Layers className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Breadboards</span>
                          </div>
                          <p className="text-sm font-bold text-white mt-1">
                            {table.equipment.breadboards} units
                          </p>
                          <p className="text-[9px] text-slate-500">830 tie-point dual bus</p>
                        </div>

                        {/* 2. Resistors */}
                        <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-white/5">
                          <div className="flex items-center space-x-1.5 text-slate-400 text-[10px]">
                            <Cpu className="w-3.5 h-3.5 text-purple-400" />
                            <span>Resistor Kits</span>
                          </div>
                          <p className="text-sm font-bold text-white mt-1">
                            {table.equipment.resistorKits} packs
                          </p>
                          <p className="text-[9px] text-slate-500">220Ω, 1kΩ, 10kΩ</p>
                        </div>

                        {/* 3. Voltage Meters */}
                        <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-white/5">
                          <div className="flex items-center space-x-1.5 text-slate-400 text-[10px]">
                            <Gauge className="w-3.5 h-3.5 text-amber-400" />
                            <span>Voltage Meters</span>
                          </div>
                          <p className="text-sm font-bold text-white mt-1">
                            {table.equipment.voltageMeters} units
                          </p>
                          <p className="text-[9px] text-slate-500">0-30V DC calibrated</p>
                        </div>

                        {/* 4. Ammeters */}
                        <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-white/5">
                          <div className="flex items-center space-x-1.5 text-slate-400 text-[10px]">
                            <Sliders className="w-3.5 h-3.5 text-rose-400" />
                            <span>Ammeters</span>
                          </div>
                          <p className="text-sm font-bold text-white mt-1">
                            {table.equipment.ammeters} units
                          </p>
                          <p className="text-[9px] text-slate-500">0-5A dual-scale</p>
                        </div>

                        {/* 5. Multimeters */}
                        <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-white/5">
                          <div className="flex items-center space-x-1.5 text-slate-400 text-[10px]">
                            <Activity className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Multimeters</span>
                          </div>
                          <p className="text-sm font-bold text-white mt-1">
                            {table.equipment.multimeters} units
                          </p>
                          <p className="text-[9px] text-slate-500">Rigol 5½ digit DMM</p>
                        </div>

                        {/* 6. Oscilloscopes */}
                        <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-white/5">
                          <div className="flex items-center space-x-1.5 text-slate-400 text-[10px]">
                            <Zap className="w-3.5 h-3.5 text-gold-400" />
                            <span>Oscilloscope</span>
                          </div>
                          <p className="text-sm font-bold text-white mt-1">
                            {table.equipment.oscilloscopes > 0 ? `${table.equipment.oscilloscopes} scope` : 'Shared'}
                          </p>
                          <p className="text-[9px] text-slate-500">Rigol 50MHz 4CH</p>
                        </div>
                      </div>

                      {/* Bench Status Note */}
                      {table.equipment.notes && (
                        <div className="p-2.5 rounded-xl bg-zinc-900/40 border border-white/5 text-[11px] text-slate-400 flex items-center space-x-2 mb-3">
                          <span className="text-gold-400">📝 Bench Note:</span>
                          <span className="text-slate-300 truncate">{table.equipment.notes}</span>
                        </div>
                      )}

                      {/* EXACTLY 2 PCs SECTION: If this table contains one of the 2 PCs in Lab 101 */}
                      {table.hasPc && tablePc && (
                        <div 
                          onClick={() => onSelectStation(tablePc)}
                          className={`mt-3 p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                            tablePc.status === 'Needs Repair'
                              ? 'bg-maroon-950/80 border-rose-500/60 shadow-glow-maroon'
                              : 'bg-zinc-900 border-gold-500/40 hover:border-gold-300'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-gold-500/30 flex items-center justify-center font-mono font-black text-xs text-gold-300">
                              💻
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-mono font-bold text-xs text-white group-hover:text-gold-300 transition-colors">
                                  {tablePc.pcId} ({tablePc.displayId})
                                </span>
                                <StatusBadge status={tablePc.status} size="xs" />
                              </div>
                              <p className="text-[10px] text-slate-400">
                                {table.tableId === 'Table-01' ? 'Master DAQ & LabVIEW Bridge PC' : 'Circuit Test Station PC'}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            {tablePc.allocatedTo?.tag ? (
                              <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-maroon-700/40 text-gold-300 border border-gold-500/30">
                                🪑 [{tablePc.allocatedTo.tag}]
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 animate-pulse">
                                Unallocated (Claim)
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {!table.hasPc && (
                        <div className="text-[11px] text-slate-500 font-mono text-center pt-2 border-t border-white/5">
                          Electronics Bench Only • Instruments Connected to Core DC Supply
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Equipment Modal */}
      {editTableModal && (
        <Modal
          isOpen={!!editTableModal}
          onClose={() => setEditTableModal(null)}
          title={`Update Gear on ${editTableModal.tableId} (${editTableModal.label})`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSaveEquipment} className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold uppercase text-slate-300 mb-1">Breadboards</label>
                <input
                  type="number"
                  min="0"
                  value={editBreadboards}
                  onChange={(e) => setEditBreadboards(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-300 mb-1">Resistor Kits</label>
                <input
                  type="number"
                  min="0"
                  value={editResistorKits}
                  onChange={(e) => setEditResistorKits(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-300 mb-1">Voltage Meters (DC)</label>
                <input
                  type="number"
                  min="0"
                  value={editVoltageMeters}
                  onChange={(e) => setEditVoltageMeters(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-300 mb-1">Ammeters (DC 0-5A)</label>
                <input
                  type="number"
                  min="0"
                  value={editAmmeters}
                  onChange={(e) => setEditAmmeters(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-300 mb-1">Multimeters</label>
                <input
                  type="number"
                  min="0"
                  value={editMultimeters}
                  onChange={(e) => setEditMultimeters(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-300 mb-1">Oscilloscopes</label>
                <input
                  type="number"
                  min="0"
                  value={editOscilloscopes}
                  onChange={(e) => setEditOscilloscopes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Bench Diagnostic Notes</label>
              <textarea
                rows={2}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="e.g. Lead calibration checked on 2026-10-25"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setEditTableModal(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-maroon-700 to-gold-600 hover:from-maroon-600 hover:to-gold-500 text-white text-xs font-bold shadow-md"
              >
                Save Equipment Setup
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
