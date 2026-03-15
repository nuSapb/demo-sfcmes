const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const optionalAuth = require('../middleware/optionalAuth');

// Project Cost Analytics
router.get('/projects/:id/cost', optionalAuth, analyticsController.getProjectCost);
router.get('/projects/:id/cost-by-section', optionalAuth, analyticsController.getProjectCostBySection);
router.get('/projects/:id/activity', optionalAuth, analyticsController.getProjectActivity);

// Production Analytics
router.get('/production/summary', optionalAuth, analyticsController.getProductionSummary);

// Project Health
router.get('/projects/health', optionalAuth, analyticsController.getProjectsHealth);

// Material & Resource Planning
router.get('/materials/forecast', optionalAuth, analyticsController.getMaterialForecast);

// Component Analysis
router.get('/components/cost-comparison', optionalAuth, analyticsController.getComponentCostComparison);

// Pricing Configuration (admin only - add auth middleware as needed)
router.put('/pricing/rates', optionalAuth, analyticsController.updatePricingRates);
router.get('/pricing/rates', optionalAuth, (req, res) => {
  res.json({
    concrete: 15000,
    steel: 35,
    formwork: 800,
    labor: 0.25,
    transport: 1500,
  });
});

module.exports = router;
