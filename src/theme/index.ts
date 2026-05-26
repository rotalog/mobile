export type ColorPalette = {
  bg: string;
  surface: string;
  card: string;
  border: string;
  green: string;
  greenDim: string;
  greenGlow: string;
  text: string;
  muted: string;
  subtle: string;
  danger: string;
  warning: string;
  overlay: string;
  onPrimary: string;
};

export const darkColors: ColorPalette = {
  bg:        '#0A0C0E',
  surface:   '#111416',
  card:      '#181C1F',
  border:    '#1E2428',
  green:     '#00E676',
  greenDim:  '#00B85A',
  greenGlow: 'rgba(0,230,118,0.15)',
  text:      '#F0F4F7',
  muted:     '#6B7A88',
  subtle:    '#2A3038',
  danger:    '#FF4D4D',
  warning:   '#FFB300',
  overlay:   'rgba(10,12,14,0.92)',
  onPrimary: '#0A0C0E',
};

export const lightColors: ColorPalette = {
  bg:        '#F2F5F8',
  surface:   '#FFFFFF',
  card:      '#FFFFFF',
  border:    '#D8E0E8',
  green:     '#00B85A',
  greenDim:  '#00964D',
  greenGlow: 'rgba(0,184,90,0.12)',
  text:      '#1A2332',
  muted:     '#5C6B7A',
  subtle:    '#E8EDF2',
  danger:    '#E53935',
  warning:   '#E6A200',
  overlay:   'rgba(242,245,248,0.92)',
  onPrimary: '#0A0C0E',
};

/** @deprecated Use useTheme().colors - kept for non-UI code */
export const Colors = darkColors;

export const FontSize = {
  xs:   11,
  sm:   13,
  base: 15,
  md:   17,
  lg:   20,
  xl:   24,
  xxl:  30,
} as const;

export const Radius = {
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  full: 999,
} as const;

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 28,
  xxxl:40,
} as const;
