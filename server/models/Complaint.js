/**
 * ==========================================
 * Complaint Model - Campus Complaint System
 * ==========================================
 */

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Complaint = sequelize.define('Complaint', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  complaintNumber: {
    type: DataTypes.STRING(20),
    unique: true,
    field: 'complaint_number'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('maintenance', 'electrical', 'plumbing', 'cleaning', 'security', 'other'),
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM('submitted', 'acknowledged', 'in_progress', 'resolved', 'closed'),
    defaultValue: 'submitted'
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  building: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  roomNumber: {
    type: DataTypes.STRING(20),
    field: 'room_number'
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  assignedTo: {
    type: DataTypes.INTEGER,
    field: 'assigned_to'
  },
  assignedDepartment: {
    type: DataTypes.STRING(100),
    field: 'assigned_department'
  },
  resolvedAt: {
    type: DataTypes.DATE,
    field: 'resolved_at'
  },
  closedAt: {
    type: DataTypes.DATE,
    field: 'closed_at'
  },
  rating: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 5
    }
  },
  feedback: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'complaints',
  timestamps: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['status'] },
    { fields: ['category'] },
    { fields: ['priority'] }
  ]
});

// Generate complaint number
Complaint.beforeCreate((complaint) => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  complaint.complaintNumber = `CMP-${timestamp}-${random}`;
});

export default Complaint;

