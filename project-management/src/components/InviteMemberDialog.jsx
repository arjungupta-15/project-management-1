import { useState } from "react";
import { XIcon, MailIcon, UserPlusIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { inviteMember, fetchWorkspaces } from "../features/workspaceSlice";
import toast from "react-hot-toast";

const InviteMemberDialog = ({ isOpen, setIsOpen }) => {
    const dispatch = useDispatch();
    const { currentWorkspace } = useSelector((state) => state.workspace);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("MEMBER");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return toast.error("Please enter an email");
        if (!currentWorkspace?._id) return toast.error("No workspace selected");

        setLoading(true);
        try {
            await dispatch(inviteMember({ 
                workspaceId: currentWorkspace._id, 
                email, 
                role 
            })).unwrap();
            
            // Refresh workspaces so new member shows up everywhere
            await dispatch(fetchWorkspaces());
            
            toast.success(`Invited ${email} successfully`);
            setEmail("");
            setIsOpen(false);
        } catch (error) {
            toast.error(error.message || "Failed to invite member");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur flex items-center justify-center text-left z-50">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md text-zinc-900 dark:text-zinc-200 relative">
                <button className="absolute top-3 right-3 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200" onClick={() => setIsOpen(false)} >
                    <XIcon className="size-5" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        <UserPlusIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-medium">Invite Team Member</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Add someone to {currentWorkspace?.name}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email Address</label>
                        <div className="relative">
                            <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="w-full pl-10 pr-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Role</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 rounded dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" >
                            <option value="MEMBER">Member (Can manage tasks)</option>
                            <option value="ADMIN">Admin (Full access)</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-sm" >
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50" >
                            {loading ? "Inviting..." : "Send Invitation"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InviteMemberDialog;
