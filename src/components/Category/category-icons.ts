// Import needed Phosphor icons (tree-shaken by bundler)
import {
  PhAirplane,
  PhBaby,
  PhBank,
  PhBed,
  PhBookOpen,
  PhBrain,
  PhBus,
  PhCar,
  PhClipboardText,
  PhCoffee,
  PhCookingPot,
  PhCreditCard,
  PhDeviceMobile,
  PhFilmSlate,
  PhFirstAid,
  PhForkKnife,
  PhGameController,
  PhGift,
  PhGraduationCap,
  PhHammer,
  PhHeart,
  PhHouse,
  PhLeaf,
  PhLightning,
  PhMusicNotes,
  PhPaintBrush,
  PhPawPrint,
  PhPill,
  PhPizza,
  PhPlug,
  PhQuestion,
  PhReceipt,
  PhRecycle,
  PhShieldCheck,
  PhShoppingBag,
  PhShoppingCart,
  PhSoccerBall,
  PhTicket,
  PhTShirt,
  PhUmbrella,
  PhUsers,
  PhGasPump,
  PhTooth,
  PhWifiHigh,
  PhWine
} from "@phosphor-icons/vue";
import type { Component } from "vue";

import type { Subcategory } from "@/libs/categories";

// Central mapping: every Subcategory must have an icon. Missing keys -> TS error.
export const categoryIconMap: Record<Subcategory, Component> = {
  // food
  dining_out: PhForkKnife,
  groceries: PhShoppingCart,
  snacks: PhCookingPot,
  liquor: PhWine,
  cafe: PhCoffee,
  takeout_delivery: PhPizza,
  meal_kit: PhCookingPot,
  other_food: PhQuestion,

  // transport
  public_transport: PhBus,
  taxi_ride_hailing: PhCar,
  fuel: PhGasPump,
  parking: PhCar,
  vehicle_maintenance: PhHammer,
  vehicle_purchase: PhCar,
  tolls: PhReceipt,
  bike_share: PhQuestion, // replace with bike icon when added
  other_transport: PhQuestion,

  // entertainment
  movies: PhFilmSlate,
  music: PhMusicNotes,
  events_concerts: PhTicket,
  games: PhGameController,
  streaming_subscriptions: PhFilmSlate,
  nightlife: PhWine,
  hobbies: PhPaintBrush,
  books_media: PhBookOpen,
  other_entertainment: PhQuestion,

  // home
  rent_mortgage: PhHouse,
  maintenance_repairs: PhHammer,
  furnishings: PhHouse,
  cleaning_supplies: PhRecycle,
  home_improvement: PhHammer,
  home_security: PhShieldCheck,
  hoa: PhHouse,
  other_home: PhQuestion,

  // bills
  electricity: PhLightning,
  water: PhUmbrella,
  gas_utility: PhGasPump,
  internet: PhWifiHigh,
  mobile_phone: PhDeviceMobile,
  trash_recycling: PhRecycle,
  tv_streaming: PhFilmSlate,
  other_bills: PhQuestion,

  // travel
  flights: PhAirplane,
  lodging: PhBed,
  local_transport: PhCar,
  travel_food: PhForkKnife,
  activities_tours: PhTicket,
  travel_insurance: PhShieldCheck,
  visa_fees: PhReceipt,
  other_travel: PhQuestion,

  // shopping
  clothing: PhTShirt,
  electronics: PhDeviceMobile,
  household_goods: PhShoppingBag,
  appliances: PhPlug,
  office_supplies: PhClipboardText,
  other_shopping: PhQuestion,

  // health
  pharmacy: PhPill,
  doctor: PhFirstAid,
  dentist: PhTooth,
  hospital: PhFirstAid,
  vision: PhQuestion, // add eye icon later
  mental_health: PhBrain,
  other_health: PhQuestion,

  // personal care
  hair: PhUsers,
  spa: PhHeart,
  cosmetics: PhPaintBrush,
  grooming: PhUsers,
  laundry_dry_cleaning: PhTShirt,
  other_personal_care: PhQuestion,

  // education
  tuition: PhGraduationCap,
  courses: PhBookOpen,
  books: PhBookOpen,
  supplies: PhClipboardText,
  student_fees: PhReceipt,
  other_education: PhQuestion,

  // gifts & donations
  gifts: PhGift,
  charity: PhHeart,
  celebrations: PhGift,
  other_gifts_donations: PhQuestion,

  // kids
  childcare: PhBaby,
  school_supplies: PhClipboardText,
  toys: PhGameController,
  clothing_kids: PhTShirt,
  activities_lessons: PhGraduationCap,
  other_kids: PhQuestion,

  // pets
  pet_food: PhForkKnife,
  vet: PhFirstAid,
  grooming_pets: PhPawPrint,
  boarding: PhPawPrint,
  pet_supplies: PhShoppingBag,
  other_pets: PhQuestion,

  // sports & fitness
  gym: PhSoccerBall,
  sports_equipment: PhSoccerBall,
  fitness_classes: PhSoccerBall,
  outdoor_activities: PhLeaf,
  other_sports_fitness: PhQuestion,

  // insurance
  health_insurance: PhShieldCheck,
  car_insurance: PhShieldCheck,
  home_insurance: PhShieldCheck,
  life_insurance: PhHeart,
  travel_insurance_premium: PhShieldCheck,
  other_insurance: PhQuestion,

  // taxes
  income_tax: PhReceipt,
  property_tax: PhHouse,
  sales_tax: PhReceipt,
  other_taxes: PhQuestion,

  // fees & charges
  bank_fees: PhBank,
  late_fees: PhReceipt,
  service_fees: PhReceipt,
  atm_fees: PhBank,
  platform_fees: PhReceipt,
  other_fees_charges: PhQuestion,

  // debt
  loan_payment: PhBank,
  credit_card_payment: PhCreditCard,
  other_debt: PhQuestion,

  // other
  uncategorized: PhQuestion,
  other_misc: PhQuestion
};

export type CategoryIconKey = keyof typeof categoryIconMap;
