// Options page script for Chrome Extension Template
// This script handles the options/settings page functionality

import { StorageService } from '@/utils/storage';
import { CONFIG } from '@/config/constants';
import { handleToastLifecycle } from '@/utils/toast';
import './options.css';
import { MessageType } from '@/types/messages';

class OptionsManager {
  private currentSection = 'general';
  private settings: any = {};
  private keywords: string[] = [];
  
  // Centralized mapping of checkbox IDs to setting keys
  private readonly checkboxMapping = new Map<string, string>([
    ['enabledToggle', 'enabled'],
    ['notificationsToggle', 'notifications'],
    ['trackScrollToggle', 'trackScroll'],
    ['autoHighlightToggle', 'autoHighlight'],
    ['statsToggle', 'collectStats'],
    ['localStorageToggle', 'localStorage'],
    ['debugToggle', 'debug'],
    ['customCssToggle', 'customCss'],
  ]);

  // Centralized mapping of select element IDs to setting keys
  private readonly selectMapping = new Map<string, string>([
    ['themeSelect', 'theme'],
    ['fontSizeSelect', 'fontSize'],
  ]);

  constructor() {
    this.init();
  }

  private async init() {
    try {
      await this.loadSettings();
      this.setupNavigation();
      this.setupEventListeners();
      this.updateUI();
      console.log('Options page initialized successfully');
    } catch (error) {
      console.error('Failed to initialize options page:', error);
      this.showToast('Failed to load settings', 'error');
    }
  }

  private async loadSettings() {
    // Load all settings from storage
    this.settings = await StorageService.getWithDefault('settings', {
      enabled: true,
      notifications: true,
      trackScroll: false,
      autoHighlight: false,
      theme: 'light',
      highlightColor: '#ffeb3b',
      fontSize: 'medium',
      collectStats: true,
      localStorage: false,
      debug: false,
      customCss: false,
    });

    this.keywords = await StorageService.getWithDefault('keywords', []);
  }

  private setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
      button.addEventListener('click', e => {
        const target = e.currentTarget as HTMLButtonElement;
        const section = target.dataset.section;
        if (section) {
          this.showSection(section);
        }
      });
    });
  }

  private setupEventListeners() {
    // Setup all checkboxes using the centralized mapping
    this.checkboxMapping.forEach((settingKey, elementId) => {
      this.setupToggle(elementId, settingKey);
    });

    // Setup all select elements using the centralized mapping
    this.selectMapping.forEach((settingKey, elementId) => {
      this.setupSelect(elementId, settingKey);
    });

    // Color picker (handled separately since it's not in the select mapping)
    this.setupColorPicker('highlightColorPicker', 'highlightColor');

    // Keyword management
    this.setupKeywordManager();

    // Data management
    this.setupDataManagement();

    // CSS editor
    this.setupCssEditor();

    // Footer buttons
    document.getElementById('resetAllBtn')?.addEventListener('click', () => {
      this.showConfirmModal(
        'Reset All Settings',
        'Are you sure you want to reset all settings to their default values? This action cannot be undone.',
        () => this.resetAllSettings()
      );
    });

    document.getElementById('saveAllBtn')?.addEventListener('click', () => {
      this.saveAllSettings();
    });
  }

  private setupToggle(elementId: string, settingKey: string) {
    const toggle = document.getElementById(elementId) as HTMLInputElement;
    if (toggle) {
      toggle.checked = this.settings[settingKey];
      toggle.addEventListener('change', () => {
        this.settings[settingKey] = toggle.checked;
        this.saveSettings();
      });
    }
  }

  private setupSelect(elementId: string, settingKey: string) {
    const select = document.getElementById(elementId) as HTMLSelectElement;
    if (select) {
      select.value = this.settings[settingKey];
      select.addEventListener('change', () => {
        this.settings[settingKey] = select.value;
        this.saveSettings();
      });
    }
  }

  private setupColorPicker(elementId: string, settingKey: string) {
    const colorPicker = document.getElementById(elementId) as HTMLInputElement;
    if (colorPicker) {
      colorPicker.value = this.settings[settingKey];
      colorPicker.addEventListener('change', () => {
        this.settings[settingKey] = colorPicker.value;
        this.saveSettings();
      });
    }
  }

  private setupKeywordManager() {
    const keywordInput = document.getElementById('keywordInput') as HTMLInputElement;
    const addKeywordBtn = document.getElementById('addKeywordBtn');

    if (keywordInput && addKeywordBtn) {
      addKeywordBtn.addEventListener('click', () => {
        this.addKeyword(keywordInput.value.trim());
        keywordInput.value = '';
      });

      keywordInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
          this.addKeyword(keywordInput.value.trim());
          keywordInput.value = '';
        }
      });
    }

    this.updateKeywordList();
  }

  private setupDataManagement() {
    document.getElementById('exportDataBtn')?.addEventListener('click', () => {
      this.exportData();
    });

    document.getElementById('importDataBtn')?.addEventListener('click', () => {
      const fileInput = document.getElementById('importFileInput') as HTMLInputElement;
      fileInput?.click();
    });

    const fileInput = document.getElementById('importFileInput') as HTMLInputElement;
    fileInput?.addEventListener('change', e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        this.importData(file);
      }
    });

    document.getElementById('clearDataBtn')?.addEventListener('click', () => {
      this.showConfirmModal(
        'Clear All Data',
        'This will permanently delete all extension data including settings, keywords, and statistics. This action cannot be undone.',
        () => this.clearAllData()
      );
    });
  }

  private setupCssEditor() {
    const cssEditor = document.getElementById('customCssEditor') as HTMLTextAreaElement;
    const saveCssBtn = document.getElementById('saveCssBtn');
    const resetCssBtn = document.getElementById('resetCssBtn');

    if (cssEditor) {
      // Load custom CSS
      StorageService.getWithDefault('customCss', '').then(css => {
        cssEditor.value = css;
      });

      saveCssBtn?.addEventListener('click', () => {
        StorageService.setItem('customCss', cssEditor.value);
        this.showToast('Custom CSS saved successfully', 'success');
      });

      resetCssBtn?.addEventListener('click', () => {
        cssEditor.value = '';
        StorageService.setItem('customCss', '');
        this.showToast('Custom CSS reset', 'success');
      });
    }
  }

  private showSection(sectionId: string) {
    // Hide all sections
    document.querySelectorAll('.options-section').forEach(section => {
      section.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionId)?.classList.add('active');

    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionId}"]`)?.classList.add('active');

    this.currentSection = sectionId;
  }

  private updateUI() {
    this.updateBuildInfo();
    this.createAboutLinks();
  }

  private async updateBuildInfo() {
    const buildInfo = document.getElementById('buildInfo');
    const lastUpdated = document.getElementById('lastUpdated');

    if (buildInfo) {
      buildInfo.textContent = CONFIG.VERSION;
    }

    if (lastUpdated) {
      lastUpdated.textContent = new Date().toLocaleDateString();
    }
  }

  private createAboutLinks() {
    const linkGrid = document.querySelector('.link-grid');
    if (!linkGrid) return;

    // Clear any existing content
    linkGrid.innerHTML = '';

    const links = [
      { icon: '📖', text: 'Documentation', url: CONFIG.DOCUMENTATION_URL },
      { icon: '🐛', text: 'Report Issues', url: CONFIG.SUPPORT_URL },
      { icon: '🚀', text: 'Releases', url: CONFIG.RELEASES_URL },
      { icon: '👨‍💻', text: 'Developer', url: CONFIG.DEVELOPER_URL },
    ];

    links.forEach(linkData => {
      const link = document.createElement('a');
      link.href = linkData.url;
      link.target = '_blank';
      link.className = 'link-btn';
      link.innerHTML = `
        <span class="link-icon">${linkData.icon}</span>
        ${linkData.text}
      `;
      linkGrid.appendChild(link);
    });
  }

  private addKeyword(keyword: string) {
    if (!keyword || this.keywords.includes(keyword)) {
      return;
    }

    this.keywords.push(keyword);
    this.saveKeywords();
    this.updateKeywordList();
  }

  private removeKeyword(keyword: string) {
    const index = this.keywords.indexOf(keyword);
    if (index > -1) {
      this.keywords.splice(index, 1);
      this.saveKeywords();
      this.updateKeywordList();
    }
  }

  private updateKeywordList() {
    const keywordList = document.getElementById('keywordList');
    if (!keywordList) return;

    keywordList.innerHTML = '';

    this.keywords.forEach(keyword => {
      const tag = document.createElement('div');
      tag.className = 'keyword-tag';
      tag.innerHTML = `
        <span>${keyword}</span>
        <button class="keyword-remove" data-keyword="${keyword}">×</button>
      `;

      const removeBtn = tag.querySelector('.keyword-remove');
      removeBtn?.addEventListener('click', () => {
        this.removeKeyword(keyword);
      });

      keywordList.appendChild(tag);
    });
  }

  private async saveSettings() {
    try {
      await StorageService.setItem('settings', this.settings);

      // Notify other parts of the extension about settings changes
      chrome.runtime
        .sendMessage({
          type: MessageType.SETTINGS_UPDATED,
          data: this.settings,
        })
        .catch(() => {
          // Background script might not be ready, e.g. during extension startup, update, or reload events
          // Silently ignore, as in popup.ts
        });
    } catch (error) {
      console.error('Failed to save settings:', error);
      this.showToast('Failed to save settings', 'error');
    }
  }

  private async saveKeywords() {
    try {
      await StorageService.setItem('keywords', this.keywords);
    } catch (error) {
      console.error('Failed to save keywords:', error);
      this.showToast('Failed to save keywords', 'error');
    }
  }

  private async saveAllSettings() {
    try {
      await this.saveSettings();
      await this.saveKeywords();
      this.showToast('All settings saved successfully', 'success');
    } catch (error) {
      console.error('Failed to save all settings:', error);
      this.showToast('Failed to save settings', 'error');
    }
  }

  private async resetAllSettings() {
    try {
      // Reset to default settings
      this.settings = {
        enabled: true,
        notifications: true,
        trackScroll: false,
        autoHighlight: false,
        theme: 'light',
        highlightColor: '#ffeb3b',
        fontSize: 'medium',
        collectStats: true,
        localStorage: false,
        debug: false,
        customCss: false,
      };

      this.keywords = [];

      await this.saveSettings();
      await this.saveKeywords();
      await StorageService.setItem('customCss', '');

      // Update UI to reflect changes
      this.updateUI();
      this.updateKeywordList();

      // Update form controls
      document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        const input = checkbox as HTMLInputElement;
        const settingKey = this.checkboxMapping.get(input.id);
        if (settingKey) {
          input.checked = this.settings[settingKey] || false;
        }
      });

      document.querySelectorAll('select').forEach(select => {
        const selectElement = select as HTMLSelectElement;
        const settingKey = this.selectMapping.get(selectElement.id);
        if (settingKey) {
          selectElement.value = this.settings[settingKey] || '';
        }
      });

      const cssEditor = document.getElementById('customCssEditor') as HTMLTextAreaElement;
      if (cssEditor) {
        cssEditor.value = '';
      }

      this.showToast('All settings have been reset to default values', 'success');
    } catch (error) {
      console.error('Failed to reset settings:', error);
      this.showToast('Failed to reset settings', 'error');
    }
  }

  private async exportData() {
    try {
      const allData = {
        settings: this.settings,
        keywords: this.keywords,
        customCss: await StorageService.getWithDefault('customCss', ''),
        stats: await StorageService.getWithDefault('stats', {}),
        exportDate: new Date().toISOString(),
        version: '1.0.0',
      };

      const dataStr = JSON.stringify(allData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `chrome-extension-template-backup-${Date.now()}.json`;
      link.click();

      URL.revokeObjectURL(url);
      this.showToast('Data exported successfully', 'success');
    } catch (error) {
      console.error('Failed to export data:', error);
      this.showToast('Failed to export data', 'error');
    }
  }

  private async importData(file: File) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate data structure
      if (!data.settings || !Array.isArray(data.keywords)) {
        throw new Error('Invalid backup file format');
      }

      // Import settings
      this.settings = { ...this.settings, ...data.settings };
      this.keywords = data.keywords;

      await this.saveSettings();
      await this.saveKeywords();

      if (data.customCss) {
        await StorageService.setItem('customCss', data.customCss);
      }

      // Update UI
      this.updateUI();
      this.updateKeywordList();

      // Update form controls
      document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        const input = checkbox as HTMLInputElement;
        const settingKey = this.checkboxMapping.get(input.id);
        if (settingKey) {
          input.checked = this.settings[settingKey] || false;
        }
      });

      const cssEditor = document.getElementById('customCssEditor') as HTMLTextAreaElement;
      if (cssEditor && data.customCss) {
        cssEditor.value = data.customCss;
      }

      this.showToast('Data imported successfully', 'success');
    } catch (error) {
      console.error('Failed to import data:', error);
      this.showToast('Failed to import data. Please check the file format.', 'error');
    }
  }

  private async clearAllData() {
    try {
      await chrome.storage.local.clear();
      await chrome.storage.sync.clear();

      // Reset local variables
      this.settings = {};
      this.keywords = [];

      this.showToast('All data has been cleared', 'success');

      // Reload the page to reset the UI
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Failed to clear data:', error);
      this.showToast('Failed to clear data', 'error');
    }
  }

  private showConfirmModal(title: string, message: string, onConfirm: () => void) {
    const modal = document.getElementById('confirmModal');
    const titleElement = document.getElementById('confirmTitle');
    const messageElement = document.getElementById('confirmMessage');
    const cancelBtn = document.getElementById('confirmCancel');
    const okBtn = document.getElementById('confirmOk');

    if (modal && titleElement && messageElement && cancelBtn && okBtn) {
      titleElement.textContent = title;
      messageElement.textContent = message;
      modal.classList.remove('hidden');

      const closeModal = () => {
        modal.classList.add('hidden');
      };

      cancelBtn.onclick = closeModal;
      okBtn.onclick = () => {
        onConfirm();
        closeModal();
      };

      // Close modal when clicking outside
      modal.onclick = e => {
        if (e.target === modal) {
          closeModal();
        }
      };
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

// Initialize options page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new OptionsManager();
});

export default OptionsManager;
