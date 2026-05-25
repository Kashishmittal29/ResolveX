require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('../models');

async function updateEmails() {
  const plumbingEmail = process.argv[2];
  const electricalEmail = process.argv[3];

  if (!plumbingEmail && !electricalEmail) {
    console.log('Usage: node scripts/updateStaffEmails.js <plumbing_email> <electrical_email>');
    console.log('Example: node scripts/updateStaffEmails.js plumbing@myemail.com electrical@myemail.com');
    process.exit(1);
  }

  try {
    const connStr = process.env.MONGODB_URI || 
                    process.env.MONGO_URI || 
                    'mongodb://127.0.0.1:27017/campusconnect';

    await mongoose.connect(connStr);
    console.log('Connected to MongoDB');

    if (plumbingEmail) {
      const formattedEmail = plumbingEmail.trim().toLowerCase();
      // Try to find the user first
      let user = await User.findOne({ email: formattedEmail });
      if (user) {
        user.role = 'staff';
        user.department = 'PLUMBING';
        await user.save();
        console.log(`Updated existing user (${formattedEmail}) to PLUMBING staff role.`);
      } else {
        // Find existing plumbing staff and change their email, or create a new one
        const plumbingStaff = await User.findOne({ role: 'staff', department: 'PLUMBING' });
        if (plumbingStaff) {
          plumbingStaff.email = formattedEmail;
          await plumbingStaff.save();
          console.log(`Updated existing PLUMBING staff email to: ${formattedEmail}`);
        } else {
          await User.create({
            name: 'Plumbing Staff',
            email: formattedEmail,
            password: 'staff123',
            role: 'staff',
            department: 'PLUMBING'
          });
          console.log(`Created new PLUMBING staff user: ${formattedEmail}`);
        }
      }
    }

    if (electricalEmail) {
      const formattedEmail = electricalEmail.trim().toLowerCase();
      // Try to find the user first
      let user = await User.findOne({ email: formattedEmail });
      if (user) {
        user.role = 'staff';
        user.department = 'ELECTRICAL';
        await user.save();
        console.log(`Updated existing user (${formattedEmail}) to ELECTRICAL staff role.`);
      } else {
        // Find existing electrical staff and change their email, or create a new one
        const electricalStaff = await User.findOne({ role: 'staff', department: 'ELECTRICAL' });
        if (electricalStaff) {
          electricalStaff.email = formattedEmail;
          await electricalStaff.save();
          console.log(`Updated existing ELECTRICAL staff email to: ${formattedEmail}`);
        } else {
          await User.create({
            name: 'Electrical Staff',
            email: formattedEmail,
            password: 'staff123',
            role: 'staff',
            department: 'ELECTRICAL'
          });
          console.log(`Created new ELECTRICAL staff user: ${formattedEmail}`);
        }
      }
    }

    console.log('\nUpdated user list:');
    const users = await User.find({ role: 'staff' }).select('name email role department');
    console.log(JSON.stringify(users, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Update failed:', error);
    process.exit(1);
  }
}

updateEmails();
