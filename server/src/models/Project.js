import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: 'MEDIUM'
    },
    status: {
        type: String,
        enum: ['PLANNING', 'ACTIVE', 'COMPLETED', 'ON_HOLD', 'CANCELLED'],
        default: 'PLANNING'
    },
    start_date: {
        type: Date
    },
    end_date: {
        type: Date
    },
    team_lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true
    },
    progress: {
        type: Number,
        default: 0
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);

export default Project;
