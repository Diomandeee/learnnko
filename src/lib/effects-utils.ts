interface StyleConfig {
  style: {
    blurRadius?: number;
    brightness?: number;
    contrast?: number;
    opacity?: number;
    gradientType?: 'linear' | 'radial';
    gradientRotation?: number;
    gradientStart?: string;
    gradientEnd?: string;
    borderWidth?: number;
    borderColor?: string;
    borderRadius?: number;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    shadowColor?: string;
    blendMode?: string;
    padding?: number;
  };
}

export const getComputedStyles = (config: StyleConfig) => {
  const styles = {
    filter: '',
    background: '',
    border: '',
    borderRadius: '',
    boxShadow: '',
    mixBlendMode: '',
    padding: '',
    transform: '',
  };

  // Apply filters
  const filters = [];
  if (config.style.blurRadius) filters.push(`blur(${config.style.blurRadius}px)`);
  if (config.style.brightness && config.style.brightness !== 100) filters.push(`brightness(${config.style.brightness}%)`);
  if (config.style.contrast && config.style.contrast !== 100) filters.push(`contrast(${config.style.contrast}%)`);
  if (config.style.opacity && config.style.opacity !== 100) filters.push(`opacity(${config.style.opacity}%)`);
  styles.filter = filters.join(' ');

  // Apply gradient or background
  if (config.style.gradientType === 'linear') {
    styles.background = `linear-gradient(${config.style.gradientRotation}deg, ${config.style.gradientStart}, ${config.style.gradientEnd})`;
  } else if (config.style.gradientType === 'radial') {
    styles.background = `radial-gradient(circle, ${config.style.gradientStart}, ${config.style.gradientEnd})`;
  }

  // Apply border
  if (config.style.borderWidth) {
    styles.border = `${config.style.borderWidth}px solid ${config.style.borderColor}`;
    styles.borderRadius = `${config.style.borderRadius}px`;
  }

  // Apply shadow
  if (config.style.shadowBlur) {
    styles.boxShadow = `${config.style.shadowOffsetX}px ${config.style.shadowOffsetY}px ${config.style.shadowBlur}px ${config.style.shadowColor}`;
  }

  // Apply blend mode
  if (config.style.blendMode) {
    styles.mixBlendMode = config.style.blendMode;
  }

  // Apply padding
  styles.padding = `${config.style.padding || 0}px`;

  return styles;
};
