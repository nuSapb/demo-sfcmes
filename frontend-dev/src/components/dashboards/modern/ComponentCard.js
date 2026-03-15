import React from 'react';
import { Card, CardContent, Typography, Button } from '@mui/material';
import { getStatusColor } from './utils';

const ComponentCard = ({ component, onComponentClick }) => {
  const { bg, color } = getStatusColor(component.status);

  return (
    <Card
      sx={{
        backgroundColor: bg,
        height: '85px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '6px',
        margin: '4px',
      }}
    >
      <CardContent sx={{ textAlign: 'center', p: '3px' }}>
        <Typography
          variant="subtitle2"
          sx={{ color: color, fontSize: '11px', fontWeight: 'bold' }}
        >
          {component.name}
        </Typography>
        <Button
          variant="contained"
          size="small"
          onClick={() => onComponentClick(component)}
          sx={{
            mt: '6px',
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            color: color,
            fontSize: '10px',
            p: '2px 6px',
          }}
        >
          ดูข้อมูล
        </Button>
      </CardContent>
    </Card>
  );
};

export default ComponentCard;