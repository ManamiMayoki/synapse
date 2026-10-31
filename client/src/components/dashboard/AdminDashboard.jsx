import React, { useState } from 'react';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext';
import { useLabData } from '../../context/LabDataContext';
import { useToast } from '../../context/ToastContext';
import StatCard from '../common/StatCard';
import StatusBadge from '../common/StatusBadge';
import { 
  ShieldCheck, 
  Cpu, 
  Wrench, 
  TrendingUp, 
  Users, 
  Sparkles, 
  AlertTriangle, 
  Flame, 
  HardDrive, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  Server
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { workstations, tickets, inventory, checkouts } = useLabData();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'ai_predictive' | 'users'

  // User list state for RBAC management
  const [usersList, setUsersList] = useState([
    {
      id: 'usr_01',
      name: 'Alex Vance',
      email: 'student@synapse.edu',
      role: 'student',
      studentId: 'CSE-2022-042',
      department: 'Computer Science',
      status: 'Active',
    },
    {
      id: 'usr_02',
      name: 'Marcus Holloway',
      email: 'staff@synapse.edu',
      role: 'staff',
      staffId: 'STAFF-LAB-09',
      department: 'CSE Hardware Ops',
      status: 'Active',
    },
    {
      id: 'usr_03',
      name: 'Dr. Evelyn Reed',
      email: 'admin@synapse.edu',
      role: 'admin',
      staffId: 'ADMIN-DIR-01',
      department: 'Infrastructure Chair',
      status: 'Active',
    },
    {
      id: 'usr_04',
      name: 'Sarah Jenkins',
      email: 'sarah.j@synapse.edu',
      role: 'student',
      studentId: 'CSE-2021-089',
      department: 'Computer Science',
      status: 'Active',
    },
    {
      id: 'usr_05',
      name: 'David Miller',
      email: 'david.m@synapse.edu',
      role: 'student',
      studentId: 'CSE-2023-112',
      department: 'Software Engineering',
      status: 'Active',
    },
  ]);

  const handleRoleChange = (userId, newRole) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    addToast(`User permissions updated to ${newRole.toUpperCase()}`, 'success', 'Role Updated');
  };

  // Predictive Failure Analysis
  const highRiskStations = workstations
    .filter((w) => w.riskScore >= 50)
    .sort((a, b) => b.riskScore - a.riskScore);

  const totalHardwareAssets = inventory.reduce((acc, i) => acc + i.totalQty, 0);
  const totalLoanedAssets = checkouts.filter((c) => c.status === 'active').length;
  const labUtilization = Math.round(
    (workstations.filter((w) => w.currentOccupant !== 'Vacant').length / workstations.length) * 100
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-maroon p-6 sm:p-8 border border-gold-500/30 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Administrative Infrastructure Control</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Executive Console • {user?.name || 'Dr. Evelyn Reed'}
            </h2>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Global governance of 24 High-Performance Workstations, AI Predictive Failure Analysis, and Departmental Role-Based Access Control.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-zinc-900/90 border border-gold-500/40 text-xs text-slate-300 font-mono">
              <span className="text-gold-400 font-bold">MTBF:</span> 184 Days • <span className="text-emerald-400 font-bold">SLA:</span> 99.4%
            </div>
          </div>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Lab Station Utilization"
          value={`${labUtilization}%`}
          subtitle="18 active computing sessions"
          icon={Cpu}
          change="+14% this semester"
          changeType="positive"
        />

        <StatCard
          title="Predictive AI High-Risk"
          value={highRiskStations.length}
          subtitle="Workstations needing service"
          icon={Flame}
          change={highRiskStations.length > 0 ? 'High Failure Probability' : 'Optimal'}
          changeType={highRiskStations.length > 0 ? 'negative' : 'positive'}
        />

        <StatCard
          title="Active Incident Tickets"
          value={tickets.filter((t) => t.status !== 'resolved').length}
          subtitle="Across Hardware, Net & OS"
          icon={Wrench}
          change="3 in active triage"
          changeType="warning"
        />

        <StatCard
          title="Total Hardware Inventory"
          value={totalHardwareAssets}
          subtitle={`${totalLoanedAssets} assets currently loaned`}
          icon={Server}
          change="Audit synchronized"
          changeType="neutral"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-gold-500/20 pb-1">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-2 ${
            activeTab === 'analytics'
              ? 'bg-gradient-to-r from-maroon-800 to-gold-800 text-white border border-gold-400/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>System Analytics & Health</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_predictive')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-2 ${
            activeTab === 'ai_predictive'
              ? 'bg-gradient-to-r from-maroon-800 to-gold-800 text-white border border-gold-400/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-gold-300" />
          <span>AI Failure Prediction ({highRiskStations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-2 ${
            activeTab === 'users'
              ? 'bg-gradient-to-r from-maroon-800 to-gold-800 text-white border border-gold-400/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User RBAC & Permissions</span>
        </button>
      </div>

      {/* TAB 1: System Analytics Overview */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Workstation Fleet Status Overview */}
          <div className="rounded-2xl glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Department Workstation Fleet Status</h3>
                <p className="text-xs text-slate-400">Status breakdown across all 4 Department Labs ({workstations.length} PCs Total)</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-gold-500/10 border border-gold-500/30 text-gold-300">
                2 Columns × 4 PCs Per Lab
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Operational (Green)</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {workstations.filter((w) => w.status === 'healthy').length} / {workstations.length}
                  </span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${(workstations.filter((w) => w.status === 'healthy').length / workstations.length) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Minor Issues (Yellow)</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {workstations.filter((w) => w.status === 'warning').length} / {workstations.length}
                  </span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${(workstations.filter((w) => w.status === 'warning').length / workstations.length) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Maintenance Needed (Red)</span>
                  <span className="font-mono text-rose-400 font-bold">
                    {workstations.filter((w) => w.status === 'faulty').length} / {workstations.length}
                  </span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${(workstations.filter((w) => w.status === 'faulty').length / workstations.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Per-Lab Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {[
                { code: 'Lab 201', name: 'CP Lab', id: 'lab_201' },
                { code: 'Lab 203', name: 'General', id: 'lab_203' },
                { code: 'Lab 302', name: 'HPC/Thesis', id: 'lab_302' },
                { code: 'EC Lab', name: '1st Floor', id: 'lab_ec' },
              ].map((lab) => {
                const labWs = workstations.filter((w) => w.labId === lab.id);
                const healthy = labWs.filter((w) => w.status === 'healthy').length;
                return (
                  <div key={lab.id} className="p-2.5 rounded-xl bg-zinc-950/70 border border-white/5 text-center">
                    <p className="text-[11px] font-bold text-white">{lab.code}</p>
                    <p className="text-[9px] text-slate-400">{lab.name}</p>
                    <p className="text-xs font-mono font-bold text-emerald-400 mt-1">{healthy}/8 Online</p>
                  </div>
                );
              })}
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/70 border border-white/5 text-xs text-slate-400 flex items-center justify-between">
              <span>Department Lab Health Score:</span>
              <span className="font-mono text-base font-extrabold text-gold-400">93.8%</span>
            </div>
          </div>

          {/* Incident Categories Breakdown */}
          <div className="rounded-2xl glass-card p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Incident Category Distribution</h3>
            <p className="text-xs text-slate-400">Historical fault categories logged by students & staff</p>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-zinc-900/70 border border-white/5 text-center">
                <p className="text-2xl font-black text-rose-400 font-mono">
                  {tickets.filter((t) => t.category === 'Hardware').length}
                </p>
                <p className="text-xs font-semibold text-slate-300 mt-1">Hardware</p>
                <p className="text-[10px] text-slate-500">GPU/RAM/NVMe</p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/70 border border-white/5 text-center">
                <p className="text-2xl font-black text-cyan-400 font-mono">
                  {tickets.filter((t) => t.category === 'Software').length}
                </p>
                <p className="text-xs font-semibold text-slate-300 mt-1">Software</p>
                <p className="text-[10px] text-slate-500">CUDA/Drivers</p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/70 border border-white/5 text-center">
                <p className="text-2xl font-black text-amber-400 font-mono">
                  {tickets.filter((t) => t.category === 'Network').length}
                </p>
                <p className="text-xs font-semibold text-slate-300 mt-1">Network</p>
                <p className="text-[10px] text-slate-500">Ethernet/Switch</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-maroon-950/40 border border-maroon-600/30 text-xs text-rose-300 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <p className="font-bold">Hardware Alert Trend</p>
                <p className="text-slate-400 mt-0.5">
                  High GPU compute loads during deep learning lab courses correlate with 68% of reported overheating warnings.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: AI Predictive Maintenance Analysis */}
      {activeTab === 'ai_predictive' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl glass-maroon border border-gold-500/30 flex items-start space-x-4">
            <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-300 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Synapse Neural Reliability Watchdog
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                Our predictive AI models analyze SMART storage logs, GPU thermal dissipation gradients, fan RPM variance, and historical ticket intervals to predict components likely to fail within the next 14 operating days.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {highRiskStations.map((station) => (
              <div
                key={station.id}
                className="p-5 rounded-2xl glass-card border-rose-500/30 shadow-glow-maroon space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-base font-extrabold text-white">
                      {station.id}
                    </span>
                    <span className="text-xs text-slate-400">Row {station.row}</span>
                  </div>
                  <div className="px-2.5 py-1 rounded-full bg-maroon-900/80 border border-rose-500/60 text-rose-300 text-xs font-mono font-bold">
                    {station.riskScore}% Failure Risk
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 space-y-1">
                    <p className="text-slate-400 font-medium">Trigger Diagnostic Flag:</p>
                    <p className="text-white font-semibold">{station.alertMessage || 'Thermal gradient variance detected'}</p>
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-1">
                    <p>
                      <strong>Specs:</strong> {station.specs.gpu} • {station.specs.cpu.split(' ')[0]} {station.specs.cpu.split(' ')[1]}
                    </p>
                    <p>
                      <strong>IP:</strong> {station.specs.ipAddress}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <p className="text-[11px] text-gold-300 font-semibold mb-2">
                    Recommended Preventive Action:
                  </p>
                  <p className="text-xs text-slate-300 bg-white/5 p-2 rounded-lg">
                    {station.id === 'PC-05'
                      ? 'Inspect heatsink mounting, blow out radiator fins, swap thermal paste.'
                      : station.id === 'PC-12'
                      ? 'Re-crimp RJ45 keystone jack and verify 1000BASE-T patch cable.'
                      : 'Backup user NVMe profiles and prepare replacement 2TB Gen4 SSD.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: User RBAC & Roles Management */}
      {activeTab === 'users' && (
        <div className="rounded-2xl glass-card overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">User Accounts & RBAC Permissions</h3>
              <p className="text-xs text-slate-400">Enforce role segregation: Student $\leftrightarrow$ Staff $\leftrightarrow$ Admin</p>
            </div>
            <span className="text-xs text-gold-400 font-mono font-semibold">
              {usersList.length} Registered Accounts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-zinc-950/80 border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3 font-semibold">User Identity</th>
                  <th className="px-5 py-3 font-semibold">Department ID</th>
                  <th className="px-5 py-3 font-semibold">Current Role</th>
                  <th className="px-5 py-3 font-semibold text-right">Modify Permission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-white">{u.name}</p>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </td>
                    <td className="px-5 py-4 font-mono text-gold-400">
                      {u.studentId || u.staffId || 'CSE-DEPT'}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                          u.role === 'admin'
                            ? 'bg-maroon-950 text-rose-300 border-rose-500/50'
                            : u.role === 'staff'
                            ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                            : 'bg-slate-800 text-cyan-300 border-cyan-500/30'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-gold-400 cursor-pointer"
                      >
                        <option value="student">Student</option>
                        <option value="staff">Lab Assistant (Staff)</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
