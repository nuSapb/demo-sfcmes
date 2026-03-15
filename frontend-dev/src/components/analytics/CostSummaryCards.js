import { Grid, Box, Typography, Card, CardContent } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const CostSummaryCards = ({ data }) => {
  const theme = useTheme();

  const cards = [
    {
      title: 'งบประมาณทั้งหมด',
      value: data?.totalCost || 0,
      unit: '฿',
      color: theme.palette.primary.main,
      bgColor: theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
    },
    {
      title: 'ต้นทุนต่อชิ้น',
      value: data?.unitCosts?.perComponent || 0,
      unit: '฿/ชิ้น',
      color: theme.palette.success.main,
      bgColor: theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
    },
    {
      title: 'ต้นทุนต่อ ลบ.ม.',
      value: data?.unitCosts?.perM3 || 0,
      unit: '฿/ลบ.ม.',
      color: theme.palette.warning.main,
      bgColor: theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
    },
    {
      title: 'ต้นทุนต่อ กก.',
      value: data?.unitCosts?.perKg || 0,
      unit: '฿/กก.',
      color: theme.palette.info.main,
      bgColor: theme.palette.mode === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
    },
  ];

  return (
    <Grid container spacing={2}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card
            sx={{
              background: card.bgColor,
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
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  fontWeight: 500,
                  mb: 1,
                }}
              >
                {card.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography
                  sx={{
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    fontWeight: 600,
                    color: card.color,
                  }}
                >
                  {card.value.toLocaleString('th-TH', {
                    maximumFractionDigits: card.unit.includes('กก.') ? 2 : 0,
                  })}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    color: 'textSecondary',
                  }}
                >
                  {card.unit}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default CostSummaryCards;
