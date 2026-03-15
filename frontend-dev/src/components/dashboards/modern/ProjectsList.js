import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  TextField,
  Typography,
  useTheme,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { Search as SearchIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import ImageGalleryModal from './ImageGalleryModal';
import EnhancedImageCard from './EnhancedImageCard';
import ProjectDetailsModal from './ProjectDetailsModal';
import { SPACING, PROGRESS_BAR } from './designTokens';

// ============================================
// STYLED COMPONENTS - Grid-Based Design
// ============================================

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: alpha(theme.palette.common.white, theme.palette.mode === 'dark' ? 0.05 : 0.98),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.spacing(1.5),
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: theme.palette.primary.main,
      backgroundColor: alpha(theme.palette.common.white, theme.palette.mode === 'dark' ? 0.08 : 1),
    },
    '&.Mui-focused': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
  },
}));

const ProjectCard = styled(Card)(({ theme }) => ({
  border: `1.5px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1.5),
  backgroundColor: alpha(theme.palette.common.white, theme.palette.mode === 'dark' ? 0.05 : 0.98),
  backdropFilter: 'blur(20px)',
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.08)} 0%, ${alpha(theme.palette.common.white, 0.02)} 100%)`
    : `linear-gradient(135deg, ${alpha(theme.palette.common.white, 1)} 0%, ${alpha(theme.palette.primary.light, 0.03)} 100%)`,
  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  overflow: 'hidden',
  width: '100%',
  position: 'relative',
}));

const ProjectHeaderBox = styled(Box)(() => ({
  padding: `${SPACING.md}px ${SPACING.lg}px`,
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: `${SPACING.md}px`,
  transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
}));

// ============================================
// PROJECT CARD COMPONENT
// ============================================

const ProjectCardComponent = ({ project, theme, onSelectProject }) => {
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const totalComponents =
    project.sections?.reduce((acc, section) => acc + (section?.components?.length || 0), 0) || 0;
  const completedComponents = project.sections?.reduce(
    (acc, section) =>
      acc +
      (section?.components?.filter((c) => c.status === 'installed')?.length || 0),
    0,
  ) || 0;

  const completionPercent = totalComponents > 0 ? Math.round((completedComponents / totalComponents) * 100) : 0;

  const handleCardClickModal = (e) => {
    // Only open modal if clicking on card title/header area, not on buttons
    if (e.target.closest('button') || e.target.closest('[role="button"]')) {
      return;
    }
    // Open details modal when card is clicked
    if (onSelectProject) {
      onSelectProject(project);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ProjectCard onClick={handleCardClickModal} sx={{ cursor: 'pointer' }}>
        {/* Header */}
        <ProjectHeaderBox>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <motion.div
            whileHover={{ x: 2 }}
            transition={{ duration: 0.15 }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                fontSize: '0.98rem',
                mb: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: theme.palette.text.primary,
                transition: 'color 0.2s ease',
              }}
            >
              {project.name}
            </Typography>
          </motion.div>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 500, fontSize: '0.75rem' }}
            >
              {project.project_code}
            </Typography>
            <motion.div
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.15 }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  fontSize: '0.75rem',
                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                  px: 0.85,
                  py: 0.35,
                  borderRadius: 0.75,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  backdropFilter: 'blur(4px)',
                  display: 'inline-block',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                {completedComponents}/{totalComponents}
              </Typography>
            </motion.div>
          </Box>
        </Box>

        {/* Progress & Image Card */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.75 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              fontSize: '0.9rem',
              color: theme.palette.primary.main,
              letterSpacing: '0.5px',
            }}
          >
            {completionPercent}%
          </Typography>
          {/* Enhanced Image Card with Shimmer & Stacking */}
          <Tooltip title="คลิกเพื่อดูตัวเลือก" arrow>
            <EnhancedImageCard
              images={
                project.componentFiles && project.componentFiles.length > 0
                  ? project.componentFiles.map((file) => file.file_url || file.url)
                  : []
              }
              onClick={(e) => {
                e.stopPropagation();
                setImageModalOpen(true);
              }}
            />
          </Tooltip>
        </Box>
      </ProjectHeaderBox>

      {/* Progress Bar */}
      <Box sx={{ px: 2.5, py: 1.25 }}>
        <Box
          sx={{
            height: PROGRESS_BAR.height,
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            borderRadius: PROGRESS_BAR.borderRadius,
            overflow: 'hidden',
            position: 'relative',
            backdropFilter: 'blur(4px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${completionPercent}%` }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              borderRadius: `${PROGRESS_BAR.borderRadius}px`,
              position: 'relative',
              boxShadow: `0 0 12px ${alpha(theme.palette.primary.main, 0.5)}`,
            }}
          />
        </Box>
      </Box>

      </ProjectCard>

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        images={project.componentFiles && project.componentFiles.length > 0
          ? project.componentFiles.map(file => file.file_url || file.url)
          : []
        }
        projectName={project.name}
      />
    </motion.div>
  );
};

ProjectCardComponent.propTypes = {
  project: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  onSelectProject: PropTypes.func.isRequired,
};

// ============================================
// MAIN PROJECTS LIST COMPONENT
// ============================================

const ProjectsList = ({ projects, userRole, onProjectSelect }) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedProjectForModal, setSelectedProjectForModal] = useState(null);

  const handleOpenDetailsModal = (project) => {
    setSelectedProjectForModal(project);
    setDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setDetailsModalOpen(false);
    setSelectedProjectForModal(null);
  };

  const handleProjectUpdate = (updatedProject) => {
    setSelectedProjectForModal(updatedProject);
    if (onProjectSelect) {
      onProjectSelect(updatedProject);
    }
  };

  const filteredProjects = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(term) || project.project_code.toLowerCase().includes(term),
    );
  }, [projects, searchTerm]);


  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.5rem', sm: '1.75rem' },
              mb: 0.5,
              letterSpacing: '-0.5px',
            }}
          >
            Projects
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Click card to view section and component details
          </Typography>
        </Box>

        {/* Search */}
        <SearchField
          fullWidth
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: theme.palette.text.secondary, opacity: 0.6 }} />
              </InputAdornment>
            ),
          }}
          size="small"
        />
      </Box>

      {/* Projects Accordion List - Full Width */}
      {filteredProjects.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filteredProjects.map((project, idx) => (
            <motion.div
              key={project.id}
              className="project-card-motion"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: idx * 0.08 }}
            >
              <ProjectCardComponent project={project} theme={theme} onSelectProject={handleOpenDetailsModal} />
            </motion.div>
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            textAlign: 'center',
            py: 6,
            px: 3,
          }}
        >
          <Typography variant="h6" sx={{ mb: 1, color: theme.palette.text.secondary }}>
            No projects found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search terms
          </Typography>
        </Box>
      )}

      {/* Project Details Modal */}
      <ProjectDetailsModal
        open={detailsModalOpen}
        onClose={handleCloseDetailsModal}
        project={selectedProjectForModal}
        theme={theme}
        userRole={userRole}
        onProjectUpdate={handleProjectUpdate}
      />
    </Box>
  );
};

ProjectsList.propTypes = {
  projects: PropTypes.array.isRequired,
  userRole: PropTypes.string,
  onProjectSelect: PropTypes.func,
};

export default ProjectsList;
