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

  // Handle SystemAlert which can have multiple operational actions
  if (normalizedType === NotificationType.SystemAlert) {
    const action = payload.action || '';
    if (action) {
      const actionKey = `Notifications.SystemAlert.${action}.${part}`;
      if (i18n.exists(actionKey)) {
        return i18n.t(actionKey, formatPayloadVars(payload));
      }
    }

    // Try to detect specific clinic scenarios even without explicit action
    if (!action) {
      if (payload.visitId && payload.patientId) {
        const checkedInKey = `Notifications.SystemAlert.patient_checked_in.${part}`;
        if (i18n.exists(checkedInKey)) {
          return i18n.t(checkedInKey, formatPayloadVars(payload));
        }
      }
      if (payload.medicalRecordId) {
        const archivedKey = `Notifications.SystemAlert.record_finalized.${part}`;
        if (i18n.exists(archivedKey)) {
          return i18n.t(archivedKey, formatPayloadVars(payload));
        }
      }
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

  // Common aliases and fallbacks
  vars.reason = vars.reason || vars.Reason || '';
  vars.resultStatus = vars.resultStatus || vars.ResultStatus || '';
  vars.patientName =
    vars.patientName ||
    vars.PatientName ||
    vars.fullName ||
    vars.FullName ||
    vars.patientFullName ||
    '';
  vars.doctorName = vars.doctorName || vars.DoctorName || 'Doctor';

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
      payload.FullName ||
      payload.patientFullName ||
      '';
    if (patientName) {
      formatted = formatted.replace(/\{\{patientName\}\}/g, patientName);
      formatted = formatted.replace(/\{\{patientFullName\}\}/g, patientName);
    } else {
      // If name is missing, try to clean up "Patient {{patientName}}" to just "Patient"
      // or similar patterns to avoid dangling spaces or redundant words
      formatted = formatted.replace(/Patient \{\{patientName\}\}/g, 'Patient');
      formatted = formatted.replace(/\{\{patientName\}\}/g, '');
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
