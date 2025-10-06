import { StorageService } from '../utils/storage';

describe('StorageService', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('getItem', () => {
    it('should get item from local storage', async () => {
      const mockData = { key: 'testData' };
      (chrome.storage.local.get as jest.Mock).mockResolvedValue(mockData);

      const result = await StorageService.getItem('key');

      expect(chrome.storage.local.get).toHaveBeenCalledWith('key');
      expect(result).toBe('testData');
    });

    it('should get item from sync storage when useSync is true', async () => {
      const mockData = { key: 'syncData' };
      (chrome.storage.sync.get as jest.Mock).mockResolvedValue(mockData);

      const result = await StorageService.getItem('key', true);

      expect(chrome.storage.sync.get).toHaveBeenCalledWith('key');
      expect(result).toBe('syncData');
    });

    it('should return null when item does not exist', async () => {
      (chrome.storage.local.get as jest.Mock).mockResolvedValue({});

      const result = await StorageService.getItem('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle storage errors gracefully', async () => {
      (chrome.storage.local.get as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await StorageService.getItem('key');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('setItem', () => {
    it('should set item in local storage', async () => {
      (chrome.storage.local.set as jest.Mock).mockResolvedValue(undefined);

      const result = await StorageService.setItem('key', 'value');

      expect(chrome.storage.local.set).toHaveBeenCalledWith({ key: 'value' });
      expect(result).toBe(true);
    });

    it('should set item in sync storage when useSync is true', async () => {
      (chrome.storage.sync.set as jest.Mock).mockResolvedValue(undefined);

      const result = await StorageService.setItem('key', 'value', true);

      expect(chrome.storage.sync.set).toHaveBeenCalledWith({ key: 'value' });
      expect(result).toBe(true);
    });

    it('should handle storage errors gracefully', async () => {
      (chrome.storage.local.set as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await StorageService.setItem('key', 'value');

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('removeItem', () => {
    it('should remove item from local storage', async () => {
      (chrome.storage.local.remove as jest.Mock).mockResolvedValue(undefined);

      const result = await StorageService.removeItem('key');

      expect(chrome.storage.local.remove).toHaveBeenCalledWith('key');
      expect(result).toBe(true);
    });

    it('should remove item from sync storage when useSync is true', async () => {
      (chrome.storage.sync.remove as jest.Mock).mockResolvedValue(undefined);

      const result = await StorageService.removeItem('key', true);

      expect(chrome.storage.sync.remove).toHaveBeenCalledWith('key');
      expect(result).toBe(true);
    });
  });

  describe('getWithDefault', () => {
    it('should return stored value when it exists', async () => {
      const storedData = { name: 'test', value: 123 };
      (chrome.storage.local.get as jest.Mock).mockResolvedValue({ key: storedData });

      const result = await StorageService.getWithDefault('key', { default: true });

      expect(result).toEqual(storedData);
    });

    it('should return default value when key does not exist', async () => {
      (chrome.storage.local.get as jest.Mock).mockResolvedValue({});

      const defaultValue = { default: true };
      const result = await StorageService.getWithDefault('key', defaultValue);

      expect(result).toBe(defaultValue);
    });

    it('should return default value when storage returns null', async () => {
      (chrome.storage.local.get as jest.Mock).mockResolvedValue({ key: null });

      const defaultValue = { fallback: 'value' };
      const result = await StorageService.getWithDefault('key', defaultValue);

      expect(result).toBe(defaultValue);
    });

    it('should handle storage errors gracefully', async () => {
      (chrome.storage.local.get as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const defaultValue = { error: 'handled' };
      const result = await StorageService.getWithDefault('key', defaultValue);

      expect(result).toBe(defaultValue);
      expect(console.error).toHaveBeenCalledWith(
        'StorageService: Failed to get item',
        'key',
        expect.any(Error)
      );
    });
  });

  describe('hasItem', () => {
    it('should return true when item exists', async () => {
      (chrome.storage.local.get as jest.Mock).mockResolvedValue({ key: 'value' });

      const result = await StorageService.hasItem('key');

      expect(result).toBe(true);
    });

    it('should return false when item does not exist', async () => {
      (chrome.storage.local.get as jest.Mock).mockResolvedValue({});

      const result = await StorageService.hasItem('key');

      expect(result).toBe(false);
    });
  });

  describe('getQuotaInfo', () => {
    it('should return quota information', async () => {
      (chrome.storage.sync.getBytesInUse as jest.Mock).mockResolvedValue(1024);

      const result = await StorageService.getQuotaInfo();

      expect(result).toEqual({
        quota: 102400,
        bytesInUse: 1024,
        percentUsed: 1,
      });
    });
  });
});
