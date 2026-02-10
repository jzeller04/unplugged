import AsyncStorage from '@react-native-async-storage/async-storage';

describe('AsyncStorage Utilities', () => {
  beforeEach(() => {
    AsyncStorage.clear();
    jest.clearAllMocks();
  });

  describe('Basic Storage Operations', () => {
    test('stores and retrieves string data', async () => {
      const key = 'testKey';
      const value = 'testValue';

      AsyncStorage.setItem.mockResolvedValue(undefined);
      AsyncStorage.getItem.mockResolvedValue(value);

      await AsyncStorage.setItem(key, value);
      const retrieved = await AsyncStorage.getItem(key);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(key, value);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(key);
      expect(retrieved).toBe(value);
    });

    test('stores and retrieves JSON data', async () => {
      const key = 'userData';
      const value = { username: 'testuser', email: 'test@example.com' };
      const jsonValue = JSON.stringify(value);

      AsyncStorage.setItem.mockResolvedValue(undefined);
      AsyncStorage.getItem.mockResolvedValue(jsonValue);

      await AsyncStorage.setItem(key, jsonValue);
      const retrieved = await AsyncStorage.getItem(key);
      const parsed = JSON.parse(retrieved);

      expect(parsed).toEqual(value);
      expect(parsed.username).toBe('testuser');
      expect(parsed.email).toBe('test@example.com');
    });

    test('removes item from storage', async () => {
      const key = 'itemToRemove';

      AsyncStorage.removeItem.mockResolvedValue(undefined);
      AsyncStorage.getItem.mockResolvedValue(null);

      await AsyncStorage.removeItem(key);
      const retrieved = await AsyncStorage.getItem(key);

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(key);
      expect(retrieved).toBeNull();
    });

    test('clears all storage', async () => {
      AsyncStorage.clear.mockResolvedValue(undefined);
      AsyncStorage.getAllKeys.mockResolvedValue([]);

      await AsyncStorage.clear();
      const keys = await AsyncStorage.getAllKeys();

      expect(AsyncStorage.clear).toHaveBeenCalled();
      expect(keys).toHaveLength(0);
    });
  });

  describe('User Session Management', () => {
    test('saves user session', async () => {
      const session = {
        userId: '123',
        username: 'testuser',
        token: 'auth-token-123',
        expiresAt: Date.now() + 3600000,
      };

      AsyncStorage.setItem.mockResolvedValue(undefined);

      await AsyncStorage.setItem('userSession', JSON.stringify(session));

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'userSession',
        JSON.stringify(session)
      );
    });

    test('retrieves user session', async () => {
      const session = {
        userId: '123',
        username: 'testuser',
        token: 'auth-token-123',
      };

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(session));

      const retrieved = await AsyncStorage.getItem('userSession');
      const parsedSession = JSON.parse(retrieved);

      expect(parsedSession).toEqual(session);
      expect(parsedSession.userId).toBe('123');
    });

    test('clears user session on logout', async () => {
      AsyncStorage.removeItem.mockResolvedValue(undefined);

      await AsyncStorage.removeItem('userSession');

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('userSession');
    });

    test('handles expired session', async () => {
      const expiredSession = {
        userId: '123',
        token: 'old-token',
        expiresAt: Date.now() - 1000, // Expired
      };

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(expiredSession));
      AsyncStorage.removeItem.mockResolvedValue(undefined);

      const retrieved = await AsyncStorage.getItem('userSession');
      const session = JSON.parse(retrieved);

      if (session.expiresAt < Date.now()) {
        await AsyncStorage.removeItem('userSession');
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('userSession');
      }
    });
  });

  describe('User Preferences', () => {
    test('saves user preferences', async () => {
      const preferences = {
        theme: 'dark',
        notifications: true,
        language: 'en',
      };

      AsyncStorage.setItem.mockResolvedValue(undefined);

      await AsyncStorage.setItem('userPreferences', JSON.stringify(preferences));

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'userPreferences',
        JSON.stringify(preferences)
      );
    });

    test('retrieves user preferences with defaults', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const retrieved = await AsyncStorage.getItem('userPreferences');
      const preferences = retrieved
        ? JSON.parse(retrieved)
        : { theme: 'light', notifications: false, language: 'en' };

      expect(preferences).toHaveProperty('theme');
      expect(preferences).toHaveProperty('notifications');
      expect(preferences).toHaveProperty('language');
    });

    test('updates specific preference', async () => {
      const currentPrefs = {
        theme: 'light',
        notifications: true,
        language: 'en',
      };

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(currentPrefs));
      AsyncStorage.setItem.mockResolvedValue(undefined);

      const retrieved = await AsyncStorage.getItem('userPreferences');
      const prefs = JSON.parse(retrieved);
      prefs.theme = 'dark';

      await AsyncStorage.setItem('userPreferences', JSON.stringify(prefs));

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'userPreferences',
        JSON.stringify({ ...currentPrefs, theme: 'dark' })
      );
    });
  });

  describe('Multi-operation Functions', () => {
    test('stores multiple items at once', async () => {
      const pairs = [
        ['key1', 'value1'],
        ['key2', 'value2'],
        ['key3', 'value3'],
      ];

      AsyncStorage.multiSet.mockResolvedValue(undefined);

      await AsyncStorage.multiSet(pairs);

      expect(AsyncStorage.multiSet).toHaveBeenCalledWith(pairs);
    });

    test('retrieves multiple items at once', async () => {
      const keys = ['key1', 'key2', 'key3'];
      const mockResult = [
        ['key1', 'value1'],
        ['key2', 'value2'],
        ['key3', 'value3'],
      ];

      AsyncStorage.multiGet.mockResolvedValue(mockResult);

      const result = await AsyncStorage.multiGet(keys);

      expect(AsyncStorage.multiGet).toHaveBeenCalledWith(keys);
      expect(result).toEqual(mockResult);
      expect(result).toHaveLength(3);
    });

    test('removes multiple items at once', async () => {
      const keys = ['key1', 'key2', 'key3'];

      AsyncStorage.multiRemove.mockResolvedValue(undefined);

      await AsyncStorage.multiRemove(keys);

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(keys);
    });

    test('gets all storage keys', async () => {
      const mockKeys = ['userSession', 'userPreferences', 'cachedData'];

      AsyncStorage.getAllKeys.mockResolvedValue(mockKeys);

      const keys = await AsyncStorage.getAllKeys();

      expect(AsyncStorage.getAllKeys).toHaveBeenCalled();
      expect(keys).toEqual(mockKeys);
      expect(keys).toHaveLength(3);
    });
  });

  describe('Error Handling', () => {
    test('handles storage quota exceeded', async () => {
      const largeData = 'x'.repeat(10000000); // Very large string

      AsyncStorage.setItem.mockRejectedValue(
        new Error('QuotaExceededError')
      );

      await expect(
        AsyncStorage.setItem('largeKey', largeData)
      ).rejects.toThrow('QuotaExceededError');
    });

    test('handles invalid JSON parsing', async () => {
      AsyncStorage.getItem.mockResolvedValue('invalid json{');

      const retrieved = await AsyncStorage.getItem('invalidKey');

      expect(() => JSON.parse(retrieved)).toThrow();
    });

    test('handles null values gracefully', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const retrieved = await AsyncStorage.getItem('nonexistentKey');

      expect(retrieved).toBeNull();
    });

    test('handles storage operation failures', async () => {
      AsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      await expect(
        AsyncStorage.setItem('key', 'value')
      ).rejects.toThrow('Storage error');
    });
  });

  describe('Cache Management', () => {
    test('stores cached data with timestamp', async () => {
      const cacheData = {
        data: { items: [1, 2, 3] },
        timestamp: Date.now(),
      };

      AsyncStorage.setItem.mockResolvedValue(undefined);

      await AsyncStorage.setItem('cachedItems', JSON.stringify(cacheData));

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'cachedItems',
        JSON.stringify(cacheData)
      );
    });

    test('validates cache freshness', async () => {
      const cacheMaxAge = 3600000; // 1 hour
      const cachedData = {
        data: { items: [1, 2, 3] },
        timestamp: Date.now() - cacheMaxAge - 1000, // Expired
      };

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedData));

      const retrieved = await AsyncStorage.getItem('cachedItems');
      const cache = JSON.parse(retrieved);
      const isFresh = Date.now() - cache.timestamp < cacheMaxAge;

      expect(isFresh).toBe(false);
    });

    test('clears expired cache entries', async () => {
      const keys = ['cache1', 'cache2', 'cache3'];
      
      AsyncStorage.getAllKeys.mockResolvedValue(keys);
      AsyncStorage.multiRemove.mockResolvedValue(undefined);

      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith('cache'));
      
      await AsyncStorage.multiRemove(cacheKeys);

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(cacheKeys);
    });
  });
});