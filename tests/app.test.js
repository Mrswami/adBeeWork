const request = require('supertest');
const app = require('../server');

describe('Basic app server tests', () => {
    it('should serve the frontend index.html', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('adBeeWork');
    });

    it('should return 404 for unknown API routes', async () => {
        const res = await request(app).get('/api/unknown');
        expect(res.statusCode).toBe(404);
    });
});
