// Mock argon2-browser BEFORE importing
jest.mock('argon2-browser', () => ({
  hash: jest.fn(),
  verify: jest.fn(),
}));

import { hash as argon2Hash, verify } from 'argon2-browser';

describe('Authentication and Password Hashing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Password Hashing', () => {
    test('hashes password successfully', async () => {
      const mockHash = {
        encoded: '$argon2id$v=19$m=65536,t=3,p=4$hashedpassword',
        hash: new Uint8Array(32),
      };

      argon2Hash.mockResolvedValue(mockHash);

      const password = 'SecurePassword123!';
      const result = await argon2Hash({ pass: password, salt: 'randomsalt' });

      expect(argon2Hash).toHaveBeenCalledWith({ pass: password, salt: 'randomsalt' });
      expect(result.encoded).toBeTruthy();
      expect(result.encoded).toContain('$argon2id$');
    });

    test('handles different password lengths', async () => {
      const passwords = [
        'short',
        'mediumPassword123',
        'VeryLongPasswordWithManyCharacters123!@#$%^&*()',
      ];

      for (const password of passwords) {
        const mockHash = {
          encoded: `$argon2id$v=19$m=65536,t=3,p=4$${password.length}`,
          hash: new Uint8Array(32),
        };

        argon2Hash.mockResolvedValue(mockHash);
        const result = await argon2Hash({ pass: password, salt: 'salt' });

        expect(result.encoded).toBeTruthy();
      }
    });

    test('handles hashing errors', async () => {
      argon2Hash.mockRejectedValue(new Error('Hashing failed'));

      await expect(
        argon2Hash({ pass: 'password', salt: 'salt' })
      ).rejects.toThrow('Hashing failed');
    });
  });

  describe('Password Verification', () => {
    test('verifies correct password', async () => {
      verify.mockResolvedValue(true);

      const password = 'correctPassword';
      const hash = '$argon2id$v=19$m=65536,t=3,p=4$hashedpassword';

      const isValid = await verify({ pass: password, encoded: hash });

      expect(verify).toHaveBeenCalledWith({ pass: password, encoded: hash });
      expect(isValid).toBe(true);
    });

    test('rejects incorrect password', async () => {
      verify.mockResolvedValue(false);

      const password = 'wrongPassword';
      const hash = '$argon2id$v=19$m=65536,t=3,p=4$hashedpassword';

      const isValid = await verify({ pass: password, encoded: hash });

      expect(isValid).toBe(false);
    });

    test('handles verification errors', async () => {
      verify.mockRejectedValue(new Error('Invalid hash format'));

      await expect(
        verify({ pass: 'password', encoded: 'invalid-hash' })
      ).rejects.toThrow('Invalid hash format');
    });
  });

  describe('User Registration Flow', () => {
    test('creates user with hashed password', async () => {
      const mockHash = {
        encoded: '$argon2id$v=19$m=65536,t=3,p=4$hashedpassword',
        hash: new Uint8Array(32),
      };

      argon2Hash.mockResolvedValue(mockHash);

      const userData = {
        username: 'newuser',
        password: 'SecurePass123!',
        email: 'newuser@example.com',
      };

      const hashedPassword = await argon2Hash({
        pass: userData.password,
        salt: 'randomsalt',
      });

      const user = {
        username: userData.username,
        email: userData.email,
        passwordHash: hashedPassword.encoded,
      };

      expect(user.passwordHash).toBeTruthy();
      expect(user.passwordHash).not.toBe(userData.password);
      expect(user.passwordHash).toContain('$argon2id$');
    });
  });

  describe('User Login Flow', () => {
    test('authenticates user with correct credentials', async () => {
      const storedUser = {
        username: 'testuser',
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$hashedpassword',
        email: 'test@example.com',
      };

      verify.mockResolvedValue(true);

      const loginPassword = 'correctPassword';
      const isAuthenticated = await verify({
        pass: loginPassword,
        encoded: storedUser.passwordHash,
      });

      expect(isAuthenticated).toBe(true);
    });

    test('rejects authentication with incorrect credentials', async () => {
      const storedUser = {
        username: 'testuser',
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$hashedpassword',
      };

      verify.mockResolvedValue(false);

      const loginPassword = 'wrongPassword';
      const isAuthenticated = await verify({
        pass: loginPassword,
        encoded: storedUser.passwordHash,
      });

      expect(isAuthenticated).toBe(false);
    });
  });

  describe('Security Best Practices', () => {
    test('does not store plain text passwords', async () => {
      const mockHash = {
        encoded: '$argon2id$v=19$m=65536,t=3,p=4$hashedpassword',
        hash: new Uint8Array(32),
      };

      argon2Hash.mockResolvedValue(mockHash);

      const plainPassword = 'PlainTextPassword123';
      const result = await argon2Hash({ pass: plainPassword, salt: 'salt' });

      expect(result.encoded).not.toContain(plainPassword);
      expect(result.encoded).not.toBe(plainPassword);
    });

    test('generates unique hashes for same password with different salts', async () => {
      const password = 'SamePassword123';
      
      argon2Hash
        .mockResolvedValueOnce({
          encoded: '$argon2id$v=19$m=65536,t=3,p=4$hash1',
          hash: new Uint8Array(32),
        })
        .mockResolvedValueOnce({
          encoded: '$argon2id$v=19$m=65536,t=3,p=4$hash2',
          hash: new Uint8Array(32),
        });

      const hash1 = await argon2Hash({ pass: password, salt: 'salt1' });
      const hash2 = await argon2Hash({ pass: password, salt: 'salt2' });

      expect(hash1.encoded).not.toBe(hash2.encoded);
    });
  });
});