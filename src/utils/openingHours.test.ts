import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isRestaurantOpen, getScheduleDisplay } from './openingHours';
import type { SiteConfig } from '../types';

describe('openingHours utilities', () => {
  let mockDate: Date;

  beforeEach(() => {
    // Mock date: Tuesday, March 10, 2026, 14:30 (2:30 PM)
    mockDate = new Date('2026-03-10T14:30:00');
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('isRestaurantOpen', () => {
    it('should return open 24/7 when no opening hours configured', () => {
      const config: SiteConfig = {
        siteName: 'Test Restaurant',
        tagline: 'Test',
        primaryColor: '#FF9F0A',
        secondaryColor: '#FF7A00',
        backgroundColor: '#1A110C',
        textColor: '#FFFFFF',
        accentColor: '#FFD700',
        branchName: 'Main',
        currency: 'USD',
        currencySymbol: '$',
      };

      const status = isRestaurantOpen(config);
      
      expect(status.isOpen).toBe(true);
      expect(status.message).toBe('Abierto 24/7');
    });

    it('should return open 24/7 when allowOrdersOutsideHours is true', () => {
      const config: SiteConfig = {
        siteName: 'Test Restaurant',
        tagline: 'Test',
        primaryColor: '#FF9F0A',
        secondaryColor: '#FF7A00',
        backgroundColor: '#1A110C',
        textColor: '#FFFFFF',
        accentColor: '#FFD700',
        branchName: 'Main',
        currency: 'USD',
        currencySymbol: '$',
        allowOrdersOutsideHours: true,
        openingHours: {
          monday: { open: '09:00', close: '17:00', closed: false },
          tuesday: { open: '09:00', close: '17:00', closed: false },
          wednesday: { open: '09:00', close: '17:00', closed: false },
          thursday: { open: '09:00', close: '17:00', closed: false },
          friday: { open: '09:00', close: '17:00', closed: false },
          saturday: { open: '09:00', close: '17:00', closed: false },
          sunday: { open: '09:00', close: '17:00', closed: false },
        },
      };

      const status = isRestaurantOpen(config);
      
      expect(status.isOpen).toBe(true);
      expect(status.message).toBe('Pedidos disponibles 24/7');
    });

    it('should return open when current time is within opening hours', () => {
      // Mock time: Tuesday 14:30 (2:30 PM)
      const config: SiteConfig = {
        siteName: 'Test Restaurant',
        tagline: 'Test',
        primaryColor: '#FF9F0A',
        secondaryColor: '#FF7A00',
        backgroundColor: '#1A110C',
        textColor: '#FFFFFF',
        accentColor: '#FFD700',
        branchName: 'Main',
        currency: 'USD',
        currencySymbol: '$',
        openingHours: {
          monday: { open: '09:00', close: '22:00', closed: false },
          tuesday: { open: '09:00', close: '22:00', closed: false },
          wednesday: { open: '09:00', close: '22:00', closed: false },
          thursday: { open: '09:00', close: '22:00', closed: false },
          friday: { open: '09:00', close: '22:00', closed: false },
          saturday: { open: '10:00', close: '23:00', closed: false },
          sunday: { open: '10:00', close: '20:00', closed: false },
        },
      };

      const status = isRestaurantOpen(config);
      
      expect(status.isOpen).toBe(true);
      expect(status.message).toBe('Abierto hasta las 22:00');
    });

    it('should return closed when current time is before opening', () => {
      // Mock time: Tuesday 08:00 AM (before opening at 09:00)
      vi.setSystemTime(new Date('2026-03-10T08:00:00'));

      const config: SiteConfig = {
        siteName: 'Test Restaurant',
        tagline: 'Test',
        primaryColor: '#FF9F0A',
        secondaryColor: '#FF7A00',
        backgroundColor: '#1A110C',
        textColor: '#FFFFFF',
        accentColor: '#FFD700',
        branchName: 'Main',
        currency: 'USD',
        currencySymbol: '$',
        openingHours: {
          monday: { open: '09:00', close: '22:00', closed: false },
          tuesday: { open: '09:00', close: '22:00', closed: false },
          wednesday: { open: '09:00', close: '22:00', closed: false },
          thursday: { open: '09:00', close: '22:00', closed: false },
          friday: { open: '09:00', close: '22:00', closed: false },
          saturday: { open: '10:00', close: '23:00', closed: false },
          sunday: { open: '10:00', close: '20:00', closed: false },
        },
      };

      const status = isRestaurantOpen(config);
      
      expect(status.isOpen).toBe(false);
      expect(status.message).toBe('Abre hoy a las 09:00');
    });

    it('should return closed when day is marked as closed', () => {
      const config: SiteConfig = {
        siteName: 'Test Restaurant',
        tagline: 'Test',
        primaryColor: '#FF9F0A',
        secondaryColor: '#FF7A00',
        backgroundColor: '#1A110C',
        textColor: '#FFFFFF',
        accentColor: '#FFD700',
        branchName: 'Main',
        currency: 'USD',
        currencySymbol: '$',
        openingHours: {
          monday: { open: '09:00', close: '22:00', closed: false },
          tuesday: { open: '09:00', close: '22:00', closed: true }, // Closed on Tuesday
          wednesday: { open: '09:00', close: '22:00', closed: false },
          thursday: { open: '09:00', close: '22:00', closed: false },
          friday: { open: '09:00', close: '22:00', closed: false },
          saturday: { open: '10:00', close: '23:00', closed: false },
          sunday: { open: '10:00', close: '20:00', closed: false },
        },
      };

      const status = isRestaurantOpen(config);
      
      expect(status.isOpen).toBe(false);
      expect(status.message).toBe('Cerrado hoy');
      expect(status.nextChange).toBeDefined();
    });
  });

  describe('getScheduleDisplay', () => {
    it('should return 24/7 message when no opening hours', () => {
      const config: SiteConfig = {
        siteName: 'Test Restaurant',
        tagline: 'Test',
        primaryColor: '#FF9F0A',
        secondaryColor: '#FF7A00',
        backgroundColor: '#1A110C',
        textColor: '#FFFFFF',
        accentColor: '#FFD700',
        branchName: 'Main',
        currency: 'USD',
        currencySymbol: '$',
      };

      const schedule = getScheduleDisplay(config);
      
      expect(schedule).toEqual(['Abierto 24/7']);
    });

    it('should return formatted schedule for all days', () => {
      const config: SiteConfig = {
        siteName: 'Test Restaurant',
        tagline: 'Test',
        primaryColor: '#FF9F0A',
        secondaryColor: '#FF7A00',
        backgroundColor: '#1A110C',
        textColor: '#FFFFFF',
        accentColor: '#FFD700',
        branchName: 'Main',
        currency: 'USD',
        currencySymbol: '$',
        openingHours: {
          monday: { open: '09:00', close: '22:00', closed: false },
          tuesday: { open: '09:00', close: '22:00', closed: false },
          wednesday: { open: '09:00', close: '22:00', closed: false },
          thursday: { open: '09:00', close: '22:00', closed: false },
          friday: { open: '09:00', close: '23:00', closed: false },
          saturday: { open: '10:00', close: '23:00', closed: false },
          sunday: { open: '09:00', close: '22:00', closed: true },
        },
      };

      const schedule = getScheduleDisplay(config);
      
      expect(schedule).toHaveLength(7);
      // Schedule starts with Sunday (index 0 from Date.getDay())
      expect(schedule[0]).toBe('Domingo: Cerrado');
      expect(schedule[1]).toBe('Lunes: 09:00 - 22:00');
      expect(schedule[5]).toBe('Viernes: 09:00 - 23:00');
      expect(schedule[6]).toBe('Sábado: 10:00 - 23:00');
    });
  });
});
