/**
 * Default avatars live in `src/assets/avatars/` and are copied to `/assets/avatars/` at build
 * (see `angular.json`). Replace or extend those files with real photos; mapping stays stable
 * per seed (user id, customer id, etc.).
 */
const ASSET_AVATAR_FILES = [
  'avatar-01.svg',
  'avatar-02.svg',
  'avatar-03.svg',
  'avatar-04.svg',
  'avatar-05.svg',
  'avatar-06.svg',
  'avatar-07.svg',
  'avatar-08.svg',
  'avatar-09.svg',
  'avatar-10.svg',
] as const;

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Deterministic `/assets/avatars/...` URL from any string id (no network). */
export function bundledAvatarUrl(seed: string): string {
  const i = hashSeed(seed) % ASSET_AVATAR_FILES.length;
  return `assets/avatars/${ASSET_AVATAR_FILES[i]}`;
}
