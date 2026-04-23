import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NewSaleModalService {
  readonly open = signal(false);

  openModal(): void {
    this.open.set(true);
  }

  close(): void {
    this.open.set(false);
  }
}
