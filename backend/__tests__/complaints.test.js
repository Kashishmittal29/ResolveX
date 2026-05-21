/**
 * COMPLAINTS TESTS
 * ================
 * Integration tests for complaint endpoints
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('./testApp');

jest.mock('../models', () => {
  const selectMock = jest.fn();
  const mockUser = {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn().mockReturnValue({ select: selectMock }),
  };

  const populateMock = jest.fn().mockReturnThis();
  const sortMock = jest.fn().mockReturnThis();
  const skipMock = jest.fn().mockReturnThis();
  const limitMock = jest.fn().mockResolvedValue([]);

  const mockComplaint = {
    find: jest.fn().mockReturnValue({
      populate: populateMock,
      sort: sortMock,
      skip: skipMock,
      limit: limitMock,
    }),
    countDocuments: jest.fn().mockResolvedValue(0),
    findById: jest.fn().mockReturnValue({
      populate: populateMock,
    }),
    create: jest.fn(),
  };

  return { User: mockUser, Complaint: mockComplaint, Notification: { create: jest.fn() } };
});

const { Complaint, User } = require('../models');

const studentToken = jwt.sign({ id: '1' }, process.env.JWT_SECRET || 'test_jwt_secret_key_12345', { expiresIn: '1d' });
const adminToken = jwt.sign({ id: '2' }, process.env.JWT_SECRET || 'test_jwt_secret_key_12345', { expiresIn: '1d' });

// Mock User.findById for auth middleware
beforeEach(() => {
  User.findById.mockImplementation((id) => ({
    select: jest.fn().mockResolvedValue(
      id === '1' || id === 1 ? { _id: '1', id: '1', name: 'Student', email: 's@test.edu', role: 'student', isActive: true } :
      id === '2' || id === 2 ? { _id: '2', id: '2', name: 'Admin', email: 'a@test.edu', role: 'admin', isActive: true } :
      null
    )
  }));
});

describe('Complaints - Integration Tests', () => {
  test('GET /api/complaints without token should return 401', async () => {
    const res = await request(app).get('/api/complaints');
    expect(res.status).toBe(401);
  });

  test('GET /api/complaints as student should return 200', async () => {
    const res = await request(app)
      .get('/api/complaints')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.complaints)).toBe(true);
  });
});
