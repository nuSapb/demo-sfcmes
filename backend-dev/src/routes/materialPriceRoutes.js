const express = require('express');
const router = express.Router();
const materialPriceController = require('../controllers/materialPriceController');
const optionalAuth = require('../middleware/optionalAuth');

// GET /api/materials/unit-prices
router.get('/unit-prices', optionalAuth, materialPriceController.getUnitPrices);

// GET /api/materials/unit-prices/:type
router.get('/unit-prices/:type', optionalAuth, materialPriceController.getUnitPriceByType);

// PUT /api/materials/unit-prices (update multiple)
router.put('/unit-prices', optionalAuth, materialPriceController.updateUnitPrices);

// PUT /api/materials/unit-prices/:type (update single)
router.put('/unit-prices/:type', optionalAuth, materialPriceController.updateUnitPriceByType);

module.exports = router;
