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
  Clock, 
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Users,
  FileText,
  Plus,
  RotateCcw
} from 'lucide-react';

export default function WorkstationModal({ station, onClose, onOpenClaimModal }) {
  const { role, user } = useAuth();
  const { 
    updatePcStatus, 
    addPcNote, 
    vacateSeat, 
    activeRoom 
  } = useLabData();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'status' | 'seating' | 'specs'

  // Custom Descriptive Note Form State
  const [noteTitle, setNoteTitle] = useState('');
  const [noteDescription, setNoteDescription] = useState('');
  const [noteStatusChange, setNoteStatusChange] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Status Direct Update State
  const [updatingStatus, setUpdatingStatus] = useState(false);

  if (!station) return null;

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    await updatePcStatus(station.pcId, newStatus);
    setUpdatingStatus(false);
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteDescription.trim()) {
      addToast('Please provide a descriptive note explaining the problem or fix.', 'warning', 'Missing Details');
      return;
    }

    setSubmittingNote(true);
    const res = await addPcNote(station.pcId, {
      title: noteTitle.trim() || (noteStatusChange ? `Status set to ${noteStatusChange}` : 'Maintenance Log'),
      description: noteDescription.trim(),
      newStatus: noteStatusChange || undefined,
      reportedBy: user?.name || 'Academic Lab Member',
      role: role || 'student',
    });

    setSubmittingNote(false);
    if (res?.success) {
      setNoteTitle('');
      setNoteDescription('');
      setNoteStatusChange('');
    }
  };

  const handleVacate = async () => {
    await vacateSeat(station.pcId);
  };

  return (
    <Modal
      isOpen={!!station}
      onClose={onClose}
      title={`${station.pcId} — Workstation Inspector & Notes`}
      maxWidth="max-w-2xl"
    >
      {/* Top Banner with Status & Seating Tag */}
      <div className="p-4 rounded-2xl glass-card bg-zinc-950/90 mb-5 flex flex-wrap items-center justify-between gap-4 border-gold-500/30 shadow-2xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-maroon-800 via-maroon-900 to-gold-700/70 flex flex-col items-center justify-center font-mono font-black text-gold-300 shadow-glow-maroon border border-gold-500/40">
            <span className="text-[9px] uppercase font-bold text-gold-400/80 tracking-widest">
              {station.slotLabel || 'PC'}
            </span>
            <span className="text-lg leading-tight font-extrabold">{station.displayId}</span>
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h4 className="text-lg font-bold text-white tracking-wide">{station.pcId}</h4>
              <StatusBadge status={station.status} />
            </div>
            <p className="text-xs text-slate-300 font-medium">
              <span className="text-gold-300 font-semibold">{station.roomName || activeRoom?.name}</span> • {station.slotLabel}
            </p>
            <p className="text-[11px] text-slate-400">
              Allocation:{' '}
              {station.allocatedTo?.tag ? (
                <span className="font-mono font-bold text-gold-300 bg-maroon-950/60 px-1.5 py-0.5 rounded border border-gold-500/30">
                  [{station.allocatedTo.tag}] ({station.allocatedTo.studentName || 'Student'})
                </span>
              ) : (
                <span className="text-emerald-400 font-semibold font-mono">Unallocated (Open Seat)</span>
              )}
            </p>
          </div>
        </div>

        {/* Quick Status Buttons */}
        <div className="text-right flex flex-col items-end space-y-1">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Update Status:</span>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => handleStatusChange('Working')}
              disabled={updatingStatus || station.status === 'Working'}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                station.status === 'Working'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50 shadow-sm'
                  : 'bg-zinc-900 text-slate-400 border-white/5 hover:text-emerald-300 hover:border-emerald-500/30'
              }`}
            >
              Working
            </button>

            <button
              onClick={() => handleStatusChange('Needs Repair')}
              disabled={updatingStatus || station.status === 'Needs Repair'}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                station.status === 'Needs Repair'
                  ? 'bg-maroon-950 text-rose-300 border-rose-500/60 shadow-glow-maroon'
                  : 'bg-zinc-900 text-slate-400 border-white/5 hover:text-rose-300 hover:border-rose-500/30'
              }`}
            >
              Needs Repair
            </button>

            <button
              onClick={() => handleStatusChange('Fixed')}
              disabled={updatingStatus || station.status === 'Fixed'}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                station.status === 'Fixed'
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50 shadow-sm'
                  : 'bg-zinc-900 text-slate-400 border-white/5 hover:text-cyan-300 hover:border-cyan-500/30'
              }`}
            >
              Fixed
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center space-x-2 border-b border-white/10 mb-5 overflow-x-auto pb-1 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
            activeTab === 'notes'
              ? 'bg-gradient-to-r from-maroon-800 to-gold-800 text-white border border-gold-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Descriptive Notes & Tickets ({station.notes?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('seating')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
            activeTab === 'seating'
              ? 'bg-gradient-to-r from-maroon-800 to-gold-800 text-white border border-gold-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Seating Allocation</span>
        </button>

        <button
          onClick={() => setActiveTab('specs')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
            activeTab === 'specs'
              ? 'bg-gradient-to-r from-maroon-800 to-gold-800 text-white border border-gold-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Hardware Specs</span>
        </button>
      </div>

      {/* TAB 1: Descriptive Notes & Ticketing */}
      {activeTab === 'notes' && (
        <div className="space-y-5 text-xs">
          
          {/* Form to leave a custom descriptive note */}
          <form onSubmit={handleAddNote} className="p-4 rounded-2xl bg-zinc-900/90 border border-gold-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center space-x-1.5 text-xs">
                <Edit3 className="w-3.5 h-3.5 text-gold-400" />
                <span>Leave a Custom Descriptive Note or Incident Fix</span>
              </span>
              <span className="text-[10px] text-slate-400">Explaining exact problem or fix</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="Note summary (e.g. Spacebar stuck, GPU fan jitter)"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-gold-400"
                />
              </div>

              <div>
                <select
                  value={noteStatusChange}
                  onChange={(e) => setNoteStatusChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-slate-300 text-xs focus:outline-none focus:border-gold-400 cursor-pointer"
                >
                  <option value="">Keep status ({station.status})</option>
                  <option value="Working">Mark as Working (Operational)</option>
                  <option value="Needs Repair">Mark as Needs Repair (Take Offline)</option>
                  <option value="Fixed">Mark as Fixed (Serviced)</option>
                </select>
              </div>
            </div>

            <div>
              <textarea
                rows={3}
                required
                placeholder="Write a custom descriptive note explaining the exact problem observed, error messages, or fix applied (e.g. Re-seated RAM module, replaced Cat6 cable, reapplied thermal paste)..."
                value={noteDescription}
                onChange={(e) => setNoteDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-gold-400 resize-none leading-relaxed"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingNote || !noteDescription.trim()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-maroon-700 to-gold-600 hover:from-maroon-600 hover:to-gold-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-glow-maroon disabled:opacity-40 flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingNote ? 'Saving Note...' : 'Log Custom Note'}</span>
              </button>
            </div>
          </form>

          {/* Chronological Notes History */}
          <div className="space-y-3">
            <h5 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-gold-400" />
              <span>Ticket & Note History Timeline ({station.notes?.length || 0})</span>
            </h5>

            {(!station.notes || station.notes.length === 0) ? (
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-dashed border-white/10 text-center text-slate-500">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="text-xs">No issue tickets or notes logged for {station.pcId} yet.</p>
                <p className="text-[10px] text-slate-600">Students and staff can submit diagnostic notes above.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {station.notes.map((note, idx) => (
                  <div
                    key={note._id || idx}
                    className="p-3.5 rounded-xl bg-zinc-900/80 border border-white/5 space-y-1.5 hover:border-gold-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{note.title}</span>
                      <div className="flex items-center space-x-2 text-[10px] font-mono">
                        {note.previousStatus && note.newStatus && note.previousStatus !== note.newStatus && (
                          <span className="text-slate-400">
                            {note.previousStatus} ➔ <strong className="text-gold-300">{note.newStatus}</strong>
                          </span>
                        )}
                        <span className="text-slate-500">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-300 text-xs leading-relaxed">
                      {note.description}
                    </p>

                    <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Logged by: <strong className="text-slate-300">{note.reportedBy}</strong> ({note.role})</span>
                      <span>Verified</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: Seating Allocation & Claim */}
      {activeTab === 'seating' && (
        <div className="space-y-4 text-xs">
          
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">Seating Status</span>
              {station.allocatedTo?.tag ? (
                <span className="px-2.5 py-1 rounded-full font-mono text-xs font-bold bg-maroon-700/40 text-gold-300 border border-gold-500/40">
                  Allocated [Student ID + Batch: {station.allocatedTo.tag}]
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full font-mono text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  Unallocated (Open Seat)
                </span>
              )}
            </div>

            {station.allocatedTo?.tag ? (
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-zinc-950 font-mono text-xs">
                <div>
                  <p className="text-slate-400 text-[10px]">Student Tag</p>
                  <p className="text-gold-300 font-bold text-sm">{station.allocatedTo.tag}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px]">Student Name</p>
                  <p className="text-white font-medium">{station.allocatedTo.studentName || 'Enrolled Student'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px]">Claimed Date</p>
                  <p className="text-slate-300">
                    {station.allocatedTo.claimedAt ? new Date(station.allocatedTo.claimedAt).toLocaleDateString() : 'Day One'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px]">Allocation Mode</p>
                  <p className="text-cyan-300 capitalize">{station.allocatedTo.allocationMode?.replace('_', ' ') || 'Student Claim'}</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 leading-relaxed">
                This workstation is currently open. Students who missed day one can claim this seat for the semester.
              </p>
            )}

            <div className="pt-2 flex items-center justify-between border-t border-white/5">
              {station.allocatedTo?.tag ? (
                <button
                  onClick={handleVacate}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-rose-300 text-xs font-semibold transition-colors"
                >
                  Vacate Seat (Make Unallocated)
                </button>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    onOpenClaimModal && onOpenClaimModal(station.pcId);
                  }}
                  disabled={station.status === 'Needs Repair'}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-maroon-700 to-gold-600 hover:from-maroon-600 hover:to-gold-500 text-white font-bold text-xs uppercase tracking-wider shadow-glow-maroon disabled:opacity-40"
                >
                  Claim This Seat ([Student ID] + [Batch])
                </button>
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: Hardware Specs */}
      {activeTab === 'specs' && (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-zinc-900/70 border border-white/5 flex items-start space-x-3">
              <Cpu className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-400 font-medium">Processor</p>
                <p className="text-white font-semibold">{station.specs?.cpu || 'Intel Core i7'}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/70 border border-white/5 flex items-start space-x-3">
              <Sparkles className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-400 font-medium">Graphics Engine</p>
                <p className="text-white font-semibold">{station.specs?.gpu || 'NVIDIA RTX'}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/70 border border-white/5 flex items-start space-x-3">
              <HardDrive className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-400 font-medium">RAM & Storage</p>
                <p className="text-white font-semibold">{station.specs?.ram} • {station.specs?.storage}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/70 border border-white/5 flex items-start space-x-3">
              <Wifi className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-400 font-medium">IP Address & OS</p>
                <p className="font-mono text-white font-semibold">{station.specs?.ipAddress}</p>
                <p className="text-[10px] text-slate-400">{station.specs?.os}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Edit3(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
