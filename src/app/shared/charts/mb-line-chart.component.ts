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
import { ThemeService } from '../../core/theme/theme.service';
import {
  chartAxisColor,
  chartGridColor,
  chartLinePrimary,
  chartTooltipStyle,
} from './chart-palette';

Chart.register(...registerables);

@Component({
  selector: 'mb-line-chart',
  standalone: true,
  template: ` <div class="relative h-56 w-full min-w-0 sm:h-64"><canvas #cv></canvas></div> `,
})
export class MbLineChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('cv', { static: false }) private canvas?: ElementRef<HTMLCanvasElement>;

  readonly labels = input.required<string[]>();
  readonly values = input.required<number[]>();
  readonly label = input('');

  private readonly theme = inject(ThemeService);
  private chart?: Chart;
  private viewReady = false;

  constructor() {
    effect(() => {
      this.labels();
      this.values();
      this.theme.preference();
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
    const grid = chartGridColor(this.theme);
    const line = chartLinePrimary(this.theme);
    const tip = chartTooltipStyle(this.theme);

    this.chart?.destroy();

    const cfg: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: this.label() || 'Amount',
            data: values,
            borderColor: line.border,
            backgroundColor: line.fill,
            fill: true,
            tension: 0.42,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBorderWidth: 2,
            pointHoverBackgroundColor: line.border,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: tip.backgroundColor,
            titleColor: axis,
            bodyColor: axis,
            borderColor: tip.borderColor,
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            cornerRadius: 10,
          },
        },
        scales: {
          x: {
            ticks: { color: axis, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
            grid: { color: grid },
            border: { display: false },
          },
          y: {
            ticks: { color: axis },
            grid: { color: grid },
            border: { display: false },
          },
        },
      },
    };

    this.chart = new Chart(this.canvas.nativeElement, cfg);
  }
}
