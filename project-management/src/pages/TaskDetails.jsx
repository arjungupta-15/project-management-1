import { format } from "date-fns";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarIcon, MessageCircle, PenIcon, Trash2, FileIcon, ImageIcon, UploadIcon } from "lucide-react";
import API from "../api";

const TaskDetails = () => {
    const [searchParams] = useSearchParams();
    const projectId = searchParams.get("projectId");
    const taskId = searchParams.get("taskId");

    const { user } = useSelector((state) => state.auth);
    const { currentWorkspace } = useSelector((state) => state.workspace);

    const [task, setTask] = useState(null);
    const [project, setProject] = useState(null);
    const [comments, setComments] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const imageInputRef = useRef(null);
    const fileInputRef = useRef(null);

    const isAdmin = currentWorkspace?.members?.find(m => {
        const memberId = m.user?._id || m.user;
        return memberId?.toString() === user?._id?.toString() && m.role === 'ADMIN';
    });

    const isAssignee = task?.assignee?._id === user?._id || task?.assignee === user?._id;
    const canUpload = isAdmin || isAssignee;

    const images = attachments.filter(a => a.mimetype?.startsWith('image/'));
    const files = attachments.filter(a => !a.mimetype?.startsWith('image/'));

    const fetchComments = async () => {
        if (!taskId) return;
        try {
            const { data } = await API.get(`/tasks/${taskId}/comments`);
            setComments(data);
        } catch (error) { console.error(error); }
    };

    const fetchTaskDetails = async () => {
        setLoading(true);
        if (!projectId || !taskId) return;
        try {
            const { data: proj } = await API.get(`/projects/${projectId}`);
            if (!proj) return;
            const tsk = proj.tasks.find((t) => t._id === taskId);
            if (!tsk) return;
            setTask(tsk);
            setProject(proj);
            setComments(tsk.comments || []);
            setAttachments(tsk.attachments || []);
            setLoading(false);
        } catch (error) {
            toast.error("Failed to load task details");
            setLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        try {
            toast.loading("Adding comment...");
            const { data } = await API.post(`/tasks/${taskId}/comments`, { content: newComment });
            setComments(data);
            setNewComment("");
            toast.dismissAll();
            toast.success("Comment added.");
        } catch (error) {
            toast.dismissAll();
            toast.error(error?.response?.data?.message || "Failed to add comment");
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        setUploading(true);
        try {
            toast.loading("Uploading...");
            const { data } = await API.post(`/tasks/${taskId}/attachments`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAttachments(data);
            toast.dismissAll();
            toast.success("Uploaded successfully");
        } catch (error) {
            toast.dismissAll();
            toast.error(error?.response?.data?.message || "Upload failed");
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleDelete = async (attachmentId) => {
        if (!window.confirm("Delete this file?")) return;
        try {
            await API.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
            setAttachments(prev => prev.filter(a => a._id !== attachmentId));
            toast.success("Deleted");
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const getFileUrl = (filename) => `http://localhost:5000/uploads/${filename}`;

    const formatSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    useEffect(() => { fetchTaskDetails(); }, [taskId]);
    useEffect(() => {
        if (taskId && task) {
            fetchComments();
            const interval = setInterval(fetchComments, 10000);
            return () => clearInterval(interval);
        }
    }, [taskId, task]);

    if (loading) return <div className="text-gray-500 dark:text-zinc-400 px-4 py-6">Loading task details...</div>;
    if (!task) return <div className="text-red-500 px-4 py-6">Task not found.</div>;

    return (
        <div className="flex flex-col-reverse lg:flex-row gap-6 sm:p-4 text-gray-900 dark:text-zinc-100 max-w-6xl mx-auto">

            {/* Left Column */}
            <div className="w-full lg:w-2/3 flex flex-col gap-4">

                {/* Images Section */}
                <div className="p-5 rounded-md border border-gray-300 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                            <ImageIcon className="size-5 text-emerald-500" /> Images ({images.length})
                        </h2>
                        {canUpload && (
                            <>
                                <input ref={imageInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                                <button onClick={() => imageInputRef.current?.click()} disabled={uploading}
                                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-600 text-white transition disabled:opacity-50">
                                    <ImageIcon className="size-3" /> Upload Image
                                </button>
                            </>
                        )}
                    </div>

                    {images.length === 0 ? (
                        <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-4">No images uploaded yet.</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {images.map((att) => (
                                <div key={att._id} className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-700">
                                    <a href={getFileUrl(att.filename)} target="_blank" rel="noreferrer">
                                        <img src={getFileUrl(att.filename)} alt={att.originalName} className="w-full h-28 object-cover hover:opacity-90 transition" />
                                    </a>
                                    <div className="px-2 py-1.5 bg-gray-50 dark:bg-zinc-800/70 flex items-center justify-between">
                                        <p className="text-xs text-gray-500 dark:text-zinc-400 truncate flex-1">{att.originalName}</p>
                                        {(isAdmin || att.uploadedBy?._id === user?._id) && (
                                            <button onClick={() => handleDelete(att._id)} className="ml-1 p-0.5 text-red-400 hover:text-red-600 rounded">
                                                <Trash2 className="size-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Files Section */}
                <div className="p-5 rounded-md border border-gray-300 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                            <FileIcon className="size-5 text-blue-500" /> Files ({files.length})
                        </h2>
                        {canUpload && (
                            <>
                                <input ref={fileInputRef} type="file" onChange={handleUpload} className="hidden" />
                                <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded bg-blue-500 hover:bg-blue-600 text-white transition disabled:opacity-50">
                                    <UploadIcon className="size-3" /> {uploading ? "Uploading..." : "Upload File"}
                                </button>
                            </>
                        )}
                    </div>

                    {files.length === 0 ? (
                        <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-4">No files uploaded yet.</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {files.map((att) => (
                                <div key={att._id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 transition">
                                    <FileIcon className="size-7 text-blue-500 flex-shrink-0" />
                                    <a href={getFileUrl(att.filename)} target="_blank" rel="noreferrer" className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate text-gray-900 dark:text-zinc-200">{att.originalName}</p>
                                        <p className="text-xs text-gray-400 dark:text-zinc-500">
                                            {formatSize(att.size)} • {att.uploadedBy?.name || "Unknown"} • {format(new Date(att.uploadedAt), "dd MMM")}
                                        </p>
                                    </a>
                                    {(isAdmin || att.uploadedBy?._id === user?._id) && (
                                        <button onClick={() => handleDelete(att._id)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition">
                                            <Trash2 className="size-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Comments Section */}
                <div className="p-5 rounded-md border border-gray-300 dark:border-zinc-800 flex flex-col lg:h-[50vh]">
                    <h2 className="text-base font-semibold flex items-center gap-2 mb-4 text-gray-900 dark:text-white">
                        <MessageCircle className="size-5" /> Discussion ({comments.length})
                    </h2>
                    <div className="flex-1 md:overflow-y-scroll no-scrollbar py-2">
                        {comments.length > 0 ? (
                            <div className="flex flex-col gap-4 mb-4 mr-2">
                                {comments.map((comment) => (
                                    <div key={comment._id} className={`sm:max-w-[85%] dark:bg-gradient-to-br dark:from-zinc-800 dark:to-zinc-900 border border-gray-300 dark:border-zinc-700 p-3 rounded-xl shadow-sm ${comment.user?._id === user?._id ? "ml-auto bg-blue-50/10 border-blue-200/20" : "mr-auto"}`}>
                                        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 dark:text-zinc-400">
                                            {comment.user?.image ? (
                                                <img src={comment.user.image} alt="avatar" className="size-5 rounded-full" />
                                            ) : (
                                                <div className="size-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white">
                                                    {comment.user?.name?.charAt(0)}
                                                </div>
                                            )}
                                            <span className="font-semibold text-gray-900 dark:text-zinc-100">{comment.user?._id === user?._id ? "You" : comment.user?.name}</span>
                                            <span>• {format(new Date(comment.createdAt), "dd MMM, HH:mm")}</span>
                                        </div>
                                        <p className="text-sm text-gray-800 dark:text-zinc-200">{comment.content}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-zinc-500 text-sm text-center py-8 opacity-60">No comments yet.</p>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 mt-2">
                        <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." className="w-full dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md p-2 text-sm text-gray-900 dark:text-zinc-200 resize-none focus:outline-none focus:ring-1 focus:ring-blue-600" rows={3} />
                        <button onClick={handleAddComment} className="bg-gradient-to-l from-blue-500 to-blue-600 text-white text-sm px-5 py-2 rounded">Post</button>
                    </div>
                </div>
            </div>

            {/* Right Column: Task + Project Info */}
            <div className="w-full lg:w-1/2 flex flex-col gap-6">
                <div className="p-5 rounded-md bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800">
                    <div className="mb-3">
                        <h1 className="text-lg font-medium text-gray-900 dark:text-zinc-100">{task.title}</h1>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-300 text-xs">{task.status}</span>
                            <span className="px-2 py-0.5 rounded bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-300 text-xs">{task.type}</span>
                            <span className="px-2 py-0.5 rounded bg-green-200 dark:bg-emerald-900 text-green-900 dark:text-emerald-300 text-xs">{task.priority}</span>
                        </div>
                    </div>
                    {task.description && <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed mb-4">{task.description}</p>}
                    <hr className="border-zinc-200 dark:border-zinc-700 my-3" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-zinc-300">
                        <div className="flex items-center gap-2">
                            {task.assignee?.image ? (
                                <img src={task.assignee.image} className="size-5 rounded-full" alt="avatar" />
                            ) : (
                                <div className="size-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white">
                                    {task.assignee?.name?.charAt(0) || "?"}
                                </div>
                            )}
                            {task.assignee?.name || "Unassigned"}
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="size-4 text-gray-500 dark:text-zinc-500" />
                            Due: {task.due_date ? format(new Date(task.due_date), "dd MMM yyyy") : "No due date"}
                        </div>
                    </div>
                </div>

                {project && (
                    <div className="p-4 rounded-md bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border border-gray-300 dark:border-zinc-800">
                        <p className="text-xl font-medium mb-4">Project Details</p>
                        <h2 className="text-gray-900 dark:text-zinc-100 flex items-center gap-2"><PenIcon className="size-4" /> {project.name}</h2>
                        <p className="text-xs mt-3">Start Date: {project.start_date ? format(new Date(project.start_date), "dd MMM yyyy") : "N/A"}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-zinc-400 mt-3">
                            <span>Status: {project.status}</span>
                            <span>Priority: {project.priority}</span>
                            <span>Progress: {project.progress}%</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskDetails;
