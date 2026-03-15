import { Grid, Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const MaterialSummaryCards = ({ materialData }) => {
  const theme = useTheme();

  if (!materialData || !materialData.quantities) {
    return null;
  }

  const { quantities, projectCount } = materialData;

  const cardStyle = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  };

  const cardContentStyle = {
    flexGrow: 1,
    position: 'relative',
    overflow: 'hidden',
  };

  // Gradient backgrounds
  const getCardBackground = (type) => {
    const gradients = {
      concrete: `linear-gradient(135deg, ${theme.palette.success.main}15, ${theme.palette.success.light}20)`,
      steel: `linear-gradient(135deg, ${theme.palette.info.main}15, ${theme.palette.info.light}20)`,
      formwork: `linear-gradient(135deg, ${theme.palette.warning.main}15, ${theme.palette.warning.light}20)`,
    };
    return gradients[type];
  };

  const getBorderColor = (type) => {
    const colors = {
      concrete: theme.palette.success.main,
      steel: theme.palette.info.main,
      formwork: theme.palette.warning.main,
    };
    return colors[type];
  };

  const getIcon = (type) => {
    const icons = {
      concrete: '🏗️',
      steel: '⚙️',
      formwork: '📐',
    };
    return icons[type];
  };

  const materials = [
    {
      type: 'concrete',
      label: 'Concrete (คอนกรีต)',
      value: quantities.volume,
      unit: 'Cubic Meters (ลบ.ม.)',
      shortUnit: 'm³',
    },
    {
      type: 'steel',
      label: 'Steel/Rebar (เหล็กเสริม)',
      value: quantities.weight,
      unit: 'Tons (ตัน)',
      shortUnit: 'tons',
    },
    {
      type: 'formwork',
      label: 'Formwork (แบบหล่อ)',
      value: quantities.area,
      unit: 'Square Meters (ตร.ม.)',
      shortUnit: 'm²',
    },
  ];

  return (
    <Grid container spacing={3}>
      {materials.map((material) => (
        <Grid item xs={12} md={4} key={material.type}>
          <Card
            sx={{
              ...cardStyle,
              background: getCardBackground(material.type),
              border: `2px solid ${getBorderColor(material.type)}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-4px)',
              },
            }}
          >
            <CardContent sx={cardContentStyle}>
              {/* Header with icon */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {material.label}
                </Typography>
                <Typography variant="h4" sx={{ fontSize: '1.8rem' }}>
                  {getIcon(material.type)}
                </Typography>
              </Box>

              {/* Main value */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {material.value.toLocaleString('th-TH', {
                    maximumFractionDigits: 2,
                  })}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
                  {material.unit}
                </Typography>
              </Box>

              {/* Progress indicator */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="textSecondary">
                    From {projectCount} project{projectCount > 1 ? 's' : ''}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: getBorderColor(material.type) }}>
                    {material.shortUnit}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={75}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getBorderColor(material.type),
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>

              {/* Info text */}
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                Total quantity aggregated from all selected projects
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default MaterialSummaryCards;
