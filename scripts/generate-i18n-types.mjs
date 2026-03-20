import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const viPath = path.join(rootDir, 'src', 'i18n', 'messages', 'vi.json');
const outputPath = path.join(rootDir, 'src', 'i18n', 'messages.generated.d.ts');

const viJson = JSON.parse(fs.readFileSync(viPath, 'utf8'));

const buildInterface = (obj, name, depth = 0) => {
  const indent = '  '.repeat(depth);
  const childIndent = '  '.repeat(depth + 1);

  const lines = Object.entries(obj).map(([key, value]) => {
    if (typeof value === 'string') {
      return `${childIndent}${JSON.stringify(key)}: string;`;
    }

    return `${childIndent}${JSON.stringify(key)}: ${buildInterface(value, '', depth + 1)};`;
  });

  if (!name) {
    return `{
${lines.join('\n')}
${indent}}`;
  }

  return `interface ${name} {
${lines.join('\n')}
}`;
};

const messagesInterface = buildInterface(viJson, 'TranslationSchema');

const content = `import 'i18next';

declare module 'i18next' {
  ${messagesInterface}

  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: TranslationSchema;
    };
  }
}
`;

fs.writeFileSync(outputPath, content, 'utf8');
console.log(`Generated i18n types at ${outputPath}`);
