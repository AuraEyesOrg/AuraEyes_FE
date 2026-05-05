const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const ROOT = path.resolve('src/features/professional-network');
const OUTPUT_JSON = path.resolve('professional-network-literal-audit.json');

const JSX_USER_ATTRS = new Set([
  'placeholder',
  'title',
  'alt',
  'aria-label',
  'aria-placeholder',
  'aria-description',
]);

const USER_FACING_PROP_NAMES = new Set([
  'label',
  'title',
  'description',
  'hint',
  'message',
  'placeholder',
  'subtitle',
  'emptyMessage',
  'confirmLabel',
  'cancelLabel',
  'header',
  'text',
  'cta',
]);

const MOCK_DATA_FREE_CONTENT_PROPS = new Set([
  'content',
  'description',
  'message',
  'bio',
  'title',
  'name',
]);

const SKIP_PROP_NAMES = new Set([
  'className',
  'id',
  'to',
  'href',
  'src',
  'target',
  'rel',
  'type',
  'method',
  'role',
  'variant',
  'size',
  'color',
  'icon',
  'value',
  'key',
]);

const findings = [];

function listSourceFiles(dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listSourceFiles(full));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (/\.(tsx|ts)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
      out.push(full);
    }
  }
  return out;
}

function containsLetters(text) {
  return /[A-Za-z\u00C0-\u024F\u1E00-\u1EFF]/.test(text);
}

function getCallExpressionName(expr) {
  if (ts.isIdentifier(expr)) return expr.text;
  if (ts.isPropertyAccessExpression(expr)) return expr.name.text;
  return '';
}

function getCallExpressionFullName(expr) {
  if (ts.isIdentifier(expr)) return expr.text;
  if (ts.isPropertyAccessExpression(expr)) {
    const left = getCallExpressionFullName(expr.expression);
    return left ? `${left}.${expr.name.text}` : expr.name.text;
  }
  return '';
}

function getNodeText(node, sourceFile) {
  const text = node.getText(sourceFile);
  return text.replace(/\s+/g, ' ').trim();
}

function hasAncestor(node, predicate) {
  let current = node.parent;
  while (current) {
    if (predicate(current)) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

function getAncestor(node, predicate) {
  let current = node.parent;
  while (current) {
    if (predicate(current)) {
      return current;
    }
    current = current.parent;
  }
  return undefined;
}

function inTranslationCall(node) {
  return hasAncestor(node, (ancestor) => {
    if (!ts.isCallExpression(ancestor)) {
      return false;
    }
    const callName = getCallExpressionName(ancestor.expression);
    const callFull = getCallExpressionFullName(ancestor.expression);
    return callName === 't' || callName === 'i18nT' || callFull.endsWith('.t');
  });
}

function isIgnoredContext(node) {
  return hasAncestor(node, (ancestor) => {
    return (
      ts.isImportDeclaration(ancestor) ||
      ts.isExportDeclaration(ancestor) ||
      ts.isTypeNode(ancestor) ||
      ts.isLiteralTypeNode(ancestor)
    );
  });
}

function looksLikeTechnicalLiteral(text) {
  if (!containsLetters(text)) {
    return true;
  }

  if (/^(\/|\.\/|\.\.\/)/.test(text)) {
    return true;
  }

  if (/^(https?:|mailto:|tel:)/i.test(text)) {
    return true;
  }

  if (/^#[A-Za-z0-9_-]+$/.test(text)) {
    return true;
  }

  if (/^[a-z0-9-]+$/.test(text) && text.includes('-')) {
    return true;
  }

  if (/^[A-Z][A-Za-z0-9]+(?:[A-Z][A-Za-z0-9]+)+$/.test(text)) {
    return true;
  }

  if (text.includes('://')) {
    return true;
  }

  return false;
}

function getSeverity(reason) {
  if (reason === 'jsx-text') return 'high';
  if (reason.startsWith('jsx-attr:')) return 'high';

  if (reason.startsWith('toast-call:')) return 'medium';
  if (reason.startsWith('prop:')) return 'medium';
  if (reason.startsWith('var:')) return 'medium';

  return 'low';
}

function addFinding(filePath, sourceFile, node, text, reason) {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(
    node.getStart(sourceFile)
  );

  findings.push({
    file: path.relative(process.cwd(), filePath).replace(/\\/g, '/'),
    line: line + 1,
    col: character + 1,
    text,
    reason,
    severity: getSeverity(reason),
  });
}

function processStringLike(node, sourceFile, filePath) {
  const text = node.text ? node.text.trim() : '';
  if (!text || !containsLetters(text)) {
    return;
  }

  if (filePath.replace(/\\/g, '/').endsWith('/data/mockData.ts')) {
    const prop = getAncestor(node, (a) => ts.isPropertyAssignment(a));
    if (prop && ts.isPropertyAssignment(prop)) {
      const nameNode = prop.name;
      const propName = ts.isIdentifier(nameNode)
        ? nameNode.text
        : ts.isStringLiteral(nameNode)
          ? nameNode.text
          : '';

      if (MOCK_DATA_FREE_CONTENT_PROPS.has(propName)) {
        return;
      }
    }
  }

  if (isIgnoredContext(node) || inTranslationCall(node)) {
    return;
  }

  if (looksLikeTechnicalLiteral(text)) {
    return;
  }

  if (ts.isJsxAttribute(node.parent)) {
    const attrName = node.parent.name.text;

    if (attrName === 'className') {
      return;
    }

    if (JSX_USER_ATTRS.has(attrName)) {
      addFinding(filePath, sourceFile, node, text, `jsx-attr:${attrName}`);
      return;
    }

    if (SKIP_PROP_NAMES.has(attrName)) {
      return;
    }
  }

  const callExpr = getAncestor(node, (a) => ts.isCallExpression(a));
  if (callExpr && ts.isCallExpression(callExpr)) {
    const fullName = getCallExpressionFullName(callExpr.expression);
    if (
      fullName.startsWith('toast.') ||
      fullName === 'extractApiErrorMessage' ||
      fullName.endsWith('.confirm') ||
      fullName.endsWith('.alert')
    ) {
      addFinding(filePath, sourceFile, node, text, `toast-call:${fullName}`);
      return;
    }
  }

  if (ts.isPropertyAssignment(node.parent)) {
    const nameNode = node.parent.name;
    const propName = ts.isIdentifier(nameNode)
      ? nameNode.text
      : ts.isStringLiteral(nameNode)
        ? nameNode.text
        : '';

    if (SKIP_PROP_NAMES.has(propName)) {
      return;
    }

    if (USER_FACING_PROP_NAMES.has(propName)) {
      addFinding(filePath, sourceFile, node, text, `prop:${propName}`);
      return;
    }
  }

  if (ts.isVariableDeclaration(node.parent) && ts.isIdentifier(node.parent.name)) {
    const varName = node.parent.name.text;
    if (/(title|label|description|message|placeholder|hint|error|empty|caption|action)/i.test(varName)) {
      addFinding(filePath, sourceFile, node, text, `var:${varName}`);
    }
  }
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );

  function visit(node) {
    if (ts.isJsxText(node)) {
      const text = getNodeText(node, sourceFile);
      if (text && containsLetters(text) && !inTranslationCall(node)) {
        addFinding(filePath, sourceFile, node, text, 'jsx-text');
      }
    }

    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      processStringLike(node, sourceFile, filePath);
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

function dedupe(list) {
  const seen = new Set();
  const output = [];

  for (const item of list) {
    const key = `${item.file}:${item.line}:${item.col}:${item.text}:${item.reason}`;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(item);
  }

  return output;
}

function buildSummary(items) {
  const summaryBySeverity = {
    high: 0,
    medium: 0,
    low: 0,
  };

  const byFile = {};

  for (const item of items) {
    summaryBySeverity[item.severity] += 1;

    if (!byFile[item.file]) {
      byFile[item.file] = {
        file: item.file,
        high: 0,
        medium: 0,
        low: 0,
        total: 0,
      };
    }

    byFile[item.file][item.severity] += 1;
    byFile[item.file].total += 1;
  }

  const fileSummary = Object.values(byFile).sort((a, b) => b.total - a.total);

  return {
    totalFiles: fileSummary.length,
    totalFindings: items.length,
    bySeverity: summaryBySeverity,
    byFile: fileSummary,
  };
}

const allFiles = listSourceFiles(ROOT);
for (const file of allFiles) {
  scanFile(file);
}

const unique = dedupe(findings);
const summary = buildSummary(unique);

const payload = {
  scope: 'src/features/professional-network/**/*.{ts,tsx}',
  generatedAt: new Date().toISOString(),
  scannedFiles: allFiles.length,
  summary,
  findings: unique,
};

fs.writeFileSync(OUTPUT_JSON, JSON.stringify(payload, null, 2));

console.log('=== PROFESSIONAL_NETWORK_LITERAL_AUDIT ===');
console.log(`FILES_SCANNED=${allFiles.length}`);
console.log(`FINDINGS_TOTAL=${summary.totalFindings}`);
console.log(`HIGH=${summary.bySeverity.high}`);
console.log(`MEDIUM=${summary.bySeverity.medium}`);
console.log(`LOW=${summary.bySeverity.low}`);
console.log('TOP_FILES=');
for (const file of summary.byFile.slice(0, 15)) {
  console.log(`- ${file.file}: total=${file.total}, high=${file.high}, medium=${file.medium}, low=${file.low}`);
}
console.log(`WROTE=${path.relative(process.cwd(), OUTPUT_JSON).replace(/\\/g, '/')}`);
