import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    ArrowLeftRight,
    Folder,
    Target,
    Sparkles,
    Wallet,
    LogOut,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext.jsx';

const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { to: '/categories', label: 'Categories', icon: Folder },
    { to: '/budgets', label: 'Budgets', icon: Target },
    { to: '/insights', label: 'AI Insights', icon: Sparkles },
];

const Sidebar = () => {
    const { user, logout } = useAuth();

    const initial = user?.name?.[0]?.toUpperCase() || 'U';

    return (
        <aside className="w-64 bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800 hidden lg:flex flex-col shrink-0 transition-all duration-300">

            {/* Logo */}
            <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-200 dark:border-slate-800">

                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                    <Wallet size={18} className="text-white" />
                </div>

                <div>
                    <h1 className="font-bold text-lg text-slate-900 dark:text-white">
                        ExpenseAI
                    </h1>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Smart Finance Tracker
                    </p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-2">

                {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) =>
                            `relative flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200
                            
                            ${
                                isActive
                                    ? `
                                        bg-violet-50 dark:bg-violet-500/15
                                        text-violet-700 dark:text-violet-300
                                        before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-full before:bg-violet-500
                                      `
                                    : `
                                        text-slate-700 dark:text-slate-300
                                        hover:bg-slate-100 dark:hover:bg-slate-800
                                      `
                            }`
                        }
                    >
                        <Icon size={20} strokeWidth={1.8} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 transition-all">

                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                        {initial}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {user?.name || 'User'}
                        </div>

                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {user?.email}
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        title="Logout"
                        className="p-2 rounded-xl text-slate-400 hover:bg-rose-100 dark:hover:bg-rose-500/10 hover:text-rose-600 transition-all shrink-0"
                    >
                        <LogOut size={17} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;