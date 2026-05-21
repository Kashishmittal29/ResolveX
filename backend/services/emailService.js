/**
 * EMAIL SERVICE
 * =============
 * Handles all email communications for ResolveX events.
 * Uses Nodemailer SMTP transport.
 * 
 * Supported email types:
 * - complaintSubmitted: When student submits a complaint
 * - complaintAssigned: When complaint is assigned to staff
 * - complaintResolved: When complaint status changes to resolved
 * - slaBreached: When complaint exceeds SLA deadline
 * 
 * All sendEmail calls are wrapped in try/catch to ensure email failures
 * don't break the main application flow.
 */

const nodemailer = require('nodemailer');

// Initialize transporter with SMTP config from environment
let transporter;

function initializeTransporter() {
  if (transporter) return transporter;
  
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
}

/**
 * Reusable function to send emails
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlBody - HTML email body
 * @returns {Promise<void>}
 */
async function sendEmail(to, subject, htmlBody) {
  try {
    const transporter = initializeTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@resolvex.edu',
      to,
      subject,
      html: htmlBody,
      // Optional: Add plain text fallback
      text: htmlBody.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' '),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️  Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`⚠️  Email sending failed for ${to}:`, error.message);
    // Don't throw - let the main flow continue even if email fails
    return null;
  }
}

/**
 * Email template: Complaint Submitted
 * Sent to student when they submit a complaint
 */
function getComplaintSubmittedTemplate(complaintData) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; border-radius: 4px; }
          .content { margin: 20px 0; }
          .field { margin: 10px 0; }
          .label { font-weight: bold; color: #666; }
          .button { background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; }
          .footer { color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>✓ Complaint Submitted Successfully</h2>
          </div>
          <div class="content">
            <p>Dear ${complaintData.studentName},</p>
            <p>Thank you for reporting your concern. We have received your complaint and our team will work on resolving it promptly.</p>
            
            <h3>Complaint Details:</h3>
            <div class="field">
              <span class="label">Complaint ID:</span> ${complaintData.complaintId}
            </div>
            <div class="field">
              <span class="label">Title:</span> ${complaintData.title}
            </div>
            <div class="field">
              <span class="label">Category:</span> ${complaintData.category}
            </div>
            <div class="field">
              <span class="label">Priority:</span> ${complaintData.priority}
            </div>
            <div class="field">
              <span class="label">Location:</span> ${complaintData.location}
            </div>
            <div class="field">
              <span class="label">Expected Resolution:</span> ${new Date(complaintData.slaDeadline).toLocaleString()}
            </div>

            <p style="margin-top: 20px;">
              <a href="${process.env.FRONTEND_URL}/complaint/${complaintData.complaintId}" class="button">Track Your Complaint</a>
            </p>

            <p>You will receive email updates whenever there's a status change or assignment update.</p>
          </div>
          <div class="footer">
            <p>ResolveX - Campus Complaint Management System<br>This is an automated message. Please do not reply.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Email template: Complaint Assigned
 * Sent to staff when a complaint is assigned to them
 */
function getComplaintAssignedTemplate(complaintData, staffName) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #FFA500; color: white; padding: 20px; border-radius: 4px; }
          .content { margin: 20px 0; }
          .field { margin: 10px 0; }
          .label { font-weight: bold; color: #666; }
          .button { background: #FFA500; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; }
          .footer { color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📋 New Complaint Assigned to You</h2>
          </div>
          <div class="content">
            <p>Hi ${staffName},</p>
            <p>A new complaint has been assigned to you. Please review and take action as needed.</p>
            
            <h3>Complaint Details:</h3>
            <div class="field">
              <span class="label">Complaint ID:</span> ${complaintData.complaintId}
            </div>
            <div class="field">
              <span class="label">Title:</span> ${complaintData.title}
            </div>
            <div class="field">
              <span class="label">Description:</span> ${complaintData.description}
            </div>
            <div class="field">
              <span class="label">Priority:</span> <strong style="color: #EF4444;">${complaintData.priority}</strong>
            </div>
            <div class="field">
              <span class="label">Location:</span> ${complaintData.location}
            </div>
            <div class="field">
              <span class="label">Submitted By:</span> ${complaintData.submittedByName}
            </div>
            <div class="field">
              <span class="label">SLA Deadline:</span> ${new Date(complaintData.slaDeadline).toLocaleString()}
            </div>

            <p style="margin-top: 20px;">
              <a href="${process.env.FRONTEND_URL}/admin/complaints/${complaintData.id}" class="button">View & Update Complaint</a>
            </p>
          </div>
          <div class="footer">
            <p>ResolveX - Campus Complaint Management System<br>This is an automated message. Please do not reply.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Email template: Complaint Resolved
 * Sent to student when complaint is marked as resolved
 */
function getComplaintResolvedTemplate(complaintData, staffName) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #22C55E; color: white; padding: 20px; border-radius: 4px; }
          .content { margin: 20px 0; }
          .field { margin: 10px 0; }
          .label { font-weight: bold; color: #666; }
          .button { background: #22C55E; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; }
          .footer { color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>✅ Your Complaint Has Been Resolved</h2>
          </div>
          <div class="content">
            <p>Dear ${complaintData.studentName},</p>
            <p>Good news! Your complaint has been resolved by our team.</p>
            
            <h3>Complaint Summary:</h3>
            <div class="field">
              <span class="label">Complaint ID:</span> ${complaintData.complaintId}
            </div>
            <div class="field">
              <span class="label">Title:</span> ${complaintData.title}
            </div>
            <div class="field">
              <span class="label">Resolved By:</span> ${staffName}
            </div>
            <div class="field">
              <span class="label">Resolved At:</span> ${new Date(complaintData.resolvedAt).toLocaleString()}
            </div>

            <p style="margin: 20px 0; padding: 15px; background: #F3F4F6; border-left: 4px solid #22C55E;">
              <strong>Resolution Notes:</strong><br>
              ${complaintData.resolutionNotes || 'No additional notes provided.'}
            </p>

            <p style="margin-top: 20px;">
              <a href="${process.env.FRONTEND_URL}/complaint/${complaintData.complaintId}" class="button">View Full Details</a>
            </p>

            <p>If you have any follow-up concerns, feel free to submit a new complaint.</p>
          </div>
          <div class="footer">
            <p>ResolveX - Campus Complaint Management System<br>This is an automated message. Please do not reply.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Email template: SLA Breached
 * Sent to admin when complaint exceeds SLA deadline
 */
function getSlaBreachedTemplate(complaintData) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #EF4444; color: white; padding: 20px; border-radius: 4px; }
          .content { margin: 20px 0; }
          .field { margin: 10px 0; }
          .label { font-weight: bold; color: #666; }
          .alert { background: #FEE2E2; border: 1px solid #FCA5A5; padding: 15px; border-radius: 4px; margin: 15px 0; }
          .button { background: #EF4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; }
          .footer { color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🚨 SLA Escalation Alert</h2>
          </div>
          <div class="alert">
            ⚠️ A complaint has exceeded its SLA deadline and has been escalated!
          </div>
          <div class="content">
            <p>Administrators,</p>
            <p>This is an automated alert about a complaint that has not been resolved within the SLA timeframe.</p>
            
            <h3>Complaint Details:</h3>
            <div class="field">
              <span class="label">Complaint ID:</span> ${complaintData.complaintId}
            </div>
            <div class="field">
              <span class="label">Title:</span> ${complaintData.title}
            </div>
            <div class="field">
              <span class="label">Category:</span> ${complaintData.category}
            </div>
            <div class="field">
              <span class="label">Priority:</span> <strong style="color: #EF4444;">${complaintData.priority}</strong>
            </div>
            <div class="field">
              <span class="label">Location:</span> ${complaintData.location}
            </div>
            <div class="field">
              <span class="label">Submitted:</span> ${new Date(complaintData.createdAt).toLocaleString()}
            </div>
            <div class="field">
              <span class="label">SLA Deadline Was:</span> ${new Date(complaintData.slaDeadline).toLocaleString()}
            </div>
            <div class="field">
              <span class="label">Days Overdue:</span> <strong>${Math.floor((Date.now() - new Date(complaintData.slaDeadline)) / (1000 * 60 * 60 * 24))} days</strong>
            </div>
            <div class="field">
              <span class="label">Assigned To:</span> ${complaintData.assignedToName || 'Unassigned'}
            </div>
            <div class="field">
              <span class="label">Current Status:</span> ESCALATED
            </div>

            <p style="margin-top: 20px;">
              <a href="${process.env.FRONTEND_URL}/admin/complaints/${complaintData.id}" class="button">Take Action Now</a>
            </p>

            <p>Immediate attention is required to resolve this complaint.</p>
          </div>
          <div class="footer">
            <p>ResolveX - Campus Complaint Management System<br>This is an automated message. Please do not reply.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Export functions
module.exports = {
  sendEmail,
  getComplaintSubmittedTemplate,
  getComplaintAssignedTemplate,
  getComplaintResolvedTemplate,
  getSlaBreachedTemplate,
};
