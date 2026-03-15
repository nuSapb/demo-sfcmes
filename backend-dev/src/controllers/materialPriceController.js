const materialPriceQueries = require('../queries/materialPriceQueries');

// GET /api/materials/unit-prices
const getUnitPrices = async (req, res) => {
  try {
    const format = req.query.format || 'simple'; // 'simple' or 'detailed'
    
    if (format === 'simple') {
      // Return simple object format: { concrete: 3500, steel: 25000, ... }
      const prices = await materialPriceQueries.getPricesAsObject();
      res.json(prices);
    } else {
      // Return detailed format with metadata
      const prices = await materialPriceQueries.getAllMaterialPrices();
      res.json({
        success: true,
        count: prices.length,
        data: prices,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching material prices',
      error: error.message,
    });
  }
};

// PUT /api/materials/unit-prices
const updateUnitPrices = async (req, res) => {
  try {
    const prices = req.body;
    const updatedBy = req.user?.username || req.user?.email || 'unknown';

    // Validate input
    if (!prices || typeof prices !== 'object' || Object.keys(prices).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request. Expected object with material prices.',
        example: { concrete: 3500, steel: 25000, formwork: 450 },
      });
    }

    // Validate that all values are numbers
    for (const [key, value] of Object.entries(prices)) {
      if (typeof value !== 'number' || isNaN(value)) {
        return res.status(400).json({
          success: false,
          message: `Invalid value for ${key}. Expected number, got ${typeof value}`,
        });
      }
      if (value < 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid value for ${key}. Price cannot be negative.`,
        });
      }
    }

    // Update prices
    const updatedPrices = await materialPriceQueries.updateMultipleMaterialPrices(
      prices,
      updatedBy
    );

    // Get updated prices in simple format
    const simplePrices = await materialPriceQueries.getPricesAsObject();

    res.json({
      success: true,
      message: 'Material prices updated successfully',
      data: simplePrices,
      updated: updatedPrices.map(p => ({
        material_type: p.material_type,
        unit_price: parseFloat(p.unit_price),
        updated_at: p.updated_at,
        updated_by: p.updated_by,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating material prices',
      error: error.message,
    });
  }
};

// GET /api/materials/unit-prices/:type
const getUnitPriceByType = async (req, res) => {
  try {
    const { type } = req.params;
    const price = await materialPriceQueries.getMaterialPriceByType(type);

    if (!price) {
      return res.status(404).json({
        success: false,
        message: `Material type '${type}' not found`,
      });
    }

    res.json({
      success: true,
      data: {
        material_type: price.material_type,
        unit_price: parseFloat(price.unit_price),
        unit: price.unit,
        updated_at: price.updated_at,
        updated_by: price.updated_by,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching material price',
      error: error.message,
    });
  }
};

// PUT /api/materials/unit-prices/:type
const updateUnitPriceByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { unit_price: unitPrice } = req.body;
    const updatedBy = req.user?.username || req.user?.email || 'unknown';

    // Validate input
    if (unitPrice === undefined || unitPrice === null) {
      return res.status(400).json({
        success: false,
        message: 'unit_price is required',
      });
    }

    if (typeof unitPrice !== 'number' || isNaN(unitPrice)) {
      return res.status(400).json({
        success: false,
        message: 'unit_price must be a valid number',
      });
    }

    if (unitPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'unit_price cannot be negative',
      });
    }

    const updated = await materialPriceQueries.updateMaterialPrice(
      type,
      unitPrice,
      updatedBy
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Material type '${type}' not found`,
      });
    }

    res.json({
      success: true,
      message: 'Material price updated successfully',
      data: {
        material_type: updated.material_type,
        unit_price: parseFloat(updated.unit_price),
        unit: updated.unit,
        updated_at: updated.updated_at,
        updated_by: updated.updated_by,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating material price',
      error: error.message,
    });
  }
};

module.exports = {
  getUnitPrices,
  updateUnitPrices,
  getUnitPriceByType,
  updateUnitPriceByType,
};
