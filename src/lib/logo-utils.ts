import { LogoPosition } from '../components/dashboard/qr/designer/types'

// Define types for config and style
interface LogoStyleConfig {
  logoWidth: number
  logoHeight: number
  logoStyle: {
    position: LogoPosition
    borderRadius?: number
    borderWidth?: number
    borderColor?: string
    shadowOffsetX?: number
    shadowOffsetY?: number
    shadowBlur?: number
    shadowColor?: string
    backgroundColor?: string
    removeBackground?: boolean
    opacity: number
    rotation: number
    blendMode?: string
    blurRadius?: number
    brightness?: number
    contrast?: number
  }
}

interface LogoFilterStyle {
  blurRadius?: number
  brightness?: number
  contrast?: number
}

export const getLogoPosition = (position: LogoPosition) => {
  switch (position) {
    case 'center':
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }
    case 'top-left':
      return {
        top: '10%',
        left: '10%',
        transform: 'translate(-50%, -50%)'
      }
    case 'top-right':
      return {
        top: '10%',
        right: '10%',
        transform: 'translate(50%, -50%)'
      }
    case 'bottom-left':
      return {
        bottom: '10%',
        left: '10%',
        transform: 'translate(-50%, 50%)'
      }
    case 'bottom-right':
      return {
        bottom: '10%',
        right: '10%',
        transform: 'translate(50%, 50%)'
      }
    default:
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }
  }
}

export const generateLogoStyles = (config: LogoStyleConfig) => {
  return {
    ...getLogoPosition(config.logoStyle.position),
    width: `${config.logoWidth}px`,
    height: `${config.logoHeight}px`,
    filter: generateLogoFilterString(config.logoStyle),
    borderRadius: config.logoStyle.borderRadius ? `${config.logoStyle.borderRadius}px` : undefined,
    border: config.logoStyle.borderWidth ? `${config.logoStyle.borderWidth}px solid ${config.logoStyle.borderColor}` : undefined,
    boxShadow: config.logoStyle.shadowBlur ? `${config.logoStyle.shadowOffsetX}px ${config.logoStyle.shadowOffsetY}px ${config.logoStyle.shadowBlur}px ${config.logoStyle.shadowColor}` : undefined,
    backgroundColor: config.logoStyle.removeBackground ? 'transparent' : config.logoStyle.backgroundColor,
    opacity: config.logoStyle.opacity / 100,
    transform: `${getLogoPosition(config.logoStyle.position).transform} rotate(${config.logoStyle.rotation}deg)`,
    mixBlendMode: config.logoStyle.blendMode || undefined,
  }
}

const generateLogoFilterString = (style: LogoFilterStyle) => {
  const filters = []
  if (style.blurRadius) filters.push(`blur(${style.blurRadius}px)`)
  if (style.brightness !== undefined && style.brightness !== 100) filters.push(`brightness(${style.brightness}%)`)
  if (style.contrast !== undefined && style.contrast !== 100) filters.push(`contrast(${style.contrast}%)`)
  return filters.join(' ')
}
