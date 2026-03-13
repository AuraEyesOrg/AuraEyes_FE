import type { AxiosError } from 'axios';

interface ErrorPayload {
  message?: string;
  title?: string;
  detail?: string;
  code?: string;
  errors?: string[] | Record<string, string[]>;
}

const extractMessageFromPayload = (payload: unknown): string | null => {
  if (!payload) return null;
  if (typeof payload === 'string') return payload;

  if (typeof payload === 'object') {
    const data = payload as ErrorPayload;

    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message;
    }

    if (typeof data.title === 'string' && data.title.trim()) {
      return data.title;
    }

    if (typeof data.detail === 'string' && data.detail.trim()) {
      return data.detail;
    }

    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors[0];
    }

    if (data.errors && typeof data.errors === 'object') {
      const firstKey = Object.keys(data.errors)[0];
      const firstValue = firstKey
        ? (data.errors as Record<string, string[]>)[firstKey]?.[0]
        : null;
      if (firstValue) return firstValue;
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
    'Could not complete clinic booking action.'
  );

  return mapByKeywords(raw, [
    {
      pattern: /(slot\s+is\s+full|maximum\s+capacity|SLOT_FULL)/i,
      mappedMessage: 'Khung giờ đã đầy. Vui lòng chọn khung giờ khác.',
    },
    {
      pattern: /(slot\s+is\s+blocked|not\s+available|SLOT_BLOCKED)/i,
      mappedMessage: 'Khung giờ này hiện không khả dụng.',
    },
    {
      pattern: /(already\s+has\s+appointment|ALREADY_BOOKED)/i,
      mappedMessage: 'Bạn đã có lịch trong khung giờ này.',
    },
    {
      pattern: /(slot\s+not\s+found|invalid\s+slot|INVALID_SLOT)/i,
      mappedMessage: 'Không tìm thấy khung giờ hợp lệ. Vui lòng tải lại.',
    },
    {
      pattern: /(cannot\s+cancel|CANNOT_CANCEL)/i,
      mappedMessage: 'Không thể hủy lịch ở trạng thái hiện tại.',
    },
    {
      pattern: /(timeout|network|ECONNABORTED)/i,
      mappedMessage: 'Kết nối chậm hoặc bị gián đoạn. Vui lòng thử lại.',
    },
  ]);
};

export const mapClinicStaffErrorMessage = (error: unknown): string => {
  const raw = extractApiErrorMessage(
    error,
    'Không thể xử lý thao tác lịch khám.'
  );

  return mapByKeywords(raw, [
    {
      pattern: /(appointment\s+not\s+found|APPOINTMENT_NOT_FOUND)/i,
      mappedMessage: 'Không tìm thấy lịch khám.',
    },
    {
      pattern: /(cannot\s+start|checked\s*in)/i,
      mappedMessage:
        'Không thể bắt đầu khám. Bệnh nhân cần được check-in trước và có bác sĩ phụ trách.',
    },
    {
      pattern: /(assign\s+doctor|doctor\s+required)/i,
      mappedMessage: 'Không thể gán bác sĩ. Vui lòng kiểm tra Doctor ID.',
    },
    {
      pattern: /(concurrent|modified|CONCURRENT_UPDATE)/i,
      mappedMessage:
        'Dữ liệu vừa thay đổi bởi người khác. Vui lòng tải lại và thử lại.',
    },
    {
      pattern: /(forbidden|unauthorized|403)/i,
      mappedMessage: 'Bạn không có quyền thực hiện thao tác này.',
    },
    {
      pattern: /(timeout|network|ECONNABORTED)/i,
      mappedMessage: 'Kết nối chậm hoặc bị gián đoạn. Vui lòng thử lại.',
    },
  ]);
};
