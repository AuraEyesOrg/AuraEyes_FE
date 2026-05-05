/**
 * Parses a potentially JSON string into a bilingual object.
 * Fallbacks to the original string if parsing fails.
 */
export function renderBilingualContent(
  rawContent: string | null | undefined,
  currentLanguage: string,
  payload?: any
): string {
  if (!rawContent) return '';

  let result = rawContent;
  try {
    // Check if it's JSON
    if (rawContent.trim().startsWith('{') && rawContent.trim().endsWith('}')) {
      const parsed = JSON.parse(rawContent);

      // If it has vi/en keys, return the appropriate one
      if (parsed && typeof parsed === 'object') {
        const lang = currentLanguage.toLowerCase().startsWith('vi')
          ? 'vi'
          : 'en';
        result = parsed[lang] || parsed['vi'] || parsed['en'] || rawContent;
      }
    }
  } catch (e) {
    // Not JSON or parse error, return as is
  }
  // Apply placeholder replacement if payload is provided
  if (payload) {
    result = formatNotificationMessage(result, payload);
  }

  return result;
}

/**
 * Standardizes notification message by replacing common placeholders
 */
export function formatNotificationMessage(
  message: string,
  payload?: any
): string {
  if (!message) return '';
  let formatted = message;

  if (payload) {
    // Replace {{patientName}} with payload.patientName or payload.PatientName
    const patientName =
      payload.patientName ||
      payload.PatientName ||
      payload.fullName ||
      payload.FullName;
    if (patientName) {
      formatted = formatted.replace(/\{\{patientName\}\}/g, patientName);
      formatted = formatted.replace(/\{\{patientFullName\}\}/g, patientName);
    }

    // Replace {{appointmentTime}} if present
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
