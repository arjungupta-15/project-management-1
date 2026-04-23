import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail App Password
    }
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.log("CRITICAL: Transporter verify error:", error.message);
    } else {
        console.log("Email server is ready to send messages!");
    }
});

export const sendTaskAssignedEmail = async ({ toEmail, toName, taskTitle, projectName, assignedBy, dueDate }) => {
    try {
        await transporter.sendMail({
            from: `"Project Manager" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: `New Task Assigned: ${taskTitle}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #3b82f6;">New Task Assigned to You</h2>
                    <p>Hi <strong>${toName}</strong>,</p>
                    <p>A new task has been assigned to you:</p>
                    <div style="background: #f3f4f6; padding: 16px; border-radius: 6px; margin: 16px 0;">
                        <p style="margin: 4px 0;"><strong>Task:</strong> ${taskTitle}</p>
                        <p style="margin: 4px 0;"><strong>Project:</strong> ${projectName}</p>
                        <p style="margin: 4px 0;"><strong>Assigned by:</strong> ${assignedBy}</p>
                        ${dueDate ? `<p style="margin: 4px 0;"><strong>Due Date:</strong> ${new Date(dueDate).toDateString()}</p>` : ''}
                    </div>
                    <p>Login to your project management app to view the task details.</p>
                </div>
            `
        });
        console.log(`Task assignment email sent to ${toEmail}`);
    } catch (error) {
        console.error('Email send failed:', error.message);
    }
};

export const sendTaskCompletedEmail = async ({ toEmail, toName, taskTitle, projectName, completedBy }) => {
    try {
        await transporter.sendMail({
            from: `"Project Manager" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: `✅ Task Completed: ${taskTitle}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #10b981;">Task Completed ✅</h2>
                    <p>Hi <strong>${toName}</strong>,</p>
                    <p>A task has been marked as completed:</p>
                    <div style="background: #f0fdf4; padding: 16px; border-radius: 6px; margin: 16px 0; border-left: 4px solid #10b981;">
                        <p style="margin: 4px 0;"><strong>Task:</strong> ${taskTitle}</p>
                        <p style="margin: 4px 0;"><strong>Project:</strong> ${projectName}</p>
                        <p style="margin: 4px 0;"><strong>Completed by:</strong> ${completedBy}</p>
                        <p style="margin: 4px 0;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                    <p>Login to your project management app to view the project progress.</p>
                </div>
            `
        });
        console.log(`Task completion email sent to ${toEmail}`);
    } catch (error) {
        console.error('Email send failed:', error.message);
    }
};

export const sendWorkspaceInviteEmail = async ({ toEmail, workspaceName, invitedBy, inviteLink }) => {
    try {
        console.log(`Attempting to send invite email to ${toEmail}...`);
        const info = await transporter.sendMail({
            from: `"Project Manager" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: `You've been invited to ${workspaceName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #3b82f6;">Workspace Invitation</h2>
                    <p><strong>${invitedBy}</strong> has invited you to join <strong>${workspaceName}</strong>.</p>
                    <p>Click the button below to accept the invitation and securely join the workspace.</p>
                    <a href="${inviteLink}" style="display: inline-block; margin-top: 16px; padding: 10px 20px; background: #3b82f6; color: white; border-radius: 6px; text-decoration: none;">
                        Accept Invitation
                    </a>
                </div>
            `
        });
        console.log(`Invite email sent successfully: ${info.messageId}`);
    } catch (error) {
        console.error('CRITICAL: Email send failed!');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        if (error.code === 'EAUTH') {
            console.error('Authentication failed. Check your EMAIL_USER and EMAIL_PASS (App Password).');
        }
    }
};

export const sendOverdueTaskEmail = async ({ toEmail, toName, taskTitle, projectName, dueDate }) => {
    try {
        await transporter.sendMail({
            from: `"Project Manager" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: `⚠️ Task Overdue: ${taskTitle}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #ef4444;">Task Overdue ⚠️</h2>
                    <p>Hi <strong>${toName}</strong>,</p>
                    <p>Your assigned task is <strong style="color: #ef4444;">overdue</strong> and has not been completed yet.</p>
                    <div style="background: #fef2f2; padding: 16px; border-radius: 6px; margin: 16px 0; border-left: 4px solid #ef4444;">
                        <p style="margin: 4px 0;"><strong>Task:</strong> ${taskTitle}</p>
                        <p style="margin: 4px 0;"><strong>Project:</strong> ${projectName}</p>
                        <p style="margin: 4px 0;"><strong>Due Date:</strong> ${new Date(dueDate).toDateString()}</p>
                    </div>
                    <p style="color: #ef4444;"><strong>Warning:</strong> If this task is not completed soon, further action may be taken.</p>
                    <p>Please login and complete your task immediately.</p>
                    <a href="http://localhost:5173" style="display: inline-block; margin-top: 16px; padding: 10px 20px; background: #ef4444; color: white; border-radius: 6px; text-decoration: none;">
                        Open App
                    </a>
                </div>
            `
        });
        console.log(`Overdue email sent to ${toEmail}`);
    } catch (error) {
        console.error('Overdue email failed:', error.message);
    }
};
