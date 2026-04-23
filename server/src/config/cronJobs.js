import cron from 'node-cron';
import Task from '../models/Task.js';
import { sendOverdueTaskEmail } from './email.js';

export const startCronJobs = () => {

    // Run every day at 9:00 AM - check overdue tasks
    cron.schedule('0 9 * * *', async () => {
        console.log('Running overdue task check...');
        try {
            const now = new Date();

            // Find all tasks that are overdue and not done
            const overdueTasks = await Task.find({
                due_date: { $lt: now },
                status: { $nin: ['DONE'] }
            })
            .populate('assignee', 'name email')
            .populate('projectId', 'name');

            console.log(`Found ${overdueTasks.length} overdue tasks`);

            for (const task of overdueTasks) {
                if (task.assignee?.email) {
                    await sendOverdueTaskEmail({
                        toEmail: task.assignee.email,
                        toName: task.assignee.name,
                        taskTitle: task.title,
                        projectName: task.projectId?.name || 'Unknown Project',
                        dueDate: task.due_date
                    });
                }
            }
        } catch (error) {
            console.error('Cron job error:', error.message);
        }
    });

    console.log('Cron jobs started - overdue check runs daily at 9 AM');
};
