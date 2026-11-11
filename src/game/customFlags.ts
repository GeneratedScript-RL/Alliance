import { useSyncExternalStore } from 'react';
import type { CustomFlag } from '../types';

export const CUSTOM_FLAG_BASE = 1000;

const STORAGE_KEY = 'alliance.custom-flags.v1';
const MAX_FILE_BYTES = 6 * 1024 * 1024;
const MAX_DATA_URL_LENGTH = 400 * 1024;
const MAX_EDGE = 220;
const MAX_FLAGS = 60;

type Listener = () => void;

const listeners = new Set<Listener>();
let library: CustomFlag[] = readLibrary();

function byIndex(a: CustomFlag, b: CustomFlag): number {
  return a.index - b.index;
}

function sanitizeFlag(value: unknown): CustomFlag | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const index = Math.round(Number(raw.index));
  const dataUrl = typeof raw.dataUrl === 'string' ? raw.dataUrl : '';
  const name = typeof raw.name === 'string' ? raw.name.trim().slice(0, 40) : '';
  if (!Number.isFinite(index) || index < CUSTOM_FLAG_BASE) return null;
  if (!dataUrl.startsWith('data:image/')) return null;
  return { index, name: name || `Custom flag ${index - CUSTOM_FLAG_BASE + 1}`, dataUrl };
}

function readLibrary(): CustomFlag[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(sanitizeFlag)
      .filter((flag): flag is CustomFlag => flag !== null)
      .sort(byIndex);
  } catch {
    return [];
  }
}

function emit(): void {
  for (const listener of listeners) listener();
}

function commit(next: CustomFlag[]): void {
  library = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
  } catch {
    // Storage may be full or blocked; the session still keeps the flags in memory.
  }
  emit();
}

export function isCustomFlagIndex(index: number): boolean {
  return Number.isFinite(index) && Math.round(index) >= CUSTOM_FLAG_BASE;
}

export function customFlagAt(index: number): CustomFlag | undefined {
  return library.find((flag) => flag.index === Math.round(index));
}

export function listCustomFlags(): CustomFlag[] {
  return library;
}

function subscribeCustomFlags(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function snapshot(): CustomFlag[] {
  return library;
}

export function useCustomFlags(): CustomFlag[] {
  return useSyncExternalStore(subscribeCustomFlags, snapshot, snapshot);
}

const PLACEHOLDER = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40"><rect width="60" height="40" fill="#2b2926"/><text x="30" y="27" font-family="sans-serif" font-size="19" font-weight="700" fill="#81b64c" text-anchor="middle">?</text></svg>',
)}`;

export function customFlagPlaceholder(): string {
  return PLACEHOLDER;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

function decode(original: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('That file is not a readable image.'));
    image.src = original;
  });
}

async function toDataUrl(file: File): Promise<string> {
  const original = await readAsDataUrl(file);
  const image = await decode(original);
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;

  if (!width || !height) {
    if (original.length <= MAX_DATA_URL_LENGTH) return original;
    throw new Error(`${file.name} has no pixel size — try a PNG or JPG.`);
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('This browser cannot resize images.');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const webp = canvas.toDataURL('image/webp', 0.9);
  const url = webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/png');
  if (url.length > MAX_DATA_URL_LENGTH) throw new Error(`${file.name} is too detailed — try a simpler picture.`);
  return url;
}

function baseName(fileName: string): string {
  const cleaned = fileName
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .trim();
  return (cleaned || 'Custom flag').slice(0, 40);
}

export async function addCustomFlag(file: File): Promise<CustomFlag> {
  if (!file.type.startsWith('image/')) throw new Error(`${file.name} is not an image file.`);
  if (file.size > MAX_FILE_BYTES) throw new Error(`${file.name} is larger than 6 MB.`);
  if (library.length >= MAX_FLAGS) throw new Error(`You already have ${MAX_FLAGS} custom flags — remove one first.`);

  const dataUrl = await toDataUrl(file);
  const index = library.length > 0 ? Math.max(...library.map((flag) => flag.index)) + 1 : CUSTOM_FLAG_BASE;
  const flag: CustomFlag = { index, name: baseName(file.name), dataUrl };
  commit([...library, flag].sort(byIndex));
  return flag;
}

export function removeCustomFlag(index: number): void {
  if (!library.some((flag) => flag.index === index)) return;
  commit(library.filter((flag) => flag.index !== index));
}

export function renameCustomFlag(index: number, name: string): void {
  const clean = name.trim().slice(0, 40);
  if (!clean || !library.some((flag) => flag.index === index)) return;
  if (library.find((flag) => flag.index === index)?.name === clean) return;
  commit(library.map((flag) => (flag.index === index ? { ...flag, name: clean } : flag)));
}

export function importCustomFlags(raw: unknown): void {
  if (!Array.isArray(raw)) return;
  const incoming = raw.map(sanitizeFlag).filter((flag): flag is CustomFlag => flag !== null);
  if (incoming.length === 0) return;

  const merged = new Map(library.map((flag) => [flag.index, flag]));
  let changed = false;
  for (const flag of incoming) {
    const current = merged.get(flag.index);
    if (!current || current.dataUrl !== flag.dataUrl || current.name !== flag.name) {
      merged.set(flag.index, flag);
      changed = true;
    }
  }
  if (!changed) return;
  commit([...merged.values()].sort(byIndex));
}
