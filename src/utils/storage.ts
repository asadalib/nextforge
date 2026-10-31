// IndexedDB + LocalStorage High-Reliability Storage Engine for NextForge Builder
// IndexedDB provides unlimited quota (GBs) so base64 images, large layouts and multi-page projects never fail.
// LocalStorage serves as an immediate synchronous backup.

const DB_NAME = 'nextforge_builder_db';
const DB_VERSION = 1;
const STORE_NAME = 'project_store';
const KEY_ACTIVE_PROJECT = 'active_project';
const LOCALSTORAGE_KEY = 'nextforge_saved_project';

function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not available in this environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Persist project data into IndexedDB (primary) and localStorage (secondary fallback)
 */
export async function saveProjectToStorage(projectData: any): Promise<boolean> {
  let savedToIndexedDB = false;
  let savedToLocalStorage = false;

  // 1. Primary: Save to IndexedDB (unlimited quota, handles base64 images)
  try {
    const db = await openIndexedDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(projectData, KEY_ACTIVE_PROJECT);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });
    savedToIndexedDB = true;
  } catch (err) {
    console.warn('[NextForge Storage] IndexedDB save failed, falling back to LocalStorage:', err);
  }

  // 2. Secondary: Save to LocalStorage (safely wrapped in try/catch for quota limits)
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const serialized = JSON.stringify(projectData);
      window.localStorage.setItem(LOCALSTORAGE_KEY, serialized);
      savedToLocalStorage = true;
    }
  } catch (err) {
    // If LocalStorage quota exceeded, this is fine because IndexedDB has the full project!
    console.warn('[NextForge Storage] LocalStorage quota exceeded or unavailable. IndexedDB is primary:', err);
  }

  return savedToIndexedDB || savedToLocalStorage;
}

/**
 * Load active project from IndexedDB (highest priority & completeness) or LocalStorage
 */
export async function loadProjectFromStorage(): Promise<any | null> {
  // 1. Try IndexedDB first
  try {
    const db = await openIndexedDB();
    const data = await new Promise<any>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(KEY_ACTIVE_PROJECT);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });

    if (data && (Array.isArray(data.pages) || Array.isArray(data.sections))) {
      return data;
    }
  } catch (err) {
    console.warn('[NextForge Storage] IndexedDB read failed, trying LocalStorage:', err);
  }

  // 2. Fallback to LocalStorage
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(LOCALSTORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (Array.isArray(parsed.pages) || Array.isArray(parsed.sections))) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('[NextForge Storage] LocalStorage read failed:', err);
  }

  return null;
}

// ---------------------------------------------------------------------------
// Multi-site library (additive)
// Each site record (a ProjectFileJSON plus `id`) lives in the same IndexedDB
// store under key `site:<id>`. A lightweight metadata index lives under IDB
// key 'sites_index' and is mirrored in localStorage 'nextforge_sites_index'.
// ---------------------------------------------------------------------------

const KEY_SITES_INDEX = 'sites_index';
const LOCALSTORAGE_SITES_INDEX_KEY = 'nextforge_sites_index';
const SITE_KEY_PREFIX = 'site:';

export interface SiteMeta {
  id: string;
  name: string;
  savedAt: string;
  pageCount: number;
  sectionCount: number;
}

function countSectionsInRecord(record: any): number {
  let count = 0;
  if (record && Array.isArray(record.pages)) {
    for (const page of record.pages) {
      if (page && Array.isArray(page.sections)) count += page.sections.length;
    }
  } else if (record && Array.isArray(record.sections)) {
    count = record.sections.length;
  }
  return count;
}

export function computeSiteMeta(record: any): SiteMeta {
  return {
    id: record.id,
    name: record.name || 'Untitled website',
    savedAt: record.savedAt || new Date().toISOString(),
    pageCount: Array.isArray(record.pages) ? record.pages.length : 1,
    sectionCount: countSectionsInRecord(record)
  };
}

async function idbGet(key: string): Promise<any> {
  const db = await openIndexedDB();
  return new Promise<any>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

async function idbPut(key: string, value: any): Promise<void> {
  const db = await openIndexedDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

async function idbDelete(key: string): Promise<void> {
  const db = await openIndexedDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

function readLocalSitesIndex(): SiteMeta[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(LOCALSTORAGE_SITES_INDEX_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch (err) {
    console.warn('[NextForge Storage] Local sites index read failed:', err);
  }
  return [];
}

function writeLocalSitesIndex(index: SiteMeta[]): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(LOCALSTORAGE_SITES_INDEX_KEY, JSON.stringify(index));
    }
  } catch (err) {
    console.warn('[NextForge Storage] Local sites index write failed (quota):', err);
  }
}

async function readSitesIndex(): Promise<SiteMeta[]> {
  try {
    const fromIdb = await idbGet(KEY_SITES_INDEX);
    if (Array.isArray(fromIdb)) return fromIdb;
  } catch (err) {
    console.warn('[NextForge Storage] Sites index IDB read failed:', err);
  }
  return readLocalSitesIndex();
}

async function writeSitesIndex(index: SiteMeta[]): Promise<void> {
  writeLocalSitesIndex(index);
  try {
    await idbPut(KEY_SITES_INDEX, index);
  } catch (err) {
    console.warn('[NextForge Storage] Sites index IDB write failed:', err);
  }
}

/**
 * Persist one site record and upsert its metadata in the sites index.
 */
export async function saveSite(record: any): Promise<void> {
  if (!record || !record.id) {
    throw new Error('saveSite: record must have an id');
  }
  try {
    await idbPut(SITE_KEY_PREFIX + record.id, record);
  } catch (err) {
    console.warn('[NextForge Storage] saveSite IDB write failed:', err);
  }
  const index = await readSitesIndex();
  const meta = computeSiteMeta(record);
  const existingIdx = index.findIndex((m) => m.id === record.id);
  if (existingIdx >= 0) {
    index[existingIdx] = meta;
  } else {
    index.push(meta);
  }
  await writeSitesIndex(index);
}

/**
 * Load one full site record by id (null when missing).
 */
export async function loadSite(id: string): Promise<any | null> {
  try {
    const data = await idbGet(SITE_KEY_PREFIX + id);
    if (data) return data;
  } catch (err) {
    console.warn('[NextForge Storage] loadSite failed:', err);
  }
  return null;
}

/**
 * List all sites (metadata only). Migrates the legacy single active project
 * into the library on first call so the user's current site shows up.
 */
export async function listSites(): Promise<SiteMeta[]> {
  let index = await readSitesIndex();
  if (index.length === 0) {
    try {
      const active = await loadProjectFromStorage();
      if (active && (Array.isArray(active.pages) || Array.isArray(active.sections))) {
        const migrated = { ...active };
        if (!migrated.id) {
          migrated.id = `site-${Date.now().toString(36)}`;
        }
        await saveSite(migrated);
        index = await readSitesIndex();
      }
    } catch (err) {
      console.warn('[NextForge Storage] listSites migration failed:', err);
    }
  }
  // Newest first
  return [...index].sort((a, b) => (b.savedAt || '').localeCompare(a.savedAt || ''));
}

/**
 * Delete a site record and its index entry.
 */
export async function deleteSite(id: string): Promise<void> {
  try {
    await idbDelete(SITE_KEY_PREFIX + id);
  } catch (err) {
    console.warn('[NextForge Storage] deleteSite IDB delete failed:', err);
  }
  const index = await readSitesIndex();
  await writeSitesIndex(index.filter((m) => m.id !== id));
}

/**
 * Deep-clone a site under a new id, named "<name> copy".
 */
export async function duplicateSite(id: string): Promise<any | null> {
  const original = await loadSite(id);
  if (!original) return null;
  const clone = JSON.parse(JSON.stringify(original));
  clone.id = `site-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  clone.name = `${original.name || 'Untitled website'} copy`;
  clone.savedAt = new Date().toISOString();
  await saveSite(clone);
  return clone;
}

/**
 * Synchronously check LocalStorage for instant initial state hydration
 */
export function getSyncStoredProject(): any | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(LOCALSTORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (Array.isArray(parsed.pages) || Array.isArray(parsed.sections))) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('[NextForge Storage] Sync read failed:', err);
  }
  return null;
}

