import dotenv from 'dotenv';
dotenv.config();

const SENDER_EMAIL = process.env.EMAIL_USER;
const SENDER_NAME = "Project Manager";

export const sendOTPEmail = async ({ toEmail, otp }) => {
    try {
        console.log(`Sending OTP to: ${toEmail} via Brevo HTTP API...`);
        
        if (!process.env.BREVO_API_KEY) {
            throw new Error("BREVO_API_KEY is missing");
        }

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: SENDER_NAME, email: SENDER_EMAIL },
                to: [{ email: toEmail }],
                subject: "Email Verification OTP",
                htmlContent: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                        <h2 style="color: #3b82f6; text-align: center;">Verification Code</h2>
                        <p>Use the following OTP to verify your email address:</p>
                        <div style="background: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
                            <h1 style="letter-spacing: 5px; font-size: 32px; color: #111; margin: 0;">${otp}</h1>
                        </div>
                        <p>This code will expire in 5 minutes.</p>
                    </div>
                `
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to send email');
        }

        console.log('OTP sent successfully via Brevo API. ID:', data.messageId);
        return data;
    } catch (error) {
        console.error('Brevo API Error:', error.message);
        throw error;
    }
};

// Placeholders

export const sendWorkspaceInviteEmail = async ({ toEmail, workspaceName, invitedBy, inviteLink }) => {
    try {
        console.log(`Sending Workspace Invite to: ${toEmail} via Brevo HTTP API...`);
        
        if (!process.env.BREVO_API_KEY) {
            throw new Error("BREVO_API_KEY is missing");
        }

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: SENDER_NAME, email: SENDER_EMAIL },
                to: [{ email: toEmail }],
                subject: `Invitation to join ${workspaceName} on Project Manager`,
                htmlContent: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                        <div style="text-align: center; margin-bottom: 25px;">
                            <h1 style="color: #2563eb; margin: 0; font-size: 24px;">Project Manager</h1>
                        </div>
                        <h2 style="color: #1e293b; font-size: 20px; margin-bottom: 15px;">You've been invited!</h2>
                        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                            <strong>${invitedBy}</strong> has invited you to join the workspace <strong>${workspaceName}</strong>.
                        </p>
                        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                            Collaborate with your team, manage tasks, and track projects all in one place.
                        </p>
                        <div style="text-align: center; margin-bottom: 30px;">
                            <a href="${inviteLink}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
                                Accept Invitation
                            </a>
                        </div>
                        <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
                            If the button doesn't work, copy and paste the following link into your browser:
                        </p>
                        <p style="color: #2563eb; font-size: 14px; word-break: break-all;">
                            ${inviteLink}
                        </p>
                        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;">
                        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                            This invitation was sent to ${toEmail}. If you weren't expecting this invitation, you can ignore this email.
                        </p>
                    </div>
                `
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to send invite email');
        }

        console.log('Invite email sent successfully via Brevo API. ID:', data.messageId);
        return data;
    } catch (error) {
        console.error('Brevo API Error (Invite):', error.message);
        throw error;
    }
};

export const sendTaskAssignedEmail = async ({ toEmail, toName, taskTitle, projectName, assignedBy, dueDate }) => {
    try {
        console.log(`Sending Task Assigned email to: ${toEmail}...`);
        
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: SENDER_NAME, email: SENDER_EMAIL },
                to: [{ email: toEmail, name: toName }],
                subject: `New Task Assigned: ${taskTitle}`,
                htmlContent: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                        <div style="text-align: center; margin-bottom: 25px;">
                            <h1 style="color: #2563eb; margin: 0; font-size: 24px;">Project Manager</h1>
                        </div>
                        <h2 style="color: #1e293b; font-size: 20px; margin-bottom: 15px;">New Task Assigned</h2>
                        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                            Hi ${toName}, you have been assigned a new task in <strong>${projectName}</strong> by <strong>${assignedBy}</strong>.
                        </p>
                        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
                            <h3 style="margin-top: 0; color: #1e293b;">${taskTitle}</h3>
                            <p style="margin-bottom: 0; color: #64748b; font-size: 14px;">
                                <strong>Due Date:</strong> ${dueDate ? new Date(dueDate).toLocaleDateString() : 'No due date'}
                            </p>
                        </div>
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="${process.env.FRONTEND_URL}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
                                View Task
                            </a>
                        </div>
                    </div>
                `
            })
        });

        if (!response.ok) throw new Error('Failed to send task assigned email');
        return await response.json();
    } catch (error) {
        console.error('Brevo API Error (Task Assigned):', error.message);
    }
};

export const sendTaskCompletedEmail = async ({ toEmail, toName, taskTitle, projectName, completedBy }) => {
    try {
        console.log(`Sending Task Completed email to: ${toEmail}...`);
        
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: SENDER_NAME, email: SENDER_EMAIL },
                to: [{ email: toEmail, name: toName }],
                subject: `Task Completed: ${taskTitle}`,
                htmlContent: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                        <div style="text-align: center; margin-bottom: 25px;">
                            <h1 style="color: #2563eb; margin: 0; font-size: 24px;">Project Manager</h1>
                        </div>
                        <h2 style="color: #059669; font-size: 20px; margin-bottom: 15px;">Task Completed!</h2>
                        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                            Hi ${toName}, the task <strong>${taskTitle}</strong> in project <strong>${projectName}</strong> has been completed by <strong>${completedBy}</strong>.
                        </p>
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="${process.env.FRONTEND_URL}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
                                View Project
                            </a>
                        </div>
                    </div>
                `
            })
        });

        if (!response.ok) throw new Error('Failed to send task completed email');
        return await response.json();
    } catch (error) {
        console.error('Brevo API Error (Task Completed):', error.message);
    }
};

export const sendOverdueTaskEmail = async (details) => {};


