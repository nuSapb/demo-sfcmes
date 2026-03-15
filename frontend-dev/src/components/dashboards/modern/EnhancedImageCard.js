import { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { styled, alpha, keyframes } from '@mui/material/styles';
import { Image as ImageIcon } from '@mui/icons-material';
import gsap from 'gsap';
import { useParallax } from 'src/hooks/useGsapAnimations';

// Shimmer effect animation
const shimmer = keyframes`
  0% {
    backgroundPosition: -1000px 0;
  }
  100% {
    backgroundPosition: 1000px 0;
  }
`;

const floatUp = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-12px);
  }
`;

const ImageCardContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '120px',
  height: '100px',
  borderRadius: theme.spacing(1),
  border: `2px solid ${theme.palette.divider}`,
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(0.5),
  flexDirection: 'column',
  willChange: 'transform, box-shadow',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    transform: 'translateY(-2px)',
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
}));

const ImageThumbnail = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
  willChange: 'transform',
});

const PlaceholderContainer = styled(Box)(({ theme, isShimmering }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  width: '100%',
  height: '100%',
  justifyContent: 'center',
  background: isShimmering
    ? `linear-gradient(90deg,
        ${alpha(theme.palette.primary.main, 0.1)} 0%,
        ${alpha(theme.palette.primary.main, 0.2)} 50%,
        ${alpha(theme.palette.primary.main, 0.1)} 100%)`
    : 'transparent',
  backgroundSize: '1000px 100%',
  animation: isShimmering ? `${shimmer} 2s infinite` : 'none',
  backgroundPosition: '-1000px 0',
}));

const FloatingIcon = styled(ImageIcon)(() => ({
  fontSize: '1.5rem',
  opacity: 0.5,
  animation: `${floatUp} 3s ease-in-out infinite`,
  willChange: 'transform',
}));

const ImageStack = styled(Box)({
  position: 'absolute',
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const StackedImage = styled('img')(({ index, total }) => {
  const rotation = (index - Math.floor(total / 2)) * 4;
  const offsetY = index * 4;

  return {
    position: 'absolute',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: `rotateZ(${rotation}deg) translateY(${offsetY}px)`,
    transformOrigin: 'center',
    willChange: 'transform',
    boxShadow: `0 ${2 + index}px ${8 + index * 2}px rgba(0, 0, 0, ${0.1 + index * 0.05})`,
  };
});

const EnhancedImageCard = ({ images = [], onClick = () => {}, isLoading = false }) => {
  const containerRef = useRef(null);
  const imageStackRef = useRef(null);
  const [showPlaceholder, setShowPlaceholder] = useState(!images || images.length === 0);

  const childImageRef = useRef(null);
  useParallax(containerRef, childImageRef, { strength: 8 });

  // Fan-out animation for stacked images on hover
  useEffect(() => {
    const container = containerRef.current;
    if (!container || images.length <= 1) return;

    const handleMouseEnter = () => {
      const imageElements = container.querySelectorAll('.stacked-image');
      imageElements.forEach((img, idx) => {
        const angle = (idx - Math.floor(imageElements.length / 2)) * 25;
        const radius = 60;
        const x = Math.cos((angle * Math.PI) / 180) * radius;
        const y = Math.sin((angle * Math.PI) / 180) * radius;

        gsap.to(img, {
          x,
          y,
          rotateZ: angle,
          duration: 0.5,
          ease: 'back.out(1.2)',
          force3D: true,
          willChange: 'transform',
        });
      });
    };

    const handleMouseLeave = () => {
      const imageElements = container.querySelectorAll('.stacked-image');
      imageElements.forEach((img, idx) => {
        const rotation = (idx - Math.floor(imageElements.length / 2)) * 4;
        const offsetY = idx * 4;

        gsap.to(img, {
          x: 0,
          y: offsetY,
          rotateZ: rotation,
          duration: 0.4,
          ease: 'power2.out',
          force3D: true,
        });
      });
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [images.length]);

  const validImages = images.filter((img) => img);
  const hasMultipleImages = validImages.length > 1;

  return (
    <ImageCardContainer
      ref={containerRef}
      onClick={onClick}
      sx={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
      }}
    >
      {hasMultipleImages ? (
        // Stacked images for multi-image case
        <ImageStack ref={imageStackRef}>
          {validImages.slice(0, 3).map((image, idx) => (
            <StackedImage
              key={`stacked-${idx}`}
              className="stacked-image"
              src={image}
              alt={`Image ${idx}`}
              index={idx}
              total={Math.min(validImages.length, 3)}
              onError={(e) => (e.target.style.display = 'none')}
            />
          ))}
        </ImageStack>
      ) : validImages.length > 0 ? (
        // Single image thumbnail
        <ImageThumbnail
          ref={childImageRef}
          src={validImages[0]}
          alt="Project thumbnail"
          onError={(e) => {
            e.target.style.display = 'none';
            setShowPlaceholder(true);
          }}
        />
      ) : null}

      {showPlaceholder && (
        <PlaceholderContainer isShimmering={isLoading}>
          <FloatingIcon />
          <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.6 }}>
            No image
          </Typography>
        </PlaceholderContainer>
      )}
    </ImageCardContainer>
  );
};

EnhancedImageCard.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string),
  onClick: PropTypes.func,
  isLoading: PropTypes.bool,
};

EnhancedImageCard.defaultProps = {
  images: [],
  onClick: () => {},
  isLoading: false,
};

export default EnhancedImageCard;
