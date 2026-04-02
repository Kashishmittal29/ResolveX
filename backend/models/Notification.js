const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define(
    'Notification',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
      complaintId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'complaints', key: 'id' },
      },
      type: {
        type: DataTypes.ENUM('STATUS_CHANGE', 'ASSIGNMENT', 'ESCALATION', 'RESOLUTION', 'REMINDER'),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'notifications',
      timestamps: true,
      indexes: [{ fields: ['userId', 'isRead'] }],
    }
  );

  Notification.prototype.toJSON = function () {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  };

  return Notification;
};
