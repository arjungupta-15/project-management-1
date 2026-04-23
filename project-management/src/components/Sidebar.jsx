import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import MyTasksSidebar from './MyTasksSidebar'
import ProjectSidebar from './ProjectsSidebar'
import InviteMemberDialog from './InviteMemberDialog'
import CreateWorkspaceDialog from './CreateWorkspaceDialog'
import { FolderOpenIcon, LayoutDashboardIcon, LogOutIcon, UsersIcon, UserPlusIcon, PlusIcon, CheckIcon, BuildingIcon } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../features/authSlice'
import { setCurrentWorkspace, fetchProjects } from '../features/workspaceSlice'
import { useNavigate } from 'react-router-dom'

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)
    const { currentWorkspace, workspaces } = useSelector((state) => state.workspace)
    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false)
    const [showWorkspaces, setShowWorkspaces] = useState(true)

    const isAdmin = currentWorkspace?.members?.find(m => {
        const memberId = m.user?._id || m.user;
        return memberId?.toString() === user?._id?.toString() && m.role === 'ADMIN';
    });

    const menuItems = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboardIcon },
        { name: 'Projects', href: '/projects', icon: FolderOpenIcon },
        { name: 'Team', href: '/team', icon: UsersIcon },
    ]

    const sidebarRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsSidebarOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setIsSidebarOpen]);

    const handleSelectWorkspace = (ws) => {
        dispatch(setCurrentWorkspace(ws));
        dispatch(fetchProjects(ws._id));
        navigate('/');
    };

    return (
        <div ref={sidebarRef} className={`z-10 bg-white dark:bg-zinc-900 min-w-68 flex flex-col h-screen border-r border-gray-200 dark:border-zinc-800 max-sm:absolute transition-all ${isSidebarOpen ? 'left-0' : '-left-full'}`}>

            {/* Workspaces Section */}
            <div className='p-3 border-b border-gray-200 dark:border-zinc-800'>
                <div className='flex items-center justify-between mb-2 px-1'>
                    <button onClick={() => setShowWorkspaces(p => !p)} className='text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-zinc-200'>
                        Workspaces
                    </button>
                    <button onClick={() => setIsCreateWorkspaceOpen(true)} className='p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400' title='New Workspace'>
                        <PlusIcon size={14} />
                    </button>
                </div>

                {showWorkspaces && (
                    <div className='space-y-0.5'>
                        {workspaces.length === 0 ? (
                            <button onClick={() => setIsCreateWorkspaceOpen(true)} className='w-full flex items-center gap-2 px-2 py-2 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded transition-all'>
                                <PlusIcon size={13} /> Create your first workspace
                            </button>
                        ) : (
                            workspaces.map((ws) => (
                                <button key={ws._id} onClick={() => handleSelectWorkspace(ws)} className={`w-full flex items-center gap-2 px-2 py-2 rounded transition-all text-left ${currentWorkspace?._id === ws._id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}>
                                    <div className={`w-6 h-6 rounded flex-shrink-0 flex items-center justify-center text-white text-xs font-bold ${currentWorkspace?._id === ws._id ? 'bg-blue-600' : 'bg-zinc-500 dark:bg-zinc-600'}`}>
                                        {ws.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className='text-sm truncate flex-1'>{ws.name}</span>
                                    {currentWorkspace?._id === ws._id && <CheckIcon size={13} className='flex-shrink-0' />}
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Nav Items */}
            <div className='flex-1 overflow-y-scroll no-scrollbar flex flex-col'>
                <div className='flex-1'>
                    <div className='p-3'>
                        {menuItems.map((item) => (
                            <NavLink to={item.href} key={item.name} className={({ isActive }) => `flex items-center gap-3 py-2 px-3 text-gray-800 dark:text-zinc-100 cursor-pointer rounded transition-all ${isActive ? 'bg-gray-100 dark:bg-gradient-to-br dark:from-zinc-800 dark:to-zinc-800/50' : 'hover:bg-gray-50 dark:hover:bg-zinc-800/60'}`}>
                                <item.icon size={16} />
                                <p className='text-sm truncate'>{item.name}</p>
                            </NavLink>
                        ))}

                        {isAdmin && (
                            <button onClick={() => setIsInviteOpen(true)} className='flex w-full items-center gap-3 py-2 px-3 text-blue-600 dark:text-blue-400 cursor-pointer rounded hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all'>
                                <UserPlusIcon size={16} />
                                <p className='text-sm truncate'>Invite Member</p>
                            </button>
                        )}
                    </div>

                    <MyTasksSidebar />
                    <ProjectSidebar />
                </div>

                <InviteMemberDialog isOpen={isInviteOpen} setIsOpen={setIsInviteOpen} />
                <CreateWorkspaceDialog isOpen={isCreateWorkspaceOpen} setIsOpen={setIsCreateWorkspaceOpen} />

                {/* User Info */}
                <div className='p-3 border-t border-gray-200 dark:border-zinc-800'>
                    <div className='flex items-center gap-3 p-2 mb-1'>
                        <div className='size-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0'>
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className='flex-1 min-w-0'>
                            <p className='text-sm font-medium text-gray-900 dark:text-white truncate'>{user?.name}</p>
                            <p className='text-xs text-gray-500 dark:text-zinc-500 truncate'>{user?.email}</p>
                        </div>
                    </div>
                    <button onClick={() => dispatch(logout())} className='flex w-full items-center gap-3 py-2 px-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer rounded transition-all'>
                        <LogOutIcon size={16} />
                        <p className='text-sm truncate'>Logout</p>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Sidebar
