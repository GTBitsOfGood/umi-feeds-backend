import request from 'supertest';
import app from '../src/app';

describe('GET /api/donations', () => {
    it('should return 200 OK', () => {
        return request(app).get('/api/donations')
            .expect(200);
    });
});

describe('GET /api/available-pickup', () => {
    it('should return 200 OK', () => {
        return request(app).get('/api/available-pickup')
            .expect(200);
    });
});

describe('POST /api/donations with no body', () => {
    it('should return 400 Bad Request', () => {
        return request(app).post('/api/donations')
            .expect(400);
    });
});

describe('DELETE /api/donations/asdf', () => {
    it('should return 400 Bad Request', () => {
        return request(app).delete('/api/donations/asdf')
            .expect(400);
    });
});
