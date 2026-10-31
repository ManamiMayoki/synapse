const express = require('express');
const router = express.Router();
const {
  getInventory,
  getEcLabEquipment,
  addInventoryItem,
  updateTableEquipment,
} = require('../controllers/inventoryController');

router.get('/', getInventory);
router.get('/ec-lab', getEcLabEquipment);
router.post('/', addInventoryItem);
router.put('/ec-lab/table/:tableId', updateTableEquipment);

module.exports = router;
