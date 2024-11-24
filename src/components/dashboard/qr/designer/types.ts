export type BlendMode = 
  | 'normal' 
  | 'multiply' 
  | 'screen' 
  | 'overlay' 
  | 'darken' 
  | 'lighten' 
  | 'color-dodge' 
  | 'color-burn' 
  | 'hard-light' 
  | 'soft-light' 
  | 'difference' 
  | 'exclusion'

export type PresetPosition = 
  | 'center' 
  | 'top-left' 
  | 'top-right' 
  | 'bottom-left' 
  | 'bottom-right'

export interface CustomPosition {
  x: number
  y: number
}

export type LogoPosition = PresetPosition | CustomPosition

export interface QRStyleOptions {
  opacity: number
  blurRadius: number
  brightness: number
  contrast: number
  borderRadius: number
  borderWidth: number
  borderColor: string
  shadowColor: string
  shadowBlur: number
  shadowOffsetX: number
  shadowOffsetY: number
  gradientType: 'none' | 'linear' | 'radial'
  gradientStart: string
  gradientEnd: string
  gradientRotation: number
  padding: number
  blend: boolean
  blendMode: BlendMode
}

export interface LogoStyleOptions {
  opacity: number
  blurRadius: number
  brightness: number
  contrast: number
  borderRadius: number
  borderWidth: number
  borderColor: string
  shadowColor: string
  shadowBlur: number
  shadowOffsetX: number
  shadowOffsetY: number
  padding: number
  backgroundColor: string
  removeBackground: boolean
  position: LogoPosition
  customPosition?: CustomPosition
  rotation: number
  blend: boolean
  blendMode: BlendMode
  scale: number
  isDragging?: boolean
}

export type QRDotType = 'squares' | 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'extra-rounded'
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

export interface QRDesignerConfig {
  size: number
  backgroundColor: string
  foregroundColor: string
  logoImage?: string
  logoWidth: number
  logoHeight: number
  dotStyle: QRDotType
  margin: number
  errorCorrectionLevel: ErrorCorrectionLevel
  style: QRStyleOptions
  logoStyle: LogoStyleOptions
  imageRendering: 'auto' | 'crisp-edges' | 'pixelated'
}

export interface QRDesignerProps {
  value: string
  onConfigChange?: (config: QRDesignerConfig) => void
  defaultConfig?: Partial<QRDesignerConfig>
  className?: string
}

export interface StyleControlsProps {
  value: QRStyleOptions
  onChange: (value: QRStyleOptions) => void
  title?: string
}

export interface LogoControlsProps {
  value: LogoStyleOptions
  onChange: (value: LogoStyleOptions) => void
  logoWidth: number
  logoHeight: number
  onLogoSizeChange: (width: number, height: number) => void
  maintainAspectRatio: boolean
  onAspectRatioChange: (maintain: boolean) => void
  originalAspectRatio: number
}

export interface QRWrapperProps {
  value: string
  size: number
  bgColor: string
  fgColor: string
  level: ErrorCorrectionLevel
  logoImage?: string
  logoWidth?: number
  logoHeight?: number
  logoStyle?: LogoStyleOptions
  className?: string
  containerStyle?: React.CSSProperties
  imageStyle?: React.CSSProperties
  onDragStart?: () => void
  onDragEnd?: () => void
}

export const DEFAULT_CONFIG: QRDesignerConfig = {
  size: 300,
  backgroundColor: '#FFFFFF',
  foregroundColor: '#000000',
  logoWidth: 100,
  logoHeight: 100,
  dotStyle: 'squares',
  margin: 20,
  errorCorrectionLevel: 'M',
  imageRendering: 'auto',
  style: {
    opacity: 100,
    blurRadius: 0,
    brightness: 100,
    contrast: 100,
    borderRadius: 0,
    borderWidth: 0,
    borderColor: '#000000',
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    gradientType: 'none',
    gradientStart: '#000000',
    gradientEnd: '#FFFFFF',
    gradientRotation: 0,
    padding: 0,
    blend: false,
    blendMode: 'normal'
  },
  logoStyle: {
    opacity: 100,
    blurRadius: 0,
    brightness: 100,
    contrast: 100,
    borderRadius: 0,
    borderWidth: 0,
    borderColor: '#000000',
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    padding: 0,
    backgroundColor: '#FFFFFF',
    removeBackground: false,
    position: 'center',
    customPosition: { x: 0, y: 0 },
    rotation: 0,
    blend: false,
    blendMode: 'normal',
    scale: 1,
    isDragging: false
  }
}

// Helper functions
export const isPresetPosition = (position: LogoPosition): position is PresetPosition => {
  return typeof position === 'string';
}

export const isCustomPosition = (position: LogoPosition): position is CustomPosition => {
  return typeof position === 'object' && 'x' in position && 'y' in position;
}

export const getPositionStyle = (position: LogoPosition): React.CSSProperties => {
  if (isPresetPosition(position)) {
    switch (position) {
      case 'center':
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
      case 'top-left':
        return { top: '10%', left: '10%', transform: 'translate(-50%, -50%)' }
      case 'top-right':
        return { top: '10%', right: '10%', transform: 'translate(50%, -50%)' }
      case 'bottom-left':
        return { bottom: '10%', left: '10%', transform: 'translate(-50%, 50%)' }
      case 'bottom-right':
        return { bottom: '10%', right: '10%', transform: 'translate(50%, 50%)' }
      default:
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    }
  }

  return {
    top: `${position.y}%`,
    left: `${position.x}%`,
    transform: 'translate(-50%, -50%)'
  }
}
