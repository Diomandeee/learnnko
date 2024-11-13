import { PrismaClient } from '@prisma/client';
import { INITIAL_MENU_ITEMS } from '../src/constants/pos-data';

const prisma = new PrismaClient();

async function main() {
 console.log('Starting seeding...');

 // Seed menu items
 for (const item of INITIAL_MENU_ITEMS) {
   const existingItem = await prisma.menuItem.findFirst({
     where: {
       name: item.name,
     },
   });

   if (!existingItem) {
     await prisma.menuItem.create({
       data: item,
     });
     console.log(`Created menu item: ${item.name}`);
   } else {
     console.log(`Menu item already exists: ${item.name}`);
   }
 }

 console.log('Seeding finished.');
}

main()
 .catch((e) => {
   console.error(e);
   process.exit(1);
 })
 .finally(async () => {
   await prisma.$disconnect();
 });
