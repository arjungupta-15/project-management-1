import express from 'express';
import { createTask, updateTask, addComment, getComments, deleteTask, uploadAttachment, deleteAttachment } from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../config/multer.js';

const router = express.Router();

router.route('/').post(protect, createTask);
router.route('/:id').put(protect, updateTask).delete(protect, deleteTask);
router.route('/:id/comments').get(protect, getComments).post(protect, addComment);
router.post('/:id/attachments', protect, upload.single('file'), uploadAttachment);
router.delete('/:id/attachments/:attachmentId', protect, deleteAttachment);

export default router;
