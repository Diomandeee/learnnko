"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShiftType, StaffRole } from "@prisma/client";
import { validateShiftRules } from '@/lib/scheduling/collision';

interface ShiftPreviewProps {
  shiftId: string;
  type: ShiftType;
  startTime: Date;
  endTime: Date;
  assignedStaff: Array<{
    id: string;
    name: string;
    role: StaffRole;
  }>;
}

export function ShiftPreview({
  shiftId,
  type,
  startTime,
  endTime,
  assignedStaff
}: ShiftPreviewProps) {
  const [validationResults, setValidationResults] = useState<{
    isValid: boolean;
    violations: string[];
  }>({ isValid: true, violations: [] });

  useEffect(() => {
    const validateShift = async () => {
      const results = await validateShiftRules(
        { id: shiftId, type, startTime, endTime } as any,
        assignedStaff as any
      );
      setValidationResults(results);
    };

    validateShift();
  }, [shiftId, type, startTime, endTime, assignedStaff]);

  const shiftColors = {
    COFFEE: 'bg-blue-50 border-blue-200',
    WINE: 'bg-purple-50 border-purple-200'
  };

  return (
    <Card className={`p-2 ${shiftColors[type]} border-2 ${
      !validationResults.isValid ? 'border-red-300' : ''
    }`}>
      <div className="flex justify-between items-start">
        <div>
          <Badge variant={type === 'COFFEE' ? 'default' : 'secondary'}>
            {type}
          </Badge>
          <div className="text-sm font-medium mt-1">
            {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
          </div>
        </div>
        <Badge variant={validationResults.isValid ? 'success' : 'destructive'}>
          {assignedStaff.length} Staff
        </Badge>
      </div>

      {assignedStaff.length > 0 && (
        <div className="mt-2 space-y-1">
          {assignedStaff.map(staff => (
            <div key={staff.id} className="flex items-center justify-between text-xs">
              <span>{staff.name}</span>
              <Badge variant="outline" className="text-xs">
                {staff.role}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {!validationResults.isValid && (
        <div className="mt-2 space-y-1">
          {validationResults.violations.map((violation, index) => (
            <div key={index} className="text-xs text-red-600">
              ⚠️ {violation}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
