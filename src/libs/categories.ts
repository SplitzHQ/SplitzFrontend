// Expense categories & subcategories used throughout the app.
// Naming convention: lowercase snake_case. Each category ends with an "other_*" bucket.

export const mainCategories = [
  'food',
  'transport',
  'entertainment',
  'home',
  'bills',
  'travel',
  'shopping',
  'health',
  'personal_care',
  'education',
  'gifts_donations',
  'kids',
  'pets',
  'sports_fitness',
  'insurance',
  'taxes',
  'fees_charges',
  'debt',
  'other'
] as const

// Subcategories per main category
export const foodSubcategories = [
  'dining_out',
  'groceries',
  'snacks',
  'liquor',
  'cafe',
  'takeout_delivery',
  'meal_kit',
  'other_food'
] as const

export const transportSubcategories = [
  'public_transport',
  'taxi_ride_hailing',
  'fuel',
  'parking',
  'vehicle_maintenance',
  'vehicle_purchase',
  'tolls',
  'bike_share',
  'other_transport'
] as const

export const entertainmentSubcategories = [
  'movies',
  'music',
  'events_concerts',
  'games',
  'streaming_subscriptions',
  'nightlife',
  'hobbies',
  'books_media',
  'other_entertainment'
] as const

export const homeSubcategories = [
  'rent_mortgage',
  'maintenance_repairs',
  'furnishings',
  'cleaning_supplies',
  'home_improvement',
  'home_security',
  'hoa',
  'other_home'
] as const

export const billsSubcategories = [
  'electricity',
  'water',
  'gas_utility',
  'internet',
  'mobile_phone',
  'trash_recycling',
  'tv_streaming',
  'other_bills'
] as const

export const travelSubcategories = [
  'flights',
  'lodging',
  'local_transport',
  'travel_food',
  'activities_tours',
  'travel_insurance',
  'visa_fees',
  'other_travel'
] as const

export const shoppingSubcategories = [
  'clothing',
  'electronics',
  'household_goods',
  'appliances',
  'office_supplies',
  'other_shopping'
] as const

export const healthSubcategories = [
  'pharmacy',
  'doctor',
  'dentist',
  'hospital',
  'vision',
  'mental_health',
  'other_health'
] as const

export const personalCareSubcategories = [
  'hair',
  'spa',
  'cosmetics',
  'grooming',
  'laundry_dry_cleaning',
  'other_personal_care'
] as const

export const educationSubcategories = [
  'tuition',
  'courses',
  'books',
  'supplies',
  'student_fees',
  'other_education'
] as const

export const giftsDonationsSubcategories = ['gifts', 'charity', 'celebrations', 'other_gifts_donations'] as const

export const kidsSubcategories = [
  'childcare',
  'school_supplies',
  'toys',
  'clothing_kids',
  'activities_lessons',
  'other_kids'
] as const

export const petsSubcategories = ['pet_food', 'vet', 'grooming_pets', 'boarding', 'pet_supplies', 'other_pets'] as const

export const sportsFitnessSubcategories = [
  'gym',
  'sports_equipment',
  'fitness_classes',
  'outdoor_activities',
  'other_sports_fitness'
] as const

export const insuranceSubcategories = [
  'health_insurance',
  'car_insurance',
  'home_insurance',
  'life_insurance',
  'travel_insurance_premium',
  'other_insurance'
] as const

export const taxesSubcategories = ['income_tax', 'property_tax', 'sales_tax', 'other_taxes'] as const

export const feesChargesSubcategories = [
  'bank_fees',
  'late_fees',
  'service_fees',
  'atm_fees',
  'platform_fees',
  'other_fees_charges'
] as const

export const debtSubcategories = ['loan_payment', 'credit_card_payment', 'other_debt'] as const

export const otherSubcategories = ['uncategorized', 'other_misc'] as const

export const subcategories = [
  ...foodSubcategories,
  ...transportSubcategories,
  ...entertainmentSubcategories,
  ...homeSubcategories,
  ...billsSubcategories,
  ...travelSubcategories,
  ...shoppingSubcategories,
  ...healthSubcategories,
  ...personalCareSubcategories,
  ...educationSubcategories,
  ...giftsDonationsSubcategories,
  ...kidsSubcategories,
  ...petsSubcategories,
  ...sportsFitnessSubcategories,
  ...insuranceSubcategories,
  ...taxesSubcategories,
  ...feesChargesSubcategories,
  ...debtSubcategories,
  ...otherSubcategories
] as const

// Type helpers
export type MainCategory = (typeof mainCategories)[number]
export type FoodSubcategory = (typeof foodSubcategories)[number]
export type TransportSubcategory = (typeof transportSubcategories)[number]
export type EntertainmentSubcategory = (typeof entertainmentSubcategories)[number]
export type HomeSubcategory = (typeof homeSubcategories)[number]
export type BillsSubcategory = (typeof billsSubcategories)[number]
export type TravelSubcategory = (typeof travelSubcategories)[number]
export type ShoppingSubcategory = (typeof shoppingSubcategories)[number]
export type HealthSubcategory = (typeof healthSubcategories)[number]
export type PersonalCareSubcategory = (typeof personalCareSubcategories)[number]
export type EducationSubcategory = (typeof educationSubcategories)[number]
export type GiftsDonationsSubcategory = (typeof giftsDonationsSubcategories)[number]
export type KidsSubcategory = (typeof kidsSubcategories)[number]
export type PetsSubcategory = (typeof petsSubcategories)[number]
export type SportsFitnessSubcategory = (typeof sportsFitnessSubcategories)[number]
export type InsuranceSubcategory = (typeof insuranceSubcategories)[number]
export type TaxesSubcategory = (typeof taxesSubcategories)[number]
export type FeesChargesSubcategory = (typeof feesChargesSubcategories)[number]
export type DebtSubcategory = (typeof debtSubcategories)[number]
export type OtherSubcategory = (typeof otherSubcategories)[number]
export type Subcategory =
  | FoodSubcategory
  | TransportSubcategory
  | EntertainmentSubcategory
  | HomeSubcategory
  | BillsSubcategory
  | TravelSubcategory
  | ShoppingSubcategory
  | HealthSubcategory
  | PersonalCareSubcategory
  | EducationSubcategory
  | GiftsDonationsSubcategory
  | KidsSubcategory
  | PetsSubcategory
  | SportsFitnessSubcategory
  | InsuranceSubcategory
  | TaxesSubcategory
  | FeesChargesSubcategory
  | DebtSubcategory
  | OtherSubcategory

export type SubcategoryMap = Record<MainCategory, readonly Subcategory[]>

// Mapping all subcategories for easy lookup
export const categorySubcategories: SubcategoryMap = {
  food: foodSubcategories,
  transport: transportSubcategories,
  entertainment: entertainmentSubcategories,
  home: homeSubcategories,
  bills: billsSubcategories,
  travel: travelSubcategories,
  shopping: shoppingSubcategories,
  health: healthSubcategories,
  personal_care: personalCareSubcategories,
  education: educationSubcategories,
  gifts_donations: giftsDonationsSubcategories,
  kids: kidsSubcategories,
  pets: petsSubcategories,
  sports_fitness: sportsFitnessSubcategories,
  insurance: insuranceSubcategories,
  taxes: taxesSubcategories,
  fees_charges: feesChargesSubcategories,
  debt: debtSubcategories,
  other: otherSubcategories
}

// Add a reverse mapping from sub category to main category
let subcategoryToMainCategory: Record<Subcategory, MainCategory> | undefined = undefined

export function getMainCategory(subCategory: string | null | undefined): MainCategory {
  if (!subCategory) return 'other'
  // If already a main category, return it directly
  if ((mainCategories as readonly string[]).includes(subCategory as MainCategory)) {
    return subCategory as MainCategory
  }
  // Populate mapping lazily on first call if empty
  if (!subcategoryToMainCategory || Object.keys(subcategoryToMainCategory).length === 0) {
    const localSubcategoryToMainCategory: Record<string, string> = {}
    for (const main of mainCategories) {
      const subs = categorySubcategories[main]
      for (const sub of subs) {
        // Cast is safe: subs is a subset of Subcategory union
        localSubcategoryToMainCategory[sub] = main
      }
    }
    subcategoryToMainCategory = localSubcategoryToMainCategory as Record<Subcategory, MainCategory>
  }
  if (subcategories.includes(subCategory as Subcategory)) {
    return subcategoryToMainCategory[subCategory as Subcategory]
  }
  return 'other'
}

export function getCategory(category: string | null | undefined): Subcategory {
  if (!category) return 'uncategorized'
  return subcategories.find((sub) => sub === category) ?? 'uncategorized'
}
