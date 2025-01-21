interface ClipboardShift {
  type: string;
  duration: number;
  requiredRoles: any;
  assignedStaff: Array<{
    id: string;
    role: string;
  }>;
  breaks: Array<{
    offsetMinutes: number;
    duration: number;
  }>;
}

class SchedulingClipboard {
  private copiedShift: ClipboardShift | null = null;

  copy(shift: any) {
    const startTime = new Date(shift.startTime);
    const endTime = new Date(shift.endTime);
    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60);

    this.copiedShift = {
      type: shift.type,
      duration,
      requiredRoles: shift.requiredRoles,
      assignedStaff: shift.assignedStaff.map((assignment: any) => ({
        id: assignment.staff.id,
        role: assignment.staff.role
      })),
      breaks: shift.breaks.map((breakItem: any) => ({
        offsetMinutes: (new Date(breakItem.startTime).getTime() - startTime.getTime()) / (1000 * 60),
        duration: breakItem.duration
      }))
    };
  }

  async paste(targetDate: Date) {
    if (!this.copiedShift) {
      throw new Error('No shift in clipboard');
    }

    const endTime = new Date(targetDate.getTime() + this.copiedShift.duration * 60 * 1000);

    const newShift = await prisma.shift.create({
      data: {
        type: this.copiedShift.type,
        startTime: targetDate,
        endTime,
        requiredRoles: this.copiedShift.requiredRoles,
        status: 'DRAFT',
        breaks: {
          create: this.copiedShift.breaks.map(breakItem => ({
            startTime: new Date(targetDate.getTime() + breakItem.offsetMinutes * 60 * 1000),
            duration: breakItem.duration
          }))
        }
      },
      include: {
        breaks: true
      }
    });

    // Copy staff assignments if they're still available
    if (this.copiedShift.assignedStaff.length > 0) {
      const availability = await this.checkStaffAvailability(
        this.copiedShift.assignedStaff.map(s => s.id),
        targetDate,
        endTime
      );

      for (const staffId of availability.availableStaff) {
        await prisma.shiftAssignment.create({
          data: {
            shiftId: newShift.id,
            staffId,
            status: 'SCHEDULED'
          }
        });
      }
    }

    return newShift;
  }

  private async checkStaffAvailability(
    staffIds: string[],
    startTime: Date,
    endTime: Date
  ): Promise<{ availableStaff: string[] }> {
    const conflicts = await prisma.shiftAssignment.findMany({
      where: {
        staffId: { in: staffIds },
        shift: {
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gt: startTime } }
          ]
        }
      }
    });

    const unavailableStaffIds = new Set(conflicts.map(c => c.staffId));
    const availableStaff = staffIds.filter(id => !unavailableStaffIds.has(id));

    return { availableStaff };
  }

  hasCopiedShift(): boolean {
    return this.copiedShift !== null;
  }

  clear() {
    this.copiedShift = null;
  }
}

export const schedulingClipboard = new SchedulingClipboard();
