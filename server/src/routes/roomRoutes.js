const express = require('express');
const router = express.Router();
const { getRooms, getRoomDetails, seedRooms } = require('../controllers/roomController');

router.get('/', getRooms);
router.get('/:roomId', getRoomDetails);
router.post('/seed', seedRooms);

module.exports = router;
