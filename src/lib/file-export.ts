export interface CsvColumn<T> {
  header: string;
  value: (row: T) => unknown;
}

const INVALID_FILE_NAME_CHARS = /[<>:"/\\|?*]+/g;

const escapeCsvValue = (value: unknown): string => {
  if (value === null || value === undefined) return '';

  const normalized = String(value)
    .replace(/\r?\n|\r/g, ' ')
    .trim();
  if (/[",]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }

  return normalized;
};

export const convertToCsv = <T>(rows: T[], columns: CsvColumn<T>[]): string => {
  const headerRow = columns
    .map((column) => escapeCsvValue(column.header))
    .join(',');
  const dataRows = rows.map((row) =>
    columns.map((column) => escapeCsvValue(column.value(row))).join(',')
  );

  return [headerRow, ...dataRows].join('\n');
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

export const downloadCsvFile = (csvContent: string, fileName: string): void => {
  downloadTextFile(csvContent, fileName, 'text/csv;charset=utf-8');
};
