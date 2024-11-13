/* eslint-disable @typescript-eslint/no-explicit-any */

import { prisma } from "@/lib/db/prisma";
import { Order, MenuItem, QuickNote } from "@/types/pos";

interface CreateOrderData {
  orderNumber: number;
  customerName: string;
  customerInfo: Record<string, any>; // Ignoring eslint error for 'any'
  items: any[]; // Ignoring eslint error for 'any'
  notes?: string;
  status: string;
  total: number;
  isComplimentary: boolean;
  queueTime?: number;
  startTime: Date;
  userId: string;
}

export const dbService = {
  // Order Operations
  async createOrder(data: CreateOrderData): Promise<Order> {
    try {
      const order = await prisma.order.create({
        data: {
          orderNumber: data.orderNumber,
          customerName: data.customerName,
          customerInfo: data.customerInfo,
          items: data.items,
          notes: data.notes,
          status: data.status as any, // Ignoring eslint error for 'any'
          total: data.total,
          isComplimentary: data.isComplimentary,
          queueTime: data.queueTime || 0, // Fix: Provide a default value of 0 if queueTime is undefined
          startTime: data.startTime,
          userId: data.userId
        }
      });
      return order as Order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  async getOrders(userId: string): Promise<Order[]> {
    try {
      const orders = await prisma.order.findMany({
        where: {
          userId: userId
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      return orders as Order[];
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // MenuItem Operations
  async getMenuItems(): Promise<MenuItem[]> {
    try {
      const items = await prisma.menuItem.findMany({
        where: {
          active: true
        },
        orderBy: {
          name: 'asc'
        }
      });
      return items as MenuItem[];
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw error;
    }
  },

  async createMenuItem(data: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuItem> {
    try {
      const item = await prisma.menuItem.create({
        data: {
          name: data.name,
          price: data.price,
          category: data.category,
          popular: data.popular,
          active: true
        }
      });
      return item as MenuItem;
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }
  },

  // QuickNote Operations
  async getQuickNotes(userId: string): Promise<QuickNote[]> {
    try {
      const notes = await prisma.quickNote.findMany({
        where: {
          userId: userId
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      return notes as QuickNote[];
    } catch (error) {
      console.error('Error fetching quick notes:', error);
      throw error;
    }
  },

  async createQuickNote(content: string, userId: string): Promise<QuickNote> {
    try {
      const note = await prisma.quickNote.create({
        data: {
          content,
          userId
        }
      });
      return note as QuickNote;
    } catch (error) {
      console.error('Error creating quick note:', error);
      throw error;
    }
  }
};
