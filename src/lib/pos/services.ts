import { prisma } from "@/lib/db/prisma";
import { Order, MenuItem, QuickNote } from "@/types/pos";

export async function createOrder(orderData: Omit<Order, "id">): Promise<Order> {
  const order = await prisma.order.create({
    data: orderData
  });
  return order as Order;
}

export async function getOrders(): Promise<Order[]> {
  const orders = await prisma.order.findMany({
    orderBy: { timestamp: 'desc' }
  });
  return orders as Order[];
}

export async function getMenuItems(): Promise<MenuItem[]> {
  const menuItems = await prisma.menuItem.findMany({
    orderBy: { name: 'asc' }
  });
  return menuItems as MenuItem[];
}

export async function getQuickNotes(): Promise<QuickNote[]> {
  const quickNotes = await prisma.quickNote.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return quickNotes as QuickNote[];
}

export async function createQuickNote(content: string): Promise<QuickNote> {
  const quickNote = await prisma.quickNote.create({
    data: { content }
  });
  return quickNote as QuickNote;
}
