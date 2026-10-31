const mongoose = require('mongoose');

const tableEquipmentSchema = new mongoose.Schema(
  {
    tableId: { type: String, required: true }, // e.g. "Table-01" to "Table-08"
    row: { type: Number, required: true },     // 1 to 4
    col: { type: Number, required: true },     // 1 to 2
    label: { type: String, required: true },   // "Bench 1 (Row 1, Col 1)"
    hasPc: { type: Boolean, default: false },  // exactly 2 tables have PCs in Lab 101
    pcId: { type: String, default: null },
    equipment: {
      breadboards: { type: Number, default: 4 },
      resistorKits: { type: Number, default: 2 }, // Assorted 220Ω, 1kΩ, 10kΩ
      voltageMeters: { type: Number, default: 2 }, // Digital/Analog DC Voltmeter
      ammeters: { type: Number, default: 2 },      // Digital/Analog DC Ammeter
      multimeters: { type: Number, default: 2 },
      oscilloscopes: { type: Number, default: 1 },
      notes: { type: String, default: 'Operational bench setup' },
    },
  },
  { _id: true }
);

const roomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    roomCode: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    shortName: {
      type: String,
      required: true,
    },
    floor: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['ec_lab', 'computer_lab'],
      required: true,
    },
    rows: {
      type: Number,
      required: true,
    },
    cols: {
      type: Number,
      required: true,
    },
    pcsPerSlot: {
      type: Number,
      default: 4,
    },
    totalPcs: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    accentColor: {
      type: String,
      default: '#a4773a',
    },
    examMode: {
      type: Boolean,
      default: false,
    },
    // Used for EC Lab 101 electronic equipment benches
    tables: [tableEquipmentSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Room', roomSchema);
