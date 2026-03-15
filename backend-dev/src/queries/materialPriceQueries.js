const db = require('../config/database');

// Get all material unit prices
const getAllMaterialPrices = async () => {
  const query = `
    SELECT 
      material_type,
      unit_price,
      unit,
      updated_at,
      updated_by
    FROM material_unit_prices
    ORDER BY material_type
  `;
  const { rows } = await db.query(query);
  return rows;
};

// Get single material price by type
const getMaterialPriceByType = async (materialType) => {
  const query = `
    SELECT 
      material_type,
      unit_price,
      unit,
      updated_at,
      updated_by
    FROM material_unit_prices
    WHERE material_type = $1
  `;
  const { rows } = await db.query(query, [materialType]);
  return rows[0];
};

// Update material unit price
const updateMaterialPrice = async (materialType, unitPrice, updatedBy) => {
  const query = `
    UPDATE material_unit_prices
    SET 
      unit_price = $2,
      updated_at = CURRENT_TIMESTAMP,
      updated_by = $3
    WHERE material_type = $1
    RETURNING material_type, unit_price, unit, updated_at, updated_by
  `;
  const { rows } = await db.query(query, [materialType, unitPrice, updatedBy]);
  return rows[0];
};

// Update multiple material prices at once
const updateMultipleMaterialPrices = async (prices, updatedBy) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    
    const updatedPrices = [];
    for (const [materialType, unitPrice] of Object.entries(prices)) {
      const query = `
        UPDATE material_unit_prices
        SET 
          unit_price = $2,
          updated_at = CURRENT_TIMESTAMP,
          updated_by = $3
        WHERE material_type = $1
        RETURNING material_type, unit_price, unit, updated_at, updated_by
      `;
      const result = await client.query(query, [materialType, unitPrice, updatedBy]);
      if (result.rows.length > 0) {
        updatedPrices.push(result.rows[0]);
      }
    }
    
    await client.query('COMMIT');
    return updatedPrices;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Insert new material price (for admin use)
const createMaterialPrice = async (materialType, unitPrice, unit, updatedBy) => {
  const query = `
    INSERT INTO material_unit_prices (material_type, unit_price, unit, updated_by)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (material_type) 
    DO UPDATE SET 
      unit_price = EXCLUDED.unit_price,
      updated_at = CURRENT_TIMESTAMP,
      updated_by = EXCLUDED.updated_by
    RETURNING material_type, unit_price, unit, updated_at, updated_by
  `;
  const { rows } = await db.query(query, [materialType, unitPrice, unit, updatedBy]);
  return rows[0];
};

// Get prices as simple object format { concrete: 3500, steel: 25000, ... }
const getPricesAsObject = async () => {
  const query = `
    SELECT material_type, unit_price
    FROM material_unit_prices
  `;
  const { rows } = await db.query(query);
  
  const prices = {};
  rows.forEach(row => {
    prices[row.material_type] = parseFloat(row.unit_price);
  });
  return prices;
};

module.exports = {
  getAllMaterialPrices,
  getMaterialPriceByType,
  updateMaterialPrice,
  updateMultipleMaterialPrices,
  createMaterialPrice,
  getPricesAsObject,
};
