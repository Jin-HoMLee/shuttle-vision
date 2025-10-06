// Storage utility for Chrome Extension Template
// Provides a unified interface for chrome.storage API with error handling

export class StorageService {
  /**
   * Get an item from storage
   * @param key - Storage key
   * @param useSync - Whether to use sync storage (default: false)
   * @returns Promise resolving to the stored value or null
   */
  static async getItem<T = any>(key: string, useSync: boolean = false): Promise<T | null> {
    try {
      const storage = useSync ? chrome.storage.sync : chrome.storage.local;
      const result = await storage.get(key);
      return result[key] ?? null;
    } catch (error) {
      console.error('StorageService: Failed to get item', key, error);
      return null;
    }
  }

  /**
   * Set an item in storage
   * @param key - Storage key
   * @param value - Value to store
   * @param useSync - Whether to use sync storage (default: false)
   * @returns Promise resolving to success boolean
   */
  static async setItem(key: string, value: any, useSync: boolean = false): Promise<boolean> {
    try {
      const storage = useSync ? chrome.storage.sync : chrome.storage.local;
      await storage.set({ [key]: value });
      return true;
    } catch (error) {
      console.error('StorageService: Failed to set item', key, error);
      return false;
    }
  }

  /**
   * Remove an item from storage
   * @param key - Storage key to remove
   * @param useSync - Whether to use sync storage (default: false)
   * @returns Promise resolving to success boolean
   */
  static async removeItem(key: string, useSync: boolean = false): Promise<boolean> {
    try {
      const storage = useSync ? chrome.storage.sync : chrome.storage.local;
      await storage.remove(key);
      return true;
    } catch (error) {
      console.error('StorageService: Failed to remove item', key, error);
      return false;
    }
  }

  /**
   * Get multiple items from storage
   * @param keys - Array of storage keys
   * @param useSync - Whether to use sync storage (default: false)
   * @returns Promise resolving to an object with key-value pairs
   */
  static async getItems(keys: string[], useSync: boolean = false): Promise<Record<string, any>> {
    try {
      const storage = useSync ? chrome.storage.sync : chrome.storage.local;
      const result = await storage.get(keys);
      return result;
    } catch (error) {
      console.error('StorageService: Failed to get items', keys, error);
      return {};
    }
  }

  /**
   * Set multiple items in storage
   * @param items - Object with key-value pairs to store
   * @param useSync - Whether to use sync storage (default: false)
   * @returns Promise resolving to success boolean
   */
  static async setItems(items: Record<string, any>, useSync: boolean = false): Promise<boolean> {
    try {
      const storage = useSync ? chrome.storage.sync : chrome.storage.local;
      await storage.set(items);
      return true;
    } catch (error) {
      console.error('StorageService: Failed to set items', items, error);
      return false;
    }
  }

  /**
   * Clear all storage
   * @param useSync - Whether to use sync storage (default: false)
   * @returns Promise resolving to success boolean
   */
  static async clear(useSync: boolean = false): Promise<boolean> {
    try {
      const storage = useSync ? chrome.storage.sync : chrome.storage.local;
      await storage.clear();
      return true;
    } catch (error) {
      console.error('StorageService: Failed to clear storage', error);
      return false;
    }
  }

  /**
   * Get all items from storage
   * @param useSync - Whether to use sync storage (default: false)
   * @returns Promise resolving to all stored items
   */
  static async getAllItems(useSync: boolean = false): Promise<Record<string, any>> {
    try {
      const storage = useSync ? chrome.storage.sync : chrome.storage.local;
      const result = await storage.get(null);
      return result;
    } catch (error) {
      console.error('StorageService: Failed to get all items', error);
      return {};
    }
  }

  /**
   * Get storage usage information
   * @param useSync - Whether to use sync storage (default: false)
   * @returns Promise resolving to bytes used
   */
  static async getBytesInUse(useSync: boolean = false): Promise<number> {
    try {
      const storage = useSync ? chrome.storage.sync : chrome.storage.local;
      const bytesInUse = await storage.getBytesInUse();
      return bytesInUse;
    } catch (error) {
      console.error('StorageService: Failed to get bytes in use', error);
      return 0;
    }
  }

  /**
   * Listen for storage changes
   * @param callback - Function to call when storage changes
   * @param useSync - Whether to listen to sync storage (default: false)
   */
  static onChanged(
    callback: (_changes: Record<string, chrome.storage.StorageChange>) => void,
    useSync: boolean = false
  ) {
    const areaName = useSync ? 'sync' : 'local';

    chrome.storage.onChanged.addListener((changes, areaNameChanged) => {
      if (areaNameChanged === areaName) {
        callback(changes);
      }
    });
  }

  /**
   * Get an item from storage with a default value
   * @param key - Storage key
   * @param defaultValue - Default value if key doesn't exist
   * @param useSync - Whether to use sync storage (default: false)
   * @returns Promise resolving to the stored value or default value
   */
  static async getWithDefault<T>(
    key: string,
    defaultValue: T,
    useSync: boolean = false
  ): Promise<T> {
    try {
      const value = await this.getItem(key, useSync);
      return value ?? defaultValue;
    } catch (error) {
      console.error('StorageService: Failed to get item with default', key, error);
      return defaultValue;
    }
  }

  /**
   * Check if a key exists in storage
   * @param key - Storage key to check
   * @param useSync - Whether to use sync storage (default: false)
   * @returns Promise resolving to boolean indicating existence
   */
  static async hasItem(key: string, useSync: boolean = false): Promise<boolean> {
    try {
      const value = await this.getItem(key, useSync);
      return value !== null;
    } catch (error) {
      console.error('StorageService: Failed to check item existence', key, error);
      return false;
    }
  }

  /**
   * Get storage quota information (sync storage only)
   * @returns Promise resolving to quota info
   */
  static async getQuotaInfo(): Promise<{
    quota: number;
    bytesInUse: number;
    percentUsed: number;
  }> {
    try {
      const quota = chrome.storage.sync.QUOTA_BYTES;
      const bytesInUse = await this.getBytesInUse(true);
      const percentUsed = (bytesInUse / quota) * 100;

      return {
        quota,
        bytesInUse,
        percentUsed,
      };
    } catch (error) {
      console.error('StorageService: Failed to get quota info', error);
      return {
        quota: 0,
        bytesInUse: 0,
        percentUsed: 0,
      };
    }
  }
}
