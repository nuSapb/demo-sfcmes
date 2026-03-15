import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
} from '@mui/material';
import { Close as CloseIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import ComponentDialog from './ComponentDialog';
import { styled, keyframes } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { STATUS_COLORS, COMPONENT_BOX, SPACING } from './designTokens';

// Keyframe animations
const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 5px rgba(39, 174, 96, 0.5), 0 0 10px rgba(39, 174, 96, 0.3);
  }
  50% {
    box-shadow: 0 0 15px rgba(39, 174, 96, 0.8), 0 0 25px rgba(39, 174, 96, 0.5);
  }
`;

const STATUS_THAI = {
  planning: 'รอผลิต',
  manufactured: 'ผลิต',
  transported: 'ขนส่ง',
  accepted: 'ตรวจรับ',
  installed: 'ติดตั้ง',
  rejected: 'ปฏิเสธ',
};

const statusOrder = ['planning', 'manufactured', 'transported', 'accepted', 'installed', 'rejected'];

// Use WCAG AA compliant colors from design tokens
const getStatusColor = (status) => {
  const colorInfo = STATUS_COLORS[status] || STATUS_COLORS.planning;
  return { bg: colorInfo.bg, color: colorInfo.text };
};

// Sort components by number first, then by alphabet
const sortComponents = (components) => {
  if (!components || !Array.isArray(components)) return [];

  return [...components].sort((a, b) => {
    const nameA = a.name || '';
    const nameB = b.name || '';

    // Extract numeric part and suffix (letter) from the name
    const parseComponentName = (name) => {
      // Match patterns like "1", "10", "55A", "55B", "23 (ติด Passenger Lift)"
      const match = name.match(/^(\d+)([A-Za-z])?(.*)$/);
      if (match) {
        return {
          number: parseInt(match[1], 10),
          letter: match[2] || '',
          suffix: match[3] || ''
        };
      }
      // If no match, treat as string
      return { number: Infinity, letter: '', suffix: name };
    };

    const parsedA = parseComponentName(nameA);
    const parsedB = parseComponentName(nameB);

    // First, compare by number
    if (parsedA.number !== parsedB.number) {
      return parsedA.number - parsedB.number;
    }

    // If numbers are equal, compare by letter
    if (parsedA.letter !== parsedB.letter) {
      return parsedA.letter.localeCompare(parsedB.letter);
    }

    // If both are equal, compare by suffix
    return parsedA.suffix.localeCompare(parsedB.suffix);
  });
};

// Status Summary Chip Component with Animation
const StatusChip = ({ status, count, total, index = 0 }) => {
  const { bg, color: textColor } = getStatusColor(status);
  const percent = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
  const hasCount = count > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: 'easeOut' }}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
    >
      <Box
        sx={{
          bgcolor: bg,
          color: textColor,
          fontWeight: 'bold',
          padding: `${SPACING.sm}px ${SPACING.md}px`,
          borderRadius: '12px',
          fontSize: '0.75rem',
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          margin: `${SPACING.xs}px`,
          minWidth: '75px',
          boxShadow: hasCount
            ? `0 4px 12px ${bg}50`
            : '0 2px 8px rgba(0,0,0,0.2)',
          border: '1px solid rgba(255,255,255,0.2)',
          transition: 'box-shadow 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            boxShadow: `0 6px 20px ${bg}60`,
          },
        }}
      >
        {/* Shine effect */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
            borderRadius: '12px 12px 0 0',
          }}
        />
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: textColor,
            fontSize: '0.8rem',
            textShadow: textColor === '#ffffff' ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {STATUS_THAI[status]}: {count}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.7rem',
            color: textColor,
            opacity: 0.9,
            position: 'relative',
            zIndex: 1,
          }}
        >
          ({percent}%)
        </Typography>
      </Box>
    </motion.div>
  );
};

const ComponentGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fill, ${COMPONENT_BOX.width}px)`,
  gap: SPACING.sm,
  justifyContent: 'start',
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: `repeat(auto-fill, ${COMPONENT_BOX.mobileWidth}px)`,
    gap: SPACING.xs,
  },
}));

const ComponentBox = styled(Paper)(({ status }) => {
  const colorInfo = STATUS_COLORS[status] || STATUS_COLORS.planning;

  return {
    width: `${COMPONENT_BOX.width}px`,
    height: `${COMPONENT_BOX.height}px`,
    padding: `${SPACING.sm}px ${SPACING.xs}px`,
    textAlign: 'center',
    background: `linear-gradient(145deg, ${colorInfo.bg} 0%, ${colorInfo.bg}dd 100%)`,
    color: colorInfo.text,
    borderRadius: '8px',
    fontSize: '0.7rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: `0 3px 10px ${colorInfo.shadow}`,
    border: '1px solid rgba(255,255,255,0.15)',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    boxSizing: 'border-box',
    '@media (max-width: 600px)': {
      width: `${COMPONENT_BOX.mobileWidth}px`,
      height: `${COMPONENT_BOX.mobileHeight}px`,
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '50%',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 100%)',
      borderRadius: '8px 8px 0 0',
    },
    '&:hover': {
      boxShadow: `0 6px 20px ${colorInfo.shadow}`,
    },
  };
});

const ProjectDetailsModal = ({ open, onClose, project, theme, userRole, onProjectUpdate }) => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [componentDialogOpen, setComponentDialogOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!project) return null;

  const handleComponentClick = (component) => {
    setSelectedComponent(component);
    setComponentDialogOpen(true);
  };

  const handleCloseComponentDialog = () => {
    setComponentDialogOpen(false);
    setSelectedComponent(null);
  };

  const handleComponentUpdate = (updatedComponent) => {
    // Update the component in the project sections
    if (updatedComponent && project?.sections) {
      const updatedSections = project.sections.map((section) => ({
        ...section,
        components: section.components?.map((comp) =>
          comp.id === updatedComponent.id ? updatedComponent : comp
        ),
      }));

      const updatedProject = {
        ...project,
        sections: updatedSections,
      };

      if (onProjectUpdate) {
        onProjectUpdate(updatedProject);
      }
    }
  };

  const handleAccordionChange = (sectionId) => (_, isExpanded) => {
    setExpandedSection(isExpanded ? sectionId : null);
  };

  const totalComponents =
    project.sections?.reduce((acc, section) => acc + (section?.components?.length || 0), 0) || 0;
  const completedComponents =
    project.sections?.reduce(
      (acc, section) =>
        acc +
        (section?.components?.filter((c) => c.status === 'installed')?.length || 0),
      0,
    ) || 0;

  const completionPercent =
    totalComponents > 0 ? Math.round((completedComponents / totalComponents) * 100) : 0;

  // Calculate status counts for a section
  const getSectionStatusCounts = (components) => {
    const counts = {};
    statusOrder.forEach(status => {
      counts[status] = 0;
    });
    components?.forEach((comp) => {
      if (Object.prototype.hasOwnProperty.call(counts, comp.status)) {
        counts[comp.status]++;
      }
    });
    return counts;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          minHeight: '80vh',
          maxHeight: '95vh',
        }
      }}
    >
      <DialogTitle
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2.5,
          px: 3,
          background: 'linear-gradient(135deg, #5D87FF 0%, #4a6fdc 50%, #3d5fc7 100%)',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h5"
            sx={{
              color: '#ffffff',
              fontWeight: 700,
              fontSize: { xs: '1.1rem', sm: '1.4rem' },
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              mb: 0.5,
            }}
          >
            {project.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Box
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)',
                px: 1.5,
                py: 0.5,
                borderRadius: '8px',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Typography sx={{ color: '#ffffff', fontSize: '0.8rem', fontWeight: 500 }}>
                รหัส: {project.project_code}
              </Typography>
            </Box>
            <Box
              sx={{
                bgcolor: 'rgba(39, 174, 96, 0.3)',
                px: 1.5,
                py: 0.5,
                borderRadius: '8px',
                border: '1px solid rgba(39, 174, 96, 0.5)',
              }}
            >
              <Typography sx={{ color: '#ffffff', fontSize: '0.8rem', fontWeight: 600 }}>
                {totalComponents} ชิ้นงาน
              </Typography>
            </Box>
          </Box>
        </Box>

        <motion.div whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}>
          <Button
            onClick={onClose}
            sx={{
              minWidth: 'auto',
              p: 1,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.1)',
              color: '#ffffff',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.2)',
              },
            }}
          >
            <CloseIcon />
          </Button>
        </motion.div>
      </DialogTitle>

      <DialogContent dividers sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#1a1a2e' : '#f5f5f5', p: 2 }}>
        {/* Overall Progress - Enhanced Design */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <Box
            sx={{
              mb: 3,
              p: 3,
              background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d44 50%, #1a1a2e 100%)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Background shimmer effect */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)',
                backgroundSize: '200% 100%',
                animation: `${shimmer} 3s ease-in-out infinite`,
                pointerEvents: 'none',
              }}
            />

            {/* Header Row */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color: '#ffffff',
                  fontSize: { xs: '0.95rem', sm: '1.1rem' },
                  letterSpacing: '0.5px',
                }}
              >
                ความคืบหน้าโดยรวม
              </Typography>

              {/* Animated Percentage Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              >
                <Box
                  sx={{
                    background: completionPercent >= 80
                      ? 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)'
                      : completionPercent >= 50
                        ? 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)'
                        : 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                    borderRadius: '20px',
                    px: 2,
                    py: 0.75,
                    boxShadow: completionPercent >= 80
                      ? '0 4px 15px rgba(39, 174, 96, 0.4)'
                      : '0 4px 15px rgba(52, 152, 219, 0.4)',
                    animation: completionPercent === 100 ? `${glow} 2s ease-in-out infinite` : 'none',
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 800,
                      color: '#ffffff',
                      fontSize: { xs: '1rem', sm: '1.2rem' },
                      textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                  >
                    {completionPercent}%
                  </Typography>
                </Box>
              </motion.div>
            </Box>

            {/* Stats Row */}
            <Box sx={{ display: 'flex', gap: 3, mb: 2.5, flexWrap: 'wrap' }}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', mb: 0.5 }}>
                    ติดตั้งแล้ว
                  </Typography>
                  <Typography sx={{ color: '#27ae60', fontWeight: 700, fontSize: '1.5rem' }}>
                    {completedComponents}
                  </Typography>
                </Box>
              </motion.div>

              <Box sx={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', mb: 0.5 }}>
                    ทั้งหมด
                  </Typography>
                  <Typography sx={{ color: '#ffffff', fontWeight: 700, fontSize: '1.5rem' }}>
                    {totalComponents}
                  </Typography>
                </Box>
              </motion.div>

              <Box sx={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', mb: 0.5 }}>
                    คงเหลือ
                  </Typography>
                  <Typography sx={{ color: '#f39c12', fontWeight: 700, fontSize: '1.5rem' }}>
                    {totalComponents - completedComponents}
                  </Typography>
                </Box>
              </motion.div>
            </Box>

            {/* Progress Bar Container */}
            <Box sx={{ position: 'relative' }}>
              {/* Background Track */}
              <Box
                sx={{
                  height: 14,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 7,
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                {/* Animated Progress Fill */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercent}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                  style={{
                    height: '100%',
                    background: completionPercent >= 80
                      ? 'linear-gradient(90deg, #27ae60 0%, #2ecc71 50%, #58d68d 100%)'
                      : completionPercent >= 50
                        ? 'linear-gradient(90deg, #e67e22 0%, #f39c12 50%, #f1c40f 100%)'
                        : 'linear-gradient(90deg, #2980b9 0%, #3498db 50%, #5dade2 100%)',
                    borderRadius: 7,
                    position: 'relative',
                    boxShadow: '0 0 10px rgba(39, 174, 96, 0.5)',
                  }}
                >
                  {/* Shimmer overlay on progress bar */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                      backgroundSize: '200% 100%',
                      animation: `${shimmer} 2s ease-in-out infinite`,
                    }}
                  />

                  {/* Highlight line */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 2,
                      left: 4,
                      right: 4,
                      height: 4,
                      background: 'linear-gradient(90deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))',
                      borderRadius: 2,
                    }}
                  />
                </motion.div>
              </Box>

              {/* Progress Markers */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, px: 0.5 }}>
                {[0, 25, 50, 75, 100].map((mark) => (
                  <Typography
                    key={mark}
                    sx={{
                      fontSize: '0.65rem',
                      color: completionPercent >= mark ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
                      fontWeight: completionPercent >= mark ? 600 : 400,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {mark}%
                  </Typography>
                ))}
              </Box>
            </Box>
          </Box>
        </motion.div>

        {/* Sections with Status Summary */}
        {project.sections && project.sections.length > 0 ? (
          <Box>
            <AnimatePresence>
              {project.sections.map((section, sectionIndex) => {
                const sectionComponents = section.components || [];
                const sectionTotal = sectionComponents.length;
                const statusCounts = getSectionStatusCounts(sectionComponents);

                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: sectionIndex * 0.1, duration: 0.4 }}
                  >
                    <Accordion
                      expanded={expandedSection === section.id}
                      onChange={handleAccordionChange(section.id)}
                      sx={{
                        mb: 2,
                        borderRadius: '12px !important',
                        overflow: 'hidden',
                        '&:before': { display: 'none' },
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={
                          <motion.div
                            animate={{ rotate: expandedSection === section.id ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ExpandMoreIcon sx={{ color: '#ffffff', fontSize: '1.5rem' }} />
                          </motion.div>
                        }
                        sx={{
                          background: 'linear-gradient(135deg, #5D87FF 0%, #4a6fdc 100%)',
                          color: '#ffffff',
                          minHeight: 'auto',
                          py: 2,
                          '& .MuiAccordionSummary-content': {
                            flexDirection: 'column',
                            my: 1,
                          },
                        }}
                      >
                        {/* Section Title */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              color: '#ffffff',
                              fontSize: { xs: '1rem', sm: '1.2rem' },
                              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            }}
                          >
                            {section.name}
                          </Typography>
                          <Box
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.2)',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: '20px',
                              backdropFilter: 'blur(10px)',
                            }}
                          >
                            <Typography
                              sx={{
                                fontWeight: 600,
                                color: '#ffffff',
                                fontSize: '0.85rem',
                              }}
                            >
                              {sectionTotal} ชิ้นงาน
                            </Typography>
                          </Box>
                        </Box>

                        {/* Status Summary Chips */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 1.5, gap: 0.5 }}>
                          {statusOrder.map((status, idx) => (
                            <StatusChip
                              key={status}
                              status={status}
                              count={statusCounts[status]}
                              total={sectionTotal}
                              index={idx}
                            />
                          ))}
                        </Box>
                      </AccordionSummary>

                      <AccordionDetails
                        sx={{
                          background: 'linear-gradient(180deg, #2a3447 0%, #1e2738 100%)',
                          p: { xs: 1.5, sm: 2.5 },
                        }}
                      >
                        {/* Components Grid - Sorted */}
                        <ComponentGrid>
                          {sortComponents(sectionComponents).map((component, compIndex) => (
                            <Tooltip
                              key={component.id}
                              title={
                                <Box sx={{ p: 0.5 }}>
                                  <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                                    {component.name}
                                  </Typography>
                                  <Typography sx={{ fontSize: '0.75rem', opacity: 0.9 }}>
                                    สถานะ: {STATUS_THAI[component.status]}
                                  </Typography>
                                  <Typography sx={{ fontSize: '0.7rem', opacity: 0.7, mt: 0.5 }}>
                                    คลิกเพื่อดูรายละเอียด
                                  </Typography>
                                </Box>
                              }
                              arrow
                              placement="top"
                              enterDelay={300}
                              leaveDelay={0}
                            >
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: compIndex * 0.005, duration: 0.15 }}
                                whileHover={{ scale: 1.1, zIndex: 10 }}
                                whileTap={{ scale: 0.95 }}
                                style={{ display: 'inline-block', cursor: 'pointer' }}
                                onClick={() => handleComponentClick(component)}
                              >
                                <ComponentBox status={component.status}>
                                  {(() => {
                                    const colorInfo = STATUS_COLORS[component.status] || STATUS_COLORS.planning;
                                    const isLightText = colorInfo.text === '#ffffff';
                                    return (
                                      <>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            fontWeight: 700,
                                            display: 'block',
                                            fontSize: { xs: '0.65rem', sm: '0.7rem' },
                                            color: colorInfo.text,
                                            textShadow: isLightText ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            maxWidth: '100%',
                                            position: 'relative',
                                            zIndex: 1,
                                          }}
                                        >
                                          {component.name}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            fontSize: { xs: '0.5rem', sm: '0.55rem' },
                                            display: 'block',
                                            color: isLightText ? 'rgba(255,255,255,0.85)' : `${colorInfo.text}cc`,
                                            position: 'relative',
                                            zIndex: 1,
                                          }}
                                        >
                                          ดูข้อมูล
                                        </Typography>
                                      </>
                                    );
                                  })()}
                                </ComponentBox>
                              </motion.div>
                            </Tooltip>
                          ))}
                        </ComponentGrid>
                      </AccordionDetails>
                    </Accordion>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </Box>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              ไม่พบข้อมูลชั้น
            </Typography>
          </motion.div>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          background: 'linear-gradient(180deg, #f5f5f5 0%, #e8e8e8 100%)',
          borderTop: '1px solid rgba(0,0,0,0.1)',
        }}
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={onClose}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #5D87FF 0%, #4a6fdc 100%)',
              px: 4,
              py: 1.2,
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.95rem',
              boxShadow: '0 4px 15px rgba(93, 135, 255, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4a6fdc 0%, #3d5fc7 100%)',
                boxShadow: '0 6px 20px rgba(93, 135, 255, 0.5)',
              },
            }}
          >
            ปิด
          </Button>
        </motion.div>
      </DialogActions>

      {/* Component Detail Dialog */}
      {selectedComponent && (
        <ComponentDialog
          open={componentDialogOpen}
          onClose={handleCloseComponentDialog}
          component={selectedComponent}
          projectCode={project?.project_code}
          onComponentUpdate={handleComponentUpdate}
          userRole={userRole}
          canEdit={userRole === 'Admin' || userRole === 'Site User'}
        />
      )}
    </Dialog>
  );
};

ProjectDetailsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  project: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    project_code: PropTypes.string,
    sections: PropTypes.arrayOf(PropTypes.object),
  }),
  theme: PropTypes.object.isRequired,
  userRole: PropTypes.string,
  onProjectUpdate: PropTypes.func,
};

export default ProjectDetailsModal;
