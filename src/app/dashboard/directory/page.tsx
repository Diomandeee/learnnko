import { Metadata } from "next";
import { StaffDirectory } from "@/components/directory/staff/staff-directory";

export const metadata: Metadata = {
  title: "Staff Directory | BUF BARISTA CRM",
  description: "Manage staff, schedules, and time off",
};

export default function DirectoryPage() {
  return <StaffDirectory />;
}
