import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const LabDataContext = createContext(null);

// Generate initial 24 workstations (4 rows of 6)
const generateInitialWorkstations = () => {
  const workstations = [];
  const rows = 4;
  const cols = 6;
  const spacingX = 3.6;
  const spacingZ = 4.2;

  let count = 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = `PC-${String(count).padStart(2, '0')}`;
      
      // Preset interesting status distribution
      let status = 'healthy';
      let riskScore = Math.floor(10 + Math.random() * 25);
      let alertMessage = null;

      if (id === 'PC-05') {
        status = 'faulty';
        riskScore = 94;
        alertMessage = 'GPU Overheating & Artifacts detected';
      } else if (id === 'PC-12') {
        status = 'warning';
        riskScore = 78;
        alertMessage = 'Ethernet port packet drops (12% loss)';
      } else if (id === 'PC-21') {
        status = 'warning';
        riskScore = 82;
        alertMessage = 'NVMe SSD S.M.A.R.T sector reallocations';
      }

      workstations.push({
        id,
        number: count,
        row: r + 1,
        column: c + 1,
        // Centered grid coordinates
        position: [
          (c - (cols - 1) / 2) * spacingX,
          0,
          (r - (rows - 1) / 2) * spacingZ,
        ],
        status,
        riskScore,
        alertMessage,
        specs: {
          cpu: count % 2 === 0 ? 'Intel Core i9-14900K (24C/32T)' : 'AMD Ryzen 9 7900X (12C/24T)',
          gpu: count % 3 === 0 ? 'NVIDIA GeForce RTX 4090 24GB' : 'NVIDIA GeForce RTX 4080 Super 16GB',
          ram: count % 2 === 0 ? '64 GB DDR5-6000 MT/s' : '32 GB DDR5-5600 MT/s',
          storage: '2 TB PCIe 4.0 NVMe M.2 SSD',
          os: 'Ubuntu 24.04 LTS / Windows 11 Dual Boot',
          displays: 'Dual 27" QHD 2560x1440 @ 165Hz IPS',
          ipAddress: `10.14.20.${100 + count}`,
          macAddress: `00:1A:2B:3C:4D:${String(count).padStart(2, '0')}`,
        },
        currentOccupant: count % 4 === 0 ? 'Vacant' : `Student [Session Active]`,
        lastMaintenance: '2026-10-15',
      });
      count++;
    }
  }
  return workstations;
};

// Initial realistic tickets
const INITIAL_TICKETS = [
  {
    id: 'TCK-1001',
    workstationId: 'PC-05',
    category: 'Hardware',
    title: 'GPU Thermal Throttling & Artifacts during CUDA run',
    description: 'During PyTorch distributed training benchmark, GPU temperatures hit 98°C and displayed rainbow visual artifacts before kernel panic.',
    status: 'in_progress',
    priority: 'high',
    reporter: 'Alex Vance (CSE-2022-042)',
    assignedTo: 'Marcus Holloway',
    createdAt: '2026-10-30T10:15:00Z',
    notes: 'Thermal paste reapplied. Running stress test on FurMark.',
  },
  {
    id: 'TCK-1002',
    workstationId: 'PC-12',
    category: 'Network',
    title: 'Ethernet Link Renegotiation & Dropouts',
    description: 'Wall jack RJ45 terminal is loose. Workstation drops from 1000Mbps full duplex to 10Mbps intermittent connection.',
    status: 'pending',
    priority: 'medium',
    reporter: 'David Miller (CSE-2023-112)',
    assignedTo: 'Unassigned',
    createdAt: '2026-10-30T14:40:00Z',
    notes: 'Awaiting replacement Cat6 patch cable and crimping tool.',
  },
  {
    id: 'TCK-1003',
    workstationId: 'PC-21',
    category: 'Hardware',
    title: 'NVMe S.M.A.R.T Warning - Bad Sector Count Increasing',
    description: 'System log shows SMART attribute 05 (Reallocated Sectors Count) exceeded threshold. Frequent write stalls on /home partition.',
    status: 'pending',
    priority: 'high',
    reporter: 'System Watchdog AI',
    assignedTo: 'Marcus Holloway',
    createdAt: '2026-10-31T01:20:00Z',
    notes: 'Scheduled backup before cloning drive.',
  },
  {
    id: 'TCK-1004',
    workstationId: 'PC-18',
    category: 'Software',
    title: 'CUDA Toolkit 12.4 library path link error',
    description: 'nvcc is installed in /usr/local/cuda-12.4 but default PATH points to missing cuda-11.8 directory.',
    status: 'resolved',
    priority: 'low',
    reporter: 'Elena Rostova (CSE-2022-019)',
    assignedTo: 'Marcus Holloway',
    createdAt: '2026-10-28T09:00:00Z',
    notes: 'Updated /etc/environment and symlinked default cuda path. Verified with nvcc --version.',
  },
  {
    id: 'TCK-1005',
    workstationId: 'PC-03',
    category: 'Hardware',
    title: 'Keychron Mechanical Keyboard Spacebar Switch Stuck',
    description: 'Keycap spring popped loose after heavy typing test.',
    status: 'resolved',
    priority: 'low',
    reporter: 'Samir Patel (CSE-2023-044)',
    assignedTo: 'Marcus Holloway',
    createdAt: '2026-10-27T16:30:00Z',
    notes: 'Swapped Gateron Red switch and lubricated stabilizer.',
  },
];

// Initial Hardware Inventory
const INITIAL_INVENTORY = [
  {
    id: 'inv_01',
    name: 'Arduino Giga R1 WiFi Board',
    sku: 'ARD-GIGA-01',
    category: 'Microcontroller',
    totalQty: 25,
    availableQty: 18,
    location: 'Cabinet A - Shelf 1',
    specs: 'Dual-core STM32H747XI, Wi-Fi/BLE, 76 GPIOs, 12-bit DAC',
    condition: 'Excellent',
  },
  {
    id: 'inv_02',
    name: 'Raspberry Pi 5 (8GB RAM Kit)',
    sku: 'RPI-5-8G',
    category: 'SBC & Embedded',
    totalQty: 30,
    availableQty: 12,
    location: 'Cabinet A - Shelf 2',
    specs: 'Quad-core Arm Cortex-A76 @ 2.4GHz, 8GB LPDDR4X, PCIe 2.0',
    condition: 'Excellent',
  },
  {
    id: 'inv_03',
    name: 'Rigol DS1054Z 50MHz Digital Oscilloscope',
    sku: 'OSC-RIG-50',
    category: 'Test & Measurement',
    totalQty: 10,
    availableQty: 7,
    location: 'Bench Station B3',
    specs: '4 Channels, 50MHz bandwidth, 1GSa/s real-time sample rate',
    condition: 'Calibrated',
  },
  {
    id: 'inv_04',
    name: 'Saleae Logic 8 USB Logic Analyzer',
    sku: 'LOGIC-SAL-8',
    category: 'Test & Measurement',
    totalQty: 15,
    availableQty: 11,
    location: 'Cabinet B - Shelf 4',
    specs: '8 digital/analog channels, 100MS/s, USB 3.0 interface',
    condition: 'Excellent',
  },
  {
    id: 'inv_05',
    name: 'ESP32-S3 AI/IoT Node Development Kit',
    sku: 'ESP32-S3-KIT',
    category: 'IoT & Sensors',
    totalQty: 40,
    availableQty: 29,
    location: 'Cabinet C - Bin 1',
    specs: 'Xtensa 32-bit LX7 dual-core, AI vector extensions, 8MB PSRAM',
    condition: 'New',
  },
  {
    id: 'inv_06',
    name: 'NVIDIA Jetson Orin Nano Developer Kit',
    sku: 'JET-ORIN-8G',
    category: 'AI Edge Compute',
    totalQty: 8,
    availableQty: 5,
    location: 'Server Room Safe Locker',
    specs: 'Up to 40 TOPS AI compute, Ampere GPU with 1024 CUDA cores',
    condition: 'Excellent',
  },
  {
    id: 'inv_07',
    name: 'Cisco Catalyst 2960-X Managed Switch',
    sku: 'CIS-2960-SW',
    category: 'Networking',
    totalQty: 6,
    availableQty: 4,
    location: 'NetLab Rack 2',
    specs: '24 Gigabit Ethernet ports, 4x 1G SFP uplinks, Layer 2+',
    condition: 'Good',
  },
  {
    id: 'inv_08',
    name: 'TS101 Smart Portable Soldering Station',
    sku: 'SOLD-TS101',
    category: 'Lab Tools',
    totalQty: 12,
    availableQty: 8,
    location: 'Hardware Prototyping Bench',
    specs: '65W USB-PD / DC 9-24V, OLED display, dual temp sensors',
    condition: 'Good',
  },
];

// Initial Checkouts
const INITIAL_CHECKOUTS = [
  {
    id: 'chk_101',
    itemId: 'inv_02',
    itemName: 'Raspberry Pi 5 (8GB RAM Kit)',
    sku: 'RPI-5-8G',
    studentId: 'CSE-2022-042',
    studentName: 'Alex Vance',
    checkoutDate: '2026-10-25',
    dueDate: '2026-11-03',
    status: 'active',
  },
  {
    id: 'chk_102',
    itemId: 'inv_05',
    itemName: 'ESP32-S3 AI/IoT Node Development Kit',
    sku: 'ESP32-S3-KIT',
    studentId: 'CSE-2022-042',
    studentName: 'Alex Vance',
    checkoutDate: '2026-10-28',
    dueDate: '2026-11-01',
    status: 'active',
  },
  {
    id: 'chk_103',
    itemId: 'inv_03',
    itemName: 'Rigol DS1054Z 50MHz Digital Oscilloscope',
    sku: 'OSC-RIG-50',
    studentId: 'CSE-2021-089',
    studentName: 'Sarah Jenkins',
    checkoutDate: '2026-10-20',
    dueDate: '2026-10-27',
    status: 'overdue',
  },
];

export const LabDataProvider = ({ children }) => {
  const { addToast } = useToast();

  const [workstations, setWorkstations] = useState(() => {
    const saved = localStorage.getItem('synapse_workstations');
    return saved ? JSON.parse(saved) : generateInitialWorkstations();
  });

  const [tickets, setTickets] = useState(() => {
    const saved = localStorage.getItem('synapse_tickets');
    return saved ? JSON.parse(saved) : INITIAL_TICKETS;
  });

  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('synapse_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [checkouts, setCheckouts] = useState(() => {
    const saved = localStorage.getItem('synapse_checkouts');
    return saved ? JSON.parse(saved) : INITIAL_CHECKOUTS;
  });

  const [selectedStationId, setSelectedStationId] = useState(null);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('synapse_workstations', JSON.stringify(workstations));
  }, [workstations]);

  useEffect(() => {
    localStorage.setItem('synapse_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('synapse_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('synapse_checkouts', JSON.stringify(checkouts));
  }, [checkouts]);

  // Create a new maintenance ticket
  const createTicket = (ticketData) => {
    const newTicket = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      workstationId: ticketData.workstationId || 'General',
      category: ticketData.category || 'Hardware',
      title: ticketData.title,
      description: ticketData.description,
      status: 'pending',
      priority: ticketData.priority || 'medium',
      reporter: ticketData.reporter || 'Student',
      assignedTo: 'Unassigned',
      createdAt: new Date().toISOString(),
      notes: 'Logged into triage queue.',
    };

    setTickets((prev) => [newTicket, ...prev]);

    // Update workstation status to warning/faulty if associated
    if (ticketData.workstationId) {
      setWorkstations((prev) =>
        prev.map((ws) =>
          ws.id === ticketData.workstationId
            ? {
                ...ws,
                status: ticketData.priority === 'high' ? 'faulty' : 'warning',
                alertMessage: ticketData.title,
                riskScore: Math.min(100, ws.riskScore + 25),
              }
            : ws
        )
      );
    }

    addToast(`Ticket ${newTicket.id} submitted for ${newTicket.workstationId}`, 'success', 'Ticket Created');
    return newTicket;
  };

  // Update Ticket Status (Staff Triage)
  const updateTicketStatus = (ticketId, nextStatus, notes = '') => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const updated = {
            ...t,
            status: nextStatus,
            notes: notes || t.notes,
          };
          // If resolved, restore workstation health if no other open tickets exist
          if (nextStatus === 'resolved' && t.workstationId) {
            setWorkstations((wsList) =>
              wsList.map((ws) =>
                ws.id === t.workstationId
                  ? { ...ws, status: 'healthy', alertMessage: null, riskScore: 15 }
                  : ws
              )
            );
          }
          return updated;
        }
        return t;
      })
    );

    addToast(`Ticket ${ticketId} updated to ${nextStatus.replace('_', ' ').toUpperCase()}`, 'info', 'Status Updated');
  };

  // Checkout hardware item
  const checkoutItem = ({ itemId, studentId, studentName, days = 7 }) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) {
      addToast('Hardware item not found in catalog.', 'error', 'Checkout Failed');
      return false;
    }
    if (item.availableQty <= 0) {
      addToast(`${item.name} is currently out of stock.`, 'warning', 'Unavailable');
      return false;
    }

    // Decrement available qty
    setInventory((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, availableQty: i.availableQty - 1 } : i))
    );

    const now = new Date();
    const dueDate = new Date();
    dueDate.setDate(now.getDate() + days);

    const newCheckout = {
      id: `chk_${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      sku: item.sku,
      studentId,
      studentName,
      checkoutDate: now.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'active',
    };

    setCheckouts((prev) => [newCheckout, ...prev]);
    addToast(`${item.name} checked out to ${studentName}`, 'success', 'Gear Checked Out');
    return true;
  };

  // Return hardware item
  const returnItem = (checkoutId) => {
    const checkout = checkouts.find((c) => c.id === checkoutId);
    if (!checkout) return;

    setCheckouts((prev) =>
      prev.map((c) => (c.id === checkoutId ? { ...c, status: 'returned' } : c))
    );

    // Increment inventory available
    setInventory((prev) =>
      prev.map((i) => (i.id === checkout.itemId ? { ...i, availableQty: i.availableQty + 1 } : i))
    );

    addToast(`${checkout.itemName} checked in successfully.`, 'success', 'Item Returned');
  };

  // Update Workstation Health directly (Staff/Admin override)
  const updateWorkstationStatus = (stationId, newStatus) => {
    setWorkstations((prev) =>
      prev.map((ws) =>
        ws.id === stationId
          ? {
              ...ws,
              status: newStatus,
              alertMessage: newStatus === 'healthy' ? null : ws.alertMessage || 'Manual override applied',
              riskScore: newStatus === 'healthy' ? 12 : newStatus === 'warning' ? 65 : 95,
            }
          : ws
      )
    );
    addToast(`${stationId} status updated to ${newStatus.toUpperCase()}`, 'info', 'Station Updated');
  };

  // Add new inventory item
  const addInventoryItem = (itemData) => {
    const newItem = {
      id: `inv_${Date.now()}`,
      name: itemData.name,
      sku: itemData.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      category: itemData.category || 'Components',
      totalQty: Number(itemData.totalQty) || 10,
      availableQty: Number(itemData.totalQty) || 10,
      location: itemData.location || 'Cabinet A',
      specs: itemData.specs || 'CSE Hardware Lab asset',
      condition: itemData.condition || 'New',
    };
    setInventory((prev) => [newItem, ...prev]);
    addToast(`${newItem.name} registered into inventory catalog.`, 'success', 'Inventory Added');
  };

  const selectedStation = workstations.find((ws) => ws.id === selectedStationId) || null;

  return (
    <LabDataContext.Provider
      value={{
        workstations,
        tickets,
        inventory,
        checkouts,
        selectedStationId,
        setSelectedStationId,
        selectedStation,
        createTicket,
        updateTicketStatus,
        checkoutItem,
        returnItem,
        updateWorkstationStatus,
        addInventoryItem,
      }}
    >
      {children}
    </LabDataContext.Provider>
  );
};

export const useLabData = () => {
  const context = useContext(LabDataContext);
  if (!context) throw new Error('useLabData must be used within LabDataProvider');
  return context;
};
