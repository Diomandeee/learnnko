"use client"

import React, { useState } from "react"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { ChromePicker } from 'react-color'
import { StyleControlsProps, BlendMode } from './types'
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

export function StyleControls({ value, onChange }: StyleControlsProps) {
  const [showGradientStartPicker, setShowGradientStartPicker] = useState(false)
  const [showGradientEndPicker, setShowGradientEndPicker] = useState(false)
  const [showShadowColorPicker, setShowShadowColorPicker] = useState(false)
  const [showBorderColorPicker, setShowBorderColorPicker] = useState(false)

  const updateStyle = (updates: Partial<StyleControlsProps['value']>) => {
    onChange({ ...value, ...updates })
  }

  const handleClickOutside = () => {
    setShowGradientStartPicker(false)
    setShowGradientEndPicker(false)
    setShowShadowColorPicker(false)
    setShowBorderColorPicker(false)
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="basic">
        <AccordionTrigger>Basic Effects</AccordionTrigger>
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

      <AccordionItem value="shadow">
        <AccordionTrigger>Shadow</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Shadow Color</Label>
              <div className="relative">
                <div
                  className="h-10 rounded-md border cursor-pointer"
                  style={{ backgroundColor: value.shadowColor }}
                  onClick={() => setShowShadowColorPicker(true)}
                />
                {showShadowColorPicker && (
                  <>
                    <div className="fixed inset-0" onClick={handleClickOutside} />
                    <div className="absolute z-10">
                      <ChromePicker
                        color={value.shadowColor}
                        onChange={color => updateStyle({ shadowColor: color.hex })}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Blur: {value.shadowBlur}px</Label>
              <Slider
                value={[value.shadowBlur]}
                min={0}
                max={50}
                step={1}
                onValueChange={([v]) => updateStyle({ shadowBlur: v })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Offset X: {value.shadowOffsetX}px</Label>
                <Slider
                  value={[value.shadowOffsetX]}
                  min={-50}
                  max={50}
                  step={1}
                  onValueChange={([v]) => updateStyle({ shadowOffsetX: v })}
                />
              </div>

              <div className="space-y-2">
                <Label>Offset Y: {value.shadowOffsetY}px</Label>
                <Slider
                  value={[value.shadowOffsetY]}
                  min={-50}
                  max={50}
                  step={1}
                  onValueChange={([v]) => updateStyle({ shadowOffsetY: v })}
                />
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="gradient">
        <AccordionTrigger>Gradient</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={value.gradientType}
                onValueChange={(v) => 
                  updateStyle({ 
                    gradientType: v as 'none' | 'linear' | 'radial' 
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="linear">Linear</SelectItem>
                  <SelectItem value="radial">Radial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {value.gradientType !== 'none' && (
              <>
                <div className="space-y-2">
                  <Label>Start Color</Label>
                  <div className="relative">
                    <div
                      className="h-10 rounded-md border cursor-pointer"
                      style={{ backgroundColor: value.gradientStart }}
                      onClick={() => setShowGradientStartPicker(true)}
                    />
                    {showGradientStartPicker && (
                      <>
                        <div className="fixed inset-0" onClick={handleClickOutside} />
                        <div className="absolute z-10">
                          <ChromePicker
                            color={value.gradientStart}
                            onChange={color => 
                              updateStyle({ gradientStart: color.hex })
                            }
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>End Color</Label>
                  <div className="relative">
                    <div
                      className="h-10 rounded-md border cursor-pointer"
                      style={{ backgroundColor: value.gradientEnd }}
                      onClick={() => setShowGradientEndPicker(true)}
                    />
                    {showGradientEndPicker && (
                      <>
                        <div className="fixed inset-0" onClick={handleClickOutside} />
                        <div className="absolute z-10">
                          <ChromePicker
                            color={value.gradientEnd}
                            onChange={color => 
                              updateStyle({ gradientEnd: color.hex })
                            }
                                                      />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {value.gradientType === 'linear' && (
                  <div className="space-y-2">
                    <Label>Angle: {value.gradientRotation}°</Label>
                    <Slider
                      value={[value.gradientRotation]}
                      min={0}
                      max={360}
                      step={1}
                      onValueChange={([v]) => updateStyle({ gradientRotation: v })}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="border">
        <AccordionTrigger>Border</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Width: {value.borderWidth}px</Label>
              <Slider
                value={[value.borderWidth]}
                min={0}
                max={20}
                step={1}
                onValueChange={([v]) => updateStyle({ borderWidth: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Radius: {value.borderRadius}px</Label>
              <Slider
                value={[value.borderRadius]}
                min={0}
                max={50}
                step={1}
                onValueChange={([v]) => updateStyle({ borderRadius: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="relative">
                <div
                  className="h-10 rounded-md border cursor-pointer"
                  style={{ backgroundColor: value.borderColor }}
                  onClick={() => setShowBorderColorPicker(true)}
                />
                {showBorderColorPicker && (
                  <>
                    <div className="fixed inset-0" onClick={handleClickOutside} />
                    <div className="absolute z-10">
                      <ChromePicker
                        color={value.borderColor}
                        onChange={color => updateStyle({ borderColor: color.hex })}
                      />
                    </div>
                  </>
                )}
              </div>
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
                <Label>Mode</Label>
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
  )
}
