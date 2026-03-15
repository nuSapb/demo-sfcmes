import { Box, Typography, Divider, Card, CardContent } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardCard from 'src/components/shared/DashboardCard';

const FormulaDisplay = () => {
  const theme = useTheme();

  const formulaBoxStyle = {
    p: 2,
    backgroundColor:
      theme.palette.mode === 'dark'
        ? 'rgba(255,255,255,0.05)'
        : 'rgba(0,0,0,0.02)',
    borderRadius: 1,
    mb: 2,
  };

  const formulaCodeStyle = {
    fontFamily: 'monospace',
    backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#f5f5f5',
    p: 1.5,
    borderRadius: 0.5,
    fontSize: '0.85rem',
    overflow: 'auto',
    border: `1px solid ${theme.palette.divider}`,
  };

  return (
    <DashboardCard
      title="Calculation Formulas"
      subtitle="How we calculate material quantities and costs"
    >
      <Box sx={{ p: 2 }}>
        {/* Concrete */}
        <Box sx={formulaBoxStyle}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
            Concrete (คอนกรีต)
          </Typography>
          <Typography variant="body2" sx={formulaCodeStyle}>
            Total Volume (m³) = Σ(Component Volume)
          </Typography>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            Sum of all component volumes from selected projects
          </Typography>
        </Box>

        {/* Steel */}
        <Box sx={formulaBoxStyle}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
            Steel/Rebar (เหล็กเสริม)
          </Typography>
          <Typography variant="body2" sx={formulaCodeStyle}>
            Total Weight (tons) = Σ(Component Weight)
          </Typography>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            Sum of all component weights from selected projects
          </Typography>
        </Box>

        {/* Formwork */}
        <Box sx={formulaBoxStyle}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
            Formwork (แบบหล่อ)
          </Typography>
          <Typography variant="body2" sx={formulaCodeStyle}>
            Total Area (m²) = Σ(Component Area)
          </Typography>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            Sum of all component areas from selected projects
          </Typography>
        </Box>

        <Divider sx={{ my: 2.5 }} />

        {/* Cost Calculation */}
        <Box sx={formulaBoxStyle}>
          <Typography variant="h6" color="success.main" sx={{ fontWeight: 600, mb: 1 }}>
            Cost Calculation
          </Typography>
          <Typography variant="body2" sx={formulaCodeStyle}>
            Material Cost = Total Quantity × Unit Price
          </Typography>
          <Typography variant="body2" sx={{ ...formulaCodeStyle, mt: 1 }}>
            Total Project Cost = Σ(All Material Costs)
          </Typography>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            Cost for each material type multiplied by configured unit prices, then summed
          </Typography>
        </Box>
      </Box>
    </DashboardCard>
  );
};

export default FormulaDisplay;
