import Project from '../models/Project.js';
import Task from '../models/Task.js';

export const createProject = async (req, res) => {
    const { name, description, priority, status, start_date, end_date, workspaceId, leadId, memberIds } = req.body;

    try {
        // Build members list: always include creator, add any extra memberIds
        const allMemberIds = [...new Set([req.user._id.toString(), ...(memberIds || [])])];

        const project = await Project.create({
            name,
            description,
            priority,
            status,
            start_date,
            end_date,
            workspace: workspaceId,
            team_lead: leadId || req.user._id,
            members: allMemberIds
        });

        const populatedProject = await Project.findById(project._id)
            .populate('team_lead', 'name email image')
            .populate('members', 'name email image');

        // Emit socket event
        const io = req.app.get('io');
        io.to(workspaceId.toString()).emit('projectCreated', populatedProject);

        res.status(201).json(populatedProject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get workspace projects
// @route   GET /api/projects/workspace/:workspaceId
export const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({ workspace: req.params.workspaceId })
            .populate('team_lead', 'name email image')
            .populate('members', 'name email image');
        
        // Calculate progress for each project (mock calculation or from tasks)
        // For now, we just return them. In a real app, we'd count completed tasks.
        
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single project details
// @route   GET /api/projects/:id
export const getProjectDetails = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('team_lead', 'name email image')
            .populate('members', 'name email image');
        
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const tasks = await Task.find({ projectId: project._id })
            .populate('assignee', 'name email image')
            .populate('comments.user', 'name email image');

        res.json({ ...project._doc, tasks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update project
// @route   PUT /api/projects/:id
export const updateProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('team_lead', 'name email image')
            .populate('members', 'name email image');

        // Emit socket event
        const io = req.app.get('io');
        io.to(updatedProject.workspace.toString()).emit('projectUpdated', updatedProject);

        res.json(updatedProject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const workspaceId = project.workspace;
        await project.deleteOne();
        await Task.deleteMany({ projectId: req.params.id });

        // Emit socket event
        const io = req.app.get('io');
        io.to(workspaceId.toString()).emit('projectDeleted', req.params.id);

        res.json({ message: 'Project removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
