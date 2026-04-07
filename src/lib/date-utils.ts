/**
 * Unified date/time formatting utilities for AuraEyes.
 *
 * All display functions default to `en-US` locale unless noted.
 * Vietnam-specific helpers are explicitly named `formatVi*`.
 *
 * Timezone contract:
 *  - ISO strings from the API are stored in UTC.
 *  - `new Date(isoString)` interprets UTC correctly in all browsers.
 *  - `toLocalDateKey` reads the *local* calendar date to avoid day-shift.
 */

const EN_US = 'en-US';
const VI_VN = 'vi-VN';

// ─────────────────────────────────────────────────────────────────────────────
// 1. LOCAL DATE KEY  (YYYY-MM-DD, local timezone — safe for <input type="date">)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns `"YYYY-MM-DD"` in the user's **local** timezone.
 * Use this for `<input type="date">` values and calendar state keys.
 * Never use `date.toISOString().slice(0,10)` — that gives the UTC date.
 */
export function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Convenience: today as a local date key. */
export function todayLocalKey(): string {
  return toLocalDateKey(new Date());
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. SLOT TIME  (HH:MM or HH:MM:SS string → "h:MM AM/PM")
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts a raw `"HH:MM"` or `"HH:MM:SS"` time string (as returned by the
 * slot API) into a 12-hour AM/PM display string, e.g. `"4:30 PM"`.
 */
export function formatSlotTime(hhmm: string): string {
  const [h, m] = hhmm.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const display = hour % 12 || 12;
  return `${display}:${m} ${ampm}`;
}

/**
 * Returns just `"HH:MM"` (no seconds, no AM/PM).
 * Useful for compact or 24-hour displays.
 */
export function formatSlotTimeShort(hhmm: string): string {
  return hhmm.slice(0, 5);
}

/**
 * Parses slot `date` + `startTime` returned by booking APIs as a UTC datetime.
 *
 * Contract:
 * - Backend persists slot date/time in Vietnam local clock time.
 * - Frontend must parse it as local time (without forcing UTC) so expiry checks
 *   align with what users see in the calendar.
 */
export function parseSlotDateTimeUtc(date: string, startTime: string): Date {
  return new Date(`${date}T${startTime}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. DATE DISPLAY  (date-only string "YYYY-MM-DD" → locale string)
// ─────────────────────────────────────────────────────────────────────────────

export type DateDisplayPreset =
  | 'short' // "Mon, Mar 17"  — weekday:short, month:short, day:numeric
  | 'medium' // "Mar 17, 2026" — month:short,  day:numeric,  year:numeric
  | 'long' // "Monday, March 17, 2026" — weekday:long, month:long, day:numeric, year:numeric
  | 'month-day'; // "Mar 17" — month:short, day:numeric

const DATE_PRESETS: Record<DateDisplayPreset, Intl.DateTimeFormatOptions> = {
  short: { weekday: 'short', month: 'short', day: 'numeric' },
  medium: { month: 'short', day: 'numeric', year: 'numeric' },
  long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
  'month-day': { month: 'short', day: 'numeric' },
};

/**
 * Formats a `"YYYY-MM-DD"` date-only string for display.
 * Appends `T00:00:00` to prevent UTC→local day-shift when constructing Date.
 *
 * @example
 * formatDate('2026-03-17')           // "Mar 17, 2026"
 * formatDate('2026-03-17', 'short')  // "Mon, Mar 17"
 * formatDate('2026-03-17', 'long')   // "Monday, March 17, 2026"
 */
export function formatDate(
  dateStr: string,
  preset: DateDisplayPreset = 'medium',
  locale: string = EN_US
): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString(locale, DATE_PRESETS[preset]);
}

/**
 * Returns `"Mar 2026"` (month + year only). Used for "Member Since" displays.
 */
export function formatMonthYear(
  isoString: string,
  locale: string = EN_US
): string {
  return new Date(isoString).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. DATETIME DISPLAY  (ISO UTC string → various)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the **time portion** of an ISO datetime string in 12-hour format.
 * e.g. `"2:30 PM"`
 */
export function formatShortTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString(EN_US, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Returns the **date portion** of an ISO datetime string.
 * e.g. `"Mar 17, 2026"`
 */
export function formatShortDate(
  isoString: string,
  preset: DateDisplayPreset = 'medium',
  locale: string = EN_US
): string {
  return new Date(isoString).toLocaleDateString(locale, DATE_PRESETS[preset]);
}

/**
 * Compact appointment slot label: `"Mar 17, 2:30 PM"`.
 * Used in chat headers and booking confirmations.
 */
export function formatAppointmentSlot(isoString: string): string {
  return new Date(isoString).toLocaleString(EN_US, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Date + time with year: `"Mar 17, 2026, 2:30 PM"`.
 * Used in transaction history and wallet displays.
 */
export function formatDateTimeWithYear(isoString: string): string {
  return new Date(isoString).toLocaleString(EN_US, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Full long datetime: `"Monday, March 17, 2026 at 2:30 PM"`.
 * Used in consultation session headers.
 */
export function formatLongDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString(EN_US, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Chat message timestamp: `"2:30 PM"`.
 */
export function formatMessageTime(isoString: string): string {
  return formatShortTime(isoString);
}

/**
 * Chat date separator: `"Mon, Mar 17, 2026"`.
 */
export function formatFullDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString(EN_US, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Compact date used in session list cards and notification fallbacks: `"Mar 17"`.
 */
export function formatCompactDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString(EN_US, {
    month: 'short',
    day: 'numeric',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. VIETNAMESE LOCALE  (vi-VN)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Formats an ISO datetime string using `vi-VN` locale with full timestamp.
 * e.g. `"17/03/2026 14:30:00"`
 */
export function formatViTimestamp(isoString: string): string {
  return new Date(isoString).toLocaleString(VI_VN, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Formats an ISO string as a compact vi-VN date: `"17 thg 3"`.
 * Used in post cards and social content timestamps.
 */
export function formatViCompactDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString(VI_VN, {
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Formats a date-only string or ISO string using `vi-VN` locale.
 * e.g. `"17/03/2026"`
 */
export function formatViDate(isoOrDateStr: string): string {
  const date =
    isoOrDateStr.length === 10
      ? new Date(`${isoOrDateStr}T00:00:00`)
      : new Date(isoOrDateStr);
  return date.toLocaleDateString(VI_VN);
}

/**
 * Formats an ISO datetime string for notifications: `"31/03/2026 14:30"` (dd/MM/yyyy HH:mm).
 * Vietnamese standard notification format - consistent across all notifications.
 */
export function formatNotificationDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString(VI_VN, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. RELATIVE TIME
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a human-readable relative time string.
 *
 * - < 1 min  → `"Just now"` (English) or `"Vừa xong"` (Vietnamese)
 * - < 60 min → `"Xm ago"` (English) or `"X phút trước"` (Vietnamese)
 * - < 24 h   → `"Xh ago"` (English) or `"X giờ trước"` (Vietnamese)
 * - < 7 d    → `"Xd ago"` (English) or `"X ngày trước"` (Vietnamese)
 * - else     → `formatCompactDate` (e.g. `"Mar 17"`)
 *
 * @param isoString - UTC ISO timestamp
 * @param verbose   - When true, uses word labels: `"X minutes ago"`, etc.
 * @param locale    - Locale for output: 'en-US' or 'vi-VN'. Defaults to 'en-US'.
 */
export function formatRelativeTime(
  isoString: string,
  verbose = false,
  locale: string = EN_US
): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffH = Math.floor(diffMs / 3_600_000);
  const diffD = Math.floor(diffMs / 86_400_000);

  if (locale === VI_VN) {
    if (diffMin < 1) return 'Vừa xong';

    if (verbose) {
      if (diffMin < 60)
        return `${diffMin} phút${diffMin !== 1 ? '' : ''} trước`;
      if (diffH < 24) return `${diffH} giờ${diffH !== 1 ? '' : ''} trước`;
      if (diffD < 7) return `${diffD} ngày${diffD !== 1 ? '' : ''} trước`;
      const diffW = Math.floor(diffD / 7);
      if (diffW < 4) return `${diffW} tuần${diffW !== 1 ? '' : ''} trước`;
      const diffMo = Math.floor(diffD / 30);
      return `${diffMo} tháng${diffMo !== 1 ? '' : ''} trước`;
    }

    if (diffMin < 60) return `${diffMin}p trước`;
    if (diffH < 24) return `${diffH}g trước`;
    if (diffD < 7) return `${diffD}n trước`;
    return formatCompactDate(isoString);
  }

  // Default English locale
  if (diffMin < 1) return 'Just now';

  if (verbose) {
    if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
    if (diffH < 24) return `${diffH} hour${diffH !== 1 ? 's' : ''} ago`;
    if (diffD < 7) return `${diffD} day${diffD !== 1 ? 's' : ''} ago`;
    const diffW = Math.floor(diffD / 7);
    if (diffW < 4) return `${diffW} week${diffW !== 1 ? 's' : ''} ago`;
    const diffMo = Math.floor(diffD / 30);
    return `${diffMo} month${diffMo !== 1 ? 's' : ''} ago`;
  }

  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffH < 24) return `${diffH}h ago`;
  if (diffD < 7) return `${diffD}d ago`;
  return formatCompactDate(isoString);
}

/**
 * Relative display tailored for request/activity cards.
 * Falls back to `"Yesterday"` before using the compact date.
 */
export function formatRequestDate(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffH = Math.floor(diffMs / 3_600_000);
  const diffD = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffH < 24) return `${diffH}h ago`;
  if (diffD === 1) return 'Yesterday';
  return formatCompactDate(isoString);
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. WEEK HELPERS  (calendar / schedule calculations)
// ─────────────────────────────────────────────────────────────────────────────

const DAYS_IN_WEEK = 7;
const DAY_IN_MS = 86_400_000;

const parseDateKey = (dateKey: string) => new Date(`${dateKey}T00:00:00`);

const toUtcDateNumber = (date: Date) =>
  Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

/**
 * Returns the Monday of the week for a given date in local timezone.
 */
export function getStartOfWeekMonday(baseDate: Date): Date {
  const date = new Date(baseDate);
  date.setHours(0, 0, 0, 0);

  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);

  return date;
}

/**
 * Returns week offset from current week (0 = current week, -1 = previous, 1 = next).
 * Uses UTC calendar-day arithmetic to avoid DST-related off-by-one issues.
 */
export function getWeekOffsetFromDateKey(
  dateKey: string,
  referenceDate: Date = new Date()
): number {
  const currentWeekStart = getStartOfWeekMonday(referenceDate);
  const targetWeekStart = getStartOfWeekMonday(parseDateKey(dateKey));
  const dayDifference = Math.round(
    (toUtcDateNumber(targetWeekStart) - toUtcDateNumber(currentWeekStart)) /
      DAY_IN_MS
  );

  return Math.trunc(dayDifference / DAYS_IN_WEEK);
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. WEEK RANGE LABEL  (calendar / schedule headers)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a week range string like `"Mar 10 – Mar 16, 2026"`.
 * @param startOfWeek - First day of the week (Monday/Sunday)
 * @param endOfWeek   - Last day of the week
 */
export function formatWeekRange(startOfWeek: Date, endOfWeek: Date): string {
  const start = startOfWeek.toLocaleDateString(EN_US, {
    month: 'short',
    day: 'numeric',
  });
  const end = endOfWeek.toLocaleDateString(EN_US, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `${start} – ${end}`;
}

/**
 * Returns a short weekday label for column headers: `"Mon"`, `"Tue"`, etc.
 * Supports locale parameter for localized output (e.g., 'vi-VN' for T2, T3, etc.)
 */
export function formatWeekDayLabel(date: Date, locale: string = EN_US): string {
  if (locale === VI_VN) {
    const weekdaysVi = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return weekdaysVi[date.getDay()];
  }
  return date.toLocaleDateString(locale, { weekday: 'short' });
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. COUNTDOWN TIMER  (seconds → "MM:SS" or "H:MM:SS")
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts a non-negative integer of seconds into a countdown string.
 *
 * - ≤ 3600s → `"MM:SS"`  (e.g. `"04:35"`)
 * - > 3600s → `"H:MM:SS"` (e.g. `"1:04:35"`)
 */
export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. TODAY CHECK  (safe replacement for `.toDateString()` comparisons)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns `true` if the given Date falls on today in the local timezone.
 * Safer than `date.toDateString() === new Date().toDateString()`.
 */
export function isToday(date: Date): boolean {
  return toLocalDateKey(date) === toLocalDateKey(new Date());
}
