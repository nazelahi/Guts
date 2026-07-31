// Snooker Club Luxury Theme Tokens
export const THEMES = {
  EMERALD_FELT: {
    id: 'EMERALD_FELT',
    name: 'Imperial Emerald',
    subtitle: 'Classic Green Baize & Gold',
    feltColor: '#0F3822',
    accentColor: '#D4AF37',
    primary: '#0F3822',
    primaryDark: '#071F12',
    primaryLight: '#185434',
    accentGold: '#D4AF37',
    accentGoldLight: '#F3E5AB',
    background: '#0B0F0C',
    surface: '#131B16',
    surfaceLight: '#1C2922',
    surfaceBorder: '#23382C',
    receivable: '#10B981',
    receivableBg: 'rgba(16, 185, 129, 0.12)',
    payable: '#EF4444',
    payableBg: 'rgba(239, 68, 68, 0.12)',
    settled: '#6B7280',
    settledBg: 'rgba(107, 114, 128, 0.15)',
    textPrimary: '#F3F4F6',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    textGold: '#F59E0B',
  },
  TOURNAMENT_BLUE: {
    id: 'TOURNAMENT_BLUE',
    name: 'Tournament Blue',
    subtitle: 'Royal Championship Felt',
    feltColor: '#1E3A8A',
    accentColor: '#38BDF8',
    primary: '#1E3A8A',
    primaryDark: '#0F172A',
    primaryLight: '#2563EB',
    accentGold: '#38BDF8',
    accentGoldLight: '#BAE6FD',
    background: '#0B1120',
    surface: '#152238',
    surfaceLight: '#1E293B',
    surfaceBorder: '#334155',
    receivable: '#38BDF8',
    receivableBg: 'rgba(56, 189, 248, 0.12)',
    payable: '#F43F5E',
    payableBg: 'rgba(244, 63, 94, 0.12)',
    settled: '#64748B',
    settledBg: 'rgba(100, 116, 139, 0.15)',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    textGold: '#38BDF8',
  },
  BURGUNDY_RED: {
    id: 'BURGUNDY_RED',
    name: 'Velvet Red',
    subtitle: 'Burgundy Lounge Velvet',
    feltColor: '#881337',
    accentColor: '#F59E0B',
    primary: '#881337',
    primaryDark: '#4C0519',
    primaryLight: '#9F1239',
    accentGold: '#F59E0B',
    accentGoldLight: '#FDE68A',
    background: '#15050A',
    surface: '#280D16',
    surfaceLight: '#3F1221',
    surfaceBorder: '#581C30',
    receivable: '#10B981',
    receivableBg: 'rgba(16, 185, 129, 0.12)',
    payable: '#F43F5E',
    payableBg: 'rgba(244, 63, 94, 0.12)',
    settled: '#71717A',
    settledBg: 'rgba(113, 113, 122, 0.15)',
    textPrimary: '#FAFAFA',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
    textGold: '#F59E0B',
  },
  MIDNIGHT_PURPLE: {
    id: 'MIDNIGHT_PURPLE',
    name: 'Midnight VIP',
    subtitle: 'Neon Purple Felt',
    feltColor: '#4C1D95',
    accentColor: '#A78BFA',
    primary: '#4C1D95',
    primaryDark: '#2E1065',
    primaryLight: '#5B21B6',
    accentGold: '#A78BFA',
    accentGoldLight: '#DDD6FE',
    background: '#0F0A1C',
    surface: '#1D1435',
    surfaceLight: '#2D1F4F',
    surfaceBorder: '#432E72',
    receivable: '#34D399',
    receivableBg: 'rgba(52, 211, 153, 0.12)',
    payable: '#FB7185',
    payableBg: 'rgba(251, 113, 133, 0.12)',
    settled: '#8B5CF6',
    settledBg: 'rgba(139, 92, 246, 0.15)',
    textPrimary: '#F5F3FF',
    textSecondary: '#A78BFA',
    textMuted: '#6D28D9',
    textGold: '#C084FC',
  },
  ONYX_BLACK: {
    id: 'ONYX_BLACK',
    name: 'Onyx Stealth',
    subtitle: 'Dark Matte Lounge',
    feltColor: '#1F2937',
    accentColor: '#D4AF37',
    primary: '#1F2937',
    primaryDark: '#111827',
    primaryLight: '#374151',
    accentGold: '#D4AF37',
    accentGoldLight: '#F3E5AB',
    background: '#030712',
    surface: '#111827',
    surfaceLight: '#1F2937',
    surfaceBorder: '#374151',
    receivable: '#10B981',
    receivableBg: 'rgba(16, 185, 129, 0.12)',
    payable: '#EF4444',
    payableBg: 'rgba(239, 68, 68, 0.12)',
    settled: '#6B7280',
    settledBg: 'rgba(107, 114, 128, 0.15)',
    textPrimary: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    textGold: '#F59E0B',
  },
};

let activeThemeKey = 'EMERALD_FELT';

export const setCurrentThemeKey = (key) => {
  if (THEMES[key]) {
    activeThemeKey = key;
  }
};

export const getThemeColors = (themeKey) => {
  const targetKey = themeKey || activeThemeKey;
  return THEMES[targetKey] || THEMES.EMERALD_FELT;
};

export const useTheme = (themeKey) => {
  const targetKey = themeKey || activeThemeKey;
  const theme = THEMES[targetKey] || THEMES.EMERALD_FELT;
  return {
    ...theme,
    balls: {
      cue: '#FFFFFF',
      red: '#DC2626',
      yellow: '#FBBF24',
      green: '#10B981',
      brown: '#B45309',
      blue: '#2563EB',
      pink: '#EC4899',
      black: '#1F2937',
    },
  };
};

export const COLORS = new Proxy({}, {
  get(target, prop) {
    const active = THEMES[activeThemeKey] || THEMES.EMERALD_FELT;
    if (prop in active) {
      return active[prop];
    }
    if (prop === 'balls') {
      return {
        cue: '#FFFFFF',
        red: '#DC2626',
        yellow: '#FBBF24',
        green: '#10B981',
        brown: '#B45309',
        blue: '#2563EB',
        pink: '#EC4899',
        black: '#1F2937',
      };
    }
    return target[prop];
  }
});
