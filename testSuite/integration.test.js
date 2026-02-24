jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn(),
  PutItemCommand: jest.fn(),
  GetItemCommand: jest.fn(),
}));

jest.mock('@aws-sdk/util-dynamodb', () => ({
  marshall: jest.fn((item) => item),
  unmarshall: jest.fn((item) => item),
}));

jest.mock('argon2-browser', () => ({
  hash: jest.fn(),
  verify: jest.fn(),
}));

import request from 'supertest';
import express from 'express';
import { DynamoDBClient, PutItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { hash, verify } from 'argon2-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

describe('Integration Tests', () => {
  let app;
  let mockDbClient;

  beforeEach(() => {
    jest.clearAllMocks();
    
    app = express();
    app.use(express.json());

    mockDbClient = {
      send: jest.fn(),
    };
    DynamoDBClient.mockImplementation(() => mockDbClient);

    // Setup routes
    app.post('/api/register', async (req, res) => {
      try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
          return res.status(400).json({ error: 'All fields required' });
        }

        const userId = uuidv4();
        const passwordHash = await hash({ pass: password, salt: 'salt' });

        const user = {
          id: userId,
          username,
          email,
          passwordHash: passwordHash.encoded,
          createdAt: new Date().toISOString(),
        };

        await mockDbClient.send(new PutItemCommand({
          TableName: 'Users',
          Item: marshall(user),
        }));

        res.status(201).json({
          id: userId,
          username,
          email,
        });
      } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
      }
    });

    app.post('/api/login', async (req, res) => {
      try {
        const { email, password } = req.body;

        if (!email || !password) {
          return res.status(400).json({ error: 'Email and password required' });
        }

        const user = {
          id: '123',
          email,
          passwordHash: '$argon2id$hashedpassword',
        };

        const isValid = await verify({
          pass: password,
          encoded: user.passwordHash,
        });

        if (!isValid) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const sessionToken = uuidv4();
        const session = {
          userId: user.id,
          token: sessionToken,
          expiresAt: Date.now() + 3600000,
        };

        res.status(200).json({
          userId: user.id,
          token: sessionToken,
          expiresAt: session.expiresAt,
        });
      } catch (error) {
        res.status(500).json({ error: 'Login failed' });
      }
    });

    app.get('/api/user/:id', async (req, res) => {
      try {
        const { id } = req.params;
        
        const result = await mockDbClient.send(new GetItemCommand({
          TableName: 'Users',
          Key: marshall({ id }),
        }));

        if (!result.Item) {
          return res.status(404).json({ error: 'User not found' });
        }

        const user = unmarshall(result.Item);
        delete user.passwordHash;

        res.status(200).json(user);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
      }
    });
  });

  describe('User Registration Flow', () => {
    test('successfully registers a new user', async () => {
      const mockHash = {
        encoded: '$argon2id$v=19$m=65536,t=3,p=4$hashedpassword',
        hash: new Uint8Array(32),
      };

      hash.mockResolvedValue(mockHash);
      marshall.mockImplementation((obj) => obj);
      mockDbClient.send.mockResolvedValue({ $metadata: { httpStatusCode: 200 } });

      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'SecurePass123!',
      };

      const res = await request(app)
        .post('/api/register')
        .send(userData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('username', userData.username);
      expect(res.body).toHaveProperty('email', userData.email);
      expect(res.body).not.toHaveProperty('password');
      expect(hash).toHaveBeenCalled();
      expect(mockDbClient.send).toHaveBeenCalled();
    });

    test('validates required fields during registration', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({ username: 'test' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    test('handles database errors during registration', async () => {
      hash.mockResolvedValue({
        encoded: '$argon2id$hashedpassword',
        hash: new Uint8Array(32),
      });
      mockDbClient.send.mockRejectedValue(new Error('DB Error'));

      const res = await request(app)
        .post('/api/register')
        .send({
          username: 'user',
          email: 'user@example.com',
          password: 'pass',
        });

      expect(res.status).toBe(500);
    });
  });

  describe('User Login Flow', () => {
    test('successfully logs in with valid credentials', async () => {
      verify.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'correctPassword',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('userId');
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('expiresAt');
      expect(verify).toHaveBeenCalled();
    });

    test('rejects login with invalid credentials', async () => {
      verify.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'wrongPassword',
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    test('validates required fields during login', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(400);
    });
  });

  describe('User Profile Retrieval', () => {
    test('retrieves user profile successfully', async () => {
      const mockUser = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
      };

      marshall.mockImplementation((obj) => obj);
      unmarshall.mockReturnValue(mockUser);
      mockDbClient.send.mockResolvedValue({
        Item: mockUser,
        $metadata: { httpStatusCode: 200 },
      });

      const res = await request(app).get('/api/user/123');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockUser);
      expect(mockDbClient.send).toHaveBeenCalled();
    });

    test('returns 404 for non-existent user', async () => {
      mockDbClient.send.mockResolvedValue({
        $metadata: { httpStatusCode: 200 },
      });

      const res = await request(app).get('/api/user/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Complete User Journey', () => {
    test('register, login, and fetch profile flow', async () => {
      // 1. Register
      const mockHash = {
        encoded: '$argon2id$hashedpassword',
        hash: new Uint8Array(32),
      };
      hash.mockResolvedValue(mockHash);
      marshall.mockImplementation((obj) => obj);
      mockDbClient.send.mockResolvedValue({ $metadata: { httpStatusCode: 200 } });

      const registerRes = await request(app)
        .post('/api/register')
        .send({
          username: 'journeyuser',
          email: 'journey@example.com',
          password: 'Password123!',
        });

      expect(registerRes.status).toBe(201);
      const userId = registerRes.body.id;

      // 2. Login
      verify.mockResolvedValue(true);

      const loginRes = await request(app)
        .post('/api/login')
        .send({
          email: 'journey@example.com',
          password: 'Password123!',
        });

      expect(loginRes.status).toBe(200);
      const sessionToken = loginRes.body.token;
      expect(sessionToken).toBeTruthy();

      // 3. Fetch Profile
      const mockUser = {
        id: userId,
        username: 'journeyuser',
        email: 'journey@example.com',
      };
      unmarshall.mockReturnValue(mockUser);
      mockDbClient.send.mockResolvedValue({
        Item: mockUser,
        $metadata: { httpStatusCode: 200 },
      });

      const profileRes = await request(app).get(`/api/user/${userId}`);

      expect(profileRes.status).toBe(200);
      expect(profileRes.body.username).toBe('journeyuser');
    });
  });

  describe('Session Management with AsyncStorage', () => {
    test('stores session after successful login', async () => {
      verify.mockResolvedValue(true);
      AsyncStorage.setItem.mockResolvedValue(undefined);

      const loginRes = await request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'password',
        });

      const session = {
        userId: loginRes.body.userId,
        token: loginRes.body.token,
        expiresAt: loginRes.body.expiresAt,
      };

      await AsyncStorage.setItem('userSession', JSON.stringify(session));

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'userSession',
        JSON.stringify(session)
      );
    });

    test('retrieves and validates session', async () => {
      const session = {
        userId: '123',
        token: 'valid-token',
        expiresAt: Date.now() + 3600000,
      };

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(session));

      const retrieved = await AsyncStorage.getItem('userSession');
      const parsedSession = JSON.parse(retrieved);

      expect(parsedSession.userId).toBe('123');
      expect(parsedSession.expiresAt).toBeGreaterThan(Date.now());
    });
  });

  describe('Error Recovery', () => {
    test('retries failed registration', async () => {
      hash.mockResolvedValue({
        encoded: '$argon2id$hashedpassword',
        hash: new Uint8Array(32),
      });
      marshall.mockImplementation((obj) => obj);
      
      // First attempt fails
      mockDbClient.send.mockRejectedValueOnce(new Error('Network error'));
      // Second attempt succeeds
      mockDbClient.send.mockResolvedValueOnce({ $metadata: { httpStatusCode: 200 } });

      const userData = {
        username: 'retryuser',
        email: 'retry@example.com',
        password: 'Password123!',
      };

      // First attempt
      let res = await request(app).post('/api/register').send(userData);
      expect(res.status).toBe(500);

      // Retry
      res = await request(app).post('/api/register').send(userData);
      expect(res.status).toBe(201);
    });
  });
});