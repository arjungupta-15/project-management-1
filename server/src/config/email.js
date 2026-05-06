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
export const sendTaskAssignedEmail = async (details) => {};
export const sendTaskCompletedEmail = async (details) => {};
export const sendWorkspaceInviteEmail = async (details) => {};
export const sendOverdueTaskEmail = async (details) => {};
