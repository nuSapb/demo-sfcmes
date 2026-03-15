import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Button,
  Box,
  Typography,
  InputAdornment,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const UnitPriceSettings = ({ open, onClose, onSave, initialPrices }) => {
  const theme = useTheme();
  const [prices, setPrices] = useState(initialPrices);

  useEffect(() => {
    setPrices(initialPrices);
  }, [initialPrices, open]);

  const handlePriceChange = (material, value) => {
    setPrices((prev) => ({
      ...prev,
      [material]: parseFloat(value) || 0,
    }));
  };

  const handleSave = () => {
    onSave(prices);
  };

  const handleCancel = () => {
    setPrices(initialPrices);
    onClose();
  };

  const materials = [
    {
      key: 'concrete',
      label: 'Concrete Price (คอนกรีต)',
      unit: '฿ per m³',
      description: 'Cost per cubic meter of concrete',
    },
    {
      key: 'steel',
      label: 'Steel/Rebar Price (เหล็กเสริม)',
      unit: '฿ per ton',
      description: 'Cost per ton of steel/rebar',
    },
    {
      key: 'formwork',
      label: 'Formwork Price (แบบหล่อ)',
      unit: '฿ per m²',
      description: 'Cost per square meter of formwork',
    },
  ];

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Material Unit Price Settings
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Configure prices for material cost calculations
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          {materials.map((material) => (
            <Box key={material.key}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  mb: 0.5,
                  color:
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                }}
              >
                {material.label}
              </Typography>
              <TextField
                fullWidth
                type="number"
                value={prices[material.key]}
                onChange={(e) => handlePriceChange(material.key, e.target.value)}
                inputProps={{
                  step: 100,
                  min: 0,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mr: 1 }}>
                      ฿
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end" sx={{ fontSize: '0.85rem', color: 'textSecondary' }}>
                      {material.unit}
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 0.5 }}
              />
              <Typography variant="caption" color="textSecondary">
                {material.description}
              </Typography>
            </Box>
          ))}
        </Stack>

        {/* Info Box */}
        <Box
          sx={{
            mt: 3,
            p: 2,
            backgroundColor:
              theme.palette.mode === 'dark'
                ? 'rgba(33, 150, 243, 0.1)'
                : 'rgba(33, 150, 243, 0.05)',
            borderLeft: `3px solid ${theme.palette.info.main}`,
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
            💡 Tip
          </Typography>
          <Typography variant="caption" color="textSecondary">
            These unit prices will be used to calculate total material costs. You can update
            them anytime without affecting previous calculations.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleCancel} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Prices
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnitPriceSettings;
