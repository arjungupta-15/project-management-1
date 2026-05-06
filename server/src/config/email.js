import { TransactionalEmailsApi, SendSmtpEmail, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Brevo API Instance
const apiInstance = new TransactionalEmailsApi();

if (process.env.BREVO_API_KEY) {
    apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
    console.log("✅ Brevo API Initialized correctly");
}

const SENDER_EMAIL = process.env.EMAIL_USER;
const SENDER_NAME = "Project Manager";

export const sendOTPEmail = async ({ toEmail, otp }) => {
    try {
        console.log(`Sending OTP to: ${toEmail} via Brevo API...`);
        
        if (!process.env.BREVO_API_KEY) {
            throw new Error("BREVO_API_KEY is missing");
        }

        const sendSmtpEmail = new SendSmtpEmail();
        sendSmtpEmail.subject = "Email Verification OTP";
        sendSmtpEmail.htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #3b82f6; text-align: center;">Verification Code</h2>
                <p>Use the following OTP to verify your email address:</p>
                <div style="background: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
                    <h1 style="letter-spacing: 5px; font-size: 32px; color: #111; margin: 0;">${otp}</h1>
                </div>
                <p>This code will expire in 5 minutes.</p>
            </div>
        `;
        sendSmtpEmail.sender = { "name": SENDER_NAME, "email": SENDER_EMAIL };
        sendSmtpEmail.to = [{ "email": toEmail }];

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('OTP sent successfully. Message ID:', data.body.messageId);
        return data;
    } catch (error) {
        console.error('Brevo API Error:', error.response?.body?.message || error.message);
        throw error;
    }
};

// Placeholders
export const sendTaskAssignedEmail = async (details) => {};
export const sendTaskCompletedEmail = async (details) => {};
export const sendWorkspaceInviteEmail = async (details) => {};
export const sendOverdueTaskEmail = async (details) => {};
