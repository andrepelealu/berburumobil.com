import { formatPrice } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('formatPrice', () => {
    test('formats numeric price correctly', () => {
      expect(formatPrice(175000000)).toBe('Rp 175.000.000')
      expect(formatPrice(500000)).toBe('Rp 500.000')
    })

    test('handles string prices', () => {
      expect(formatPrice('175000000')).toBe('Rp 175.000.000')
      expect(formatPrice('Rp 175.000.000')).toBe('Rp 175.000.000')
    })

    test('handles invalid inputs', () => {
      expect(formatPrice(null as any)).toBe('Harga tidak tersedia')
      expect(formatPrice(undefined as any)).toBe('Harga tidak tersedia')
      expect(formatPrice('')).toBe('Harga tidak tersedia')
    })

    test('handles special cases', () => {
      expect(formatPrice('Hubungi penjual')).toBe('Hubungi penjual')
      expect(formatPrice('Tidak ditemukan')).toBe('Tidak ditemukan')
    })

    test('cleans JSON-formatted prices', () => {
      expect(formatPrice('{"price": "175000000"}')).toBe('Rp 175.000.000')
    })
  })
})