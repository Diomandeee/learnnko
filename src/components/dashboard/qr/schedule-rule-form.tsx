import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
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
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Plus, Trash2, Loader2 } from "lucide-react"

interface ScheduleRule {
  id?: string
  startDate: string
  endDate: string | null
  timeZone: string
  daysOfWeek: number[]
  startTime: string | null
  endTime: string | null
  targetUrl: string
  priority: number
}

interface ScheduleRuleFormProps {
  qrCodeId?: string
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
]

const TIME_ZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time" },
  { value: "America/Chicago", label: "Central Time" },
  { value: "America/Denver", label: "Mountain Time" },
  { value: "America/Los_Angeles", label: "Pacific Time" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Asia/Tokyo", label: "Tokyo" },
]

export function ScheduleRuleForm({ qrCodeId }: ScheduleRuleFormProps) {
  const [rules, setRules] = useState<ScheduleRule[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchRules = useCallback(async () => {
    if (!qrCodeId) return
    
    try {
      const response = await fetch(`/api/qr/${qrCodeId}/schedule-rules`)
      if (!response.ok) throw new Error('Failed to fetch rules')
      const data = await response.json()
      setRules(data)
    } catch (error) {
      console.error('Error fetching rules:', error)
      toast({
        title: "Error",
        description: "Failed to load schedule rules",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [qrCodeId])

  useEffect(() => {
    if (qrCodeId) {
      fetchRules()
    } else {
      setLoading(false)
    }
  }, [fetchRules, qrCodeId])

  const addRule = () => {
    const newRule: ScheduleRule = {
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: null,
      timeZone: "UTC",
      daysOfWeek: [],
      startTime: null,
      endTime: null,
      targetUrl: "",
      priority: rules.length + 1,
    }
    setRules([...rules, newRule])
  }

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index))
  }

  const updateRule = (index: number, updates: Partial<ScheduleRule>) => {
    const newRules = [...rules]
    newRules[index] = { ...newRules[index], ...updates }
    setRules(newRules)
  }

  const toggleDayOfWeek = (index: number, day: number) => {
    const rule = rules[index]
    const daysOfWeek = rule.daysOfWeek.includes(day)
      ? rule.daysOfWeek.filter(d => d !== day)
      : [...rule.daysOfWeek, day]
    updateRule(index, { daysOfWeek })
  }

  const validateRules = (rules: ScheduleRule[]): boolean => {
    for (const rule of rules) {
      if (!rule.targetUrl) {
        toast({
          title: "Validation Error",
          description: "Target URL is required for all rules",
          variant: "destructive",
        })
        return false
      }

      if (!rule.startDate) {
        toast({
          title: "Validation Error",
          description: "Start date is required for all rules",
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
      const response = await fetch(`/api/qr/${qrCodeId}/schedule-rules`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rules),
      })

      if (!response.ok) throw new Error('Failed to save rules')

      toast({
        title: "Success",
        description: "Schedule rules saved successfully",
      })
    } catch (error) {
      console.error('Error saving rules:', error)
      toast({
        title: "Error",
        description: "Failed to save schedule rules",
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
          <CardTitle>Schedule Rules</CardTitle>
          <CardDescription>
            Redirect users based on date and time. Rules are processed in order of priority.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {rules.map((rule, index) => (
            <div key={index} className="space-y-4 pt-4 first:pt-0">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <Input
                      type="date"
                      value={rule.startDate}
                      onChange={(e) => updateRule(index, { startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Date (Optional)</label>
                    <Input
                      type="date"
                      value={rule.endDate || ""}
                      onChange={(e) => updateRule(index, { endDate: e.target.value || null })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Time (Optional)</label>
                    <Input
                      type="time"
                      value={rule.startTime || ""}
                      onChange={(e) => updateRule(index, { startTime: e.target.value || null })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Time (Optional)</label>
                    <Input
                      type="time"
                      value={rule.endTime || ""}
                      onChange={(e) => updateRule(index, { endTime: e.target.value || null })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Zone</label>
                  <Select
                    value={rule.timeZone}
                    onValueChange={(value) => updateRule(index, { timeZone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_ZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Days of Week</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <div key={day.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${index}-${day.value}`}
                          checked={rule.daysOfWeek.includes(day.value)}
                          onCheckedChange={() => toggleDayOfWeek(index, day.value)}
                        />
                        <label
                          htmlFor={`day-${index}-${day.value}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {day.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Target URL</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://example.com"
                      value={rule.targetUrl}
                      onChange={(e) => updateRule(index, { targetUrl: e.target.value })}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeRule(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={addRule}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Schedule Rule
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