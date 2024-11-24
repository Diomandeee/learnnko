// import { 
//   PRICING_MODELS, 
//   EQUIPMENT_UPGRADES, 
//   ADD_ON_EXPERIENCES, 
//   BRANDING_OPTIONS, 
//   DRINK_TYPES 
// } from './constants';
// import type { 
//   FormData, 
//   TimelinePoint, 
//   BookedAddOn, 
//   QuoteBreakdown,
//   EquipmentUpgrades,
//   BrandingOption,
//   DrinkType
// } from './types';

// export const calculateByTheCupPrice = (guestCount: number, duration: number, formData: FormData): number => {
//   let basePrice = PRICING_MODELS.byTheCup.breakpoints.find(
//     b => guestCount <= b.threshold
//   )?.price || PRICING_MODELS.byTheCup.basePrice;

//   let totalPrice = basePrice * guestCount;

//   // Apply minimum charge
//   if (totalPrice < PRICING_MODELS.byTheCup.minimumCharge && guestCount <= 200) {
//     totalPrice = PRICING_MODELS.byTheCup.minimumCharge;
//   }

//   // Add equipment upgrades
//   formData.equipmentUpgrades.forEach(upgrade => {
//     const equipment = EQUIPMENT_UPGRADES[upgrade as keyof EquipmentUpgrades];
//     if (equipment) {
//       if ('flatFee' in equipment) {
//         totalPrice += equipment.flatFee;
//       }
//       if ('perCupRate' in equipment) {
//         totalPrice += equipment.perCupRate * guestCount;
//       }
//       totalPrice += equipment.hourlyRate * duration;
//     }
//   });

//   // Add selected drinks cost
//   formData.selectedDrinks.forEach(drinkId => {
//     const specialtyDrink = DRINK_TYPES.specialty.find(d => d.id === drinkId);
//     const nonCoffeeDrink = DRINK_TYPES.nonCoffee.find(d => d.id === drinkId);
//     const drink = specialtyDrink || nonCoffeeDrink;
//     if (drink?.price) {
//       totalPrice += drink.price * guestCount;
//     }
//   });

//   // Add staffing costs
//   const additionalBaristas = Math.max(0, Math.floor((guestCount - 500) / 250));
//   totalPrice += 200 * additionalBaristas;

//   // Add duration charges
//   if (duration > 4) {
//     totalPrice += 100 * (duration - 4) * (2 + additionalBaristas);
//   }

//   // Add add-on experiences
//   formData.addOnExperiences.forEach(addon => {
//     const experience = ADD_ON_EXPERIENCES[addon as keyof typeof ADD_ON_EXPERIENCES];
//     if (experience) {
//       totalPrice += experience.price;
//     }
//   });

//   // Add branding costs
//   if (formData.customBranding !== 'none') {
//     const brandingOption = BRANDING_OPTIONS[formData.customBranding] as BrandingOption;
//     if (brandingOption) {
//       if ('baseFee' in brandingOption) {
//         totalPrice += brandingOption.baseFee + (brandingOption.perCupRate * guestCount);
//       } else {
//         totalPrice += brandingOption.price * Math.max(brandingOption.minimumOrder, guestCount);
//       }
//     }
//   }

//   // Add custom uniform costs
//   if (formData.staffUniform === 'custom') {
//     totalPrice += 50 * (2 + additionalBaristas);
//   }

//   // Add custom drink development fee
//   if (formData.customDrink.trim()) {
//     totalPrice += 200;
//   }

//   return totalPrice;
// };

// export const calculateHourlyRatePrice = (duration: number, guestCount: number, formData: FormData): number => {
//   let totalPrice = PRICING_MODELS.hourlyRate.basePrice * Math.max(duration, 4);

//   // Add peak hours surcharge
//   if (duration > 4) {
//     totalPrice += PRICING_MODELS.hourlyRate.peakHourSurcharge * (duration - 4);
//   }

//   // Update staffing calculation - corrected formula
//   const baseStaff = 2;
//   const additionalBaristas = Math.max(0, Math.floor((guestCount - 150) / 100));
//   totalPrice += PRICING_MODELS.hourlyRate.additionalStaffRate * duration * additionalBaristas;

//   // Add equipment upgrades
//   formData.equipmentUpgrades.forEach(upgrade => {
//     const equipment = EQUIPMENT_UPGRADES[upgrade as keyof EquipmentUpgrades];
//     if (equipment) {
//       totalPrice += equipment.hourlyRate * duration;
//       if ('flatFee' in equipment) {
//         totalPrice += equipment.flatFee;
//       }
//       if ('perCupRate' in equipment) {
//         totalPrice += equipment.perCupRate * guestCount;
//       }
//     }
//   });

//   // Add selected drinks cost
//   formData.selectedDrinks.forEach(drinkId => {
//     const drink = findDrinkById(drinkId);
//     if (drink?.price) {
//       totalPrice += drink.price * guestCount;
//     }
//   });

//   // Add add-on experiences
//   formData.addOnExperiences.forEach(addon => {
//     const experience = ADD_ON_EXPERIENCES[addon as keyof typeof ADD_ON_EXPERIENCES];
//     if (experience) {
//       totalPrice += experience.price;
//     }
//   });

//   // Add branding costs
//   if (formData.customBranding !== 'none') {
//     const brandingOption = BRANDING_OPTIONS[formData.customBranding] as BrandingOption;
//     if (brandingOption) {
//       if ('baseFee' in brandingOption) {
//         totalPrice += brandingOption.baseFee + (brandingOption.perCupRate * guestCount);
//       } else {
//         totalPrice += brandingOption.price * Math.max(brandingOption.minimumOrder, guestCount);
//       }
//     }
//   }

//   // Add custom uniform costs
//   if (formData.staffUniform === 'custom') {
//     totalPrice += 50 * (baseStaff + additionalBaristas);
//   }

//   // Add custom drink development fee
//   if (formData.customDrink.trim()) {
//     totalPrice += 200;
//   }

//   // Apply volume discounts
//   if (duration >= 12) {
//     totalPrice *= 0.85; // 15% off
//   } else if (duration >= 8) {
//     totalPrice *= 0.90; // 10% off
//   }

//   return totalPrice;
// };
// // Helper function to find a drink by ID
// const findDrinkById = (drinkId: string): DrinkType | undefined => {
//   return (
//     DRINK_TYPES.specialty.find(d => d.id === drinkId) ||
//     DRINK_TYPES.nonCoffee.find(d => d.id === drinkId)
//   );
// };

// export const calculateHybridModelPrice = (duration: number, guestCount: number, formData: FormData): number => {
//   let totalPrice = PRICING_MODELS.hybrid.basePrice;

//   // Additional hours
//   if (duration > 4) {
//     totalPrice += PRICING_MODELS.hybrid.additionalHourRate * (duration - 4);
//   }

//   // Additional cups
//   if (guestCount > PRICING_MODELS.hybrid.includedCups) {
//     const additionalCups = guestCount - PRICING_MODELS.hybrid.includedCups;
//     for (const rate of PRICING_MODELS.hybrid.cupRates) {
//       const [min, max] = rate.range;
//       if (additionalCups > min) {
//         const cupsInRange = Math.min(additionalCups - min, max - min);
//         totalPrice += cupsInRange * rate.price;
//       }
//     }
//   }

//   // Equipment upgrades
//   formData.equipmentUpgrades.forEach(upgrade => {
//     const equipment = EQUIPMENT_UPGRADES[upgrade as keyof EquipmentUpgrades];
//     if (equipment) {
//       if ('flatFee' in equipment) {
//         totalPrice += equipment.flatFee;
//       }
//       if ('perCupRate' in equipment) {
//         totalPrice += equipment.perCupRate * guestCount;
//       }
//       totalPrice += equipment.hourlyRate * duration;
//     }
//   });

//   // Selected drinks cost
//   formData.selectedDrinks.forEach(drinkId => {
//     const drink = findDrinkById(drinkId);
//     if (drink?.price) {
//       totalPrice += drink.price * guestCount;
//     }
//   });

//   // Add-on experiences
//   formData.addOnExperiences.forEach(addon => {
//     const experience = ADD_ON_EXPERIENCES[addon as keyof typeof ADD_ON_EXPERIENCES];
//     if (experience) {
//       totalPrice += experience.price;
//     }
//   });

//   // Branding options
//   if (formData.customBranding !== 'none') {
//     const brandingOption = BRANDING_OPTIONS[formData.customBranding] as BrandingOption;
//     if (brandingOption) {
//       if ('baseFee' in brandingOption) {
//         totalPrice += brandingOption.baseFee + (brandingOption.perCupRate * guestCount);
//       } else {
//         totalPrice += brandingOption.price * Math.max(brandingOption.minimumOrder, guestCount);
//       }
//     }
//   }

//   // Custom uniform costs
//   if (formData.staffUniform === 'custom') {
//     const additionalBaristas = Math.max(0, Math.floor((guestCount - 300) / 150));
//     totalPrice += 50 * (2 + additionalBaristas);
//   }

//   // Custom drink development
//   if (formData.customDrink.trim()) {
//     totalPrice += 200;
//   }

//   // Volume discount
//   if (duration > 8) {
//     totalPrice *= 0.90;
//   }

//   return totalPrice;
// };
// export const calculateDetailedBreakdown = (
//   formData: FormData,
//   guestCount: number,
//   duration: number,
//   model: string,
//   totalPrice: number
// ): QuoteBreakdown[] => {
//   const breakdown: QuoteBreakdown[] = [];

//   // Base Services Section
//   const baseServices: QuoteBreakdown = {
//     category: 'Base Services',
//     items: [],
//     subtotal: 0
//   };

//   // Calculate base service cost based on model
//   if (model === 'By-the-Cup Model') {
//     const basePrice = PRICING_MODELS.byTheCup.breakpoints.find(
//       b => guestCount <= b.threshold
//     )?.price || PRICING_MODELS.byTheCup.basePrice;

//     let baseAmount = basePrice * guestCount;
//     if (baseAmount < PRICING_MODELS.byTheCup.minimumCharge && guestCount <= 200) {
//       baseAmount = PRICING_MODELS.byTheCup.minimumCharge;
//     }

//     baseServices.items.push({
//       label: 'Per Cup Service',
//       amount: baseAmount,
//       details: `$${basePrice} × ${guestCount} guests (minimum charge: $${PRICING_MODELS.byTheCup.minimumCharge})`
//     });

//     // Add staffing costs
//     const additionalBaristas = Math.max(0, Math.floor((guestCount - 500) / 250));
//     if (additionalBaristas > 0) {
//       baseServices.items.push({
//         label: 'Additional Staff',
//         amount: 200 * additionalBaristas,
//         details: `${additionalBaristas} additional baristas × $200 each`
//       });
//     }
//   } else if (model === 'Hourly Rate Model') {
//     // Base hourly rate
//     baseServices.items.push({
//       label: 'Base Hourly Rate',
//       amount: PRICING_MODELS.hourlyRate.basePrice * duration,
//       details: `$${PRICING_MODELS.hourlyRate.basePrice} × ${duration} hours`
//     });

//     // Peak hour surcharge
//     if (duration > 4) {
//       baseServices.items.push({
//         label: 'Peak Hours Surcharge',
//         amount: PRICING_MODELS.hourlyRate.peakHourSurcharge * (duration - 4),
//         details: `$${PRICING_MODELS.hourlyRate.peakHourSurcharge} × ${duration - 4} additional hours`
//       });
//     }

//     // Additional staff
//     const additionalBaristas = Math.max(0, Math.floor((guestCount - 75) / 75));
//     if (additionalBaristas > 0) {
//       baseServices.items.push({
//         label: 'Additional Staff',
//         amount: PRICING_MODELS.hourlyRate.additionalStaffRate * duration * additionalBaristas,
//         details: `${additionalBaristas} additional baristas × $${PRICING_MODELS.hourlyRate.additionalStaffRate}/hr × ${duration} hours`
//       });
//     }
//   } else {
//     // Hybrid Model
//     baseServices.items.push({
//       label: 'Base Package',
//       amount: PRICING_MODELS.hybrid.basePrice,
//       details: `Includes first ${PRICING_MODELS.hybrid.includedCups} cups and 4 hours of service`
//     });

//     // Additional hours
//     if (duration > 4) {
//       baseServices.items.push({
//         label: 'Additional Hours',
//         amount: PRICING_MODELS.hybrid.additionalHourRate * (duration - 4),
//         details: `$${PRICING_MODELS.hybrid.additionalHourRate} × ${duration - 4} additional hours`
//       });
//     }

//     // Additional cups
//     if (guestCount > PRICING_MODELS.hybrid.includedCups) {
//       const additionalCups = guestCount - PRICING_MODELS.hybrid.includedCups;
//       let cupCost = 0;
//       let cupDetails: string[] = [];

//       for (const rate of PRICING_MODELS.hybrid.cupRates) {
//         const [min, max] = rate.range;
//         if (additionalCups > min) {
//           const cupsInRange = Math.min(additionalCups - min, max - min);
//           cupCost += cupsInRange * rate.price;
//           cupDetails.push(`${cupsInRange} cups at $${rate.price} each`);
//         }
//       }

//       baseServices.items.push({
//         label: 'Additional Cups',
//         amount: cupCost,
//         details: cupDetails.join(', ')
//       });
//     }
//   }

//   baseServices.subtotal = baseServices.items.reduce((sum, item) => sum + item.amount, 0);
//   breakdown.push(baseServices);

//   // Equipment & Additional Services Section
//   if (formData.equipmentUpgrades.size > 0 || formData.selectedDrinks.size > 0) {
//     const additionalServices: QuoteBreakdown = {
//       category: 'Equipment & Additional Services',
//       items: [],
//       subtotal: 0
//     };

//     // Equipment upgrades
//     formData.equipmentUpgrades.forEach(upgrade => {
//       const equipment = EQUIPMENT_UPGRADES[upgrade as keyof typeof EQUIPMENT_UPGRADES];
//       if (equipment) {
//         let amount = 0;
//         const details: string[] = [];

//         if ('hourlyRate' in equipment && equipment.hourlyRate) {
//           amount += equipment.hourlyRate * duration;
//           details.push(`$${equipment.hourlyRate}/hr × ${duration} hours`);
//         }

//         if ('flatFee' in equipment && equipment.flatFee) {
//           amount += equipment.flatFee;
//           details.push(`$${equipment.flatFee} setup fee`);
//         }

//         if ('perCupRate' in equipment && equipment.perCupRate) {
//           amount += equipment.perCupRate * guestCount;
//           details.push(`$${equipment.perCupRate}/cup × ${guestCount} guests`);
//         }

//         additionalServices.items.push({
//           label: upgrade,
//           amount,
//           details: details.join(', ')
//         });
//       }
//     });

//     // Specialty drinks
//     formData.selectedDrinks.forEach(drinkId => {
//       const specialtyDrink = DRINK_TYPES.specialty.find(d => d.id === drinkId);
//       const nonCoffeeDrink = DRINK_TYPES.nonCoffee.find(d => d.id === drinkId);
//       if (specialtyDrink || nonCoffeeDrink) {
//         const drink = specialtyDrink || nonCoffeeDrink;
//         if (drink && drink.price) {
//           additionalServices.items.push({
//             label: `${drink.name} Premium`,
//             amount: drink.price * guestCount,
//             details: `$${drink.price}/cup × ${guestCount} guests`
//           });
//         }
//       }
//     });

//     additionalServices.subtotal = additionalServices.items.reduce((sum, item) => sum + item.amount, 0);
//     if (additionalServices.items.length > 0) {
//       breakdown.push(additionalServices);
//     }
//   }

//   // Customization & Add-Ons Section
//   if (formData.addOnExperiences.size > 0 || formData.customBranding !== 'none' || 
//       formData.staffUniform === 'custom' || formData.customDrink.trim()) {
//     const customization: QuoteBreakdown = {
//       category: 'Customization & Add-Ons',
//       items: [],
//       subtotal: 0
//     };

//     // Add-on experiences
//     formData.addOnExperiences.forEach(addon => {
//       const experience = ADD_ON_EXPERIENCES[addon as keyof typeof ADD_ON_EXPERIENCES];
//       if (experience && 'maxParticipants' in experience) {
//         customization.items.push({
//           label: addon,
//           amount: experience.price,
//           details: `${experience.duration}hr session, max ${experience.maxParticipants} participants${
//             'includes' in experience ? `, includes ${experience.includes}` : ''
//           }`
//         });
//       }
//     });

//     // Branding
//     if (formData.customBranding !== 'none') {
//       const brandingOption = BRANDING_OPTIONS[formData.customBranding];
//       if (brandingOption) {
//         let amount = 0;
//         let details = '';

//         if ('baseFee' in brandingOption) {
//           amount = brandingOption.baseFee + (brandingOption.perCupRate * guestCount);
//           details = `Base fee: $${brandingOption.baseFee}, Per cup: $${brandingOption.perCupRate} × ${guestCount}`;
//         } else {
//           const minOrder = Math.max(brandingOption.minimumOrder, guestCount);
//           amount = brandingOption.price * minOrder;
//           details = `$${brandingOption.price} × ${minOrder} cups (minimum: ${brandingOption.minimumOrder})`;
//         }

//         customization.items.push({
//           label: `${formData.customBranding} Branding`,
//           amount,
//           details
//         });
//       }
//     }

//     // Custom uniforms
//     if (formData.staffUniform === 'custom') {
//       const baseStaff = 2;
//       let additionalBaristas = 0;

//       if (model === 'By-the-Cup Model') {
//         additionalBaristas = Math.max(0, Math.floor((guestCount - 500) / 250));
//       } else if (model === 'Hourly Rate Model') {
//         additionalBaristas = Math.max(0, Math.floor((guestCount - 75) / 75));
//       } else {
//         additionalBaristas = Math.max(0, Math.floor((guestCount - 300) / 150));
//       }

//       const staffCount = baseStaff + additionalBaristas;
//       const uniformCost = 50 * staffCount;

//       customization.items.push({
//         label: 'Custom Uniforms',
//         amount: uniformCost,
//         details: `$50 × ${staffCount} staff members`
//       });
//     }

//     // Custom drink development
//     if (formData.customDrink.trim()) {
//       customization.items.push({
//         label: 'Custom Drink Development',
//         amount: 200,
//         details: 'One-time recipe development fee'
//       });
//     }

//     customization.subtotal = customization.items.reduce((sum, item) => sum + item.amount, 0);
//     if (customization.items.length > 0) {
//       breakdown.push(customization);
//     }
//   }

//   // Discounts Section
//   if ((model === 'Hourly Rate Model' && duration >= 8) || 
//       (model === 'Hybrid Model' && duration > 8)) {
//     const discounts: QuoteBreakdown = {
//       category: 'Discounts',
//       items: [],
//       subtotal: 0
//     };

//     if (model === 'Hourly Rate Model') {
//       if (duration >= 12) {
//         const discountAmount = -(totalPrice * 0.15);
//         discounts.items.push({
//           label: 'Volume Discount (12+ hours)',
//           amount: discountAmount,
//           details: '15% off total'
//         });
//       } else if (duration >= 8) {
//         const discountAmount = -(totalPrice * 0.10);
//         discounts.items.push({
//           label: 'Volume Discount (8+ hours)',
//           amount: discountAmount,
//           details: '10% off total'
//         });
//       }
//     } else if (model === 'Hybrid Model' && duration > 8) {
//       const discountAmount = -(totalPrice * 0.10);
//       discounts.items.push({
//         label: 'Volume Discount (8+ hours)',
//         amount: discountAmount,
//         details: '10% off total'
//       });
//     }

//     discounts.subtotal = discounts.items.reduce((sum, item) => sum + item.amount, 0);
//     if (discounts.items.length > 0) {
//       breakdown.push(discounts);
//     }
//   }

//   return breakdown;
// };

// export const validateDates = (startDate: string, endDate?: string): boolean => {
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
  
//   const eventDate = new Date(startDate);
//   if (eventDate < today) {
//     return false;
//   }

//   if (endDate) {
//     const eventEndDate = new Date(endDate);
//     if (eventEndDate < eventDate) {
//       return false;
//     }
//   }

//   return true;
// };

// export const generateTimelinePoints = (
//   startTime: string,
//   duration: number,
//   bookedAddOns: BookedAddOn[]
// ): TimelinePoint[] => {
//   const points: TimelinePoint[] = [];
//   const startDate = new Date(`2000-01-01T${startTime}`);

//   for (let i = 0; i <= duration; i++) {
//     const timePoint = new Date(startDate);
//     timePoint.setHours(timePoint.getHours() + i);
//     const timeString = timePoint.toTimeString().slice(0, 5);
    
//     points.push({
//       time: timeString,
//       events: bookedAddOns.filter(addon => addon.time === timeString)
//     });
//   }

//   return points;
// };

// export const formatCurrency = (amount: number): string => {
//   return new Intl.NumberFormat('en-US', {
//     style: 'currency',
//     currency: 'USD',
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2
//   }).format(amount);
// };

// export const calculateStaffing = (guestCount: number, model: string): number => {
//   const baseStaff = 2; // Minimum 2 staff members
//   let additionalBaristas = 0;

//   switch (model) {
//     case 'By-the-Cup Model':
//       additionalBaristas = Math.max(0, Math.floor((guestCount - 500) / 250));
//       break;
//     case 'Hourly Rate Model':
//       additionalBaristas = Math.max(0, Math.floor((guestCount - 75) / 75));
//       break;
//     default: // Hybrid Model
//       additionalBaristas = Math.max(0, Math.floor((guestCount - 300) / 150));
//   }

//   return baseStaff + additionalBaristas;
// };

// export const isValidEmail = (email: string): boolean => {
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   return emailRegex.test(email);
// };

// export const isValidPhone = (phone: string): boolean => {
//   const phoneRegex = /^\+?[\d\s-()]{10,}$/;
//   return phoneRegex.test(phone);
// };

// export const calculateTotalTime = (duration: number, addOns: BookedAddOn[]): number => {
//   const setupTime = 1; // 1 hour setup
//   const teardownTime = 1; // 1 hour teardown
//   const addOnTime = addOns.reduce((total, addon) => {
//     const experience = ADD_ON_EXPERIENCES[addon.service as keyof typeof ADD_ON_EXPERIENCES];
//     return total + (experience?.duration || 0);
//   }, 0);

//   return duration + setupTime + teardownTime + addOnTime;
// };