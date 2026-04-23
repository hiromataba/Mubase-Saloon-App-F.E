import { DOCUMENT } from '@angular/common';
import { effect, Injectable, inject, signal } from '@angular/core';

const STORAGE_KEY = 'mubase-theme';

export type ThemeMode = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  readonly preference = signal<ThemeMode>(this.readPreference());

  constructor() {
    effect(() => {
      const dark = this.resolveDark(this.preference());
      this.document.documentElement.classList.toggle('dark', dark);
    });
  }

  preferenceMode(): ThemeMode {
    return this.preference();
  }

  setMode(mode: ThemeMode): void {
    this.preference.set(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
  }

  toggleLightDark(): void {
    const dark = this.resolveDark(this.preference());
    this.setMode(dark ? 'light' : 'dark');
  }

  isDarkEffective(): boolean {
    return this.resolveDark(this.preference());
  }

  private readPreference(): ThemeMode {
    try {
      const v = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (v === 'light' || v === 'dark' || v === 'system') {
        return v;
      }
    } catch {
      /* ignore */
    }
    return 'system';
  }

  private systemPrefersDark(): boolean {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private resolveDark(mode: ThemeMode): boolean {
    if (mode === 'dark') {
      return true;
    }
    if (mode === 'light') {
      return false;
    }
    return this.systemPrefersDark();
  }
}
