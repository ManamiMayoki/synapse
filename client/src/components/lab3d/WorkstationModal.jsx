import React, { useState } from 'react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { useLabData } from '../../context/LabDataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Cpu, 
  HardDrive, 
  Wifi, 
  Send, 
  Clock, 
  Sparkles,
  Users,
  FileText
} from 'lucide-react';

export default function WorkstationModal({ station, onClose }) {
  const { role, user } = useAuth();
  const { 
    updatePcStatus, 
    addPcNote, 
    vacateSeat, 
    activeRoom 
  } = useLabData();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'seating' | 'specs'

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
      title={`${station.pcId} — Workstation Inspector`}
      maxWidth="max-w-2xl"
    >
      {/* Top Banner with Status & Seating Tag */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="w-14 h-14 rounded-2xl bg-maroon-700 flex flex-col items-center justify-center font-mono font-black text-white shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-200 tracking-wider">
              {station.slotLabel || 'PC'}
            </span>
            <span className="text-lg leading-tight font-extrabold">{station.displayId}</span>
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h4 className="text-lg font-bold text-slate-900 tracking-tight">{station.pcId}</h4>
              <StatusBadge status={station.status} />
            </div>
            <p className="text-xs text-slate-600 font-medium">
              <span className="text-maroon-700 font-bold">{station.roomName || activeRoom?.name}</span> • {station.slotLabel}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Assignment:{' '}
              {station.allocatedTo?.tag ? (
                <span className="font-mono font-bold text-maroon-800 bg-maroon-50 px-2 py-0.5 rounded border border-maroon-200">
                  [{station.allocatedTo.tag}] ({station.allocatedTo.studentName || 'Student'})
                </span>
              ) : (
                <span className="text-emerald-700 font-semibold font-mono">Unassigned (Open Workstation)</span>
              )}
            </p>
          </div>
        </div>

        {/* Quick Status Buttons */}
        <div className="text-right flex flex-col items-end space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Update Status:</span>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => handleStatusChange('Working')}
              disabled={updatingStatus || station.status === 'Working' || station.status === 'healthy'}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                station.status === 'Working' || station.status === 'healthy'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-800'
              }`}
            >
              Working
            </button>

            <button
              onClick={() => handleStatusChange('Needs Repair')}
              disabled={updatingStatus || station.status === 'Needs Repair' || station.status === 'faulty'}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                station.status === 'Needs Repair' || station.status === 'faulty'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50 hover:text-rose-800'
              }`}
            >
              Needs Repair
            </button>

            <button
              onClick={() => handleStatusChange('Fixed')}
              disabled={updatingStatus || station.status === 'Fixed'}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                station.status === 'Fixed'
                  ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-cyan-50 hover:text-cyan-800'
              }`}
            >
              Fixed
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200 mb-5 overflow-x-auto pb-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
            activeTab === 'notes'
              ? 'bg-maroon-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Diagnostic Notes & Tickets ({station.notes?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('seating')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
            activeTab === 'seating'
              ? 'bg-maroon-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Assignment Details</span>
        </button>

        <button
          onClick={() => setActiveTab('specs')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
            activeTab === 'specs'
              ? 'bg-maroon-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Hardware Specs</span>
        </button>
      </div>

      {/* TAB 1: Descriptive Notes & Ticketing */}
      {activeTab === 'notes' && (
        <div className="space-y-5 text-sm">
          
          {/* Form to leave a custom descriptive note */}
          <form onSubmit={handleAddNote} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center space-x-1.5 text-sm">
                <FileText className="w-4 h-4 text-maroon-700" />
                <span>Log Custom Diagnostic Note or Fix</span>
              </span>
              <span className="text-xs text-slate-500">Explaining problem or maintenance performed</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="Note summary (e.g. Spacebar stuck, fan noise)"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-maroon-600"
                />
              </div>

              <div>
                <select
                  value={noteStatusChange}
                  onChange={(e) => setNoteStatusChange(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-sm focus:outline-none focus:border-maroon-600 cursor-pointer"
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-maroon-600 resize-none leading-relaxed"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingNote || !noteDescription.trim()}
                className="px-4 py-2 rounded-xl bg-maroon-700 hover:bg-maroon-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm disabled:opacity-40 flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingNote ? 'Saving Note...' : 'Log Custom Note'}</span>
              </button>
            </div>
          </form>

          {/* Chronological Notes History */}
          <div className="space-y-3">
            <h5 className="font-bold text-slate-700 text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-maroon-700" />
              <span>Ticket & Note History Timeline ({station.notes?.length || 0})</span>
            </h5>

            {(!station.notes || station.notes.length === 0) ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-slate-500">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="text-sm">No issue tickets or notes logged for {station.pcId} yet.</p>
                <p className="text-xs text-slate-400 mt-1">Students and staff can submit diagnostic notes above.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {station.notes.map((note, idx) => (
                  <div
                    key={note._id || idx}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{note.title}</span>
                      <div className="flex items-center space-x-2 text-xs font-mono">
                        {note.previousStatus && note.newStatus && note.previousStatus !== note.newStatus && (
                          <span className="text-slate-500">
                            {note.previousStatus} ➔ <strong className="text-maroon-700">{note.newStatus}</strong>
                          </span>
                        )}
                        <span className="text-slate-400">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-600 text-sm leading-relaxed">
                      {note.description}
                    </p>

                    <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                      <span>Logged by: <strong className="text-slate-800">{note.reportedBy}</strong> ({note.role})</span>
                      <span className="text-emerald-700 font-semibold">Verified</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: Seating Assignment (Claim Seat Option Removed) */}
      {activeTab === 'seating' && (
        <div className="space-y-4 text-sm">
          
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-base">Assignment Status</span>
              {station.allocatedTo?.tag ? (
                <span className="px-3 py-1 rounded-full font-mono text-xs font-bold bg-maroon-50 text-maroon-800 border border-maroon-200">
                  Assigned [{station.allocatedTo.tag}]
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full font-mono text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Open Workstation
                </span>
              )}
            </div>

            {station.allocatedTo?.tag ? (
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-white border border-slate-200 text-sm">
                <div>
                  <p className="text-slate-500 text-xs font-medium">Student Tag / ID</p>
                  <p className="text-slate-900 font-bold font-mono text-base">{station.allocatedTo.tag}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-medium">Student Name</p>
                  <p className="text-slate-900 font-semibold">{station.allocatedTo.studentName || 'Enrolled Student'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-medium">Assignment Date</p>
                  <p className="text-slate-700">
                    {station.allocatedTo.claimedAt ? new Date(station.allocatedTo.claimedAt).toLocaleDateString() : 'Active'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-medium">Mode</p>
                  <p className="text-slate-700 capitalize">{station.allocatedTo.allocationMode?.replace('_', ' ') || 'Department Assigned'}</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-600 leading-relaxed text-sm">
                This workstation is currently open and unassigned. Course instructors and lab staff can configure seating layouts for lab exams.
              </p>
            )}

            {station.allocatedTo?.tag && (role === 'staff' || role === 'admin') && (
              <div className="pt-2 flex items-center justify-end border-t border-slate-200">
                <button
                  onClick={handleVacate}
                  className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold transition-colors"
                >
                  Vacate Assignment
                </button>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 3: Hardware Specs */}
      {activeTab === 'specs' && (
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3">
              <Cpu className="w-5 h-5 text-maroon-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-500 text-xs font-medium">Processor</p>
                <p className="text-slate-900 font-semibold">{station.specs?.cpu || 'Intel Core i7-13700'}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-500 text-xs font-medium">Graphics Engine</p>
                <p className="text-slate-900 font-semibold">{station.specs?.gpu || 'NVIDIA RTX 4070'}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3">
              <HardDrive className="w-5 h-5 text-cyan-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-500 text-xs font-medium">RAM & Storage</p>
                <p className="text-slate-900 font-semibold">{station.specs?.ram || '32GB DDR5'} • {station.specs?.storage || '1TB NVMe'}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3">
              <Wifi className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-500 text-xs font-medium">IP Address & OS</p>
                <p className="font-mono text-slate-900 font-semibold">{station.specs?.ipAddress || '192.168.201.x'}</p>
                <p className="text-xs text-slate-500">{station.specs?.os || 'Ubuntu 24.04 LTS / Windows 11'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
