import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useLabData } from '../../context/LabDataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Users, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Shuffle, 
  RotateCcw, 
  ArrowRight,
  Hash,
  Layers
} from 'lucide-react';

// Modal 1: Student Seating Claim (Semester First-Day Logic)
export function ClaimSeatModal({ isOpen, onClose, defaultPcId }) {
  const { workstations, claimSeat, activeRoom } = useLabData();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [selectedPcId, setSelectedPcId] = useState(defaultPcId || workstations[0]?.pcId || '');
  const [studentId, setStudentId] = useState(user?.studentId || '364');
  const [batch, setBatch] = useState(user?.batch || '32');
  const [studentName, setStudentName] = useState(user?.name || '');
  const [submitting, setSubmitting] = useState(false);

  // Formatted tag: [Student ID] + [Batch] (e.g. 364-32)
  const formattedTag = studentId.trim() && batch.trim() ? `${studentId.trim()}-${batch.trim()}` : '';

  const selectedPc = workstations.find((w) => w.pcId === selectedPcId);
  const isPcBroken = selectedPc?.status === 'Needs Repair';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formattedTag) {
      addToast('Please enter both Student ID and Batch (e.g. 364-32)', 'warning', 'Missing Tag');
      return;
    }

    if (isPcBroken) {
      addToast('Cannot claim a PC marked Needs Repair. Please choose a Working PC.', 'error', 'Invalid PC');
      return;
    }

    setSubmitting(true);
    const res = await claimSeat({
      pcId: selectedPcId,
      tag: formattedTag,
      studentId: studentId.trim(),
      batch: batch.trim(),
      studentName: studentName || user?.name || `Student ${studentId}`,
    });

    setSubmitting(false);
    if (res.success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Semester Day-One Seating Claim"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        
        {/* Info Banner */}
        <div className="p-3.5 rounded-2xl bg-zinc-900 border border-gold-500/30 space-y-1">
          <p className="font-bold text-white flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Semester First-Day Seating Allocation</span>
          </p>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Students claim their dedicated workstation for semester lab courses. Tag is strictly formatted as{' '}
            <strong className="text-gold-300 font-mono">[Student ID] + [Batch]</strong> (e.g.{' '}
            <span className="font-mono bg-zinc-950 px-1.5 py-0.5 rounded border border-white/10 text-gold-300">364-32</span>).
          </p>
        </div>

        {/* Workstation Selection */}
        <div>
          <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Select Workstation in {activeRoom?.roomCode}
          </label>
          <select
            value={selectedPcId}
            onChange={(e) => setSelectedPcId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono focus:outline-none focus:border-gold-400 cursor-pointer"
          >
            {workstations.map((w) => (
              <option key={w.pcId} value={w.pcId}>
                {w.pcId} ({w.displayId}) • {w.status} {w.allocatedTo?.tag ? `• Claimed [${w.allocatedTo.tag}]` : '• Unallocated'}
              </option>
            ))}
          </select>
        </div>

        {/* Broken PC Warning */}
        {isPcBroken && (
          <div className="p-3 rounded-xl bg-maroon-950/80 border border-rose-500/50 text-rose-300 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>Warning:</strong> {selectedPcId} is marked 'Needs Repair'. For exams and semester work, choose a verified Working PC.
            </span>
          </div>
        )}

        {/* Student ID & Batch inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Student ID
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 364"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono focus:outline-none focus:border-gold-400"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Batch Number
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 32"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono focus:outline-none focus:border-gold-400"
            />
          </div>
        </div>

        {/* Tag Preview */}
        <div>
          <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Generated Seating Tag [Student ID] + [Batch]
          </label>
          <div className="p-3 rounded-xl bg-zinc-950 border border-gold-500/40 flex items-center justify-between">
            <span className="font-mono text-base font-extrabold text-gold-300">
              {formattedTag || 'Enter ID & Batch above'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">SEAT TAG</span>
          </div>
        </div>

        <div>
          <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Student Full Name
          </label>
          <input
            type="text"
            placeholder="e.g. Alex Vance"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-gold-400"
          />
        </div>

        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting || !formattedTag || isPcBroken}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-maroon-700 to-gold-600 hover:from-maroon-600 hover:to-gold-500 text-white font-bold text-xs uppercase tracking-wider shadow-glow-maroon disabled:opacity-40 transition-all flex items-center space-x-2"
          >
            <span>{submitting ? 'Claiming Seat...' : 'Confirm Day-One Claim'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </form>
    </Modal>
  );
}

// Modal 2: Teacher Exam Override (Random reallocation across verified working PCs only)
export function TeacherExamModal({ isOpen, onClose }) {
  const { 
    activeRoom, 
    activeRoomId, 
    workstations, 
    teacherRandomReallocate, 
    teacherManualAllocate, 
    resetAllocations 
  } = useLabData();
  const { addToast } = useToast();

  const [tab, setTab] = useState('random'); // 'random' | 'manual' | 'reset'
  const [submitting, setSubmitting] = useState(false);

  // Manual allocation state
  const [manualPcId, setManualPcId] = useState(workstations[0]?.pcId || '');
  const [manualTag, setManualTag] = useState('');
  const [manualName, setManualName] = useState('');

  const workingPcsCount = workstations.filter((w) => w.status === 'Working' || w.status === 'Fixed').length;
  const brokenPcsCount = workstations.filter((w) => w.status === 'Needs Repair').length;
  const seatedStudentsCount = workstations.filter((w) => w.allocatedTo?.tag).length;

  const handleRandomReallocate = async () => {
    setSubmitting(true);
    const res = await teacherRandomReallocate(activeRoomId);
    setSubmitting(false);
    if (res?.success) {
      onClose();
    }
  };

  const handleManualAllocate = async (e) => {
    e.preventDefault();
    if (!manualTag || !manualPcId) return;

    setSubmitting(true);
    const res = await teacherManualAllocate({
      pcId: manualPcId,
      tag: manualTag,
      studentName: manualName,
    });
    setSubmitting(false);
    if (res?.success) {
      setManualTag('');
      setManualName('');
      onClose();
    }
  };

  const handleReset = async () => {
    if (!window.confirm(`Are you sure you want to reset all seating allocations in ${activeRoom?.roomCode}?`)) {
      return;
    }
    setSubmitting(true);
    const res = await resetAllocations(activeRoomId);
    setSubmitting(false);
    if (res?.success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Teacher Exam Seating Override"
      maxWidth="max-w-xl"
    >
      <div className="space-y-5 text-xs">
        
        {/* Banner */}
        <div className="p-3.5 rounded-2xl bg-zinc-900 border border-gold-500/40 space-y-1.5">
          <div className="flex items-center space-x-2 text-gold-400 font-bold uppercase tracking-wider text-[11px]">
            <ShieldAlert className="w-4 h-4" />
            <span>Exam Seating Integrity Controls • {activeRoom?.roomCode}</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Teachers have exclusive administrative rights to reallocate students for midterm/final exams. Reallocations strictly verify that examinees are{' '}
            <strong className="text-emerald-400">only seated at verified Working PCs</strong>, skipping any stations requiring maintenance.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5 text-center font-mono">
          <div className="p-2.5 rounded-xl bg-zinc-900 border border-white/5">
            <p className="text-emerald-400 font-bold text-base">{workingPcsCount}</p>
            <p className="text-[10px] text-slate-400">Verified Working PCs</p>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-900 border border-white/5">
            <p className="text-rose-400 font-bold text-base">{brokenPcsCount}</p>
            <p className="text-[10px] text-slate-400">Needs Repair (Skipped)</p>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-900 border border-white/5">
            <p className="text-gold-300 font-bold text-base">{seatedStudentsCount}</p>
            <p className="text-[10px] text-slate-400">Currently Seated</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-2 border-b border-white/10 pb-1">
          <button
            onClick={() => setTab('random')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition-all ${
              tab === 'random'
                ? 'bg-gradient-to-r from-maroon-800 to-gold-800 text-white border border-gold-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Random Exam Shuffle</span>
          </button>

          <button
            onClick={() => setTab('manual')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition-all ${
              tab === 'manual'
                ? 'bg-gradient-to-r from-maroon-800 to-gold-800 text-white border border-gold-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manual Student Reallocation</span>
          </button>

          <button
            onClick={() => setTab('reset')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition-all ${
              tab === 'reset'
                ? 'bg-maroon-950 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Room Seating</span>
          </button>
        </div>

        {/* TAB 1: Random Exam Shuffle */}
        {tab === 'random' && (
          <div className="space-y-4">
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Execute automated randomized seating distribution. Synapse shuffles all examinees and assigns them exclusively to verified{' '}
              <strong className="text-emerald-400">Working PCs</strong>. Any PC marked <strong className="text-rose-400">Needs Repair</strong> is automatically excluded.
            </p>

            <button
              onClick={handleRandomReallocate}
              disabled={submitting || workingPcsCount === 0}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-maroon-700 via-maroon-800 to-gold-600 hover:from-maroon-600 hover:to-gold-500 text-white font-bold text-xs uppercase tracking-wider shadow-glow-maroon flex items-center justify-center space-x-2 disabled:opacity-40 transition-all"
            >
              <Shuffle className="w-4 h-4" />
              <span>{submitting ? 'Shuffling & Assigning...' : 'Execute Random Exam Seating Shuffle'}</span>
            </button>
          </div>
        )}

        {/* TAB 2: Manual Student Reallocation */}
        {tab === 'manual' && (
          <form onSubmit={handleManualAllocate} className="space-y-3">
            <div>
              <label className="block font-semibold uppercase text-slate-300 mb-1">
                Target Workstation
              </label>
              <select
                value={manualPcId}
                onChange={(e) => setManualPcId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono focus:outline-none focus:border-gold-400"
              >
                {workstations.map((w) => (
                  <option key={w.pcId} value={w.pcId}>
                    {w.pcId} ({w.displayId}) • Status: {w.status} {w.allocatedTo?.tag ? `• Claimed [${w.allocatedTo.tag}]` : '• Open'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-300 mb-1">
                Student Seating Tag [Student ID] + [Batch]
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 364-32"
                value={manualTag}
                onChange={(e) => setManualTag(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono focus:outline-none focus:border-gold-400"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-300 mb-1">
                Student Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Alex Vance"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-gold-400"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !manualTag}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-maroon-700 hover:from-gold-500 hover:to-maroon-600 text-white font-bold text-xs uppercase tracking-wider shadow-md disabled:opacity-40 transition-all"
            >
              <span>{submitting ? 'Allocating...' : 'Assign Student to Selected PC'}</span>
            </button>
          </form>
        )}

        {/* TAB 3: Reset Seating */}
        {tab === 'reset' && (
          <div className="space-y-4">
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Clear all seating allocations in <strong>{activeRoom?.roomCode}</strong>. All workstations will become vacant, allowing students to claim seats on day one or enabling teachers to setup a fresh exam seating layout.
            </p>

            <button
              onClick={handleReset}
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-maroon-900/60 hover:bg-maroon-800/80 border border-rose-500/50 text-rose-200 font-bold text-xs uppercase tracking-wider transition-all"
            >
              <span>{submitting ? 'Resetting...' : 'Confirm Reset of All Seating in this Room'}</span>
            </button>
          </div>
        )}

      </div>
    </Modal>
  );
}
