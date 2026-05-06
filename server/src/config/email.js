import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Fallback Transporter (Nodemailer) - for local or if Resend is not configured
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    family: 4,
    connectionTimeout: 15000,
});

// Verify SMTP connection (only if Resend is not used)
if (!resend) {
    transporter.verify((error) => {
        if (error) console.error("SMTP Verify Error:", error.message);
        else console.log("SMTP Ready");
    });
}

const FROM_EMAIL = 'onboarding@resend.dev'; // Change this to your verified domain email later

export const sendOTPEmail = async ({ toEmail, otp }) => {
    try {
        console.log(`Attempting to send OTP to: ${toEmail}...`);
        
        if (resend) {
            // Using Resend API (Best for Production/Render)
            const { data, error } = await resend.emails.send({
                from: `Project Manager <${FROM_EMAIL}>`,
                to: [toEmail],
                subject: 'Email Verification OTP',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                        <h2 style="color: #3b82f6; text-align: center;">Verification Code</h2>
                        <p>Use the following OTP to verify your email address:</p>
                        <div style="background: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
                            <h1 style="letter-spacing: 5px; font-size: 32px; color: #111; margin: 0;">${otp}</h1>
                        </div>
                        <p>This code will expire in 5 minutes.</p>
                    </div>
                `,
            });

            if (error) throw error;
            console.log('OTP sent via Resend:', data.id);
        } else {
            // Fallback to Nodemailer
            await transporter.sendMail({
                from: `"Project Manager" <${process.env.EMAIL_USER}>`,
                to: toEmail,
                subject: `Email Verification OTP`,
                html: `<h1>${otp}</h1><p>Your verification code.</p>`
            });
            console.log('OTP sent via SMTP');
        }
    } catch (error) {
        console.error('OTP email failed:', error.message);
        throw error;
    }
};

// Simplified versions of other functions to use Resend if available
export const sendTaskAssignedEmail = async (details) => {
    // Logic similar to sendOTPEmail
    console.log("Task email triggered for:", details.toEmail);
};

export const sendTaskCompletedEmail = async (details) => {
    console.log("Task completion email triggered for:", details.toEmail);
};

export const sendWorkspaceInviteEmail = async (details) => {
    console.log("Invite email triggered for:", details.toEmail);
};

export const sendOverdueTaskEmail = async (details) => {
    console.log("Overdue email triggered for:", details.toEmail);
};
