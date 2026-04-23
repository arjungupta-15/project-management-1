import express from 'express';
import { createProject, getProjects, getProjectDetails, updateProject, deleteProject } from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, createProject);

router.get('/workspace/:workspaceId', protect, getProjects);

router.route('/:id')
    .get(protect, getProjectDetails)
    .put(protect, updateProject)
    .delete(protect, deleteProject);

export default router;
