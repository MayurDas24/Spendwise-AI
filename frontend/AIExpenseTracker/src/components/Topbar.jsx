import { Bell, Search, Moon, Sun } from 'lucide-react';

import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const greeting = () => {
    const h = new Date().getHours();

    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    if (h < 21) return 'Good evening';

    return 'Good night';
};

const formatToday = () =>
    new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });

const Topbar = () => {
    const { user } = useAuth();

    const { darkMode, toggleTheme } = useTheme();

    const firstName = user?.name?.split(' ')[0] || '';

    return (
        <header className="h-20 bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0 transition-all duration-300">

            <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {greeting()}
                    {firstName && `, ${firstName}`} 👋
                </div>

                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {formatToday()}
                </div>
            </div>

            <div className="flex items-center gap-3">

                {/* THEME TOGGLE */}
                <button
                    onClick={toggleTheme}
                    className="h-11 w-11 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-yellow-400 hover:scale-105 transition-all flex items-center justify-center"
                >
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* SEARCH */}
                <button
                    className="h-11 w-11 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-105 transition-all flex items-center justify-center"
                >
                    <Search size={19} />
                </button>

                {/* NOTIFICATIONS */}
                <button
                    className="relative h-11 w-11 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-105 transition-all flex items-center justify-center"
                >
                    <Bell size={19} />

                    <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                </button>
            </div>
        </header>
    );
};

export default Topbar;