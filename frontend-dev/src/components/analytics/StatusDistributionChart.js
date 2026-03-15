import { useTheme } from '@mui/material/styles';
import Chart from 'react-apexcharts';
import DashboardCard from 'src/components/shared/DashboardCard';

const StatusDistributionChart = ({ data }) => {
  const theme = useTheme();

  const chartData = [
    data?.manufactured || 150,
    data?.inTransit || 200,
    data?.transported || 80,
    data?.accepted || 220,
    data?.installed || 340,
    data?.rejected || 8,
  ];

  const chartOptions = {
    chart: {
      type: 'pie',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      toolbar: {
        show: false,
      },
      height: 300,
    },
    labels: [
      'ผลิตแล้ว',
      'ระหว่างขนส่ง',
      'ขนส่งสำเร็จ',
      'ตรวจสอบแล้ว',
      'ติดตั้งแล้ว',
      'ถูกปฏิเสธ',
    ],
    colors: ['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#10B981', '#EF4444'],
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
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
        formatter: (val) => `${val} ชิ้น`,
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

  const chartSeries = chartData;

  return (
    <DashboardCard title="การกระจายสถานะ" subtitle="Status distribution of components">
      <Chart
        options={chartOptions}
        series={chartSeries}
        type="pie"
        height="300px"
        width="100%"
      />
    </DashboardCard>
  );
};

export default StatusDistributionChart;
