import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useLabData } from '../../context/LabDataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../common/Modal';
import { Search, Filter, QrCode, Plus, Layers, CheckCircle2, ArrowRight } from 'lucide-react';

export default function InventoryPage() {
  const { inventory, checkouts, checkoutItem, addInventoryItem } = useLabData();
  const { user, role } = useAuth();
  const { addToast } = useToast();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [qrModalItem, setQrModalItem] = useState(null);
  const [checkoutModalItem, setCheckoutModalItem] = useState(null);
  const [borrowDays, setBorrowDays] = useState(7);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // New item form
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Microcontroller');
  const [totalQty, setTotalQty] = useState(10);
  const [location, setLocation] = useState('Cabinet A');
  const [specs, setSpecs] = useState('');

  const categories = ['All', 'Microcontroller', 'SBC & Embedded', 'Test & Measurement', 'IoT & Sensors', 'Networking', 'Lab Tools'];

  const filteredItems = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!checkoutModalItem) return;

    checkoutItem({
      itemId: checkoutModalItem.id,
      studentId: user?.studentId || 'CSE-2022-042',
      studentName: user?.name || 'Alex Vance',
      days: Number(borrowDays) || 7,
    });

    setCheckoutModalItem(null);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    addInventoryItem({
      name,
      category,
      totalQty: Number(totalQty),
      location,
      specs,
    });

    setAddModalOpen(false);
    setName('');
    setSpecs('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Page Title & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Hardware Inventory & QR Checkout
          </h2>
          <p className="text-xs text-slate-400">
            Browse laboratory dev kits, microcontrollers, test equipment, and tools
          </p>
        </div>

        {(role === 'staff' || role === 'admin') && (
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-maroon-700 to-gold-600 hover:from-maroon-600 hover:to-gold-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Asset</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by item name, SKU, or storage bin location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-gold-400"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-maroon-800 to-gold-800 text-white border border-gold-400/40 shadow-sm'
                  : 'bg-zinc-900 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Items Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl glass-card p-5 flex flex-col justify-between group hover:border-gold-500/40 transition-all duration-300"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-[10px] font-semibold text-slate-300">
                  {item.category}
                </span>
                <button
                  onClick={() => setQrModalItem(item)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-gold-300 hover:bg-gold-500/10 transition-colors"
                  title="View QR Barcode"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-gold-200 transition-colors">
                {item.name}
              </h3>
              <p className="font-mono text-[10px] text-gold-400/90 mt-0.5">{item.sku}</p>

              <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                {item.specs}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Stock:</span>
                <span
                  className={`font-mono font-bold ${
                    item.availableQty > 5
                      ? 'text-emerald-400'
                      : item.availableQty > 0
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {item.availableQty} / {item.totalQty} available
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-500 font-mono truncate">
                  {item.location}
                </span>

                <button
                  onClick={() => setCheckoutModalItem(item)}
                  disabled={item.availableQty <= 0}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-maroon-700 to-gold-600 hover:from-maroon-600 hover:to-gold-500 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-40 disabled:pointer-events-none"
                >
                  Borrow
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Borrow Confirmation Modal */}
      <Modal
        isOpen={!!checkoutModalItem}
        onClose={() => setCheckoutModalItem(null)}
        title={`Borrow — ${checkoutModalItem?.name}`}
        maxWidth="max-w-md"
      >
        {checkoutModalItem && (
          <form onSubmit={handleCheckoutSubmit} className="space-y-4">
            <div className="p-4 rounded-xl bg-zinc-900 border border-white/10 space-y-1">
              <p className="font-mono text-xs text-gold-400">{checkoutModalItem.sku}</p>
              <h4 className="text-sm font-bold text-white">{checkoutModalItem.name}</h4>
              <p className="text-xs text-slate-400">{checkoutModalItem.specs}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Borrower Student
              </label>
              <div className="px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/5 text-xs text-white">
                {user?.name} ({user?.studentId || 'CSE-2022-042'})
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Loan Period
              </label>
              <select
                value={borrowDays}
                onChange={(e) => setBorrowDays(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-gold-400 cursor-pointer"
              >
                <option value={3}>3 Days (Class Experiment)</option>
                <option value={7}>7 Days (1 Week)</option>
                <option value={14}>14 Days (Semester Project)</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-maroon-700 to-gold-600 text-white text-xs font-bold shadow-glow-maroon"
              >
                Confirm & Issue Gear
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* QR Code Tag Modal */}
      <Modal
        isOpen={!!qrModalItem}
        onClose={() => setQrModalItem(null)}
        title={`Hardware Asset QR — ${qrModalItem?.name}`}
        maxWidth="max-w-xs"
      >
        {qrModalItem && (
          <div className="flex flex-col items-center justify-center p-4 text-center space-y-4">
            <div className="p-4 bg-white rounded-2xl shadow-2xl border-4 border-gold-500/40">
              <QRCodeSVG
                value={`SYNAPSE-ASSET:${qrModalItem.sku}:${qrModalItem.id}`}
                size={180}
                level="H"
                includeMargin={false}
              />
            </div>
            <div>
              <p className="font-mono text-xs font-bold text-gold-400">{qrModalItem.sku}</p>
              <p className="text-sm font-extrabold text-white">{qrModalItem.name}</p>
              <p className="text-xs text-slate-400 mt-1">Location: {qrModalItem.location}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Inventory Modal (Staff/Admin) */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Register New Lab Equipment"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Equipment Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Raspberry Pi Zero 2 W"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-gold-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-gold-400 cursor-pointer"
              >
                {categories.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={totalQty}
                onChange={(e) => setTotalQty(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-gold-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Storage Bin / Cabinet Location
            </label>
            <input
              type="text"
              placeholder="e.g. Cabinet B - Shelf 1"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-gold-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Technical Specifications
            </label>
            <input
              type="text"
              placeholder="e.g. 1GHz Quad-Core, 512MB RAM, Wireless LAN"
              value={specs}
              onChange={(e) => setSpecs(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-gold-400"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-maroon-700 to-gold-600 text-white text-xs font-bold shadow-md"
            >
              Add to Catalog
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
