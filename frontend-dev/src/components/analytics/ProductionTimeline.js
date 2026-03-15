import { useTheme } from '@mui/material/styles';
import Chart from 'react-apexcharts';
import DashboardCard from 'src/components/shared/DashboardCard';

const ProductionTimeline = ({ data }) => {
  const theme = useTheme();

  // Sample timeline data - would be replaced with actual API data
  const dates = ['1 ม.ค.', '8 ม.ค.', '15 ม.ค.', '22 ม.ค.', '29 ม.ค.', '5 ก.พ.'];
  const produced = [45, 52, 48, 55, 60, 58];
  const installed = [30, 35, 38, 42, 45, 50];

  const chartOptions = {
    chart: {
      type: 'area',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      foreColor: theme.palette.mode === 'dark' ? '#adb0bb' : '#8c92a4',
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      height: 300,
    },
    xaxis: {
      categories: dates,
      title: {
        text: 'วันที่',
        style: {
          fontSize: 12,
        },
      },
    },
    yaxis: {
      title: {
        text: 'จำนวนชิ้น',
        style: {
          fontSize: 12,
        },
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
      },
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    colors: ['#10B981', '#F59E0B'],
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
        formatter: (val) => `${val} ชิ้น`,
      },
    },
    grid: {
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    },
  };

  const chartSeries = [
    {
      name: 'ผลิตเสร็จแล้ว',
      data: produced,
    },
    {
      name: 'ติดตั้งแล้ว',
      data: installed,
    },
  ];

  return (
    <DashboardCard title="ไทม์ไลน์การผลิต" subtitle="Production and installation timeline">
      <Chart
        options={chartOptions}
        series={chartSeries}
        type="area"
        height="300px"
        width="100%"
      />
    </DashboardCard>
  );
};

export default ProductionTimeline;
