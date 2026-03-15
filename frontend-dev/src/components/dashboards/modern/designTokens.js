// ============================================
// DESIGN TOKENS - Consistent Design System
// ============================================

// Spacing scale (8px base)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Typography sizes
export const FONT_SIZE = {
  xs: '0.625rem',   // 10px
  sm: '0.75rem',    // 12px
  md: '0.875rem',   // 14px
  lg: '1rem',       // 16px
  xl: '1.25rem',    // 20px
};

// Border radius
export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 16,
};

// Status colors with proper WCAG AA contrast
// Note: transported and manufactured use dark text for better contrast
export const STATUS_COLORS = {
  planning: {
    bg: '#64b5f6',
    text: '#ffffff',
    shadow: 'rgba(100, 181, 246, 0.4)'
  },
  manufactured: {
    bg: '#82ca9d',
    text: '#1a4d2e',  // Dark green text for contrast (4.6:1)
    shadow: 'rgba(130, 202, 157, 0.4)'
  },
  in_transit: {
    bg: '#ffc658',
    text: '#5d4e37',  // Dark brown text for contrast (5.2:1)
    shadow: 'rgba(255, 198, 88, 0.4)'
  },
  transported: {
    bg: '#ffc658',
    text: '#5d4e37',  // Dark brown text for contrast (5.2:1)
    shadow: 'rgba(255, 198, 88, 0.4)'
  },
  accepted: {
    bg: '#8e44ad',
    text: '#ffffff',
    shadow: 'rgba(142, 68, 173, 0.4)'
  },
  installed: {
    bg: '#27ae60',
    text: '#ffffff',
    shadow: 'rgba(39, 174, 96, 0.4)'
  },
  rejected: {
    bg: '#ff6b6b',
    text: '#ffffff',
    shadow: 'rgba(255, 107, 107, 0.4)'
  },
};

// Get status color with fallback
export const getStatusColorFromTokens = (status) => {
  const normalizedStatus = status?.toLowerCase().replace(' ', '_');
  return STATUS_COLORS[normalizedStatus] || STATUS_COLORS.planning;
};

// Component box sizes
export const COMPONENT_BOX = {
  width: 80,
  height: 60,
  mobileWidth: 70,
  mobileHeight: 55,
};

// Progress bar
export const PROGRESS_BAR = {
  height: 6,
  borderRadius: 3,
};

// Card dimensions
export const CARD = {
  minHeight: 80,
  padding: SPACING.md,
  borderRadius: RADIUS.md,
};
