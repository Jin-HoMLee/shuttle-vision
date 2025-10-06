/**
 * DOM mutation observer utility for Chrome Extension Template
 * 
 * This module provides efficient DOM change detection with debouncing to help
 * Chrome extensions stay functional on modern, dynamic websites.
 * 
 * ## Problem It Solves:
 * Modern web pages (React, Vue, Angular, SPAs) dynamically load content after
 * the initial page load. Chrome extensions that only run on page load miss
 * this new content, causing features like text highlighting, UI injection,
 * or content analysis to break.
 * 
 * ## Solution:
 * DOMObserver watches for significant DOM changes and notifies the extension
 * when it should re-apply its features to newly added content.
 * 
 * ## Example Usage:
 * ```typescript
 * // In your content script
 * const observer = new DOMObserver();
 * 
 * observer.start(() => {
 *   // Re-apply extension features when significant content is added
 *   this.reapplyHighlighting();
 *   this.updatePageStats();
 *   this.reinjectUI();
 * });
 * 
 * // Clean up when done
 * observer.stop();
 * ```
 * 
 * ## Performance Features:
 * - **Debouncing**: Batches rapid changes to avoid excessive processing
 * - **Selective Filtering**: Only triggers on "significant" content additions
 * - **Smart Detection**: Focuses on container elements with substantial content
 * 
 * ## Configuration:
 * Behavior can be tuned via DOM_CONFIG constants:
 * - `SIGNIFICANT_CHANGE_THRESHOLD`: Minimum child count to consider significant
 * - `MUTATION_DEBOUNCE_DELAY`: Debounce delay in milliseconds
 */

import { DOM_CONFIG } from '@/config/constants';

/**
 * Efficient DOM mutation observer with debouncing and selective filtering
 */
export class DOMObserver {
  private mutationTimeout: ReturnType<typeof setTimeout> | null = null;
  private observer: MutationObserver | null = null;

  /**
   * Start observing DOM changes with debounced callback
   * 
   * Begins monitoring the specified element (or document.body by default) for
   * structural changes. When significant changes are detected, the callback
   * is invoked after a debounce delay to batch rapid changes.
   * 
   * @param callback - Function to call when significant changes are detected.
   *                   Use this to re-apply extension features to new content.
   * @param target - Element to observe (default: document.body).
   *                 Usually you want to observe the entire page.
   * 
   * @example
   * ```typescript
   * observer.start(() => {
   *   console.log('New content detected - reapplying features');
   *   this.highlightKeywords();
   *   this.injectTooltips();
   * });
   * ```
   */
  start(callback: () => void, target: Element = document.body): void {
    this.observer = new MutationObserver(mutations => {
      this.handleMutations(mutations, callback);
    });

    this.observer.observe(target, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Stop observing DOM changes and clean up resources
   * 
   * Disconnects the mutation observer and clears any pending debounce timers.
   * Always call this when the content script is unloaded or the observer
   * is no longer needed to prevent memory leaks.
   * 
   * @example
   * ```typescript
   * // Clean up when extension is disabled or page is unloaded
   * window.addEventListener('beforeunload', () => {
   *   observer.stop();
   * });
   * ```
   */
  stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.mutationTimeout) {
      clearTimeout(this.mutationTimeout);
      this.mutationTimeout = null;
    }
  }

  /**
   * Handle mutations with debouncing and selective filtering
   * 
   * This method implements the core intelligence of the observer:
   * 1. Debounces rapid mutations to avoid excessive callback invocations
   * 2. Filters mutations to only significant content additions
   * 3. Calls the user callback only when meaningful changes occur
   * 
   * @param mutations - Array of mutation records from MutationObserver
   * @param callback - Function to call when significant changes are detected
   * @private
   */
  private handleMutations(mutations: MutationRecord[], callback: () => void): void {
    // Debounce mutation handling to avoid excessive processing
    if (this.mutationTimeout) {
      clearTimeout(this.mutationTimeout);
    }

    this.mutationTimeout = setTimeout(() => {
      if (this.hasSignificantChanges(mutations)) {
        callback();
      }
    }, DOM_CONFIG.MUTATION_DEBOUNCE_DELAY);
  }

  /**
   * Check if mutations contain significant changes
   * 
   * Analyzes mutation records to determine if they represent meaningful
   * content additions that warrant re-applying extension features.
   * 
   * Filtering criteria:
   * - Only childList mutations (element additions/removals)
   * - Only mutations that added new nodes
   * - Only element nodes (not text nodes, comments, etc.)
   * - Only significant HTML container tags
   * - Only elements with substantial child content
   * 
   * @param mutations - Array of mutation records to analyze
   * @returns True if significant changes are detected
   * @private
   */
  private hasSignificantChanges(mutations: MutationRecord[]): boolean {
    return mutations.some(mutation => {
      // Only check childList mutations with added nodes
      if (mutation.type !== 'childList' || mutation.addedNodes.length === 0) {
        return false;
      }

      // Check if any added nodes are significant elements
      return Array.from(mutation.addedNodes).some(node => {
        // Only consider element nodes (not text nodes, comments, etc.)
        if (node.nodeType !== Node.ELEMENT_NODE) {
          return false;
        }

        const element = node as Element;
        
        // Check for significant elements by tag name or child count
        const isSignificantTag = this.isSignificantTag(element.tagName.toLowerCase());
        const hasSignificantChildCount = element.children.length > DOM_CONFIG.SIGNIFICANT_CHANGE_THRESHOLD;
        
        return isSignificantTag && hasSignificantChildCount;
      });
    });
  }

  /**
   * Check if element tag is considered significant for content detection
   * 
   * Determines whether an HTML tag represents a meaningful content container
   * that's worth monitoring for extension features. Focuses on semantic
   * HTML elements that typically contain substantial user content.
   * 
   * Significant tags include major layout and content containers:
   * - Structural: div, section, article, main, aside
   * - Navigation: nav, header, footer
   * 
   * Excludes minor elements like spans, small text nodes, buttons, etc.
   * that don't typically represent major content additions.
   * 
   * @param tagName - HTML tag name in lowercase
   * @returns True if tag represents significant content container
   * @private
   */
  private isSignificantTag(tagName: string): boolean {
    return (DOM_CONFIG.SIGNIFICANT_TAGS as readonly string[]).includes(tagName);
  }
}