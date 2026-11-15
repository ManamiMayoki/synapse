const Inventory = require('../models/Inventory');
const Room = require('../models/Room');

// @desc    Get all inventory items (EC Lab electronic equipment, microcontrollers, tools)
// @route   GET /api/inventory
// @access  Public
const getInventory = async (req, res, next) => {
  try {
    const { category, search } = req.query;

    const query = {};
    if (category && category !== 'All') {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const items = await Inventory.find(query).sort({ category: 1, name: 1 });

    return res.status(200).json({
      success: true,
      count: items.length,
      inventory: items,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get EC Lab (Lab 101) Electronic Equipment & Benches
// @route   GET /api/inventory/ec-lab
// @access  Public
const getEcLabEquipment = async (req, res, next) => {
  try {
    const ecRoom = await Room.findOne({ roomId: 'lab_101' });
    const ecItems = await Inventory.find({
      category: { $in: ['Breadboards', 'Resistors', 'Voltage Meters', 'Ammeters', 'Multimeters', 'Oscilloscopes'] },
    });

    return res.status(200).json({
      success: true,
      room: {
        roomId: ecRoom?.roomId || 'lab_101',
        name: ecRoom?.name || 'Electrical & Electronics Lab (EC Lab - 1st Floor)',
        floor: ecRoom?.floor || '1st Floor',
        tables: ecRoom?.tables || [],
        totalTables: ecRoom?.tables?.length || 8,
      },
      equipmentSummary: {
        totalBreadboards: ecItems.filter((i) => i.category === 'Breadboards').reduce((a, b) => a + b.totalQty, 0),
        totalResistors: ecItems.filter((i) => i.category === 'Resistors').reduce((a, b) => a + b.totalQty, 0),
        totalVoltageMeters: ecItems.filter((i) => i.category === 'Voltage Meters').reduce((a, b) => a + b.totalQty, 0),
        totalAmmeters: ecItems.filter((i) => i.category === 'Ammeters').reduce((a, b) => a + b.totalQty, 0),
        totalMultimeters: ecItems.filter((i) => i.category === 'Multimeters').reduce((a, b) => a + b.totalQty, 0),
        totalOscilloscopes: ecItems.filter((i) => i.category === 'Oscilloscopes').reduce((a, b) => a + b.totalQty, 0),
      },
      items: ecItems,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new inventory asset
// @route   POST /api/inventory
// @access  Private (Staff/Admin)
const addInventoryItem = async (req, res, next) => {
  try {
    const { name, sku, category, totalQty, location, benchId, specs, condition } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Item name is required.' });
    }

    const item = await Inventory.create({
      itemId: `inv_${Date.now()}`,
      name: name.trim(),
      sku: sku ? sku.trim() : `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      category: category || 'General',
      totalQty: Number(totalQty) || 10,
      availableQty: Number(totalQty) || 10,
      location: location || 'EC Lab (Lab 101 - 1st Floor)',
      benchId: benchId || null,
      specs: specs || '',
      condition: condition || 'Good',
    });

    return res.status(201).json({
      success: true,
      message: `${item.name} successfully registered in laboratory asset inventory.`,
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update electronic equipment quantities on a specific table in Lab 101
// @route   PUT /api/inventory/ec-lab/table/:tableId
// @access  Private (Staff/Teacher/Admin)
const updateTableEquipment = async (req, res, next) => {
  try {
    const { tableId } = req.params;
    const { breadboards, resistorKits, voltageMeters, ammeters, multimeters, oscilloscopes, notes } = req.body;

    const room = await Room.findOne({ roomId: 'lab_101' });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Lab 101 not found.' });
    }

    const table = room.tables.find((t) => t.tableId === tableId);
    if (!table) {
      return res.status(404).json({ success: false, message: `Table ${tableId} not found in Lab 101.` });
    }

    if (breadboards !== undefined) table.equipment.breadboards = Number(breadboards);
    if (resistorKits !== undefined) table.equipment.resistorKits = Number(resistorKits);
    if (voltageMeters !== undefined) table.equipment.voltageMeters = Number(voltageMeters);
    if (ammeters !== undefined) table.equipment.ammeters = Number(ammeters);
    if (multimeters !== undefined) table.equipment.multimeters = Number(multimeters);
    if (oscilloscopes !== undefined) table.equipment.oscilloscopes = Number(oscilloscopes);
    if (notes !== undefined) table.equipment.notes = notes;

    await room.save();

    return res.status(200).json({
      success: true,
      message: `Equipment on ${tableId} updated successfully.`,
      table,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventory,
  getEcLabEquipment,
  addInventoryItem,
  updateTableEquipment,
};
