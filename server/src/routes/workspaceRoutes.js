import express from 'express';
import { createWorkspace, getMyWorkspaces, getWorkspaceBySlug, addMember, acceptInvite } from '../controllers/workspaceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, createWorkspace)
    .get(protect, getMyWorkspaces);

router.post('/accept-invite', protect, acceptInvite);
router.get('/:slug', protect, getWorkspaceBySlug);
router.post('/:id/members', protect, addMember);

export default router;
