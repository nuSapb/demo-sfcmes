import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardCard from 'src/components/shared/DashboardCard';

const CostEstimationTable = ({ materialData, unitPrices }) => {
  const theme = useTheme();

  if (!materialData || !materialData.quantities) {
    return null;
  }

  const { quantities, costs, grandTotal } = materialData;

  const materials = [
    {
      name: 'Concrete (คอนกรีต)',
      quantity: quantities.volume,
      unit: 'm³',
      unitPrice: unitPrices.concrete,
      type: 'concrete',
    },
    {
      name: 'Steel/Rebar (เหล็กเสริม)',
      quantity: quantities.weight,
      unit: 'tons',
      unitPrice: unitPrices.steel,
      type: 'steel',
    },
    {
      name: 'Formwork (แบบหล่อ)',
      quantity: quantities.area,
      unit: 'm²',
      unitPrice: unitPrices.formwork,
      type: 'formwork',
    },
  ];

  const formatCurrency = (value) => {
    return `฿${value.toLocaleString('th-TH', {
      maximumFractionDigits: 0,
    })}`;
  };

  const getRowColor = (type) => {
    const colors = {
      concrete: theme.palette.success.main,
      steel: theme.palette.info.main,
      formwork: theme.palette.warning.main,
    };
    return colors[type];
  };

  return (
    <DashboardCard title="Cost Estimation" subtitle="Material costs based on selected projects">
      <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.03)',
              }}
            >
              <TableCell sx={{ fontWeight: 600 }}>Material Type</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Quantity
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Unit
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Unit Price (฿)
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Total Cost (฿)
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {materials.map((material, index) => {
              const totalCost = material.quantity * material.unitPrice;
              return (
                <TableRow
                  key={material.type}
                  sx={{
                    borderLeft: `4px solid ${getRowColor(material.type)}`,
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.02)'
                        : 'rgba(0,0,0,0.01)',
                  }}
                >
                  <TableCell sx={{ fontWeight: 500 }}>
                    {material.name}
                  </TableCell>
                  <TableCell align="right">
                    {material.quantity.toLocaleString('th-TH', {
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell align="right">
                    {material.unit}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(material.unitPrice)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: getRowColor(material.type) }}>
                    {formatCurrency(totalCost)}
                  </TableCell>
                </TableRow>
              );
            })}

            {/* Grand Total Row */}
            <TableRow
              sx={{
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(76, 175, 80, 0.15)'
                    : 'rgba(76, 175, 80, 0.08)',
                borderTop: `3px solid ${theme.palette.success.main}`,
              }}
            >
              <TableCell
                colSpan={4}
                sx={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: theme.palette.success.main,
                }}
              >
                GRAND TOTAL
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  color: theme.palette.success.main,
                }}
              >
                {formatCurrency(grandTotal)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      {/* Summary Card */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: theme.palette.success.light, borderRadius: 1 }}>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
          Total Material Cost for {materials.length} material types
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: theme.palette.success.main,
          }}
        >
          {formatCurrency(grandTotal)}
        </Typography>
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
          Calculated based on unit prices × quantities from selected projects
        </Typography>
      </Box>
    </DashboardCard>
  );
};

export default CostEstimationTable;
