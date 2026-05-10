/**
 * COMPLAINTS TESTS
 * ================
 * Integration tests for complaint endpoints
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('./testApp');

jest.mock('../models', () => {
  const mockUser = {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
  };
  return { User: mockUser, Complaint: { findAndCountAll: jest.fn(), findByPk: jest.fn(), create: jest.fn() }, Notification: { create: jest.fn() } };
});

const { Complaint, User } = require('../models');

const studentToken = jwt.sign({ id: 1 }, process.env.JWT_SECRET || 'test_jwt_secret_key_12345', { expiresIn: '1d' });
const adminToken = jwt.sign({ id: 2 }, process.env.JWT_SECRET || 'test_jwt_secret_key_12345', { expiresIn: '1d' });

// Mock User.findByPk for auth middleware
beforeEach(() => {
  User.findByPk.mockImplementation((id) => {
    if (id === 1) return Promise.resolve({ id: 1, name: 'Student', email: 's@test.edu', role: 'student', isActive: true });
    if (id === 2) return Promise.resolve({ id: 2, name: 'Admin', email: 'a@test.edu', role: 'admin', isActive: true });
    return Promise.resolve(null);
  });
});

describe('Complaints - Integration Tests', () => {
  test('GET /api/complaints without token should return 401', async () => {
    const res = await request(app).get('/api/complaints');
    expect(res.status).toBe(401);
  });

  test('GET /api/complaints as student should return 200', async () => {
    Complaint.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
    const res = await request(app)
      .get('/api/complaints')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.complaints)).toBe(true);
  });
});
