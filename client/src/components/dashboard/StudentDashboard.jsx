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
  Layers, 
  Calendar,
  Sparkles,
  Search,
  Plus,
  Armchair,
  MapPin,
  ArrowUpRight
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { checkouts, tickets, inventory, checkoutItem, workstations, vacateSeat } = useLabData();
  const navigate = useNavigate();

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedGearId, setSelectedGearId] = useState('');
  const [loanDays, setLoanDays] = useState(7);
  const [searchQuery, setSearchQuery] = useState('');

  // Check if current student has an allocated seat
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
    (t) => t.reporter?.includes(user?.name) || t.reporter?.includes(user?.studentId || 'CSE')
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-maroon-700 via-maroon-800 to-slate-900 p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-gold-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Academic Console</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name || 'Alex'}
            </h2>
            <p className="text-sm text-slate-200 max-w-xl leading-relaxed">
              ID: <span className="font-mono text-gold-300 font-bold">{user?.studentId || 'CSE-2022-042'}</span> • Department of Computer Science & Engineering. You have{' '}
              <strong className="text-white">{myActiveLoans.length} active hardware loans</strong> and{' '}
              <strong className="text-white">{myTickets.length} submitted maintenance tickets</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/lab3d')}
              className="px-5 py-2.5 rounded-xl bg-white text-maroon-800 hover:bg-slate-100 font-bold text-sm flex items-center space-x-2 transition-all shadow-sm"
            >
              <Box className="w-4 h-4 text-maroon-700" />
              <span>Explore 3D Lab Floor</span>
            </button>

            <button
              onClick={() => setCheckoutModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-maroon-900/60 hover:bg-maroon-900/80 text-white border border-white/20 font-semibold text-sm flex items-center space-x-2 transition-all"
            >
              <Plus className="w-4 h-4 text-gold-300" />
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
          value={`${workstations.filter((w) => w.status === 'healthy' || w.status === 'Working' || w.status === 'Fixed').length}/${workstations.length || 128}`}
          subtitle="Across 4 Department Labs"
          icon={Cpu}
          change="Operational"
          changeType="positive"
        />

        <StatCard
          title="Available Inventory"
          value={inventory.reduce((acc, i) => acc + (i.availableQty || 0), 0)}
          subtitle="Sensors, kits & tools"
          icon={Box}
          change="Ready for loan"
          changeType="neutral"
        />
      </div>

      {/* Workstation Seating Status Card (Claim Seat option removed) */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className={`p-3.5 rounded-2xl ${mySeat ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
              <Armchair className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-500">Department Workstation Status</span>
                {mySeat && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                    Assigned
                  </span>
                )}
              </div>
              {mySeat ? (
                <>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">
                    Assigned PC: <span className="text-maroon-700 font-mono">{mySeat.pcId}</span>
                  </h3>
                  <div className="text-sm text-slate-600 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>Room: <strong className="text-slate-800">{mySeat.roomId.toUpperCase().replace('_', ' ')}</strong></span>
                    <span>•</span>
                    <span>Student Tag: <strong className="font-mono text-slate-800 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{mySeat.allocatedTo?.tag || `${user?.studentId}`}</strong></span>
                    <span>•</span>
                    <span>PC Status: <span className={`font-semibold ${mySeat.status === 'Working' || mySeat.status === 'Fixed' || mySeat.status === 'healthy' ? 'text-emerald-700' : 'text-rose-700'}`}>{mySeat.status}</span></span>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    No Designated Workstation Assigned
                  </h3>
                  <p className="text-sm text-slate-600 mt-1 max-w-xl">
                    Workstation seating is managed by course instructors and department administrators. You can explore the 3D lab map to check workstation health and hardware specs.
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
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-sm font-semibold flex items-center space-x-1.5 transition-all"
                >
                  <MapPin className="w-4 h-4 text-maroon-700" />
                  <span>Locate in Lab Map</span>
                </button>
                <button
                  onClick={() => vacateSeat(mySeat.pcId)}
                  className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-sm font-semibold transition-all"
                >
                  Vacate Seat
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/lab3d')}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-sm font-semibold flex items-center space-x-2 transition-all shadow-xs"
              >
                <MapPin className="w-4 h-4 text-maroon-700" />
                <span>View 3D Lab Map</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Borrowed Items & Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: My Borrowed Hardware */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                My Checked-Out Equipment
              </h3>
              <p className="text-sm text-slate-500">Keep track of your return deadlines</p>
            </div>
            <button
              onClick={() => setCheckoutModalOpen(true)}
              className="text-sm text-maroon-700 hover:text-maroon-800 font-semibold flex items-center space-x-1"
            >
              <span>Request Gear</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {myCheckouts.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <Layers className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <p className="text-base font-semibold text-slate-800">No equipment currently borrowed</p>
              <p className="text-sm text-slate-500 mb-4">You can request Arduino, Raspberry Pi, or Oscilloscopes</p>
              <button
                onClick={() => setCheckoutModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-xs"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myCheckouts.map((loan) => (
                <div
                  key={loan.id}
                  className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900">{loan.itemName}</p>
                    <div className="flex items-center space-x-3 text-xs text-slate-500">
                      <span className="font-mono text-slate-700 font-medium">{loan.sku}</span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Due: {loan.dueDate}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={loan.status} />
                    {loan.status === 'active' && (
                      <button
                        onClick={() => returnItem(loan.id)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors shadow-xs"
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
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                My Maintenance Reports
              </h3>
              <p className="text-sm text-slate-500">Track resolution progress from lab technicians</p>
            </div>
            <button
              onClick={() => navigate('/lab3d')}
              className="text-sm text-maroon-700 hover:text-maroon-800 font-semibold flex items-center space-x-1"
            >
              <span>Click Workstation</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {myTickets.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <Wrench className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <p className="text-base font-semibold text-slate-800">No active issue tickets filed</p>
              <p className="text-sm text-slate-500 mb-4">Spot a hardware or network issue? Report directly in the 3D lab.</p>
              <button
                onClick={() => navigate('/lab3d')}
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-xs"
              >
                Inspect 3D Lab
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myTickets.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-maroon-700 mr-2">
                        {t.workstationId}
                      </span>
                      <span className="text-sm font-bold text-slate-900">{t.title}</span>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>

                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {t.description}
                  </p>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <span>Assigned: <strong className="text-slate-800">{t.assignedTo}</strong></span>
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
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Search & Select Hardware
            </label>
            <div className="relative mb-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search Arduino, Raspberry Pi, Oscilloscope..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-maroon-600 focus:ring-2 focus:ring-maroon-100"
              />
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {filteredInventory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => item.availableQty > 0 && setSelectedGearId(item.id)}
                  className={`p-3.5 rounded-xl border text-sm cursor-pointer flex items-center justify-between transition-all ${
                    selectedGearId === item.id
                      ? 'bg-maroon-50 border-maroon-600 text-maroon-900 font-semibold ring-1 ring-maroon-600'
                      : item.availableQty > 0
                      ? 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                      : 'bg-slate-100 opacity-40 cursor-not-allowed text-slate-400'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.specs}</p>
                  </div>
                  <span
                    className={`font-mono text-xs font-bold ${
                      item.availableQty > 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {item.availableQty} available
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Loan Duration (Days)
            </label>
            <select
              value={loanDays}
              onChange={(e) => setLoanDays(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-maroon-600 focus:ring-2 focus:ring-maroon-100 cursor-pointer"
            >
              <option value={3}>3 Days (Short Experiment)</option>
              <option value={7}>7 Days (Weekly Assignment)</option>
              <option value={14}>14 Days (Capstone Project)</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Loan recorded under {user?.name} ({user?.studentId || 'CSE'})
            </span>
            <button
              type="submit"
              disabled={!selectedGearId}
              className="px-5 py-2.5 rounded-xl bg-maroon-700 hover:bg-maroon-800 text-white text-sm font-bold transition-all shadow-sm disabled:opacity-40"
            >
              Confirm Checkout
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
