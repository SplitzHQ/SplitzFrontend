import { describe, it, expect } from 'vitest'

import { getMainCategory } from '../categories'

describe('getMainCategory', () => {
  it('returns other for null/undefined', () => {
    expect(getMainCategory(null)).toBe('other')
    expect(getMainCategory(undefined)).toBe('other')
  })
  it('returns main category when given a main category directly', () => {
    expect(getMainCategory('food')).toBe('food')
    expect(getMainCategory('other')).toBe('other')
  })
  it('maps known subcategories to their main category', () => {
    expect(getMainCategory('groceries')).toBe('food')
    expect(getMainCategory('public_transport')).toBe('transport')
    expect(getMainCategory('gym')).toBe('sports_fitness')
  })
  it('falls back to other for unknown values', () => {
    expect(getMainCategory('nonexistent_value')).toBe('other')
  })
})
