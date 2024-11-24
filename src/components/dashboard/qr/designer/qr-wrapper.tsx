"use client"

import { QRCodeCanvas } from 'qrcode.react'
import { forwardRef, useState } from 'react'
import { cn } from "@/lib/utils"
import { QRWrapperProps } from './types'
import Image from 'next/image'

export const QRCode = forwardRef<HTMLDivElement, QRWrapperProps>((props, ref) => {
  const {
    className,
    containerStyle,
    imageStyle,
    logoImage,
    logoWidth,
    logoHeight,
    logoStyle,
    ...qrProps
  } = props
  
  const [logoError, setLogoError] = useState(false)

  const getLogoFilterString = () => {
    const filters = []
    if (logoStyle?.blurRadius) filters.push(`blur(${logoStyle.blurRadius}px)`)
    if (logoStyle?.brightness !== 100) filters.push(`brightness(${logoStyle?.brightness ?? 100}%)`)
    if (logoStyle?.contrast !== 100) filters.push(`contrast(${logoStyle?.contrast ?? 100}%)`)
    return filters.join(' ')
  }

  const getLogoShadow = () => {
    if (logoStyle?.shadowBlur) {
      return `${logoStyle.shadowOffsetX}px ${logoStyle.shadowOffsetY}px ${logoStyle.shadowBlur}px ${logoStyle.shadowColor}`
    }
    return 'none'
  }

  const getLogo = () => {
    if (!logoImage || logoError) return null

    return (
      <div
        className="absolute"
        style={{
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) rotate(${logoStyle?.rotation || 0}deg)`,
          width: logoWidth,
          height: logoHeight,
          zIndex: logoStyle?.blend ? 1 : 2,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <Image
          src={logoImage}
          alt="QR Logo"
          width={logoWidth}
          height={logoHeight}
          onError={() => setLogoError(true)}
          className="w-full h-full object-contain"
          style={{
            borderRadius: `${logoStyle?.borderRadius || 0}px`,
            border: logoStyle?.borderWidth ? 
              `${logoStyle.borderWidth}px solid ${logoStyle.borderColor}` : 
              undefined,
            boxShadow: getLogoShadow(),
            filter: getLogoFilterString(),
            opacity: (logoStyle?.opacity || 100) / 100,
            mixBlendMode: logoStyle?.blend ? logoStyle.blendMode : 'normal',
            backgroundColor: logoStyle?.removeBackground ? 
              'transparent' : 
              logoStyle?.backgroundColor,
          }}
        />
      </div>
    )
  }
  
  return (
    <div 
      ref={ref}
      className={cn("relative", className)}
      style={{
        width: props.size,
        height: props.size,
        ...containerStyle
      }}
    >
      <QRCodeCanvas
        {...qrProps}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          ...imageStyle
        }}
      />
      {getLogo()}
    </div>
  )
})

QRCode.displayName = 'QRCode'

export default QRCode
