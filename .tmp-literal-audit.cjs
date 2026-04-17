const ts = require('typescript');
const fs = require('fs');
const path = require('path');

const pagesDir = path.resolve('src/features/system-admin/pages');
const files = fs.readdirSync(pagesDir)
  .filter((f) => f.endsWith('.tsx'))
  .map((f) => path.join(pagesDir, f));

const userFacingAttrs = new Set(['placeholder', 'title', 'alt', 'aria-label', 'aria-placeholder']);
const userFacingPropNames = new Set([
  'label', 'title', 'description', 'hint', 'message', 'placeholder', 'subtitle',
  'emptyMessage', 'confirmLabel', 'cancelLabel', 'header', 'text'
]);

const findings = [];

function containsLetters(text) {
  return /[A-Za-zÀ-ỹ]/.test(text);
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

function hasAncestor(node, predicate) {
  let current = node.parent;
  while (current) {
    if (predicate(current)) return true;
    current = current.parent;
  }
  return false;
}

function getAncestor(node, predicate) {
  let current = node.parent;
  while (current) {
    if (predicate(current)) return current;
    current = current.parent;
  }
  return undefined;
}

function inTranslationCall(node) {
  return hasAncestor(node, (a) => {
    if (!ts.isCallExpression(a)) return false;
    const name = getCallExpressionName(a.expression);
    const full = getCallExpressionFullName(a.expression);
    return name === 't' || name === 'i18nT' || full.endsWith('.t');
  });
}

function isIgnoredContext(node) {
  return hasAncestor(node, (a) =>
    ts.isImportDeclaration(a) ||
    ts.isExportDeclaration(a) ||
    ts.isTypeNode(a) ||
    ts.isLiteralTypeNode(a)
  );
}

function addFinding(filePath, sourceFile, node, text, reason) {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
  findings.push({
    file: path.relative(process.cwd(), filePath).replace(/\\/g, '/'),
    line: line + 1,
    col: character + 1,
    text,
    reason,
  });
}

for (const filePath of files) {
  const content = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  function visit(node) {
    if (ts.isJsxText(node)) {
      const raw = node.getText(sourceFile);
      const text = raw.replace(/\s+/g, ' ').trim();
      if (text && containsLetters(text) && !inTranslationCall(node)) {
        addFinding(filePath, sourceFile, node, text, 'jsx-text');
      }
    }

    if (ts.isStringLiteralLike(node)) {
      const text = node.text.trim();
      if (!text || !containsLetters(text)) {
        ts.forEachChild(node, visit);
        return;
      }

      if (inTranslationCall(node) || isIgnoredContext(node)) {
        ts.forEachChild(node, visit);
        return;
      }

      // className="..." is not user-facing text
      if (ts.isJsxAttribute(node.parent) && node.parent.name.text === 'className') {
        ts.forEachChild(node, visit);
        return;
      }

      // JSX user-facing attributes
      if (ts.isJsxAttribute(node.parent) && userFacingAttrs.has(node.parent.name.text)) {
        addFinding(filePath, sourceFile, node, text, `jsx-attr:${node.parent.name.text}`);
        ts.forEachChild(node, visit);
        return;
      }

      // Toast / error helper calls
      const callExpr = getAncestor(node, (a) => ts.isCallExpression(a));
      if (callExpr && ts.isCallExpression(callExpr)) {
        const fullName = getCallExpressionFullName(callExpr.expression);
        if (
          fullName.startsWith('toast.') ||
          fullName === 'extractApiErrorMessage' ||
          fullName.endsWith('.confirm') ||
          fullName.endsWith('.alert')
        ) {
          addFinding(filePath, sourceFile, node, text, `call:${fullName}`);
          ts.forEachChild(node, visit);
          return;
        }
      }

      // Object properties likely for display text
      if (ts.isPropertyAssignment(node.parent)) {
        const nameNode = node.parent.name;
        const propName = ts.isIdentifier(nameNode)
          ? nameNode.text
          : ts.isStringLiteral(nameNode)
            ? nameNode.text
            : '';

        if (userFacingPropNames.has(propName)) {
          addFinding(filePath, sourceFile, node, text, `prop:${propName}`);
          ts.forEachChild(node, visit);
          return;
        }
      }

      // Variable initializers with likely UI naming
      if (ts.isVariableDeclaration(node.parent) && ts.isIdentifier(node.parent.name)) {
        const n = node.parent.name.text.toLowerCase();
        if (/(title|label|description|message|placeholder|hint|status|empty|caption|action)/.test(n)) {
          addFinding(filePath, sourceFile, node, text, `var:${node.parent.name.text}`);
          ts.forEachChild(node, visit);
          return;
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

// Deduplicate exact same entry
const seen = new Set();
const unique = [];
for (const f of findings) {
  const key = `${f.file}:${f.line}:${f.col}:${f.text}:${f.reason}`;
  if (!seen.has(key)) {
    seen.add(key);
    unique.push(f);
  }
}

const byFile = {};
for (const f of unique) {
  byFile[f.file] = byFile[f.file] || [];
  byFile[f.file].push(f);
}

const sortedFiles = Object.keys(byFile).sort((a, b) => byFile[b].length - byFile[a].length);

console.log('=== LITERAL_AUDIT_SUMMARY ===');
for (const file of sortedFiles) {
  console.log(`${file}: ${byFile[file].length}`);
}
console.log('=== LITERAL_AUDIT_DETAILS ===');
for (const file of sortedFiles) {
  for (const item of byFile[file]) {
    console.log(`${item.file}:${item.line}:${item.col} [${item.reason}] ${item.text}`);
  }
}

fs.writeFileSync('system-admin-pages-literal-audit.json', JSON.stringify({ summary: sortedFiles.map((file) => ({ file, count: byFile[file].length })), findings: unique }, null, 2));
console.log('WROTE: system-admin-pages-literal-audit.json');
