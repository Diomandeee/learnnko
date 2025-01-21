import { prisma } from "@/lib/db/prisma";

export async function getStaffById(id: string) {
  try {
    return await prisma.staff.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Error fetching staff:", error);
    return null;
  }
}
