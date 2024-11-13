import { MenuItem, MilkOption } from '@/types/pos';

export const INITIAL_MENU_ITEMS: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
 { name: 'Espresso', price: 2.5, category: 'Coffee', popular: true, active: true },
 { name: 'Americano', price: 3.0, category: 'Coffee', popular: false, active: true },
 { name: 'Latte', price: 3.5, category: 'Coffee', popular: true, active: true },
 { name: 'Cappuccino', price: 3.5, category: 'Coffee', popular: true, active: true },
 { name: 'Flat White', price: 3.5, category: 'Coffee', popular: false, active: true },
 { name: 'Cortado', price: 3.5, category: 'Coffee', popular: false, active: true },
 { name: 'Caramel Crunch Crusher', price: 4.5, category: 'Specialty', popular: true, active: true },
 { name: 'Vanilla Dream Latte', price: 4.5, category: 'Specialty', popular: false, active: true },
 { name: 'Hazelnut Heaven Cappuccino', price: 4.5, category: 'Specialty', popular: false, active: true }
];

export const FLAVOR_OPTIONS = [
 'No Flavoring',
 'Vanilla',
 'Caramel',
 'Hazelnut',
 'Raspberry',
 'Pumpkin Spice'
] as const;

export const MILK_OPTIONS: MilkOption[] = [
 { name: 'No Milk', price: 0 },
 { name: 'Whole Milk', price: 0 },
 { name: 'Oat Milk', price: 0 }
];

export const CATEGORIES = [
 'Coffee',
 'Specialty',
 'Tea',
 'Cold Drinks',
 'Food'
] as const;

export type Category = typeof CATEGORIES[number];
export type FlavorOption = typeof FLAVOR_OPTIONS[number];
