# shuttle-vision Architecture Overview

**Date:** 2025-10-10  
**Purpose:** Detailed architectural documentation of the target codebase for migration planning

→ back to [README](README.md)

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Component Architecture](#component-architecture)
3. [Module Dependency Graph](#module-dependency-graph)
4. [Data Flow](#data-flow)
5. [State Management](#state-management)
6. [Communication Patterns](#communication-patterns)
7. [Storage Architecture](#storage-architecture)
8. [Build & Deployment Architecture](#build--deployment-architecture)
9. [Migration Architecture Mapping](#migration-architecture-mapping)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Chrome Extension                            │
│                     (Manifest V3)                                │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   Background     │  │   Content        │  │   UI Pages       │
│ Service Worker   │  │   Scripts        │  │ (Popup/Options)  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Chrome Storage  │
                    │  (Local + Sync)  │
                    └──────────────────┘
```

### Technology Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                         Technology Stack                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Language:        TypeScript 5.3.2                              │
│  Build Tool:      Webpack 5.89.0                                │
│  Testing:         Jest 29.7.0 + jsdom                           │
│  Code Quality:    ESLint 8.54.0 + Prettier 3.1.0                │
│  Manifest:        V3 (Chrome Extension)                         │
│  Module System:   ES Modules                                    │
│  CSS Processing:  CSS Loader + Mini CSS Extract                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Extension Components

```
┌─────────────────────────────────────────────────────────────────┐
│                      Extension Components                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Background Service Worker (background.ts)              │    │
│  │ • Lifecycle management                                 │    │
│  │ • Message routing                                      │    │
│  │ • Context menus                                        │    │
│  │ • Keep-alive mechanism                                 │    │
│  └────────────────────────────────────────────────────────┘    │
│                              │                                  │
│           ┌──────────────────┼──────────────────┐              │
│           │                  │                  │              │
│  ┌────────▼────────┐  ┌─────▼─────┐  ┌────────▼────────┐     │
│  │ Content Script  │  │  Popup    │  │    Options      │     │
│  │  (content.ts)   │  │ (popup/)  │  │   (options/)    │     │
│  │                 │  │           │  │                 │     │
│  │ • DOM interact  │  │ • Quick   │  │ • Full settings │     │
│  │ • Text highlight│  │   actions │  │ • Data mgmt     │     │
│  │ • Page info     │  │ • Stats   │  │ • CSS editor    │     │
│  │ • Keyboard      │  │ • Settings│  │ • Import/export │     │
│  │ • DOM observer  │  │           │  │                 │     │
│  └─────────────────┘  └───────────┘  └─────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Background Service Worker Architecture

```
background.ts
├── Lifecycle Events
│   ├── onInstalled (installation, updates)
│   │   └── Initialize default settings
│   ├── onStartup (extension startup)
│   └── Keep-alive mechanism (prevent sleep)
│
├── Message Handlers
│   ├── GET_TAB_INFO → handleGetTabInfo()
│   ├── TOGGLE_FEATURE → handleToggleFeature()
│   └── SAVE_DATA → handleSaveData()
│
├── Context Menus
│   ├── Create menu items
│   └── Handle menu clicks
│       └── Execute scripts in content context
│
└── Dependencies
    ├── types/messages.ts (message types)
    └── utils/storage.ts (storage operations)
```

### Content Script Architecture

```
content.ts (ContentScript class)
├── Initialization
│   ├── Load settings from storage
│   ├── Check if extension enabled
│   ├── Setup message listeners
│   ├── Inject CSS styles
│   ├── Setup features
│   └── Start DOM observer
│
├── Features
│   ├── Text Highlighting
│   │   ├── CSS Custom Highlight API
│   │   ├── Multi-occurrence support
│   │   ├── Case-insensitive search
│   │   └── Toggle functionality
│   │
│   ├── Page Information
│   │   ├── Title, URL
│   │   ├── Word count
│   │   ├── Images, links, forms
│   │   └── Scripts, last modified
│   │
│   ├── Scroll Handling
│   │   ├── Smooth scroll to element
│   │   ├── Position tracking (debounced)
│   │   └── Persist scroll state
│   │
│   ├── Keyboard Shortcuts
│   │   ├── Alt+E (toggle UI)
│   │   └── Alt+H (highlight selection)
│   │
│   └── Page Statistics
│       └── Word count badge
│
├── DOM Monitoring
│   └── DOMObserver for dynamic content
│
└── CSS Highlights Support
    ├── Feature detection
    └── Graceful fallback
```

### Popup Architecture

```
popup/ (PopupManager class)
├── popup.html (structure)
├── popup.css (styles)
└── popup.ts (logic)
    │
    ├── Initialization
    │   ├── Load current tab
    │   ├── Load settings
    │   ├── Load statistics
    │   ├── Setup event listeners
    │   └── Update UI
    │
    ├── UI Sections
    │   ├── Page Info
    │   │   ├── Title
    │   │   ├── URL
    │   │   └── Status
    │   │
    │   ├── Actions
    │   │   ├── Highlight Text
    │   │   ├── Get Page Info
    │   │   └── Take Screenshot
    │   │
    │   ├── Settings
    │   │   ├── Enabled toggle
    │   │   ├── Notifications toggle
    │   │   └── Track scroll toggle
    │   │
    │   ├── Statistics
    │   │   ├── Total pages
    │   │   ├── Total time
    │   │   ├── Highlight count
    │   │   └── Screenshot count
    │   │
    │   └── Footer
    │       ├── Options button
    │       └── Help button
    │
    └── Features
        ├── Toast notifications
        ├── Loading overlay
        └── Setting synchronization
```

### Options Page Architecture

```
options/ (OptionsManager class)
├── options.html (structure)
├── options.css (styles)
└── options.ts (logic)
    │
    ├── Initialization
    │   ├── Load all settings
    │   ├── Setup navigation
    │   ├── Setup event listeners
    │   └── Update UI
    │
    ├── Navigation
    │   ├── General
    │   ├── Appearance
    │   ├── Advanced
    │   ├── Data
    │   ├── CSS
    │   └── About
    │
    ├── Settings Management
    │   ├── Checkbox mapping (8 controls)
    │   ├── Select mapping (2 controls)
    │   ├── Color picker
    │   └── Centralized handlers
    │
    ├── Keyword Manager
    │   ├── Add keyword
    │   ├── Remove keyword
    │   └── Display keyword list
    │
    ├── Data Management
    │   ├── Export data (JSON)
    │   ├── Import data (file)
    │   └── Clear all data
    │
    ├── CSS Editor
    │   ├── Custom CSS input
    │   ├── Save CSS
    │   └── Reset CSS
    │
    └── About Section
        ├── Build info
        ├── External links
        └── Version info
```

---

## Module Dependency Graph

### Complete Dependency Tree

```
Root
│
├── background.ts
│   ├── types/messages.ts
│   └── utils/storage.ts
│
├── content.ts
│   ├── types/messages.ts
│   ├── utils/storage.ts
│   └── utils/dom-observer.ts
│       └── config/constants.ts
│
├── popup.ts
│   ├── types/messages.ts
│   ├── utils/storage.ts
│   ├── utils/toast.ts
│   │   └── config/constants.ts
│   └── config/constants.ts
│
├── options.ts
│   ├── types/messages.ts
│   ├── utils/storage.ts
│   ├── utils/toast.ts
│   │   └── config/constants.ts
│   └── config/constants.ts
│
├── utils/
│   ├── storage.ts (standalone)
│   ├── toast.ts
│   │   └── config/constants.ts
│   └── dom-observer.ts
│       └── config/constants.ts
│
├── config/
│   └── constants.ts (standalone)
│
└── types/
    ├── messages.ts (standalone)
    └── css-highlights.d.ts (standalone)
```

### Utility Module Dependencies

```
utils/storage.ts
└── No dependencies (pure service)

utils/toast.ts
└── config/constants.ts
    └── TOAST_CONFIG

utils/dom-observer.ts
└── config/constants.ts
    └── DOM_CONFIG
```

### Shared Dependencies

```
config/constants.ts
├── Used by: popup.ts
├── Used by: options.ts
├── Used by: utils/toast.ts
└── Used by: utils/dom-observer.ts

utils/storage.ts
├── Used by: background.ts
├── Used by: content.ts
├── Used by: popup.ts
└── Used by: options.ts

types/messages.ts
├── Used by: background.ts
├── Used by: content.ts
├── Used by: popup.ts
└── Used by: options.ts
```

---

## Data Flow

### Message Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        Message Flow                              │
└─────────────────────────────────────────────────────────────────┘

Popup → Content Script (via chrome.tabs.sendMessage)
├── HIGHLIGHT_TEXT
├── GET_PAGE_INFO
└── SCROLL_TO_ELEMENT

Popup → Background (via chrome.runtime.sendMessage)
├── GET_TAB_INFO
├── TOGGLE_FEATURE
├── SAVE_DATA
└── SETTINGS_UPDATED

Options → Background (via chrome.runtime.sendMessage)
└── SETTINGS_UPDATED

Background → Content Script (via chrome.tabs.sendMessage)
└── (Forwarded messages)

Content Script → Background (via chrome.runtime.sendMessage)
└── (Response messages)
```

### Data Storage Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      Storage Flow                                │
└─────────────────────────────────────────────────────────────────┘

Write Flow:
Component → StorageService → chrome.storage.local/sync → Disk

Read Flow:
Disk → chrome.storage.local/sync → StorageService → Component

Storage Keys:
├── 'settings' (object)
│   ├── enabled: boolean
│   ├── notifications: boolean
│   ├── trackScroll: boolean
│   ├── autoHighlight: boolean
│   ├── theme: string
│   ├── highlightColor: string
│   ├── fontSize: string
│   ├── collectStats: boolean
│   ├── localStorage: boolean
│   ├── debug: boolean
│   └── customCss: boolean
│
├── 'keywords' (array)
├── 'customCss' (string)
├── 'stats' (object)
│   ├── totalPages: number
│   ├── totalTime: number
│   ├── highlightCount: number
│   └── screenshotCount: number
│
└── 'scroll_{url}' (object)
    ├── position: number
    ├── percent: number
    └── timestamp: number
```

### User Interaction Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   User Interaction Flow                          │
└─────────────────────────────────────────────────────────────────┘

1. Text Highlighting:
   User clicks "Highlight Text" in popup
   → Popup executes script to get selection
   → Popup sends HIGHLIGHT_TEXT message to content
   → Content script highlights text with CSS API
   → Stats updated in storage
   → Toast notification shown

2. Page Info:
   User clicks "Page Info" in popup
   → Popup sends GET_PAGE_INFO message to content
   → Content script extracts page data
   → Data sent back to popup
   → Popup opens new tab with info

3. Settings Change:
   User toggles setting in popup/options
   → Component updates local state
   → StorageService saves to chrome.storage
   → SETTINGS_UPDATED message broadcast
   → Other components update accordingly

4. Screenshot:
   User clicks "Screenshot" in popup
   → Popup calls chrome.tabs.captureVisibleTab
   → Image data URL created
   → Download link triggered
   → Stats updated

5. Data Export:
   User clicks "Export" in options
   → Options gathers all storage data
   → JSON file created
   → Download triggered

6. Keyboard Shortcut:
   User presses Alt+H
   → Content script keydown handler
   → Get window selection
   → Highlight selected text
   → CSS Highlight API applied
```

---

## State Management

### Component State

#### Background Service Worker State
```typescript
// Implicit state (listeners remain active)
{
  keepAliveTimeout: number,
  messageListeners: Function[],
  contextMenus: chrome.contextMenus.CreateProperties[]
}
```

#### Content Script State
```typescript
class ContentScript {
  private isInitialized: boolean = false;
  private settings: any = {};
  private domObserver: DOMObserver;
  private cssHighlightsSupported: boolean;
}
```

#### Popup State
```typescript
class PopupManager {
  private currentTab: chrome.tabs.Tab | null = null;
  private settings: any = {};
  private stats: any = {};
}
```

#### Options State
```typescript
class OptionsManager {
  private currentSection: string = 'general';
  private settings: any = {};
  private keywords: string[] = [];
  private readonly checkboxMapping: Map<string, string>;
  private readonly selectMapping: Map<string, string>;
}
```

### Storage State Schema

```typescript
// chrome.storage.local
interface LocalStorage {
  settings: {
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
  };
  keywords: string[];
  customCss: string;
  stats: {
    totalPages: number;
    totalTime: number;
    highlightCount: number;
    screenshotCount: number;
  };
  [key: `scroll_${string}`]: {
    position: number;
    percent: number;
    timestamp: number;
  };
}

// chrome.storage.sync (optional)
// Same schema, synced across devices
```

### State Synchronization

```
State Update Flow:

1. User Action
   ↓
2. Component updates local state
   ↓
3. StorageService.setItem() called
   ↓
4. chrome.storage.local.set() persists
   ↓
5. chrome.storage.onChanged fires
   ↓
6. Other components listen and update
   ↓
7. UI reflects new state
```

---

## Communication Patterns

### 1. Message Passing Pattern

```typescript
// Sender (Popup)
const message: ExtensionMessage = {
  type: MessageType.HIGHLIGHT_TEXT,
  data: { text: 'example' },
  timestamp: Date.now(),
};

const response = await chrome.tabs.sendMessage(tabId, message);

// Receiver (Content Script)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === MessageType.HIGHLIGHT_TEXT) {
    this.highlightText(message.data.text);
    sendResponse({ success: true });
  }
  return true; // Keep channel open for async
});
```

### 2. Storage Pattern

```typescript
// Write
await StorageService.setItem('settings', {
  enabled: true,
  theme: 'dark'
});

// Read
const settings = await StorageService.getWithDefault('settings', {
  enabled: true,
  theme: 'light'
});

// Listen
StorageService.onChanged((changes) => {
  if (changes.settings) {
    console.log('Settings changed:', changes.settings.newValue);
  }
});
```

### 3. Toast Notification Pattern

```typescript
// Create toast element
const toast = document.createElement('div');
toast.className = 'toast success';
toast.textContent = 'Success!';

// Add to container
container.appendChild(toast);

// Handle lifecycle with async/await
await handleToastLifecycle(toast);

// Toast automatically removed after display
```

### 4. DOM Observer Pattern

```typescript
// Initialize observer
const observer = new DOMObserver();

// Start observing with callback
observer.start(() => {
  console.log('Significant DOM changes detected');
  this.reapplyFeatures();
});

// Stop when done
observer.stop();
```

### 5. Event Delegation Pattern

```typescript
// Setup once
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  
  if (target.matches('.action-btn')) {
    this.handleAction(target.dataset.action);
  }
});
```

---

## Storage Architecture

### Storage Service API

```typescript
class StorageService {
  // Single item operations
  static async getItem<T>(key: string, useSync?: boolean): Promise<T | null>
  static async setItem(key: string, value: any, useSync?: boolean): Promise<boolean>
  static async removeItem(key: string, useSync?: boolean): Promise<boolean>
  
  // Batch operations
  static async getItems(keys: string[], useSync?: boolean): Promise<Record<string, any>>
  static async setItems(items: Record<string, any>, useSync?: boolean): Promise<boolean>
  
  // Utilities
  static async getWithDefault<T>(key: string, defaultValue: T, useSync?: boolean): Promise<T>
  static async hasItem(key: string, useSync?: boolean): Promise<boolean>
  static async clear(useSync?: boolean): Promise<boolean>
  static async getAllItems(useSync?: boolean): Promise<Record<string, any>>
  static async getBytesInUse(useSync?: boolean): Promise<number>
  
  // Quota management
  static async getQuotaInfo(): Promise<{
    quota: number;
    bytesInUse: number;
    percentUsed: number;
  }>
  
  // Change listeners
  static onChanged(callback: (changes: Record<string, chrome.storage.StorageChange>) => void, useSync?: boolean): void
}
```

### Storage Strategy

```
Local Storage (chrome.storage.local):
- Unlimited size (subject to disk space)
- Fast access
- Not synced across devices
- Used for: large data, temporary data, scroll positions

Sync Storage (chrome.storage.sync):
- 100 KB quota per extension
- 8 KB per item
- Synced across Chrome-signed-in devices
- Used for: settings, preferences, keywords

Storage Priority:
1. Local storage for most operations (fast, no quota)
2. Sync storage for user preferences (cross-device)
3. IndexedDB for large datasets (not yet implemented)
```

---

## Build & Deployment Architecture

### Webpack Build Process

```
Source Files (src/)
    ↓
TypeScript Compilation (ts-loader)
    ↓
Module Resolution (path aliases)
    ↓
CSS Processing (css-loader + MiniCssExtractPlugin)
    ↓
Asset Copying (CopyWebpackPlugin)
    ↓
HTML Generation (HtmlWebpackPlugin)
    ↓
Bundling & Optimization (Webpack)
    ↓
Output (dist/)
```

### Build Configuration

```javascript
webpack.config.js
├── Entry Points
│   ├── background: src/background/background.ts
│   ├── content: src/content/content.ts
│   ├── popup: src/popup/popup.ts
│   └── options: src/options/options.ts
│
├── Output
│   ├── Path: dist/
│   ├── Filename: [name]/[name].js
│   └── Clean: true
│
├── Module Rules
│   ├── TypeScript (.ts, .tsx)
│   │   └── ts-loader
│   ├── CSS (.css)
│   │   └── MiniCssExtractPlugin.loader + css-loader
│   └── Images (.png, .jpg, .svg)
│       └── asset/resource
│
├── Resolve
│   ├── Extensions: [.tsx, .ts, .js]
│   └── Alias: @/ → src/
│
└── Plugins
    ├── MiniCssExtractPlugin (extract CSS)
    ├── HtmlWebpackPlugin × 2 (popup, options)
    └── CopyWebpackPlugin (assets, manifest)
```

### Build Modes

```
Development Mode:
- Source maps: inline-source-map
- Optimization: none
- Watch mode: enabled
- Size: ~200 KB (unminified)

Production Mode:
- Source maps: none
- Optimization: minimize
- Tree shaking: enabled
- Size: ~136 KB (minified)
```

### Distribution Package Structure

```
extension.zip
├── background/
│   └── background.js
├── content/
│   └── content.js
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── options/
│   ├── options.html
│   ├── options.css
│   └── options.js
├── assets/
│   └── icons/
│       ├── icon-16.png
│       ├── icon-32.png
│       ├── icon-48.png
│       └── icon-128.png
└── manifest.json
```

---

## Migration Architecture Mapping

### From: shuttle-insights (Source)

```
Vanilla JS + esbuild
    │
    ├─► ES6 Modules
    ├─► Pure CSS
    ├─► Jest testing
    └─► No type checking
```

### To: shuttle-vision (Target)

```
TypeScript + Webpack
    │
    ├─► TypeScript (strict)
    ├─► ES6 Modules
    ├─► CSS (extracted)
    ├─► Jest + ts-jest
    └─► Full type safety
```

### Component Mapping Strategy

```
Source Component          →  Target Component
─────────────────────────────────────────────────────────
content.js                →  content.ts (extend)
background.js             →  background.ts (extend)
constants.js              →  config/constants.ts (merge)

panel-core.js             →  NEW: popup/popup.ts (adapt)
panel-workflow.js         →  NEW: popup/popup.ts (integrate)
panel-ui.js               →  NEW: popup/popup.ts (integrate)

glossary.js               →  NEW: utils/glossary.ts
glossary-loader.js        →  NEW: utils/glossary-loader.ts
glossary-buttons.js       →  NEW: components/glossary-buttons.ts
glossary-dimensions.js    →  NEW: components/glossary-dimensions.ts

csv.js                    →  NEW: utils/csv.ts
csv-import.js             →  NEW: features/csv-import.ts
csv-export.js             →  NEW: features/csv-export.ts
csv-utils.js              →  NEW: utils/csv-utils.ts

drag.js                   →  NEW: features/drag.ts
resize.js                 →  NEW: features/resize.ts

poseDrawing.js            →  NEW: features/pose-drawing.ts
pose-utils.js             →  NEW: utils/pose-utils.ts
overlay-utils.js          →  NEW: utils/overlay-utils.ts

video-utils.js            →  NEW: utils/video-utils.ts
ui-utils.js               →  utils/toast.ts (partial)
theme-manager.js          →  NEW: utils/theme-manager.ts

data-validation.js        →  NEW: utils/data-validation.ts
```

### Architecture Evolution

```
Phase 1: Foundation
├── Add missing utilities
├── Create type definitions
└── Setup data structures

Phase 2: Core Features
├── Implement shot workflow
├── Add CSV handling
└── Create glossary system

Phase 3: UI Components
├── Draggable/resizable panel
├── Shot list component
└── Glossary controls

Phase 4: Advanced Features
├── TensorFlow.js integration
├── Pose detection
└── Canvas overlay

Phase 5: Integration
├── YouTube integration
├── Video controls
└── End-to-end testing
```

### Migration Challenges

```
Challenge                     Solution
────────────────────────────────────────────────────
Large bundle size             → Lazy loading, code splitting
(TensorFlow.js ~1.5MB)        → Dynamic imports

Canvas coordination           → Existing DOM observer pattern
                              → Extend with canvas utils

State management              → Use existing StorageService
(shots, workflow)             → Add workflow state class

Theme system                  → Create theme-manager utility
                              → CSS custom properties

CSV handling                  → Create csv-utils module
                              → Use File API

Video interaction             → Create video-utils module
(YouTube specific)            → Query selectors for YouTube

Panel drag/resize             → Create drag/resize features
                              → Use mouse event handlers

Glossary loading              → Create glossary-loader
                              → Fetch JSON data
```

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-10  
**Author:** GitHub Copilot  
**Related Documents:**
- Target codebase audit: `docs/migration/target/CODEBASE_AUDIT.md`
- Source architecture: `docs/migration/source/ARCHITECTURE_OVERVIEW.md`
- Migration plan: To be created
