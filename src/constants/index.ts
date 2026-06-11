export const LOAN_TYPES = {
  PERSONAL: 'personal',
  HOME: 'home',
  BUSINESS: 'business',
} as const;

export type LoanType = (typeof LOAN_TYPES)[keyof typeof LOAN_TYPES];

export const LOAN_LIMITS = {
  personal: { min: 50_000, max: 10_00_000, tenureMin: 12, tenureMax: 60 },
  home: { min: 50_000, max: 1_00_00_000, tenureMin: 60, tenureMax: 360 },
  business: { min: 50_000, max: 50_00_000, tenureMin: 12, tenureMax: 120 },
} as const;

export const INTEREST_RATES = {
  personal: 10.5,
  home: 8.5,
  business: 14,
} as const;

export const BRAND = {
  primary: '#1F4E79',
  accent: '#27AE60',
  error: '#E74C3C',
  warning: '#F39C12',
} as const;

export const AUTO_SAVE_KEY_PREFIX = 'lendswift_draft_';
export const AUTO_SAVE_INTERVAL_MS = 30_000;
export const DRAFT_TTL_HOURS = 72;

export const STEP_THEMES = [
  { id: 1, label: 'Loan Details', hue: '207', icon: 'wallet' },
  { id: 2, label: 'Personal Info', hue: '220', icon: 'user' },
  { id: 3, label: 'KYC', hue: '260', icon: 'shield' },
  { id: 4, label: 'Address', hue: '180', icon: 'map-pin' },
  { id: 5, label: 'Employment', hue: '145', icon: 'briefcase' },
  { id: 6, label: 'Co-Applicant', hue: '30', icon: 'users' },
  { id: 7, label: 'Documents', hue: '35', icon: 'file' },
  { id: 8, label: 'Review', hue: '207', icon: 'check-circle' },
] as const;

export const TOTAL_STEPS = STEP_THEMES.length;
