export interface XlsxColumn<T> {
  header: string;
  value: (row: T) => unknown;
}

const INVALID_FILE_NAME_CHARS = /[<>:"/\\|?*]+/g;

const normalizeXlsxCellValue = (value: unknown): string | number | boolean => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') {
    return value.replace(/\r?\n|\r/g, ' ').trim();
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  return String(value)
    .replace(/\r?\n|\r/g, ' ')
    .trim();
};

export const sanitizeFileName = (fileName: string): string => {
  const normalized = fileName.trim().replace(INVALID_FILE_NAME_CHARS, '-');
  return normalized.length > 0 ? normalized : 'download';
};

export const buildTimestampedFileName = (
  prefix: string,
  extension: string
): string => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');

  return sanitizeFileName(
    `${prefix}-${yyyy}${mm}${dd}-${hh}${min}${ss}.${extension}`
  );
};

export const getFileNameFromContentDisposition = (
  contentDisposition?: string | null
): string | null => {
  if (!contentDisposition) return null;

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return sanitizeFileName(decodeURIComponent(utf8Match[1]));
  }

  const asciiMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (asciiMatch?.[1]) {
    return sanitizeFileName(asciiMatch[1]);
  }

  return null;
};

export const downloadBlobFile = (blob: Blob, fileName: string): void => {
  const anchor = document.createElement('a');
  const objectUrl = URL.createObjectURL(blob);

  anchor.href = objectUrl;
  anchor.download = sanitizeFileName(fileName);
  anchor.rel = 'noopener';

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  URL.revokeObjectURL(objectUrl);
};

export const downloadTextFile = (
  content: string,
  fileName: string,
  mimeType = 'text/plain;charset=utf-8'
): void => {
  const blob = new Blob([content], { type: mimeType });
  downloadBlobFile(blob, fileName);
};

export const downloadXlsxFile = async <T>(
  rows: T[],
  columns: XlsxColumn<T>[],
  fileName: string,
  sheetName = 'Sheet1'
): Promise<void> => {
  const XLSX = await import('xlsx');

  const sheetRows = [
    columns.map((column) => column.header),
    ...rows.map((row) =>
      columns.map((column) => normalizeXlsxCellValue(column.value(row)))
    ),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const workbookBytes = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });

  const blob = new Blob([workbookBytes], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  downloadBlobFile(blob, fileName);
};
