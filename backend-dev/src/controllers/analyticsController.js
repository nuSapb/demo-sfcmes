const analyticsQueries = require('../queries/analyticsQueries');
const projectQueries = require('../queries/projectQueries');

// Default pricing rates (should come from config or database)
const PRICING_RATES = {
  concrete: 15000, // บาท per m³
  steel: 35,       // บาท per kg
  formwork: 800,   // บาท per m²
  labor: 0.25,     // 25% of material cost
  transport: 1500, // บาท per component (avg)
};

// Helper: Calculate component cost
const calculateComponentCost = (volume, weight, area) => {
  const concreteCost = (volume || 0) * PRICING_RATES.concrete;
  const steelCost = (weight || 0) * PRICING_RATES.steel;
  const formworkCost = (area || 0) * PRICING_RATES.formwork;
  const materialCost = concreteCost + steelCost + formworkCost;
  const laborCost = materialCost * PRICING_RATES.labor;
  
  return {
    concrete: Math.round(concreteCost),
    steel: Math.round(steelCost),
    formwork: Math.round(formworkCost),
    labor: Math.round(laborCost),
    material: Math.round(materialCost),
    total: Math.round(materialCost + laborCost),
  };
};

// GET /api/analytics/projects/:id/cost
const getProjectCost = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get project data
    const projectData = await analyticsQueries.getProjectCostBreakdown(id);
    if (!projectData || !projectData.project_id) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Calculate costs
    const costs = calculateComponentCost(
      projectData.total_volume,
      projectData.total_weight,
      projectData.total_area
    );

    // Add transportation cost
    const transportCost = (projectData.total_components || 0) * PRICING_RATES.transport;
    const totalCost = costs.total + transportCost;

    // Calculate breakdown percentages
    const breakdown = {
      concrete: { 
        amount: costs.concrete, 
        percentage: Math.round((costs.concrete / totalCost) * 100 * 100) / 100 
      },
      steel: { 
        amount: costs.steel, 
        percentage: Math.round((costs.steel / totalCost) * 100 * 100) / 100 
      },
      formwork: { 
        amount: costs.formwork, 
        percentage: Math.round((costs.formwork / totalCost) * 100 * 100) / 100 
      },
      labor: { 
        amount: costs.labor, 
        percentage: Math.round((costs.labor / totalCost) * 100 * 100) / 100 
      },
      transport: { 
        amount: transportCost, 
        percentage: Math.round((transportCost / totalCost) * 100 * 100) / 100 
      },
    };

    // Calculate unit costs
    const totalComponents = parseInt(projectData.total_components) || 1;
    const totalVolume = parseFloat(projectData.total_volume) || 1;
    const totalWeight = parseFloat(projectData.total_weight) || 1;

    const response = {
      projectId: projectData.project_id,
      projectName: projectData.project_name,
      summary: {
        totalComponents: parseInt(projectData.total_components) || 0,
        totalVolume: Math.round((parseFloat(projectData.total_volume) || 0) * 100) / 100,
        totalWeight: Math.round((parseFloat(projectData.total_weight) || 0) * 100) / 100,
        totalArea: Math.round((parseFloat(projectData.total_area) || 0) * 100) / 100,
        totalCost: totalCost,
      },
      costBreakdown: breakdown,
      unitCosts: {
        perComponent: Math.round(totalCost / totalComponents),
        perM3: Math.round(totalCost / totalVolume),
        perKg: Math.round((totalCost / totalWeight) * 100) / 100,
        perM2: Math.round((totalCost / (parseFloat(projectData.total_area) || 1)) * 100) / 100,
      },
      pricingRates: PRICING_RATES,
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Error calculating project cost', error: error.message });
  }
};

// GET /api/analytics/projects/:id/cost-by-section
const getProjectCostBySection = async (req, res) => {
  try {
    const { id } = req.params;
    
    const sections = await analyticsQueries.getCostBySection(id);
    
    const sectionsWithCost = sections.map(section => {
      const costs = calculateComponentCost(
        section.total_volume,
        section.total_weight,
        section.total_area
      );
      const transportCost = (section.component_count || 0) * PRICING_RATES.transport;
      
      return {
        sectionId: section.section_id,
        sectionName: section.section_name,
        componentCount: parseInt(section.component_count) || 0,
        totalVolume: Math.round((parseFloat(section.total_volume) || 0) * 100) / 100,
        totalWeight: Math.round((parseFloat(section.total_weight) || 0) * 100) / 100,
        totalArea: Math.round((parseFloat(section.total_area) || 0) * 100) / 100,
        costs: {
          concrete: costs.concrete,
          steel: costs.steel,
          formwork: costs.formwork,
          labor: costs.labor,
          transport: transportCost,
          total: costs.total + transportCost,
        },
      };
    });

    res.json({
      projectId: id,
      sections: sectionsWithCost,
      totalSections: sectionsWithCost.length,
      grandTotal: sectionsWithCost.reduce((sum, s) => sum + s.costs.total, 0),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating section costs', error: error.message });
  }
};

// GET /api/analytics/production/summary
const getProductionSummary = async (req, res) => {
  try {
    const summary = await analyticsQueries.getProductionSummary();
    const total = parseInt(summary.total_components) || 1;

    const statusDistribution = {
      manufactured: { count: parseInt(summary.manufactured) || 0, percentage: Math.round(((parseInt(summary.manufactured) || 0) / total) * 100 * 100) / 100 },
      inTransit: { count: parseInt(summary.in_transit) || 0, percentage: Math.round(((parseInt(summary.in_transit) || 0) / total) * 100 * 100) / 100 },
      transported: { count: parseInt(summary.transported) || 0, percentage: Math.round(((parseInt(summary.transported) || 0) / total) * 100 * 100) / 100 },
      accepted: { count: parseInt(summary.accepted) || 0, percentage: Math.round(((parseInt(summary.accepted) || 0) / total) * 100 * 100) / 100 },
      installed: { count: parseInt(summary.installed) || 0, percentage: Math.round(((parseInt(summary.installed) || 0) / total) * 100 * 100) / 100 },
      rejected: { count: parseInt(summary.rejected) || 0, percentage: Math.round(((parseInt(summary.rejected) || 0) / total) * 100 * 100) / 100 },
      planning: { count: parseInt(summary.planning) || 0, percentage: Math.round(((parseInt(summary.planning) || 0) / total) * 100 * 100) / 100 },
    };

    const completionRate = Math.round(((parseInt(summary.installed) || 0) / total) * 100 * 100) / 100;
    const rejectionRate = Math.round(((parseInt(summary.rejected) || 0) / total) * 100 * 100) / 100;

    // Estimate production times (mock data - should be calculated from status history)
    const avgProductionTime = {
      planningToManufactured: 5.2,
      manufacturedToInstalled: 4.1,
      totalCycle: 9.3,
    };

    // Calculate daily throughput (mock - based on recent activity)
    const dailyThroughput = {
      current: 12,
      target: 15,
      efficiency: 80,
    };

    res.json({
      summary: {
        totalComponents: parseInt(summary.total_components) || 0,
        completionRate: completionRate,
        rejectionRate: rejectionRate,
      },
      statusDistribution,
      avgProductionTime,
      dailyThroughput,
      quality: {
        rejectionRate: rejectionRate,
        passRate: 100 - rejectionRate,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching production summary', error: error.message });
  }
};

// GET /api/analytics/projects/health
const getProjectsHealth = async (req, res) => {
  try {
    const projects = await analyticsQueries.getProjectHealthMetrics();
    
    const projectsWithHealth = projects.map(project => {
      const total = parseInt(project.total_components) || 1;
      const installed = parseInt(project.installed_components) || 0;
      const manufactured = parseInt(project.manufactured_components) || 0;
      const rejected = parseInt(project.rejected_components) || 0;
      
      const progress = Math.round((installed / total) * 100 * 100) / 100;
      
      // Calculate health score (0-100)
      // Based on: progress (40%), on-schedule (30%), quality (30%)
      const qualityScore = Math.max(0, 100 - (rejected / total) * 100);
      const progressScore = progress;
      const healthScore = Math.round((progressScore * 0.5 + qualityScore * 0.5) * 100) / 100;
      
      // Determine risk level
      let riskLevel = 'low';
      if (healthScore < 50) riskLevel = 'high';
      else if (healthScore < 75) riskLevel = 'medium';
      
      // Determine status
      let statusLabel = 'on_track';
      if (riskLevel === 'high') statusLabel = 'delayed';
      else if (riskLevel === 'medium') statusLabel = 'at_risk';
      if (progress >= 100) statusLabel = 'completed';

      return {
        projectId: project.project_id,
        name: project.name,
        status: project.status,
        progress: progress,
        healthScore: healthScore,
        riskLevel: riskLevel,
        statusLabel: statusLabel,
        sections: parseInt(project.section_count) || 0,
        components: {
          total: parseInt(project.total_components) || 0,
          installed: installed,
          manufactured: manufactured,
          rejected: rejected,
          pending: (parseInt(project.total_components) || 0) - installed,
        },
        volume: {
          total: Math.round((parseFloat(project.total_volume) || 0) * 100) / 100,
          completed: Math.round((parseFloat(project.completed_volume) || 0) * 100) / 100,
        },
        createdAt: project.created_at,
      };
    });

    res.json(projectsWithHealth);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project health', error: error.message });
  }
};

// GET /api/analytics/materials/forecast
const getMaterialForecast = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const forecast = await analyticsQueries.getMaterialForecast(days);

    // Calculate material requirements
    const forecastWithMaterials = forecast.map(week => {
      const volume = parseFloat(week.total_volume) || 0;
      const weight = parseFloat(week.total_weight) || 0;
      const area = parseFloat(week.total_area) || 0;
      
      return {
        weekStart: week.week_start,
        componentCount: parseInt(week.component_count) || 0,
        materials: {
          concrete: {
            volume: Math.round(volume * 100) / 100,
            cost: Math.round(volume * PRICING_RATES.concrete),
          },
          steel: {
            weight: Math.round(weight * 100) / 100,
            cost: Math.round(weight * PRICING_RATES.steel),
          },
          formwork: {
            area: Math.round(area * 100) / 100,
            cost: Math.round(area * PRICING_RATES.formwork),
          },
        },
        estimatedLaborCost: Math.round((volume * PRICING_RATES.concrete + weight * PRICING_RATES.steel + area * PRICING_RATES.formwork) * PRICING_RATES.labor),
      };
    });

    // Calculate totals
    const totals = forecastWithMaterials.reduce((acc, week) => ({
      concreteVolume: acc.concreteVolume + week.materials.concrete.volume,
      steelWeight: acc.steelWeight + week.materials.steel.weight,
      formworkArea: acc.formworkArea + week.materials.formwork.area,
      totalCost: acc.totalCost + week.materials.concrete.cost + week.materials.steel.cost + week.materials.formwork.cost + week.estimatedLaborCost,
    }), { concreteVolume: 0, steelWeight: 0, formworkArea: 0, totalCost: 0 });

    res.json({
      forecastPeriod: `${days} days`,
      weeklyForecast: forecastWithMaterials,
      totals: {
        concreteVolume: Math.round(totals.concreteVolume * 100) / 100,
        steelWeight: Math.round(totals.steelWeight * 100) / 100,
        formworkArea: Math.round(totals.formworkArea * 100) / 100,
        totalCost: totals.totalCost,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching material forecast', error: error.message });
  }
};

// GET /api/analytics/components/cost-comparison
const getComponentCostComparison = async (req, res) => {
  try {
    const types = await analyticsQueries.getComponentCostComparison();

    const comparison = types.map(type => {
      const volume = parseFloat(type.avg_volume) || 0;
      const weight = parseFloat(type.avg_weight) || 0;
      const area = parseFloat(type.avg_area) || 0;
      const costs = calculateComponentCost(volume, weight, area);
      
      return {
        componentType: type.component_type,
        count: parseInt(type.count) || 0,
        averages: {
          volume: Math.round(volume * 100) / 100,
          weight: Math.round(weight * 100) / 100,
          area: Math.round(area * 100) / 100,
        },
        costs: {
          concrete: costs.concrete,
          steel: costs.steel,
          formwork: costs.formwork,
          labor: costs.labor,
          totalPerUnit: costs.total,
        },
        totals: {
          volume: Math.round((parseFloat(type.total_volume) || 0) * 100) / 100,
          weight: Math.round((parseFloat(type.total_weight) || 0) * 100) / 100,
          estimatedCost: Math.round((parseInt(type.count) || 0) * costs.total),
        },
      };
    });

    // Sort by total cost descending
    comparison.sort((a, b) => b.totals.estimatedCost - a.totals.estimatedCost);

    res.json({
      componentTypes: comparison,
      summary: {
        totalTypes: comparison.length,
        grandTotalCost: comparison.reduce((sum, c) => sum + c.totals.estimatedCost, 0),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error comparing component costs', error: error.message });
  }
};

// GET /api/analytics/projects/:id/activity
const getProjectActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const days = parseInt(req.query.days) || 30;
    
    const activity = await analyticsQueries.getRecentActivity(id, days);

    // Group by date for timeline
    const timeline = activity.reduce((acc, item) => {
      const date = item.activity_date;
      if (!acc[date]) {
        acc[date] = { date, statuses: {} };
      }
      acc[date].statuses[item.status] = parseInt(item.component_count);
      return acc;
    }, {});

    res.json({
      projectId: id,
      period: `${days} days`,
      activity: Object.values(timeline),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project activity', error: error.message });
  }
};

// Update pricing rates (admin only)
const updatePricingRates = async (req, res) => {
  try {
    const { concrete, steel, formwork, labor, transport } = req.body;
    
    if (concrete) PRICING_RATES.concrete = concrete;
    if (steel) PRICING_RATES.steel = steel;
    if (formwork) PRICING_RATES.formwork = formwork;
    if (labor) PRICING_RATES.labor = labor;
    if (transport) PRICING_RATES.transport = transport;

    res.json({
      message: 'Pricing rates updated successfully',
      rates: PRICING_RATES,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating pricing rates', error: error.message });
  }
};

module.exports = {
  getProjectCost,
  getProjectCostBySection,
  getProductionSummary,
  getProjectsHealth,
  getMaterialForecast,
  getComponentCostComparison,
  getProjectActivity,
  updatePricingRates,
};
