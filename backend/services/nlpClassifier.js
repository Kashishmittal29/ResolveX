const natural = require('natural');

// Category keywords for classification
const CATEGORY_KEYWORDS = {
  ELECTRICAL: ['light', 'power', 'electricity', 'fuse', 'switch', 'wiring', 'outlet', 'bulb', 'electrical', 'blackout'],
  PLUMBING: ['water', 'leak', 'pipe', 'toilet', 'drain', 'plumbing', 'tap', 'flood', 'sewage', 'bathroom'],
  HVAC: ['ac', 'heating', 'cooling', 'ventilation', 'air conditioner', 'temperature', 'fan', 'climate'],
  INFRASTRUCTURE: ['building', 'ceiling', 'wall', 'floor', 'roof', 'structure', 'crack', 'damage', 'repair'],
  CLEANLINESS: ['clean', 'dirty', 'garbage', 'trash', 'hygiene', 'sanitation', 'mess', 'spill'],
  SECURITY: ['security', 'theft', 'safety', 'lock', 'cctv', 'guard', 'intrusion', 'emergency'],
  IT_SUPPORT: ['internet', 'wifi', 'computer', 'software', 'login', 'network', 'printer', 'it', 'system'],
  LIBRARY: ['book', 'library', 'quiet', 'study', 'resource'],
  CAFETERIA: ['food', 'cafeteria', 'canteen', 'mess', 'dining', 'meal'],
  TRANSPORT: ['bus', 'transport', 'parking', 'vehicle', 'shuttle'],
};

// Priority keywords
const PRIORITY_KEYWORDS = {
  CRITICAL: ['emergency', 'urgent', 'immediate', 'danger', 'fire', 'flood', 'injury', 'critical', 'asap'],
  HIGH: ['important', 'serious', 'broken', 'not working', 'urgent', 'quick'],
  MEDIUM: ['issue', 'problem', 'need', 'please'],
  LOW: ['minor', 'suggestion', 'when possible'],
};

const tokenizer = new natural.WordTokenizer();

function classifyCategory(text) {
  const tokens = tokenizer.tokenize(text.toLowerCase());
  const scores = {};

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    scores[category] = keywords.reduce((score, keyword) => {
      return score + (tokens.some((t) => t.includes(keyword) || keyword.includes(t)) ? 1 : 0);
    }, 0);
  }

  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) return 'OTHER';

  return Object.entries(scores).find(([, s]) => s === maxScore)[0];
}

function classifyPriority(text) {
  const combinedText = text.toLowerCase();
  const tokens = tokenizer.tokenize(combinedText);

  for (const [priority, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
    if (keywords.some((kw) => tokens.some((t) => t.includes(kw)) || combinedText.includes(kw))) {
      return priority;
    }
  }

  return 'MEDIUM';
}

function getPriorityScore(priority) {
  const scores = { CRITICAL: 1, HIGH: 0.75, MEDIUM: 0.5, LOW: 0.25 };
  return scores[priority] || 0.5;
}

function classifyComplaint(title, description) {
  const text = `${title} ${description}`;
  const category = classifyCategory(text);
  const priority = classifyPriority(text);
  const priorityScore = getPriorityScore(priority);

  return {
    category,
    priority,
    priorityScore,
  };
}

module.exports = { classifyComplaint, classifyCategory, classifyPriority };
