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

describe('GET /api/available-pickup and have donations in correct time frame', () => {
    it('should return 200 OK', () => {
        return request(app).get('/api/available-pickup')
            .expect(200);
    });

    // Perform check on returned donations to see if current time is within the donations' time frames

});

describe('POST /api/donations with no body', () => {
    it('should return 400 or 500', () => {
        return request(app).post('/api/donations')
            .expect(res => res.status in [400, 500]);
    });
});

describe('POST /api/donations with valid body', () => {
    it('should return 201 Created', () => {
        return request(app).post('/api/donations')
            .send({'donor': '602bf82713e73d625cc0d522'})
            .send({'availability': { 'startTime': '2012-04-21T18:25:43-05:00', 'endTime': '2019-04-21T18:25:43-05:00' },})
            .send({'description': 'Antique Impossible Burgers'})
            .expect(201);
    });
});

describe('DELETE /api/donations/asdf', () => {
    it('should return 400 Bad Request', () => {
        return request(app).delete('/api/donations/asdf')
            .expect(400);
    });
});

describe('DELETE /api/donations/602bfb7c13e73d625cc0d528', () => {
    it('should return 200 OK', () => {
        return request(app).delete('/api/donations/602bfb7c13e73d625cc0d528')
            .expect(200);
    });
});
