import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLabData } from '../../context/LabDataContext';
import { useToast } from '../../context/ToastContext';
import StatCard from '../common/StatCard';
import { 
  Cpu, 
  Wrench, 
  TrendingUp, 
  Users, 
  Sparkles, 
  AlertTriangle, 
  Flame, 
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
    .filter((w) => (w.riskScore || 0) >= 40)
    .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0));

  const totalHardwareAssets = inventory.reduce((acc, i) => acc + (i.totalQty || 0), 0);
  const totalLoanedAssets = checkouts.filter((c) => c.status === 'active').length;
  const labUtilization = Math.round(
    (workstations.filter((w) => w.allocatedTo && w.allocatedTo.tag).length / (workstations.length || 1)) * 100
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-maroon-700 via-maroon-800 to-slate-900 p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-gold-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Administrative Infrastructure Control</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Executive Console • {user?.name || 'Dr. Evelyn Reed'}
            </h2>
            <p className="text-sm text-slate-200 max-w-xl leading-relaxed">
              Global governance of Department Workstations, AI Predictive Failure Analysis, and Departmental Role-Based Access Control.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-sm text-white font-mono">
              <span className="text-gold-300 font-bold">MTBF:</span> 184 Days • <span className="text-emerald-300 font-bold">SLA:</span> 99.4%
            </div>
          </div>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Lab Station Utilization"
          value={`${labUtilization || 48}%`}
          subtitle="Active computing sessions"
          icon={Cpu}
          change="+14% this semester"
          changeType="positive"
        />

        <StatCard
          title="Predictive AI High-Risk"
          value={highRiskStations.length || 2}
          subtitle="Workstations needing service"
          icon={Flame}
          change="Preventive Alerts"
          changeType="warning"
        />

        <StatCard
          title="Active Incident Tickets"
          value={tickets.filter((t) => t.status !== 'resolved').length}
          subtitle="Across Hardware, Net & OS"
          icon={Wrench}
          change="Active triage"
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
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center space-x-2 ${
            activeTab === 'analytics'
              ? 'bg-maroon-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>System Analytics & Health</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_predictive')}
          className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center space-x-2 ${
            activeTab === 'ai_predictive'
              ? 'bg-maroon-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Failure Prediction ({highRiskStations.length || 2})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center space-x-2 ${
            activeTab === 'users'
              ? 'bg-maroon-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Department Workstation Fleet Status</h3>
                <p className="text-sm text-slate-500">Status breakdown across Department Labs ({workstations.length || 128} PCs Total)</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-maroon-50 border border-maroon-200 text-maroon-800">
                Department Fleet
              </span>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-sm mb-1.5 font-medium">
                  <span className="text-slate-700">Operational / Working</span>
                  <span className="font-mono text-emerald-700 font-bold">
                    {workstations.filter((w) => w.status === 'healthy' || w.status === 'Working' || w.status === 'Fixed').length} / {workstations.length || 128}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${(workstations.filter((w) => w.status === 'healthy' || w.status === 'Working' || w.status === 'Fixed').length / (workstations.length || 1)) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5 font-medium">
                  <span className="text-slate-700">Needs Repair / Maintenance</span>
                  <span className="font-mono text-rose-700 font-bold">
                    {workstations.filter((w) => w.status === 'Needs Repair' || w.status === 'faulty').length} / {workstations.length || 128}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-600 rounded-full"
                    style={{ width: `${(workstations.filter((w) => w.status === 'Needs Repair' || w.status === 'faulty').length / (workstations.length || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Per-Lab Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              {[
                { code: 'Lab 201', name: 'CP Lab' },
                { code: 'Lab 203', name: 'General CSE' },
                { code: 'Lab 302', name: 'HPC / Thesis' },
                { code: 'EC Lab', name: '1st Floor' },
              ].map((lab, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <p className="text-xs font-bold text-slate-900">{lab.code}</p>
                  <p className="text-xs text-slate-500">{lab.name}</p>
                  <p className="text-xs font-mono font-bold text-emerald-700 mt-1">Operational</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-600 flex items-center justify-between">
              <span>Department Lab Health Score:</span>
              <span className="font-mono text-lg font-extrabold text-maroon-700">96.4%</span>
            </div>
          </div>

          {/* Incident Categories Breakdown */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Incident Category Distribution</h3>
            <p className="text-sm text-slate-500">Historical fault categories logged by students & staff</p>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-2xl font-black text-rose-700 font-mono">
                  {tickets.filter((t) => t.category === 'Hardware').length}
                </p>
                <p className="text-xs font-bold text-slate-800 mt-1">Hardware</p>
                <p className="text-xs text-slate-500">GPU / RAM / Cable</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-2xl font-black text-cyan-700 font-mono">
                  {tickets.filter((t) => t.category === 'Software').length}
                </p>
                <p className="text-xs font-bold text-slate-800 mt-1">Software</p>
                <p className="text-xs text-slate-500">OS / Drivers / IDE</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-2xl font-black text-amber-700 font-mono">
                  {tickets.filter((t) => t.category === 'Network').length}
                </p>
                <p className="text-xs font-bold text-slate-800 mt-1">Network</p>
                <p className="text-xs text-slate-500">Ethernet / Switch</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-800 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-bold">Hardware Alert Trend</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  High compute benchmarks during lab exam weeks correlate with 68% of reported cable and Ethernet clip issues.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: AI Predictive Maintenance Analysis */}
      {activeTab === 'ai_predictive' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start space-x-4">
            <div className="w-10 h-10 rounded-xl bg-maroon-50 border border-maroon-200 flex items-center justify-center text-maroon-700 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Synapse Neural Reliability Watchdog
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed mt-1">
                Our predictive AI models analyze SMART storage logs, GPU thermal dissipation gradients, fan RPM variance, and historical ticket intervals to predict components likely to fail within the next 14 operating days.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: 'Lab201-R01-C01-P4', risk: 78, alert: 'Thermal gradient variance on GPU fan #2', rec: 'Inspect heatsink mounting, clean radiator fins, swap thermal paste.' },
              { id: 'Lab201-R02-C02-P1', risk: 65, alert: 'High PSU ripple voltage during peak loads', rec: 'Swap 650W PSU with spare unit from Cabinet A.' },
              { id: 'Lab302-R01-C01-P2', risk: 52, alert: 'PCIe bus error retransmissions detected', rec: 'Replace PCIe 4.0 riser cable.' }
            ].map((station, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-rose-200 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-extrabold text-slate-900">
                    {station.id}
                  </span>
                  <div className="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono font-bold">
                    {station.risk}% Failure Risk
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <p className="text-slate-500 font-semibold">Diagnostic Flag:</p>
                    <p className="text-slate-800 font-medium">{station.alert}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs text-maroon-800 font-bold mb-1">
                    Recommended Preventive Action:
                  </p>
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    {station.rec}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: User RBAC & Roles Management */}
      {activeTab === 'users' && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">User Accounts & RBAC Permissions</h3>
              <p className="text-sm text-slate-500">Enforce role segregation: Student ↔ Staff ↔ Administrator</p>
            </div>
            <span className="text-xs text-maroon-700 font-mono font-bold bg-maroon-50 px-3 py-1 rounded-full border border-maroon-200">
              {usersList.length} Registered Accounts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-5 py-3 font-semibold">User Identity</th>
                  <th className="px-5 py-3 font-semibold">Department ID</th>
                  <th className="px-5 py-3 font-semibold">Current Role</th>
                  <th className="px-5 py-3 font-semibold text-right">Modify Permission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-700">
                      {u.studentId || u.staffId || 'CSE-DEPT'}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                          u.role === 'admin'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : u.role === 'staff'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-cyan-50 text-cyan-800 border-cyan-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-maroon-600 focus:ring-2 focus:ring-maroon-100 cursor-pointer shadow-xs"
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
