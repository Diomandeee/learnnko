// const { PrismaClient } = require('@prisma/client');
// const { parse } = require('csv-parse/sync');
// const fs = require('fs');

// const prisma = new PrismaClient();

// interface CoffeeShopData {
//   title: string;
//   address: string;
//   website: string | null;
//   manager_present: string | null;
//   contact_name: string | null;
//   contact_email: string | null;
//   phone: string | null;
//   visited: boolean;
//   instagram: string | null;
//   followers: number | null;
//   store_doors: string | null;
//   volume: string | null;
//   first_visit: Date | null;
//   second_visit: Date | null;
//   third_visit: Date | null;
//   rating: number | null;
//   reviews: number | null;
//   price_type: string | null;
//   type: string | null;
//   types: string[];
//   service_options: object | null;
//   hours: string | null;
//   operating_hours: object | null;
//   gps_coordinates: object | null;
//   latitude: number;
//   longitude: number;
//   area: string | null;
//   is_source: boolean;
//   quality_score: number | null;
//   parlor_coffee_leads: boolean;
// }

// async function loadCoffeeShops(filePath: string) {
//   try {
//     const fileContent = fs.readFileSync(filePath, 'utf-8');
    
//     // Log the first few lines to debug
//     console.log('First 500 characters of file:', fileContent.slice(0, 500));

//     const records = parse(fileContent, {
//       columns: true,
//       skip_empty_lines: true,
//       delimiter: ',',
//       trim: true,
//       relax_column_count: true,
//       cast: (value: string | number | boolean, _context: unknown) => {
//         // Custom casting logic
//         if (value === '') return null;
//         return value;
//       }
//     });

//     console.log('Found records:', records.length);
//     console.log('First record:', records[0]);

//     for (const record of records) {
//       try {
//         const shopData: CoffeeShopData = {
//           title: record.title?.trim() || '',
//           address: record.address?.trim() || '',
//           website: record.website === '0' ? null : record.website?.trim() || null,
//           manager_present: record.manager_present?.trim() || null,
//           contact_name: record.contact_name?.trim() || null,
//           contact_email: record.contact_email?.trim() || null,
//           phone: record.phone === '0' ? null : record.phone?.trim() || null,
//           visited: record.visited?.toLowerCase() === 'yes',
//           instagram: record.instagram 
//             ? `https://www.instagram.com/${record.instagram.trim()}` 
//             : null,
//           followers: record.followers 
//             ? parseInt(record.followers, 10) 
//             : null,
//           store_doors: record.store_doors?.trim() || null,
//           volume: record.volume?.trim() || null,
//           first_visit: record.first_visit ? new Date(record.first_visit) : null,
//           second_visit: record.second_visit ? new Date(record.second_visit) : null,
//           third_visit: record.third_visit ? new Date(record.third_visit) : null,
//           rating: record.rating !== '0' ? parseFloat(record.rating) : null,
//           reviews: record.reviews !== '0' ? parseInt(record.reviews, 10) : null,
//           price_type: record.price === '0' ? null : record.price?.trim() || null,
//           type: record.type?.trim() || null,
//           types: record.types 
//             ? JSON.parse(record.types.replace(/'/g, '"')) 
//             : [],
//           service_options: record.service_options 
//             ? JSON.parse(record.service_options.replace(/'/g, '"')) 
//             : null,
//           hours: record.hours?.trim() || null,
//           operating_hours: record.operating_hours 
//             ? JSON.parse(record.operating_hours.replace(/'/g, '"')) 
//             : null,
//           gps_coordinates: record.gps_coordinates 
//             ? JSON.parse(record.gps_coordinates.replace(/'/g, '"')) 
//             : null,
//           latitude: parseFloat(record.latitude),
//           longitude: parseFloat(record.longitude),
//           area: record.area?.trim() || null,
//           is_source: record.is_source?.toLowerCase() === 'true',
//           quality_score: null,
//           parlor_coffee_leads: record.parlor_coffee_leads?.toLowerCase() === 'yes',
//         };

//         // Log the prepared data for debugging
//         console.log('Prepared shop data:', JSON.stringify(shopData, null, 2));

//         const createdShop = await prisma.coffeeShop.create({
//           data: shopData
//         });

//         console.log(`Created coffee shop: ${shopData.title}`);
//       } catch (err) {
//         console.error(`Error processing record:`, record);
//         console.error(`Error details:`, err);
//         continue;
//       }
//     }

//     console.log('Data import completed successfully!');
//   } catch (error) {
//     console.error('Error loading coffee shops:', error);
//     throw error;
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// // Handle spaces in filename
// const filename = process.argv.slice(2).join(' ');
// if (!filename) {
//   console.error('Please provide the CSV file path');
//   process.exit(1);
// }

// loadCoffeeShops(filename)
//   .catch((error) => {
//     console.error('Failed to load coffee shops:', error);
//     process.exit(1);
//   });