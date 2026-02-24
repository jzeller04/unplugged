import { v4 as uuidv4, validate as uuidValidate, version as uuidVersion } from 'uuid';

describe('UUID Utilities', () => {
  describe('UUID v4 Generation', () => {
    test('generates valid UUID v4', () => {
      const id = uuidv4();

      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');
      expect(uuidValidate(id)).toBe(true);
      expect(uuidVersion(id)).toBe(4);
    });

    test('generates unique UUIDs', () => {
      const ids = new Set();
      const count = 1000;

      for (let i = 0; i < count; i++) {
        ids.add(uuidv4());
      }

      expect(ids.size).toBe(count);
    });

    test('UUID has correct format', () => {
      const id = uuidv4();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      expect(id).toMatch(uuidRegex);
    });

    test('UUID contains correct version number', () => {
      const id = uuidv4();
      const parts = id.split('-');

      expect(parts[2][0]).toBe('4');
    });
  });

  describe('UUID Validation', () => {
    test('validates correct UUIDs', () => {
      const validUUIDs = [
        '550e8400-e29b-41d4-a716-446655440000',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        uuidv4(),
      ];

      validUUIDs.forEach(uuid => {
        expect(uuidValidate(uuid)).toBe(true);
      });
    });

    test('rejects invalid UUIDs', () => {
      const invalidUUIDs = [
        'not-a-uuid',
        '123',
        '',
        '550e8400-e29b-41d4-a716',
        '550e8400-e29b-41d4-a716-44665544000g',
      ];

      invalidUUIDs.forEach(uuid => {
        expect(uuidValidate(uuid)).toBe(false);
      });
    });

    test('handles null and undefined', () => {
      expect(uuidValidate(null)).toBe(false);
      expect(uuidValidate(undefined)).toBe(false);
    });
  });

  describe('User ID Generation', () => {
    test('generates user ID with UUID', () => {
      const userId = `user_${uuidv4()}`;

      expect(userId).toContain('user_');
      expect(uuidValidate(userId.replace('user_', ''))).toBe(true);
    });

    test('generates session ID with UUID', () => {
      const sessionId = `session_${uuidv4()}`;

      expect(sessionId).toContain('session_');
      expect(uuidValidate(sessionId.replace('session_', ''))).toBe(true);
    });

    test('generates transaction ID with UUID and timestamp', () => {
      const timestamp = Date.now();
      const transactionId = `txn_${timestamp}_${uuidv4()}`;

      expect(transactionId).toContain('txn_');
      expect(transactionId).toContain(timestamp.toString());
    });
  });

  describe('UUID Version Detection', () => {
    test('detects UUID v4', () => {
      const uuid = uuidv4();
      expect(uuidVersion(uuid)).toBe(4);
    });

    test('handles different UUID versions', () => {
      // UUID v4 (random)
      const v4 = '550e8400-e29b-41d4-a716-446655440000';
      expect(uuidVersion(v4)).toBe(4);

      // UUID v1 (time-based) example
      const v1 = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
      expect(uuidVersion(v1)).toBe(1);
    });
  });

  describe('Practical Use Cases', () => {
    test('creates unique device IDs', () => {
      const deviceId = uuidv4();
      const anotherDeviceId = uuidv4();

      expect(deviceId).not.toBe(anotherDeviceId);
      expect(uuidValidate(deviceId)).toBe(true);
      expect(uuidValidate(anotherDeviceId)).toBe(true);
    });

    test('creates unique request IDs for API calls', () => {
      const requestId = uuidv4();

      expect(requestId).toBeTruthy();
      expect(uuidValidate(requestId)).toBe(true);
    });

    test('generates correlation IDs for distributed tracing', () => {
      const correlationId = uuidv4();
      const relatedRequestId = uuidv4();

      expect(correlationId).not.toBe(relatedRequestId);
      expect(uuidValidate(correlationId)).toBe(true);
      expect(uuidValidate(relatedRequestId)).toBe(true);
    });
  });
});

describe('General Utility Functions', () => {
  describe('String Utilities', () => {
    test('validates email format', () => {
      const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };

      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('invalid.email')).toBe(false);
      expect(isValidEmail('missing@domain')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });

    test('validates username format', () => {
      const isValidUsername = (username) => {
        return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username);
      };

      expect(isValidUsername('validuser')).toBe(true);
      expect(isValidUsername('user_123')).toBe(true);
      expect(isValidUsername('ab')).toBe(false); // Too short
      expect(isValidUsername('user with spaces')).toBe(false);
      expect(isValidUsername('user@name')).toBe(false);
    });

    test('sanitizes user input', () => {
      const sanitize = (input) => {
        return input.trim().replace(/[<>]/g, '');
      };

      expect(sanitize('  hello  ')).toBe('hello');
      expect(sanitize('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(sanitize('normal text')).toBe('normal text');
    });
  });

  describe('Date Utilities', () => {
    test('formats date to ISO string', () => {
      const date = new Date('2024-01-01T12:00:00Z');
      const formatted = date.toISOString();

      expect(formatted).toBe('2024-01-01T12:00:00.000Z');
    });

    test('checks if date is in the past', () => {
      const isPast = (date) => new Date(date) < new Date();

      expect(isPast('2020-01-01')).toBe(true);
      expect(isPast('2030-01-01')).toBe(false);
    });

    test('calculates days between dates', () => {
      const daysBetween = (date1, date2) => {
        const diffTime = Math.abs(new Date(date2) - new Date(date1));
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      };

      expect(daysBetween('2024-01-01', '2024-01-08')).toBe(7);
      expect(daysBetween('2024-01-01', '2024-02-01')).toBe(31);
    });
  });

  describe('Array Utilities', () => {
    test('removes duplicates from array', () => {
      const removeDuplicates = (arr) => [...new Set(arr)];

      expect(removeDuplicates([1, 2, 2, 3, 3, 4])).toEqual([1, 2, 3, 4]);
      expect(removeDuplicates(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
    });

    test('chunks array into smaller arrays', () => {
      const chunk = (arr, size) => {
        return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
          arr.slice(i * size, i * size + size)
        );
      };

      expect(chunk([1, 2, 3, 4, 5, 6], 2)).toEqual([[1, 2], [3, 4], [5, 6]]);
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    });

    test('shuffles array randomly', () => {
      const shuffle = (arr) => {
        const shuffled = [...arr];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      };

      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffle(original);

      expect(shuffled).toHaveLength(original.length);
      expect(shuffled.sort()).toEqual(original.sort());
    });
  });

  describe('Object Utilities', () => {
    test('deep clones object', () => {
      const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

      const original = { a: 1, b: { c: 2 } };
      const cloned = deepClone(original);

      cloned.b.c = 3;

      expect(original.b.c).toBe(2);
      expect(cloned.b.c).toBe(3);
    });

    test('merges objects', () => {
      const merge = (obj1, obj2) => ({ ...obj1, ...obj2 });

      const obj1 = { a: 1, b: 2 };
      const obj2 = { b: 3, c: 4 };

      expect(merge(obj1, obj2)).toEqual({ a: 1, b: 3, c: 4 });
    });

    test('checks if object is empty', () => {
      const isEmpty = (obj) => Object.keys(obj).length === 0;

      expect(isEmpty({})).toBe(true);
      expect(isEmpty({ a: 1 })).toBe(false);
    });
  });

  describe('Number Utilities', () => {
    test('formats number as currency', () => {
      const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount);
      };

      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0.99)).toBe('$0.99');
    });

    test('rounds to decimal places', () => {
      const roundTo = (num, decimals) => {
        return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
      };

      expect(roundTo(3.14159, 2)).toBe(3.14);
      expect(roundTo(3.14159, 3)).toBe(3.142);
    });

    test('clamps number between min and max', () => {
      const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });
});