import request from 'supertest';
import express from 'express';

const app = express();
app.use(express.json());

// Mock routes - replace these with your actual routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

app.post('/api/users', (req, res) => {
  const { username, email } = req.body;
  if (!username || !email) {
    return res.status(400).json({ error: 'Username and email are required' });
  }
  res.status(201).json({ id: '123', username, email });
});

app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  if (id === '404') {
    return res.status(404).json({ error: 'User not found' });
  }
  res.status(200).json({ id, username: 'testuser', email: 'test@example.com' });
});

describe('Server API Routes', () => {
  describe('Basic functionality', () => {
    test('responds 404 for unknown route', async () => {
      const res = await request(app).get('/__nonexistent__');
      expect([404, 302]).toContain(res.status);
    });

    test('accepts JSON requests', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({ username: 'newuser', email: 'new@example.com' })
        .set('Accept', 'application/json');
      
      expect(res.headers['content-type']).toMatch(/json/);
    });
  });

  describe('GET /api/health', () => {
    test('returns 200 and status ok', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('timestamp');
    });

    test('timestamp is a valid number', async () => {
      const res = await request(app).get('/api/health');
      expect(typeof res.body.timestamp).toBe('number');
      expect(res.body.timestamp).toBeGreaterThan(0);
    });
  });

  describe('POST /api/users', () => {
    test('creates user with valid data', async () => {
      const userData = { username: 'johndoe', email: 'john@example.com' };
      const res = await request(app)
        .post('/api/users')
        .send(userData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.username).toBe(userData.username);
      expect(res.body.email).toBe(userData.email);
    });

    test('returns 400 when username is missing', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    test('returns 400 when email is missing', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({ username: 'testuser' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    test('returns 400 when both fields are missing', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/users/:id', () => {
    test('returns user data for valid id', async () => {
      const res = await request(app).get('/api/users/123');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', '123');
      expect(res.body).toHaveProperty('username');
      expect(res.body).toHaveProperty('email');
    });

    test('returns 404 for non-existent user', async () => {
      const res = await request(app).get('/api/users/404');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'User not found');
    });
  });

  describe('Error handling', () => {
    test('handles malformed JSON', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send('invalid json{');

      expect([400, 500]).toContain(res.status);
    });

    test('handles large payloads gracefully', async () => {
      const largePayload = {
        username: 'a'.repeat(1000),
        email: 'test@example.com',
      };
      
      const res = await request(app)
        .post('/api/users')
        .send(largePayload);

      expect([201, 400, 413]).toContain(res.status);
    });
  });
});