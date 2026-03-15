const db = require('../config/database');

// Get project cost breakdown
const getProjectCostBreakdown = async (projectId) => {
  const query = `
    SELECT 
      p.id as project_id,
      p.name as project_name,
      COUNT(c.id) as total_components,
      COALESCE(SUM(c.volume), 0) as total_volume,
      COALESCE(SUM(c.weight), 0) as total_weight,
      COALESCE(SUM(c.area), 0) as total_area
    FROM projects p
    LEFT JOIN sections s ON s.project_id = p.id
    LEFT JOIN components c ON c.section_id = s.id
    WHERE p.id = $1
    GROUP BY p.id, p.name
  `;
  const { rows } = await db.query(query, [projectId]);
  return rows[0];
};

// Get cost breakdown by section
const getCostBySection = async (projectId) => {
  const query = `
    SELECT 
      s.id as section_id,
      s.name as section_name,
      COUNT(c.id) as component_count,
      COALESCE(SUM(c.volume), 0) as total_volume,
      COALESCE(SUM(c.weight), 0) as total_weight,
      COALESCE(SUM(c.area), 0) as total_area
    FROM sections s
    LEFT JOIN components c ON c.section_id = s.id
    WHERE s.project_id = $1
    GROUP BY s.id, s.name
    ORDER BY s.name
  `;
  const { rows } = await db.query(query, [projectId]);
  return rows;
};

// Get component status distribution for a project
const getComponentStatusDistribution = async (projectId) => {
  const query = `
    SELECT 
      COALESCE(c.status, 'planning') as status,
      COUNT(c.id) as count
    FROM sections s
    LEFT JOIN components c ON c.section_id = s.id
    WHERE s.project_id = $1
    GROUP BY c.status
    ORDER BY count DESC
  `;
  const { rows } = await db.query(query, [projectId]);
  return rows;
};

// Get production summary (all projects)
const getProductionSummary = async () => {
  const query = `
    SELECT 
      COUNT(*) as total_components,
      COUNT(CASE WHEN status = 'manufactured' THEN 1 END) as manufactured,
      COUNT(CASE WHEN status = 'in_transit' THEN 1 END) as in_transit,
      COUNT(CASE WHEN status = 'transported' THEN 1 END) as transported,
      COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted,
      COUNT(CASE WHEN status = 'installed' THEN 1 END) as installed,
      COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
      COUNT(CASE WHEN status IS NULL OR status = '' THEN 1 END) as planning
    FROM components
  `;
  const { rows } = await db.query(query);
  return rows[0];
};

// Get project health metrics
const getProjectHealthMetrics = async () => {
  const query = `
    SELECT 
      p.id as project_id,
      p.name,
      p.status,
      p.created_at,
      COUNT(DISTINCT s.id) as section_count,
      COUNT(c.id) as total_components,
      COUNT(CASE WHEN c.status = 'installed' THEN 1 END) as installed_components,
      COUNT(CASE WHEN c.status = 'manufactured' THEN 1 END) as manufactured_components,
      COUNT(CASE WHEN c.status = 'rejected' THEN 1 END) as rejected_components,
      COALESCE(SUM(c.volume), 0) as total_volume,
      COALESCE(SUM(CASE WHEN c.status = 'installed' THEN c.volume ELSE 0 END), 0) as completed_volume
    FROM projects p
    LEFT JOIN sections s ON s.project_id = p.id
    LEFT JOIN components c ON c.section_id = s.id
    GROUP BY p.id, p.name, p.status, p.created_at
    ORDER BY p.created_at DESC
  `;
  const { rows } = await db.query(query);
  return rows;
};

// Get material forecast (upcoming components)
const getMaterialForecast = async (daysAhead = 30) => {
  const query = `
    SELECT 
      DATE_TRUNC('week', c.created_at) as week_start,
      COUNT(c.id) as component_count,
      COALESCE(SUM(c.volume), 0) as total_volume,
      COALESCE(SUM(c.weight), 0) as total_weight,
      COALESCE(SUM(c.area), 0) as total_area
    FROM components c
    WHERE c.created_at >= NOW() - INTERVAL '${daysAhead} days'
    GROUP BY DATE_TRUNC('week', c.created_at)
    ORDER BY week_start DESC
    LIMIT 12
  `;
  const { rows } = await db.query(query);
  return rows;
};

// Get component cost comparison by type
const getComponentCostComparison = async () => {
  const query = `
    SELECT 
      COALESCE(c.type, 'Unknown') as component_type,
      COUNT(c.id) as count,
      AVG(c.volume) as avg_volume,
      AVG(c.weight) as avg_weight,
      AVG(c.area) as avg_area,
      COALESCE(SUM(c.volume), 0) as total_volume,
      COALESCE(SUM(c.weight), 0) as total_weight
    FROM components c
    GROUP BY c.type
    ORDER BY count DESC
  `;
  const { rows } = await db.query(query);
  return rows;
};

// Get recent activity for trend analysis
const getRecentActivity = async (projectId, days = 30) => {
  const query = `
    SELECT 
      DATE(csh.updated_at) as activity_date,
      csh.status,
      COUNT(csh.id) as component_count
    FROM component_status_history csh
    JOIN components c ON c.id = csh.component_id
    JOIN sections s ON s.id = c.section_id
    WHERE s.project_id = $1
      AND csh.updated_at >= NOW() - INTERVAL '${days} days'
    GROUP BY DATE(csh.updated_at), csh.status
    ORDER BY activity_date DESC
  `;
  const { rows } = await db.query(query, [projectId]);
  return rows;
};

module.exports = {
  getProjectCostBreakdown,
  getCostBySection,
  getComponentStatusDistribution,
  getProductionSummary,
  getProjectHealthMetrics,
  getMaterialForecast,
  getComponentCostComparison,
  getRecentActivity,
};
