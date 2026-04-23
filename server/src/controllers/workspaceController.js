import Workspace from '../models/Workspace.js';
import User from '../models/User.js';
import { sendWorkspaceInviteEmail } from '../config/email.js';
import jwt from 'jsonwebtoken';

// @desc    Create new workspace
// @route   POST /api/workspaces
export const createWorkspace = async (req, res) => {
    const { name, slug, description } = req.body;

    try {
        const workspaceExists = await Workspace.findOne({ slug });

        if (workspaceExists) {
            return res.status(400).json({ message: 'Workspace with this slug already exists' });
        }

        const workspace = await Workspace.create({
            name,
            slug,
            description,
            owner: req.user._id,
            members: [{ user: req.user._id, role: 'ADMIN' }]
        });

        const populatedWorkspace = await Workspace.findById(workspace._id)
            .populate('owner', 'name email image')
            .populate('members.user', 'name email image');

        res.status(201).json(populatedWorkspace);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user workspaces
// @route   GET /api/workspaces
export const getMyWorkspaces = async (req, res) => {
    try {
        const workspaces = await Workspace.find({
            'members.user': req.user._id
        }).populate('owner', 'name email image')
          .populate('members.user', 'name email image');
        
        res.json(workspaces);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get workspace by slug
// @route   GET /api/workspaces/:slug
export const getWorkspaceBySlug = async (req, res) => {
    try {
        const workspace = await Workspace.findOne({ slug: req.params.slug })
            .populate('owner', 'name email image')
            .populate('members.user', 'name email image');

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        res.json(workspace);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add member to workspace
// @route   POST /api/workspaces/:id/members
export const addMember = async (req, res) => {
    const { email, role } = req.body;

    try {
        const workspace = await Workspace.findById(req.params.id);
        if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

        // Check if user exists to see if they are already a member
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            const alreadyMember = workspace.members.find(m => m.user.toString() === existingUser._id.toString());
            if (alreadyMember) return res.status(400).json({ message: 'User already a member' });
        }

        const inviteToken = jwt.sign(
            { workspaceId: workspace._id, email, role: role || 'MEMBER' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        const inviteLink = `${process.env.FRONTEND_URL}/accept-invite?token=${inviteToken}`;

        // Send invite email
        await sendWorkspaceInviteEmail({
            toEmail: email, // Use the email from req.body directly
            workspaceName: workspace.name,
            invitedBy: req.user.name,
            inviteLink
        });

        res.json({ message: 'Invitation email sent successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Accept workspace invite
// @route   POST /api/workspaces/accept-invite
export const acceptInvite = async (req, res) => {
    const { token } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { workspaceId, email, role } = decoded;

        // Removing strict email check so any logged-in user with the link can join
        // if (req.user.email !== email) {
        //     return res.status(403).json({ message: 'This invitation is for a different email address' });
        // }

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

        const alreadyMember = workspace.members.find(m => m.user.toString() === req.user._id.toString());
        if (alreadyMember) {
            return res.status(400).json({ message: 'You are already a member of this workspace' });
        }

        workspace.members.push({ user: req.user._id, role });
        await workspace.save();

        const populatedWorkspace = await Workspace.findById(workspace._id)
            .populate('owner', 'name email image')
            .populate('members.user', 'name email image');

        res.json(populatedWorkspace);
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired invite link' });
    }
};
