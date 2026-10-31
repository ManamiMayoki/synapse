const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    previousStatus: {
      type: String,
      enum: ['Working', 'Needs Repair', 'Fixed'],
    },
    newStatus: {
      type: String,
      enum: ['Working', 'Needs Repair', 'Fixed'],
    },
    reportedBy: {
      type: String,
      default: 'Anonymous',
    },
    role: {
      type: String,
      default: 'student',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const workstationSchema = new mongoose.Schema(
  {
    pcId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    roomName: {
      type: String,
      required: true,
    },
    slotRow: {
      type: Number,
      required: true,
    },
    slotCol: {
      type: Number,
      required: true,
    },
    slotLabel: {
      type: String,
      default: '',
    },
    pcIndex: {
      type: Number,
      required: true,
    },
    displayId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Working', 'Needs Repair', 'Fixed'],
      default: 'Working',
      index: true,
    },
    // Semester First-Day Seating & Exam Allocation
    allocatedTo: {
      studentId: {
        type: String,
        trim: true,
        default: null,
      },
      batch: {
        type: String,
        trim: true,
        default: null,
      },
      tag: {
        type: String, // Formatted as [Student ID] + [Batch] (e.g. "364-32")
        trim: true,
        default: null,
        index: true,
      },
      studentName: {
        type: String,
        default: null,
      },
      claimedAt: {
        type: Date,
        default: null,
      },
      allocationMode: {
        type: String,
        enum: ['student_claim', 'teacher_manual', 'teacher_random_exam', null],
        default: null,
      },
    },
    // Ticket & descriptive notes history
    notes: [noteSchema],
    specs: {
      cpu: { type: String, default: 'Intel Core i7-14700' },
      gpu: { type: String, default: 'NVIDIA RTX 4070' },
      ram: { type: String, default: '32 GB DDR5' },
      storage: { type: String, default: '1 TB NVMe SSD' },
      os: { type: String, default: 'Ubuntu 24.04 / Windows 11 Dual Boot' },
      ipAddress: { type: String, default: '10.14.20.100' },
    },
  },
  {
    timestamps: true,
  }
);

// Helper method to check if seat is claimed
workstationSchema.methods.isAllocated = function () {
  return !!(this.allocatedTo && this.allocatedTo.tag);
};

module.exports = mongoose.model('Workstation', workstationSchema);
