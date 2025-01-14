"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

export function SensitivityAnalysis() {
  const [variables, setVariables] = useState({
    revenueSplit: 50,
    guestCount: 100,
    drinkPrice: 5,
  });

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Label>Revenue Split (%)</Label>
        <Slider
          value={[variables.revenueSplit]}
          onValueChange={([value]) =>
            setVariables(prev => ({ ...prev, revenueSplit: value }))
          }
          max={100}
          step={1}
        />
        <div className="text-sm text-muted-foreground">
          Current: {variables.revenueSplit}%
        </div>
      </div>

      <div className="space-y-4">
        <Label>Daily Guest Count</Label>
        <Slider
          value={[variables.guestCount]}
          onValueChange={([value]) =>
            setVariables(prev => ({ ...prev, guestCount: value }))
          }
          max={500}
          step={10}
        />
        <div className="text-sm text-muted-foreground">
          Current: {variables.guestCount} guests
        </div>
      </div>

      <div className="space-y-4">
        <Label>Average Drink Price ($)</Label>
        <Slider
          value={[variables.drinkPrice]}
          onValueChange={([value]) =>
            setVariables(prev => ({ ...prev, drinkPrice: value }))
          }
          max={10}
          step={0.5}
        />
        <div className="text-sm text-muted-foreground">
          Current: ${variables.drinkPrice.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
