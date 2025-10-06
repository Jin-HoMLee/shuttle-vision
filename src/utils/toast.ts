/**
 * Toast notification utilities for Chrome Extension Template
 * This module handles toast notification lifecycle and animations
 */

import { TOAST_CONFIG } from '@/config/constants';

/**
 * Creates a Promise-based delay that can be used with async/await
 * @param ms - The delay duration in milliseconds (negative values are clamped to 0)
 * @returns A Promise that resolves after the specified delay
 */
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, Math.max(0, ms)));
};

/**
 * Handles the complete lifecycle of a toast notification with async/await
 * @param toast - The toast element to animate
 * 
 * @example
 * ```typescript
 * const toast = document.createElement('div');
 * toast.className = 'toast success';
 * toast.textContent = 'Success!';
 * container.appendChild(toast);
 * 
 * await handleToastLifecycle(toast);
 * ```
 */
export const handleToastLifecycle = async (toast: HTMLElement): Promise<void> => {
  // Trigger animation after brief delay
  await delay(TOAST_CONFIG.SHOW_DELAY);
  toast.classList.add('show');

  // Show toast for specified duration
  await delay(TOAST_CONFIG.SHOW_DURATION);
  toast.classList.remove('show');

  // Wait for transition to complete before removing
  await delay(TOAST_CONFIG.TRANSITION_DURATION);
  
  const container = document.getElementById('toastContainer');
  if (container && container.contains(toast)) {
    container.removeChild(toast);
  }
};