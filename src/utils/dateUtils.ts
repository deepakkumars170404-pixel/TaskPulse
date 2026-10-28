import { useState, useEffect } from 'react';

export const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

export const MONTH_NAMES_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

export const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export const DAY_NAMES_FULL = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
] as const;

/**
 * Format a Date object to standard TaskToggle task format: 'DD MMM YYYY' (e.g. '28 Oct 2026')
 */
export function formatDateToStandard(d: Date = new Date()): string {
  const day = d.getDate();
  const month = MONTH_NAMES_SHORT[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Format a Date object to short format: 'DD MMM' (e.g. '28 Oct')
 */
export function formatDateShort(d: Date = new Date()): string {
  return `${d.getDate()} ${MONTH_NAMES_SHORT[d.getMonth()]}`;
}

/**
 * Format with weekday: 'Wed, 28 Oct 2026'
 */
export function formatDateWithWeekday(d: Date = new Date()): string {
  const dayName = DAY_NAMES_SHORT[d.getDay()];
  return `${dayName}, ${formatDateToStandard(d)}`;
}

/**
 * Format with full weekday: 'Wednesday, 28 October 2026'
 */
export function formatDateFull(d: Date = new Date()): string {
  const dayName = DAY_NAMES_FULL[d.getDay()];
  const monthName = MONTH_NAMES_FULL[d.getMonth()];
  return `${dayName}, ${d.getDate()} ${monthName} ${d.getFullYear()}`;
}

/**
 * Dynamic today's date in standard format ('28 Oct 2026')
 */
export function getTodayDateString(): string {
  return formatDateToStandard(new Date());
}

/**
 * Dynamic today's date in short format ('28 Oct')
 */
export function getTodayShortString(): string {
  return formatDateShort(new Date());
}

/**
 * Format time string: e.g. '5:30 PM' or '5:30:15 PM'
 */
export function getCurrentTimeString(includeSeconds = false): string {
  const d = new Date();
  return d.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
    hour12: true,
  });
}

/**
 * Robust date parser for strings like '28 Oct 2026', '2026-10-28', '28-Oct-2026'
 * Returns a Date object with time normalized to 00:00:00 local time
 */
export function parseDateString(str?: string | null): Date | null {
  if (!str) return null;
  const trimmed = str.trim();
  if (!trimmed) return null;

  // Pattern: '28 Oct 2026' or '28-Oct-2026' or '28/Oct/2026'
  const parts = trimmed.split(/[\s\-\/\.]+/);
  if (parts.length === 3) {
    // Check if parts[0] is day, parts[1] is month name, parts[2] is year
    const day = parseInt(parts[0], 10);
    const monthIdx = MONTH_NAMES_SHORT.findIndex(
      (m) => m.toLowerCase() === parts[1].toLowerCase().slice(0, 3)
    );
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && monthIdx !== -1 && !isNaN(year)) {
      return new Date(year, monthIdx, day, 0, 0, 0, 0);
    }

    // Check if ISO format YYYY-MM-DD
    const isoYear = parseInt(parts[0], 10);
    const isoMonth = parseInt(parts[1], 10) - 1;
    const isoDay = parseInt(parts[2], 10);
    if (!isNaN(isoYear) && isoYear > 1900 && !isNaN(isoMonth) && !isNaN(isoDay)) {
      return new Date(isoYear, isoMonth, isoDay, 0, 0, 0, 0);
    }
  }

  // Fallback to JS Date constructor
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 0, 0, 0, 0);
  }

  return null;
}

/**
 * Check if two dates represent the exact same calendar day
 */
export function isSameCalendarDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Check if a date string represents today's date
 */
export function isDateToday(dateStr?: string | null): boolean {
  if (!dateStr) return true; // Tasks without date are treated as today
  const d = parseDateString(dateStr);
  if (!d) return false;
  return isSameCalendarDay(d, new Date());
}

/**
 * Check if a date string is strictly in the past (before today 00:00:00)
 */
export function isDatePrevious(dateStr?: string | null): boolean {
  if (!dateStr) return false;
  const d = parseDateString(dateStr);
  if (!d) return false;
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  return d.getTime() < todayStart.getTime();
}

/**
 * Check if a date string is strictly in the future (after today 23:59:59)
 */
export function isDateUpcoming(dateStr?: string | null): boolean {
  if (!dateStr) return false;
  const d = parseDateString(dateStr);
  if (!d) return false;
  const now = new Date();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return d.getTime() > todayEnd.getTime();
}

/**
 * Parse an event date and timing range string (e.g. '30 Oct 2026', '4:00 AM - 7:00 PM')
 * Returns the exact Date object corresponding to the event start time
 */
export function parseEventStartDateTime(dateStr?: string | null, timingStr?: string | null): Date | null {
  if (!dateStr || !timingStr) return null;
  const baseDate = parseDateString(dateStr);
  if (!baseDate) return null;

  // Extract start time: e.g. "4:00 AM" from "4:00 AM - 7:00 PM"
  const startPart = timingStr.split(/[-–—]/)[0]?.trim() || timingStr;
  const match = startPart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3]?.toUpperCase();

  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  return new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), hours, minutes, 0, 0);
}

/**
 * React hook that returns live updating real-time date and time strings
 * Automatically ticks every 1 second
 */
export function useLiveDateTime() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return {
    now,
    todayStandard: formatDateToStandard(now),
    todayShort: formatDateShort(now),
    weekdayDate: formatDateWithWeekday(now),
    fullDate: formatDateFull(now),
    timeString: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }),
    timeStringWithSeconds: now.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }),
  };
}

