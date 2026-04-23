import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ['TODO', 'IN_PROGRESS', 'DONE', 'REVIEW'],
        default: 'TODO'
    },
    type: {
        type: String,
        enum: ['FEATURE', 'TASK', 'BUG', 'IMPROVEMENT', 'OTHER'],
        default: 'TASK'
    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: 'MEDIUM'
    },
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    due_date: {
        type: Date
    },
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        content: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    attachments: [{
        filename: { type: String, required: true },
        originalName: { type: String, required: true },
        mimetype: { type: String },
        size: { type: Number },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        uploadedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

export default Task;
