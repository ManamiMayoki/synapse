import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../context/AuthContext';
import { useLabData } from '../../context/LabDataContext';
import { useToast } from '../../context/ToastContext';
import StatCard from '../common/StatCard';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { 
  Wrench, 
  Layers, 
  CheckCircle2, 
  Clock, 
  QrCode, 
  Scan, 
  Plus, 
  ArrowRight, 
  Sparkles
} from 'lucide-react';

export default function StaffDashboard() {
  const { user } = useAuth();
  const { 
    tickets, 
    updateTicketStatus, 
    inventory, 
    addInventoryItem, 
    checkouts, 
    checkoutItem, 
    returnItem 
  } = useLabData();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('triage'); // 'triage' | 'inventory' | 'checkouts'
  
  // Triage state
  const [selectedTicketForNotes, setSelectedTicketForNotes] = useState(null);
  const [technicianNotes, setTechnicianNotes] = useState('');

  // Add Inventory state
  const [addInventoryModalOpen, setAddInventoryModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Microcontroller');
  const [newItemQty, setNewItemQty] = useState(10);
  const [newItemLocation, setNewItemLocation] = useState('Cabinet A - Shelf 3');
  const [newItemSpecs, setNewItemSpecs] = useState('');

  // QR Code Viewer Modal state
  const [qrModalItem, setQrModalItem] = useState(null);

  // Rapid QR Checkout Simulator state
  const [scannerModalOpen, setScannerModalOpen] = useState(false);
  const [scanStudentId, setScanStudentId] = useState('CSE-2022-042');
  const [scanItemId, setScanItemId] = useState('');

  // Ticket Triage Columns
  const pendingTickets = tickets.filter((t) => t.status === 'pending');
  const inProgressTickets = tickets.filter((t) => t.status === 'in_progress');
  const resolvedTickets = tickets.filter((t) => t.status === 'resolved');

  const handleStatusChange = (ticketId, nextStatus) => {
    updateTicketStatus(ticketId, nextStatus);
  };

  const handleSaveNotes = (e) => {
    e.preventDefault();
    if (!selectedTicketForNotes) return;
    updateTicketStatus(selectedTicketForNotes.id, selectedTicketForNotes.status, technicianNotes);
    setSelectedTicketForNotes(null);
    setTechnicianNotes('');
  };

  const handleAddInventory = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    addInventoryItem({
      name: newItemName,
      category: newItemCategory,
      totalQty: Number(newItemQty),
      location: newItemLocation,
      specs: newItemSpecs || 'Hardware Lab Asset',
    });

    setAddInventoryModalOpen(false);
    setNewItemName('');
    setNewItemSpecs('');
  };

  const handleSimulateScanCheckout = (e) => {
    e.preventDefault();
    if (!scanItemId) {
      addToast('Please choose an item to simulate scanning.', 'warning');
      return;
    }

    const success = checkoutItem({
      itemId: scanItemId,
      studentId: scanStudentId,
      studentName: 'Alex Vance (Verified)',
      days: 7,
    });

    if (success) {
      setScannerModalOpen(false);
      setScanItemId('');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-maroon-700 via-maroon-800 to-slate-900 p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-gold-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Lab Operations & Technical Services</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Triage Console • {user?.name || 'Marcus Holloway'}
            </h2>
            <p className="text-sm text-slate-200 max-w-xl leading-relaxed">
              Staff ID: <span className="font-mono text-gold-300 font-bold">{user?.staffId || 'STAFF-LAB-09'}</span>. Managing workstation incident tickets, hardware stock, and QR loan transactions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setScannerModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-white text-maroon-800 hover:bg-slate-100 font-bold text-sm flex items-center space-x-2 transition-all shadow-sm"
            >
              <Scan className="w-4 h-4 text-maroon-700" />
              <span>Simulate QR Scan</span>
            </button>

            <button
              onClick={() => setAddInventoryModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-maroon-900/60 hover:bg-maroon-900/80 text-white border border-white/20 font-semibold text-sm flex items-center space-x-2 transition-all"
            >
              <Plus className="w-4 h-4 text-gold-300" />
              <span>Register New Item</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Pending Incident Triage"
          value={pendingTickets.length}
          subtitle="Awaiting technician review"
          icon={Clock}
          change={pendingTickets.length > 0 ? 'Action Needed' : 'Queue Empty'}
          changeType={pendingTickets.length > 0 ? 'warning' : 'positive'}
        />

        <StatCard
          title="Active Repairs In Progress"
          value={inProgressTickets.length}
          subtitle="Hardware & network servicing"
          icon={Wrench}
          change="Technicians on floor"
          changeType="neutral"
        />

        <StatCard
          title="Active Gear Loans"
          value={checkouts.filter((c) => c.status === 'active').length}
          subtitle="Items currently with students"
          icon={Layers}
          change="Tracked via QR"
          changeType="neutral"
        />

        <StatCard
          title="Resolved Incident Rate"
          value={`${resolvedTickets.length}/${tickets.length || 1}`}
          subtitle="All-time triage resolution"
          icon={CheckCircle2}
          change="91% SLA Met"
          changeType="positive"
        />
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('triage')}
          className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center space-x-2 ${
            activeTab === 'triage'
              ? 'bg-maroon-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Ticket Triage Board ({tickets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center space-x-2 ${
            activeTab === 'inventory'
              ? 'bg-maroon-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Physical Inventory Stock</span>
        </button>

        <button
          onClick={() => setActiveTab('checkouts')}
          className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center space-x-2 ${
            activeTab === 'checkouts'
              ? 'bg-maroon-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Checkout & Loan Ledger</span>
        </button>
      </div>

      {/* TAB 1: Real-time Ticketing Triage Board (Kanban Columns) */}
      {activeTab === 'triage' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Column 1: Pending Review */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                <h3 className="text-sm font-bold text-slate-900 tracking-wide">Pending Review</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 text-xs font-bold">
                {pendingTickets.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {pendingTickets.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-10 font-medium">No pending reports</p>
              ) : (
                pendingTickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all space-y-2.5 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-maroon-700">{t.workstationId}</span>
                      <StatusBadge status={t.priority} size="xs" />
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{t.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{t.description}</p>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">{t.reporter.split(' ')[0]}</span>
                      <button
                        onClick={() => handleStatusChange(t.id, 'in_progress')}
                        className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center space-x-1 transition-all"
                      >
                        <span>Start Servicing</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 2: In Progress / Servicing */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <h3 className="text-sm font-bold text-slate-900 tracking-wide">In Progress</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                {inProgressTickets.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {inProgressTickets.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-10 font-medium">No active servicing tasks</p>
              ) : (
                inProgressTickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-xl bg-slate-50 border border-amber-200 hover:border-amber-300 transition-all space-y-2.5 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-maroon-700">{t.workstationId}</span>
                      <StatusBadge status={t.priority} size="xs" />
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{t.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{t.description}</p>

                    {t.notes && (
                      <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 font-medium">
                        <strong>Technician Note:</strong> {t.notes}
                      </p>
                    )}

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setSelectedTicketForNotes(t);
                          setTechnicianNotes(t.notes || '');
                        }}
                        className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
                      >
                        Add Notes
                      </button>
                      <button
                        onClick={() => handleStatusChange(t.id, 'resolved')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center space-x-1 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Resolved</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 3: Resolved & Verified */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <h3 className="text-sm font-bold text-slate-900 tracking-wide">Resolved & Closed</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                {resolvedTickets.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {resolvedTickets.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-10 font-medium">No resolved history</p>
              ) : (
                resolvedTickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-600">{t.workstationId}</span>
                      <StatusBadge status="resolved" size="xs" />
                    </div>

                    <h4 className="text-sm font-medium text-slate-700 line-through decoration-emerald-500">
                      {t.title}
                    </h4>

                    {t.notes && (
                      <p className="text-xs text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200">
                        {t.notes}
                      </p>
                    )}

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                      <span>Ref: {t.id}</span>
                      <button
                        onClick={() => handleStatusChange(t.id, 'in_progress')}
                        className="text-slate-600 hover:text-amber-700 font-semibold"
                        title="Reopen ticket"
                      >
                        Reopen
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: Physical Inventory Stock Manager */}
      {activeTab === 'inventory' && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Department Hardware Asset Stock</h3>
              <p className="text-sm text-slate-500">Microcontrollers, single board computers, test equipment</p>
            </div>
            <button
              onClick={() => setAddInventoryModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-maroon-700 hover:bg-maroon-800 text-white text-sm font-bold flex items-center space-x-1.5 transition-all shadow-sm self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Stock Item</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-5 py-3 font-semibold">SKU / Item Name</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Available / Total</th>
                  <th className="px-5 py-3 font-semibold">Lab Bin Location</th>
                  <th className="px-5 py-3 font-semibold text-right">QR Pass</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="font-mono text-xs text-maroon-700">{item.sku}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-mono font-bold ${
                            item.availableQty > 5
                              ? 'text-emerald-700'
                              : item.availableQty > 0
                              ? 'text-amber-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {item.availableQty} / {item.totalQty}
                        </span>
                        <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              item.availableQty > 5
                                ? 'bg-emerald-600'
                                : item.availableQty > 0
                                ? 'bg-amber-500'
                                : 'bg-rose-600'
                            }`}
                            style={{ width: `${(item.availableQty / (item.totalQty || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-600">{item.location}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setQrModalItem(item)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold transition-all inline-flex items-center space-x-1.5 shadow-xs"
                      >
                        <QrCode className="w-3.5 h-3.5 text-maroon-700" />
                        <span>View QR</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Checkout & Loan Ledger */}
      {activeTab === 'checkouts' && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Active Loan Ledger</h3>
              <p className="text-sm text-slate-500">Barcode/QR checkout transactions and returns</p>
            </div>
            <button
              onClick={() => setScannerModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-maroon-700 hover:bg-maroon-800 text-white text-sm font-bold flex items-center space-x-1.5 transition-all shadow-sm"
            >
              <Scan className="w-4 h-4" />
              <span>Rapid Scanner</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-5 py-3 font-semibold">Student / Researcher</th>
                  <th className="px-5 py-3 font-semibold">Equipment Item</th>
                  <th className="px-5 py-3 font-semibold">Due Date</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {checkouts.map((chk) => (
                  <tr key={chk.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">{chk.studentName}</p>
                      <p className="font-mono text-xs text-slate-500">{chk.studentId}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{chk.itemName}</p>
                      <p className="font-mono text-xs text-maroon-700">{chk.sku}</p>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-600">{chk.dueDate}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={chk.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      {chk.status === 'active' || chk.status === 'overdue' ? (
                        <button
                          onClick={() => returnItem(chk.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all shadow-xs"
                        >
                          Check In / Return
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Archived</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Technician Notes Modal */}
      <Modal
        isOpen={!!selectedTicketForNotes}
        onClose={() => setSelectedTicketForNotes(null)}
        title={`Servicing Notes — ${selectedTicketForNotes?.id}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveNotes} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Workstation {selectedTicketForNotes?.workstationId}: {selectedTicketForNotes?.title}
            </label>
            <textarea
              rows={4}
              required
              placeholder="Record diagnostic findings, swapped components, or test bench metrics..."
              value={technicianNotes}
              onChange={(e) => setTechnicianNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-maroon-600 focus:ring-2 focus:ring-maroon-100 resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-maroon-700 hover:bg-maroon-800 text-white text-sm font-bold shadow-sm"
            >
              Save Technician Log
            </button>
          </div>
        </form>
      </Modal>

      {/* QR Code Pass Modal */}
      <Modal
        isOpen={!!qrModalItem}
        onClose={() => setQrModalItem(null)}
        title={`Asset QR Tag — ${qrModalItem?.name}`}
        maxWidth="max-w-sm"
      >
        {qrModalItem && (
          <div className="flex flex-col items-center justify-center p-4 text-center space-y-4">
            <div className="p-4 bg-white rounded-2xl shadow-md border-2 border-slate-200">
              <QRCodeSVG
                value={`SYNAPSE-ASSET:${qrModalItem.sku}:${qrModalItem.id}`}
                size={180}
                level="H"
                includeMargin={false}
              />
            </div>
            <div>
              <p className="font-mono text-xs font-bold text-maroon-700">{qrModalItem.sku}</p>
              <p className="text-base font-extrabold text-slate-900">{qrModalItem.name}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Location: {qrModalItem.location}</p>
            </div>
            <p className="text-xs text-slate-400">
              Scan with Synapse Mobile or Handheld Zebra Barcode Scanner.
            </p>
          </div>
        )}
      </Modal>

      {/* Rapid QR Scanner Simulator Modal */}
      <Modal
        isOpen={scannerModalOpen}
        onClose={() => setScannerModalOpen(false)}
        title="Simulate Barcode / QR Scanner"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSimulateScanCheckout} className="space-y-4">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <Scan className="w-10 h-10 mx-auto text-maroon-700 mb-2" />
            <p className="text-sm font-bold text-slate-900 uppercase tracking-wide">Optical Reader Simulator Active</p>
            <p className="text-xs text-slate-500 mt-1">Select student ID and item below to test the checkout pipeline</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Target Student ID Card
            </label>
            <input
              type="text"
              value={scanStudentId}
              onChange={(e) => setScanStudentId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-maroon-600 focus:ring-2 focus:ring-maroon-100 font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Scanned Equipment Barcode
            </label>
            <select
              value={scanItemId}
              onChange={(e) => setScanItemId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-maroon-600 focus:ring-2 focus:ring-maroon-100 cursor-pointer"
            >
              <option value="">Choose item to simulate scan...</option>
              {inventory.map((item) => (
                <option key={item.id} value={item.id} disabled={item.availableQty <= 0}>
                  {item.sku} — {item.name} ({item.availableQty} in stock)
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-maroon-700 hover:bg-maroon-800 text-white text-sm font-bold flex items-center space-x-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Process Checkout Scan</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Inventory Item Modal */}
      <Modal
        isOpen={addInventoryModalOpen}
        onClose={() => setAddInventoryModalOpen(false)}
        title="Register Hardware Asset"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleAddInventory} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Item Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. STM32 Nucleo-64 Board"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-maroon-600 focus:ring-2 focus:ring-maroon-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-maroon-600 focus:ring-2 focus:ring-maroon-100"
              >
                <option value="Microcontroller">Microcontroller</option>
                <option value="SBC & Embedded">SBC & Embedded</option>
                <option value="Test & Measurement">Test & Measurement</option>
                <option value="IoT & Sensors">IoT & Sensors</option>
                <option value="Networking">Networking</option>
                <option value="Lab Tools">Lab Tools</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Initial Stock Qty
              </label>
              <input
                type="number"
                min="1"
                value={newItemQty}
                onChange={(e) => setNewItemQty(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-maroon-600 focus:ring-2 focus:ring-maroon-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Storage Bin / Cabinet Location
            </label>
            <input
              type="text"
              placeholder="e.g. Cabinet B - Shelf 2"
              value={newItemLocation}
              onChange={(e) => setNewItemLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-maroon-600 focus:ring-2 focus:ring-maroon-100"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-maroon-700 hover:bg-maroon-800 text-white text-sm font-bold shadow-sm"
            >
              Save to Catalog
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
