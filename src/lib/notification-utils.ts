import i18n from '@/i18n/i18n';
import { format } from 'date-fns';
import { NotificationType, parseNotificationType } from '@/types/notification';

/**
 * Parses a potentially JSON string into a bilingual object or localizes based on type.
 * Fallbacks to the original string if parsing fails.
 */
export function renderBilingualContent(
  rawContent: string | null | undefined,
  currentLanguage: string,
  payloadRaw?: any,
  type?: string | number,
  isTitle: boolean = false
): string {
  if (!rawContent && !type) return '';

  // 1. Try to parse as JSON (Direct bilingual support from backend)
  try {
    if (
      rawContent &&
      rawContent.trim().startsWith('{') &&
      rawContent.trim().endsWith('}')
    ) {
      const parsed = JSON.parse(rawContent);
      if (parsed && typeof parsed === 'object') {
        const lang = (currentLanguage || 'vi').toLowerCase().startsWith('vi')
          ? 'vi'
          : 'en';
        const result = parsed[lang] || parsed['vi'] || parsed['en'];
        if (result) return result;
      }
    }
  } catch (e) {
    // Fall through
  }

  // 2. Try to map from local translations using type/payload (Always try this for consistency)
  if (type !== undefined && type !== null && type !== '') {
    const localized = tryLocalize(type, payloadRaw, isTitle);
    if (localized) return localized;
  }

  // 3. Fallback: just format placeholders in the original string
  const payload = parsePayload(payloadRaw);
  return formatNotificationMessage(rawContent || '', payload);
}

/**
 * Parses payload from string or object safely
 */
function parsePayload(payload: any): any {
  if (!payload) return {};
  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload);
    } catch {
      return {};
    }
  }
  return payload || {};
}

/**
 * Tries to find a local translation for the notification
 */
function tryLocalize(
  type: string | number,
  payloadRaw: any,
  isTitle: boolean
): string | null {
  const payload = parsePayload(payloadRaw);
  const normalizedType = parseNotificationType(type);
  if (normalizedType === null) return null;

  const typeStr = NotificationType[normalizedType];
  const part = isTitle ? 'title' : 'message';

  // Handle ScheduleChanged which is a complex type with different actions
  if (normalizedType === NotificationType.ScheduleChanged) {
    const action = payload.action || '';
    if (action) {
      const actionKey = `Notifications.ScheduleChanged.${action}.${part}`;
      if (i18n.exists(actionKey)) {
        return i18n.t(actionKey, formatPayloadVars(payload));
      }
    }
    // Fallback to default ScheduleChanged if no specific action mapping
    const defaultKey = `Notifications.ScheduleChanged.default.${part}`;
    if (i18n.exists(defaultKey)) {
      return i18n.t(defaultKey, formatPayloadVars(payload));
    }
  }

  // Standard mapping for other types
  const key = `Notifications.${typeStr}.${part}`;
  if (i18n.exists(key)) {
    return i18n.t(key, formatPayloadVars(payload));
  }

  return null;
}

/**
 * Formats payload variables for injection into translation strings
 */
function formatPayloadVars(payload: any): any {
  const vars = { ...payload };

  // Format dates if present
  if (vars.appointmentTime) {
    try {
      const date = new Date(vars.appointmentTime);
      vars.appointmentTime = format(date, 'HH:mm');
      vars.appointmentDate = format(date, 'dd/MM/yyyy');
    } catch (e) {
      // Keep original if invalid date
    }
  }

  // Format currency
  if (vars.amount) {
    vars.amount = Number(vars.amount).toLocaleString();
  }

  // Common aliases
  vars.reason = vars.reason || vars.Reason || '';
  vars.resultStatus = vars.resultStatus || vars.ResultStatus || '';

  return vars;
}

/**
 * Standardizes notification message by replacing common placeholders
 */
export function formatNotificationMessage(
  message: string,
  payloadRaw?: any
): string {
  if (!message) return '';
  let formatted = message;
  const payload = parsePayload(payloadRaw);

  if (payload) {
    // Replace {{patientName}}
    const patientName =
      payload.patientName ||
      payload.PatientName ||
      payload.fullName ||
      payload.FullName;
    if (patientName) {
      formatted = formatted.replace(/\{\{patientName\}\}/g, patientName);
      formatted = formatted.replace(/\{\{patientFullName\}\}/g, patientName);
    }

    // Replace {{appointmentTime}}
    const appointmentTime = payload.appointmentTime || payload.AppointmentTime;
    if (appointmentTime) {
      formatted = formatted.replace(
        /\{\{appointmentTime\}\}/g,
        appointmentTime
      );
    }
  }

  return formatted;
}
