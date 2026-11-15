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
    if (!table) return;
    setEditTableModal(table);
    const eq = table.equipment || {};
    setEditBreadboards(eq.breadboards ?? 4);
    setEditResistorKits(eq.resistorKits ?? 3);
    setEditVoltageMeters(eq.voltageMeters ?? 2);
    setEditAmmeters(eq.ammeters ?? 2);
    setEditMultimeters(eq.multimeters ?? 2);
    setEditOscilloscopes(eq.oscilloscopes ?? 1);
    setEditNotes(eq.notes || '');
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
    return (workstations || []).find((w) => w && w.pcId === pcId) || null;
  };

  return (
    <div className="w-full p-6 sm:p-8 bg-slate-50 min-h-[700px] space-y-6">
      
      {/* EC Lab Architecture Header Banner */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/30">
            <Zap className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                Lab 101 • Electrical & Electronics Lab (EC Lab)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                1st Floor
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Layout: <strong className="text-slate-700">4 rows × 2 columns (8 Long Workbenches)</strong> with Electronic Equipment Tracking. Contains <strong className="text-maroon-750 font-bold">exactly 2 PCs</strong> (Bench 1 & Bench 8).
            </p>
          </div>
        </div>

        {/* Global Component Totals */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold">
            <span className="text-maroon-700 font-bold">32</span> Breadboards
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold">
            <span className="text-maroon-700 font-bold">16</span> Voltmeters
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold">
            <span className="text-maroon-700 font-bold">16</span> Ammeters
          </div>
        </div>
      </div>

      {/* 4 Rows x 2 Columns Grid of Tables */}
      <div className="space-y-6">
        {rows.map((rowNum) => {
          const rowTables = (ecTables || []).filter((t) => t && t.row === rowNum).sort((a, b) => (a.col || 0) - (b.col || 0));

          return (
            <div key={rowNum} className="space-y-3">
              <div className="flex items-center space-x-2 px-1">
                <span className="w-2.5 h-2.5 rounded-full bg-maroon-600" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-700">
                  Bench Row {rowNum} (Tables {(rowNum - 1) * 2 + 1} & {(rowNum - 1) * 2 + 2})
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {rowTables.map((table) => {
                  const tablePc = table.hasPc ? getWorkstation(table.pcId) : null;

                  return (
                    <div
                      key={table.tableId}
                      className={`rounded-2xl p-6 border transition-all duration-200 ${
                        table.hasPc
                          ? 'border-maroon-200 bg-white shadow-sm hover:border-maroon-300 hover:shadow'
                          : 'border-slate-200 bg-white shadow-sm hover:border-slate-300'
                      }`}
                    >
                      {/* Table Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-sm text-slate-700">
                            {table.tableId.replace('Table-', 'T')}
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-slate-800">{table.label}</h4>
                            <p className="text-xs text-slate-500">
                              Electronic Prototyping Workstation
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {(role === 'staff' || role === 'teacher' || role === 'admin') && (
                            <button
                              onClick={() => handleOpenEdit(table)}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center space-x-1.5 transition-colors border border-slate-200"
                              title="Update electronic equipment quantities"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-maroon-700" />
                              <span>Edit Gear</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Electronic Equipment Tracking Breakdown */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 text-xs font-mono">
                        {/* 1. Breadboards */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="flex items-center space-x-1.5 text-slate-600 font-semibold text-xs">
                            <Layers className="w-4 h-4 text-blue-600" />
                            <span>Breadboards</span>
                          </div>
                          <p className="text-base font-bold text-slate-900 mt-1">
                            {table.equipment.breadboards} units
                          </p>
                          <p className="text-xs text-slate-500">830 tie-point dual bus</p>
                        </div>

                        {/* 2. Resistors */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="flex items-center space-x-1.5 text-slate-600 font-semibold text-xs">
                            <Cpu className="w-4 h-4 text-purple-600" />
                            <span>Resistor Kits</span>
                          </div>
                          <p className="text-base font-bold text-slate-900 mt-1">
                            {table.equipment.resistorKits} packs
                          </p>
                          <p className="text-xs text-slate-500">220Ω, 1kΩ, 10kΩ</p>
                        </div>

                        {/* 3. Voltage Meters */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="flex items-center space-x-1.5 text-slate-600 font-semibold text-xs">
                            <Gauge className="w-4 h-4 text-amber-600" />
                            <span>Voltage Meters</span>
                          </div>
                          <p className="text-base font-bold text-slate-900 mt-1">
                            {table.equipment.voltageMeters} units
                          </p>
                          <p className="text-xs text-slate-500">0-30V DC calibrated</p>
                        </div>

                        {/* 4. Ammeters */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="flex items-center space-x-1.5 text-slate-600 font-semibold text-xs">
                            <Sliders className="w-4 h-4 text-rose-600" />
                            <span>Ammeters</span>
                          </div>
                          <p className="text-base font-bold text-slate-900 mt-1">
                            {table.equipment.ammeters} units
                          </p>
                          <p className="text-xs text-slate-500">0-5A dual-scale</p>
                        </div>

                        {/* 5. Multimeters */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="flex items-center space-x-1.5 text-slate-600 font-semibold text-xs">
                            <Activity className="w-4 h-4 text-emerald-600" />
                            <span>Multimeters</span>
                          </div>
                          <p className="text-base font-bold text-slate-900 mt-1">
                            {table.equipment.multimeters} units
                          </p>
                          <p className="text-xs text-slate-500">Rigol 5½ digit DMM</p>
                        </div>

                        {/* 6. Oscilloscopes */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="flex items-center space-x-1.5 text-slate-600 font-semibold text-xs">
                            <Zap className="w-4 h-4 text-amber-600" />
                            <span>Oscilloscope</span>
                          </div>
                          <p className="text-base font-bold text-slate-900 mt-1">
                            {table.equipment.oscilloscopes > 0 ? `${table.equipment.oscilloscopes} scope` : 'Shared'}
                          </p>
                          <p className="text-xs text-slate-500">Rigol 50MHz 4CH</p>
                        </div>
                      </div>

                      {/* Bench Status Note */}
                      {table.equipment.notes && (
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center space-x-2 mb-3">
                          <span className="font-bold">📝 Bench Note:</span>
                          <span className="truncate">{table.equipment.notes}</span>
                        </div>
                      )}

                      {/* EXACTLY 2 PCs SECTION: If this table contains one of the 2 PCs in Lab 101 */}
                      {table.hasPc && tablePc && (
                        <div 
                          onClick={() => onSelectStation(tablePc)}
                          className={`mt-3 p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                            tablePc.status === 'Needs Repair'
                              ? 'bg-rose-50 border-rose-200 hover:border-rose-300'
                              : 'bg-slate-50 border-slate-200 hover:border-maroon-300 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-mono font-bold text-sm text-slate-700 shadow-sm">
                              💻
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-mono font-bold text-sm text-slate-800 group-hover:text-maroon-700 transition-colors">
                                  {tablePc.pcId} ({tablePc.displayId})
                                </span>
                                <StatusBadge status={tablePc.status} size="xs" />
                              </div>
                              <p className="text-xs text-slate-500">
                                {table.tableId === 'Table-01' ? 'Master DAQ & LabVIEW Bridge PC' : 'Circuit Test Station PC'}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            {tablePc.allocatedTo?.tag ? (
                              <span className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-maroon-50 text-maroon-800 border border-maroon-200">
                                🪑 [{tablePc.allocatedTo.tag}]
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md font-mono text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                Unallocated
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {!table.hasPc && (
                        <div className="text-xs text-slate-500 font-mono text-center pt-2 border-t border-slate-100">
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
                <label className="block font-semibold uppercase text-slate-700 mb-1">Breadboards</label>
                <input
                  type="number"
                  min="0"
                  value={editBreadboards}
                  onChange={(e) => setEditBreadboards(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-maroon-600/20"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-700 mb-1">Resistor Kits</label>
                <input
                  type="number"
                  min="0"
                  value={editResistorKits}
                  onChange={(e) => setEditResistorKits(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-maroon-600/20"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-700 mb-1">Voltage Meters (DC)</label>
                <input
                  type="number"
                  min="0"
                  value={editVoltageMeters}
                  onChange={(e) => setEditVoltageMeters(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-maroon-600/20"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-700 mb-1">Ammeters (DC 0-5A)</label>
                <input
                  type="number"
                  min="0"
                  value={editAmmeters}
                  onChange={(e) => setEditAmmeters(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-maroon-600/20"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-700 mb-1">Multimeters</label>
                <input
                  type="number"
                  min="0"
                  value={editMultimeters}
                  onChange={(e) => setEditMultimeters(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-maroon-600/20"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-700 mb-1">Oscilloscopes</label>
                <input
                  type="number"
                  min="0"
                  value={editOscilloscopes}
                  onChange={(e) => setEditOscilloscopes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-maroon-600/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Bench Diagnostic Notes</label>
              <textarea
                rows={2}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="e.g. Lead calibration checked on 2026-10-25"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-maroon-600/20"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setEditTableModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-maroon-700 hover:bg-maroon-800 text-white text-xs font-bold shadow-sm"
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
