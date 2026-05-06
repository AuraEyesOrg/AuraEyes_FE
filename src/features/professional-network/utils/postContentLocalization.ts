import { localizeFindingsText } from '@/features/patient/lib/disease-translation';

const FINDINGS_PREFIX_PATTERNS: RegExp[] = [
  /^(\s*🔍\s*\*\*[^*]*\*\*:\s*)(.+)$/i,
  /^(\s*\*\*(findings|phat hien)\*\*:\s*)(.+)$/i,
  /^(\s*(findings|phat hien|primary finding|related findings)\s*:\s*)(.+)$/i,
];

function localizeFindingsLine(line: string, language: string): string {
  for (const pattern of FINDINGS_PREFIX_PATTERNS) {
    const match = line.match(pattern);
    if (!match) continue;
    const prefix = match[1];
    const rawValue = match[match.length - 1];
    const localized = localizeFindingsText(rawValue, language);
    return `${prefix}${localized}`;
  }
  return line;
}

export function localizeCasePostContent(
  content: string,
  language: string
): string {
  if (!content?.trim()) return content;
  return content
    .split('\n')
    .map((line) => localizeFindingsLine(line, language))
    .join('\n');
}
