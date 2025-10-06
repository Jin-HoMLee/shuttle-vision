// Popup script for Chrome Extension Template
// This script handles the popup interface interactions

import { ExtensionMessage, MessageType } from '@/types/messages';
import { StorageService } from '@/utils/storage';
import { CONFIG, TIME_CONFIG } from '@/config/constants';
import { handleToastLifecycle } from '@/utils/toast';
import './popup.css';

class PopupManager {
  private currentTab: chrome.tabs.Tab | null = null;
  private settings: any = {};
  private stats: any = {};

  constructor() {
    this.init();
  }

  private async init() {
    try {
      await this.loadCurrentTab();
      await this.loadSettings();
      await this.loadStats();
      this.setupEventListeners();
      this.updateUI();
      console.log('Popup initialized successfully');
    } catch (error) {
      console.error('Failed to initialize popup:', error);
      this.showToast('Failed to initialize extension', 'error');
    }
  }

  private async loadCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    this.currentTab = tab;
  }

  private async loadSettings() {
    this.settings = await StorageService.getWithDefault('settings', {
      enabled: true,
      notifications: true,
      trackScroll: false,
    });
  }

  private async loadStats() {
    this.stats = await StorageService.getWithDefault('stats', {
      totalPages: 0,
      totalTime: 0,
      highlightCount: 0,
      screenshotCount: 0,
    });
  }

  private setupEventListeners() {
    // Action buttons
    document.getElementById('highlightBtn')?.addEventListener('click', () => {
      this.handleHighlightText();
    });

    document.getElementById('pageInfoBtn')?.addEventListener('click', () => {
      this.handleGetPageInfo();
    });

    document.getElementById('screenshotBtn')?.addEventListener('click', () => {
      this.handleTakeScreenshot();
    });

    // Settings toggles
    document.getElementById('enabledToggle')?.addEventListener('change', e => {
      this.handleSettingChange('enabled', (e.target as HTMLInputElement).checked);
    });

    document.getElementById('notificationsToggle')?.addEventListener('change', e => {
      this.handleSettingChange('notifications', (e.target as HTMLInputElement).checked);
    });

    document.getElementById('trackScrollToggle')?.addEventListener('change', e => {
      this.handleSettingChange('trackScroll', (e.target as HTMLInputElement).checked);
    });

    // Footer buttons
    document.getElementById('optionsBtn')?.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('options/options.html') });
      window.close();
    });

    document.getElementById('helpBtn')?.addEventListener('click', () => {
      chrome.tabs.create({ url: CONFIG.HELP_URL });
      window.close();
    });
  }

  private updateUI() {
    this.updatePageInfo();
    this.updateSettings();
    this.updateStats();
    this.updateStatus();
  }

  private updatePageInfo() {
    if (this.currentTab) {
      const titleElement = document.getElementById('pageTitle');
      const urlElement = document.getElementById('pageUrl');
      const statusElement = document.getElementById('pageStatus');

      if (titleElement) {
        titleElement.textContent = this.currentTab.title || 'Unknown';
      }

      if (urlElement) {
        const url = this.currentTab.url || 'Unknown';
        urlElement.textContent = url.length > 40 ? url.substring(0, 40) + '...' : url;
        urlElement.title = url;
      }

      if (statusElement) {
        statusElement.textContent = 'Ready';
        statusElement.className = 'info-value status-success';
      }
    }
  }

  private updateSettings() {
    const enabledToggle = document.getElementById('enabledToggle') as HTMLInputElement;
    const notificationsToggle = document.getElementById('notificationsToggle') as HTMLInputElement;
    const trackScrollToggle = document.getElementById('trackScrollToggle') as HTMLInputElement;

    if (enabledToggle) enabledToggle.checked = this.settings.enabled;
    if (notificationsToggle) notificationsToggle.checked = this.settings.notifications;
    if (trackScrollToggle) trackScrollToggle.checked = this.settings.trackScroll;
  }

  private updateStats() {
    const totalPagesElement = document.getElementById('totalPages');
    const totalTimeElement = document.getElementById('totalTime');
    const highlightCountElement = document.getElementById('highlightCount');
    const screenshotCountElement = document.getElementById('screenshotCount');

    if (totalPagesElement) {
      totalPagesElement.textContent = this.stats.totalPages.toString();
    }

    if (totalTimeElement) {
      const minutes = Math.floor(this.stats.totalTime / TIME_CONFIG.MILLISECONDS_PER_MINUTE);
      totalTimeElement.textContent = `${minutes}m`;
    }

    if (highlightCountElement) {
      highlightCountElement.textContent = this.stats.highlightCount.toString();
    }

    if (screenshotCountElement) {
      screenshotCountElement.textContent = this.stats.screenshotCount.toString();
    }
  }

  private updateStatus() {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = statusIndicator?.querySelector('.status-text');
    const statusDot = statusIndicator?.querySelector('.status-dot') as HTMLElement;

    if (statusText && statusDot) {
      if (this.settings.enabled) {
        statusText.textContent = 'Active';
        statusDot.style.background = '#4CAF50';
      } else {
        statusText.textContent = 'Disabled';
        statusDot.style.background = '#f44336';
      }
    }
  }

  private async handleHighlightText() {
    if (!this.currentTab?.id) {
      this.showToast('No active tab found', 'error');
      return;
    }

    this.showLoading(true);

    try {
      // Get selected text from the page
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: this.currentTab.id },
        func: () => window.getSelection()?.toString() || '',
      });

      const selectedText = result?.result;

      if (!selectedText) {
        this.showToast('Please select text on the page first', 'warning');
        this.showLoading(false);
        return;
      }

      // Send message to content script to highlight the text
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        type: MessageType.HIGHLIGHT_TEXT,
        data: { text: selectedText },
      });

      if (response.success) {
        // Update stats
        this.stats.highlightCount++;
        await StorageService.setItem('stats', this.stats);
        this.updateStats();
        this.showToast('Text highlighted successfully!', 'success');
      } else {
        throw new Error(response.error || 'Failed to highlight text');
      }
    } catch (error) {
      console.error('Error highlighting text:', error);
      this.showToast('Failed to highlight text', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  private async handleGetPageInfo() {
    if (!this.currentTab?.id) {
      this.showToast('No active tab found', 'error');
      return;
    }

    this.showLoading(true);

    try {
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        type: MessageType.GET_PAGE_INFO,
      });

      if (response.success) {
        const info = response.data;
        const infoText = `
Title: ${info.title}
URL: ${info.url}
Words: ${info.wordCount}
Images: ${info.images}
Links: ${info.links}
Forms: ${info.forms}
Scripts: ${info.scripts}
Last Modified: ${info.lastModified}
        `.trim();

        // Create a modal or new tab with the information
        const blob = new Blob([infoText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        chrome.tabs.create({ url });
        this.showToast('Page info opened in new tab', 'success');
      } else {
        throw new Error(response.error || 'Failed to get page info');
      }
    } catch (error) {
      console.error('Error getting page info:', error);
      this.showToast('Failed to get page info', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  private async handleTakeScreenshot() {
    if (!this.currentTab?.id) {
      this.showToast('No active tab found', 'error');
      return;
    }

    this.showLoading(true);

    try {
      const dataUrl = await chrome.tabs.captureVisibleTab({
        format: 'png',
        quality: 90,
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `screenshot-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      // Update stats
      this.stats.screenshotCount++;
      await StorageService.setItem('stats', this.stats);
      this.updateStats();

      this.showToast('Screenshot saved!', 'success');
    } catch (error) {
      console.error('Error taking screenshot:', error);
      this.showToast('Failed to take screenshot', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  private async handleSettingChange(setting: string, value: boolean) {
    try {
      this.settings[setting] = value;
      await StorageService.setItem('settings', this.settings);

      // Notify background script and content scripts of setting change
      if (this.currentTab?.id) {
        const settingsMessage = {
          type: MessageType.SETTINGS_UPDATED,
          data: this.settings,
        };

        /**
         * Content script might not be loaded on special pages (e.g., chrome://, extension pages)
         * or during page navigation; this is expected and can be safely ignored.
         */
        chrome.tabs.sendMessage(this.currentTab.id, settingsMessage).catch((err) => {
          // Expected error: content script not loaded or page navigation. See comment above.
          console.debug('chrome.tabs.sendMessage failed (likely expected):', err);
        });
      }

      const backgroundMessage = {
        type: MessageType.SETTINGS_UPDATED,
        data: this.settings,
      };

      chrome.runtime.sendMessage(backgroundMessage).catch((err) => {
        // Background script might not be ready - this is expected during extension lifecycle events.
        console.debug('chrome.runtime.sendMessage failed (likely expected):', err);
      });

      this.updateStatus();
      this.showToast(`${setting} ${value ? 'enabled' : 'disabled'}`, 'success');
    } catch (error) {
      console.error('Error updating setting:', error);
      this.showToast('Failed to update setting', 'error');
    }
  }

  private showLoading(show: boolean) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.classList.toggle('hidden', !show);
    }
  }

  private async showToast(message: string, type: 'success' | 'error' | 'warning' = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    await handleToastLifecycle(toast);
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});

export default PopupManager;
