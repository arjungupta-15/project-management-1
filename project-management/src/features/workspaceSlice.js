import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api";

export const fetchWorkspaces = createAsyncThunk("workspace/fetchAll", async (_, { rejectWithValue }) => {
    try {
        const { data } = await API.get("/workspaces");
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message });
    }
});

export const createWorkspace = createAsyncThunk("workspace/create", async (workspaceData, { rejectWithValue }) => {
    try {
        const { data } = await API.post("/workspaces", workspaceData);
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message });
    }
});

export const fetchProjects = createAsyncThunk("project/fetchByWorkspace", async (workspaceId, { rejectWithValue }) => {
    try {
        const { data } = await API.get(`/projects/workspace/${workspaceId}`);
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message });
    }
});

export const addProject = createAsyncThunk("project/add", async (projectData, { rejectWithValue }) => {
    try {
        const { data } = await API.post("/projects", projectData);
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message });
    }
});

export const addTask = createAsyncThunk("task/add", async (taskData, { rejectWithValue }) => {
    try {
        const { data } = await API.post("/tasks", taskData);
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message });
    }
});

export const updateTask = createAsyncThunk("task/update", async ({ taskId, taskData }, { rejectWithValue }) => {
    try {
        const { data } = await API.put(`/tasks/${taskId}`, taskData);
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message });
    }
});

export const deleteTask = createAsyncThunk("task/delete", async (taskIds, { rejectWithValue }) => {
    try {
        const ids = Array.isArray(taskIds) ? taskIds : [taskIds];
        await Promise.all(ids.map(id => API.delete(`/tasks/${id}`)));
        return ids;
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message });
    }
});

export const fetchProjectDetails = createAsyncThunk("project/fetchDetails", async (projectId, { rejectWithValue }) => {
    try {
        const { data } = await API.get(`/projects/${projectId}`);
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message });
    }
});

export const inviteMember = createAsyncThunk("workspace/inviteMember", async ({ workspaceId, email, role }, { rejectWithValue }) => {
    try {
        const { data } = await API.post(`/workspaces/${workspaceId}/members`, { email, role });
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message });
    }
});
export const acceptWorkspaceInvite = createAsyncThunk("workspace/acceptInvite", async (token, { rejectWithValue }) => {
    try {
        const { data } = await API.post("/workspaces/accept-invite", { token });
        return data;
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message });
    }
});

const initialState = {
    workspaces: [],
    currentWorkspace: null,
    projects: [],
    loading: false,
    error: null
};

const workspaceSlice = createSlice({
    name: "workspace",
    initialState,
    reducers: {
        setCurrentWorkspace: (state, action) => {
            state.currentWorkspace = action.payload;
        },
        // Socket Event Handlers
        socketProjectCreated: (state, action) => {
            if (!state.projects.find(p => p._id === action.payload._id)) {
                state.projects.push(action.payload);
            }
        },
        socketProjectUpdated: (state, action) => {
            state.projects = state.projects.map(p => 
                p._id === action.payload._id 
                    ? { ...action.payload, tasks: p.tasks || [] }  // preserve existing tasks
                    : p
            );
        },
        socketProjectDeleted: (state, action) => {
            state.projects = state.projects.filter(p => p._id !== action.payload);
        },
        socketTaskCreated: (state, action) => {
            state.projects = state.projects.map(p => {
                if (p._id === action.payload.projectId) {
                    const taskExists = p.tasks?.find(t => t._id === action.payload._id);
                    if (!taskExists) {
                        const updatedTasks = [...(p.tasks || []), action.payload];
                        const total = updatedTasks.length;
                        const done = updatedTasks.filter(t => t.status === 'DONE').length;
                        const progress = total > 0 ? Math.round((done / total) * 100) : 0;
                        return { ...p, tasks: updatedTasks, progress };
                    }
                }
                return p;
            });
        },
        socketTaskUpdated: (state, action) => {
            state.projects = state.projects.map(p => {
                if (p.tasks?.find(t => t._id === action.payload._id)) {
                    const updatedTasks = p.tasks.map(t => 
                        t._id === action.payload._id ? action.payload : t
                    );
                    const total = updatedTasks.length;
                    const done = updatedTasks.filter(t => t.status === 'DONE').length;
                    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
                    return { ...p, tasks: updatedTasks, progress };
                }
                return p;
            });
        },
        socketTaskDeleted: (state, action) => {
            state.projects = state.projects.map(p => {
                if (p.tasks?.find(t => t._id === action.payload)) {
                    const updatedTasks = p.tasks.filter(t => t._id !== action.payload);
                    const total = updatedTasks.length;
                    const done = updatedTasks.filter(t => t.status === 'DONE').length;
                    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
                    return { ...p, tasks: updatedTasks, progress };
                }
                return p;
            });
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Workspaces
            .addCase(fetchWorkspaces.pending, (state) => { state.loading = true; })
            .addCase(fetchWorkspaces.fulfilled, (state, action) => {
                state.loading = false;
                state.workspaces = action.payload;
                if (!state.currentWorkspace && action.payload.length > 0) {
                    state.currentWorkspace = action.payload[0];
                } else if (state.currentWorkspace && action.payload.length > 0) {
                    // Refresh currentWorkspace with latest populated data
                    const updated = action.payload.find(ws => ws._id === state.currentWorkspace._id);
                    if (updated) state.currentWorkspace = updated;
                }
            })
            .addCase(fetchWorkspaces.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create Workspace
            .addCase(createWorkspace.fulfilled, (state, action) => {
                state.workspaces.push(action.payload);
                state.currentWorkspace = action.payload;
            })
            // Fetch Projects
            .addCase(fetchProjects.fulfilled, (state, action) => {
                state.projects = action.payload;
            })
            // Add Project
            .addCase(addProject.fulfilled, (state, action) => {
                if (!state.projects.find(p => p._id === action.payload._id)) {
                    state.projects.push(action.payload);
                }
            })
            // Add Task - recalculate progress
            .addCase(addTask.fulfilled, (state, action) => {
                state.projects = state.projects.map(p => {
                    if (p._id !== action.payload.projectId?.toString() &&
                        p._id !== action.payload.projectId) return p;

                    const updatedTasks = [...(p.tasks || []), action.payload];
                    const total = updatedTasks.length;
                    const done = updatedTasks.filter(t => t.status === 'DONE').length;
                    const progress = total > 0 ? Math.round((done / total) * 100) : 0;

                    return { ...p, tasks: updatedTasks, progress };
                });
            })
            // Update Task - also recalculate project progress
            .addCase(updateTask.fulfilled, (state, action) => {
                state.projects = state.projects.map(p => {
                    if (p._id !== action.payload.projectId?.toString() && 
                        p._id !== action.payload.projectId) return p;
                    
                    const updatedTasks = p.tasks?.map(t => 
                        t._id === action.payload._id ? action.payload : t
                    ) || [];
                    
                    // Recalculate progress
                    const total = updatedTasks.length;
                    const done = updatedTasks.filter(t => t.status === 'DONE').length;
                    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
                    
                    return { ...p, tasks: updatedTasks, progress };
                });
            })
            // Delete Task - recalculate progress
            .addCase(deleteTask.fulfilled, (state, action) => {
                const deletedIds = action.payload;
                state.projects = state.projects.map(p => {
                    const updatedTasks = p.tasks?.filter(t => !deletedIds.includes(t._id)) || [];
                    const total = updatedTasks.length;
                    const done = updatedTasks.filter(t => t.status === 'DONE').length;
                    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
                    return { ...p, tasks: updatedTasks, progress };
                });
            })
            // Fetch Project Details
            .addCase(fetchProjectDetails.fulfilled, (state, action) => {
                state.projects = state.projects.map(p => 
                    p._id === action.payload._id ? action.payload : p
                );
            })
            // Invite Member
            .addCase(inviteMember.fulfilled, (state, action) => {
                state.currentWorkspace = action.payload;
                state.workspaces = state.workspaces.map(ws => 
                    ws._id === action.payload._id ? action.payload : ws
                );
            })
            // Accept Invite
            .addCase(acceptWorkspaceInvite.pending, (state) => {
                state.loading = true;
            })
            .addCase(acceptWorkspaceInvite.fulfilled, (state, action) => {
                state.loading = false;
                if (!state.workspaces.find(ws => ws._id === action.payload._id)) {
                    state.workspaces.push(action.payload);
                }
                state.currentWorkspace = action.payload;
            })
            .addCase(acceptWorkspaceInvite.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { 
    setCurrentWorkspace, 
    socketProjectCreated, 
    socketProjectUpdated, 
    socketProjectDeleted,
    socketTaskCreated,
    socketTaskUpdated,
    socketTaskDeleted
} = workspaceSlice.actions;
export default workspaceSlice.reducer;