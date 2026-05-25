/**
 * AUTH TESTS
 * ==========
 * Unit tests for password hashing and comparison
 * Integration tests for authentication endpoints
 */

const request = require('supertest');
const bcrypt = require('bcryptjs');

const app = require('./testApp');

jest.mock('../models', () => {
  const selectMock = jest.fn();
  const mockUser = {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn().mockReturnValue({ select: selectMock }),
  };
  return {
    User: mockUser,
    Complaint: {
      find: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      }),
      findById: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis(),
      }),
      create: jest.fn()
    },
    Notification: { create: jest.fn() }
  };
});

const { User } = require('../models');

beforeEach(() => {
  User.findById.mockImplementation((id) => ({
    select: jest.fn().mockResolvedValue(
      id === '1' || id === 1 ? { _id: '1', id: '1', name: 'Test Student', email: 'test@campusconnect.edu', role: 'student', isActive: true } : null
    )
  }));
});

describe('Auth - Unit Tests', () => {
  describe('Password Hashing', () => {
    test('should hash password with bcrypt', async () => {
      const password = 'testPassword123';
      const hashedPassword = await bcrypt.hash(password, 12);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(password.length);
    });

    test('should generate different hashes for same password (bcrypt salt)', async () => {
      const password = 'testPassword123';
      const hash1 = await bcrypt.hash(password, 12);
      const hash2 = await bcrypt.hash(password, 12);
      
      expect(hash1).not.toBe(hash2); // Different salts
      expect(await bcrypt.compare(password, hash1)).toBe(true);
      expect(await bcrypt.compare(password, hash2)).toBe(true);
    });

    test('comparePassword should work correctly', async () => {
      const password = 'studentPassword456';
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const match = await bcrypt.compare(password, hashedPassword);
      const noMatch = await bcrypt.compare('wrongPassword', hashedPassword);
      
      expect(match).toBe(true);
      expect(noMatch).toBe(false);
    });
  });

  describe('JWT Token Generation', () => {
    test('should generate valid JWT token', () => {
      const jwt = require('jsonwebtoken');
      const userId = '1';
      const secret = 'test_secret';
      
      const token = jwt.sign({ id: userId }, secret, { expiresIn: '7d' });
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    test('should decode valid token correctly', () => {
      const jwt = require('jsonwebtoken');
      const userId = '5';
      const secret = 'test_secret';
      
      const token = jwt.sign({ id: userId }, secret, { expiresIn: '7d' });
      const decoded = jwt.verify(token, secret);
      
      expect(decoded.id).toBe(userId);
    });

    test('should reject invalid token', () => {
      const jwt = require('jsonwebtoken');
      const secret = 'test_secret';
      const wrongSecret = 'wrong_secret';
      
      const token = jwt.sign({ id: '1' }, secret);
      
      expect(() => {
        jwt.verify(token, wrongSecret);
      }).toThrow();
    });

    test('should reject expired token', () => {
      const jwt = require('jsonwebtoken');
      const secret = 'test_secret';
      
      const token = jwt.sign({ id: '1' }, secret, { expiresIn: '1ms' });
      
      // Wait for token to expire
      return new Promise((resolve) => {
        setTimeout(() => {
          expect(() => {
            jwt.verify(token, secret);
          }).toThrow();
          resolve();
        }, 10);
      });
    });
  });
});

describe('Auth - Integration Tests', () => {
  test('POST /api/auth/register should return 201 with token', async () => {
    User.findOne.mockResolvedValue(null);  // email not taken
    User.create.mockResolvedValue({
      _id: '1', id: '1', name: 'Test Student', email: 'test@campusconnect.edu',
      role: 'student', studentId: 'CS001',
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test Student', email: 'test@campusconnect.edu', password: 'Pass123!', role: 'student', studentId: 'CS001' });

    if (res.status === 500) console.error(res.body);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  test('POST /api/auth/login with invalid credentials should return 401', async () => {
    User.findOne.mockResolvedValue(null);  // user not found

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrong@campusconnect.edu', password: 'wrongpass' });

    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me without token should return 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
