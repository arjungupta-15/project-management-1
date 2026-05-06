import User from '../models/User.js';
import OTP from '../models/OTP.js';
import jwt from 'jsonwebtoken';
import { sendOTPEmail, verifySupabaseOTP } from '../config/email.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Send OTP for email verification
// @route   POST /api/auth/send-otp
export const sendOTP = async (req, res) => {
    const { email } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Trigger Supabase OTP
        await sendOTPEmail({ toEmail: email });

        res.status(200).json({ message: 'OTP sent successfully via Supabase' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
    const { name, email, password, otp } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Verify OTP with Supabase
        try {
            await verifySupabaseOTP({ email, otp });
        } catch (error) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Create user in MongoDB
        const user = await User.create({
            name,
            email,
            password
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
