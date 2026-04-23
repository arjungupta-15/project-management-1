import { useState } from "react";
import { XIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addProject } from "../features/workspaceSlice";
import toast from "react-hot-toast";

const CreateProjectDialog = ({ isDialogOpen, setIsDialogOpen }) => {

    const { currentWorkspace } = useSelector((state) => state.workspace);
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        status: "PLANNING",
        priority: "MEDIUM",
        start_date: "",
        end_date: "",
        memberIds: [],
        leadId: "",
        progress: 0,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const removeMember = (idToRemove) => {
        setFormData((prev) => ({
            ...prev,
            memberIds: prev.memberIds.filter(id => id !== idToRemove)
        }));
    };

    const getMemberById = (id) => currentWorkspace?.members?.find(m => (m.user?._id || m.user) === id)?.user;

    // Safe members list - filter out any unpopulated entries
    const workspaceMembers = currentWorkspace?.members?.filter(m => m.user?.name || m.user?.email) || [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Submit clicked");
        console.log("currentWorkspace:", currentWorkspace);
        console.log("formData:", formData);
        
        if (!currentWorkspace?._id) return toast.error("No workspace selected");

        setIsSubmitting(true);
        try {
            const result = await dispatch(addProject({ 
                name: formData.name,
                description: formData.description,
                status: formData.status,
                priority: formData.priority,
                start_date: formData.start_date,
                end_date: formData.end_date,
                progress: formData.progress,
                leadId: formData.leadId,
                memberIds: formData.memberIds,
                workspaceId: currentWorkspace._id 
            })).unwrap();
            console.log("Project created:", result);
            toast.success("Project created successfully");
            setIsDialogOpen(false);
            setFormData({
                name: "",
                description: "",
                status: "PLANNING",
                priority: "MEDIUM",
                start_date: "",
                end_date: "",
                memberIds: [],
                leadId: "",
                progress: 0,
            });
        } catch (error) {
            console.error("Create project error:", error);
            toast.error(error?.message || JSON.stringify(error) || "Failed to create project");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isDialogOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur flex items-center justify-center text-left z-50">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-lg text-zinc-900 dark:text-zinc-200 relative">
                <button className="absolute top-3 right-3 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200" onClick={() => setIsDialogOpen(false)} >
                    <XIcon className="size-5" />
                </button>

                <h2 className="text-xl font-medium mb-1">Create New Project</h2>
                {currentWorkspace && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                        In workspace: <span className="text-blue-600 dark:text-blue-400">{currentWorkspace.name}</span>
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Project Name */}
                    <div>
                        <label className="block text-sm mb-1">Project Name</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter project name" className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 mt-1 text-zinc-900 dark:text-zinc-200 text-sm" required />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm mb-1">Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe your project" className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 mt-1 text-zinc-900 dark:text-zinc-200 text-sm h-20" />
                    </div>

                    {/* Status & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm mb-1">Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 mt-1 text-zinc-900 dark:text-zinc-200 text-sm" >
                                <option value="PLANNING">Planning</option>
                                <option value="ACTIVE">Active</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="ON_HOLD">On Hold</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm mb-1">Priority</label>
                            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 mt-1 text-zinc-900 dark:text-zinc-200 text-sm" >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm mb-1">Start Date</label>
                            <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 mt-1 text-zinc-900 dark:text-zinc-200 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">End Date</label>
                            <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} min={formData.start_date && new Date(formData.start_date).toISOString().split('T')[0]} className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 mt-1 text-zinc-900 dark:text-zinc-200 text-sm" />
                        </div>
                    </div>

                    {/* Lead */}
                    <div>
                        <label className="block text-sm mb-1">Project Lead</label>
                        <select value={formData.leadId} onChange={(e) => {
                            const id = e.target.value;
                            setFormData(prev => ({
                                ...prev,
                                leadId: id,
                                memberIds: id ? [...new Set([...prev.memberIds, id])] : prev.memberIds
                            }));
                        }} className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 mt-1 text-zinc-900 dark:text-zinc-200 text-sm" >
                            <option value="">No lead</option>
                            {workspaceMembers.map((member) => (
                                <option key={member.user?._id} value={member.user?._id}>
                                    {member.user?.name} ({member.user?.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Team Members */}
                    <div>
                        <label className="block text-sm mb-1">Team Members</label>
                        <select className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 mt-1 text-zinc-900 dark:text-zinc-200 text-sm"
                            value=""
                            onChange={(e) => {
                                const id = e.target.value;
                                if (id && !formData.memberIds.includes(id)) {
                                    setFormData((prev) => ({ ...prev, memberIds: [...prev.memberIds, id] }));
                                }
                            }}
                        >
                            <option value="">Add team members</option>
                            {workspaceMembers
                                .filter((member) => !formData.memberIds.includes(member.user?._id))
                                .map((member) => (
                                    <option key={member.user?._id} value={member.user?._id}>
                                        {member.user?.name} ({member.user?.email})
                                    </option>
                                ))}
                        </select>

                        {formData.memberIds.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.memberIds.map((id) => {
                                    const member = getMemberById(id);
                                    return (
                                        <div key={id} className="flex items-center gap-1 bg-blue-200/50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-md text-sm" >
                                            {member?.name || member?.email || id}
                                            <button type="button" onClick={() => removeMember(id)} className="ml-1 hover:bg-blue-300/30 dark:hover:bg-blue-500/30 rounded" >
                                                <XIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-2 text-sm">
                        <button type="button" onClick={() => setIsDialogOpen(false)} className="px-4 py-2 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800" >
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting || !currentWorkspace} className="px-4 py-2 rounded bg-gradient-to-br from-blue-500 to-blue-600 text-white dark:text-zinc-200" >
                            {isSubmitting ? "Creating..." : "Create Project"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectDialog;