import { useState } from "react";
import { useDispatch } from "react-redux";
import { createWorkspace, fetchProjects } from "../features/workspaceSlice";
import { XIcon, LayoutIcon, GlobeIcon, AlignLeftIcon } from "lucide-react";
import toast from "react-hot-toast";

const CreateWorkspaceDialog = ({ isOpen, setIsOpen }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "name" && !formData.slug) {
            // Auto-generate slug from name if slug is empty
            const generatedSlug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
            setFormData(prev => ({ ...prev, name: value, slug: generatedSlug }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.slug) return toast.error("Name and Slug are required");

        setLoading(true);
        try {
            const result = await dispatch(createWorkspace(formData)).unwrap();
            dispatch(fetchProjects(result._id));
            toast.success("Workspace created successfully");
            setFormData({ name: "", slug: "", description: "" });
            setIsOpen(false);
        } catch (error) {
            toast.error(error.message || "Failed to create workspace");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur flex items-center justify-center text-left z-[60]">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md text-zinc-900 dark:text-zinc-200 relative shadow-2xl">
                <button 
                    className="absolute top-3 right-3 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200" 
                    onClick={() => setIsOpen(false)} 
                >
                    <XIcon className="size-5" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                        <LayoutIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Create Workspace</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Group your projects and team</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">Workspace Name</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                name="name"
                                value={formData.name} 
                                onChange={handleChange} 
                                placeholder="e.g. Acme Corp" 
                                className="w-full px-4 py-2.5 rounded-lg dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                                required 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">Workspace Slug</label>
                        <div className="relative">
                            <GlobeIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                            <input 
                                type="text" 
                                name="slug"
                                value={formData.slug} 
                                onChange={handleChange} 
                                placeholder="acme-corp" 
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono" 
                                required 
                            />
                        </div>
                        <p className="mt-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                            Unique identifier used in URLs. No spaces or special characters.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">Description (Optional)</label>
                        <div className="relative">
                            <AlignLeftIcon className="absolute left-3 top-3 size-4 text-zinc-400" />
                            <textarea 
                                name="description"
                                value={formData.description} 
                                onChange={handleChange} 
                                placeholder="Short summary of this workspace" 
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[80px]" 
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-6">
                        <button 
                            type="button" 
                            onClick={() => setIsOpen(false)} 
                            className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-sm font-medium transition-colors" 
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={loading} 
                            className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                        >
                            {loading ? "Creating..." : "Create Workspace"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateWorkspaceDialog;
