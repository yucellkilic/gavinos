import {
  OPERATING_HOURS,
  generateTimeSlots,
  isWithinOperatingHours,
  isValidScheduleTime,
  formatTime12Hour,
} from './operatingHours';

describe('Operating Hours Configuration', () => {
  describe('OPERATING_HOURS constant', () => {
    it('should define correct opening time', () => {
      expect(OPERATING_HOURS.open).toBe('11:00');
    });

    it('should define correct closing time', () => {
      expect(OPERATING_HOURS.close).toBe('21:00');
    });

    it('should define 15-minute time increment', () => {
      expect(OPERATING_HOURS.timeIncrement).toBe(15);
    });
  });

  describe('generateTimeSlots', () => {
    it('should generate time slots from 11:00 to 21:00', () => {
      const slots = generateTimeSlots();
      expect(slots[0]).toBe('11:00');
      expect(slots[slots.length - 1]).toBe('21:00');
    });

    it('should generate slots in 15-minute increments', () => {
      const slots = generateTimeSlots();
      expect(slots).toContain('11:00');
      expect(slots).toContain('11:15');
      expect(slots).toContain('11:30');
      expect(slots).toContain('11:45');
      expect(slots).toContain('12:00');
    });

    it('should include closing time as last slot', () => {
      const slots = generateTimeSlots();
      expect(slots[slots.length - 1]).toBe('21:00');
    });

    it('should generate correct number of slots', () => {
      // From 11:00 to 21:00 is 10 hours = 600 minutes
      // 600 / 15 = 40 intervals + 1 for the starting point = 41 slots
      const slots = generateTimeSlots();
      expect(slots.length).toBe(41);
    });

    it('should format times with leading zeros', () => {
      const slots = generateTimeSlots();
      slots.forEach(slot => {
        expect(slot).toMatch(/^\d{2}:\d{2}$/);
      });
    });

    it('should not include times before opening', () => {
      const slots = generateTimeSlots();
      expect(slots).not.toContain('10:00');
      expect(slots).not.toContain('10:45');
    });

    it('should not include times after closing', () => {
      const slots = generateTimeSlots();
      expect(slots).not.toContain('21:15');
      expect(slots).not.toContain('22:00');
    });
  });

  describe('isWithinOperatingHours', () => {
    it('should return true for opening time', () => {
      expect(isWithinOperatingHours('11:00')).toBe(true);
    });

    it('should return true for closing time', () => {
      expect(isWithinOperatingHours('21:00')).toBe(true);
    });

    it('should return true for time within operating hours', () => {
      expect(isWithinOperatingHours('12:00')).toBe(true);
      expect(isWithinOperatingHours('15:30')).toBe(true);
      expect(isWithinOperatingHours('20:45')).toBe(true);
    });

    it('should return false for time before opening', () => {
      expect(isWithinOperatingHours('10:00')).toBe(false);
      expect(isWithinOperatingHours('10:59')).toBe(false);
      expect(isWithinOperatingHours('09:00')).toBe(false);
    });

    it('should return false for time after closing', () => {
      expect(isWithinOperatingHours('21:01')).toBe(false);
      expect(isWithinOperatingHours('22:00')).toBe(false);
      expect(isWithinOperatingHours('23:59')).toBe(false);
    });

    it('should handle edge case at opening boundary', () => {
      expect(isWithinOperatingHours('10:59')).toBe(false);
      expect(isWithinOperatingHours('11:00')).toBe(true);
      expect(isWithinOperatingHours('11:01')).toBe(true);
    });

    it('should handle edge case at closing boundary', () => {
      expect(isWithinOperatingHours('20:59')).toBe(true);
      expect(isWithinOperatingHours('21:00')).toBe(true);
      expect(isWithinOperatingHours('21:01')).toBe(false);
    });
  });

  describe('isValidScheduleTime', () => {
    // Mock current date for consistent testing
    const mockDate = new Date('2024-01-15T14:30:00'); // 2:30 PM
    
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return false for time outside operating hours', () => {
      const futureDate = '2024-01-20';
      expect(isValidScheduleTime(futureDate, '10:00')).toBe(false);
      expect(isValidScheduleTime(futureDate, '22:00')).toBe(false);
    });

    it('should return true for future date with valid time', () => {
      const futureDate = '2024-01-20';
      expect(isValidScheduleTime(futureDate, '12:00')).toBe(true);
      expect(isValidScheduleTime(futureDate, '18:30')).toBe(true);
    });

    it('should return false for current date with past time', () => {
      const today = '2024-01-15';
      // Current time is 14:30, so 14:00 is in the past
      expect(isValidScheduleTime(today, '14:00')).toBe(false);
      expect(isValidScheduleTime(today, '12:00')).toBe(false);
    });

    it('should return true for current date with future time', () => {
      const today = '2024-01-15';
      // Current time is 14:30, so 15:00 is in the future
      expect(isValidScheduleTime(today, '15:00')).toBe(true);
      expect(isValidScheduleTime(today, '18:00')).toBe(true);
    });

    it('should return false for current date with current time', () => {
      const today = '2024-01-15';
      // Current time is 14:30, exact match should be false (not in future)
      expect(isValidScheduleTime(today, '14:30')).toBe(false);
    });

    it('should validate opening time for future date', () => {
      const futureDate = '2024-01-20';
      expect(isValidScheduleTime(futureDate, '11:00')).toBe(true);
    });

    it('should validate closing time for future date', () => {
      const futureDate = '2024-01-20';
      expect(isValidScheduleTime(futureDate, '21:00')).toBe(true);
    });
  });

  describe('formatTime12Hour', () => {
    it('should format morning times correctly', () => {
      expect(formatTime12Hour('09:00')).toBe('9:00 AM');
      expect(formatTime12Hour('11:00')).toBe('11:00 AM');
      expect(formatTime12Hour('11:30')).toBe('11:30 AM');
    });

    it('should format noon correctly', () => {
      expect(formatTime12Hour('12:00')).toBe('12:00 PM');
      expect(formatTime12Hour('12:30')).toBe('12:30 PM');
    });

    it('should format afternoon times correctly', () => {
      expect(formatTime12Hour('13:00')).toBe('1:00 PM');
      expect(formatTime12Hour('15:30')).toBe('3:30 PM');
      expect(formatTime12Hour('18:45')).toBe('6:45 PM');
    });

    it('should format evening times correctly', () => {
      expect(formatTime12Hour('21:00')).toBe('9:00 PM');
      expect(formatTime12Hour('23:59')).toBe('11:59 PM');
    });

    it('should format midnight correctly', () => {
      expect(formatTime12Hour('00:00')).toBe('12:00 AM');
      expect(formatTime12Hour('00:30')).toBe('12:30 AM');
    });

    it('should preserve leading zeros in minutes', () => {
      expect(formatTime12Hour('14:05')).toBe('2:05 PM');
      expect(formatTime12Hour('09:09')).toBe('9:09 AM');
    });

    it('should format all generated time slots', () => {
      const slots = generateTimeSlots();
      slots.forEach(slot => {
        const formatted = formatTime12Hour(slot);
        expect(formatted).toMatch(/^\d{1,2}:\d{2} (AM|PM)$/);
      });
    });
  });
});
