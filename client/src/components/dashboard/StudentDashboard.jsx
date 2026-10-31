import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLabData } from '../../context/LabDataContext';
import StatCard from '../common/StatCard';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { 
  Box, 
  Cpu, 
  Wrench, 
  Clock, 
  Layers, 
  CheckCircle2, 
  ArrowUpRight, 
  Calendar,
  Sparkles,
  Search,
  Plus,
  Monitor,
  Armchair,
  MapPin,
  AlertCircle
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { checkouts, tickets, inventory, checkoutItem, workstations, vacateSeat } = useLabData();
  const navigate = useNavigate();

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedGearId, setSelectedGearId] = useState('');
  const [loanDays, setLoanDays] = useState(7);
  const [searchQuery, setSearchQuery] = useState('');

  // Check if current student has an allocated seat (format [Student ID] + [Batch])
  const studentTag = user?.batch && user?.studentId ? `${user.studentId}-${user.batch}` : user?.studentId;
  const mySeat = workstations.find((w) => {
    if (!w.allocatedTo) return false;
    const a = w.allocatedTo;
    return (
      (user?.studentId && a.studentId === user.studentId) ||
      (studentTag && a.tag === studentTag) ||
      (user?.name && a.studentName?.toLowerCase() === user.name?.toLowerCase())
    );
  });

  // Filter student-specific data
  const myCheckouts = checkouts.filter(
    (c) => c.studentId === user?.studentId || c.studentName === user?.name
  );
  const myActiveLoans = myCheckouts.filter((c) => c.status === 'active');
  const myTickets = tickets.filter(
    (t) => t.reporter.includes(user?.name) || t.reporter.includes(user?.studentId || 'CSE')
  );

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!selectedGearId) return;

    checkoutItem({
      itemId: selectedGearId,
      studentId: user?.studentId || 'CSE-2022-042',
      studentName: user?.name || 'Alex Vance',
      days: Number(loanDays) || 7,
    });

    setCheckoutModalOpen(false);
    setSelectedGearId('');
  };

  const filteredInventory = inventory.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-maroon p-6 sm:p-8 border border-gold-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Research Portal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name || 'Alex'}
            </h2>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              ID: <span className="font-mono text-gold-300 font-bold">{user?.studentId || 'CSE-2022-042'}</span> • Department of Computer Science & Engineering. You have{' '}
              <strong className="text-white">{myActiveLoans.length} active hardware loans</strong> and{' '}
              <strong className="text-white">{myTickets.length} submitted maintenance tickets</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/lab3d')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-maroon-700 to-gold-600 hover:from-maroon-600 hover:to-gold-500 text-white font-semibold text-xs flex items-center space-x-2 transition-all shadow-glow-maroon"
            >
              <Box className="w-4 h-4" />
              <span>Explore 3D Lab Floor</span>
            </button>

            <button
              onClick={() => setCheckoutModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-gold-300 border border-gold-500/40 font-semibold text-xs flex items-center space-x-2 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Borrow Hardware</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Active Loans"
          value={myActiveLoans.length}
          subtitle="Hardware checkout units"
          icon={Layers}
          change={myActiveLoans.length > 0 ? 'Due within 7 days' : 'No items out'}
          changeType={myActiveLoans.length > 0 ? 'warning' : 'neutral'}
        />

        <StatCard
          title="Submitted Tickets"
          value={myTickets.length}
          subtitle="Workstation failure reports"
          icon={Wrench}
          change={`${myTickets.filter((t) => t.status === 'resolved').length} resolved`}
          changeType="positive"
        />

        <StatCard
          title="Lab Stations Online"
          value={`${workstations.filter((w) => w.status === 'healthy').length}/${workstations.length}`}
          subtitle="Across 4 Department Labs"
          icon={Cpu}
          change="Operational"
          changeType="positive"
        />

        <StatCard
          title="Available Inventory"
          value={inventory.reduce((acc, i) => acc + i.availableQty, 0)}
          subtitle="Sensors, kits & tools"
          icon={Box}
          change="Ready for loan"
          changeType="neutral"
        />
      </div>

      {/* Semester Day-One Seating Allocation Card */}
      <div className="rounded-2xl glass-card p-6 border border-gold-500/20 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-2xl ${mySeat ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30' : 'bg-maroon-500/15 text-rose-300 border border-maroon-500/30'}`}>
              <Armchair className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase tracking-wider font-bold text-gold-400">Semester Day-One Seating</span>
                {mySeat && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                    Allocated
                  </span>
                )}
              </div>
              {mySeat ? (
                <>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    Assigned PC: <span className="text-gold-300 font-mono">{mySeat.pcId}</span>
                  </h3>
                  <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>Room: <strong className="text-white">{mySeat.roomId.toUpperCase().replace('_', ' ')}</strong></span>
                    <span>•</span>
                    <span>Student Tag: <strong className="font-mono text-gold-300 font-bold bg-zinc-900/80 px-2 py-0.5 rounded border border-gold-500/30">{mySeat.allocatedTo?.tag || `${user?.studentId}-${user?.batch || '32'}`}</strong></span>
                    <span>•</span>
                    <span>Allocation: <span className="capitalize text-slate-200">{mySeat.allocatedTo?.allocationMode || 'Day-One Claim'}</span></span>
                    <span>•</span>
                    <span>PC Status: <span className={`font-semibold ${mySeat.status === 'Working' || mySeat.status === 'Fixed' ? 'text-emerald-400' : 'text-rose-400'}`}>{mySeat.status}</span></span>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    No Lab Workstation Claimed Yet
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    Day-One seating claims are formatted strictly as <strong className="text-gold-300 font-mono">[Student ID] + [Batch]</strong> (e.g. <span className="font-mono text-white">364-32</span>). Missed day one? You can explore the room map to find unallocated workstations.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {mySeat ? (
              <>
                <button
                  onClick={() => navigate('/lab3d')}
                  className="px-4 py-2 rounded-xl bg-gold-500/15 hover:bg-gold-500/25 border border-gold-500/30 text-gold-300 text-xs font-semibold flex items-center space-x-1.5 transition-all"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Locate in Lab Map</span>
                </button>
                <button
                  onClick={() => vacateSeat(mySeat.pcId)}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-all"
                >
                  Vacate Seat
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/lab3d')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-maroon-700 to-gold-600 hover:from-maroon-600 hover:to-gold-500 text-white font-bold text-xs flex items-center space-x-2 shadow-glow-maroon transition-all"
              >
                <Armchair className="w-4 h-4" />
                <span>Claim Seat [ID-Batch]</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Borrowed Items & Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: My Borrowed Hardware */}
        <div className="rounded-2xl glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                My Checked-Out Equipment
              </h3>
              <p className="text-xs text-slate-400">Keep track of your return deadlines</p>
            </div>
            <button
              onClick={() => setCheckoutModalOpen(true)}
              className="text-xs text-gold-400 hover:text-gold-300 font-semibold flex items-center space-x-1"
            >
              <span>Request Gear</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {myCheckouts.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-white/10 rounded-xl">
              <Layers className="w-10 h-10 mx-auto text-slate-500 mb-2 opacity-50" />
              <p className="text-sm font-medium text-slate-300">No equipment currently borrowed</p>
              <p className="text-xs text-slate-500 mb-4">You can request Arduino, Raspberry Pi, or Oscilloscopes</p>
              <button
                onClick={() => setCheckoutModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-gold-500/15 border border-gold-500/30 text-gold-300 text-xs font-semibold hover:bg-gold-500/25 transition-colors"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myCheckouts.map((loan) => (
                <div
                  key={loan.id}
                  className="p-4 rounded-xl bg-zinc-900/60 border border-white/5 hover:border-gold-500/30 transition-all flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">{loan.itemName}</p>
                    <div className="flex items-center space-x-3 text-xs text-slate-400">
                      <span className="font-mono text-gold-400/90">{loan.sku}</span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>Due: {loan.dueDate}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={loan.status} />
                    {loan.status === 'active' && (
                      <button
                        onClick={() => returnItem(loan.id)}
                        className="px-2.5 py-1 text-[11px] rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-300 hover:text-white transition-colors"
                        title="Return borrowed item to stock"
                      >
                        Return
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: My Maintenance Tickets */}
        <div className="rounded-2xl glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                My Maintenance Reports
              </h3>
              <p className="text-xs text-slate-400">Track resolution progress from lab technicians</p>
            </div>
            <button
              onClick={() => navigate('/lab3d')}
              className="text-xs text-gold-400 hover:text-gold-300 font-semibold flex items-center space-x-1"
            >
              <span>Click Workstation</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {myTickets.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-white/10 rounded-xl">
              <Wrench className="w-10 h-10 mx-auto text-slate-500 mb-2 opacity-50" />
              <p className="text-sm font-medium text-slate-300">No active issue tickets filed</p>
              <p className="text-xs text-slate-500 mb-4">Spot a hardware or network issue? Report directly in the 3D lab.</p>
              <button
                onClick={() => navigate('/lab3d')}
                className="px-4 py-2 rounded-xl bg-maroon-700/30 border border-maroon-600/40 text-rose-300 text-xs font-semibold hover:bg-maroon-700/50 transition-colors"
              >
                Inspect 3D Lab
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myTickets.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-xl bg-zinc-900/60 border border-white/5 hover:border-gold-500/30 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-gold-400 mr-2">
                        {t.workstationId}
                      </span>
                      <span className="text-xs font-bold text-white">{t.title}</span>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {t.description}
                  </p>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Assigned: <strong className="text-slate-300">{t.assignedTo}</strong></span>
                    <span className="font-mono">{t.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Equipment Checkout Request Modal */}
      <Modal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        title="Hardware Asset Checkout"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCheckoutSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Search & Select Hardware
            </label>
            <div className="relative mb-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search Arduino, Raspberry Pi, Oscilloscope..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-gold-400"
              />
            </div>

            <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
              {filteredInventory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => item.availableQty > 0 && setSelectedGearId(item.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                    selectedGearId === item.id
                      ? 'bg-gold-500/20 border-gold-400 text-white font-semibold'
                      : item.availableQty > 0
                      ? 'bg-zinc-900/60 border-white/5 hover:border-white/20 text-slate-300'
                      : 'bg-zinc-900/20 opacity-40 cursor-not-allowed text-slate-500'
                  }`}
                >
                  <div>
                    <p>{item.name}</p>
                    <p className="text-[10px] text-slate-400">{item.specs}</p>
                  </div>
                  <span
                    className={`font-mono text-xs font-bold ${
                      item.availableQty > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {item.availableQty} available
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Loan Duration (Days)
            </label>
            <select
              value={loanDays}
              onChange={(e) => setLoanDays(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-gold-400 cursor-pointer"
            >
              <option value={3}>3 Days (Short Experiment)</option>
              <option value={7}>7 Days (Weekly Assignment)</option>
              <option value={14}>14 Days (Capstone Project)</option>
            </select>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Loan recorded under {user?.name} ({user?.studentId || 'CSE'})
            </span>
            <button
              type="submit"
              disabled={!selectedGearId}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-maroon-700 to-gold-600 hover:from-maroon-600 hover:to-gold-500 text-white text-xs font-bold transition-all shadow-glow-maroon disabled:opacity-40"
            >
              Confirm Checkout
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
