import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

async function navigation() {
  const source = await readFile(new URL('../lib/view-route.ts', import.meta.url), 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return import('data:text/javascript;base64,' + Buffer.from(output).toString('base64'));
}
const { normalizeWorkspaceRoute, parseWorkspaceRoute, workspaceHref } = await navigation();

test('web navigation deep links resolve to known screens and subtabs', () => {
  assert.deepEqual(parseWorkspaceRoute('?view=build&tab=materials'), { section: 'build', feature: 'materials' });
  assert.deepEqual(parseWorkspaceRoute('?view=journey&tab=budgets'), { section: 'journey', feature: 'budgets' });
  assert.deepEqual(parseWorkspaceRoute('?view=more&tab=funding'), { section: 'more', feature: 'funding' });
  assert.deepEqual(parseWorkspaceRoute('?view=ledger&tab=expenses'), { section: 'ledger', feature: 'expenses' });
  assert.equal(workspaceHref('build', 'documents'), '/?view=build&tab=documents');
  assert.equal(workspaceHref('home'), '/');
});
test('invalid or sensitive URL parameters are never used for routing', () => {
  assert.deepEqual(parseWorkspaceRoute('?view=https://attacker.example&tab=<script>'), { section: 'home' });
  assert.deepEqual(parseWorkspaceRoute('?view=build&tab=unknown&debug=1'), { section: 'build' });
  assert.deepEqual(parseWorkspaceRoute('?view=more&tab=secret'), { section: 'more' });
  assert.deepEqual(normalizeWorkspaceRoute('ledger', 'private-transaction-id'), { section: 'ledger' });
  assert.equal(workspaceHref('ledger', 'private-transaction-id'), '/?view=ledger');
  assert.equal(workspaceHref('add', 'receipt-info'), '/?view=add');
});
test('web navigation pushes history and reacts to browser back/forward events', async () => {
  const shell = await readFile(new URL('../components/AppShell.tsx', import.meta.url), 'utf8');
  const hub = await readFile(new URL('../components/views/ConstructionHub.tsx', import.meta.url), 'utf8');
  assert.match(shell, /window\.history\.pushState/);
  assert.match(shell, /addEventListener\('popstate'/);
  assert.match(shell, /parseWorkspaceRoute\(window\.location\.search\)/);
  assert.match(shell, /Copy link to current web page/);
  assert.match(hub, /props\.onTabChange\?\.\(id\)/);
});
test('PWA metadata reflects deployed light design and allows tablet landscape', async () => {
  const layout = await readFile(new URL('../app/layout.tsx', import.meta.url), 'utf8');
  const manifest = JSON.parse(await readFile(new URL('../public/manifest.webmanifest', import.meta.url), 'utf8'));
  assert.match(layout, /colorScheme: 'light'/);
  assert.equal(manifest.theme_color, '#f4f7fb');
  assert.equal(manifest.orientation, undefined);
});
