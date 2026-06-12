import {readFileSync, readdirSync, existsSync, type Dirent} from 'node:fs';
import {join, extname, dirname, basename} from 'node:path';

const ROOT = process.cwd();

/**
 * A .tsx containing a form must keep its schema/defaults/handler in a
 * form-utils module — not inline. It satisfies the convention by either
 * (a) having a co-located `<Name>.form-utils.ts` sibling, or
 * (b) importing from a `*form-utils*` module (covers shared schemas, e.g.
 * an editor reusing another form's schema). Inline form logic is flagged.
 * Returns the files that violate this.
 */
export function findMissingFormUtils(
  files: string[],
  read: (f: string) => string,
  exists: (f: string) => boolean,
): string[] {
  const missing: string[] = [];
  for (const file of files) {
    const src = read(file);
    const hasForm = /useForm[(<]/.test(src) || /<form[\s>]/.test(src);
    if (!hasForm) continue;
    const importsFormUtils = /from\s+['"][^'"]*form-utils['"]/.test(src);
    if (importsFormUtils) continue;
    const name = basename(file, '.tsx');
    const sibling = join(dirname(file), `${name}.form-utils.ts`);
    if (!exists(sibling)) missing.push(file);
  }
  return missing;
}

function walk(dir: string, out: string[]): void {
  let entries: Dirent<string>[];
  try {
    entries = readdirSync(join(ROOT, dir), {withFileTypes: true});
  } catch {
    return;
  }
  for (const entry of entries) {
    const child = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      walk(child, out);
    } else if (
      entry.isFile() &&
      extname(entry.name) === '.tsx' &&
      !entry.name.endsWith('.spec.tsx') &&
      !entry.name.endsWith('.test.tsx')
    ) {
      out.push(child);
    }
  }
}

function main(): void {
  const files: string[] = [];
  walk('src', files);
  const missing = findMissingFormUtils(
    files,
    (f) => readFileSync(join(ROOT, f), 'utf8'),
    (f) => existsSync(join(ROOT, f)),
  );
  if (missing.length > 0) {
    console.error(
      `\n[lint-conventions] FAIL: missing co-located *.form-utils.ts:\n${missing.join('\n')}`,
    );
    process.exit(1);
  }
  console.log('[lint-conventions] PASS');
}

// Entry-point guard compatible with both CJS (ts-jest) and ESM (tsx).
// Under CJS, __filename is defined and we compare it to argv[1].
// Under ESM, __filename is undefined so we fall through to the argv[1] check
// using process.argv[1] directly (tsx sets argv[1] to the script path).
const isMain =
  (typeof __filename !== 'undefined' && process.argv[1] === __filename) ||
  (typeof __filename === 'undefined' && process.argv[1]?.endsWith('lint-conventions.ts'));

if (isMain) main();
