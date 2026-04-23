import { Injectable, signal } from '@angular/core';

export type AppLocale = 'en' | 'fr';

const STORAGE_KEY = 'mubase.locale';

@Injectable({ providedIn: 'root' })
export class LocaleService {
  readonly locale = signal<AppLocale>(this.readInitial());

  constructor() {
    this.applyDomLang(this.locale());
  }

  setLocale(next: AppLocale): void {
    this.locale.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    this.applyDomLang(next);
  }

  toggle(): void {
    this.setLocale(this.locale() === 'en' ? 'fr' : 'en');
  }

  private readInitial(): AppLocale {
    if (typeof localStorage === 'undefined') {
      return 'en';
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === 'fr' ? 'fr' : 'en';
  }

  private applyDomLang(loc: AppLocale): void {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = loc === 'fr' ? 'fr' : 'en';
    }
  }
}
