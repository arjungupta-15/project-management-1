import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loadTheme } from '../features/themeSlice'
import { fetchWorkspaces, socketProjectCreated, socketProjectDeleted, socketProjectUpdated, socketTaskCreated, socketTaskDeleted, socketTaskUpdated } from '../features/workspaceSlice'
import { Loader2Icon } from 'lucide-react'
import socket from '../socket'

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const { loading, currentWorkspace } = useSelector((state) => state.workspace)
    const { user } = useSelector((state) => state.auth)
    const dispatch = useDispatch()

    // Initial load
    useEffect(() => {
        dispatch(loadTheme());
        dispatch(fetchWorkspaces());
    }, [dispatch])

    // Socket Setup - connect once
    useEffect(() => {
        if (user && !socket.connected) {
            socket.connect();
        }
        return () => {
            socket.off();
            socket.disconnect();
        };
    }, [user]);

    // Join rooms and listen for events
    useEffect(() => {
        if (currentWorkspace?._id) {
            socket.emit('joinWorkspace', currentWorkspace._id);

            // Project Listeners
            socket.on('projectCreated', (data) => dispatch(socketProjectCreated(data)));
            socket.on('projectUpdated', (data) => dispatch(socketProjectUpdated(data)));
            socket.on('projectDeleted', (data) => dispatch(socketProjectDeleted(data)));

            // Task Listeners (Global for active workspace projects)
            socket.on('taskCreated', (data) => dispatch(socketTaskCreated(data)));
            socket.on('taskUpdated', (data) => dispatch(socketTaskUpdated(data)));
            socket.on('taskDeleted', (data) => dispatch(socketTaskDeleted(data)));
            
            // Note: On backend, projects also join their own rooms or emit to workspace room
            // I set them to emit to project ID usually.
            // Let's ensure project-level emitters in taskController emit to a room the project users are in.
        }

        return () => {
            socket.off('projectCreated');
            socket.off('projectUpdated');
            socket.off('projectDeleted');
            socket.off('taskCreated');
            socket.off('taskUpdated');
            socket.off('taskDeleted');
        };
    }, [currentWorkspace?._id, dispatch]);

    const isInvitePage = window.location.pathname.includes('accept-invite');

    if (loading && !currentWorkspace && !isInvitePage) return (
        <div className='flex items-center justify-center h-screen bg-white dark:bg-zinc-950'>
            <Loader2Icon className="size-7 text-blue-500 animate-spin" />
        </div>
    )

    return (
        <div className="flex bg-white dark:bg-zinc-950 text-gray-900 dark:text-slate-100">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col h-screen">
                <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
                <div className="flex-1 h-full p-6 xl:p-10 xl:px-16 overflow-y-scroll">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default Layout
