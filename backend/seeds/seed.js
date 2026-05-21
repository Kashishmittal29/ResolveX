require('dotenv').config();
const mongoose = require('mongoose');
const { User, Complaint } = require('../models');

const users = [
  { name: 'Admin User', email: 'admin@resolvex.edu', password: 'admin123', role: 'admin', department: 'GENERAL' },
  { name: 'Kritika', email: 'Kritikarupesh1234@gmail.com', password: 'staff123', role: 'staff', department: 'ELECTRICAL' },
  { name: 'Nikhil', email: 'Nikhildhimam574@gmail.com', password: 'staff123', role: 'staff', department: 'PLUMBING' },
  { name: 'Alice Student', email: 'student@resolvex.edu', password: 'student123', role: 'student', studentId: 'STU001' },
  { name: 'Bob Student', email: 'bob@resolvex.edu', password: 'student123', role: 'student', studentId: 'STU002' },
];

const complaintTemplates = [
  { title: 'Lights not working in Block A', description: 'All lights in the corridor of Block A, 2nd floor are not working. It has been dark for 2 days.', category: 'ELECTRICAL', location: 'Block A, 2nd Floor', priority: 'HIGH' },
  { title: 'Water leakage in bathroom', description: 'There is a severe water leak from the ceiling in the common bathroom. Urgent repair needed.', category: 'PLUMBING', location: 'Hostel B, Ground Floor', priority: 'HIGH' },
  { title: 'AC not cooling', description: 'The air conditioner in the library is not cooling properly. Temperature is very high.', category: 'HVAC', location: 'Central Library', priority: 'MEDIUM' },
  { title: 'WiFi not connecting', description: 'Unable to connect to campus WiFi in the computer lab. Need IT support urgently for online exam.', category: 'IT_SUPPORT', location: 'Computer Lab 3', priority: 'CRITICAL' },
  { title: 'Broken window', description: 'Window pane in room 205 is broken. Need replacement.', category: 'INFRASTRUCTURE', location: 'Hostel A, Room 205', priority: 'LOW' },
];

async function seed() {
  try {
    const connStr = process.env.MONGODB_URI || 
                    process.env.MONGO_URI || 
                    'mongodb://atlas-sql-69ac545a7f876f9874ec4caf-4g1lbm.a.query.mongodb.net/resolvex?ssl=true&authSource=admin';

    await mongoose.connect(connStr);
    console.log('Connected to MongoDB');

    await Complaint.deleteMany({});
    await User.deleteMany({});

    const createdUsers = [];
    for (const u of users) {
      const user = new User(u);
      await user.save();
      createdUsers.push(user);
    }

    const admin = createdUsers.find((u) => u.role === 'admin');
    const staffElec = createdUsers.find((u) => u.department === 'ELECTRICAL');
    const staffPlumb = createdUsers.find((u) => u.department === 'PLUMBING');
    const student1 = createdUsers.find((u) => u.email === 'student@resolvex.edu');
    const student2 = createdUsers.find((u) => u.email === 'bob@resolvex.edu');

    const statuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED'];
    const complaints = [];

    for (let i = 0; i < complaintTemplates.length; i++) {
      const t = complaintTemplates[i];
      const status = statuses[i % 4];
      const submittedBy = i % 2 === 0 ? student1._id : student2._id;
      const assignedTo = t.category === 'ELECTRICAL' ? staffElec._id : staffPlumb._id;
      const sla = new Date();
      sla.setHours(sla.getHours() + 24);

      const timeline = [{ status: 'PENDING', note: 'Complaint submitted', updatedBy: submittedBy, timestamp: new Date() }];
      if (status !== 'PENDING') {
        timeline.push({ status, note: status === 'RESOLVED' ? 'Resolved' : 'In progress', updatedBy: assignedTo, timestamp: new Date() });
      }

      complaints.push({
        complaintId: `RX-SEED-${1000 + i}`,
        title: t.title,
        description: t.description,
        category: t.category,
        location: t.location,
        priority: t.priority,
        status,
        submittedBy,
        assignedTo: status !== 'PENDING' ? assignedTo : null,
        assignedDepartment: t.category === 'ELECTRICAL' ? 'ELECTRICAL' : 'PLUMBING',
        slaDeadline: sla,
        resolvedAt: status === 'RESOLVED' ? new Date() : null,
        timeline,
      });
    }

    await Complaint.insertMany(complaints);

    console.log('Seed completed successfully!');
    console.log('\nSample credentials:');
    console.log('Admin: admin@resolvex.edu / admin123');
    console.log('Staff (Electrical): Kritikarupesh1234@gmail.com / staff123');
    console.log('Staff (Plumbing): Nikhil / staff123 (email: Nikhildhimam574@gmail.com)');
    console.log('Student: student@resolvex.edu / student123');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
