import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { CheckCircle, Clock, AlertTriangle, Users, ArrowRightIcon, BarChart3Icon } from "lucide-react";

// Colors for charts and priorities
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
const PRIORITY_COLORS = {
    LOW: "text-red-600 bg-red-200 dark:text-red-500 dark:bg-red-600",
    MEDIUM: "text-blue-600 bg-blue-200 dark:text-blue-500 dark:bg-blue-600",
    HIGH: "text-emerald-600 bg-emerald-200 dark:text-emerald-500 dark:bg-emerald-600",
};

const ProjectAnalytics = ({ project, tasks }) => {
    const { stats, statusData, typeData, priorityData, memberProgress } = useMemo(() => {
        const now = new Date();
        const total = tasks.length;

        const stats = {
            total,
            completed: 0,
            inProgress: 0,
            todo: 0,
            overdue: 0,
        };

        const statusMap = { TODO: 0, IN_PROGRESS: 0, DONE: 0, REVIEW: 0 };
        const typeMap = { TASK: 0, BUG: 0, FEATURE: 0, IMPROVEMENT: 0, OTHER: 0 };
        const priorityMap = { LOW: 0, MEDIUM: 0, HIGH: 0 };
        const memberMap = {};

        // Initialize memberMap with project members to ensure they show up even with 0 tasks
        project?.members?.forEach(member => {
            const mId = member._id || member;
            memberMap[mId] = {
                name: member.name || 'Unknown',
                email: member.email || '',
                image: member.image || '',
                total: 0,
                completed: 0
            };
        });

        tasks.forEach((t) => {
            if (t.status === "DONE") stats.completed++;
            if (t.status === "IN_PROGRESS") stats.inProgress++;
            if (t.status === "TODO") stats.todo++;
            if (new Date(t.due_date) < now && t.status !== "DONE") stats.overdue++;

            if (statusMap[t.status] !== undefined) statusMap[t.status]++;
            if (typeMap[t.type] !== undefined) typeMap[t.type]++;
            if (priorityMap[t.priority] !== undefined) priorityMap[t.priority]++;

            // Member Progress Calculation
            const assigneeId = t.assignee?._id || t.assignee;
            if (assigneeId) {
                if (!memberMap[assigneeId]) {
                    memberMap[assigneeId] = {
                        name: t.assignee?.name || 'Unknown',
                        email: t.assignee?.email || '',
                        image: t.assignee?.image || '',
                        total: 0,
                        completed: 0
                    };
                }
                memberMap[assigneeId].total++;
                if (t.status === 'DONE') {
                    memberMap[assigneeId].completed++;
                }
            }
        });

        return {
            stats,
            statusData: Object.entries(statusMap).map(([k, v]) => ({ name: k.replace("_", " "), value: v })),
            typeData: Object.entries(typeMap).filter(([_, v]) => v > 0).map(([k, v]) => ({ name: k, value: v })),
            priorityData: Object.entries(priorityMap).map(([k, v]) => ({
                name: k,
                value: v,
                percentage: total > 0 ? Math.round((v / total) * 100) : 0,
            })),
            memberProgress: Object.values(memberMap)
                .filter(m => m.total > 0)
                .map(m => ({
                    ...m,
                    percentage: Math.round((m.completed / m.total) * 100)
                }))
                .sort((a, b) => b.percentage - a.percentage)
        };
    }, [tasks, project]);

    const completionRate = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;

    const metrics = [
        {
            label: "Total Progress",
            value: `${completionRate}%`,
            color: "text-emerald-600 dark:text-emerald-400",
            icon: <CheckCircle className="size-5 text-emerald-600 dark:text-emerald-400" />,
            bg: "bg-emerald-200 dark:bg-emerald-500/10",
        },
        {
            label: "Active Tasks",
            value: stats.inProgress + stats.todo,
            color: "text-blue-600 dark:text-blue-400",
            icon: <Clock className="size-5 text-blue-600 dark:text-blue-400" />,
            bg: "bg-blue-200 dark:bg-blue-500/10",
        },
        {
            label: "Overdue Tasks",
            value: stats.overdue,
            color: "text-red-600 dark:text-red-400",
            icon: <AlertTriangle className="size-5 text-red-600 dark:text-red-400" />,
            bg: "bg-red-200 dark:bg-red-500/10",
        },
        {
            label: "Team Members",
            value: project?.members?.length || 0,
            color: "text-purple-600 dark:text-purple-400",
            icon: <Users className="size-5 text-purple-600 dark:text-purple-400" />,
            bg: "bg-purple-200 dark:bg-purple-500/10",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header with Gauge and Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Progress Gauge */}
                <div className="lg:col-span-1 not-dark:bg-white dark:bg-zinc-950 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-300 dark:border-zinc-800 rounded-lg p-6 flex flex-col items-center justify-center">
                    <h3 className="text-zinc-600 dark:text-zinc-400 text-sm mb-4 font-medium">Overall Progress</h3>
                    <div className="relative size-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { value: completionRate },
                                        { value: 100 - completionRate }
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={75}
                                    startAngle={180}
                                    endAngle={0}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    <Cell fill="#3b82f6" />
                                    <Cell fill="#27272a" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                            <span className="text-3xl font-bold text-zinc-900 dark:text-white">{completionRate}%</span>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Complete</span>
                        </div>
                    </div>
                    <div className="mt-2 text-center">
                        <p className="text-xs text-zinc-500">
                            {stats.completed} of {stats.total} tasks done
                        </p>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {metrics.map((m, i) => (
                        <div
                            key={i}
                            className="not-dark:bg-white dark:bg-zinc-950 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-300 dark:border-zinc-800 rounded-lg p-6"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-1">{m.label}</p>
                                    <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                                </div>
                                <div className={`p-3 rounded-xl ${m.bg}`}>{m.icon}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Team Progress */}
                <div className="lg:col-span-1 not-dark:bg-white dark:bg-zinc-950 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-300 dark:border-zinc-800 rounded-lg p-6">
                    <h2 className="text-zinc-900 dark:text-white mb-6 font-medium flex items-center gap-2">
                        <Users className="size-4 text-blue-500" />
                        Team Progress
                    </h2>
                    <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {memberProgress.length === 0 ? (
                            <p className="text-sm text-zinc-500 text-center py-4">No tasks assigned yet</p>
                        ) : (
                            memberProgress.map((m) => (
                                <div key={m.email || m.name} className="space-y-2 group">
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-3">
                                            {m.image ? (
                                                <img src={m.image} alt={m.name} className="size-8 rounded-full border-2 border-zinc-800" />
                                            ) : (
                                                <div className="size-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300">
                                                    {m.name.charAt(0)}
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="text-zinc-200 font-medium truncate max-w-[120px]">{m.name}</span>
                                                <span className="text-[10px] text-zinc-500">{m.total} tasks</span>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col">
                                            <span className="text-zinc-200 font-bold">{m.percentage}%</span>
                                            <span className="text-[10px] text-zinc-500">{m.completed} done</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className={`h-1.5 rounded-full transition-all duration-1000 ease-out ${
                                                m.percentage > 75 ? 'bg-emerald-500' : 
                                                m.percentage > 40 ? 'bg-blue-500' : 'bg-amber-500'
                                            }`}
                                            style={{ width: `${m.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Tasks by Status Chart */}
                <div className="lg:col-span-2 not-dark:bg-white dark:bg-zinc-950 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-300 dark:border-zinc-800 rounded-lg p-6">
                    <h2 className="text-zinc-900 dark:text-white mb-8 font-medium">Task Distribution by Status</h2>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="name"
                                tick={{ fill: "#71717a", fontSize: 11 }}
                                axisLine={{ stroke: "#3f3f46" }}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis 
                                tick={{ fill: "#71717a", fontSize: 11 }} 
                                axisLine={{ stroke: "#3f3f46" }}
                                tickLine={false}
                                allowDecimals={false}
                            />
                            <Bar dataKey="value" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={45}>
                                {statusData.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={
                                            entry.name === 'DONE' ? '#10b981' : 
                                            entry.name === 'IN PROGRESS' ? '#3b82f6' : 
                                            entry.name === 'REVIEW' ? '#8b5cf6' : 
                                            entry.name === 'TODO' ? '#71717a' : '#3f3f46'
                                        } 
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom Row Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Tasks by Type */}
                <div className="not-dark:bg-white dark:bg-zinc-950 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-300 dark:border-zinc-800 rounded-lg p-6 overflow-hidden">
                    <h2 className="text-zinc-900 dark:text-white mb-4 font-medium flex items-center gap-2">
                        <BarChart3Icon className="size-4 text-emerald-500" />
                        Tasks by Type
                    </h2>
                    <div className="flex items-center justify-center h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={typeData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {typeData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-xl font-bold text-white">{stats.total}</span>
                            <span className="text-[10px] text-zinc-500 uppercase">Total</span>
                        </div>
                    </div>
                </div>

                {/* Priority Breakdown */}
                <div className="not-dark:bg-white dark:bg-zinc-950 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-300 dark:border-zinc-800 rounded-lg p-6">
                    <h2 className="text-zinc-900 dark:text-white mb-6 font-medium flex items-center gap-2">
                        <AlertTriangle className="size-4 text-amber-500" />
                        Priority Distribution
                    </h2>
                    <div className="space-y-6">
                        {priorityData.map((p) => (
                            <div key={p.name} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className={`size-2 rounded-full ${
                                            p.name === 'HIGH' ? 'bg-emerald-500' : 
                                            p.name === 'MEDIUM' ? 'bg-blue-500' : 'bg-zinc-500'
                                        }`} />
                                        <span className="text-zinc-300 capitalize text-sm">{p.name.toLowerCase()} Priority</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-zinc-500 text-xs">{p.value} tasks</span>
                                        <span className="text-zinc-200 font-bold text-sm w-9 text-right">{p.percentage}%</span>
                                    </div>
                                </div>
                                <div className="w-full bg-zinc-800 rounded-full h-1.5">
                                    <div
                                        className={`h-1.5 rounded-full transition-all duration-1000 ${
                                            p.name === 'HIGH' ? 'bg-emerald-500' : 
                                            p.name === 'MEDIUM' ? 'bg-blue-500' : 'bg-zinc-500'
                                        }`}
                                        style={{ width: `${p.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectAnalytics;

