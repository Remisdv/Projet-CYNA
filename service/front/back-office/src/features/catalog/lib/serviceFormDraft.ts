import type { ServiceFormData, TabId } from '../types/serviceForm.types';

const DRAFT_KEY = 'cyna-bo-service-draft';
const DRAFT_TTL_MS = 4 * 60 * 60 * 1000;

export function saveDraft(data: ServiceFormData, tab: TabId) {
  try {
    const safeData = { ...data, images: data.images.filter(img => !img.url.startsWith('blob:')) };
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ data: safeData, tab, ts: Date.now() }));
  } catch { /* ignore */ }
}

export function loadDraft(): { data: ServiceFormData; tab: TabId } | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > DRAFT_TTL_MS) {
      sessionStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return { data: parsed.data, tab: parsed.tab || 'general' };
  } catch {
    return null;
  }
}

export function clearDraft() {
  sessionStorage.removeItem(DRAFT_KEY);
}
