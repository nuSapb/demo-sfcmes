import { Card, CardContent, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Chart from 'react-apexcharts';
import DashboardCard from 'src/components/shared/DashboardCard';

const CostBreakdownChart = ({ data }) => {
  const theme = useTheme();

  const chartData = [
    data?.concrete?.amount || 0,
    data?.steel?.amount || 0,
    data?.formwork?.amount || 0,
    data?.labor?.amount || 0,
    data?.transport?.amount || 0,
  ];

  const chartOptions = {
    chart: {
      type: 'donut',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      toolbar: {
        show: false,
      },
      height: 300,
    },
    labels: ['คอนกรีต', 'เหล็ก', 'แบบหล่อ', 'แรงงาน', 'ขนส่ง'],
    colors: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'],
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          background: 'transparent',
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: true,
      position: 'bottom',
      fontSize: 12,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      foreColor: theme.palette.mode === 'dark' ? '#adb0bb' : '#8c92a4',
    },
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
      fillSeriesColor: false,
      y: {
        formatter: (val) => `฿${val.toLocaleString('th-TH')}`,
      },
    },
    states: {
      hover: {
        filter: {
          type: 'darken',
          value: 0.15,
        },
      },
    },
  };

  const chartSeries = [chartData];

  return (
    <DashboardCard title="การแบ่งต้นทุน" subtitle="Cost breakdown by category">
      <Chart
        options={chartOptions}
        series={chartSeries}
        type="donut"
        height="300px"
        width="100%"
      />
    </DashboardCard>
  );
};

export default CostBreakdownChart;
