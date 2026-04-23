/**
 * Default avatars are the photos in `src/assets/avatars/` (copied to `assets/avatars/` at build).
 * Filenames with spaces are URL-encoded in the returned path. Mapping stays stable per seed.
 */
const ASSET_AVATAR_FILES = [
  'IMG_4530.jpg',
  'IMG_4530 (1).jpg',
  'IMG_4530 (2).jpg',
  'IMG_4530 (3).jpg',
  'IMG_4530 (4).jpg',
  'IMG_4530 (5).jpg',
  'IMG_4530 (6).jpg',
  'IMG_4530 (7).jpg',
  'IMG_4530 (8).jpg',
  'IMG_4530 (9).jpg',
  'IMG_4530 (10).jpg',
  'IMG_4530 (11).jpg',
  'IMG_4530 (12).jpg',
  'IMG_4546.jpg',
  'IMG_4546 (1).jpg',
  'IMG_4546 (2).jpg',
  'IMG_4546 (3).jpg',
  'IMG_4546 (4).jpg',
  'IMG_4546 (5).jpg',
  'IMG_4546 (6).jpg',
  'IMG_4546 (7).jpg',
  'IMG_4546 (8).jpg',
  'IMG_4546 (9).jpg',
] as const;

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Deterministic `assets/avatars/...` URL from any string id (bundled JPEGs, no network). */
export function bundledAvatarUrl(seed: string): string {
  const i = hashSeed(seed) % ASSET_AVATAR_FILES.length;
  const file = ASSET_AVATAR_FILES[i];
  return `assets/avatars/${encodeURIComponent(file)}`;
}
