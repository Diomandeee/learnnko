import { prisma } from "@/lib/db/prisma";

export class VolumeManager {
  static async updateVolume(
    coffeeShopId: string, 
    volume: number,
    weekNumber?: number,
    year?: number
  ) {
    try {
      // Update coffee shop volume
      const shop = await prisma.coffeeShop.update({
        where: { id: coffeeShopId },
        data: {
          currentVolume: volume,
          volumeLastUpdated: new Date(),
          ...(weekNumber && { weekNumber }),
          ...(year && { yearNumber: year })
        }
      });

      // Create delivery history if week number provided
      if (weekNumber && year) {
        await prisma.deliveryHistory.upsert({
          where: {
            delivery_period: {
              coffeeShopId,
              weekNumber,
              year
            }
          },
          update: {
            volume,
            revenue: volume * 18.0
          },
          create: {
            coffeeShopId,
            weekNumber,
            year,
            volume,
            revenue: volume * 18.0
          }
        });
      }

      return shop;
    } catch (error) {
      console.error("[VOLUME_UPDATE_ERROR]", error);
      throw error;
    }
  }
}
