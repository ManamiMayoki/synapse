const express = require('express');
const router = express.Router();
const {
  updatePcStatus,
  addPcNote,
  getPcTickets,
  getAllTickets,
} = require('../controllers/ticketController');

router.get('/', getAllTickets);
router.get('/pc/:pcId', getPcTickets);
router.post('/pc/:pcId/status', updatePcStatus);
router.post('/pc/:pcId/note', addPcNote);

module.exports = router;
