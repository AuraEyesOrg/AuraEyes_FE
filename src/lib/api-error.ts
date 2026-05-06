import i18n from '@/i18n/i18n';
import type { AxiosError } from 'axios';

interface ErrorPayload {
  message?: string;
  detail?: string;
  title?: string;
  code?: string;
  errors?: string[] | Record<string, string[]>;
}

const extractMessageFromPayload = (payload: unknown): string | null => {
  if (!payload) return null;
  if (typeof payload === 'string') return payload;

  if (typeof payload === 'object') {
    const data = payload as ErrorPayload;

    if (Array.isArray(data.errors) && data.errors.length > 0) {
      if (
        typeof data.errors[0] === 'object' &&
        data.errors[0] !== null &&
        'error' in data.errors[0]
      ) {
        return data.errors.map((e: any) => e.error).join(', ');
      }
      if (typeof data.errors[0] === 'string') {
        return data.errors.join(', ');
      }
    }

    if (
      data.errors &&
      typeof data.errors === 'object' &&
      !Array.isArray(data.errors)
    ) {
      const firstKey = Object.keys(data.errors)[0];
      if (firstKey) {
        const messages = (data.errors as Record<string, string[]>)[firstKey];
        if (Array.isArray(messages) && messages.length > 0) {
          return messages[0];
        }
      }
    }

    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message;
    }

    if (typeof data.detail === 'string' && data.detail.trim()) {
      return data.detail;
    }

    // 4. ASP.NET ProblemDetails generic title
    if (typeof data.title === 'string' && data.title.trim()) {
      return data.title;
    }
  }

  return null;
};

export const extractApiErrorMessage = (
  error: unknown,
  fallbackMessage: string
): string => {
  const axiosError = error as AxiosError<unknown>;
  const payloadMessage = extractMessageFromPayload(axiosError?.response?.data);
  if (payloadMessage) return payloadMessage;

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
};

const mapByKeywords = (
  message: string,
  mapping: Array<{ pattern: RegExp; mappedMessage: string }>
): string => {
  const matched = mapping.find((rule) => rule.pattern.test(message));
  return matched ? matched.mappedMessage : message;
};

export const mapClinicPatientErrorMessage = (error: unknown): string => {
  const raw = extractApiErrorMessage(
    error,
    i18n.t('ApiErrors.default', 'Could not complete action.')
  );

  return mapByKeywords(raw, [
    {
      pattern: /(slot\s+is\s+full|maximum\s+capacity|SLOT_FULL)/i,
      mappedMessage: i18n.t('ApiErrors.slotFull'),
    },
    {
      pattern: /(slot\s+is\s+blocked|not\s+available|SLOT_BLOCKED)/i,
      mappedMessage: i18n.t('ApiErrors.slotBlocked'),
    },
    {
      pattern: /(already\s+has\s+appointment|ALREADY_BOOKED)/i,
      mappedMessage: i18n.t('ApiErrors.alreadyBooked'),
    },
    {
      pattern: /(slot\s+not\s+found|invalid\s+slot|INVALID_SLOT)/i,
      mappedMessage: i18n.t('ApiErrors.invalidSlot'),
    },
    {
      pattern: /(cannot\s+cancel|CANNOT_CANCEL)/i,
      mappedMessage: i18n.t('ApiErrors.cannotCancel'),
    },
    {
      pattern: /6\s*hours/i,
      mappedMessage: i18n.t('ApiErrors.cancellationLimit'),
    },
    {
      pattern: /(timeout|network|ECONNABORTED)/i,
      mappedMessage: i18n.t('ApiErrors.networkError'),
    },
    {
      pattern: /too\s+many\s+requests/i,
      mappedMessage: i18n.t('ApiErrors.tooManyRequests'),
    },
  ]);
};

export const mapClinicStaffErrorMessage = (error: unknown): string => {
  const raw = extractApiErrorMessage(error, i18n.t('ApiErrors.clinicBooking'));

  return mapByKeywords(raw, [
    {
      pattern: /DepositNotPaid/i,
      mappedMessage: i18n.t('ApiErrors.depositNotPaid'),
    },
    {
      pattern: /(appointment\s+not\s+found|APPOINTMENT_NOT_FOUND)/i,
      mappedMessage: i18n.t('ApiErrors.appointmentNotFound'),
    },
    {
      pattern: /(cannot\s+start|checked\s*in)/i,
      mappedMessage: i18n.t('ApiErrors.checkInRequired'),
    },
    {
      pattern: /(concurrent|modified|CONCURRENT_UPDATE)/i,
      mappedMessage: i18n.t('ApiErrors.concurrentUpdate'),
    },
    {
      pattern: /(forbidden|unauthorized|403)/i,
      mappedMessage: i18n.t('ApiErrors.forbidden'),
    },
    {
      pattern: /(timeout|network|ECONNABORTED)/i,
      mappedMessage: i18n.t('ApiErrors.networkError'),
    },
    {
      pattern: /too\s+many\s+requests/i,
      mappedMessage: i18n.t('ApiErrors.tooManyRequests'),
    },
  ]);
};

export const mapOnlineConsultationErrorMessage = (error: unknown): string => {
  const raw = extractApiErrorMessage(error, i18n.t('ApiErrors.onlineBooking'));

  return mapByKeywords(raw, [
    {
      pattern: /(already\s+reserved|slot\s+is\s+reserved|Reserved)/i,
      mappedMessage: i18n.t('ApiErrors.alreadyReserved'),
    },
    {
      pattern: /(not\s+in\s+reserved\s+state|reserved\s+state)/i,
      mappedMessage: i18n.t('ApiErrors.invalidReservation'),
    },
    {
      pattern: /(already\s+booked|slot\s+is\s+booked|Booked)/i,
      mappedMessage: i18n.t('ApiErrors.alreadyBooked'),
    },
    {
      pattern: /(not\s+available|blocked|SLOT_BLOCKED)/i,
      mappedMessage: i18n.t('ApiErrors.slotBlocked'),
    },
    {
      pattern: /(reservation\s+expired|expired)/i,
      mappedMessage: i18n.t('ApiErrors.reservationExpired'),
    },
    {
      pattern: /(different\s+patient|forbidden|403)/i,
      mappedMessage: i18n.t('ApiErrors.forbidden'),
    },
    {
      pattern:
        /(not\s+authorized\s+to\s+release|unable\s+to\s+resolve\s+patient\s+profile|patient\s+id\s+is\s+required)/i,
      mappedMessage: i18n.t('ApiErrors.forbidden'),
    },
    {
      pattern: /(slot\s+not\s+found|not\s+found|INVALID_SLOT)/i,
      mappedMessage: i18n.t('ApiErrors.invalidSlot'),
    },
    {
      pattern:
        /(insufficient\s+wallet\s+balance|wallet\s+not\s+found|top\s*up\s*your\s*wallet)/i,
      mappedMessage: i18n.t('ApiErrors.insufficientBalance'),
    },
    {
      pattern: /(timeout|network|ECONNABORTED)/i,
      mappedMessage: i18n.t('ApiErrors.networkError'),
    },
    {
      pattern: /too\s+many\s+requests/i,
      mappedMessage: i18n.t('ApiErrors.tooManyRequests'),
    },
  ]);
};

export const mapWalkInPatientErrorMessage = (error: unknown): string => {
  const raw = extractApiErrorMessage(error, i18n.t('ApiErrors.walkIn'));

  return mapByKeywords(raw, [
    {
      pattern: /Phone\s+number\s+already\s+exists/i,
      mappedMessage: i18n.t('ApiErrors.phoneExists'),
    },
    {
      pattern: /Citizen\s+ID\s+already\s+exists/i,
      mappedMessage: i18n.t('ApiErrors.citizenIdExists'),
    },
    {
      pattern: /(Email|UserName).*already/i,
      mappedMessage: i18n.t('ApiErrors.emailExists'),
    },
    {
      pattern: /User\s+not\s+authenticated/i,
      mappedMessage: i18n.t('ApiErrors.sessionExpired'),
    },
    {
      pattern: /Organisation\s+not\s+found/i,
      mappedMessage: i18n.t('ApiErrors.orgNotFound'),
    },
    {
      pattern: /(timeout|network|ECONNABORTED)/i,
      mappedMessage: i18n.t('ApiErrors.networkError'),
    },
    {
      pattern: /too\s+many\s+requests/i,
      mappedMessage: i18n.t('ApiErrors.tooManyRequests'),
    },
  ]);
};
