import { booleanAttribute, Component, input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'mb-quick-stats-row',
  template: `
    <div [class.mb-page-stats-lead]="lead()">
      <div
        class="-mx-1 mb-2.5 flex gap-3 overflow-x-auto overscroll-x-contain px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory md:mx-0 md:mb-3 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:pb-0 md:snap-none lg:grid-cols-4 lg:gap-6 [&::-webkit-scrollbar]:hidden"
      >
        <ng-content />
      </div>
    </div>
  `,
})
export class MbQuickStatsRowComponent {
  /** When true, adds mobile-only top spacing for the first stats row under a page header. */
  readonly lead = input(false, { transform: booleanAttribute });
}
