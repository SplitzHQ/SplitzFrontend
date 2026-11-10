// oxlint-disable sort-keys
// Import needed Phosphor icons (tree-shaken by bundler)
import {
  PhAirplane,
  PhArmchair,
  PhBaby,
  PhBank,
  PhBarbell,
  PhBed,
  PhBicycle,
  PhBone,
  PhBookOpen,
  PhBrain,
  PhBroom,
  PhBuildings,
  PhBus,
  PhCar,
  PhChalkboardTeacher,
  PhClipboardText,
  PhClockCountdown,
  PhCoffee,
  PhConfetti,
  PhCookie,
  PhCookingPot,
  PhCreditCard,
  PhDeviceMobile,
  PhDrop,
  PhEye,
  PhFilmSlate,
  PhFirstAid,
  PhFlame,
  PhFlowerLotus,
  PhForkKnife,
  PhGameController,
  PhGarage,
  PhGasPump,
  PhGift,
  PhGraduationCap,
  PhHairDryer,
  PhHammer,
  PhHeart,
  PhHospital,
  PhHouse,
  PhLeaf,
  PhLego,
  PhLightning,
  PhMoney,
  PhMonitorPlay,
  PhMusicNotes,
  PhPaintBrush,
  PhPawPrint,
  PhPersonSimpleTaiChi,
  PhPill,
  PhPizza,
  PhPlug,
  PhQuestion,
  PhReceipt,
  PhRecycle,
  PhScissors,
  PhShieldCheck,
  PhShoppingBag,
  PhShoppingCart,
  PhSoccerBall,
  PhStethoscope,
  PhStorefront,
  PhTShirt,
  PhTaxi,
  PhTelevision,
  PhTicket,
  PhTooth,
  PhWashingMachine,
  PhWifiHigh,
  PhWine,
  PhWrench,
} from "@phosphor-icons/vue";
import type { Component } from "vue";

import type { Subcategory } from "@/libs/categories";

/**
 * The icon of each subcategory. The type check fails when a subcategory has no icon.
 * PhQuestion is correct for an `other_*` bucket and for `uncategorized`. See `category.usage.ts`.
 */
export const categoryIconMap: Record<Subcategory, Component> = {
  // food
  dining_out: PhForkKnife,
  groceries: PhShoppingCart,
  snacks: PhCookie,
  liquor: PhWine,
  cafe: PhCoffee,
  takeout_delivery: PhPizza,
  meal_kit: PhCookingPot,
  other_food: PhQuestion,

  // transport
  public_transport: PhBus,
  taxi_ride_hailing: PhTaxi,
  fuel: PhGasPump,
  parking: PhGarage,
  vehicle_maintenance: PhHammer,
  vehicle_purchase: PhCar,
  tolls: PhReceipt,
  bike_share: PhBicycle,
  other_transport: PhQuestion,

  // entertainment
  movies: PhFilmSlate,
  music: PhMusicNotes,
  events_concerts: PhTicket,
  games: PhGameController,
  streaming_subscriptions: PhMonitorPlay,
  nightlife: PhWine,
  hobbies: PhPaintBrush,
  books_media: PhBookOpen,
  other_entertainment: PhQuestion,

  // home
  rent_mortgage: PhHouse,
  maintenance_repairs: PhWrench,
  furnishings: PhArmchair,
  cleaning_supplies: PhBroom,
  home_improvement: PhHammer,
  home_security: PhShieldCheck,
  hoa: PhBuildings,
  other_home: PhQuestion,

  // bills
  electricity: PhLightning,
  water: PhDrop,
  gas_utility: PhFlame,
  internet: PhWifiHigh,
  mobile_phone: PhDeviceMobile,
  trash_recycling: PhRecycle,
  tv_streaming: PhTelevision,
  other_bills: PhQuestion,

  // travel
  flights: PhAirplane,
  lodging: PhBed,
  local_transport: PhCar,
  travel_food: PhForkKnife,
  activities_tours: PhTicket,
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
  doctor: PhStethoscope,
  dentist: PhTooth,
  hospital: PhHospital,
  vision: PhEye,
  mental_health: PhBrain,
  other_health: PhQuestion,

  // personal care
  hair: PhScissors,
  spa: PhFlowerLotus,
  cosmetics: PhPaintBrush,
  grooming: PhHairDryer,
  laundry_dry_cleaning: PhWashingMachine,
  other_personal_care: PhQuestion,

  // education
  tuition: PhGraduationCap,
  courses: PhChalkboardTeacher,
  books: PhBookOpen,
  supplies: PhClipboardText,
  student_fees: PhReceipt,
  other_education: PhQuestion,

  // gifts & donations
  gifts: PhGift,
  charity: PhHeart,
  celebrations: PhConfetti,
  other_gifts_donations: PhQuestion,

  // kids
  childcare: PhBaby,
  school_supplies: PhClipboardText,
  toys: PhLego,
  clothing_kids: PhTShirt,
  activities_lessons: PhGraduationCap,
  other_kids: PhQuestion,

  // pets
  pet_food: PhBone,
  vet: PhFirstAid,
  grooming_pets: PhScissors,
  boarding: PhPawPrint,
  pet_supplies: PhShoppingBag,
  other_pets: PhQuestion,

  // sports & fitness
  gym: PhBarbell,
  sports_equipment: PhSoccerBall,
  fitness_classes: PhPersonSimpleTaiChi,
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
  income_tax: PhMoney,
  property_tax: PhHouse,
  sales_tax: PhReceipt,
  other_taxes: PhQuestion,

  // fees & charges
  bank_fees: PhBank,
  late_fees: PhClockCountdown,
  service_fees: PhReceipt,
  atm_fees: PhMoney,
  platform_fees: PhStorefront,
  other_fees_charges: PhQuestion,

  // debt
  loan_payment: PhBank,
  credit_card_payment: PhCreditCard,
  other_debt: PhQuestion,

  // other
  uncategorized: PhQuestion,
  other_misc: PhQuestion,
};

export type CategoryIconKey = keyof typeof categoryIconMap;
