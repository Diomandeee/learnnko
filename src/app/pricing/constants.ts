export const PRICING_MODELS = {
  byTheCup: {
    basePrice: 5.50,
    breakpoints: [
      { threshold: 200, price: 5.50 },
      { threshold: 500, price: 5.00 },
      { threshold: 1000, price: 4.50 },
      { threshold: Infinity, price: 4.00 }
    ],
    minimumCharge: 1000
  },
  hourlyRate: {
    basePrice: 250,
    minimumHours: 4,
    peakHourSurcharge: 50,
    additionalStaffRate: 75
  },
  hybrid: {
    basePrice: 1500,
    includedCups: 300,
    additionalHourRate: 200,
    cupRates: [
      { range: [301, 500], price: 4.75 },
      { range: [501, 1000], price: 4.25 },
      { range: [1001, Infinity], price: 3.75 }
    ]
  }
};

export const EQUIPMENT_UPGRADES = {
  pourOverBar: {
    hourlyRate: 150,
    flatFee: 200,
    perCupRate: 1.50
  },
  nitroColdBrew: {
    hourlyRate: 200,
    flatFee: 300,
    perCupRate: 2.00
  },
  extraEspressoMachine: {
    hourlyRate: 100
  },
  latteArtStation: {
    hourlyRate: 90
  }
};

export const ADD_ON_EXPERIENCES = {
  latteArtDemo: {
    price: 250,
    duration: 1
  },
  coffeeTasting: {
    price: 300,
    duration: 1
  },
  baristaWorkshop: {
    price: 400,
    duration: 2,
    maxParticipants: 20
  },
  coffeeRoasting: {
    price: 500,
    duration: 2,
    maxParticipants: 15,
    includes: 'Take home 1lb of freshly roasted coffee'
  },
  espressoMasterclass: {
    price: 350,
    duration: 2,
    maxParticipants: 12
  },
  brewingTechniques: {
    price: 275,
    duration: 1.5,
    maxParticipants: 15
  },
  coffeeAndChocolatePairing: {
    price: 450,
    duration: 2,
    maxParticipants: 20,
    includes: 'Premium chocolate tasting selection'
  },
  customBlendCreation: {
    price: 600,
    duration: 3,
    maxParticipants: 10,
    includes: '1lb of custom created blend'
  },
  coldBrewWorkshop: {
    price: 325,
    duration: 1.5,
    maxParticipants: 15,
    includes: 'Take home cold brew kit'
  },
  seasonalDrinkCrafting: {
    price: 375,
    duration: 2,
    maxParticipants: 18
  }
};

export const BRANDING_OPTIONS = {
  cups: {
    price: 0.75,
    minimumOrder: 300
  },
  deluxe: {
    price: 1.00,
    minimumOrder: 500
  },
  full: {
    baseFee: 300,
    perCupRate: 0.75
  }
};

export const DRINK_TYPES = {
  standard: [
    { id: 'espresso', name: 'Espresso', included: true },
    { id: 'americano', name: 'Americano', included: true },
    { id: 'cappuccino', name: 'Cappuccino', included: true },
    { id: 'latte', name: 'Latte', included: true },
    { id: 'flatWhite', name: 'Flat White', included: true },
    { id: 'mocha', name: 'Mocha', included: true },
    { id: 'cortado', name: 'Cortado', included: true },
  ],
  specialty: [
    { id: 'caramelMacchiato', name: 'Caramel Macchiato', price: 1.00 },
    { id: 'vanillaLatte', name: 'Vanilla Latte', price: 1.00 },
    { id: 'hazelnutLatte', name: 'Hazelnut Latte', price: 1.00 },
    { id: 'icedCoffee', name: 'Iced Coffee', price: 1.00 },
    { id: 'coldBrew', name: 'Cold Brew', price: 1.00 }
  ],
  nonCoffee: [
    { id: 'hotChocolate', name: 'Hot Chocolate', price: 0.50 },
    { id: 'chaiLatte', name: 'Chai Latte', price: 0.50 },
    { id: 'greenTea', name: 'Green Tea', price: 0.50 },
    { id: 'blackTea', name: 'Black Tea', price: 0.50 },
    { id: 'herbalTea', name: 'Herbal Tea', price: 0.50 },
    { id: 'matchaLatte', name: 'Matcha Latte', price: 0.50 },
    { id: 'icedTea', name: 'Iced Tea', price: 0.50 }
  ]
};

export const EVENT_TYPES = [
  { value: 'tradeShow', label: 'Trade Show' },
  { value: 'convention', label: 'Convention' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'festival', label: 'Festival' },
  { value: 'conference', label: 'Conference' },
  { value: 'productLaunch', label: 'Product Launch' },
  { value: 'fashionShow', label: 'Fashion Show' },
  { value: 'fundraiser', label: 'Fundraiser' },
  { value: 'graduation', label: 'Graduation' },
  { value: 'birthdayParty', label: 'Birthday Party' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'reunion', label: 'Reunion' },
  { value: 'artGallery', label: 'Art Gallery Opening' },
  { value: 'moviePremiere', label: 'Movie Premiere' },
  { value: 'bookLaunch', label: 'Book Launch' },
  { value: 'sportsEvent', label: 'Sports Event' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'meetAndGreet', label: 'Meet and Greet' },
  { value: 'networking', label: 'Networking Event' },
  { value: 'other', label: 'Other' }
];


// src/app/pricing/constants.ts