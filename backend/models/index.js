const mongoose = require('mongoose');
const User = require('./User');
const Complaint = require('./Complaint');
const Notification = require('./Notification');

module.exports = { mongoose, User, Complaint, Notification };
