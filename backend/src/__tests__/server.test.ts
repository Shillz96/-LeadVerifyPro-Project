import request from 'supertest';
import app from '../server';

describe('Server', () => {
  describe('GET /', () => {
    it('should return welcome message', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Welcome to LeadVerifyPro API');
      expect(response.body).toHaveProperty('status', 'Server is running');
      expect(response.body).toHaveProperty('databaseConnected');
    });
  });

  describe('404 Handler', () => {
    it('should handle unknown routes', async () => {
      const response = await request(app).get('/unknown-route');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Route not found: /unknown-route');
    });
  });
}); 