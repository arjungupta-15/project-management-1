import { useState } from "react";
import { Mail, UserPlus } from "lucide-react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import API from "../api";
import toast from "react-hot-toast";

const AddProjectMember = ({ isDialogOpen, setIsDialogOpen }) => {

    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');

    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);
    const projects = useSelector((state) => state.workspace?.projects || []);
    const project = projects.find((p) => p._id === id);
    const projectMemberIds = project?.members?.map((m) => m._id || m) || [];

    const [selectedUserId, setSelectedUserId] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const availableMembers = currentWorkspace?.members?.filter(
        (m) => !projectMemberIds.includes(m.user._id)
    ) || [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedUserId || !project) return;
        setIsAdding(true);
        try {
            await API.put(`/projects/${project._id}`, {
                members: [...projectMemberIds, selectedUserId]
            });
            toast.success("Member added to project");
            setIsDialogOpen(false);
            setSelectedUserId('');
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to add member");
        } finally {
            setIsAdding(false);
        }
    };

    if (!isDialogOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md text-zinc-900 dark:text-zinc-200">
                <div className="mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <UserPlus className="size-5 text-zinc-900 dark:text-zinc-200" /> Add Member to Project
                    </h2>
                    {project && (
                        <p className="text-sm text-zinc-700 dark:text-zinc-400">
                            Adding to: <span className="text-blue-600 dark:text-blue-400">{project.name}</span>
                        </p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
                            Select Member
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 w-4 h-4" />
                            <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="pl-10 mt-1 w-full rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 text-sm py-2 focus:outline-none focus:border-blue-500" required >
                                <option value="">Select a workspace member</option>
                                {availableMembers.map((member) => (
                                    <option key={member.user._id} value={member.user._id}>
                                        {member.user.email}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {availableMembers.length === 0 && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">All workspace members are already in this project.</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsDialogOpen(false)} className="px-5 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition" >
                            Cancel
                        </button>
                        <button type="submit" disabled={isAdding || !selectedUserId} className="px-5 py-2 text-sm rounded bg-gradient-to-br from-blue-500 to-blue-600 hover:opacity-90 text-white disabled:opacity-50 transition" >
                            {isAdding ? "Adding..." : "Add Member"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProjectMember;
