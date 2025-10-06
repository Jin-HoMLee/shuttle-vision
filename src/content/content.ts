// Content script for Chrome Extension Template
// This script runs in the context of web pages and can interact with the DOM

import { ExtensionMessage, MessageType } from '@/types/messages';
import { StorageService } from '@/utils/storage';
import { DOMObserver } from '@/utils/dom-observer';

class ContentScript {
  private isInitialized = false;
  private settings: any = {};
  private domObserver = new DOMObserver();
  private cssHighlightsSupported: boolean;

  constructor() {
    this.cssHighlightsSupported = this.checkCSSHighlightsSupport();
    this.init();
  }

  private async init() {
    if (this.isInitialized) return;

    console.log('Content script initializing on:', window.location.href);

    try {
      // Load settings
      this.settings = await StorageService.getWithDefault('settings', {});

      // Only proceed if extension is enabled
      if (!this.settings.enabled) {
        console.log('Extension is disabled, content script will not run');
        return;
      }

      this.setupMessageListener();
      this.injectStyles();
      this.setupFeatures();
      this.startDOMObserver();

      this.isInitialized = true;
      console.log('Content script initialized successfully');
    } catch (error) {
      console.error('Failed to initialize content script:', error);
    }
  }

  private setupMessageListener() {
    // Listen for messages from popup or background script
    chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
      console.log('Content script received message:', message);

      switch (message.type) {
        case MessageType.HIGHLIGHT_TEXT:
          this.highlightText(message.data.text);
          sendResponse({ success: true });
          break;

        case MessageType.GET_PAGE_INFO:
          this.getPageInfo(sendResponse);
          return true; // Keep message channel open

        case MessageType.SCROLL_TO_ELEMENT:
          this.scrollToElement(message.data.selector);
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    });
  }

  private injectStyles() {
    // Inject CSS styles for extension features
    const style = document.createElement('style');
    style.textContent = `
      /* Modern CSS Custom Highlight API styling */
      ::highlight(extension-highlight) {
        background-color: #ffeb3b;
        color: inherit;
        text-decoration: none;
      }
      
      .extension-tooltip {
        position: absolute !important;
        background: #333 !important;
        color: white !important;
        padding: 8px 12px !important;
        border-radius: 4px !important;
        font-size: 14px !important;
        z-index: 10000 !important;
        pointer-events: none !important;
        opacity: 0 !important;
        transition: opacity 0.3s ease !important;
      }
      
      .extension-tooltip.show {
        opacity: 1 !important;
      }
      
      .extension-badge {
        position: fixed !important;
        top: 20px !important;
        right: 20px !important;
        background: #4CAF50 !important;
        color: white !important;
        padding: 8px 16px !important;
        border-radius: 20px !important;
        font-family: Arial, sans-serif !important;
        font-size: 12px !important;
        z-index: 10000 !important;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3) !important;
      }
    `;
    document.head.appendChild(style);
  }

  private setupFeatures() {
    // Example feature: Show page statistics
    if (this.settings.showStats) {
      this.showPageStats();
    }

    // Example feature: Add keyboard shortcuts
    this.setupKeyboardShortcuts();

    // Example feature: Track scroll position
    if (this.settings.trackScroll) {
      this.trackScrollPosition();
    }
  }

  private highlightText(text: string) {
    // Trim whitespace and normalize the text
    const normalizedText = text.trim();
    
    // Check if the text is already highlighted (toggle behavior)
    if (this.hasExistingHighlight()) {
      this.clearHighlight();
      return;
    }

    // Create ranges for all occurrences of the text
    const ranges: Range[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    
    let node;
    while ((node = walker.nextNode())) {
      const content = node.textContent || '';
      
      // Try exact match first
      let index = content.indexOf(normalizedText);
      if (index !== -1) {
        const range = new Range();
        range.setStart(node, index);
        range.setEnd(node, index + normalizedText.length);
        ranges.push(range);
      } else {
        // Try case-insensitive match
        const lowerContent = content.toLowerCase();
        const lowerText = normalizedText.toLowerCase();
        index = lowerContent.indexOf(lowerText);
        if (index !== -1) {
          const range = new Range();
          range.setStart(node, index);
          range.setEnd(node, index + normalizedText.length);
          ranges.push(range);
        }
      }
    }
    
    // Apply the highlight using CSS Highlights API (Chrome 105+, Firefox 113+)
    // Note: This feature requires modern browser support. In unsupported browsers,
    // highlighting will gracefully fail without affecting other functionality.
    if (ranges.length > 0 && this.isCSSHighlightsSupported()) {
      const highlight = new Highlight(...ranges);
      CSS.highlights.set('extension-highlight', highlight);
    }
  }

  private hasExistingHighlight(): boolean {
    return this.isCSSHighlightsSupported() && CSS.highlights.has('extension-highlight');
  }

  private clearHighlight(): void {
    if (this.isCSSHighlightsSupported()) {
      CSS.highlights.delete('extension-highlight');
    }
  }

  private checkCSSHighlightsSupport(): boolean {
    return (
      typeof CSS !== 'undefined' && 
      'highlights' in CSS && 
      typeof CSS.highlights?.set === 'function'
    );
  }

  private isCSSHighlightsSupported(): boolean {
    return this.cssHighlightsSupported;
  }

  private getPageInfo(sendResponse: (_response: any) => void) {
    const pageInfo = {
      title: document.title,
      url: window.location.href,
      wordCount: document.body.innerText.split(/\s+/).length,
      images: document.images.length,
      links: document.links.length,
      forms: document.forms.length,
      scripts: document.scripts.length,
      lastModified: document.lastModified,
    };

    sendResponse({ success: true, data: pageInfo });
  }

  private scrollToElement(selector: string) {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      // Temporarily highlight the element
      element.classList.add('extension-highlight');
      setTimeout(() => {
        element.classList.remove('extension-highlight');
      }, 2000);
    }
  }

  private showPageStats() {
    // Create a small badge showing page statistics
    const badge = document.createElement('div');
    badge.className = 'extension-badge';
    badge.textContent = `Words: ${document.body.innerText.split(/\s+/).length}`;
    document.body.appendChild(badge);

    // Remove badge after 5 seconds
    setTimeout(() => {
      badge.remove();
    }, 5000);
  }

  private setupKeyboardShortcuts() {
    document.addEventListener('keydown', event => {
      // Alt + E: Toggle extension features
      if (event.altKey && event.key === 'e') {
        event.preventDefault();
        this.toggleExtensionUI();
      }

      // Alt + H: Highlight selected text
      if (event.altKey && event.key === 'h') {
        event.preventDefault();
        const selection = window.getSelection();
        if (selection && selection.toString()) {
          this.highlightText(selection.toString());
        }
      }
    });
  }

  private trackScrollPosition() {
    let scrollTimeout: ReturnType<typeof setTimeout>;

    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollPercent = Math.round(
          (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );

        // Save scroll position
        StorageService.setItem(`scroll_${window.location.href}`, {
          position: window.scrollY,
          percent: scrollPercent,
          timestamp: Date.now(),
        });
      }, 500);
    });
  }

  private toggleExtensionUI() {
    // Example of toggling extension UI elements
    const highlights = document.querySelectorAll('.extension-highlight');
    const badges = document.querySelectorAll('.extension-badge');

    const isVisible = highlights.length > 0 || badges.length > 0;

    if (isVisible) {
      // Hide extension elements
      highlights.forEach(el => el.classList.remove('extension-highlight'));
      badges.forEach(el => el.remove());
    } else {
      // Show page stats badge
      this.showPageStats();
    }
  }

  private startDOMObserver() {
    // Start observing DOM changes for dynamic content
    this.domObserver.start(() => {
      // Significant DOM changes detected, re-applying features
      // Could re-initialize features here if needed
    });
  }
}

// Initialize content script when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ContentScript());
} else {
  new ContentScript();
}

export default ContentScript;
