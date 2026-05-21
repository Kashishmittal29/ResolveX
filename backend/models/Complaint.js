const mongoose = require('mongoose');

const TimelineSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    default: '',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const ComplaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: [
      'ELECTRICAL', 'PLUMBING', 'HVAC', 'INFRASTRUCTURE', 'CLEANLINESS',
      'SECURITY', 'IT_SUPPORT', 'LIBRARY', 'CAFETERIA', 'TRANSPORT', 'OTHER'
    ],
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM',
  },
  priorityScore: {
    type: Number,
    default: 0.5,
  },
  status: {
    type: String,
    enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED'],
    default: 'PENDING',
  },
  image: {
    type: String,
    default: null,
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  assignedDepartment: {
    type: String,
    default: null,
  },
  timeline: {
    type: [TimelineSchema],
    default: [],
  },
  slaDeadline: {
    type: Date,
    default: null,
  },
  resolvedAt: {
    type: Date,
    default: null,
  },
  escalationReason: {
    type: String,
    default: null,
  },
  nlpCategory: {
    type: String,
    default: null,
  },
  nlpPriority: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      ret._id = ret._id.toString();
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      ret._id = ret._id.toString();
      return ret;
    }
  }
});

// Indexes for query performance
ComplaintSchema.index({ status: 1, category: 1, priority: 1 });
ComplaintSchema.index({ submittedBy: 1 });
ComplaintSchema.index({ assignedTo: 1 });
ComplaintSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Complaint', ComplaintSchema);
