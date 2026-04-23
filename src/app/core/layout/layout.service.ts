import { Injectable, signal } from '@angular/core';

const MOBILE_MQ = '(max-width: 1023px)';

/** Viewport signals without @angular/cdk — keeps bundle simple. */
@Injectable({ providedIn: 'root' })
export class LayoutService {
  readonly isMobile = signal(false);

  constructor() {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }
    const mq = window.matchMedia(MOBILE_MQ);
    const sync = () => this.isMobile.set(mq.matches);
    sync();
    mq.addEventListener('change', sync);
  }
}
