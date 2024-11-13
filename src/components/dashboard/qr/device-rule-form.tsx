import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Plus, Trash2, Loader2 } from "lucide-react"

// Define interfaces for our types
interface DeviceRule {
  id?: string
  deviceType: 'ALL' | 'MOBILE' | 'TABLET' | 'DESKTOP'
  targetUrl: string
  priority: number
  browsers: string[]
  os: string[]
}

interface DeviceRuleFormProps {
  qrCodeId?: string
  initialRules?: DeviceRule[]
  onChange?: (rules: DeviceRule[]) => void
}

export function DeviceRuleForm({ qrCodeId, initialRules, onChange }: DeviceRuleFormProps) {
  const [rules, setRules] = useState<DeviceRule[]>(initialRules || [])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (qrCodeId) {
      fetchRules()
    } else {
      setLoading(false)
    }
  }, [qrCodeId])

  const fetchRules = async () => {
    try {
      const response = await fetch(`/api/qr/${qrCodeId}/device-rules`)
      if (!response.ok) throw new Error('Failed to fetch rules')
      const data = await response.json()
      setRules(data)
    } catch (error) {
      console.error('Error fetching rules:', error)
      toast({
        title: "Error",
        description: "Failed to load device rules",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addRule = () => {
    const newRule: DeviceRule = {
      deviceType: "ALL",
      targetUrl: "",
      priority: rules.length + 1,
      browsers: [],
      os: [],
    }
    const updatedRules = [...rules, newRule]
    setRules(updatedRules)
    onChange?.(updatedRules)
  }

  const removeRule = (index: number) => {
    const updatedRules = rules.filter((_, i) => i !== index)
    setRules(updatedRules)
    onChange?.(updatedRules)
  }

  const updateRule = (index: number, updates: Partial<DeviceRule>) => {
    const updatedRules = [...rules]
    updatedRules[index] = { ...updatedRules[index], ...updates }
    setRules(updatedRules)
    onChange?.(updatedRules)
  }

  const validateRules = (rules: DeviceRule[]): boolean => {
    for (const rule of rules) {
      if (!rule.targetUrl) {
        toast({
          title: "Validation Error",
          description: "Target URL is required for all rules",
          variant: "destructive",
        })
        return false
      }

      try {
        new URL(rule.targetUrl)
      } catch {
        toast({
          title: "Validation Error",
          description: "Please enter valid URLs",
          variant: "destructive",
        })
        return false
      }
    }
    return true
  }

  const saveRules = async () => {
    if (!qrCodeId) return
    if (!validateRules(rules)) return

    setSaving(true)
    try {
      const response = await fetch(`/api/qr/${qrCodeId}/device-rules`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rules),
      })

      if (!response.ok) throw new Error('Failed to save rules')

      toast({
        title: "Success",
        description: "Device rules saved successfully",
      })
    } catch (error) {
      console.error('Error saving rules:', error)
      toast({
        title: "Error",
        description: "Failed to save device rules",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Device Rules</CardTitle>
          <CardDescription>
            Redirect users based on their device type. Rules are processed in order of priority.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {rules.map((rule, index) => (
            <div key={index} className="space-y-4 pt-4 first:pt-0">
              <div className="flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <Select
                    value={rule.deviceType}
                    onValueChange={(value: DeviceRule['deviceType']) => {
                      updateRule(index, { deviceType: value })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select device type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Devices</SelectItem>
                      <SelectItem value="MOBILE">Mobile</SelectItem>
                      <SelectItem value="TABLET">Tablet</SelectItem>
                      <SelectItem value="DESKTOP">Desktop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-[2] space-y-2">
                  <Input
                    placeholder="Target URL"
                    value={rule.targetUrl}
                    onChange={(e) => updateRule(index, { targetUrl: e.target.value })}
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeRule(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={addRule}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Rule
          </Button>
          {rules.length > 0 && (
            <Button 
              onClick={saveRules}
              className="w-full"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Rules"
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}