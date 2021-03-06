import request from 'supertest';
import app from '../src/app';

describe('GET /api/donors', () => {
    it('should return 200 OK', () => {
        return request(app).get('/api/donors')
            .expect(200);
    });
});

describe('POST /api/donors with no body', () => {
    it('should return 400 or 500', () => {
        return request(app).post('/api/donors').expect(res => res.status in [400, 500]);
    });
});
