/**
 * Browser-safe navigation state for the responsive web application.
 * Only known sections and features are represented in shareable URLs.
 * Never encode private transaction IDs or form drafts in a URL.
 */
export type WorkspaceView = 'home' | 'journey' | 'build' | 'add' | 'ledger' | 'more';
export type WorkspaceRoute = { section: WorkspaceView; feature?: string };

const allowed: Record<WorkspaceView, readonly string[]> = {
  home: [],
  journey: ['milestones', 'budgets'],
  build: ['floors', 'estimate', 'schedule', 'materials', 'agreements', 'progress', 'finance', 'documents', 'reports', 'reminders', 'ocr'],
  add: [],
  ledger: ['expenses', 'funding'],
  more: ['property', 'accounts', 'funding', 'partners', 'cash'],
};
const sections = Object.keys(allowed) as WorkspaceView[];

export function normalizeWorkspaceRoute(section: string | null | undefined, feature?: string | null): WorkspaceRoute {
  const selected: WorkspaceView = sections.includes(section as WorkspaceView) ? section as WorkspaceView : 'home';
  return feature && allowed[selected].includes(feature) ? { section: selected, feature } : { section: selected };
}

export function parseWorkspaceRoute(search: string): WorkspaceRoute {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  return normalizeWorkspaceRoute(params.get('view'), params.get('tab'));
}

export function workspaceHref(section: WorkspaceView, feature?: string): string {
  const route = normalizeWorkspaceRoute(section, feature);
  if (route.section === 'home') return '/';
  const params = new URLSearchParams({ view: route.section });
  if (route.feature) params.set('tab', route.feature);
  return '/?' + params.toString();
}
