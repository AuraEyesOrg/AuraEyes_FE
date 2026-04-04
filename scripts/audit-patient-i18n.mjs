/* eslint-env node */
/* global process, console */

import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const patientPagesDir = path.join(rootDir, 'src', 'features', 'patient', 'pages');
const viPath = path.join(rootDir, 'src', 'i18n', 'messages', 'vi.json');
const enPath = path.join(rootDir, 'src', 'i18n', 'messages', 'en.json');
const outputDir = path.join(rootDir, 'artifacts', 'i18n');
const jsonReportPath = path.join(outputDir, 'patient-i18n-baseline.json');
const mdReportPath = path.join(outputDir, 'patient-i18n-baseline.md');

const keyRegex = /(?:^|[^\w])t\(\s*'([A-Za-z][A-Za-z0-9]*(?:\.[A-Za-z0-9_]+)+)'/g;
const hookRegex = /useSafeTranslation|useTranslation/;
const textNodeRegex = />\s*([^<>{\n][^<>{]*?)\s*</g;

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));

const hasKey = (obj, dottedKey) => {
  const parts = dottedKey.split('.');
  let cursor = obj;

  for (const part of parts) {
    if (typeof cursor !== 'object' || cursor === null || !(part in cursor)) {
      return false;
    }

    cursor = cursor[part];
  }

  return true;
};

const normalizeSnippet = (value) => value.replace(/\s+/g, ' ').trim();

const shouldIncludeSnippet = (snippet) => {
  if (snippet.length < 3 || snippet.length > 90) {
    return false;
  }

  if (!/[A-Za-z]/.test(snippet)) {
    return false;
  }

  if (/^(div|span|p|button|input|label)$/i.test(snippet)) {
    return false;
  }

  if (/^[A-Za-z0-9_\-.]+$/.test(snippet)) {
    return false;
  }

  return true;
};

const collectHardcodedSnippets = (content) => {
  const snippets = new Set();
  let match;

  while ((match = textNodeRegex.exec(content)) !== null) {
    const snippet = normalizeSnippet(match[1]);

    if (shouldIncludeSnippet(snippet)) {
      snippets.add(snippet);
    }
  }

  return [...snippets];
};

const collectKeys = (content) => {
  const keys = new Set();
  let match;

  while ((match = keyRegex.exec(content)) !== null) {
    keys.add(match[1]);
  }

  return [...keys];
};

const toPosixPath = (value) => value.replaceAll('\\', '/');

const buildMarkdown = (report) => {
  const lines = [];

  lines.push('# Patient Module i18n Baseline');
  lines.push('');
  lines.push(`Generated at: ${report.generatedAt}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Total files: ${report.summary.totalFiles}`);
  lines.push(`- Files with translation hook: ${report.summary.filesWithTranslationHook}`);
  lines.push(`- Files without translation hook: ${report.summary.filesWithoutTranslationHook}`);
  lines.push(`- Total keys used: ${report.summary.totalKeysUsed}`);
  lines.push(`- Missing keys in en: ${report.summary.totalMissingEn}`);
  lines.push(`- Missing keys in vi: ${report.summary.totalMissingVi}`);
  lines.push('');
  lines.push('## Priority Files');
  lines.push('');
  lines.push('| File | Score | Hook | Keys | Missing en | Missing vi | Hardcoded snippets |');
  lines.push('| --- | ---: | :---: | ---: | ---: | ---: | ---: |');

  for (const file of report.priorityFiles) {
    lines.push(
      `| ${file.path} | ${file.priorityScore} | ${file.hasTranslationHook ? 'Yes' : 'No'} | ${file.keysUsed} | ${file.missingEn} | ${file.missingVi} | ${file.hardcodedSnippetCount} |`
    );
  }

  lines.push('');
  lines.push('## Missing Keys (Union)');
  lines.push('');

  if (report.missingKeysUnion.length === 0) {
    lines.push('- None');
  } else {
    for (const key of report.missingKeysUnion) {
      lines.push(`- ${key}`);
    }
  }

  lines.push('');
  lines.push('## Notes');
  lines.push('');
  lines.push('- Hardcoded snippet detection is heuristic and may include false positives.');
  lines.push('- Use this baseline to prioritize phased i18n implementation and commits.');

  return `${lines.join('\n')}\n`;
};

const viMessages = readJson(viPath);
const enMessages = readJson(enPath);

const patientPageFiles = fs
  .readdirSync(patientPagesDir)
  .filter((name) => name.endsWith('.tsx'))
  .sort()
  .map((name) => path.join(patientPagesDir, name));

const uniqueKeys = new Set();
const missingInEnSet = new Set();
const missingInViSet = new Set();

const fileReports = patientPageFiles.map((filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const relPath = toPosixPath(path.relative(rootDir, filePath));
  const hasTranslationHook = hookRegex.test(content);
  const keys = collectKeys(content);
  const hardcodedSnippets = collectHardcodedSnippets(content);

  keys.forEach((key) => uniqueKeys.add(key));

  const missingKeysInEn = keys.filter((key) => !hasKey(enMessages, key));
  const missingKeysInVi = keys.filter((key) => !hasKey(viMessages, key));

  missingKeysInEn.forEach((key) => missingInEnSet.add(key));
  missingKeysInVi.forEach((key) => missingInViSet.add(key));

  const priorityScore =
    (hasTranslationHook ? 0 : 30) +
    missingKeysInEn.length * 5 +
    missingKeysInVi.length * 5 +
    Math.min(hardcodedSnippets.length, 20);

  return {
    path: relPath,
    hasTranslationHook,
    keysUsed: keys.length,
    missingKeysInEn,
    missingKeysInVi,
    missingEn: missingKeysInEn.length,
    missingVi: missingKeysInVi.length,
    hardcodedSnippetCount: hardcodedSnippets.length,
    hardcodedSnippetSamples: hardcodedSnippets.slice(0, 10),
    priorityScore,
  };
});

const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    totalFiles: fileReports.length,
    filesWithTranslationHook: fileReports.filter((item) => item.hasTranslationHook).length,
    filesWithoutTranslationHook: fileReports.filter((item) => !item.hasTranslationHook).length,
    totalKeysUsed: uniqueKeys.size,
    totalMissingEn: missingInEnSet.size,
    totalMissingVi: missingInViSet.size,
  },
  files: fileReports,
  priorityFiles: [...fileReports].sort((a, b) => b.priorityScore - a.priorityScore),
  missingKeys: {
    en: [...missingInEnSet].sort(),
    vi: [...missingInViSet].sort(),
  },
  missingKeysUnion: [...new Set([...missingInEnSet, ...missingInViSet])].sort(),
};

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2), 'utf8');
fs.writeFileSync(mdReportPath, buildMarkdown(report), 'utf8');

console.log(`Patient i18n baseline generated:`);
console.log(`- ${toPosixPath(path.relative(rootDir, jsonReportPath))}`);
console.log(`- ${toPosixPath(path.relative(rootDir, mdReportPath))}`);
console.log(
  `Summary: files=${report.summary.totalFiles}, missingEn=${report.summary.totalMissingEn}, missingVi=${report.summary.totalMissingVi}`
);
