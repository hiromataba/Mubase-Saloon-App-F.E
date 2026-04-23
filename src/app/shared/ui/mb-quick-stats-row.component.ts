import { Component } from '@angular/core';

@Component({
  selector: 'mb-quick-stats-row',
  standalone: true,
  template: `
    <div
      class="-mx-1 mb-2.5 flex gap-3 overflow-x-auto overscroll-x-contain px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory md:mx-0 md:mb-3 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:pb-0 md:snap-none lg:grid-cols-4 lg:gap-6 [&::-webkit-scrollbar]:hidden"
    >
      <ng-content />
    </div>
  `,
})
export class MbQuickStatsRowComponent {}
