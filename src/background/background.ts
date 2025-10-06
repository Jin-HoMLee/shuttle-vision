// Background service worker for Chrome Extension Template
// This script runs in the background and handles extension lifecycle events

import { ExtensionMessage, MessageType } from '@/types/messages';
import { StorageService } from '@/utils/storage';

// Extension installation and startup
chrome.runtime.onInstalled.addListener(async details => {
  console.log('Extension installed:', details.reason);

  if (details.reason === 'install') {
    // Set default settings on first install
    await StorageService.setItem('settings', {
      enabled: true,
      theme: 'light',
      notifications: true,
    });

    // Open options page on first install
    chrome.tabs.create({
      url: chrome.runtime.getURL('options/options.html'),
    });
  }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension started');
});

// Message handling between different parts of the extension
chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
  console.log('Background received message:', message);

  switch (message.type) {
    case MessageType.GET_TAB_INFO:
      handleGetTabInfo(sender, sendResponse);
      return true; // Keep message channel open for async response

    case MessageType.TOGGLE_FEATURE:
      handleToggleFeature(message.data, sendResponse);
      return true;

    case MessageType.SAVE_DATA:
      handleSaveData(message.data, sendResponse);
      return true;

    default:
      console.warn('Unknown message type:', message.type);
      sendResponse({ success: false, error: 'Unknown message type' });
  }
});

// Context menu setup
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'extension-template-menu',
    title: 'Chrome Extension Template',
    contexts: ['selection', 'page'],
  });
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'extension-template-menu') {
    // Inject content script and execute functionality
    if (tab?.id) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // This function runs in the content script context
          const selection = window.getSelection()?.toString();
          if (selection) {
            console.log('Selected text:', selection);
            // Add your custom functionality here
          }
        },
      });
    }
  }
});

// Handle getting tab information
async function handleGetTabInfo(
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void
) {
  try {
    const tab = sender.tab;
    if (tab) {
      const response = {
        success: true,
        data: {
          title: tab.title,
          url: tab.url,
          id: tab.id,
        },
      };
      sendResponse(response);
    } else {
      sendResponse({ success: false, error: 'No tab information available' });
    }
  } catch (error) {
    console.error('Error getting tab info:', error);
    sendResponse({ success: false, error: 'Failed to get tab info' });
  }
}

// Handle feature toggle
async function handleToggleFeature(data: any, sendResponse: (response: any) => void) {
  try {
    const currentSettings = await StorageService.getWithDefault('settings', {
      enabled: true,
      theme: 'light',
      notifications: true,
    });
    const updatedSettings = {
      ...currentSettings,
      [data.feature]: data.enabled,
    };

    await StorageService.setItem('settings', updatedSettings);
    sendResponse({ success: true, data: updatedSettings });
  } catch (error) {
    console.error('Error toggling feature:', error);
    sendResponse({ success: false, error: 'Failed to toggle feature' });
  }
}

// Handle saving data
async function handleSaveData(data: any, sendResponse: (response: any) => void) {
  try {
    await StorageService.setItem(data.key, data.value);
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error saving data:', error);
    sendResponse({ success: false, error: 'Failed to save data' });
  }
}

// Keep service worker alive
let keepAlive: ReturnType<typeof setTimeout>;

function resetKeepAlive() {
  if (keepAlive) {
    clearTimeout(keepAlive);
  }
  keepAlive = setTimeout(() => {
    console.log('Keeping service worker alive');
  }, 20000); // Reset every 20 seconds
}

// Reset keep alive on any activity
chrome.runtime.onMessage.addListener(resetKeepAlive);
chrome.tabs.onActivated.addListener(resetKeepAlive);
chrome.tabs.onUpdated.addListener(resetKeepAlive);

// Initial keep alive
resetKeepAlive();
