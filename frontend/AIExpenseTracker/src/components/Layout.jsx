import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import { useEffect, useState } from 'react';

const Layout = () => {
    const [theme, setTheme] = useState(
        localStorage.getItem('theme') || 'light'
    );

    useEffect(() => {
        const root = document.documentElement;

        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <div className="h-screen flex bg-slate-100 dark:bg-[#020617] transition-all duration-300 overflow-hidden">
            <Sidebar theme={theme} />

            <div className="flex-1 flex flex-col min-w-0">
                <Topbar theme={theme} setTheme={setTheme} />

                <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-100 dark:bg-[#020617] text-slate-900 dark:text-white transition-all duration-300">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;