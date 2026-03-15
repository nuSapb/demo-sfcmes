import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import { Close as CloseIcon, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, CloudUpload as CloudUploadIcon, Fullscreen as FullscreenIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const ImageGalleryModal = ({ open, onClose, images = [], projectName = '' }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [fullscreenMode, setFullscreenMode] = useState(false);

  const handleUpload = () => {
    // TODO: Implement image upload functionality
    console.log('Upload image clicked');
  };

  const handleFullscreen = () => {
    setFullscreenMode(!fullscreenMode);
  };

  if (!images || images.length === 0) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">ภาพประกอบโครงการ</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 6 }}>
          <CloudUploadIcon sx={{ fontSize: '3rem', color: 'text.secondary', mb: 2 }} />
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            ไม่มีรูปภาพสำหรับโครงการนี้
          </Typography>
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={handleUpload}
            size="small"
          >
            อัพโหลดรูปภาพ
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  const currentImage = images[currentImageIndex];

  const handlePrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile || fullscreenMode}
      PaperProps={{
        sx: {
          borderRadius: isMobile || fullscreenMode ? 0 : 2,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Typography variant="h6">{projectName}</Typography>
          <Typography variant="caption" color="text.secondary">
            รูปภาพ {currentImageIndex + 1} จาก {images.length}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ position: 'relative', overflow: 'hidden' }}>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: isMobile ? '70vh' : '500px',
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            borderRadius: 1,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={currentImage}
              alt={`รูปภาพ ${currentImageIndex + 1}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '8px',
              }}
            />
          </AnimatePresence>

          {images.length > 1 && (
            <>
              <IconButton
                onClick={handlePrevious}
                sx={{
                  position: 'absolute',
                  left: 16,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  },
                }}
              >
                <ChevronLeftIcon />
              </IconButton>

              <IconButton
                onClick={handleNext}
                sx={{
                  position: 'absolute',
                  right: 16,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  },
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', py: 2, px: 3 }}>
        {/* Left: Dot Indicators */}
        {images.length > 1 && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {images.map((_, index) => (
              <Box
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                sx={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: index === currentImageIndex ? 'primary.main' : 'divider',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    transform: 'scale(1.2)',
                  },
                }}
              />
            ))}
          </Box>
        )}

        {/* Right: Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="อัพโหลดรูปภาพ" arrow>
            <Button
              size="small"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={handleUpload}
            >
              อัพโหลด
            </Button>
          </Tooltip>
          <Tooltip title={fullscreenMode ? 'ออกจากโหมดเต็มจอ' : 'ดูแบบเต็มจอ'} arrow>
            <Button
              size="small"
              variant="outlined"
              startIcon={<FullscreenIcon />}
              onClick={handleFullscreen}
            >
              {fullscreenMode ? 'ปกติ' : 'เต็มจอ'}
            </Button>
          </Tooltip>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ImageGalleryModal;
