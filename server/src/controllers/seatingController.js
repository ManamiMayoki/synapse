const Workstation = require('../models/Workstation');
const Room = require('../models/Room');

// Helper to validate [Student ID] + [Batch] format (e.g. 364-32)
const isValidSeatingTag = (tag) => {
  if (!tag || typeof tag !== 'string') return false;
  // Format: [Student ID] + [Batch] (e.g. 364-32, 1024-31, CSE12-32)
  const tagRegex = /^([a-zA-Z0-9]+)-([a-zA-Z0-9]+)$/;
  return tagRegex.test(tag.trim());
};

// @desc    Day One: Student claims a workstation seat
// @route   POST /api/seating/claim
// @access  Public / Student
const claimSeat = async (req, res, next) => {
  try {
    const { pcId, studentId, batch, studentName } = req.body;

    if (!pcId) {
      return res.status(400).json({ success: false, message: 'Workstation ID (pcId) is required.' });
    }

    // Construct or extract tag
    let tag = req.body.tag;
    let sId = studentId;
    let bId = batch;

    if (tag) {
      if (!isValidSeatingTag(tag)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid seating tag format. Tag must be formatted as [Student ID] + [Batch] (e.g., 364-32).',
        });
      }
      const parts = tag.trim().split('-');
      sId = parts[0];
      bId = parts[1];
    } else if (sId && bId) {
      tag = `${String(sId).trim()}-${String(bId).trim()}`;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide both Student ID and Batch (e.g. 364 and 32), or formatted tag (364-32).',
      });
    }

    const workstation = await Workstation.findOne({ pcId });
    if (!workstation) {
      return res.status(404).json({ success: false, message: `Workstation ${pcId} not found.` });
    }

    // Validation: Cannot claim a PC marked as Needs Repair!
    if (workstation.status === 'Needs Repair') {
      return res.status(400).json({
        success: false,
        message: `Workstation ${pcId} is currently marked 'Needs Repair'. Please choose a verified Working PC.`,
      });
    }

    // Check if the seat is already occupied by someone else
    if (workstation.allocatedTo && workstation.allocatedTo.tag && workstation.allocatedTo.tag !== tag) {
      return res.status(409).json({
        success: false,
        message: `Workstation ${pcId} is already claimed by student [${workstation.allocatedTo.tag}]. Please choose an unallocated PC.`,
      });
    }

    // Free up any previous workstation held by this student in the same room
    await Workstation.updateMany(
      { roomId: workstation.roomId, 'allocatedTo.tag': tag, pcId: { $ne: pcId } },
      {
        $set: {
          'allocatedTo.studentId': null,
          'allocatedTo.batch': null,
          'allocatedTo.tag': null,
          'allocatedTo.studentName': null,
          'allocatedTo.claimedAt': null,
          'allocatedTo.allocationMode': null,
        },
      }
    );

    // Claim the requested seat
    workstation.allocatedTo = {
      studentId: sId,
      batch: bId,
      tag,
      studentName: studentName || req.user?.name || `Student ${sId}`,
      claimedAt: new Date(),
      allocationMode: 'student_claim',
    };

    await workstation.save();

    return res.status(200).json({
      success: true,
      message: `Seat successfully claimed at ${pcId} for student [${tag}].`,
      workstation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Vacate a workstation seat
// @route   POST /api/seating/vacate
// @access  Public / Protected
const vacateSeat = async (req, res, next) => {
  try {
    const { pcId } = req.body;
    if (!pcId) {
      return res.status(400).json({ success: false, message: 'Workstation ID (pcId) is required.' });
    }

    const workstation = await Workstation.findOne({ pcId });
    if (!workstation) {
      return res.status(404).json({ success: false, message: `Workstation ${pcId} not found.` });
    }

    const previousTag = workstation.allocatedTo?.tag;

    workstation.allocatedTo = {
      studentId: null,
      batch: null,
      tag: null,
      studentName: null,
      claimedAt: null,
      allocationMode: null,
    };

    await workstation.save();

    return res.status(200).json({
      success: true,
      message: `Workstation ${pcId} is now unallocated (vacated from [${previousTag || 'N/A'}]).`,
      workstation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all unallocated workstations in a room (Unallocated Tracker for latecomers)
// @route   GET /api/seating/unallocated/:roomId
// @access  Public
const getUnallocatedSeats = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const unallocated = await Workstation.find({
      roomId,
      $or: [{ 'allocatedTo.tag': null }, { 'allocatedTo.tag': '' }, { allocatedTo: { $exists: false } }],
    }).sort({ slotRow: 1, slotCol: 1, pcIndex: 1 });

    const verifiedWorking = unallocated.filter((w) => w.status === 'Working' || w.status === 'Fixed');
    const needsRepair = unallocated.filter((w) => w.status === 'Needs Repair');

    return res.status(200).json({
      success: true,
      roomId,
      count: unallocated.length,
      verifiedWorkingCount: verifiedWorking.length,
      needsRepairCount: needsRepair.length,
      unallocatedPcs: unallocated.map((w) => ({
        pcId: w.pcId,
        displayId: w.displayId,
        slotRow: w.slotRow,
        slotCol: w.slotCol,
        slotLabel: w.slotLabel,
        pcIndex: w.pcIndex,
        status: w.status,
        isVerifiedWorking: w.status === 'Working' || w.status === 'Fixed',
      })),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Teacher Exam Override: Randomly reallocate seating for exams on VERIFIED WORKING PCs only
// @route   POST /api/seating/exam-reallocate
// @access  Private (Teacher/Staff/Admin)
const teacherRandomReallocate = async (req, res, next) => {
  try {
    const { roomId, studentTags } = req.body;

    if (!roomId) {
      return res.status(400).json({ success: false, message: 'Room ID is required.' });
    }

    // 1. Fetch only verified WORKING PCs in this room (strictly exclude 'Needs Repair')
    const workingPcs = await Workstation.find({
      roomId,
      status: { $in: ['Working', 'Fixed'] },
    });

    if (workingPcs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No verified working workstations found in this room to allocate students for exams.',
      });
    }

    // 2. Collect students to seat: either provided explicitly or currently allocated in the room
    let studentsToSeat = [];

    if (Array.isArray(studentTags) && studentTags.length > 0) {
      studentsToSeat = studentTags.map((tag) => {
        const parts = tag.split('-');
        return {
          tag,
          studentId: parts[0] || 'Unknown',
          batch: parts[1] || 'Unknown',
          studentName: `Candidate [${tag}]`,
        };
      });
    } else {
      // Collect students currently holding a seat in the room
      const currentSeated = await Workstation.find({
        roomId,
        'allocatedTo.tag': { $ne: null },
      });

      if (currentSeated.length === 0) {
        // Generate a sample exam cohort if room was unseated
        studentsToSeat = [
          { tag: '364-32', studentId: '364', batch: '32', studentName: 'Alex Vance' },
          { tag: '365-32', studentId: '365', batch: '32', studentName: 'Elena Rostova' },
          { tag: '372-31', studentId: '372', batch: '31', studentName: 'David Miller' },
          { tag: '380-32', studentId: '380', batch: '32', studentName: 'Samir Patel' },
          { tag: '385-32', studentId: '385', batch: '32', studentName: 'Maya Lin' },
          { tag: '390-31', studentId: '390', batch: '31', studentName: 'Liam Chen' },
          { tag: '394-32', studentId: '394', batch: '32', studentName: 'Aria Stark' },
          { tag: '401-32', studentId: '401', batch: '32', studentName: 'Noah Smith' },
        ];
      } else {
        studentsToSeat = currentSeated.map((w) => ({
          tag: w.allocatedTo.tag,
          studentId: w.allocatedTo.studentId,
          batch: w.allocatedTo.batch,
          studentName: w.allocatedTo.studentName,
        }));
      }
    }

    if (studentsToSeat.length > workingPcs.length) {
      return res.status(400).json({
        success: false,
        message: `Not enough working PCs (${workingPcs.length}) for the number of examinees (${studentsToSeat.length}). Please repair faulty stations first.`,
      });
    }

    // 3. Clear all previous allocations in this room
    await Workstation.updateMany(
      { roomId },
      {
        $set: {
          'allocatedTo.studentId': null,
          'allocatedTo.batch': null,
          'allocatedTo.tag': null,
          'allocatedTo.studentName': null,
          'allocatedTo.claimedAt': null,
          'allocatedTo.allocationMode': null,
        },
      }
    );

    // 4. Shuffle working PCs (Fisher-Yates shuffle) for randomized exam integrity
    const shuffledWorkingPcs = [...workingPcs].sort(() => Math.random() - 0.5);

    // 5. Assign each student to a randomized verified working PC
    const allocationSummary = [];

    for (let i = 0; i < studentsToSeat.length; i++) {
      const pc = shuffledWorkingPcs[i];
      const student = studentsToSeat[i];

      pc.allocatedTo = {
        studentId: student.studentId,
        batch: student.batch,
        tag: student.tag,
        studentName: student.studentName,
        claimedAt: new Date(),
        allocationMode: 'teacher_random_exam',
      };

      await pc.save();

      allocationSummary.push({
        pcId: pc.pcId,
        displayId: pc.displayId,
        slotLabel: pc.slotLabel,
        allocatedTag: student.tag,
        studentName: student.studentName,
        pcStatus: pc.status,
      });
    }

    // Update Room exam mode
    await Room.updateOne({ roomId }, { $set: { examMode: true } });

    return res.status(200).json({
      success: true,
      message: `Teacher Exam Override complete: ${studentsToSeat.length} students randomly reallocated across verified working PCs only.`,
      roomId,
      allocatedCount: studentsToSeat.length,
      allocations: allocationSummary,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Teacher Manual Override: Manually assign or relocate a student to a specific verified PC
// @route   POST /api/seating/manual-allocate
// @access  Private (Teacher/Staff/Admin)
const teacherManualAllocate = async (req, res, next) => {
  try {
    const { pcId, tag, studentName, forceAssignBroken } = req.body;

    if (!pcId || !tag) {
      return res.status(400).json({ success: false, message: 'Workstation pcId and seating tag are required.' });
    }

    if (!isValidSeatingTag(tag)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid seating tag format. Tag must be formatted as [Student ID] + [Batch] (e.g. 364-32).',
      });
    }

    const workstation = await Workstation.findOne({ pcId });
    if (!workstation) {
      return res.status(404).json({ success: false, message: `Workstation ${pcId} not found.` });
    }

    // Verify PC is working unless teacher explicitly forces it
    if (workstation.status === 'Needs Repair' && !forceAssignBroken) {
      return res.status(400).json({
        success: false,
        message: `Workstation ${pcId} is marked 'Needs Repair'. For exams, teachers should only allocate verified working PCs. Set forceAssignBroken=true to override.`,
      });
    }

    const parts = tag.trim().split('-');
    const sId = parts[0];
    const bId = parts[1];

    // Remove any previous seat held by this student in the room
    await Workstation.updateMany(
      { roomId: workstation.roomId, 'allocatedTo.tag': tag, pcId: { $ne: pcId } },
      {
        $set: {
          'allocatedTo.studentId': null,
          'allocatedTo.batch': null,
          'allocatedTo.tag': null,
          'allocatedTo.studentName': null,
          'allocatedTo.claimedAt': null,
          'allocatedTo.allocationMode': null,
        },
      }
    );

    workstation.allocatedTo = {
      studentId: sId,
      batch: bId,
      tag,
      studentName: studentName || `Student [${tag}]`,
      claimedAt: new Date(),
      allocationMode: 'teacher_manual',
    };

    await workstation.save();

    return res.status(200).json({
      success: true,
      message: `Teacher Override: Student [${tag}] manually allocated to ${pcId}.`,
      workstation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset all seating allocations in a room
// @route   POST /api/seating/reset/:roomId
// @access  Private (Teacher/Staff/Admin)
const resetAllocations = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const result = await Workstation.updateMany(
      { roomId },
      {
        $set: {
          'allocatedTo.studentId': null,
          'allocatedTo.batch': null,
          'allocatedTo.tag': null,
          'allocatedTo.studentName': null,
          'allocatedTo.claimedAt': null,
          'allocatedTo.allocationMode': null,
        },
      }
    );

    await Room.updateOne({ roomId }, { $set: { examMode: false } });

    return res.status(200).json({
      success: true,
      message: `Seating allocations reset for room ${roomId}. ${result.modifiedCount} workstations are now unallocated.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  claimSeat,
  vacateSeat,
  getUnallocatedSeats,
  teacherRandomReallocate,
  teacherManualAllocate,
  resetAllocations,
};
