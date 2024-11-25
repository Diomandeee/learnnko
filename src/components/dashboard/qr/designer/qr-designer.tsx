"use client"

import React, { useState, useEffect, useRef } from 'react'
import { QRCode } from './qr-wrapper'
import { TabsList, TabsTrigger, Tabs, TabsContent } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { ChromePicker } from 'react-color'
import { StyleControls } from './style-controls'
import { LogoControls } from './logo-controls'
import { QRDownloadButton } from './qr-download-button'
import { 
  QRDesignerProps, 
  QRDotType,
  ErrorCorrectionLevel,
  DEFAULT_CONFIG,
  QRDesignerConfig
} from './types'
import { toast } from '@/components/ui/use-toast'
import { Grid } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import styles from './styles.module.css'

export function QRDesigner({ 
  value, 
  onConfigChange, 
  defaultConfig, 
  className 
}: QRDesignerProps) {
  const [config, setConfig] = useState<QRDesignerConfig>(() => ({
    ...DEFAULT_CONFIG,
    ...defaultConfig,
  }))
  const [showFgPicker, setShowFgPicker] = useState(false)
  const [showBgPicker, setShowBgPicker] = useState(false)
  const [showLogoBgPicker, setShowLogoBgPicker] = useState(false)
  const [previewScale, setPreviewScale] = useState(1)
  const [showGrid, setShowGrid] = useState(true)
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
  const [originalAspectRatio, setOriginalAspectRatio] = useState(1)
  const qrRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    onConfigChange?.(config)
  }, [config, onConfigChange])

  useEffect(() => {
    if (config.logoImage && !config.logoStyle) {
      setConfig(prev => ({
        ...prev,
        logoStyle: {
          ...DEFAULT_CONFIG.logoStyle,
          rotation: 0,
          blurRadius: 0,
          brightness: 100,
          contrast: 100,
          opacity: 100,
          borderWidth: 0,
          borderRadius: 0,
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          backgroundColor: 'transparent',
          removeBackground: true,
          blend: false,
          blendMode: 'normal',
          position: 'center',
          scale: 1,
        }
      }))
    }
  }, [config.logoImage])

  const generateFilterString = () => {
    const filters = []
    if (config.style.blurRadius) filters.push(`blur(${config.style.blurRadius}px)`)
    if (config.style.brightness !== 100) filters.push(`brightness(${config.style.brightness}%)`)
    if (config.style.contrast !== 100) filters.push(`contrast(${config.style.contrast}%)`)
    if (config.style.opacity !== 100) filters.push(`opacity(${config.style.opacity}%)`)
    return filters.join(' ')
  }

  const generateBackground = () => {
    if (config.style.gradientType === 'linear') {
      return `linear-gradient(${config.style.gradientRotation}deg, ${config.style.gradientStart}, ${config.style.gradientEnd})`
    }
    if (config.style.gradientType === 'radial') {
      return `radial-gradient(circle, ${config.style.gradientStart}, ${config.style.gradientEnd})`
    }
    return config.backgroundColor
  }

  const getQrStyles = () => ({
    filter: generateFilterString(),
    background: generateBackground(),
    borderRadius: `${config.style.borderRadius}px`,
    border: config.style.borderWidth ? `${config.style.borderWidth}px solid ${config.style.borderColor}` : undefined,
    boxShadow: config.style.shadowBlur ? 
      `${config.style.shadowOffsetX}px ${config.style.shadowOffsetY}px ${config.style.shadowBlur}px ${config.style.shadowColor}` : 
      undefined,
    mixBlendMode: config.style.blend ? config.style.blendMode : undefined,
    padding: `${config.style.padding}px`,
    transform: `scale(${previewScale})`,
    transformOrigin: 'center',
    transition: 'all 0.3s ease',
  })

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
  
    try {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Logo image must be smaller than 2MB",
          variant: "destructive",
        })
        return
      }
  
      const reader = new FileReader()
      
      reader.onloadend = () => {
        const img = new Image()
        
        img.onload = () => {
          const aspectRatio = img.width / img.height
          setOriginalAspectRatio(aspectRatio)
          const defaultSize = Math.min(100, config.size / 3)
          
          setConfig(prev => ({
            ...prev,
            logoImage: reader.result as string,
            logoWidth: defaultSize,
            logoHeight: maintainAspectRatio ? Math.round(defaultSize / aspectRatio) : defaultSize,
            logoStyle: {
              ...DEFAULT_CONFIG.logoStyle,
              scale: 1,
            }
          }))
        }
  
        img.src = reader.result as string
      }
  
      reader.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to load image",
          variant: "destructive",
        })
      }
  
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      })
    }
  }

  return (
    <div className={className}>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className={styles.preview} style={{ background: config.backgroundColor }}>
                {showGrid && <div className={styles.grid} />}
                <div ref={qrRef} className={styles.wrapper} style={getQrStyles()}>
                  <QRCode
                    value={value}
                    size={config.size}
                    bgColor={config.backgroundColor}
                    fgColor={config.foregroundColor}
                    level={config.errorCorrectionLevel}
                    logoImage={config.logoImage}
                    logoWidth={config.logoWidth}
                    logoHeight={config.logoHeight}
                    logoStyle={config.logoStyle}
                    imageStyle={{ display: "block" }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            <QRDownloadButton qrRef={qrRef} format="svg" />
            <QRDownloadButton qrRef={qrRef} format="png" />
            <Button variant="outline" onClick={() => setShowGrid(!showGrid)}>
              <Grid className="mr-2 h-4 w-4" />
              {showGrid ? 'Hide' : 'Show'} Grid
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Preview Scale: {Math.round(previewScale * 100)}%</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewScale(1)}
              >
                Reset
              </Button>
            </div>
            <Slider
              value={[previewScale]}
              min={0.5}
              max={2}
              step={0.1}
              onValueChange={([value]) => setPreviewScale(value)}
            />
          </div>
        </div>

        <Tabs defaultValue="style" className="space-y-4">
          <TabsList>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="logo">Logo</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="effects">Effects</TabsTrigger>
          </TabsList>

          <TabsContent value="style">
            <StyleControls
              value={config.style}
              onChange={(style) => {
                setConfig(prev => ({ ...prev, style }))
              }}
            />
          </TabsContent>

          <TabsContent value="logo">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Logo Image</Label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose Logo Image
                  </Button>
                  {config.logoImage && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setConfig(prev => ({
                          ...prev,
                          logoImage: undefined,
                          logoWidth: DEFAULT_CONFIG.logoWidth,
                          logoHeight: DEFAULT_CONFIG.logoHeight,
                          logoStyle: DEFAULT_CONFIG.logoStyle
                        }))
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                {config.logoImage && (
                  <img 
                    src={config.logoImage} 
                    alt="Logo preview" 
                    className="h-16 object-contain border rounded-md p-2"
                  />
                )}
              </div>

              {config.logoImage && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Remove Background</Label>
                    <Switch
                      checked={config.logoStyle?.removeBackground}
                      onCheckedChange={(checked) => {
                        setConfig(prev => ({
                          ...prev,
                          logoStyle: {
                            ...prev.logoStyle,
                            removeBackground: checked,
                          }
                        }))
                      }}
                    />
                  </div>

                  {!config.logoStyle?.removeBackground && (
                    <div className="space-y-2">
                      <Label>Background Color</Label>
                      <div className="relative">
                        <div
                          className="h-10 rounded-md border cursor-pointer"
                          style={{ backgroundColor: config.logoStyle?.backgroundColor }}
                          onClick={() => setShowLogoBgPicker(!showLogoBgPicker)}
                        />
                        {showLogoBgPicker && (
                          <div className="absolute z-10">
                            <div 
                              className="fixed inset-0" 
                              onClick={() => setShowLogoBgPicker(false)}
                            />
                            <ChromePicker
                              color={config.logoStyle?.backgroundColor}
                              onChange={color => {
                                setConfig(prev => ({
                                  ...prev,
                                  logoStyle: {
                                    ...prev.logoStyle,
                                    backgroundColor: color.hex,
                                  }
                                }))
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <LogoControls
                    value={config.logoStyle}
                    onChange={(logoStyle) => {
                      setConfig(prev => ({ ...prev, logoStyle }))
                    }}
                    logoWidth={config.logoWidth}
                    logoHeight={config.logoHeight}
                    onLogoSizeChange={(width, height) => {
                      setConfig(prev => ({
                        ...prev,
                        logoWidth: width,
                        logoHeight: height
                      }))
                    }}
                    maintainAspectRatio={maintainAspectRatio}
                    onAspectRatioChange={setMaintainAspectRatio}
                    originalAspectRatio={originalAspectRatio}
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="colors">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Foreground Color</Label>
                <div className="relative">
                  <div
                    className="h-10 rounded-md border cursor-pointer"
                    style={{ backgroundColor: config.foregroundColor }}
                    onClick={() => setShowFgPicker(!showFgPicker)}
                  />
                  {showFgPicker && (
                    <>
                      <div
                        className="fixed inset-0"
                        onClick={() => setShowFgPicker(false)}
                      />
                      <div className="absolute z-10">
                        <ChromePicker
                          color={config.foregroundColor}
                          onChange={color => 
                            setConfig(prev => ({ 
                              ...prev, 
                              foregroundColor: color.hex 
                            }))
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Background Color</Label>
                <div className="relative">
                  <div
                    className="h-10 rounded-md border cursor-pointer"
                    style={{ backgroundColor: config.backgroundColor }}
                    onClick={() => setShowBgPicker(!showBgPicker)}
                  />
                  {showBgPicker && (
                    <>
                      <div
                        className="fixed inset-0"
                        onClick={() => setShowBgPicker(false)}
                      />
                      <div className="absolute z-10">
                        <ChromePicker
                          color={config.backgroundColor}
                          onChange={color => 
                            setConfig(prev => ({ 
                              ...prev, 
                              backgroundColor: color.hex 
                            }))
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="effects">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>QR Code Size: {config.size}px</Label>
                <Slider
value={[config.size]}
min={100}
max={1000}
step={10}
onValueChange={([value]) => 
  setConfig(prev => ({ ...prev, size: value }))
}
/>
</div>

<div className="space-y-2">
<Label>Error Correction Level</Label>
<Select
value={config.errorCorrectionLevel}
onValueChange={(value: ErrorCorrectionLevel) => {
  console.log('Selected error correction level:', value);
  setConfig(prev => ({ 
    ...prev, 
    errorCorrectionLevel: value 
  }))
}}
>
<SelectTrigger>
  <SelectValue />
</SelectTrigger>
<SelectContent>
  <SelectItem value="L">Low (7%)</SelectItem>
  <SelectItem value="M">Medium (15%)</SelectItem>
  <SelectItem value="Q">Quartile (25%)</SelectItem>
  <SelectItem value="H">High (30%)</SelectItem>
</SelectContent>
</Select>
</div>

<div className="space-y-2">
<Label>Margin: {config.style.padding}px</Label>
<Slider
value={[config.style.padding]}
min={0}
max={50}
step={1}
onValueChange={([value]) => 
  setConfig(prev => ({
    ...prev,
    style: { ...prev.style, padding: value }
  }))
}
/>
</div>

<div className="space-y-2">
<Label>Quality</Label>
<Select
value={config.dotStyle}
onValueChange={(value: QRDotType) => 
  setConfig(prev => ({ 
    ...prev, 
    dotStyle: value 
  }))
}
>
<SelectTrigger>
  <SelectValue />
</SelectTrigger>
<SelectContent>
  <SelectItem value="squares">Squares</SelectItem>
  <SelectItem value="dots">Dots</SelectItem>
  <SelectItem value="rounded">Rounded</SelectItem>
  <SelectItem value="classy">Classy</SelectItem>
  <SelectItem value="classy-rounded">Classy Rounded</SelectItem>
  <SelectItem value="extra-rounded">Extra Rounded</SelectItem>
</SelectContent>
</Select>
</div>
</div>
</TabsContent>
</Tabs>
</div>
</div>
)
}