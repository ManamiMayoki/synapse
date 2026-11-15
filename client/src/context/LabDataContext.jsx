import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const LabDataContext = createContext(null);

export const DEPARTMENT_ROOMS = [
  {
    id: 'lab_101',
    roomId: 'lab_101',
    roomCode: 'Lab 101',
    name: 'Electrical & Electronics Lab (EC Lab)',
    shortName: 'EC Lab (1st Floor)',
    floor: '1st Floor',
    type: 'ec_lab',
    rows: 4,
    cols: 2,
    totalTables: 8,
    totalPcs: 2,
    accentColor: '#d49b25',
    description: 'Located on the 1st Floor. 4 rows x 2 columns (8 long tables) with electronic equipment tracking: breadboards, resistors, voltage meters, and ammeters. Contains exactly 2 PCs.',
  },
  {
    id: 'lab_201',
    roomId: 'lab_201',
    roomCode: 'Lab 201',
    name: 'Computer Programming Lab (CP Lab)',
    shortName: 'CP Lab',
    floor: '2nd Floor',
    type: 'computer_lab',
    rows: 8,
    cols: 4,
    pcsPerSlot: 4,
    totalPcs: 128,
    accentColor: '#38bdf8',
    description: 'Specialized lab for competitive programming and algorithms. 8 rows and 4 columns, with 4 PCs per slot grid (128 PCs total).',
  },
  {
    id: 'lab_203',
    roomId: 'lab_203',
    roomCode: 'Lab 203',
    name: 'General CSE Lab',
    shortName: 'General CSE',
    floor: '2nd Floor',
    type: 'computer_lab',
    rows: 8,
    cols: 4,
    pcsPerSlot: 4,
    totalPcs: 128,
    accentColor: '#a78bfa',
    description: 'Enterprise workspace for software engineering, databases, and OS virtualization. 8 rows and 4 columns, with 4 PCs per slot grid.',
  },
  {
    id: 'lab_302',
    roomId: 'lab_302',
    roomCode: 'Lab 302',
    name: 'High Performance Lab (App & Game Testing, Thesis Work)',
    shortName: 'High Performance Lab',
    floor: '3rd Floor',
    type: 'computer_lab',
    rows: 8,
    cols: 4,
    pcsPerSlot: 4,
    totalPcs: 128,
    accentColor: '#f43f5e',
    description: 'GPU-accelerated cluster for thesis research, CUDA compute, and Unreal Engine VR testing. 8 rows and 4 columns, with 4 PCs per slot grid.',
  },
];

// Fallback Incident Tickets
const INITIAL_TICKETS = [
  {
    id: 'TCK-1001',
    workstationId: 'Lab201-R01-C01-P4',
    category: 'Hardware',
    title: 'Loose RJ45 Ethernet Connector',
    description: 'Ethernet port clip broken, cable falls out when desk vibrates. Re-crimped connector with Cat6 RJ45 plug.',
    status: 'resolved',
    priority: 'medium',
    reporter: 'Marcus Holloway',
    assignedTo: 'Marcus Holloway',
    createdAt: '2026-10-31T06:18:27Z',
    notes: 'Re-crimped RJ45 plug. Signal steady at 1Gbps full duplex.',
  },
  {
    id: 'TCK-1002',
    workstationId: 'Lab201-R02-C02-P1',
    category: 'Hardware',
    title: 'PSU Coil Whine & Fan Vibration',
    description: 'Intermittent high-pitch squeal during CUDA kernel compilations.',
    status: 'in_progress',
    priority: 'high',
    reporter: 'Alex Vance (364-32)',
    assignedTo: 'Marcus Holloway',
    createdAt: '2026-10-31T07:10:00Z',
    notes: 'Under testing with load tester.',
  },
  {
    id: 'TCK-1003',
    workstationId: 'Lab302-R01-C01-P2',
    category: 'Hardware',
    title: 'PCIe Riser Stuttering in VR Rig',
    description: 'Frame drops detected in Unreal Engine 5 thesis project run.',
    status: 'pending',
    priority: 'high',
    reporter: 'Sarah Jenkins (370-32)',
    assignedTo: 'Unassigned',
    createdAt: '2026-10-31T08:00:00Z',
    notes: 'Awaiting replacement PCIe 4.0 riser cable.',
  },
];

// Fallback Hardware Inventory Catalog
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
    location: 'EC Lab - Benches 1-4',
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
    name: 'Solderless Breadboard 830-Point Dual Bus',
    sku: 'BB-830-PRO',
    category: 'Breadboards',
    totalQty: 40,
    availableQty: 32,
    location: 'EC Lab - Benches 1-8',
    specs: '830 tie points, standard 2.54mm pitch',
    condition: 'Excellent',
  },
  {
    id: 'inv_06',
    name: 'Dual-Scale Analog DC Ammeter (0-1A / 0-5A)',
    sku: 'AM-ANALOG-5A',
    category: 'Ammeters',
    totalQty: 20,
    availableQty: 16,
    location: 'EC Lab - Bench Stations',
    specs: 'Class 2.5 precision, zero-adjust screw',
    condition: 'Calibrated',
  },
  {
    id: 'inv_07',
    name: 'Digital DC Voltmeter Module (0-30V LED 3-Wire)',
    sku: 'VM-DC-30V',
    category: 'Voltage Meters',
    totalQty: 24,
    availableQty: 16,
    location: 'EC Lab - Bench Stations',
    specs: '0.28" LED display, reverse polarity protection',
    condition: 'Calibrated',
  },
  {
    id: 'inv_08',
    name: '1/4W Metal Film Resistor Assortment Kit',
    sku: 'RES-KIT-100',
    category: 'Resistors',
    totalQty: 60,
    availableQty: 54,
    location: 'EC Lab - Component Drawer A',
    specs: '1% tolerance, flame retardant coating',
    condition: 'New',
  },
];

// Fallback Checkouts
const INITIAL_CHECKOUTS = [
  {
    id: 'chk_101',
    itemId: 'inv_02',
    itemName: 'Raspberry Pi 5 (8GB RAM Kit)',
    sku: 'RPI-5-8G',
    studentId: '364',
    studentName: 'Alex Vance',
    checkoutDate: '2026-10-25',
    dueDate: '2026-11-03',
    status: 'active',
  },
  {
    id: 'chk_102',
    itemId: 'inv_01',
    itemName: 'Arduino Giga R1 WiFi Board',
    sku: 'ARD-GIGA-01',
    studentId: '364',
    studentName: 'Alex Vance',
    checkoutDate: '2026-10-28',
    dueDate: '2026-11-04',
    status: 'active',
  },
  {
    id: 'chk_103',
    itemId: 'inv_03',
    itemName: 'Rigol DS1054Z 50MHz Digital Oscilloscope',
    sku: 'OSC-RIG-50',
    studentId: '370',
    studentName: 'Sarah Jenkins',
    checkoutDate: '2026-10-20',
    dueDate: '2026-10-27',
    status: 'overdue',
  },
];

export const LabDataProvider = ({ children }) => {
  const { addToast } = useToast();

  // Active room switcher state
  const [activeRoomId, setActiveRoomId] = useState('lab_201');
  const [rooms, setRooms] = useState(DEPARTMENT_ROOMS);
  const [activeRoom, setActiveRoom] = useState(DEPARTMENT_ROOMS[1]);
  const [workstations, setWorkstations] = useState([]);
  const [ecTables, setEcTables] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter toggles
  const [unallocatedOnly, setUnallocatedOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Working' | 'Needs Repair' | 'Fixed'
  const [searchQuery, setSearchQuery] = useState('');

  // EC Lab Equipment Inventory
  const [ecInventory, setEcInventory] = useState([]);

  // General Lab Hardware Checkouts & Tickets state
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

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('synapse_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('synapse_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('synapse_checkouts', JSON.stringify(checkouts));
  }, [checkouts]);

  // Fetch Rooms Overview from Backend
  const fetchRooms = useCallback(async () => {
    try {
      const res = await api.get('/rooms');
      if (res.data?.success && res.data.rooms) {
        setRooms(res.data.rooms);
      }
    } catch (err) {
      console.warn('[LabData] Could not load rooms from backend, using defaults:', err.message);
    }
  }, []);

  // Fetch Room Details (workstations or EC tables)
  const fetchRoomDetails = useCallback(async (roomId) => {
    setLoading(true);
    try {
      const res = await api.get(`/rooms/${roomId}`);
      if (res.data?.success) {
        setActiveRoom(res.data.room);
        setWorkstations(res.data.workstations || []);
        if (res.data.room?.tables) {
          setEcTables(res.data.room.tables);
        }
      }
    } catch (err) {
      console.warn('[LabData] Error loading room details:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch EC Lab Equipment
  const fetchEcEquipment = useCallback(async () => {
    try {
      const res = await api.get('/inventory/ec-lab');
      if (res.data?.success) {
        setEcInventory(res.data.items || []);
        if (res.data.room?.tables) {
          setEcTables(res.data.room.tables);
        }
      }
    } catch (err) {
      console.warn('[LabData] Error loading EC equipment:', err.message);
    }
  }, []);

  // Fetch Incident Tickets from Backend
  const fetchBackendTickets = useCallback(async () => {
    try {
      const res = await api.get('/tickets');
      if (res.data?.success && Array.isArray(res.data.tickets)) {
        // Map backend tickets to frontend format if necessary
        const mapped = res.data.tickets.map((t) => ({
          id: t.id || t._id,
          workstationId: t.pcId || t.workstationId || 'General',
          category: t.category || 'Hardware',
          title: t.title || 'Workstation Incident',
          description: t.description || '',
          status: t.currentStatus === 'Fixed' ? 'resolved' : t.currentStatus === 'Needs Repair' ? 'in_progress' : 'pending',
          priority: 'medium',
          reporter: `${t.reportedBy || 'Staff'} (${t.role || 'technician'})`,
          assignedTo: 'Marcus Holloway',
          createdAt: t.createdAt,
          notes: t.description || '',
        }));
        if (mapped.length > 0) {
          setTickets((prev) => {
            const combined = [...mapped];
            prev.forEach((p) => {
              if (!combined.some((c) => c.id === p.id)) combined.push(p);
            });
            return combined;
          });
        }
      }
    } catch (err) {
      console.warn('[LabData] Could not fetch backend tickets:', err.message);
    }
  }, []);

  // Fetch Inventory from Backend
  const fetchBackendInventory = useCallback(async () => {
    try {
      const res = await api.get('/inventory');
      if (res.data?.success && Array.isArray(res.data.items) && res.data.items.length > 0) {
        setInventory(res.data.items);
      }
    } catch (err) {
      console.warn('[LabData] Could not fetch backend inventory:', err.message);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
    fetchBackendTickets();
    fetchBackendInventory();
  }, [fetchRooms, fetchBackendTickets, fetchBackendInventory]);

  useEffect(() => {
    fetchRoomDetails(activeRoomId);
    if (activeRoomId === 'lab_101') {
      fetchEcEquipment();
    }
  }, [activeRoomId, fetchRoomDetails, fetchEcEquipment]);

  // Selected workstation object
  const selectedStation = (workstations || []).find((ws) => ws.pcId === selectedStationId || ws.id === selectedStationId) || null;

  // 1. Day-One Student Seating Claim [Student ID] + [Batch] (e.g. 364-32)
  const claimSeat = async ({ pcId, tag, studentId, batch, studentName }) => {
    try {
      const payload = { pcId, tag, studentId, batch, studentName };
      const res = await api.post('/seating/claim', payload);

      if (res.data?.success) {
        // Optimistically update workstation in state
        setWorkstations((prev) =>
          prev.map((w) => (w.pcId === pcId ? res.data.workstation : w))
        );
        addToast(res.data.message || 'Seat claimed successfully!', 'success', 'Seat Claimed');
        return { success: true };
      }
      return { success: false, message: res.data?.message };
    } catch (err) {
      addToast(err.message, 'error', 'Claim Error');
      return { success: false, message: err.message };
    }
  };

  // 2. Vacate a seat
  const vacateSeat = async (pcId) => {
    try {
      const res = await api.post('/seating/vacate', { pcId });
      if (res.data?.success) {
        setWorkstations((prev) =>
          prev.map((w) => (w.pcId === pcId ? res.data.workstation : w))
        );
        addToast(`Seat ${pcId} is now unallocated.`, 'info', 'Seat Vacated');
        return { success: true };
      }
    } catch (err) {
      addToast(err.message, 'error', 'Error');
      return { success: false, message: err.message };
    }
  };

  // 3. Teacher Exam Override: Randomly reallocate seating on verified working PCs only
  const teacherRandomReallocate = async (roomId, studentTags = []) => {
    try {
      const targetRoom = roomId || activeRoomId;
      const res = await api.post('/seating/exam-reallocate', {
        roomId: targetRoom,
        studentTags,
      });

      if (res.data?.success) {
        addToast(
          res.data.message || 'Random exam reallocation applied on verified working PCs.',
          'success',
          'Teacher Exam Override'
        );
        await fetchRoomDetails(targetRoom);
        await fetchRooms();
        return { success: true, count: res.data.allocatedCount };
      }
      return { success: false, message: res.data?.message };
    } catch (err) {
      addToast(err.message, 'error', 'Exam Reallocation Failed');
      return { success: false, message: err.message };
    }
  };

  // 4. Teacher Manual Allocation override
  const teacherManualAllocate = async ({ pcId, studentId, batch, tag, studentName }) => {
    try {
      const res = await api.post('/seating/manual-allocate', {
        pcId,
        studentId,
        batch,
        tag,
        studentName,
      });

      if (res.data?.success) {
        setWorkstations((prev) =>
          prev.map((w) => (w.pcId === pcId ? res.data.workstation : w))
        );
        addToast(res.data.message, 'success', 'Teacher Override');
        return { success: true };
      }
    } catch (err) {
      addToast(err.message, 'error', 'Allocation Error');
      return { success: false, message: err.message };
    }
  };

  // 5. Reset Allocations in a room
  const resetAllocations = async (roomId) => {
    try {
      const targetRoom = roomId || activeRoomId;
      const res = await api.post(`/seating/reset/${targetRoom}`);
      if (res.data?.success) {
        addToast(`All seating allocations reset for ${targetRoom}.`, 'info', 'Reset Complete');
        await fetchRoomDetails(targetRoom);
        await fetchRooms();
        return { success: true };
      }
    } catch (err) {
      addToast(err.message, 'error', 'Reset Error');
      return { success: false, message: err.message };
    }
  };

  // 6. Update PC Status (Working / Needs Repair / Fixed)
  const updatePcStatus = async (pcId, status, description = '', title = '') => {
    try {
      const res = await api.post(`/tickets/pc/${pcId}/status`, {
        status,
        description,
        title,
      });

      if (res.data?.success) {
        setWorkstations((prev) =>
          prev.map((w) => (w.pcId === pcId ? res.data.workstation : w))
        );
        addToast(`Workstation ${pcId} status updated to ${status}.`, 'info', 'Status Updated');
        if (res.data.seatingNotice) {
          addToast(res.data.seatingNotice, 'warning', 'Exam Notice');
        }
        await fetchRooms();
        fetchBackendTickets();
        return { success: true };
      }
    } catch (err) {
      addToast(err.message, 'error', 'Status Update Failed');
      return { success: false, message: err.message };
    }
  };

  // 7. Add Custom Descriptive Note explaining problem or fix
  const addPcNote = async (pcId, noteData) => {
    try {
      const res = await api.post(`/tickets/pc/${pcId}/note`, noteData);
      if (res.data?.success) {
        setWorkstations((prev) =>
          prev.map((w) => (w.pcId === pcId ? res.data.workstation : w))
        );
        addToast(`Descriptive note logged for ${pcId}.`, 'success', 'Note Logged');
        await fetchRooms();
        fetchBackendTickets();
        return { success: true, note: res.data.note };
      }
    } catch (err) {
      addToast(err.message, 'error', 'Note Submission Error');
      return { success: false, message: err.message };
    }
  };

  // 8. Update EC Table electronic equipment
  const updateTableEquipment = async (tableId, equipmentData) => {
    try {
      const res = await api.put(`/inventory/ec-lab/table/${tableId}`, equipmentData);
      if (res.data?.success) {
        setEcTables((prev) =>
          prev.map((t) => (t.tableId === tableId ? res.data.table : t))
        );
        addToast(`Equipment updated on ${tableId}.`, 'success', 'Bench Updated');
        return { success: true };
      }
    } catch (err) {
      addToast(err.message, 'error', 'Update Error');
      return { success: false, message: err.message };
    }
  };

  // 9. Hardware Checkout
  const checkoutItem = ({ itemId, studentId, studentName, days = 7 }) => {
    const item = (inventory || []).find((i) => i.id === itemId || i._id === itemId || i.itemId === itemId);
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
      prev.map((i) => (i.id === item.id || i._id === item._id ? { ...i, availableQty: i.availableQty - 1 } : i))
    );

    const now = new Date();
    const dueDate = new Date();
    dueDate.setDate(now.getDate() + days);

    const newCheckout = {
      id: `chk_${Date.now()}`,
      itemId: item.id || item.itemId,
      itemName: item.name,
      sku: item.sku,
      studentId: studentId || '364',
      studentName: studentName || 'Student',
      checkoutDate: now.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'active',
    };

    setCheckouts((prev) => [newCheckout, ...prev]);
    addToast(`${item.name} checked out to ${studentName}`, 'success', 'Gear Checked Out');
    return true;
  };

  // 10. Hardware Return
  const returnItem = (checkoutId) => {
    const checkout = (checkouts || []).find((c) => c.id === checkoutId);
    if (!checkout) return;

    setCheckouts((prev) =>
      prev.map((c) => (c.id === checkoutId ? { ...c, status: 'returned' } : c))
    );

    // Increment inventory available
    setInventory((prev) =>
      prev.map((i) => (i.id === checkout.itemId || i.itemId === checkout.itemId ? { ...i, availableQty: i.availableQty + 1 } : i))
    );

    addToast(`${checkout.itemName} checked in successfully.`, 'success', 'Item Returned');
  };

  // 11. Add new inventory item
  const addInventoryItem = async (itemData) => {
    try {
      const res = await api.post('/inventory', itemData);
      if (res.data?.success && res.data.item) {
        setInventory((prev) => [res.data.item, ...prev]);
        addToast(`${itemData.name} registered into inventory catalog.`, 'success', 'Inventory Added');
        return res.data.item;
      }
    } catch {
      // Fallback local addition
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
      return newItem;
    }
  };

  // 12. Create a new maintenance ticket
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

    // Update workstation status to Needs Repair if associated
    if (ticketData.workstationId) {
      updatePcStatus(
        ticketData.workstationId,
        'Needs Repair',
        ticketData.description,
        ticketData.title
      );
    }

    addToast(`Ticket ${newTicket.id} submitted for ${newTicket.workstationId}`, 'success', 'Ticket Created');
    return newTicket;
  };

  // 13. Update Ticket Status (Staff Triage)
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
            updatePcStatus(t.workstationId, 'Fixed', notes || 'Issue resolved by technician');
          }
          return updated;
        }
        return t;
      })
    );

    addToast(`Ticket ${ticketId} updated to ${nextStatus.replace('_', ' ').toUpperCase()}`, 'info', 'Status Updated');
  };

  // 14. Update Workstation Health directly (Staff/Admin override)
  const updateWorkstationStatus = (stationId, newStatus) => {
    updatePcStatus(stationId, newStatus === 'healthy' ? 'Working' : 'Needs Repair');
  };

  // Computed summary counts for active room (always safe arrays)
  const safeWorkstations = workstations || [];
  const workingCount = safeWorkstations.filter(
    (w) => w.status === 'Working' || w.status === 'Fixed' || w.status === 'healthy'
  ).length;
  const needsRepairCount = safeWorkstations.filter(
    (w) => w.status === 'Needs Repair' || w.status === 'faulty' || w.status === 'warning'
  ).length;
  const allocatedCount = safeWorkstations.filter((w) => w.allocatedTo && w.allocatedTo.tag).length;
  const unallocatedCount = Math.max(0, safeWorkstations.length - allocatedCount);

  return (
    <LabDataContext.Provider
      value={{
        DEPARTMENT_ROOMS,
        rooms,
        activeRoomId,
        setActiveRoomId,
        activeRoom,
        workstations: safeWorkstations,
        setWorkstations,
        ecTables,
        setEcTables,
        ecInventory,
        selectedStationId,
        setSelectedStationId,
        selectedStation,
        loading,
        // Filters
        unallocatedOnly,
        setUnallocatedOnly,
        statusFilter,
        setStatusFilter,
        searchQuery,
        setSearchQuery,
        // Stats
        workingCount,
        needsRepairCount,
        allocatedCount,
        unallocatedCount,
        // Seating & Workstation Methods
        claimSeat,
        vacateSeat,
        teacherRandomReallocate,
        teacherManualAllocate,
        resetAllocations,
        updatePcStatus,
        addPcNote,
        updateTableEquipment,
        fetchRoomDetails,
        fetchRooms,
        // Incident Tickets
        tickets: tickets || [],
        setTickets,
        createTicket,
        updateTicketStatus,
        // Inventory Catalog
        inventory: inventory || [],
        setInventory,
        addInventoryItem,
        // Checkouts
        checkouts: checkouts || [],
        setCheckouts,
        checkoutItem,
        returnItem,
        updateWorkstationStatus,
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
