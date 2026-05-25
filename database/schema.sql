-- CampusConnect MySQL Schema
-- Run this to create the database manually, or use: npm run dev (Sequelize sync will create tables)

CREATE DATABASE IF NOT EXISTS campusconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campusconnect;

-- Users table (Sequelize creates this with sync)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'staff', 'admin') DEFAULT 'student',
  department ENUM('ELECTRICAL', 'PLUMBING', 'HVAC', 'INFRASTRUCTURE', 'CLEANLINESS', 'SECURITY', 'IT_SUPPORT', 'LIBRARY', 'CAFETERIA', 'TRANSPORT', 'GENERAL') DEFAULT 'GENERAL',
  studentId VARCHAR(50),
  phone VARCHAR(20),
  avatar VARCHAR(255),
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaintId VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('ELECTRICAL', 'PLUMBING', 'HVAC', 'INFRASTRUCTURE', 'CLEANLINESS', 'SECURITY', 'IT_SUPPORT', 'LIBRARY', 'CAFETERIA', 'TRANSPORT', 'OTHER') NOT NULL,
  location VARCHAR(255) NOT NULL,
  priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
  priorityScore FLOAT DEFAULT 0.5,
  status ENUM('PENDING', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED') DEFAULT 'PENDING',
  image VARCHAR(255),
  submittedBy INT NOT NULL,
  assignedTo INT,
  assignedDepartment VARCHAR(50),
  timeline JSON,
  slaDeadline DATETIME,
  resolvedAt DATETIME,
  escalationReason TEXT,
  nlpCategory VARCHAR(50),
  nlpPriority VARCHAR(20),
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (submittedBy) REFERENCES users(id),
  FOREIGN KEY (assignedTo) REFERENCES users(id),
  INDEX idx_status_category_priority (status, category, priority),
  INDEX idx_submittedBy (submittedBy),
  INDEX idx_assignedTo (assignedTo),
  INDEX idx_createdAt (createdAt)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  complaintId INT,
  type ENUM('STATUS_CHANGE', 'ASSIGNMENT', 'ESCALATION', 'RESOLUTION', 'REMINDER') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  isRead BOOLEAN DEFAULT FALSE,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (complaintId) REFERENCES complaints(id),
  INDEX idx_user_read (userId, isRead)
);
