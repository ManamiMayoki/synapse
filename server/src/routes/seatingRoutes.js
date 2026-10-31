const express = require('express');
const router = express.Router();
const {
  claimSeat,
  vacateSeat,
  getUnallocatedSeats,
  teacherRandomReallocate,
  teacherManualAllocate,
  resetAllocations,
} = require('../controllers/seatingController');

// Student Seating Claim & Vacate
router.post('/claim', claimSeat);
router.post('/vacate', vacateSeat);

// Unallocated Tracker for day-one latecomers
router.get('/unallocated/:roomId', getUnallocatedSeats);

// Teacher Exam Override Endpoints (for teachers, staff, and admin)
router.post('/exam-reallocate', teacherRandomReallocate);
router.post('/manual-allocate', teacherManualAllocate);
router.post('/reset/:roomId', resetAllocations);

module.exports = router;
