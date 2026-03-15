import { useState, useEffect } from 'react';
import { Box, Card, Typography, CircularProgress, Grid, Alert, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { api } from 'src/utils/api';
import Chart from 'react-apexcharts';

const StatsCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2.5),
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1.5),
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 12px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
}));

const ChartCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2.5),
  backgroundColor: alpha(theme.palette.background.paper, 1),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1.5),
}));

const AnalyticsDashboard = () => {
  const [health, setHealth] = useState(null);
  const [production, setProduction] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch project health scores
        const healthRes = await api.get('/analytics/projects/health');
        setHealth(healthRes.data);

        // Fetch production summary
        const prodRes = await api.get('/analytics/production/summary');
        setProduction(prodRes.data);

        // Fetch material forecast
        const forecastRes = await api.get('/analytics/materials/forecast');
        setForecast(forecastRes.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('ไม่สามารถโหลดข้อมูล analytics ได้');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  // Prepare production status chart
  const statusLabels = ['Manufactured', 'In Transit', 'Transported', 'Accepted', 'Installed', 'Rejected', 'Planning'];
  const statusCounts = production?.statusCounts
    ? [
        production.statusCounts.manufactured || 0,
        production.statusCounts.in_transit || 0,
        production.statusCounts.transported || 0,
        production.statusCounts.accepted || 0,
        production.statusCounts.installed || 0,
        production.statusCounts.rejected || 0,
        production.statusCounts.planning || 0,
      ]
    : [0, 0, 0, 0, 0, 0, 0];

  const statusChartOptions = {
    chart: { type: 'donut' },
    labels: statusLabels,
    colors: ['#8b5cf6', '#a855f7', '#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#6b7280'],
    legend: { position: 'bottom', fontSize: 11 },
    dataLabels: { enabled: true, formatter: val => `${val.toFixed(0)}%` },
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontSize: '1rem' }}>
        📊 Analytics Overview
      </Typography>

      {/* Top Stats */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <StatsCard>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Total Projects
              </Typography>
              <Typography variant="h5" sx={{ mt: 1 }}>
                {health?.length || 0}
              </Typography>
            </StatsCard>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <StatsCard>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Avg Health Score
              </Typography>
              <Typography variant="h5" sx={{ mt: 1 }}>
                {health && health.length > 0
                  ? (health.reduce((sum, p) => sum + (p.health_score || 0), 0) / health.length).toFixed(0)
                  : 0}
                /100
              </Typography>
            </StatsCard>
          </motion.div>
        </Grid>
      </Grid>

      {/* Production Status Chart */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <ChartCard sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
            Production Status Distribution
          </Typography>
          <Chart type="donut" options={statusChartOptions} series={statusCounts} height={300} />
        </ChartCard>
      </motion.div>

      {/* Top Projects */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <StatsCard>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
            Top 3 Projects by Progress
          </Typography>
          {health
            ?.sort((a, b) => (b.progress_percent || 0) - (a.progress_percent || 0))
            .slice(0, 3)
            .map((project, idx) => (
              <Box key={project.id} sx={{ mb: 1.5, pb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {idx + 1}. {project.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>
                    {project.progress_percent || 0}%
                  </Typography>
                </Box>
                <Box
                  sx={{
                    height: 6,
                    backgroundColor: 'action.disabledBackground',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress_percent || 0}%` }}
                    transition={{ duration: 0.6, delay: 0.1 * idx }}
                    style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #10b981, #3b82f6)',
                      borderRadius: 3,
                    }}
                  />
                </Box>
              </Box>
            ))}
        </StatsCard>
      </motion.div>
    </Box>
  );
};

export default AnalyticsDashboard;
