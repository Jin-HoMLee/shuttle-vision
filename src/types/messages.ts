// Message types and interfaces for Chrome Extension Template

export enum MessageType {
  // Background script messages
  GET_TAB_INFO = 'GET_TAB_INFO',
  TOGGLE_FEATURE = 'TOGGLE_FEATURE',
  SAVE_DATA = 'SAVE_DATA',
  SETTINGS_UPDATED = 'SETTINGS_UPDATED',

  // Content script messages
  HIGHLIGHT_TEXT = 'HIGHLIGHT_TEXT',
  GET_PAGE_INFO = 'GET_PAGE_INFO',
  SCROLL_TO_ELEMENT = 'SCROLL_TO_ELEMENT',
  INJECT_CSS = 'INJECT_CSS',

  // Popup messages
  UPDATE_STATS = 'UPDATE_STATS',
  TAKE_SCREENSHOT = 'TAKE_SCREENSHOT',

  // General messages
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

export interface ExtensionMessage {
  type: MessageType;
  data?: any;
  timestamp?: number;
  id?: string;
}

export interface MessageResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp?: number;
}

// Specific message data interfaces
export interface TabInfo {
  title: string;
  url: string;
  id: number;
  favIconUrl?: string;
}

export interface PageInfo {
  title: string;
  url: string;
  wordCount: number;
  images: number;
  links: number;
  forms: number;
  scripts: number;
  lastModified: string;
}

export interface HighlightData {
  text: string;
  color?: string;
  permanent?: boolean;
}

export interface FeatureToggleData {
  feature: string;
  enabled: boolean;
}

export interface ScrollData {
  selector: string;
  behavior?: 'smooth' | 'instant' | 'auto';
  block?: 'start' | 'center' | 'end' | 'nearest';
}

export interface CSSInjectionData {
  css: string;
  remove?: boolean;
}

export interface SettingsData {
  enabled: boolean;
  notifications: boolean;
  trackScroll: boolean;
  autoHighlight: boolean;
  theme: 'light' | 'dark' | 'auto';
  highlightColor: string;
  fontSize: 'small' | 'medium' | 'large';
  collectStats: boolean;
  localStorage: boolean;
  debug: boolean;
  customCss: boolean;
}
