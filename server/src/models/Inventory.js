const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    itemId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'Breadboards',
        'Resistors',
        'Voltage Meters',
        'Ammeters',
        'Multimeters',
        'Oscilloscopes',
        'Microcontrollers',
        'General',
      ],
      default: 'General',
      index: true,
    },
    totalQty: {
      type: Number,
      required: true,
      default: 10,
    },
    availableQty: {
      type: Number,
      required: true,
      default: 10,
    },
    location: {
      type: String,
      default: 'EC Lab (Lab 101 - 1st Floor)',
    },
    benchId: {
      type: String,
      default: null, // Assigned to Table-01..Table-08
    },
    specs: {
      type: String,
      default: '',
    },
    condition: {
      type: String,
      enum: ['New', 'Excellent', 'Calibrated', 'Good', 'Fair', 'Needs Inspection'],
      default: 'Good',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Inventory', inventorySchema);
