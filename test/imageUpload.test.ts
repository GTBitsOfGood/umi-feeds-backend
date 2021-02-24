import request from 'supertest';
import app from '../src/app';

describe('POST /upload', () => {
    it('should return 400 Bad Request', () => {
        return request(app).post('/upload')
            .expect(400);
    });
});
