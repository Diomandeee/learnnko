"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ExpenseAllocation() {
  const [expenses, setExpenses] = useState({
    rent: { amount: 0, isBuffBarista: false },
    utilities: { amount: 0, isBuffBarista: false },
    labor: { amount: 0, isBuffBarista: true },
    supplies: { amount: 0, isBuffBarista: true },
    maintenance: { amount: 0, isBuffBarista: false },
  });

  return (
    <div className="space-y-6">
      {Object.entries(expenses).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between space-x-4">
          <div className="flex-1">
            <Label htmlFor={key} className="capitalize">{key}</Label>
            <Input
              id={key}
              type="number"
              value={value.amount}
              onChange={(e) => 
                setExpenses(prev => ({
                  ...prev,
                  [key]: { ...value, amount: parseFloat(e.target.value) || 0 }
                }))
              }
              placeholder="Enter amount"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor={`${key}-switch`}>Milk Man</Label>
            <Switch
              id={`${key}-switch`}
              checked={value.isBuffBarista}
              onCheckedChange={(checked) =>
                setExpenses(prev => ({
                  ...prev,
                  [key]: { ...value, isBuffBarista: checked }
                }))
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}
