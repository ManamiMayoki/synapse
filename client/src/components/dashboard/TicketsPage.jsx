import React, { useState } from 'react';
import { useLabData } from '../../context/LabDataContext';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { 
  Wrench, 
  Search, 
  Filter, 
  Plus, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  User,
  Layers
} from 'lucide-react';

export default function TicketsPage() {
  const { tickets, createTicket, updateTicketStatus, workstations } = useLabData();
  const { user, role } = useAuth();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);

  // New ticket state
  const [workstationId, setWorkstationId] = useState(() => workstations[0]?.id || 'Lab201-PC-01');
  const [category, setCategory] = useState('Hardware');
  const [priority, setPriority] = useState('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.workstationId.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesCat = categoryFilter === 'All' || t.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCat;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    createTicket({
      workstationId,
      category,
      priority,
      title,
      description,
      reporter: `${user?.name || 'Student'} (${user?.studentId || 'CSE'})`,
    });

    setModalOpen(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            PC & Hardware Maintenance Queue
          </h2>
          <p className="text-xs text-slate-400">
            Real-time incident tracking across all {workstations.length} department workstations (Lab 201, 203, 302, EC Lab)
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-maroon-700 to-gold-600 hover:from-maroon-600 hover:to-gold-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-glow-maroon self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Incident</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search tickets by ID, workstation, keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-gold-400"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1">
          {['All', 'pending', 'in_progress', 'resolved'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === s
                  ? 'bg-gradient-to-r from-maroon-800 to-gold-800 text-white border border-gold-400/40 shadow-sm'
                  : 'bg-zinc-900 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {s === 'All' ? 'All Statuses' : s.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.map((t) => (
          <div
            key={t.id}
            className="rounded-2xl glass-card p-5 hover:border-gold-500/30 transition-all space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-sm font-extrabold text-gold-400 bg-gold-500/10 px-2.5 py-1 rounded-lg border border-gold-500/20">
                  {t.workstationId}
                </span>
                <span className="font-mono text-xs text-slate-500 font-semibold">{t.id}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-semibold border border-slate-700">
                  {t.category}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <StatusBadge status={t.priority} size="xs" />
                <StatusBadge status={t.status} />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">{t.title}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t.description}</p>
            </div>

            {t.notes && (
              <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-300">
                <strong>Technician Log:</strong> {t.notes}
              </div>
            )}

            <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <div className="flex items-center space-x-4">
                <span>Reporter: <strong className="text-slate-300">{t.reporter}</strong></span>
                <span>Assigned: <strong className="text-slate-300">{t.assignedTo}</strong></span>
              </div>

              {(role === 'staff' || role === 'admin') && t.status !== 'resolved' && (
                <div className="flex items-center space-x-2">
                  {t.status === 'pending' && (
                    <button
                      onClick={() => updateTicketStatus(t.id, 'in_progress')}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-semibold transition-colors"
                    >
                      Start Service
                    </button>
                  )}
                  <button
                    onClick={() => updateTicketStatus(t.id, 'resolved', 'Resolved by technician.')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold transition-colors"
                  >
                    Mark Resolved
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New Incident Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Report Laboratory Workstation Issue"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Workstation ID
              </label>
              <select
                value={workstationId}
                onChange={(e) => setWorkstationId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-gold-400 cursor-pointer font-mono"
              >
                {workstations.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.labCode} • {ws.columnLabel} {ws.displayId}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-gold-400 cursor-pointer"
              >
                <option value="Hardware">Hardware (GPU/Motherboard)</option>
                <option value="Software">Software (OS/CUDA/Drivers)</option>
                <option value="Network">Network (Ethernet/DNS)</option>
                <option value="Peripheral">Peripheral (Keyboard/Mouse)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Priority
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['low', 'medium', 'high', 'critical'].map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`py-1.5 text-xs font-bold rounded-lg border uppercase tracking-wider transition-all ${
                    priority === p
                      ? 'bg-gradient-to-r from-maroon-800 to-gold-700 text-white border-gold-400 shadow-sm'
                      : 'bg-zinc-900 text-slate-400 border-white/5 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Incident Summary
            </label>
            <input
              type="text"
              required
              placeholder="e.g. GPU thermal throttling during benchmark"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-gold-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Detailed Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe symptoms, steps to reproduce, or error messages..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-gold-400 resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-maroon-700 to-gold-600 text-white text-xs font-bold flex items-center space-x-1.5 shadow-glow-maroon"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit to Triage Queue</span>
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
