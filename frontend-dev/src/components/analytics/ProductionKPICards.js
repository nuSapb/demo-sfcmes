import { Grid, Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IconArrowUpRight, IconArrowDownRight } from '@tabler/icons';

const ProductionKPICards = ({ data }) => {
  const theme = useTheme();

  const kpis = [
    {
      title: 'ผลผลิตต่อวัน',
      value: data?.dailyThroughput?.current || 12,
      unit: 'ชิ้น/วัน',
      target: data?.dailyThroughput?.target || 15,
      color: theme.palette.primary.main,
      bgColor: theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
      trend: data?.dailyThroughput?.trend === 'increasing' ? 'up' : 'down',
    },
    {
      title: 'เวลาเฉลี่ย',
      value: data?.avgProductionTime?.planningToManufactured || 5.2,
      unit: 'วัน',
      subtext: 'วางแผน → ผลิต',
      color: theme.palette.success.main,
      bgColor: theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
      progress: (5.2 / 10) * 100,
    },
    {
      title: 'ส่งตรงเวลา',
      value: data?.onTimeDeliveryRate || 92.5,
      unit: '%',
      color: theme.palette.warning.main,
      bgColor: theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
      progress: data?.onTimeDeliveryRate || 92.5,
    },
    {
      title: 'อัตราความสำเร็จ',
      value: data?.completionRate || 43.1,
      unit: '%',
      color: theme.palette.info.main,
      bgColor: theme.palette.mode === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
      progress: data?.completionRate || 43.1,
    },
  ];

  return (
    <Grid container spacing={2}>
      {kpis.map((kpi, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card
            sx={{
              background: kpi.bgColor,
              border: `1px solid ${theme.palette.divider}`,
              '&:hover': {
                boxShadow: 2,
              },
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Typography
                color="textSecondary"
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  mb: 1,
                }}
              >
                {kpi.title}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                <Typography
                  sx={{
                    fontSize: { xs: '1.5rem', sm: '1.75rem' },
                    fontWeight: 600,
                    color: kpi.color,
                  }}
                >
                  {typeof kpi.value === 'number'
                    ? kpi.value.toFixed(1)
                    : kpi.value}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    color: 'textSecondary',
                  }}
                >
                  {kpi.unit}
                </Typography>
              </Box>

              {kpi.subtext && (
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: 'textSecondary',
                    mb: 1,
                  }}
                >
                  {kpi.subtext}
                </Typography>
              )}

              {kpi.target && (
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: 'textSecondary',
                    mb: 1,
                  }}
                >
                  เป้าหมาย: {kpi.target} {kpi.unit}
                </Typography>
              )}

              {kpi.progress && (
                <Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(kpi.progress, 100)}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: kpi.color,
                        borderRadius: 3,
                      },
                    }}
                  />
                </Box>
              )}

              {kpi.trend && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                  {kpi.trend === 'up' ? (
                    <IconArrowUpRight size={16} color={theme.palette.success.main} />
                  ) : (
                    <IconArrowDownRight size={16} color={theme.palette.error.main} />
                  )}
                  <Typography sx={{ fontSize: '0.75rem' }}>
                    {kpi.trend === 'up' ? 'เพิ่มขึ้น' : 'ลดลง'}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductionKPICards;
