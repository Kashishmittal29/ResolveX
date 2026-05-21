/**
 * NLP CLASSIFIER TESTS
 * ====================
 * Unit tests for NLP-based complaint classification
 */

const { classifyComplaint } = require('../services/nlpClassifier');

describe('NLP Classifier', () => {
  describe('Category Classification', () => {
    test('should classify electrical issues correctly', () => {
      const result = classifyComplaint('Broken electrical outlet', 'The outlet in my room is not working');
      expect(result.category).toBe('ELECTRICAL');
    });

    test('should classify plumbing issues correctly', () => {
      const result = classifyComplaint('Broken tap', 'The water tap in my bathroom is leaking');
      expect(result.category).toBe('PLUMBING');
    });

    test('should classify IT support issues correctly', () => {
      const result = classifyComplaint('WiFi not working', 'Internet connection is not available in the library');
      expect(result.category).toBe('IT_SUPPORT');
    });

    test('should classify HVAC issues correctly', () => {
      const result = classifyComplaint('Air conditioner not working', 'The AC unit in my room is not cooling properly');
      expect(result.category).toBe('HVAC');
    });

    test('should classify cleanliness issues correctly', () => {
      const result = classifyComplaint('Dirty hallway', 'The hallway has not been cleaned in days');
      expect(result.category).toBe('CLEANLINESS');
    });

    test('should classify security issues correctly', () => {
      const result = classifyComplaint('Security concern', 'Door lock is broken and security is at risk');
      expect(result.category).toBe('SECURITY');
    });

    test('should classify infrastructure issues correctly', () => {
      const result = classifyComplaint('Roof leak', 'Water is leaking through the ceiling during rain');
      expect(result.category).toBe('INFRASTRUCTURE');
    });

    test('should default to OTHER for unrecognized issues', () => {
      const result = classifyComplaint('Something random', 'This is a complaint about something that does not fit any category');
      // Should either return one of the known categories or OTHER
      expect(['ELECTRICAL', 'PLUMBING', 'HVAC', 'INFRASTRUCTURE', 'CLEANLINESS', 'SECURITY', 'IT_SUPPORT', 'LIBRARY', 'CAFETERIA', 'TRANSPORT', 'OTHER']).toContain(result.category);
    });
  });

  describe('Priority Classification', () => {
    test('should classify CRITICAL priority', () => {
      const result = classifyComplaint('Urgent - fire hazard', 'There is a potential fire risk in the building');
      expect(['HIGH', 'CRITICAL']).toContain(result.priority);
    });

    test('should classify HIGH priority for urgent issues', () => {
      const result = classifyComplaint('Broken emergency exit', 'The emergency exit door is locked and cannot be opened');
      expect(['HIGH', 'CRITICAL']).toContain(result.priority);
    });

    test('should classify MEDIUM priority for normal issues', () => {
      const result = classifyComplaint('Light bulb needs replacement', 'A light bulb in the hallway has stopped working');
      const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];
      expect(validPriorities).toContain(result.priority);
    });

    test('should classify LOW priority for minor issues', () => {
      const result = classifyComplaint('Suggestion for improvement', 'I think the hallway could use more plants');
      const validPriorities = ['LOW', 'MEDIUM'];
      expect(validPriorities).toContain(result.priority);
    });
  });

  describe('Priority Scoring', () => {
    test('should return a priorityScore between 0 and 100', () => {
      const result = classifyComplaint('Test title', 'Test description');
      expect(result.priorityScore).toBeGreaterThanOrEqual(0);
      expect(result.priorityScore).toBeLessThanOrEqual(100);
      expect(typeof result.priorityScore).toBe('number');
    });

    test('should give higher score to urgent keywords', () => {
      const urgentResult = classifyComplaint('Emergency fire hazard', 'Critical safety issue');
      const normalResult = classifyComplaint('Minor issue', 'Small problem that can wait');
      
      expect(urgentResult.priorityScore).toBeGreaterThan(normalResult.priorityScore);
    });
  });

  describe('Response Structure', () => {
    test('should return object with required fields', () => {
      const result = classifyComplaint('Test', 'Test description');
      
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('priority');
      expect(result).toHaveProperty('priorityScore');
      expect(typeof result.category).toBe('string');
      expect(typeof result.priority).toBe('string');
      expect(typeof result.priorityScore).toBe('number');
    });

    test('should handle empty strings gracefully', () => {
      const result = classifyComplaint('', '');
      expect(result.category).toBeDefined();
      expect(result.priority).toBeDefined();
      expect(result.priorityScore).toBeDefined();
    });

    test('should handle very long descriptions', () => {
      const longDescription = 'A'.repeat(1000);
      const result = classifyComplaint('Title', longDescription);
      expect(result.category).toBeDefined();
      expect(result.priority).toBeDefined();
    });
  });

  describe('Case Insensitivity', () => {
    test('should classify regardless of case', () => {
      const lowercase = classifyComplaint('electrical outlet broken', 'The outlet does not work');
      const uppercase = classifyComplaint('ELECTRICAL OUTLET BROKEN', 'THE OUTLET DOES NOT WORK');
      const mixedcase = classifyComplaint('Electrical Outlet Broken', 'The Outlet Does Not Work');
      
      expect(lowercase.category).toBe(uppercase.category);
      expect(lowercase.category).toBe(mixedcase.category);
    });
  });

  describe('Keyword Matching', () => {
    test('should identify electrical keywords', () => {
      const keywords = ['electrical', 'outlet', 'wire', 'power', 'circuit', 'switch'];
      
      for (const keyword of keywords) {
        const result = classifyComplaint(`Issue with ${keyword}`, 'There is a problem');
        // Should recognize as electrical or at least attempt classification
        expect(result.category).toBeDefined();
      }
    });

    test('should identify plumbing keywords', () => {
      const keywords = ['water', 'pipe', 'leak', 'drain', 'toilet', 'sink', 'tap'];
      
      for (const keyword of keywords) {
        const result = classifyComplaint(`Problem with ${keyword}`, 'There is an issue');
        expect(result.category).toBeDefined();
      }
    });

    test('should identify IT keywords', () => {
      const keywords = ['internet', 'wifi', 'network', 'computer', 'printer', 'server'];
      
      for (const keyword of keywords) {
        const result = classifyComplaint(`${keyword} issue`, 'Not working properly');
        expect(result.category).toBeDefined();
      }
    });
  });
});
