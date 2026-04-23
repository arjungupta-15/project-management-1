import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { sendTaskAssignedEmail, sendTaskCompletedEmail } from '../config/email.js';

// Helper: recalculate and save project progress
const recalculateProgress = async (projectId, io) => {
    const allTasks = await Task.find({ projectId });
    const progress = allTasks.length > 0
        ? Math.round((allTasks.filter(t => t.status === 'DONE').length / allTasks.length) * 100)
        : 0;
    
    const updatedProject = await Project.findByIdAndUpdate(
        projectId, { progress }, { new: true }
    ).populate('team_lead', 'name email image').populate('members', 'name email image');

    if (updatedProject && io) {
        io.to(updatedProject.workspace.toString()).emit('projectUpdated', updatedProject);
    }
    return progress;
};

// @desc    Create new task
// @route   POST /api/tasks
export const createTask = async (req, res) => {
    const { title, description, status, type, priority, assigneeId, due_date, projectId } = req.body;

    try {
        const task = await Task.create({
            title,
            description,
            status,
            type,
            priority,
            assignee: assigneeId,
            due_date,
            projectId
        });

        const populatedTask = await Task.findById(task._id)
            .populate('assignee', 'name email image');

        // Send email to assignee
        if (populatedTask.assignee && populatedTask.assignee.email) {
            const project = await Project.findById(projectId);
            await sendTaskAssignedEmail({
                toEmail: populatedTask.assignee.email,
                toName: populatedTask.assignee.name,
                taskTitle: title,
                projectName: project?.name || 'Unknown Project',
                assignedBy: req.user.name,
                dueDate: due_date
            });
        }

        // Emit socket event + recalculate progress
        const project = await Project.findById(projectId);
        const io = req.app.get('io');
        if (project) {
            io.to(project.workspace.toString()).emit('taskCreated', populatedTask);
            await recalculateProgress(projectId, io);
        }

        res.status(201).json(populatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update task status/details
// @route   PUT /api/tasks/:id
export const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('assignee', 'name email image');

        // Send email if assignee changed
        if (req.body.assignee && updatedTask.assignee?.email) {
            const project = await Project.findById(updatedTask.projectId);
            await sendTaskAssignedEmail({
                toEmail: updatedTask.assignee.email,
                toName: updatedTask.assignee.name,
                taskTitle: updatedTask.title,
                projectName: project?.name || 'Unknown Project',
                assignedBy: req.user.name,
                dueDate: updatedTask.due_date
            });
        }

        // Auto-calculate project progress based on DONE tasks
        const io = req.app.get('io');
        await recalculateProgress(updatedTask.projectId, io);

        // Send email to workspace admins when task is marked DONE
        if (req.body.status === 'DONE' && task.status !== 'DONE') {
            const project = await Project.findById(updatedTask.projectId)
                .populate('workspace');
            
            if (project) {
                const Workspace = (await import('../models/Workspace.js')).default;
                const workspace = await Workspace.findById(project.workspace)
                    .populate('members.user', 'name email');
                
                if (workspace) {
                    const admins = workspace.members.filter(m => m.role === 'ADMIN');
                    for (const admin of admins) {
                        if (admin.user?.email && admin.user._id.toString() !== req.user._id.toString()) {
                            await sendTaskCompletedEmail({
                                toEmail: admin.user.email,
                                toName: admin.user.name,
                                taskTitle: updatedTask.title,
                                projectName: project.name,
                                completedBy: req.user.name
                            });
                        }
                    }
                }
            }
        }
            
        // Emit task update socket event
        const project = await Project.findById(updatedTask.projectId);
        const io2 = req.app.get('io');
        if (project) {
            io2.to(project.workspace.toString()).emit('taskUpdated', updatedTask);
        }

        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get task comments
// @route   GET /api/tasks/:id/comments
export const getComments = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('comments.user', 'name email image');
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json(task.comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
export const addComment = async (req, res) => {
    const { content } = req.body;
    if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Comment content is required' });
    }

    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        task.comments.push({
            user: req.user._id,
            content
        });

        await task.save();
        
        const updatedTask = await Task.findById(req.params.id)
            .populate('comments.user', 'name email image');

        res.json(updatedTask.comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const project = await Project.findById(task.projectId);
        await task.deleteOne();

        // Recalculate progress after deletion
        const io = req.app.get('io');
        if (project) {
            io.to(project.workspace.toString()).emit('taskDeleted', req.params.id);
            await recalculateProgress(task.projectId, io);
        }

        res.json({ message: 'Task removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload attachment to task
// @route   POST /api/tasks/:id/attachments
export const uploadAttachment = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        task.attachments.push({
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            uploadedBy: req.user._id
        });

        await task.save();

        const updatedTask = await Task.findById(req.params.id)
            .populate('attachments.uploadedBy', 'name email');

        res.json(updatedTask.attachments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete attachment from task
// @route   DELETE /api/tasks/:id/attachments/:attachmentId
export const deleteAttachment = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const attachment = task.attachments.id(req.params.attachmentId);
        if (!attachment) return res.status(404).json({ message: 'Attachment not found' });

        // Delete file from disk
        import('fs').then(({ default: fs }) => {
            import('path').then(({ default: path }) => {
                import('url').then(({ fileURLToPath }) => {
                    const __filename = fileURLToPath(import.meta.url);
                    const __dirname = path.dirname(__filename);
                    const filePath = path.join(__dirname, '../../uploads', attachment.filename);
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                });
            });
        });

        task.attachments.pull(req.params.attachmentId);
        await task.save();

        res.json({ message: 'Attachment deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
