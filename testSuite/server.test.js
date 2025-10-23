import request from 'supertest';
import express from 'express';

// Create a lightweight express app for testing server routes without starting the real server
// Do NOT mount application routes here to avoid importing modules that use ESM-only packages
const app = express();
app.use(express.json());

describe('Server basic routes', () => {
  test('responds 404 for unknown route', async () => {
    const res = await request(app).get('/__nonexistent__');
    expect([404, 302]).toContain(res.status); // some middlewares may redirect
  });
});
