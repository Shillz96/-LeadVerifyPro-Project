const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const Lead = require('../../models/Lead');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

// Mock data
const testUser = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Test User',
  email: 'test@example.com',
  password: '$2b$10$test-hashed-password', // Pre-hashed for test
  role: 'user'
};

const testLeads = [
  {
    address: '123 Test St',
    city: 'Testville',
    state: 'TX',
    zipCode: '12345',
    propertyType: 'residential',
    ownerName: 'John Doe',
    status: 'new',
    userId: testUser._id
  },
  {
    address: '456 Example Ave',
    city: 'Sampletown',
    state: 'CA',
    zipCode: '54321',
    propertyType: 'commercial',
    ownerName: 'Jane Smith',
    status: 'verified',
    userId: testUser._id
  }
];

describe('Lead API Routes', () => {
  let authToken;
  
  // Connect to test database before tests
  beforeAll(async () => {
    // Use in-memory MongoDB for tests
    const testUri = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/leadverifypro-test';
    await mongoose.connect(testUri);
    
    // Create test user and generate token
    await User.create(testUser);
    authToken = jwt.sign(
      { userId: testUser._id, role: testUser.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });
  
  // Clean up after all tests
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });
  
  // Clear leads collection before each test
  beforeEach(async () => {
    await Lead.deleteMany({});
  });
  
  describe('GET /api/leads', () => {
    it('should return a list of leads for authenticated user', async () => {
      // Insert test leads
      await Lead.insertMany(testLeads);
      
      const response = await request(app)
        .get('/api/leads')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].address).toBe(testLeads[0].address);
    });
    
    it('should return 401 if not authenticated', async () => {
      const response = await request(app).get('/api/leads');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
    
    it('should support pagination', async () => {
      // Create additional leads
      const moreLeads = Array.from({ length: 15 }, (_, i) => ({
        address: `${i} Pagination Street`,
        city: 'Testville',
        state: 'TX',
        zipCode: '12345',
        propertyType: 'residential',
        userId: testUser._id
      }));
      
      await Lead.insertMany([...testLeads, ...moreLeads]);
      
      const response = await request(app)
        .get('/api/leads?page=2&limit=5')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(5);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.totalPages).toBe(Math.ceil((testLeads.length + moreLeads.length) / 5));
      expect(response.body.pagination.currentPage).toBe(2);
    });
    
    it('should support filtering by status', async () => {
      await Lead.insertMany(testLeads);
      
      const response = await request(app)
        .get('/api/leads?status=verified')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('verified');
    });
  });
  
  describe('POST /api/leads', () => {
    it('should create a new lead', async () => {
      const newLead = {
        address: '789 New Lead Blvd',
        city: 'Newtown',
        state: 'NY',
        zipCode: '67890',
        propertyType: 'vacant_land',
        ownerName: 'New Owner'
      };
      
      const response = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newLead);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.address).toBe(newLead.address);
      expect(response.body.data.userId.toString()).toBe(testUser._id.toString());
      
      // Verify it was saved to database
      const savedLead = await Lead.findOne({ address: newLead.address });
      expect(savedLead).not.toBeNull();
      expect(savedLead.city).toBe(newLead.city);
    });
    
    it('should return validation errors for invalid input', async () => {
      const invalidLead = {
        // Missing required fields
        address: '',
        city: 'Test'
        // No state, zipCode, propertyType
      };
      
      const response = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidLead);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
  
  describe('GET /api/leads/:id', () => {
    it('should return a single lead by ID', async () => {
      // Create a test lead
      const lead = await Lead.create(testLeads[0]);
      
      const response = await request(app)
        .get(`/api/leads/${lead._id}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.address).toBe(lead.address);
      expect(response.body.data.id).toBe(lead._id.toString());
    });
    
    it('should return 404 for non-existent lead', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/leads/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
    
    it('should return 403 for accessing another user\'s lead', async () => {
      // Create another user
      const anotherUser = await User.create({
        name: 'Another User',
        email: 'another@example.com',
        password: '$2b$10$test-hashed-password',
        role: 'user'
      });
      
      // Create a lead for another user
      const anotherUserLead = await Lead.create({
        ...testLeads[0],
        userId: anotherUser._id
      });
      
      const response = await request(app)
        .get(`/api/leads/${anotherUserLead._id}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('PUT /api/leads/:id', () => {
    it('should update an existing lead', async () => {
      // Create a test lead
      const lead = await Lead.create(testLeads[0]);
      
      const updateData = {
        ownerName: 'Updated Owner',
        status: 'contacted',
        notes: 'This is a test note'
      };
      
      const response = await request(app)
        .put(`/api/leads/${lead._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.ownerName).toBe(updateData.ownerName);
      expect(response.body.data.status).toBe(updateData.status);
      expect(response.body.data.notes).toBe(updateData.notes);
      
      // Verify it was updated in database
      const updatedLead = await Lead.findById(lead._id);
      expect(updatedLead.ownerName).toBe(updateData.ownerName);
    });
  });
  
  describe('DELETE /api/leads/:id', () => {
    it('should delete an existing lead', async () => {
      // Create a test lead
      const lead = await Lead.create(testLeads[0]);
      
      const response = await request(app)
        .delete(`/api/leads/${lead._id}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Verify it was deleted from database
      const deletedLead = await Lead.findById(lead._id);
      expect(deletedLead).toBeNull();
    });
  });
}); 