const { sequelize } = require('../config/db');
const User = require('./User')(sequelize);
const Complaint = require('./Complaint')(sequelize);
const Notification = require('./Notification')(sequelize);

// Associations
User.hasMany(Complaint, { foreignKey: 'submittedBy' });
Complaint.belongsTo(User, { foreignKey: 'submittedBy', as: 'submittedByUser' });
User.hasMany(Complaint, { foreignKey: 'assignedTo' });
Complaint.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignedToUser' });
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });
Complaint.hasMany(Notification, { foreignKey: 'complaintId' });
Notification.belongsTo(Complaint, { foreignKey: 'complaintId' });

module.exports = { sequelize, User, Complaint, Notification };
