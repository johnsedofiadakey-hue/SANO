export const colors = {
  // ── Backgrounds ──────────────────────────────────────────────────
  white:    '#FFFFFF',
  bg:       '#FAFAF9',       // warm off-white — richer than pure white
  bg2:      '#F5F2FF',
  bg3:      '#EDE8FF',
  bg4:      '#E4DEFF',

  // ── Borders ───────────────────────────────────────────────────────
  bdr:      '#EAE4FF',
  bdrHi:    '#D0C4F7',

  // ── PRIMARY — deep violet ─────────────────────────────────────────
  pur:      '#6D28D9',       // richer, slightly deeper
  purDk:    '#4C1D95',
  purLt:    '#F5F3FF',
  purMid:   '#EDE9FE',
  purGlow:  '#7C3AED',       // for glow / shadow effects

  // ── SECONDARY — warm rose ─────────────────────────────────────────
  pink:     '#E8398A',       // slightly more saturated
  pinkDk:   '#B91C6E',
  pinkLt:   '#FEF0F7',
  pinkMid:  '#FCDFF0',

  // ── Semantic ──────────────────────────────────────────────────────
  grn:      '#059669',
  grnLt:    '#ECFDF5',
  red:      '#DC2626',
  redLt:    '#FEF2F2',
  amber:    '#D97706',
  amberLt:  '#FFFBEB',
  teal:     '#0891B2',
  tealLt:   '#ECFEFF',
  gold:     '#B45309',
  goldLt:   '#FFFBEB',

  // ── Text ──────────────────────────────────────────────────────────
  t1:       '#0D0520',       // near-black with warm tint
  t2:       '#3D2E5E',
  t3:       '#8B7AAE',
  t4:       '#BDB0D6',

  // ── Camera ────────────────────────────────────────────────────────
  cam:      '#080413',
} as const;

// ── Gradients ─────────────────────────────────────────────────────
export const GRADIENT       = ['#6D28D9', '#E8398A'] as const;
export const GRADIENT_WARM  = ['#7C3AED', '#C026D3'] as const;
export const GRADIENT_SOFT  = ['#EDE9FE', '#FDE8F5'] as const;
export const GRADIENT_DARK  = ['#2E1065', '#831843'] as const;

// ── Shadow presets ────────────────────────────────────────────────
export const shadows = {
  xs: {
    shadowColor: '#0D0520',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sm: {
    shadowColor: '#0D0520',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  md: {
    shadowColor: '#0D0520',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 5,
  },
  lg: {
    shadowColor: '#0D0520',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  pur: {
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.40,
    shadowRadius: 20,
    elevation: 10,
  },
  purSm: {
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  tab: {
    shadowColor: '#0D0520',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 20,
  },
} as const;
