import React, { useState } from 'react';
import { useLabData } from '../../context/LabDataContext';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { 
  Search, 
  Plus, 
  Send
} from 'lucide-react';

export default function TicketsPage() {
  const { tickets, createTicket, updateTicketStatus, workstations } = useLabData();
  const { user, role } = useAuth();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);

  // New ticket state
  const [workstationId, setWorkstationId] = useState(() => workstations[0]?.pcId || workstations[0]?.id || 'Lab201-R01-C01-P1');
  const [category, setCategory] = useState('Hardware');
  const [priority, setPriority] = useState('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      (t.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.workstationId || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.id || '').toLowerCase().includes(search.toLowerCase());

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
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            PC & Hardware Maintenance Queue
          </h2>
          <p className="text-sm text-slate-500">
            Real-time incident tracking across all department workstations (Lab 201, 203, 302, EC Lab)
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-maroon-700 hover:bg-maroon-800 text-white font-bold text-sm flex items-center space-x-1.5 transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Incident</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search tickets by ID, workstation, keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-maroon-600 focus:ring-2 focus:ring-maroon-100"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1">
          {['All', 'pending', 'in_progress', 'resolved'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === s
                  ? 'bg-maroon-700 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {s === 'All' ? 'All Statuses' : s.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-white border border-slate-200">
            <p className="text-base font-semibold text-slate-800">No tickets found</p>
            <p className="text-sm text-slate-500 mt-1">Try adjusting search or status filters</p>
          </div>
        ) : (
          filteredTickets.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 hover:border-slate-300 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-sm font-extrabold text-maroon-700 bg-maroon-50 px-2.5 py-1 rounded-lg border border-maroon-200">
                    {t.workstationId}
                  </span>
                  <span className="font-mono text-xs text-slate-400 font-semibold">{t.id}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                    {t.category}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <StatusBadge status={t.priority} size="xs" />
                  <StatusBadge status={t.status} />
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{t.title}</h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">{t.description}</p>
              </div>

              {t.notes && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium">
                  <strong>Technician Log:</strong> {t.notes}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <div className="flex items-center space-x-4">
                  <span>Reporter: <strong className="text-slate-800">{t.reporter}</strong></span>
                  <span>Assigned: <strong className="text-slate-800">{t.assignedTo}</strong></span>
                </div>

                {(role === 'staff' || role === 'admin') && t.status !== 'resolved' && (
                  <div className="flex items-center space-x-2">
                    {t.status === 'pending' && (
                      <button
                        onClick={() => updateTicketStatus(t.id, 'in_progress')}
                        className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition-colors"
                      >
                        Start Service
                      </button>
                    )}
                    <button
                      onClick={() => updateTicketStatus(t.id, 'resolved', 'Resolved by technician.')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors"
                    >
                      Mark Resolved
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
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
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Workstation ID
              </label>
              <select
                value={workstationId}
                onChange={(e) => setWorkstationId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-maroon-600 focus:ring-2 focus:ring-maroon-100 cursor-pointer font-mono"
              >
                {workstations.map((ws) => (
                  <option key={ws.pcId || ws.id} value={ws.pcId || ws.id}>
                    {ws.pcId || ws.id}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-maroon-600 focus:ring-2 focus:ring-maroon-100 cursor-pointer"
              >
                <option value="Hardware">Hardware (GPU/Motherboard)</option>
                <option value="Software">Software (OS/CUDA/Drivers)</option>
                <option value="Network">Network (Ethernet/DNS)</option>
                <option value="Peripheral">Peripheral (Keyboard/Mouse)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Priority
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['low', 'medium', 'high', 'critical'].map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`py-2 text-xs font-bold rounded-xl border uppercase tracking-wider transition-all ${
                    priority === p
                      ? 'bg-maroon-700 text-white border-maroon-700 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Incident Summary
            </label>
            <input
              type="text"
              required
              placeholder="e.g. GPU thermal throttling during benchmark"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-maroon-600 focus:ring-2 focus:ring-maroon-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Detailed Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe symptoms, steps to reproduce, or error messages..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-maroon-600 focus:ring-2 focus:ring-maroon-100 resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-maroon-700 hover:bg-maroon-800 text-white text-sm font-bold flex items-center space-x-1.5 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Submit to Triage Queue</span>
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
