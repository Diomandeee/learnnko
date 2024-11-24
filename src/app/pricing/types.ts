// Equipment-related types
interface BaseEquipment {
  hourlyRate: number;
  flatFee?: number;
  perCupRate?: number;
}

interface FullEquipment extends BaseEquipment {
  hourlyRate: number;
  flatFee: number;
  perCupRate: number;
}

interface SimpleEquipment extends BaseEquipment {
  hourlyRate: number;
}

export interface EquipmentUpgrades {
  pourOverBar: FullEquipment;
  nitroColdBrew: FullEquipment;
  extraEspressoMachine: SimpleEquipment;
  latteArtStation: SimpleEquipment;
}

// Branding-related types
interface BaseBrandingOption {
  minimumOrder?: number;
}

interface PricedBrandingOption extends BaseBrandingOption {
  price: number;
  minimumOrder: number;
}

interface RatedBrandingOption extends BaseBrandingOption {
  baseFee: number;
  perCupRate: number;
}

export type BrandingOption = PricedBrandingOption | RatedBrandingOption;

// Form data interface
export interface FormData {
  name: string;
  email: string;
  phone: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventDuration: string;
  multiDayEvent: boolean;
  eventEndDate: string;
  recurringEvent: boolean;
  recurringFrequency: 'daily' | 'weekly' | 'monthly';
  guestCount: string;
  eventType: string;
  eventLocation: string;
  customBranding: 'none' | 'cups' | 'deluxe' | 'full';
  staffUniform: 'standard' | 'custom';
  customDrink: string;
  specialInstructions: string;
  selectedDrinks: Set<string>;
  equipmentUpgrades: Set<string>;
  addOnExperiences: Set<string>;
  selectedAddOn?: string;
  selectedTime?: string;
}

// Add-on related types
export interface BookedAddOn {
  service: string;
  time: string;
}

export interface AddOnExperience {
  price: number;
  duration: number;
  maxParticipants: number;
  includes?: string;
}

// Quote-related types
export interface QuoteResult {
  totalPrice: number;
  recommendedModel: string;
  breakdown: QuoteBreakdown[];
}

export interface QuoteBreakdown {
  category: string;
  items: {
    label: string;
    amount: number;
    details?: string;
  }[];
  subtotal: number;
}

// Pricing model types
export interface PricingModelBreakpoint {
  threshold: number;
  price: number;
}

export interface ByTheCupModel {
  basePrice: number;
  breakpoints: PricingModelBreakpoint[];
  minimumCharge: number;
}

export interface HourlyRateModel {
  basePrice: number;
  minimumHours: number;
  peakHourSurcharge: number;
  additionalStaffRate: number;
}

export interface HybridModelCupRate {
  range: [number, number];
  price: number;
}

export interface HybridModel {
  basePrice: number;
  includedCups: number;
  additionalHourRate: number;
  cupRates: HybridModelCupRate[];
}

export interface PricingModels {
  byTheCup: ByTheCupModel;
  hourlyRate: HourlyRateModel;
  hybrid: HybridModel;
}

// Drink-related types
export interface DrinkType {
  id: string;
  name: string;
  price?: number;
  included?: boolean;
}

export interface DrinkTypes {
  standard: DrinkType[];
  specialty: DrinkType[];
  nonCoffee: DrinkType[];
}

// Timeline-related types
export interface TimelinePoint {
  time: string;
  events: BookedAddOn[];
}

// Event type interface
export interface EventType {
  value: string;
  label: string;
}
  // src/app/pricing/types.ts