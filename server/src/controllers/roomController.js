const Room = require('../models/Room');
const Workstation = require('../models/Workstation');
const Inventory = require('../models/Inventory');

// Definition of the Departmental Labs
const INITIAL_ROOM_DEFINITIONS = [
  {
    roomId: 'lab_101',
    roomCode: 'Lab 101',
    name: 'Electrical & Electronics Lab (EC Lab)',
    shortName: 'EC Lab (1st Floor)',
    floor: '1st Floor',
    type: 'ec_lab',
    rows: 4,
    cols: 2,
    pcsPerSlot: 1, // Special: only 2 tables have a PC
    totalPcs: 2,
    accentColor: '#d49b25',
    description: 'Located on the 1st Floor. 4 rows x 2 columns (8 long tables) with electronic equipment tracking: breadboards, resistors, voltage meters, and ammeters. Contains exactly 2 PCs.',
  },
  {
    roomId: 'lab_201',
    roomCode: 'Lab 201',
    name: 'Computer Programming Lab (CP Lab)',
    shortName: 'CP Lab',
    floor: '2nd Floor',
    type: 'computer_lab',
    rows: 8,
    cols: 4,
    pcsPerSlot: 4,
    totalPcs: 128, // 8 rows x 4 cols = 32 slots x 4 PCs = 128 PCs
    accentColor: '#38bdf8',
    description: 'Specialized lab for competitive programming and algorithm benchmarks. 8 rows and 4 columns, with 4 PCs per slot grid (128 PCs total).',
  },
  {
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

// Helper to seed all rooms and workstations
const seedRoomsAndWorkstations = async () => {
  // Check if rooms already exist
  const count = await Room.countDocuments();
  if (count >= 4) {
    return;
  }

  console.log('[Database Seeder] Seeding University CSE Department Labs & Workstations...');

  // Clear existing
  await Room.deleteMany({});
  await Workstation.deleteMany({});
  await Inventory.deleteMany({});

  // 1. Seed Lab 101 (EC Lab - 1st Floor)
  const ecTables = [];
  for (let r = 1; r <= 4; r++) {
    for (let c = 1; c <= 2; c++) {
      const tableNumber = (r - 1) * 2 + c;
      const tableId = `Table-${String(tableNumber).padStart(2, '0')}`;
      const hasPc = tableNumber === 1 || tableNumber === 8; // Exactly 2 PCs: at Bench 1 and Bench 8
      const pcId = hasPc ? `L101-PC-${tableNumber === 1 ? '01' : '02'}` : null;

      ecTables.push({
        tableId,
        row: r,
        col: c,
        label: `Bench ${tableNumber} (Row ${r}, Col ${c})`,
        hasPc,
        pcId,
        equipment: {
          breadboards: 4,
          resistorKits: 3, // Assorted 220Ω, 1kΩ, 10kΩ
          voltageMeters: 2, // DC Digital Voltmeter
          ammeters: 2,      // DC Ammeter 0-5A
          multimeters: 2,
          oscilloscopes: tableNumber <= 4 ? 1 : 0,
          notes: tableNumber === 3 ? 'Ammeter lead terminal #2 needs tightening' : 'Operational bench setup',
        },
      });

      if (hasPc) {
        await Workstation.create({
          pcId,
          roomId: 'lab_101',
          roomName: 'Electrical & Electronics Lab (EC Lab)',
          slotRow: r,
          slotCol: c,
          slotLabel: `Bench ${tableNumber}`,
          pcIndex: 1,
          displayId: pcId.replace('L101-', ''),
          status: 'Working',
          allocatedTo: {
            studentId: tableNumber === 1 ? '364' : null,
            batch: tableNumber === 1 ? '32' : null,
            tag: tableNumber === 1 ? '364-32' : null,
            studentName: tableNumber === 1 ? 'Alex Vance' : null,
            claimedAt: tableNumber === 1 ? new Date() : null,
            allocationMode: tableNumber === 1 ? 'student_claim' : null,
          },
          notes: [
            {
              title: 'Lab 101 Master DAQ PC Online',
              description: 'Rigol UltraSigma & LabVIEW instrument drivers installed and verified.',
              previousStatus: 'Fixed',
              newStatus: 'Working',
              reportedBy: 'Marcus Holloway',
              role: 'staff',
              createdAt: new Date(),
            },
          ],
          specs: {
            cpu: 'Intel Core i7-13700 @ 5.2 GHz',
            gpu: 'NVIDIA RTX A2000 12GB',
            ram: '32 GB DDR5 ECC',
            storage: '1 TB NVMe SSD',
            os: 'Windows 11 Pro / MATLAB R2024a',
            ipAddress: `10.14.10.${10 + tableNumber}`,
          },
        });
      }
    }
  }

  // Create Lab 101 Room document
  await Room.create({
    ...INITIAL_ROOM_DEFINITIONS[0],
    tables: ecTables,
  });

  // Seed Electronic Inventory items for EC Lab
  const ecInventoryItems = [
    { itemId: 'inv_bb_01', name: 'Solderless Breadboard 830-Point Dual Bus', sku: 'BB-830-PRO', category: 'Breadboards', totalQty: 40, availableQty: 32, location: 'EC Lab - Benches 1-8', benchId: 'All Benches', specs: '830 tie points, standard 2.54mm pitch', condition: 'Excellent' },
    { itemId: 'inv_res_01', name: '1/4W Metal Film Resistor Assortment Kit (220Ω, 1kΩ, 10kΩ, 4.7kΩ)', sku: 'RES-KIT-100', category: 'Resistors', totalQty: 60, availableQty: 54, location: 'EC Lab - Component Drawer A', benchId: 'Drawer A', specs: '1% tolerance, flame retardant coating', condition: 'New' },
    { itemId: 'inv_vm_01', name: 'Digital DC Voltmeter Module (0-30V LED 3-Wire)', sku: 'VM-DC-30V', category: 'Voltage Meters', totalQty: 24, availableQty: 16, location: 'EC Lab - Bench Stations', benchId: 'Table-01 to Table-08', specs: '0.28" LED display, reverse polarity protection', condition: 'Calibrated' },
    { itemId: 'inv_am_01', name: 'Dual-Scale Analog DC Ammeter (0-1A / 0-5A)', sku: 'AM-ANALOG-5A', category: 'Ammeters', totalQty: 20, availableQty: 16, location: 'EC Lab - Bench Stations', benchId: 'Table-01 to Table-08', specs: 'Class 2.5 precision, zero-adjust screw', condition: 'Calibrated' },
    { itemId: 'inv_dmm_01', name: 'Rigol DM3058E 5½ Digit Digital Multimeter', sku: 'DMM-RIG-55', category: 'Multimeters', totalQty: 10, availableQty: 8, location: 'EC Lab - Cabinet B', benchId: 'Table-01', specs: 'True-RMS AC, USB & LXI LAN interface', condition: 'Calibrated' },
    { itemId: 'inv_osc_01', name: 'Rigol DS1054Z 50MHz 4-Channel Digital Oscilloscope', sku: 'OSC-RIG-50', category: 'Oscilloscopes', totalQty: 8, availableQty: 4, location: 'EC Lab - Benches 1-4', benchId: 'Table-01 to Table-04', specs: '4 Channels, 1GSa/s real-time sample rate', condition: 'Calibrated' },
  ];
  await Inventory.insertMany(ecInventoryItems);

  // 2. Seed Labs 201, 203, and 302:
  // Layout: 8 rows and 4 columns, with 4 PCs per slot grid!
  const computerLabDefs = INITIAL_ROOM_DEFINITIONS.slice(1);

  for (const labDef of computerLabDefs) {
    await Room.create(labDef);

    const workstationsToInsert = [];
    const rows = 8;
    const cols = 4;
    const pcsPerSlot = 4;

    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        const slotLabel = `Slot R${r}-C${c}`;

        for (let p = 1; p <= pcsPerSlot; p++) {
          const pcId = `${labDef.roomCode.replace(' ', '')}-R${String(r).padStart(2, '0')}-C${String(c).padStart(2, '0')}-P${p}`;
          const displayId = `R${r}C${c}-P${p}`;

          // Preset a few realistic statuses & student claims
          let status = 'Working';
          let allocatedTo = {
            studentId: null,
            batch: null,
            tag: null,
            studentName: null,
            claimedAt: null,
            allocationMode: null,
          };
          const notes = [];

          // Day-one sample student claims
          if (r === 1 && c === 1 && p === 1) {
            allocatedTo = {
              studentId: '364',
              batch: '32',
              tag: '364-32',
              studentName: 'Alex Vance',
              claimedAt: new Date(Date.now() - 3600000 * 2),
              allocationMode: 'student_claim',
            };
          } else if (r === 1 && c === 2 && p === 2) {
            allocatedTo = {
              studentId: '365',
              batch: '32',
              tag: '365-32',
              studentName: 'Elena Rostova',
              claimedAt: new Date(Date.now() - 3600000 * 3),
              allocationMode: 'student_claim',
            };
          } else if (r === 2 && c === 3 && p === 4) {
            allocatedTo = {
              studentId: '372',
              batch: '31',
              tag: '372-31',
              studentName: 'David Miller',
              claimedAt: new Date(Date.now() - 3600000 * 5),
              allocationMode: 'student_claim',
            };
          }

          // Sample issue on specific PCs
          if (r === 2 && c === 1 && p === 3) {
            status = 'Needs Repair';
            notes.push({
              title: 'Monitor HDMI Flickering',
              description: 'Primary screen loses HDMI sync signal when running 144Hz refresh rate.',
              previousStatus: 'Working',
              newStatus: 'Needs Repair',
              reportedBy: 'Alex Vance (364-32)',
              role: 'student',
              createdAt: new Date(Date.now() - 7200000),
            });
          } else if (r === 4 && c === 2 && p === 1 && labDef.roomId === 'lab_302') {
            status = 'Needs Repair';
            notes.push({
              title: 'GPU Thermal Throttling @ 98°C',
              description: 'NVIDIA RTX 4090 fans stall under CUDA fine-tuning benchmark.',
              previousStatus: 'Working',
              newStatus: 'Needs Repair',
              reportedBy: 'System Watchdog',
              role: 'staff',
              createdAt: new Date(Date.now() - 14400000),
            });
          } else if (r === 1 && c === 4 && p === 2) {
            status = 'Fixed';
            notes.push({
              title: 'Keychron Spacebar Repaired',
              description: 'Mechanical switch spring replaced and stabilized. Verified working.',
              previousStatus: 'Needs Repair',
              newStatus: 'Fixed',
              reportedBy: 'Marcus Holloway',
              role: 'staff',
              createdAt: new Date(Date.now() - 28800000),
            });
          }

          workstationsToInsert.push({
            pcId,
            roomId: labDef.roomId,
            roomName: labDef.name,
            slotRow: r,
            slotCol: c,
            slotLabel,
            pcIndex: p,
            displayId,
            status,
            allocatedTo,
            notes,
            specs: {
              cpu: labDef.roomId === 'lab_302' ? 'Intel Core i9-14900K (24C/32T)' : 'AMD Ryzen 7 7800X3D',
              gpu: labDef.roomId === 'lab_302' ? 'NVIDIA GeForce RTX 4090 24GB' : 'NVIDIA GeForce RTX 4070 Super 12GB',
              ram: labDef.roomId === 'lab_302' ? '64 GB DDR5-6000' : '32 GB DDR5-5600',
              storage: '2 TB PCIe 4.0 NVMe SSD',
              os: 'Ubuntu 24.04 LTS / Windows 11 Dual Boot',
              ipAddress: `10.14.${labDef.roomCode.replace('Lab ', '')}.${(r - 1) * 16 + (c - 1) * 4 + p}`,
            },
          });
        }
      }
    }

    await Workstation.insertMany(workstationsToInsert);
  }

  console.log('[Database Seeder] Successfully initialized all 4 departmental lab structures!');
};

// @desc    Get all lab rooms with summary statistics
// @route   GET /api/rooms
// @access  Public
const getRooms = async (req, res, next) => {
  try {
    await seedRoomsAndWorkstations();

    const rooms = await Room.find().sort({ roomCode: 1 });

    const roomsWithStats = await Promise.all(
      rooms.map(async (room) => {
        const workstations = await Workstation.find({ roomId: room.roomId });
        const workingCount = workstations.filter((w) => w.status === 'Working' || w.status === 'Fixed').length;
        const repairCount = workstations.filter((w) => w.status === 'Needs Repair').length;
        const allocatedCount = workstations.filter((w) => w.allocatedTo && w.allocatedTo.tag).length;
        const unallocatedCount = workstations.length - allocatedCount;

        return {
          id: room.roomId,
          roomId: room.roomId,
          roomCode: room.roomCode,
          name: room.name,
          shortName: room.shortName,
          floor: room.floor,
          type: room.type,
          rows: room.rows,
          cols: room.cols,
          pcsPerSlot: room.pcsPerSlot,
          totalPcs: room.totalPcs,
          accentColor: room.accentColor,
          description: room.description,
          examMode: room.examMode,
          stats: {
            totalWorkstations: workstations.length,
            working: workingCount,
            needsRepair: repairCount,
            allocated: allocatedCount,
            unallocated: unallocatedCount,
          },
          tables: room.tables || [],
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: roomsWithStats.length,
      rooms: roomsWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get room details with full workstation grid or table equipment
// @route   GET /api/rooms/:roomId
// @access  Public
const getRoomDetails = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ success: false, message: `Room ${roomId} not found.` });
    }

    const workstations = await Workstation.find({ roomId }).sort({ slotRow: 1, slotCol: 1, pcIndex: 1 });

    return res.status(200).json({
      success: true,
      room,
      workstations,
      stats: {
        total: workstations.length,
        working: workstations.filter((w) => w.status === 'Working' || w.status === 'Fixed').length,
        needsRepair: workstations.filter((w) => w.status === 'Needs Repair').length,
        allocated: workstations.filter((w) => w.allocatedTo && w.allocatedTo.tag).length,
        unallocated: workstations.filter((w) => !w.allocatedTo || !w.allocatedTo.tag).length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Force re-seed all rooms & workstations to clean initial state
// @route   POST /api/rooms/seed
// @access  Public / Dev
const seedRooms = async (req, res, next) => {
  try {
    await Room.deleteMany({});
    await Workstation.deleteMany({});
    await Inventory.deleteMany({});
    await seedRoomsAndWorkstations();

    return res.status(200).json({
      success: true,
      message: 'Departmental lab layouts & workstations successfully seeded to fresh initial state.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRooms, getRoomDetails, seedRooms, seedRoomsAndWorkstations };
