import React, { useState } from 'react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { useLabData } from '../../context/LabDataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Cpu, 
  HardDrive, 
  Monitor, 
  Wifi, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  Layers, 
  Clock, 
  ShieldAlert,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function WorkstationModal({ station, onClose }) {
  const { role, user } = useAuth();
  const { createTicket, inventory, checkoutItem, updateWorkstationStatus } = useLabData();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('specs'); // 'specs' | 'report' | 'checkout' | 'admin'

  // Ticket Form State
  const [ticketCategory, setTicketCategory] = useState('Hardware');
  const [ticketPriority, setTicketPriority] = useState('medium');
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Equipment Checkout State
  const [selectedGearId, setSelectedGearId] = useState('');

  if (!station) return null;

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketTitle.trim()) {
      addToast('Please provide a brief title describing the issue.', 'warning', 'Missing Details');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      createTicket({
        workstationId: station.id,
        category: ticketCategory,
        priority: ticketPriority,
        title: ticketTitle,
        description: ticketDescription || 'Reported from 3D Lab Station Inspector.',
        reporter: `${user?.name || 'Student'} (${user?.studentId || user?.staffId || 'CSE'})`,
      });

      setIsSubmitting(false);
      setTicketTitle('');
      setTicketDescription('');
      setActiveTab('specs');
    }, 400);
  };

  const handleGearCheckout = () => {
    if (!selectedGearId) {
      addToast('Please select a piece of hardware from the catalog.', 'warning', 'No Item Selected');
      return;
    }

    const success = checkoutItem({
      itemId: selectedGearId,
      studentId: user?.studentId || 'CSE-2022-042',
      studentName: user?.name || 'Alex Vance',
      days: 7,
    });

    if (success) {
      setSelectedGearId('');
      setActiveTab('specs');
    }
  };

  return (
    <Modal
      isOpen={!!station}
      onClose={onClose}
      title={`${station.id} — Workstation Inspector`}
      maxWidth="max-w-2xl"
    >
      {/* Top Banner with Status & Quick ID */}
      <div className="p-4 rounded-xl glass-card bg-zinc-950/80 mb-6 flex flex-wrap items-center justify-between gap-4 border-gold-500/20">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-maroon-800 to-gold-700/60 flex items-center justify-center font-mono font-black text-xl text-gold-300 shadow-glow-maroon border border-gold-500/40">
            {station.number}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-lg font-bold text-white tracking-wide">{station.id}</h4>
              <StatusBadge status={station.status} />
            </div>
            <p className="text-xs text-slate-400">
              Row {station.row} • Position {station.column} • {station.currentOccupant}
            </p>
          </div>
        </div>

        {/* Predictive AI Risk Pill */}
        <div className="text-right">
          <div className="flex items-center space-x-1.5 justify-end">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              AI Risk Index
            </span>
          </div>
          <p
            className={`text-lg font-extrabold font-mono ${
              station.riskScore > 80
                ? 'text-rose-400'
                : station.riskScore > 50
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {station.riskScore}% Probability
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center space-x-2 border-b border-white/10 mb-6 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('specs')}
          className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
            activeTab === 'specs'
              ? 'bg-gold-500/15 text-gold-300 border border-gold-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Hardware Specs</span>
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
            activeTab === 'report'
              ? 'bg-maroon-700/30 text-rose-300 border border-maroon-600/40 shadow-glow-maroon'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Report Issue</span>
        </button>

        <button
          onClick={() => setActiveTab('checkout')}
          className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
            activeTab === 'checkout'
              ? 'bg-gold-500/15 text-gold-300 border border-gold-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Lab Checkout</span>
        </button>

        {(role === 'staff' || role === 'admin') && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'admin'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Staff Overrides</span>
          </button>
        )}
      </div>

      {/* TAB 1: Hardware Specs */}
      {activeTab === 'specs' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 flex items-start space-x-3">
              <Cpu className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-400 font-medium">Processor (CPU)</p>
                <p className="text-white font-semibold">{station.specs.cpu}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 flex items-start space-x-3">
              <Sparkles className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-400 font-medium">Graphics Engine (GPU)</p>
                <p className="text-white font-semibold">{station.specs.gpu}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 flex items-start space-x-3">
              <HardDrive className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-400 font-medium">Memory & Storage</p>
                <p className="text-white font-semibold">
                  {station.specs.ram} • {station.specs.storage}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 flex items-start space-x-3">
              <Monitor className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-400 font-medium">Display Matrix</p>
                <p className="text-white font-semibold">{station.specs.displays}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 flex items-start space-x-3">
              <Wifi className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-400 font-medium">Network Interfaces</p>
                <p className="font-mono text-white font-semibold">
                  IP: {station.specs.ipAddress}
                </p>
                <p className="font-mono text-[10px] text-slate-400">
                  MAC: {station.specs.macAddress}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 flex items-start space-x-3">
              <Clock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-400 font-medium">Operating System & Maint.</p>
                <p className="text-white font-semibold">{station.specs.os}</p>
                <p className="text-[10px] text-slate-400">Last Serviced: {station.lastMaintenance}</p>
              </div>
            </div>
          </div>

          {station.alertMessage && (
            <div className="p-3.5 rounded-xl bg-maroon-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>
                <strong>Active Diagnostic Alert:</strong> {station.alertMessage}
              </span>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setActiveTab('report')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-maroon-700 to-gold-600 hover:from-maroon-600 hover:to-gold-500 text-white text-xs font-semibold flex items-center space-x-2 transition-all shadow-md"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Report Fault on {station.id}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Instant Issue Reporting */}
      {activeTab === 'report' && (
        <form onSubmit={handleTicketSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Incident Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Hardware', 'Software', 'Network'].map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setTicketCategory(cat)}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                    ticketCategory === cat
                      ? 'bg-maroon-800/80 text-white border-gold-500/40 shadow-sm'
                      : 'bg-zinc-900/80 text-slate-400 border-white/5 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Severity / Priority
            </label>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {[
                { level: 'low', label: 'Low', color: 'border-slate-600' },
                { level: 'medium', label: 'Medium', color: 'border-amber-500/40' },
                { level: 'high', label: 'High', color: 'border-maroon-600/60' },
                { level: 'critical', label: 'Critical', color: 'border-rose-600' },
              ].map((p) => (
                <button
                  type="button"
                  key={p.level}
                  onClick={() => setTicketPriority(p.level)}
                  className={`py-1.5 font-medium rounded-lg border transition-all ${
                    ticketPriority === p.level
                      ? 'bg-gradient-to-r from-maroon-800 to-gold-700 text-white font-bold border-gold-400 shadow-sm'
                      : 'bg-zinc-900/70 text-slate-400 border-white/5 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Issue Summary
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Display artifacting, Blue screen, Loose USB port"
              value={ticketTitle}
              onChange={(e) => setTicketTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-gold-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Detailed Symptoms (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Describe error messages, steps to reproduce, or odd fan noise..."
              value={ticketDescription}
              onChange={(e) => setTicketDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-gold-400 transition-colors resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Station {station.id} will be flagged for staff inspection.
            </span>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-maroon-700 to-gold-600 hover:from-maroon-600 hover:to-gold-500 text-white text-xs font-bold flex items-center space-x-2 transition-all shadow-glow-maroon disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Maintenance Ticket'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: Lab Equipment Checkout */}
      {activeTab === 'checkout' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Reserve testing gear, microcontrollers, or embedded dev kits for use at workstation{' '}
            <strong className="text-gold-300">{station.id}</strong>.
          </p>

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Select Available Hardware
            </label>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {inventory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => item.availableQty > 0 && setSelectedGearId(item.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                    selectedGearId === item.id
                      ? 'bg-gold-500/15 border-gold-400 shadow-sm text-white'
                      : item.availableQty > 0
                      ? 'bg-zinc-900/60 border-white/5 hover:border-white/20 text-slate-300'
                      : 'bg-zinc-900/30 border-white/5 opacity-50 cursor-not-allowed text-slate-500'
                  }`}
                >
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {item.sku} • {item.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-mono text-xs font-bold ${
                        item.availableQty > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {item.availableQty} available
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Standard checkout period: 7 Days</span>
            <button
              onClick={handleGearCheckout}
              disabled={!selectedGearId}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-maroon-700 hover:from-gold-500 hover:to-maroon-600 text-white text-xs font-bold flex items-center space-x-2 transition-all shadow-md disabled:opacity-40"
            >
              <span>Confirm Lab Checkout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: Staff / Admin Overrides */}
      {activeTab === 'admin' && (role === 'staff' || role === 'admin') && (
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Authorized technician tools to override workstation operational health state directly:
          </p>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => updateWorkstationStatus(station.id, 'healthy')}
              className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 hover:bg-emerald-900/40 text-emerald-300 text-xs font-bold flex flex-col items-center space-y-1 transition-all"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Mark Healthy</span>
              <span className="text-[9px] font-normal text-slate-400">All tests passing</span>
            </button>

            <button
              onClick={() => updateWorkstationStatus(station.id, 'warning')}
              className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 hover:bg-amber-900/40 text-amber-300 text-xs font-bold flex flex-col items-center space-y-1 transition-all"
            >
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Mark Warning</span>
              <span className="text-[9px] font-normal text-slate-400">Needs monitoring</span>
            </button>

            <button
              onClick={() => updateWorkstationStatus(station.id, 'faulty')}
              className="p-3.5 rounded-xl bg-maroon-950/60 border border-rose-500/50 hover:bg-maroon-900/60 text-rose-300 text-xs font-bold flex flex-col items-center space-y-1 transition-all shadow-glow-maroon"
            >
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <span>Mark Maintenance</span>
              <span className="text-[9px] font-normal text-slate-400">Take out of service</span>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
