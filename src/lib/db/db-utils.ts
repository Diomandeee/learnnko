/* eslint-disable @typescript-eslint/no-explicit-any */

import { prisma } from "./prisma";

export const dbUtils = {
  async createOrder(data: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return await prisma.order.create({
      data
    });
  },

  async getOrders() {
    return await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  async getMenuItems() {
    return await prisma.menuItem.findMany({
      where: {
        active: true
      },
      orderBy: {
        name: 'asc'
      }
    });
  },

  async createQuickNote(content: string, userId: string) {
    return await prisma.quickNote.create({
      data: {
        content,
        userId
      }
    });
  },

  async getQuickNotes(userId: string) {
    return await prisma.quickNote.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  async updateMenuItem(id: string, data: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return await prisma.menuItem.update({
      where: { id },
      data
    });
  },

  async deleteMenuItem(id: string) {
    return await prisma.menuItem.update({
      where: { id },
      data: { active: false }
    });
  }
};
