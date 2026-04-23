import { Injectable, computed, signal } from '@angular/core';

const LOGO_KEY = 'mubase_workspace_logo';
const NAME_KEY = 'mubase_workspace_name';

@Injectable({ providedIn: 'root' })
export class WorkspaceBrandingService {
  private readonly logo = signal<string | null>(this.read(LOGO_KEY));
  private readonly name = signal<string | null>(this.read(NAME_KEY));

  readonly logoDataUrl = this.logo.asReadonly();
  readonly businessName = this.name.asReadonly();

  readonly workspaceTitle = computed(() => {
    const n = this.name();
    return n?.trim() ? n.trim() : 'Mubase Saloon';
  });

  setLogoDataUrl(dataUrl: string | null): void {
    this.logo.set(dataUrl);
    if (typeof localStorage === 'undefined') {
      return;
    }
    if (dataUrl) {
      localStorage.setItem(LOGO_KEY, dataUrl);
    } else {
      localStorage.removeItem(LOGO_KEY);
    }
  }

  setBusinessName(value: string | null): void {
    const v = value?.trim() ? value.trim() : null;
    this.name.set(v);
    if (typeof localStorage === 'undefined') {
      return;
    }
    if (v) {
      localStorage.setItem(NAME_KEY, v);
    } else {
      localStorage.removeItem(NAME_KEY);
    }
  }

  private read(key: string): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage.getItem(key);
  }
}
