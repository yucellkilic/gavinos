/**
 * Operating hours configuration and utilities for Gavino's Pizza catering platform
 * Defines business hours and provides time slot generation for delivery/pickup scheduling
 */

export const OPERATING_HOURS = {
  open: '11:00',
  close: '21:00',
  timeIncrement: 15, // minutes
} as const;

/**
 * Generates an array of time slots within operating hours
 * Time slots are in 24-hour format (HH:MM) with increments defined by OPERATING_HOURS.timeIncrement
 * 
 * @returns Array of time strings in HH:MM format (e.g., ['11:00', '11:15', '11:30', ...])
 * 
 * @example
 * const slots = generateTimeSlots();
 * // Returns: ['11:00', '11:15', '11:30', ..., '20:45', '21:00']
 */
export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  const [openHour, openMinute] = OPERATING_HOURS.open.split(':').map(Number);
  const [closeHour, closeMinute] = OPERATING_HOURS.close.split(':').map(Number);
  
  let currentHour = openHour;
  let currentMinute = openMinute;
  
  while (
    currentHour < closeHour ||
    (currentHour === closeHour && currentMinute <= closeMinute)
  ) {
    const timeString = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
    slots.push(timeString);
    
    currentMinute += OPERATING_HOURS.timeIncrement;
    if (currentMinute >= 60) {
      currentHour += 1;
      currentMinute = 0;
    }
  }
  
  return slots;
}

/**
 * Validates if a given time is within operating hours
 * 
 * @param time - Time string in HH:MM format (24-hour)
 * @returns true if time is within operating hours, false otherwise
 * 
 * @example
 * isWithinOperatingHours('12:00'); // true
 * isWithinOperatingHours('10:00'); // false
 * isWithinOperatingHours('22:00'); // false
 */
export function isWithinOperatingHours(time: string): boolean {
  const [hour, minute] = time.split(':').map(Number);
  const [openHour, openMinute] = OPERATING_HOURS.open.split(':').map(Number);
  const [closeHour, closeMinute] = OPERATING_HOURS.close.split(':').map(Number);
  
  const timeInMinutes = hour * 60 + minute;
  const openInMinutes = openHour * 60 + openMinute;
  const closeInMinutes = closeHour * 60 + closeMinute;
  
  return timeInMinutes >= openInMinutes && timeInMinutes <= closeInMinutes;
}

/**
 * Validates if a given date and time combination is valid for scheduling
 * For current date, ensures the time is in the future
 * For future dates, only validates against operating hours
 * 
 * @param date - Date string in YYYY-MM-DD format
 * @param time - Time string in HH:MM format (24-hour)
 * @returns true if the date/time combination is valid for scheduling
 * 
 * @example
 * isValidScheduleTime('2024-12-25', '12:00'); // true (future date)
 * isValidScheduleTime(todayString, '10:00'); // false (before opening)
 * isValidScheduleTime(todayString, currentTime); // depends on current time
 */
export function isValidScheduleTime(date: string, time: string): boolean {
  // First check if time is within operating hours
  if (!isWithinOperatingHours(time)) {
    return false;
  }
  
  // If it's today, check if the time is in the future
  const today = new Date().toISOString().split('T')[0];
  if (date === today) {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const selectedTime = new Date();
    selectedTime.setHours(hours, minutes, 0, 0);
    return selectedTime > now;
  }
  
  // For future dates, operating hours check is sufficient
  return true;
}

/**
 * Formats a time string from 24-hour format to 12-hour format with AM/PM
 * 
 * @param time - Time string in HH:MM format (24-hour)
 * @returns Time string in 12-hour format with AM/PM (e.g., "2:30 PM")
 * 
 * @example
 * formatTime12Hour('14:30'); // "2:30 PM"
 * formatTime12Hour('09:00'); // "9:00 AM"
 * formatTime12Hour('00:00'); // "12:00 AM"
 */
export function formatTime12Hour(time: string): string {
  const [hour, minute] = time.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${String(minute).padStart(2, '0')} ${period}`;
}
