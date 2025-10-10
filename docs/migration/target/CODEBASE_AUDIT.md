# shuttle-vision Codebase Audit

**Date:** 2025-10-10  
**Purpose:** Document all features, dependencies, architectural patterns, and functionality of the target codebase for migration planning from shuttle-insights/browser-extension

→ back to [README](README.md)

---

## Executive Summary

The **shuttle-vision** repository is a modern Chrome browser extension template built with TypeScript, Webpack, and comprehensive development tooling. It provides a solid foundation for building Chrome extensions with modern best practices, complete build tooling, testing infrastructure, and modular architecture.

**Key Characteristics:**
- **Technology:** TypeScript + Webpack + Manifest V3
- **Architecture:** Modular, component-based with clear separation of concerns
- **Build System:** Webpack with production/development modes
- **Testing:** Jest with jsdom environment and TypeScript support
- **Code Quality:** ESLint + Prettier with strict TypeScript configuration
- **Lines of Code:** ~2,291 lines of TypeScript/JavaScript
- **Bundle Size:** ~136KB (production build)

**Migration Readiness:**
- ✅ Modern TypeScript infrastructure ready for migration
- ✅ Comprehensive build system with Webpack
- ✅ Testing framework configured and working
- ✅ Modular architecture supports feature addition
- ✅ Storage utilities and message passing already implemented
- ⚠️ No pose detection or video interaction capabilities (yet)
- ⚠️ No CSV handling utilities (yet)
- ⚠️ No glossary/labeling system (yet)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Core Features](#core-features)
3. [Dependencies](#dependencies)
4. [Architecture Overview](#architecture-overview)
5. [Component Structure](#component-structure)
6. [Module Organization](#module-organization)
7. [Build System](#build-system)
8. [Testing Infrastructure](#testing-infrastructure)
9. [Design Patterns](#design-patterns)
10. [Migration Readiness Assessment](#migration-readiness-assessment)
11. [Appendix](#appendix)
12. [Conclusion](#conclusion)

---

## Core Features

### 1. Chrome Extension Components

#### Background Service Worker
- **Location:** `src/background/background.ts` (160 lines)
- **Purpose:** Handles extension lifecycle, message passing, and context menus
- **Key Features:**
  - Installation and startup handling
  - Message routing between components
  - Context menu creation and handling
  - Storage initialization on first install
  - Keep-alive mechanism for service worker

#### Content Scripts
- **Location:** `src/content/content.ts` (319 lines)
- **Purpose:** Interact with web pages and DOM
- **Key Features:**
  - Text highlighting using CSS Custom Highlight API (Chrome 105+, Firefox 113+)
  - Page information extraction (word count, links, images, etc.)
  - Keyboard shortcuts (Alt+E, Alt+H)
  - Scroll position tracking
  - DOM mutation observer for dynamic content
  - Toggle-based highlight system

#### Popup Interface
- **Location:** `src/popup/` (popup.ts: 364 lines)
- **Purpose:** Extension popup with quick actions
- **Key Features:**
  - Current page information display
  - Action buttons (highlight, page info, screenshot)
  - Settings toggles
  - Usage statistics display
  - Toast notifications
  - Loading overlay

#### Options Page
- **Location:** `src/options/` (options.ts: 571 lines)
- **Purpose:** Comprehensive settings and configuration
- **Key Features:**
  - Tabbed navigation (General, Appearance, Advanced, Data, CSS, About)
  - Settings management with checkboxes and selects
  - Keyword management system
  - Data import/export (JSON format)
  - Custom CSS editor
  - Confirmation modals for destructive actions
  - Centralized checkbox/select mappings

### 2. Utility Modules

#### Storage Service
- **Location:** `src/utils/storage.ts` (223 lines)
- **Purpose:** Unified Chrome storage API wrapper
- **Key Features:**
  - Async/await based API
  - Support for local and sync storage
  - Error handling with graceful fallbacks
  - Batch operations (getItems, setItems)
  - Default value support
  - Storage quota information
  - Change listeners

#### Toast Notifications
- **Location:** `src/utils/toast.ts` (47 lines)
- **Purpose:** Toast notification lifecycle management
- **Key Features:**
  - Promise-based async/await lifecycle
  - Configurable timing via constants
  - Clean separation from business logic
  - Automatic cleanup after display

#### DOM Observer
- **Location:** `src/utils/dom-observer.ts` (200 lines)
- **Purpose:** Efficient DOM change detection
- **Key Features:**
  - Mutation observer with debouncing
  - Selective filtering for significant changes
  - Support for dynamic SPAs (React, Vue, Angular)
  - Configurable thresholds and delays
  - Comprehensive documentation

### 3. Configuration Management

#### Constants
- **Location:** `src/config/constants.ts` (40 lines)
- **Purpose:** Centralized configuration
- **Exports:**
  - `CONFIG` - URLs, extension metadata
  - `TOAST_CONFIG` - Toast timing constants
  - `DOM_CONFIG` - DOM monitoring thresholds
  - `TIME_CONFIG` - Time conversion constants

### 4. Type Definitions

#### Message Types
- **Location:** `src/types/messages.ts` (93 lines)
- **Purpose:** Type-safe message passing
- **Defines:**
  - `MessageType` enum (16 message types)
  - `ExtensionMessage` interface
  - `MessageResponse` interface
  - Specific data interfaces (TabInfo, PageInfo, etc.)

---

## Dependencies

### Production Dependencies

**None** - The template is dependency-free for production builds, keeping bundle size minimal.

### Development Dependencies

#### 1. TypeScript Ecosystem
- **typescript** (v5.3.2) - TypeScript compiler
- **ts-loader** (v9.5.1) - Webpack TypeScript loader
- **ts-jest** (v29.1.1) - Jest TypeScript preprocessor
- **@types/chrome** (v0.0.260) - Chrome extension API types
- **@types/jest** (v29.5.8) - Jest type definitions
- **@types/node** (v24.5.2) - Node.js type definitions

**Role:** Provides type safety, IntelliSense, and compile-time error checking

#### 2. Build Tools (Webpack)
- **webpack** (v5.89.0) - Module bundler
- **webpack-cli** (v5.1.4) - Webpack command line interface
- **copy-webpack-plugin** (v11.0.0) - Copy static assets
- **html-webpack-plugin** (v5.5.3) - Generate HTML files
- **mini-css-extract-plugin** (v2.7.6) - Extract CSS to separate files
- **css-loader** (v6.8.1) - Process CSS imports

**Role:** Bundles TypeScript into optimized JavaScript, processes CSS, copies assets

**Bundle Impact:** Development build ~136KB, production build optimized

#### 3. Testing Infrastructure
- **jest** (v29.7.0) - Testing framework
- **jest-environment-jsdom** (v30.2.0) - DOM environment for tests
- **jsdom** (v27.0.0) - JavaScript DOM implementation

**Role:** Unit testing with mock browser environment

**Test Coverage:** 16/16 tests passing

#### 4. Code Quality Tools
- **eslint** (v8.54.0) - Linting
- **@typescript-eslint/eslint-plugin** (v6.12.0) - TypeScript ESLint rules
- **@typescript-eslint/parser** (v6.12.0) - TypeScript parser for ESLint
- **prettier** (v3.1.0) - Code formatting
- **eslint-config-prettier** (v9.0.0) - Disable conflicting ESLint rules
- **eslint-plugin-prettier** (v5.0.1) - Run Prettier as ESLint rule

**Role:** Enforce code style, catch errors, auto-format code

#### 5. Utility Tools
- **archiver** (v6.0.1) - Create distribution ZIP files
- **rimraf** (v5.0.5) - Clean build directories

**Role:** Package extension for distribution, clean builds

---

## Architecture Overview

### Technology Stack

```
TypeScript + Modern Tooling
    │
    ├─► TypeScript (v5.3.2)
    ├─► Webpack (v5.89.0)
    ├─► Jest (v29.7.0)
    ├─► ESLint + Prettier
    └─► Manifest V3
```

### Extension Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Chrome Extension                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────┐      ┌──────────────────┐              │
│  │   Background   │◄────►│  Content Script  │              │
│  │ Service Worker │      │  (Web Page DOM)  │              │
│  └────────────────┘      └──────────────────┘              │
│         ▲                        ▲                          │
│         │                        │                          │
│         ▼                        ▼                          │
│  ┌────────────────┐      ┌──────────────────┐              │
│  │  Popup UI      │      │   Options Page   │              │
│  │  (Quick Actions)│      │  (Full Settings) │              │
│  └────────────────┘      └──────────────────┘              │
│         ▲                        ▲                          │
│         └────────┬───────────────┘                          │
│                  ▼                                          │
│         ┌─────────────────┐                                 │
│         │ Storage Service │                                 │
│         │  (chrome.storage)│                                 │
│         └─────────────────┘                                 │
└─────────────────────────────────────────────────────────────┘
```

### Message Flow

```
Popup/Options → Background → Content Script
      │                           │
      │                           ▼
      └──────────────────► chrome.storage
```

### File Structure

```
shuttle-vision/
├── src/
│   ├── background/
│   │   └── background.ts          # Service worker
│   ├── content/
│   │   └── content.ts             # Content script
│   ├── popup/
│   │   ├── popup.html             # Popup HTML
│   │   ├── popup.css              # Popup styles
│   │   └── popup.ts               # Popup logic
│   ├── options/
│   │   ├── options.html           # Options HTML
│   │   ├── options.css            # Options styles
│   │   └── options.ts             # Options logic
│   ├── config/
│   │   └── constants.ts           # Centralized config
│   ├── utils/
│   │   ├── storage.ts             # Storage API wrapper
│   │   ├── toast.ts               # Toast notifications
│   │   └── dom-observer.ts        # DOM mutation observer
│   ├── types/
│   │   ├── messages.ts            # Message type definitions
│   │   └── css-highlights.d.ts    # CSS Highlights API types
│   ├── assets/
│   │   └── icons/                 # Extension icons
│   ├── __tests__/
│   │   ├── setup.ts               # Test setup
│   │   └── storage.test.ts        # Storage tests
│   └── manifest.json              # Extension manifest
├── webpack.config.js              # Build configuration
├── tsconfig.json                  # TypeScript config
├── jest.config.js                 # Test config
├── .eslintrc.json                 # Linting rules
├── .prettierrc                    # Formatting rules
└── package.json                   # Dependencies
```

---

## Component Structure

### Module Dependency Graph

```
background.ts (service worker)
├── types/messages.ts
└── utils/storage.ts

content.ts (content script)
├── types/messages.ts
├── utils/storage.ts
└── utils/dom-observer.ts
    └── config/constants.ts

popup.ts (popup interface)
├── types/messages.ts
├── utils/storage.ts
├── utils/toast.ts
│   └── config/constants.ts
└── config/constants.ts

options.ts (options page)
├── types/messages.ts
├── utils/storage.ts
├── utils/toast.ts
│   └── config/constants.ts
└── config/constants.ts
```

### Key Classes and Services

#### StorageService (Static Class)
```typescript
class StorageService {
  static async getItem<T>(key: string, useSync?: boolean): Promise<T | null>
  static async setItem(key: string, value: any, useSync?: boolean): Promise<boolean>
  static async removeItem(key: string, useSync?: boolean): Promise<boolean>
  static async getItems(keys: string[], useSync?: boolean): Promise<Record<string, any>>
  static async setItems(items: Record<string, any>, useSync?: boolean): Promise<boolean>
  static async clear(useSync?: boolean): Promise<boolean>
  static async getAllItems(useSync?: boolean): Promise<Record<string, any>>
  static async getBytesInUse(useSync?: boolean): Promise<number>
  static onChanged(callback: Function, useSync?: boolean): void
  static async getWithDefault<T>(key: string, defaultValue: T, useSync?: boolean): Promise<T>
  static async hasItem(key: string, useSync?: boolean): Promise<boolean>
  static async getQuotaInfo(): Promise<{ quota: number; bytesInUse: number; percentUsed: number }>
}
```

#### DOMObserver (Class)
```typescript
class DOMObserver {
  start(callback: () => void, target?: Element): void
  stop(): void
  private handleMutations(mutations: MutationRecord[], callback: () => void): void
  private hasSignificantChanges(mutations: MutationRecord[]): boolean
  private isSignificantTag(tagName: string): boolean
}
```

#### ContentScript (Class)
```typescript
class ContentScript {
  private init(): Promise<void>
  private setupMessageListener(): void
  private injectStyles(): void
  private setupFeatures(): void
  private highlightText(text: string): void
  private getPageInfo(sendResponse: Function): void
  private scrollToElement(selector: string): void
  private showPageStats(): void
  private setupKeyboardShortcuts(): void
  private trackScrollPosition(): void
  private toggleExtensionUI(): void
  private startDOMObserver(): void
}
```

#### PopupManager (Class)
```typescript
class PopupManager {
  private init(): Promise<void>
  private loadCurrentTab(): Promise<void>
  private loadSettings(): Promise<void>
  private loadStats(): Promise<void>
  private setupEventListeners(): void
  private updateUI(): void
  private handleHighlightText(): Promise<void>
  private handleGetPageInfo(): Promise<void>
  private handleTakeScreenshot(): Promise<void>
  private handleSettingChange(setting: string, value: boolean): Promise<void>
  private showLoading(show: boolean): void
  private showToast(message: string, type: 'success' | 'error' | 'warning'): Promise<void>
}
```

#### OptionsManager (Class)
```typescript
class OptionsManager {
  private init(): Promise<void>
  private loadSettings(): Promise<void>
  private setupNavigation(): void
  private setupEventListeners(): void
  private setupToggle(elementId: string, settingKey: string): void
  private setupSelect(elementId: string, settingKey: string): void
  private setupColorPicker(elementId: string, settingKey: string): void
  private setupKeywordManager(): void
  private setupDataManagement(): void
  private setupCssEditor(): void
  private addKeyword(keyword: string): void
  private removeKeyword(keyword: string): void
  private saveSettings(): Promise<void>
  private saveKeywords(): Promise<void>
  private exportData(): Promise<void>
  private importData(file: File): Promise<void>
  private clearAllData(): Promise<void>
  private showConfirmModal(title: string, message: string, onConfirm: () => void): void
  private showToast(message: string, type: 'success' | 'error' | 'warning'): Promise<void>
}
```

---

## Module Organization

### Core Modules

#### background.ts (160 lines)
**Purpose:** Background service worker handling extension lifecycle

**Key Functions:**
- `chrome.runtime.onInstalled` - Handle installation and updates
- `chrome.runtime.onStartup` - Handle extension startup
- `chrome.runtime.onMessage` - Message routing
- `chrome.contextMenus.create` - Context menu setup
- `handleGetTabInfo()` - Get tab information
- `handleToggleFeature()` - Toggle extension features
- `handleSaveData()` - Save data to storage
- `resetKeepAlive()` - Keep service worker alive

**Message Types Handled:**
- `GET_TAB_INFO`
- `TOGGLE_FEATURE`
- `SAVE_DATA`

#### content.ts (319 lines)
**Purpose:** Content script for DOM interaction

**Key Functions:**
- `init()` - Initialize content script
- `highlightText()` - Highlight text using CSS Custom Highlight API
- `getPageInfo()` - Extract page statistics
- `scrollToElement()` - Smooth scroll to element
- `showPageStats()` - Display page statistics badge
- `setupKeyboardShortcuts()` - Register keyboard shortcuts
- `trackScrollPosition()` - Save scroll position
- `startDOMObserver()` - Monitor DOM changes

**Message Types Handled:**
- `HIGHLIGHT_TEXT`
- `GET_PAGE_INFO`
- `SCROLL_TO_ELEMENT`

**Features:**
- CSS Custom Highlight API support detection
- Graceful fallback for unsupported browsers
- Debounced scroll tracking
- Efficient DOM mutation observation

#### popup.ts (364 lines)
**Purpose:** Popup interface logic

**Key Functions:**
- `init()` - Initialize popup
- `loadCurrentTab()` - Get current tab info
- `loadSettings()` - Load user settings
- `loadStats()` - Load usage statistics
- `handleHighlightText()` - Trigger text highlighting
- `handleGetPageInfo()` - Get page information
- `handleTakeScreenshot()` - Capture visible tab
- `handleSettingChange()` - Update settings
- `showToast()` - Display toast notification

**UI Sections:**
- Page info display
- Action buttons
- Settings toggles
- Usage statistics
- Loading overlay

#### options.ts (571 lines)
**Purpose:** Options page logic

**Key Functions:**
- `init()` - Initialize options page
- `setupNavigation()` - Setup tabbed navigation
- `setupToggle()` - Setup checkbox controls
- `setupSelect()` - Setup select controls
- `setupKeywordManager()` - Keyword management
- `setupDataManagement()` - Data import/export
- `exportData()` - Export settings as JSON
- `importData()` - Import settings from JSON
- `clearAllData()` - Clear all storage
- `showConfirmModal()` - Confirmation dialog

**Centralized Mappings:**
- Checkbox mapping (8 toggles)
- Select mapping (2 selects)

**Sections:**
- General settings
- Appearance settings
- Advanced settings
- Data management
- Custom CSS editor
- About section

### Utility Modules

#### utils/storage.ts (223 lines)
**Purpose:** Storage API wrapper

**Key Functions:**
- `getItem()` - Get single item
- `setItem()` - Set single item
- `removeItem()` - Remove item
- `getItems()` - Get multiple items
- `setItems()` - Set multiple items
- `clear()` - Clear all storage
- `getAllItems()` - Get all stored items
- `getBytesInUse()` - Get storage usage
- `onChanged()` - Listen to storage changes
- `getWithDefault()` - Get with default value
- `hasItem()` - Check if item exists
- `getQuotaInfo()` - Get storage quota info

**Error Handling:**
- All methods return null/false on error
- Console error logging
- Graceful degradation

#### utils/toast.ts (47 lines)
**Purpose:** Toast notification utilities

**Key Functions:**
- `delay()` - Promise-based delay
- `handleToastLifecycle()` - Async toast lifecycle

**Configuration:**
- Uses `TOAST_CONFIG` constants
- Show duration: 4000ms
- Transition duration: 300ms
- Show delay: 100ms

#### utils/dom-observer.ts (200 lines)
**Purpose:** DOM mutation observer

**Key Functions:**
- `start()` - Start observing DOM
- `stop()` - Stop observing and cleanup
- `handleMutations()` - Debounced mutation handler
- `hasSignificantChanges()` - Filter significant changes
- `isSignificantTag()` - Check if tag is significant

**Configuration:**
- Significant change threshold: 5 children
- Debounce delay: 500ms
- Significant tags: div, section, article, main, aside, nav, header, footer

**Use Cases:**
- React/Vue/Angular SPA support
- Dynamic content detection
- Performance-optimized

### Configuration Module

#### config/constants.ts (40 lines)
**Purpose:** Centralized configuration

**Exports:**
- `CONFIG` - Extension URLs and metadata
- `TOAST_CONFIG` - Toast timing
- `DOM_CONFIG` - DOM monitoring thresholds
- `TIME_CONFIG` - Time conversions

**Type Safety:**
- All configs use `as const`
- TypeScript types exported

### Type Definitions

#### types/messages.ts (93 lines)
**Purpose:** Message type definitions

**Exports:**
- `MessageType` enum (16 types)
- `ExtensionMessage` interface
- `MessageResponse` interface
- `TabInfo` interface
- `PageInfo` interface
- `HighlightData` interface
- `FeatureToggleData` interface
- `ScrollData` interface
- `CSSInjectionData` interface
- `SettingsData` interface

---

## Build System

### Webpack Configuration

**File:** `webpack.config.js`

**Entry Points:**
- `background` - Background service worker
- `content` - Content script
- `popup` - Popup interface
- `options` - Options page

**Output:**
- Production build: `dist/` directory
- File naming: `[name]/[name].js`
- CSS extraction: `[name]/[name].css`

**Loaders:**
- `ts-loader` - TypeScript compilation
- `css-loader` + `MiniCssExtractPlugin` - CSS processing
- Asset loader for images

**Plugins:**
- `MiniCssExtractPlugin` - Extract CSS
- `HtmlWebpackPlugin` (x2) - Generate HTML files
- `CopyWebpackPlugin` - Copy static assets

**Module Resolution:**
- Path alias: `@/` → `src/`
- Extensions: `.tsx`, `.ts`, `.js`

**Build Modes:**
- Development: Source maps, no minification
- Production: Minified, optimized

### TypeScript Configuration

**File:** `tsconfig.json`

**Compiler Options:**
- Target: ES2020
- Module: ESNext
- Strict mode: Enabled
- Path mapping: `@/*` → `src/*`
- Types: chrome, jest, node

**Include:**
- All files in `src/`

**Exclude:**
- node_modules
- dist
- Test files

### Build Scripts

**package.json scripts:**
- `dev` - Development build with watch mode
- `build` - Production build
- `build:dev` - Development build (single run)
- `lint` - Run ESLint
- `lint:fix` - Auto-fix linting issues
- `format` - Format code with Prettier
- `format:check` - Check code formatting
- `clean` - Remove dist directory
- `zip` - Create distribution ZIP
- `test` - Run Jest tests
- `test:watch` - Run tests in watch mode

**Build Output:**
```
dist/
├── background/
│   └── background.js        # 4.54 KB
├── content/
│   └── content.js           # 8.65 KB
├── popup/
│   ├── popup.html           # 3.16 KB
│   ├── popup.css            # 6.46 KB
│   └── popup.js             # 9.26 KB
├── options/
│   ├── options.html         # 8.39 KB
│   ├── options.css          # 9.74 KB
│   └── options.js           # 12.3 KB
├── assets/
│   └── icons/               # 7.25 KB
└── manifest.json            # 1.38 KB

Total: ~136 KB
```

---

## Testing Infrastructure

### Jest Configuration

**File:** `jest.config.js`

**Settings:**
- Preset: `ts-jest`
- Test environment: `jsdom`
- Test match: `**/__tests__/**/*.test.ts`
- Transform: TypeScript via ts-jest
- Module name mapper: `@/` → `src/`
- Setup file: `src/__tests__/setup.ts`

**Coverage:**
- Collect from: All `.ts` files in `src/`
- Exclude: Type definitions, tests
- Reporters: text, lcov, html

### Test Suite

**File:** `src/__tests__/storage.test.ts`

**Test Coverage:**
- ✅ StorageService.getItem (4 tests)
- ✅ StorageService.setItem (3 tests)
- ✅ StorageService.removeItem (2 tests)
- ✅ StorageService.getWithDefault (4 tests)
- ✅ StorageService.hasItem (2 tests)
- ✅ StorageService.getQuotaInfo (1 test)

**Total:** 16 tests, all passing

**Mock Setup:**
```typescript
global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
      getBytesInUse: jest.fn(),
    },
    sync: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
      getBytesInUse: jest.fn(),
      QUOTA_BYTES: 102400,
    },
    onChanged: {
      addListener: jest.fn(),
    },
  },
};
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm test -- --coverage
```

---

## Design Patterns

### 1. Class-Based Component Pattern
**Usage:** All major components (ContentScript, PopupManager, OptionsManager)

**Benefits:**
- Encapsulation of state and methods
- Clear initialization flow
- Easy to test and maintain

**Example:**
```typescript
class PopupManager {
  private currentTab: chrome.tabs.Tab | null = null;
  private settings: any = {};
  
  constructor() {
    this.init();
  }
  
  private async init() {
    await this.loadCurrentTab();
    await this.loadSettings();
    this.setupEventListeners();
    this.updateUI();
  }
}
```

### 2. Static Service Pattern
**Usage:** StorageService

**Benefits:**
- No instantiation needed
- Consistent API across codebase
- Easy to mock for testing

**Example:**
```typescript
class StorageService {
  static async getItem<T>(key: string, useSync?: boolean): Promise<T | null> {
    // Implementation
  }
}
```

### 3. Promise-Based Async Pattern
**Usage:** Throughout codebase

**Benefits:**
- Clean async/await syntax
- Better error handling
- Composable operations

**Example:**
```typescript
private async handleHighlightText() {
  try {
    const result = await chrome.scripting.executeScript(...);
    const response = await chrome.tabs.sendMessage(...);
    await this.saveStats();
  } catch (error) {
    this.showToast('Failed', 'error');
  }
}
```

### 4. Type-Safe Message Passing
**Usage:** All inter-component communication

**Benefits:**
- Compile-time type checking
- Auto-completion in IDE
- Clear contracts between components

**Example:**
```typescript
const message: ExtensionMessage = {
  type: MessageType.HIGHLIGHT_TEXT,
  data: { text: selectedText },
};
await chrome.tabs.sendMessage(tabId, message);
```

### 5. Centralized Configuration
**Usage:** Constants module

**Benefits:**
- Single source of truth
- Easy to update values
- Type-safe with `as const`

**Example:**
```typescript
export const TOAST_CONFIG = {
  SHOW_DURATION: 4000,
  TRANSITION_DURATION: 300,
  SHOW_DELAY: 100,
} as const;
```

### 6. Error Handling Pattern
**Usage:** Storage service and all async operations

**Benefits:**
- Graceful degradation
- Detailed error logging
- User-friendly error messages

**Example:**
```typescript
static async getItem<T>(key: string): Promise<T | null> {
  try {
    const result = await chrome.storage.local.get(key);
    return result[key] ?? null;
  } catch (error) {
    console.error('StorageService: Failed to get item', key, error);
    return null;
  }
}
```

### 7. Observer Pattern
**Usage:** DOMObserver, storage change listeners

**Benefits:**
- Reactive to changes
- Decoupled components
- Efficient updates

**Example:**
```typescript
StorageService.onChanged((changes) => {
  if (changes.settings) {
    this.updateUI();
  }
});
```

### 8. Centralized Mapping Pattern
**Usage:** OptionsManager checkbox/select mappings

**Benefits:**
- DRY principle
- Easy to add new controls
- Consistent behavior

**Example:**
```typescript
private readonly checkboxMapping = new Map<string, string>([
  ['enabledToggle', 'enabled'],
  ['notificationsToggle', 'notifications'],
  // ...
]);

this.checkboxMapping.forEach((settingKey, elementId) => {
  this.setupToggle(elementId, settingKey);
});
```

---

## Migration Readiness Assessment

### Existing Infrastructure

#### ✅ Ready for Migration

**Build System:**
- ✅ Webpack configured for TypeScript
- ✅ Production/development builds
- ✅ CSS extraction and bundling
- ✅ Asset copying
- ✅ Source maps for debugging

**Code Quality:**
- ✅ TypeScript with strict mode
- ✅ ESLint configuration
- ✅ Prettier formatting
- ✅ Path aliases configured

**Testing:**
- ✅ Jest configured
- ✅ jsdom environment
- ✅ Mock Chrome APIs
- ✅ Coverage reporting

**Core Utilities:**
- ✅ Storage service (comprehensive)
- ✅ Message passing (type-safe)
- ✅ Toast notifications
- ✅ DOM observer

**Extension Components:**
- ✅ Background service worker
- ✅ Content scripts
- ✅ Popup interface
- ✅ Options page
- ✅ Context menus

#### ⚠️ Missing for Migration (To Be Added)

**Video Interaction:**
- ❌ YouTube video detection
- ❌ Video element access
- ❌ Video player controls
- ❌ Video URL extraction
- ❌ Video metadata access

**Pose Detection:**
- ❌ TensorFlow.js integration
- ❌ Pose detection models
- ❌ Canvas overlay system
- ❌ Pose visualization
- ❌ Keypoint drawing utilities

**Shot Labeling:**
- ❌ Shot data structures
- ❌ Shot workflow management
- ❌ Shot list UI
- ❌ Start/end marking
- ❌ Label selection

**Glossary System:**
- ❌ Glossary data loader
- ❌ Shot type buttons
- ❌ Dimension controls
- ❌ Glossary utilities

**CSV Handling:**
- ❌ CSV parsing
- ❌ CSV generation
- ❌ CSV import/export
- ❌ Data validation
- ❌ CSV format utilities

**Theme System:**
- ❌ Theme manager
- ❌ Dark/light mode
- ❌ Theme toggle
- ❌ CSS custom properties

**Panel UI:**
- ❌ Draggable panel
- ❌ Resizable panel
- ❌ Panel state persistence
- ❌ Panel positioning

### Technology Stack Comparison

| Aspect | shuttle-insights (Source) | shuttle-vision (Target) | Migration Strategy |
|--------|---------------------------|-------------------------|-------------------|
| **Language** | Vanilla JavaScript ES6 | TypeScript | ✅ Convert JS to TS with types |
| **Module System** | ES6 Modules | ES6 Modules + TypeScript | ✅ Compatible, add types |
| **Build Tool** | esbuild | Webpack | ⚠️ Different bundler, compatible |
| **Testing** | Jest | Jest | ✅ Same framework |
| **Linting** | None | ESLint + Prettier | ✅ Add linting to source code |
| **CSS** | Pure CSS + custom properties | CSS (extract via Webpack) | ✅ Compatible |
| **Manifest** | V3 | V3 | ✅ Same version |
| **Storage API** | Direct chrome.storage | StorageService wrapper | ✅ Wrapper is better |
| **Message Passing** | Direct chrome.runtime | Type-safe messages | ✅ Type safety is better |

### Migration Complexity Assessment

#### Low Complexity (Direct Port)
- ✅ Constants → Already have constants pattern
- ✅ Storage utilities → Already have StorageService
- ✅ Message types → Already have type definitions
- ✅ Basic UI components → Have popup/options structure

#### Medium Complexity (Adaptation Required)
- ⚠️ Theme system → Need to add theme manager
- ⚠️ CSV utilities → Need to add CSV parsing
- ⚠️ Glossary loader → Need to add JSON data loading
- ⚠️ Video utilities → Need to add YouTube integration

#### High Complexity (New Implementation)
- ❌ TensorFlow.js integration → Large bundle size consideration
- ❌ Pose detection → Complex ML model integration
- ❌ Canvas overlay → Coordinate system mapping
- ❌ Shot workflow → Complex state management
- ❌ Panel drag/resize → Custom UI interactions

### Recommended Migration Phases

**Phase 1: Foundation (Weeks 1-2)**
- Add missing utility modules (CSV, video, theme)
- Implement data structures
- Set up glossary loading
- Add validation utilities

**Phase 2: Core Features (Weeks 3-4)**
- Implement shot workflow
- Add shot list UI
- Implement CSV import/export
- Add theme system

**Phase 3: Panel UI (Weeks 5-6)**
- Create draggable/resizable panel
- Implement panel state persistence
- Add panel controls
- Integrate with YouTube

**Phase 4: Pose Detection (Weeks 7-8)**
- Integrate TensorFlow.js
- Implement pose detection
- Add canvas overlay
- Implement pose visualization

**Phase 5: Integration & Testing (Weeks 9-10)**
- Integration testing
- Performance optimization
- Bundle size optimization
- User acceptance testing

### Bundle Size Considerations

**Current shuttle-vision:** ~136 KB

**Estimated after migration:**
- TensorFlow.js core: ~1.5 MB
- TensorFlow.js backend: Included in bundle
- Pose detection model: ~2-3 MB (loaded dynamically)
- New features code: ~100 KB
- **Total estimated:** ~1.7-1.8 MB (loaded), ~3.5-4.5 MB (with models)

**Optimization strategies:**
- Lazy load TensorFlow.js
- Load models on demand
- Use webpack code splitting
- Minimize bundle size with tree shaking

---

## Appendix

### File Statistics

**Source Files:**
- TypeScript files: 16
- Total lines of code: ~2,291
- Test files: 1 (16 tests)
- Configuration files: 7

**Build Artifacts:**
- Production bundle: ~136 KB
- Files generated: 15

### Chrome Extension Manifest

**Version:** Manifest V3

**Permissions:**
- `storage` - For saving settings and data
- `activeTab` - For interacting with current tab
- `scripting` - For injecting content scripts
- `contextMenus` - For right-click menu

**Host Permissions:**
- `https://*/*` - All HTTPS sites
- `http://*/*` - All HTTP sites

**Content Security Policy:**
- `script-src 'self'`
- `object-src 'self'`

### Development Commands

```bash
# Install dependencies
npm install

# Development build (watch mode)
npm run dev

# Production build
npm run build

# Run tests
npm test
npm run test:watch

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check

# Create distribution
npm run zip

# Clean build
npm run clean
```

### Browser Compatibility

**Chrome:**
- Minimum version: 105+ (for CSS Custom Highlight API)
- Tested on: Chrome 120+

**Firefox:**
- Manifest V3 support: Firefox 109+
- CSS Custom Highlight API: Firefox 113+

**Edge:**
- Full support (Chromium-based)

---

## Conclusion

The **shuttle-vision** repository provides a solid, modern foundation for Chrome extension development with TypeScript, comprehensive tooling, and best practices. The codebase is well-architected with clear separation of concerns, modular design, and type safety throughout.

**Strengths:**
- ✅ Modern TypeScript infrastructure
- ✅ Comprehensive build system (Webpack)
- ✅ Testing framework configured (Jest)
- ✅ Code quality tools (ESLint, Prettier)
- ✅ Modular architecture
- ✅ Type-safe message passing
- ✅ Storage utilities implemented
- ✅ Good documentation and README
- ✅ Production-ready build process

**Readiness for Migration:**
- Core infrastructure: **Ready** ✅
- Utility modules: **Partially ready** ⚠️
- UI components: **Ready structure** ✅
- Domain-specific features: **To be implemented** ❌

**Migration Estimate:**
- Duration: 8-10 weeks
- Complexity: Medium-High
- Bundle size increase: ~1.6 MB (significant due to TensorFlow.js)
- Testing effort: High (new features need comprehensive tests)

This audit provides a complete foundation for planning the migration from shuttle-insights/browser-extension to shuttle-vision. The target codebase is ready to receive the migrated features with minimal structural changes needed.

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-10  
**Author:** GitHub Copilot  
**Related Documents:**
- Source codebase audit: `docs/migration/source/CODEBASE_AUDIT.md`
- Architecture overview: `docs/migration/target/ARCHITECTURE_OVERVIEW.md`
- Migration plan: To be created
