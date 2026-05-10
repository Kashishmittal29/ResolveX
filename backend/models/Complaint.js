const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Complaint = sequelize.define(
    'Complaint',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      complaintId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      category: {
        type: DataTypes.ENUM(
          'ELECTRICAL', 'PLUMBING', 'HVAC', 'INFRASTRUCTURE', 'CLEANLINESS',
          'SECURITY', 'IT_SUPPORT', 'LIBRARY', 'CAFETERIA', 'TRANSPORT', 'OTHER'
        ),
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      priority: {
        type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
        defaultValue: 'MEDIUM',
      },
      priorityScore: {
        type: DataTypes.FLOAT,
        defaultValue: 0.5,
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED'),
        defaultValue: 'PENDING',
      },
      image: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      submittedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
      assignedTo: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
      },
      assignedDepartment: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      timeline: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      slaDeadline: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      resolvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      escalationReason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      nlpCategory: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      nlpPriority: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
    },
    {
      tableName: 'complaints',
      timestamps: true,
      indexes: [
        { fields: ['status', 'category', 'priority'] },
        { fields: ['submittedBy'] },
        { fields: ['assignedTo'] },
        { fields: ['createdAt'] },
      ],
    }
  );

  Complaint.prototype.toJSON = function () {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  };

  return Complaint;
};
