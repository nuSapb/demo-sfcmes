import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardCard from 'src/components/shared/DashboardCard';

const CostBySectionTable = ({ data }) => {
  const theme = useTheme();

  // Sample table data - would be replaced with actual API data
  const sampleSections = [
    {
      name: 'ชั้น 1',
      components: 50,
      volume: 15.5,
      weight: 75,
      cost: 450000,
      variance: -50000,
    },
    {
      name: 'ชั้น 2',
      components: 60,
      volume: 18.2,
      weight: 85,
      cost: 520000,
      variance: 20000,
    },
    {
      name: 'ชั้น 3',
      components: 50,
      volume: 16.8,
      weight: 78,
      cost: 490000,
      variance: -10000,
    },
    {
      name: 'ชั้น 4',
      components: 37,
      volume: 15.2,
      weight: 68,
      cost: 430000,
      variance: -30000,
    },
  ];

  const getStatusColor = (variance) => {
    if (variance < 0) return 'success'; // Under budget
    if (variance > 0) return 'error'; // Over budget
    return 'default'; // On budget
  };

  return (
    <DashboardCard title="ต้นทุนรายชั้น" subtitle="Cost breakdown by section">
      <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
        <Table>
          <TableHead sx={{ backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>ชื่อชั้น</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>จำนวนชิ้น</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>ปริมาณ (ลบ.ม.)</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>น้ำหนัก (กก.)</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>ต้นทุน (฿)</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>ส่วนต่าง (฿)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sampleSections.map((section, index) => (
              <TableRow key={index} hover>
                <TableCell sx={{ fontWeight: 500 }}>{section.name}</TableCell>
                <TableCell align="right">{section.components}</TableCell>
                <TableCell align="right">{section.volume.toFixed(2)}</TableCell>
                <TableCell align="right">{section.weight.toFixed(1)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 500 }}>
                  ฿{section.cost.toLocaleString('th-TH')}
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={`฿${section.variance.toLocaleString('th-TH')}`}
                    color={getStatusColor(section.variance)}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </DashboardCard>
  );
};

export default CostBySectionTable;
