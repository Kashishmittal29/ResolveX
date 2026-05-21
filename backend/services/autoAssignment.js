const { User, Complaint } = require('../models');

const DEPARTMENT_MAP = {
  ELECTRICAL: 'ELECTRICAL', PLUMBING: 'PLUMBING', HVAC: 'HVAC', INFRASTRUCTURE: 'INFRASTRUCTURE',
  CLEANLINESS: 'CLEANLINESS', SECURITY: 'SECURITY', IT_SUPPORT: 'IT_SUPPORT', LIBRARY: 'LIBRARY',
  CAFETERIA: 'CAFETERIA', TRANSPORT: 'TRANSPORT', OTHER: 'GENERAL',
};

async function getStaffWorkload() {
  const results = await Complaint.aggregate([
    {
      $match: {
        status: { $in: ['PENDING', 'IN_PROGRESS'] },
        assignedTo: { $ne: null }
      }
    },
    {
      $group: {
        _id: '$assignedTo',
        count: { $sum: 1 }
      }
    }
  ]);
  return Object.fromEntries(results.map((r) => [String(r._id), r.count]));
}

async function findBestStaff(category, priority) {
  const department = DEPARTMENT_MAP[category] || 'GENERAL';
  let staff = await User.find({
    role: 'staff',
    isActive: true,
    department
  }).select('id name department');

  if (staff.length === 0) {
    staff = await User.find({
      role: 'staff',
      isActive: true,
      department: 'GENERAL'
    }).select('id name department');
  }
  if (staff.length === 0) return null;

  return selectByWorkload(staff, await getStaffWorkload(), priority);
}

function selectByWorkload(staffList, workload, priority) {
  const priorityWeight = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
  const weight = priorityWeight[priority] || 2;

  const scored = staffList.map((s) => {
    const currentLoad = workload[String(s._id)] || 0;
    const score = 100 - currentLoad * 10 + weight * 5;
    return { staff: s, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.staff || null;
}

async function autoAssignComplaint(complaint) {
  const staff = await findBestStaff(complaint.category, complaint.priority);
  if (staff) {
    complaint.assignedTo = staff._id;
    complaint.assignedDepartment = staff.department;
    complaint.status = 'IN_PROGRESS';
    return { assigned: true, staff };
  }
  complaint.assignedDepartment = DEPARTMENT_MAP[complaint.category] || 'GENERAL';
  return { assigned: false };
}

module.exports = { autoAssignComplaint, findBestStaff };
