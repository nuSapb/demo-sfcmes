import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const ProjectHealthCard = ({ project }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case 'on-track':
        return 'success';
      case 'at-risk':
        return 'warning';
      case 'delayed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'on-track':
        return 'ตามแผน';
      case 'at-risk':
        return 'มีความเสี่ยง';
      case 'delayed':
        return 'ล่าช้า';
      default:
        return 'ไม่ระบุ';
    }
  };

  const handleCardClick = () => {
    navigate(`/analytics/projects/${project.id}/cost`);
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: `2px solid ${
          project.status === 'on-track'
            ? theme.palette.success.main
            : project.status === 'at-risk'
            ? theme.palette.warning.main
            : theme.palette.error.main
        }`,
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-4px)',
          transition: 'all 0.3s ease',
        },
      }}
    >
      <CardActionArea
        onClick={handleCardClick}
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
      >
        <CardContent sx={{ flexGrow: 1, width: '100%' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 0.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {project.name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                โครงการ ID: {project.id?.substring(0, 8)}...
              </Typography>
            </Box>
            <Chip
              label={getStatusLabel(project.status)}
              color={getStatusColor(project.status)}
              size="small"
              variant="filled"
            />
          </Box>

          {/* Progress Section */}
          <Box sx={{ mb: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                ความคืบหน้า
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {project.progress?.toFixed(1) || 0}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={project.progress || 0}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  background:
                    project.progress > 66
                      ? theme.palette.success.main
                      : project.progress > 33
                      ? theme.palette.warning.main
                      : theme.palette.error.main,
                  borderRadius: 3,
                },
              }}
            />
          </Box>

          {/* Metrics Grid */}
          <Grid container spacing={1.5}>
            <Grid item xs={6}>
              <Box
                sx={{
                  p: 1,
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(0,0,0,0.02)',
                  borderRadius: 1,
                }}
              >
                <Typography variant="caption" color="textSecondary" display="block">
                  ชิ้นงาน
                </Typography>
                <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  {project.components?.completed || 0}/{project.components?.total || 0}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box
                sx={{
                  p: 1,
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(0,0,0,0.02)',
                  borderRadius: 1,
                }}
              >
                <Typography variant="caption" color="textSecondary" display="block">
                  สถานะ
                </Typography>
                <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  {project.status === 'in_progress' ? 'กำลังดำเนิน' : 'วางแผน'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box
                sx={{
                  p: 1,
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(0,0,0,0.02)',
                  borderRadius: 1,
                }}
              >
                <Typography variant="caption" color="textSecondary" display="block">
                  คะแนนสุขภาพ
                </Typography>
                <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  {project.healthScore || '-'}/100
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box
                sx={{
                  p: 1,
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(0,0,0,0.02)',
                  borderRadius: 1,
                }}
              >
                <Typography variant="caption" color="textSecondary" display="block">
                  ระดับความเสี่ยง
                </Typography>
                <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  {project.riskLevel === 'low'
                    ? 'ต่ำ'
                    : project.riskLevel === 'medium'
                    ? 'ปานกลาง'
                    : 'สูง'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ProjectHealthCard;
