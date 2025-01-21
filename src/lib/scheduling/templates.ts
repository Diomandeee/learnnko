import { prisma } from "@/lib/db/prisma";
import { ShiftType } from "@prisma/client";

interface ShiftTemplate {
  id: string;
  name: string;
  type: ShiftType;
  duration: number; // in minutes
  requiredRoles: {
    role: string;
    count: number;
    requiredCertifications: string[];
  }[];
  defaultBreaks: {
    offsetMinutes: number;
    duration: number;
  }[];
}

export async function createShiftTemplate(template: Omit<ShiftTemplate, 'id'>) {
  return prisma.shiftTemplate.create({
    data: {
      name: template.name,
      type: template.type,
      duration: template.duration,
      requiredRoles: template.requiredRoles,
      defaultBreaks: template.defaultBreaks,
    }
  });
}

export async function applyTemplate(
  templateId: string,
  startTime: Date,
  customizations?: {
    duration?: number;
    requiredRoles?: any;
    breaks?: any;
  }
) {
  const template = await prisma.shiftTemplate.findUnique({
    where: { id: templateId }
  });

  if (!template) {
    throw new Error('Template not found');
  }

  const endTime = new Date(startTime.getTime() + 
    (customizations?.duration || template.duration) * 60 * 1000);

  const shift = await prisma.shift.create({
    data: {
      type: template.type,
      startTime,
      endTime,
      requiredRoles: customizations?.requiredRoles || template.requiredRoles,
      status: 'DRAFT',
      breaks: {
        create: (customizations?.breaks || template.defaultBreaks).map((breakData: any) => ({
          startTime: new Date(startTime.getTime() + breakData.offsetMinutes * 60 * 1000),
          duration: breakData.duration,
        }))
      }
    },
    include: {
      breaks: true
    }
  });

  return shift;
}
