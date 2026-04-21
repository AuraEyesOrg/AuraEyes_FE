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
    {
      pattern: /too\s+many\s+requests/i,
      mappedMessage:
        'Bạn đang thao tác quá nhanh. Vui lòng thử lại sau giây lát.',
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
        'Không thể bắt đầu khám. Bệnh nhân cần được check-in trước.',
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
    {
      pattern: /too\s+many\s+requests/i,
      mappedMessage:
        'Bạn đang thao tác quá nhanh. Vui lòng thử lại sau giây lát.',
    },
  ]);
};

export const mapOnlineConsultationErrorMessage = (error: unknown): string => {
  const raw = extractApiErrorMessage(
    error,
    'Không thể xử lý thao tác đặt lịch tư vấn online.'
  );

  return mapByKeywords(raw, [
    {
      pattern: /(already\s+reserved|slot\s+is\s+reserved|Reserved)/i,
      mappedMessage:
        'Khung giờ này đã được giữ bởi người khác. Vui lòng chọn khung giờ khác.',
    },
    {
      pattern: /(not\s+in\s+reserved\s+state|reserved\s+state)/i,
      mappedMessage:
        'Phiên giữ chỗ không còn hợp lệ. Vui lòng quay lại và đặt lại khung giờ.',
    },
    {
      pattern: /(already\s+booked|slot\s+is\s+booked|Booked)/i,
      mappedMessage: 'Khung giờ này đã được đặt. Vui lòng chọn khung giờ khác.',
    },
    {
      pattern: /(not\s+available|blocked|SLOT_BLOCKED)/i,
      mappedMessage: 'Khung giờ này hiện không khả dụng.',
    },
    {
      pattern: /(reservation\s+expired|expired)/i,
      mappedMessage: 'Phiên giữ chỗ đã hết hạn. Vui lòng đặt lại từ đầu.',
    },
    {
      pattern: /(different\s+patient|forbidden|403)/i,
      mappedMessage:
        'Bạn không có quyền thao tác trên phiên giữ chỗ này. Vui lòng đặt lại.',
    },
    {
      pattern:
        /(not\s+authorized\s+to\s+release|unable\s+to\s+resolve\s+patient\s+profile|patient\s+id\s+is\s+required)/i,
      mappedMessage:
        'Bạn không có quyền hủy phiên giữ chỗ này. Vui lòng tải lại và thử lại.',
    },
    {
      pattern: /(slot\s+not\s+found|not\s+found|INVALID_SLOT)/i,
      mappedMessage: 'Không tìm thấy khung giờ. Vui lòng tải lại danh sách.',
    },
    {
      pattern:
        /(insufficient\s+wallet\s+balance|wallet\s+not\s+found|top\s*up\s*your\s*wallet)/i,
      mappedMessage:
        'Số dư ví không đủ để đặt lịch. Vui lòng nạp thêm và thử lại.',
    },
    {
      pattern: /(timeout|network|ECONNABORTED)/i,
      mappedMessage: 'Kết nối chậm hoặc bị gián đoạn. Vui lòng thử lại.',
    },
    {
      pattern: /too\s+many\s+requests/i,
      mappedMessage:
        'Bạn đang thao tác quá nhanh. Vui lòng thử lại sau giây lát.',
    },
  ]);
};

export const mapWalkInPatientErrorMessage = (error: unknown): string => {
  const raw = extractApiErrorMessage(
    error,
    'Không thể tạo hồ sơ bệnh nhân mới.'
  );

  return mapByKeywords(raw, [
    {
      pattern: /Phone\s+number\s+already\s+exists/i,
      mappedMessage: 'Số điện thoại này đã tồn tại trong hệ thống.',
    },
    {
      pattern: /Citizen\s+ID\s+already\s+exists/i,
      mappedMessage: 'Căn cước công dân (CCCD) này đã lập hồ sơ tại tổ chức.',
    },
    {
      pattern: /(Email|UserName).*already/i,
      mappedMessage: 'Email này đã được sử dụng.',
    },
    {
      pattern: /User\s+not\s+authenticated/i,
      mappedMessage: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.',
    },
    {
      pattern: /Organisation\s+not\s+found/i,
      mappedMessage: 'Không tìm thấy thông tin tổ chức. Vui lòng thử lại.',
    },
    {
      pattern: /(timeout|network|ECONNABORTED)/i,
      mappedMessage: 'Kết nối chậm hoặc bị gián đoạn. Vui lòng thử lại.',
    },
    {
      pattern: /too\s+many\s+requests/i,
      mappedMessage:
        'Bạn đang thao tác quá nhanh. Vui lòng thử lại sau giây lát.',
    },
  ]);
};
