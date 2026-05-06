import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

export const sendOTPEmail = async ({ toEmail }) => {
    try {
        console.log(`Triggering Supabase OTP for: ${toEmail}...`);
        
        const { error } = await supabase.auth.signInWithOtp({
            email: toEmail,
            options: {
                shouldCreateUser: true // This will send a 6-digit OTP code if configured
            }
        });

        if (error) throw error;
        console.log('Supabase OTP triggered successfully');
    } catch (error) {
        console.error('Supabase OTP failed:', error.message);
        throw error;
    }
};

// Function to verify OTP with Supabase
export const verifySupabaseOTP = async ({ email, otp }) => {
    try {
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: 'signup' // or 'magiclink' depending on settings
        });

        if (error) {
            // Try 'magiclink' type if 'signup' fails (sometimes Supabase defaults to this)
            const { data: data2, error: error2 } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: 'magiclink'
            });
            if (error2) throw error2;
            return data2;
        }
        return data;
    } catch (error) {
        console.error('Supabase OTP Verification failed:', error.message);
        throw error;
    }
};

// Simplified versions of other functions
export const sendTaskAssignedEmail = async (details) => { console.log("Task email (Supabase context) for:", details.toEmail); };
export const sendTaskCompletedEmail = async (details) => { console.log("Task completion (Supabase context) for:", details.toEmail); };
export const sendWorkspaceInviteEmail = async (details) => { console.log("Invite (Supabase context) for:", details.toEmail); };
export const sendOverdueTaskEmail = async (details) => { console.log("Overdue (Supabase context) for:", details.toEmail); };
