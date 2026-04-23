import type { ThemeService } from '../../core/theme/theme.service';

export function chartAxisColor(theme: ThemeService): string {
  return theme.isDarkEffective() ? '#94a3b8' : '#64748b';
}

export function chartGridColor(theme: ThemeService): string {
  return theme.isDarkEffective() ? 'rgba(148,163,184,0.08)' : 'rgba(100,116,139,0.08)';
}

export function chartSurfaceColor(theme: ThemeService): string {
  return theme.isDarkEffective() ? 'rgba(18,26,43,0.55)' : 'rgba(255,255,255,0.92)';
}

/** Line / area — soft blue (light) / soft indigo (dark). */
export function chartLinePrimary(theme: ThemeService): { border: string; fill: string } {
  return theme.isDarkEffective()
    ? { border: 'rgb(139, 156, 246)', fill: 'rgba(139, 156, 246, 0.14)' }
    : { border: 'rgb(59, 130, 246)', fill: 'rgba(59, 130, 246, 0.11)' };
}

export function chartTooltipStyle(theme: ThemeService): {
  backgroundColor: string;
  borderColor: string;
} {
  return theme.isDarkEffective()
    ? {
        backgroundColor: 'rgba(24, 34, 54, 0.96)',
        borderColor: 'rgba(148, 163, 184, 0.15)',
      }
    : {
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: 'rgba(15, 23, 42, 0.08)',
      };
}

export function chartDonutCutoutBorder(theme: ThemeService): string {
  return theme.isDarkEffective() ? '#121a2b' : '#ffffff';
}

/** Bar / doughnut segments — muted, not neon. */
export function chartFillSequence(theme: ThemeService): string[] {
  return theme.isDarkEffective()
    ? [
        'rgba(139, 156, 246, 0.75)',
        'rgba(96, 165, 250, 0.7)',
        'rgba(167, 139, 250, 0.68)',
        'rgba(52, 211, 153, 0.55)',
        'rgba(125, 211, 252, 0.65)',
        'rgba(196, 181, 253, 0.6)',
        'rgba(94, 234, 212, 0.5)',
        'rgba(165, 180, 252, 0.62)',
      ]
    : [
        'rgba(59, 130, 246, 0.78)',
        'rgba(99, 102, 241, 0.72)',
        'rgba(14, 165, 233, 0.7)',
        'rgba(16, 185, 129, 0.62)',
        'rgba(56, 189, 248, 0.68)',
        'rgba(129, 140, 248, 0.65)',
        'rgba(20, 184, 166, 0.58)',
        'rgba(100, 116, 139, 0.45)',
      ];
}

/** @deprecated use chartFillSequence(theme) */
export const CHART_FILL_SEQUENCE = [
  'rgba(59,130,246,0.78)',
  'rgba(99,102,241,0.72)',
  'rgba(14,165,233,0.7)',
  'rgba(16,185,129,0.62)',
  'rgba(56,189,248,0.68)',
  'rgba(129,140,248,0.65)',
  'rgba(20,184,166,0.58)',
  'rgba(100,116,139,0.45)',
];
