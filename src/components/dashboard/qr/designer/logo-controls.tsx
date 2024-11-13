"use client"

import React, { useState } from "react"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { ChromePicker } from 'react-color'
import { LogoControlsProps, LogoPosition, BlendMode } from './types'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const LOGO_POSITIONS: { value: LogoPosition; label: string }[] = [
  { value: 'center', label: 'Center' },
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-right', label: 'Bottom Right' },
]

const BLEND_MODES: BlendMode[] = [
  'normal',
  'multiply',
  'screen',
  'overlay',
  'darken',
  'lighten',
  'color-dodge',
  'color-burn',
  'hard-light',
  'soft-light',
  'difference',
  'exclusion'
]

export function LogoControls({
  value,
  onChange,
  logoWidth,
  logoHeight,
  onLogoSizeChange,
  maintainAspectRatio,
  onAspectRatioChange,
  originalAspectRatio,
}: LogoControlsProps) {
  const [showBorderColor, setShowBorderColor] = useState(false)
  const [showShadowColor, setShowShadowColor] = useState(false)

  const updateStyle = (updates: Partial<typeof value>) => {
    onChange({
      ...value,
      ...updates,
      // Ensure numeric values are properly converted
      rotation: typeof updates.rotation === 'number' ? updates.rotation : value.rotation,
      blurRadius: typeof updates.blurRadius === 'number' ? updates.blurRadius : value.blurRadius,
      brightness: typeof updates.brightness === 'number' ? updates.brightness : value.brightness,
      contrast: typeof updates.contrast === 'number' ? updates.contrast : value.contrast,
      opacity: typeof updates.opacity === 'number' ? updates.opacity : value.opacity,
      borderWidth: typeof updates.borderWidth === 'number' ? updates.borderWidth : value.borderWidth,
      borderRadius: typeof updates.borderRadius === 'number' ? updates.borderRadius : value.borderRadius,
      shadowBlur: typeof updates.shadowBlur === 'number' ? updates.shadowBlur : value.shadowBlur,
      shadowOffsetX: typeof updates.shadowOffsetX === 'number' ? updates.shadowOffsetX : value.shadowOffsetX,
      shadowOffsetY: typeof updates.shadowOffsetY === 'number' ? updates.shadowOffsetY : value.shadowOffsetY,
    })
  }

  return (
    <Accordion type="single" collapsible defaultValue="size" className="w-full">
      <AccordionItem value="size">
        <AccordionTrigger>Size & Position</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Maintain Aspect Ratio</Label>
              <Switch
                checked={maintainAspectRatio}
                onCheckedChange={onAspectRatioChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Width: {logoWidth}px</Label>
              <Slider
                value={[logoWidth]}
                min={20}
                max={300}
                step={1}
                onValueChange={([width]) => {
                  if (maintainAspectRatio) {
                    const height = Math.round(width / originalAspectRatio)
                    onLogoSizeChange(width, height)
                  } else {
                    onLogoSizeChange(width, logoHeight)
                  }
                }}
              />
            </div>

            {!maintainAspectRatio && (
              <div className="space-y-2">
                <Label>Height: {logoHeight}px</Label>
                <Slider
                  value={[logoHeight]}
                  min={20}
                  max={300}
                  step={1}
                  onValueChange={([height]) => onLogoSizeChange(logoWidth, height)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Position</Label>
              <Select 
                value={value.position}
                onValueChange={(v) => updateStyle({ position: v as LogoPosition })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOGO_POSITIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Rotation: {value.rotation}°</Label>
              <Slider
                value={[value.rotation]}
                min={0}
                max={360}
                step={1}
                onValueChange={([v]) => updateStyle({ rotation: v })}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="effects">
        <AccordionTrigger>Effects</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Opacity: {value.opacity}%</Label>
              <Slider
                value={[value.opacity]}
                min={0}
                max={100}
                step={1}
                onValueChange={([v]) => updateStyle({ opacity: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Blur: {value.blurRadius}px</Label>
              <Slider
                value={[value.blurRadius]}
                min={0}
                max={20}
                step={0.5}
                onValueChange={([v]) => updateStyle({ blurRadius: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Brightness: {value.brightness}%</Label>
              <Slider
                value={[value.brightness]}
                min={0}
                max={200}
                step={1}
                onValueChange={([v]) => updateStyle({ brightness: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Contrast: {value.contrast}%</Label>
              <Slider
                value={[value.contrast]}
                min={0}
                max={200}
                step={1}
                onValueChange={([v]) => updateStyle({ contrast: v })}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="border">
        <AccordionTrigger>Border</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Border Width: {value.borderWidth}px</Label>
              <Slider
                value={[value.borderWidth]}
                min={0}
                max={20}
                step={1}
                onValueChange={([v]) => updateStyle({ borderWidth: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Border Radius: {value.borderRadius}px</Label>
              <Slider
                value={[value.borderRadius]}
                min={0}
                max={50}
                step={1}
                onValueChange={([v]) => updateStyle({ borderRadius: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Border Color</Label>
              <div className="relative">
                <div
                  className="w-full h-10 rounded-md border cursor-pointer"
                  style={{ backgroundColor: value.borderColor }}
                  onClick={() => setShowBorderColor(!showBorderColor)}
                />
                {showBorderColor && (
                  <div className="absolute z-10">
                    <div 
                      className="fixed inset-0" 
                      onClick={() => setShowBorderColor(false)} 
                    />
                    <ChromePicker
                      color={value.borderColor}
                      onChange={(color) => updateStyle({ borderColor: color.hex })}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="shadow">
        <AccordionTrigger>Shadow</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Shadow Color</Label>
              <div className="relative">
                <div
                  className="w-full h-10 rounded-md border cursor-pointer"
                  style={{ backgroundColor: value.shadowColor }}
                  onClick={() => setShowShadowColor(!showShadowColor)}
                />
                {showShadowColor && (
                  <div className="absolute z-10">
                    <div 
                      className="fixed inset-0" 
                      onClick={() => setShowShadowColor(false)} 
                    />
                    <ChromePicker
                      color={value.shadowColor}
                      onChange={(color) => updateStyle({ shadowColor: color.hex })}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Shadow Blur: {value.shadowBlur}px</Label>
              <Slider
                value={[value.shadowBlur]}
                min={0}
                max={50}
                step={1}
                onValueChange={([v]) => updateStyle({ shadowBlur: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Shadow Offset X: {value.shadowOffsetX}px</Label>
              <Slider
                value={[value.shadowOffsetX]}
                min={-50}
                max={50}
                step={1}
                onValueChange={([v]) => updateStyle({ shadowOffsetX: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Shadow Offset Y: {value.shadowOffsetY}px</Label>
              <Slider
                value={[value.shadowOffsetY]}
                min={-50}
                max={50}
                step={1}
                onValueChange={([v]) => updateStyle({ shadowOffsetY: v })}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="blend">
        <AccordionTrigger>Blend Mode</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Blending</Label>
              <Switch
                checked={value.blend}
                onCheckedChange={(checked) => updateStyle({ blend: checked })}
              />
            </div>

            {value.blend && (
              <div className="space-y-2">
                <Label>Blend Mode</Label>
                <Select
                  value={value.blendMode}
                  onValueChange={(v) => updateStyle({ blendMode: v as BlendMode })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BLEND_MODES.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {mode.split('-').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
