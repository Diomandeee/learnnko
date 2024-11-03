import { prisma } from "./db/prisma";
import { Contact, ContactStats } from "@/types/contacts";

export async function getContacts(): Promise<Contact[]> {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return contacts as Contact[]; // Add type assertion to fix the type error
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return [];
  }
}

export async function getContactById(id: string): Promise<Contact | null> {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id },
    });
    return contact as Contact | null; // Add type assertion to fix the type error
  } catch (error) {
    console.error("Error fetching contact:", error);
    return null;
  }
}

export async function getContactStats(): Promise<ContactStats> {
  try {
    // Get total contacts
    const totalContacts = await prisma.contact.count();

    // Get contacts created this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newThisMonth = await prisma.contact.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // Get contacts created last month for comparison
    const startOfLastMonth = new Date(startOfMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
    const endOfLastMonth = new Date(startOfMonth);
    endOfLastMonth.setMilliseconds(-1);

    const lastMonthContacts = await prisma.contact.count({
      where: {
        createdAt: {
          gte: startOfLastMonth,
          lt: startOfMonth,
        },
      },
    });

    // Calculate percentage change
    const percentageChange = lastMonthContacts === 0
      ? newThisMonth === 0 ? "0.0" : "100.0"
      : ((newThisMonth - lastMonthContacts) / lastMonthContacts * 100).toFixed(1);

    // Get contacts by status
    const statusCounts = await prisma.contact.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    });

    // Convert status counts to record
    const byStatus = statusCounts.reduce((acc, curr) => {
      acc[curr.status as keyof typeof acc] = curr._count.id;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: totalContacts,
      newThisMonth,
      percentageChange,
      byStatus,
    };
  } catch (error) {
    console.error("Error fetching contact stats:", error);
    return {
      total: 0,
      newThisMonth: 0,
      percentageChange: "0.0",
      byStatus: {},
    };
  }
}