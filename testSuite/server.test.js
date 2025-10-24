import request from 'supertest';
import express from 'express';

const  app = express();
app.use(express.json());

describe('Server basic routes', () => {
    test('responds 404 for unknown route', async ()=> {
        const res = await request(app).get('/__nonexistent__');
        expect([404, 302]).toContain(res.status);
    });
});