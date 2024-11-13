// Define the type for styles
interface StyleOptions {
  blurRadius?: number
  brightness?: number
  contrast?: number
  opacity?: number
  gradientType?: 'linear' | 'radial'
  gradientRotation?: number
  gradientStart?: string
  gradientEnd?: string
  shadowOffsetX?: number
  shadowOffsetY?: number
  shadowBlur?: number
  shadowColor?: string
}

// Generate filter string
export function generateFilterString(styles: StyleOptions) {
  const filters = []
  if (styles.blurRadius) filters.push(`blur(${styles.blurRadius}px)`)
  if (styles.brightness !== undefined && styles.brightness !== 100) filters.push(`brightness(${styles.brightness}%)`)
  if (styles.contrast !== undefined && styles.contrast !== 100) filters.push(`contrast(${styles.contrast}%)`)
  if (styles.opacity !== undefined && styles.opacity !== 100) filters.push(`opacity(${styles.opacity}%)`)
  return filters.join(' ')
}

// Generate gradient
export function generateGradient(styles: StyleOptions) {
  if (styles.gradientType === 'linear') {
    return `linear-gradient(${styles.gradientRotation}deg, ${styles.gradientStart}, ${styles.gradientEnd})`
  }
  if (styles.gradientType === 'radial') {
    return `radial-gradient(circle, ${styles.gradientStart}, ${styles.gradientEnd})`
  }
  return 'none'
}

// Generate box shadow
export function generateBoxShadow(styles: StyleOptions) {
  if (styles.shadowBlur) {
    return `${styles.shadowOffsetX}px ${styles.shadowOffsetY}px ${styles.shadowBlur}px ${styles.shadowColor}`
  }
  return 'none'
}
