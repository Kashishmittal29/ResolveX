/**
 * JEST TEST SETUP
 * ===============
 * Initializes test environment and mocks for integration tests.
 * Runs before all tests.
 */

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_12345';
process.env.JWT_EXPIRE = '7d';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || 3306;
process.env.DB_NAME = process.env.DB_NAME || 'campusconnect_test';
process.env.DB_USER = process.env.DB_USER || 'root';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'root';

// Mock Sequelize logging in tests
jest.mock('../config/db', () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(undefined),
    sync: jest.fn().mockResolvedValue(undefined),
    query: jest.fn().mockResolvedValue([[], {}]),
    transaction: jest.fn((cb) => cb({ commit: jest.fn(), rollback: jest.fn() })),
    define: jest.fn(),
  },
  connectDB: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../config/firebase', () => ({
  initializeFirebase: jest.fn().mockReturnValue({ db: null, admin: null }),
  getFirestore: jest.fn().mockReturnValue(null),
  getAdmin: jest.fn().mockReturnValue(null),
}));

// Mock email service in tests (don't send real emails)
jest.mock('../services/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue({ messageId: 'test-msg-id' }),
  getComplaintSubmittedTemplate: jest.fn().mockReturnValue('<html>Test</html>'),
  getComplaintAssignedTemplate: jest.fn().mockReturnValue('<html>Test</html>'),
  getComplaintResolvedTemplate: jest.fn().mockReturnValue('<html>Test</html>'),
  getSlaBreachedTemplate: jest.fn().mockReturnValue('<html>Test</html>'),
}));

// Suppress console output in tests (optional)
const originalLog = console.log;
const originalError = console.error;

beforeAll(() => {
  // Uncomment if you want to suppress logs during tests
  // console.log = jest.fn();
  // console.error = jest.fn();
});

afterAll(() => {
  console.log = originalLog;
  console.error = originalError;
});
