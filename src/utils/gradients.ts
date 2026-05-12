import { GRADIENT, GRADIENT_SOFT } from '../theme';

export type GradientPreset = 'primary' | 'soft' | 'pink' | 'teal' | 'gold';

export const gradientPresets: Record<GradientPreset, readonly [string, string]> = {
  primary: GRADIENT,
  soft:    GRADIENT_SOFT,
  pink:    ['#EC4899', '#BE185D'],
  teal:    ['#0891B2', '#06B6D4'],
  gold:    ['#D97706', '#B45309'],
};

export function getGradient(preset: GradientPreset) {
  return [...gradientPresets[preset]] as [string, string];
}
