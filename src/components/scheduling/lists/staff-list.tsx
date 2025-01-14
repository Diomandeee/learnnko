"use client";

import { Staff } from "@/types/scheduling/staff";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash2, Calendar } from "lucide-react";
import { StaffRole } from "@prisma/client";
import { useState, useEffect } from "react";

interface StaffListProps {
  onEdit?: (staff: Staff) => void;
  onDelete?: (staffId: string) => void;
  onViewSchedule?: (staffId: string) => void;
}

const getRoleColor = (role: StaffRole) => {
  switch (role) {
    case 'BARISTA':
      return 'blue';
    case 'SOMMELIER':
      return 'purple';
    case 'MANAGER':
      return 'green';
    case 'EXECUTIVE':
      return 'orange';
    default:
      return 'gray';
  }
};

export function StaffList({ onEdit, onDelete, onViewSchedule }: StaffListProps) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await fetch('/api/scheduling/staff');
        if (response.ok) {
          const data = await response.json();
          setStaff(data);
        }
      } catch (error) {
        console.error('Error fetching staff:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Certifications</TableHead>
              <TableHead>Max Hours</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No staff members found. Add your first staff member to get started.
                </TableCell>
              </TableRow>
            ) : (
              staff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {member.name}
                    <div className="text-sm text-muted-foreground">
                      {member.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleColor(member.role)}>
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {member.certifications.map((cert) => (
                        <Badge key={cert} variant="outline">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{member.maxHoursPerWeek}h/week</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => onEdit?.(member)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Staff
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => onViewSchedule?.(member.id)}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          View Schedule
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onSelect={() => onDelete?.(member.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Staff
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
