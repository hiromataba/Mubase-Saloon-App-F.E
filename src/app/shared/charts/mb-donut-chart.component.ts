import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  inject,
  input,
} from '@angular/core';
import { Chart, registerables, type ChartConfiguration } from 'chart.js';
import { CurrencyService } from '../../core/currency/currency.service';
import { ThemeService } from '../../core/theme/theme.service';
import { chartAxisColor, chartDonutCutoutBorder, chartFillSequence, chartTooltipStyle } from './chart-palette';

Chart.register(...registerables);

@Component({
  selector: 'mb-donut-chart',
  standalone: true,
  template: ` <div class="relative mx-auto h-52 w-full max-w-sm sm:h-56"><canvas #cv></canvas></div> `,
})
export class MbDonutChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('cv', { static: false }) private canvas?: ElementRef<HTMLCanvasElement>;

  readonly labels = input.required<string[]>();
  readonly values = input.required<number[]>();

  private readonly theme = inject(ThemeService);
  private readonly currency = inject(CurrencyService);
  private chart?: Chart;
  private viewReady = false;

  constructor() {
    effect(() => {
      this.labels();
      this.values();
      this.theme.preference();
      this.currency.displayCurrency();
      this.render();
    });
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.render();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
    this.chart = undefined;
  }

  private render(): void {
    if (!this.viewReady || !this.canvas?.nativeElement) {
      return;
    }
    const labels = this.labels();
    const values = this.values();
    const axis = chartAxisColor(this.theme);
    const seq = chartFillSequence(this.theme);
    const tip = chartTooltipStyle(this.theme);
    const fills = labels.map((_, i) => seq[i % seq.length]);
    const donutBorder = chartDonutCutoutBorder(this.theme);

    this.chart?.destroy();

    const cfg: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: fills,
            borderWidth: 2,
            borderColor: donutBorder,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: axis,
              boxWidth: 10,
              padding: 14,
              font: { size: 11 },
            },
          },
          tooltip: {
            backgroundColor: tip.backgroundColor,
            titleColor: axis,
            bodyColor: axis,
            borderColor: tip.borderColor,
            borderWidth: 1,
            padding: 12,
            cornerRadius: 10,
            callbacks: {
              label: (ctx) => {
                const raw = ctx.dataset.data[ctx.dataIndex] as number;
                return this.currency.format(Number(raw));
              },
            },
          },
        },
      },
    };

    this.chart = new Chart(this.canvas.nativeElement, cfg as ChartConfiguration);
  }
}
