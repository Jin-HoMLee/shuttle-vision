// Base repository configuration
const REPO_BASE_URL = 'https://github.com/Jin-HoMLee/chrome-extension-template';
const DEVELOPER_BASE_URL = 'https://github.com/Jin-HoMLee';

export const CONFIG = {
  // Derived URLs (computed once at module load)
  HELP_URL: `${REPO_BASE_URL}#readme`,
  SUPPORT_URL: `${REPO_BASE_URL}/issues`,
  DOCUMENTATION_URL: REPO_BASE_URL,
  RELEASES_URL: `${REPO_BASE_URL}/releases`,
  DEVELOPER_URL: DEVELOPER_BASE_URL,
  // Extension metadata
  EXTENSION_NAME: 'Chrome Extension Template',
  VERSION: '1.0.0',
} as const;

// Toast notification timing constants
export const TOAST_CONFIG = {
  SHOW_DURATION: 4000,
  TRANSITION_DURATION: 300,
  SHOW_DELAY: 100,
} as const;

// Content script DOM monitoring constants
export const DOM_CONFIG = {
  SIGNIFICANT_CHANGE_THRESHOLD: 5,
  MUTATION_DEBOUNCE_DELAY: 500,
  SIGNIFICANT_TAGS: ['div', 'section', 'article', 'main', 'aside', 'nav', 'header', 'footer'],
} as const;

// Time conversion constants
export const TIME_CONFIG = {
  MILLISECONDS_PER_MINUTE: 60000,
} as const;

export type ConfigType = typeof CONFIG;
export type ToastConfigType = typeof TOAST_CONFIG;
export type DomConfigType = typeof DOM_CONFIG;
export type TimeConfigType = typeof TIME_CONFIG;
