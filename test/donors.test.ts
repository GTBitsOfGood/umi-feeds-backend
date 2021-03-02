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

describe('POST /api/donors with valid body', () => {
    it('should return 200', () => {
        return request(app).post('/api/donors')
        .send({
            'name': 'Slutty Vegan 2.0',
            'latitude': '43.142',
            'longitude': '-85.049',
            'address': '1542 Ralph David Abernathy Blvd SW, Atlanta, GA 30310',
            'phoneNumber': '8554397588' 
        })    
        .expect(200);
    });
});
