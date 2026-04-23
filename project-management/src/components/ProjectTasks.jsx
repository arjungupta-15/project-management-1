import { format } from "date-fns";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { deleteTask, updateTask } from "../features/workspaceSlice";
import { Bug, CalendarIcon, GitCommit, MessageSquare, Square, Trash, XIcon, Zap } from "lucide-react";

const typeIcons = {
    BUG: { icon: Bug, color: "text-red-600 dark:text-red-400" },
    FEATURE: { icon: Zap, color: "text-blue-600 dark:text-blue-400" },
    TASK: { icon: Square, color: "text-green-600 dark:text-green-400" },
    IMPROVEMENT: { icon: GitCommit, color: "text-purple-600 dark:text-purple-400" },
    OTHER: { icon: MessageSquare, color: "text-amber-600 dark:text-amber-400" },
};

const priorityTexts = {
    LOW: { background: "bg-red-100 dark:bg-red-950", prioritycolor: "text-red-600 dark:text-red-400" },
    MEDIUM: { background: "bg-blue-100 dark:bg-blue-950", prioritycolor: "text-blue-600 dark:text-blue-400" },
    HIGH: { background: "bg-emerald-100 dark:bg-emerald-950", prioritycolor: "text-emerald-600 dark:text-emerald-400" },
};

const ProjectTasks = ({ tasks }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { currentWorkspace } = useSelector((state) => state.workspace);
    const [selectedTasks, setSelectedTasks] = useState([]);
    const [confirmModal, setConfirmModal] = useState(null);
    const [filters, setFilters] = useState({ status: "", type: "", priority: "", assignee: "" });

    const isAdmin = currentWorkspace?.members?.find(m => {
        const memberId = m.user?._id || m.user;
        return memberId?.toString() === user?._id?.toString() && m.role === 'ADMIN';
    });

    const canChangeStatus = (task) => {
        if (isAdmin) return true;
        const assigneeId = task.assignee?._id || task.assignee;
        return assigneeId?.toString() === user?._id?.toString();
    };

    const doStatusUpdate = async (taskId, newStatus) => {
        try {
            toast.loading("Updating status...");
            await dispatch(updateTask({ taskId, taskData: { status: newStatus } })).unwrap();
            toast.dismissAll();
            toast.success("Task status updated");
        } catch (error) {
            toast.dismissAll();
            toast.error(error?.message || "Failed to update status");
        }
    };

    const handleStatusChange = (task, newStatus) => {
        if (newStatus === 'DONE' && (!task.attachments || task.attachments.length === 0)) {
            setConfirmModal({ task, newStatus });
            return;
        }
        doStatusUpdate(task._id, newStatus);
    };

    const assigneeList = useMemo(
        () => Array.from(new Set(tasks.map((t) => t.assignee?.name).filter(Boolean))),
        [tasks]
    );

    const filteredTasks = useMemo(() => tasks.filter((task) => {
        const { status, type, priority, assignee } = filters;
        return (
            (!status || task.status === status) &&
            (!type || task.type === type) &&
            (!priority || task.priority === priority) &&
            (!assignee || task.assignee?.name === assignee)
        );
    }), [filters, tasks]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete the selected tasks?")) return;
        try {
            toast.loading("Deleting tasks...");
            await dispatch(deleteTask(selectedTasks)).unwrap();
            setSelectedTasks([]);
            toast.dismissAll();
            toast.success("Tasks deleted successfully");
        } catch (error) {
            toast.dismissAll();
            toast.error(error?.message || "Failed to delete tasks");
        }
    };

    const filterOptions = {
        status: [
            { label: "All Statuses", value: "" },
            { label: "To Do", value: "TODO" },
            { label: "In Progress", value: "IN_PROGRESS" },
            { label: "Done", value: "DONE" },
        ],
        type: [
            { label: "All Types", value: "" },
            { label: "Task", value: "TASK" },
            { label: "Bug", value: "BUG" },
            { label: "Feature", value: "FEATURE" },
            { label: "Improvement", value: "IMPROVEMENT" },
            { label: "Other", value: "OTHER" },
        ],
        priority: [
            { label: "All Priorities", value: "" },
            { label: "Low", value: "LOW" },
            { label: "Medium", value: "MEDIUM" },
            { label: "High", value: "HIGH" },
        ],
        assignee: [
            { label: "All Assignees", value: "" },
            ...assigneeList.map((n) => ({ label: n, value: n })),
        ],
    };

    return (
        <>
            <div>
                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-4">
                    {["status", "type", "priority", "assignee"].map((name) => (
                        <select key={name} name={name} onChange={handleFilterChange} className="border not-dark:bg-white border-zinc-300 dark:border-zinc-800 outline-none px-3 py-1 rounded text-sm text-zinc-900 dark:text-zinc-200">
                            {filterOptions[name].map((opt, idx) => (
                                <option key={idx} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    ))}

                    {(filters.status || filters.type || filters.priority || filters.assignee) && (
                        <button type="button" onClick={() => setFilters({ status: "", type: "", priority: "", assignee: "" })} className="px-3 py-1 flex items-center gap-2 rounded bg-gradient-to-br from-purple-400 to-purple-500 text-zinc-100 text-sm">
                            <XIcon className="size-3" /> Reset
                        </button>
                    )}

                    {selectedTasks.length > 0 && (
                        <button type="button" onClick={handleDelete} className="px-3 py-1 flex items-center gap-2 rounded bg-gradient-to-br from-indigo-400 to-indigo-500 text-zinc-100 text-sm">
                            <Trash className="size-3" /> Delete
                        </button>
                    )}
                </div>

                {/* Tasks Table */}
                <div className="overflow-auto rounded-lg lg:border border-zinc-300 dark:border-zinc-800">
                    {/* Desktop View */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="min-w-full text-sm text-left not-dark:bg-white text-zinc-900 dark:text-zinc-300">
                            <thead className="text-xs uppercase dark:bg-zinc-800/70 text-zinc-500 dark:text-zinc-400">
                                <tr>
                                    <th className="pl-2 pr-1">
                                        <input onChange={() => selectedTasks.length > 0 ? setSelectedTasks([]) : setSelectedTasks(tasks.map(t => t._id))} checked={selectedTasks.length === tasks.length && tasks.length > 0} type="checkbox" className="size-3 accent-zinc-600 dark:accent-zinc-500" />
                                    </th>
                                    <th className="px-4 pl-0 py-3">Title</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Priority</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Assignee</th>
                                    <th className="px-4 py-3">Due Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTasks.length > 0 ? filteredTasks.map((task) => {
                                    const { icon: Icon, color } = typeIcons[task.type] || {};
                                    const { background, prioritycolor } = priorityTexts[task.priority] || {};
                                    return (
                                        <tr key={task._id} onClick={() => navigate(`/taskDetails?projectId=${task.projectId}&taskId=${task._id}`)} className="border-t border-zinc-300 dark:border-zinc-800 group hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all cursor-pointer">
                                            <td onClick={e => e.stopPropagation()} className="pl-2 pr-1">
                                                <input type="checkbox" className="size-3 accent-zinc-600 dark:accent-zinc-500" onChange={() => selectedTasks.includes(task._id) ? setSelectedTasks(selectedTasks.filter(i => i !== task._id)) : setSelectedTasks(prev => [...prev, task._id])} checked={selectedTasks.includes(task._id)} />
                                            </td>
                                            <td className="px-4 pl-0 py-2">{task.title}</td>
                                            <td className="px-4 py-2">
                                                <div className="flex items-center gap-2">
                                                    {Icon && <Icon className={`size-4 ${color}`} />}
                                                    <span className={`uppercase text-xs ${color}`}>{task.type}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">
                                                <span className={`text-xs px-2 py-1 rounded ${background} ${prioritycolor}`}>{task.priority}</span>
                                            </td>
                                            <td onClick={e => e.stopPropagation()} className="px-4 py-2">
                                                {canChangeStatus(task) ? (
                                                    <select onChange={(e) => handleStatusChange(task, e.target.value)} value={task.status} className="group-hover:ring ring-zinc-100 outline-none px-2 pr-4 py-1 rounded text-sm text-zinc-900 dark:text-zinc-200 dark:bg-zinc-800 cursor-pointer">
                                                        <option value="TODO">To Do</option>
                                                        <option value="IN_PROGRESS">In Progress</option>
                                                        <option value="DONE">Done</option>
                                                    </select>
                                                ) : (
                                                    <span className="px-2 py-1 rounded text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">{task.status.replace('_', ' ')}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex items-center gap-2">
                                                    {task.assignee?.image ? <img src={task.assignee.image} className="size-5 rounded-full" alt="avatar" /> : <div className="size-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white">{task.assignee?.name?.charAt(0) || "?"}</div>}
                                                    {task.assignee?.name || "-"}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                                                    <CalendarIcon className="size-4" />
                                                    {task.due_date ? format(new Date(task.due_date), "dd MMMM") : "-"}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr><td colSpan="7" className="text-center text-zinc-500 dark:text-zinc-400 py-6">No tasks found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View */}
                    <div className="lg:hidden flex flex-col gap-4">
                        {filteredTasks.length > 0 ? filteredTasks.map((task) => {
                            const { icon: Icon, color } = typeIcons[task.type] || {};
                            const { background, prioritycolor } = priorityTexts[task.priority] || {};
                            return (
                                <div key={task._id} className="dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-300 dark:border-zinc-800 rounded-lg p-4 flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-zinc-900 dark:text-zinc-200 text-sm font-semibold">{task.title}</h3>
                                        <input type="checkbox" className="size-4 accent-zinc-600 dark:accent-zinc-500" onChange={() => selectedTasks.includes(task._id) ? setSelectedTasks(selectedTasks.filter(i => i !== task._id)) : setSelectedTasks(prev => [...prev, task._id])} checked={selectedTasks.includes(task._id)} />
                                    </div>
                                    <div className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                                        {Icon && <Icon className={`size-4 ${color}`} />}
                                        <span className={`${color} uppercase`}>{task.type}</span>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded w-fit ${background} ${prioritycolor}`}>{task.priority}</span>
                                    <div>
                                        <label className="text-zinc-600 dark:text-zinc-400 text-xs">Status</label>
                                        {canChangeStatus(task) ? (
                                            <select onChange={(e) => handleStatusChange(task, e.target.value)} value={task.status} className="w-full mt-1 bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-300 dark:ring-zinc-700 outline-none px-2 py-1 rounded text-sm text-zinc-900 dark:text-zinc-200">
                                                <option value="TODO">To Do</option>
                                                <option value="IN_PROGRESS">In Progress</option>
                                                <option value="DONE">Done</option>
                                            </select>
                                        ) : (
                                            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{task.status.replace('_', ' ')}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                                        {task.assignee?.image ? <img src={task.assignee.image} className="size-5 rounded-full" alt="avatar" /> : <div className="size-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white">{task.assignee?.name?.charAt(0) || "?"}</div>}
                                        {task.assignee?.name || "-"}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                        <CalendarIcon className="size-4" />
                                        {task.due_date ? format(new Date(task.due_date), "dd MMMM") : "-"}
                                    </div>
                                </div>
                            );
                        }) : (
                            <p className="text-center text-zinc-500 dark:text-zinc-400 py-4">No tasks found.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Warning Modal - No attachments */}
            {confirmModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-6 w-full max-w-sm shadow-xl mx-4">
                        <div className="text-center mb-5">
                            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-3">
                                <span className="text-2xl">⚠️</span>
                            </div>
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">No Files Uploaded</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                You must upload at least one image or file of your work before marking this task as Done.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    const { task } = confirmModal;
                                    setConfirmModal(null);
                                    navigate(`/taskDetails?projectId=${task.projectId}&taskId=${task._id}`);
                                }}
                                className="flex-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition"
                            >
                                Upload Files
                            </button>
                            <button
                                onClick={() => setConfirmModal(null)}
                                className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProjectTasks;
