const Workstation = require('../models/Workstation');

// @desc    Update PC status (Working / Needs Repair / Fixed) with optional descriptive note
// @route   POST /api/tickets/pc/:pcId/status
// @access  Public / Protected
const updatePcStatus = async (req, res, next) => {
  try {
    const { pcId } = req.params;
    const { status, title, description, reportedBy, role } = req.body;

    const validStatuses = ['Working', 'Needs Repair', 'Fixed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const workstation = await Workstation.findOne({ pcId });
    if (!workstation) {
      return res.status(404).json({ success: false, message: `Workstation ${pcId} not found.` });
    }

    const previousStatus = workstation.status;
    workstation.status = status;

    // If student/staff leaves a note along with status update
    if (description && description.trim()) {
      workstation.notes.unshift({
        title: title ? title.trim() : `Status changed to ${status}`,
        description: description.trim(),
        previousStatus,
        newStatus: status,
        reportedBy: reportedBy || req.user?.name || 'Anonymous Member',
        role: role || req.user?.role || 'student',
        createdAt: new Date(),
      });
    }

    // If status became "Needs Repair", and the seat was claimed, warn or notify
    let seatingNotice = null;
    if (status === 'Needs Repair' && workstation.allocatedTo?.tag) {
      seatingNotice = `Warning: Workstation ${pcId} is claimed by [${workstation.allocatedTo.tag}]. For exams, student will need reallocation to a verified working PC.`;
    }

    await workstation.save();

    return res.status(200).json({
      success: true,
      message: `Workstation ${pcId} status updated from '${previousStatus}' to '${status}'.`,
      seatingNotice,
      workstation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a custom descriptive note explaining exact problem or fix
// @route   POST /api/tickets/pc/:pcId/note
// @access  Public / Protected
const addPcNote = async (req, res, next) => {
  try {
    const { pcId } = req.params;
    const { title, description, newStatus, reportedBy, role } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A descriptive note explaining the exact problem or fix is required.',
      });
    }

    const workstation = await Workstation.findOne({ pcId });
    if (!workstation) {
      return res.status(404).json({ success: false, message: `Workstation ${pcId} not found.` });
    }

    const previousStatus = workstation.status;
    if (newStatus && ['Working', 'Needs Repair', 'Fixed'].includes(newStatus)) {
      workstation.status = newStatus;
    }

    const note = {
      title: title ? title.trim() : (newStatus ? `Status updated to ${newStatus}` : 'Hardware Maintenance Note'),
      description: description.trim(),
      previousStatus,
      newStatus: newStatus || previousStatus,
      reportedBy: reportedBy || req.user?.name || 'Academic Lab User',
      role: role || req.user?.role || 'student',
      createdAt: new Date(),
    };

    workstation.notes.unshift(note);
    await workstation.save();

    return res.status(201).json({
      success: true,
      message: `Descriptive note successfully logged for workstation ${pcId}.`,
      note,
      currentStatus: workstation.status,
      workstation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ticket & notes history for a specific PC
// @route   GET /api/tickets/pc/:pcId
// @access  Public
const getPcTickets = async (req, res, next) => {
  try {
    const { pcId } = req.params;
    const workstation = await Workstation.findOne({ pcId });

    if (!workstation) {
      return res.status(404).json({ success: false, message: `Workstation ${pcId} not found.` });
    }

    return res.status(200).json({
      success: true,
      pcId: workstation.pcId,
      status: workstation.status,
      allocatedTo: workstation.allocatedTo,
      count: workstation.notes.length,
      notes: workstation.notes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active tickets across all rooms
// @route   GET /api/tickets
// @access  Public
const getAllTickets = async (req, res, next) => {
  try {
    const { status, roomId } = req.query;

    const query = {};
    if (roomId) query.roomId = roomId;
    if (status) query.status = status;

    // Find workstations with notes or non-working status
    const workstations = await Workstation.find({
      ...query,
      $or: [{ status: 'Needs Repair' }, { 'notes.0': { $exists: true } }],
    }).sort({ updatedAt: -1 });

    const allTickets = [];
    workstations.forEach((ws) => {
      ws.notes.forEach((note) => {
        allTickets.push({
          id: note._id,
          pcId: ws.pcId,
          displayId: ws.displayId,
          roomId: ws.roomId,
          roomName: ws.roomName,
          slotLabel: ws.slotLabel,
          currentStatus: ws.status,
          title: note.title,
          description: note.description,
          previousStatus: note.previousStatus,
          newStatus: note.newStatus,
          reportedBy: note.reportedBy,
          role: note.role,
          createdAt: note.createdAt,
        });
      });
    });

    return res.status(200).json({
      success: true,
      count: allTickets.length,
      tickets: allTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updatePcStatus,
  addPcNote,
  getPcTickets,
  getAllTickets,
};
