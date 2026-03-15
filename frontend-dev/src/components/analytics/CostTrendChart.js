import { useTheme } from '@mui/material/styles';
import Chart from 'react-apexcharts';
import DashboardCard from 'src/components/shared/DashboardCard';

const CostTrendChart = ({ data }) => {
  const theme = useTheme();

  // Sample trend data - would be replaced with actual API data
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.'];
  const budgeted = [1000000, 2000000, 3000000, 4000000, 5000000, 6000000];
  const actual = [950000, 1900000, 2850000, 3750000, 4500000, 5200000];

  const chartOptions = {
    chart: {
      type: 'line',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      foreColor: theme.palette.mode === 'dark' ? '#adb0bb' : '#8c92a4',
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: true,
        type: 'x',
      },
    },
    xaxis: {
      categories: months,
      title: {
        text: 'เดือน',
        style: {
          fontSize: 12,
        },
      },
    },
    yaxis: {
      title: {
        text: 'ต้นทุน (฿)',
        style: {
          fontSize: 12,
        },
      },
      labels: {
        formatter: (val) => `฿${(val / 1000000).toFixed(1)}M`,
      },
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    colors: ['#3B82F6', '#10B981'],
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 4,
      hover: {
        size: 6,
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: 12,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      foreColor: theme.palette.mode === 'dark' ? '#adb0bb' : '#8c92a4',
    },
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
      y: {
        formatter: (val) => `฿${val.toLocaleString('th-TH')}`,
      },
    },
    grid: {
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    },
  };

  const chartSeries = [
    {
      name: 'งบประมาณ',
      data: budgeted,
    },
    {
      name: 'ต้นทุนจริง',
      data: actual,
    },
  ];

  return (
    <DashboardCard title="แนวโน้มต้นทุน" subtitle="Cost trend - Budgeted vs Actual">
      <Chart
        options={chartOptions}
        series={chartSeries}
        type="line"
        height="350px"
        width="100%"
      />
    </DashboardCard>
  );
};

export default CostTrendChart;
