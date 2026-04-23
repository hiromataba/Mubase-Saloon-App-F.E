import { Component, input } from '@angular/core';

@Component({
  selector: 'mb-skeleton',
  standalone: true,
  template: `
    <div
      [class]="
        'animate-pulse rounded-lg bg-slate-200/90 dark:bg-slate-800 ' + (className() || '')
      "
      [style.width]="width()"
      [style.height]="height()"
    ></div>
  `,
})
export class MbSkeletonComponent {
  readonly width = input<string>('100%');
  readonly height = input<string>('1rem');
  readonly className = input<string>('');
}
