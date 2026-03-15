import { Box } from '@mui/material';
import { STATUS_COLORS, getStatusColorFromTokens } from './designTokens';

export const statusDisplayMap = {
  Manufactured: 'ผลิตแล้ว',
  'In Transit': 'อยู่ระหว่างขนส่ง',
  Transported: 'ขนส่งสำเร็จ',
  Accepted: 'ตรวจรับแล้ว',
  Installed: 'ติดตั้งแล้ว',
  Rejected: 'ถูกปฏิเสธ',
};

export const statusOrder = [
  'Manufactured',
  'In Transit',
  'Transported',
  'Accepted',
  'Installed',
  'Rejected',
];

// Get status color with WCAG AA compliant text colors
export const getStatusColor = (status) => {
  const colorInfo = getStatusColorFromTokens(status);
  return { bg: colorInfo.bg, color: colorInfo.text };
};

// Re-export for convenience
export { STATUS_COLORS };

export const StatusChip = ({ status, label }) => {
  const { bg, color } = getStatusColor(status);
  return (
    <Box
      component="span"
      sx={{
        bgcolor: bg,
        color: color,
        fontWeight: 'bold',
        padding: '4px 8px',
        borderRadius: '16px',
        fontSize: { xs: '0.7rem', sm: '0.9rem' },
        display: 'inline-block',
        margin: '2px',
      }}
    >
      {label}
    </Box>
  );
};