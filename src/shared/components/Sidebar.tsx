import { NavLink } from 'react-router-dom';
import {
    Home,
    Map as MapIcon,
    ShieldCheck,
    Sword,
    Settings,
    LayoutDashboard,
    Trophy,
    History as HistoryIcon,
    BookOpen
} from 'lucide-react';

export function Sidebar() {
    const links = [
        { to: '/', icon: <Home size={20} />, label: 'Home' },
        { to: '/capital', icon: <Trophy size={20} />, label: 'Capital' },
        { to: '/map', icon: <MapIcon size={20} />, label: 'Campaign Map' },
        { to: '/daily-orders', icon: <LayoutDashboard size={20} />, label: 'Daily Orders' },
        { to: '/war-council', icon: <Sword size={20} />, label: 'War Council' },
        { to: '/chronicle', icon: <BookOpen size={20} />, label: 'Chronicle' },
        { to: '/daily-history', icon: <HistoryIcon size={20} />, label: 'Logs' },
        { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
    ];

    return (
        <aside className="w-64 h-full bg-[#0b1218] border-r border-[rgba(248,244,234,0.08)] flex flex-col pt-8 pb-4">
            <div className="px-6 mb-12">
                <h1 className="text-xl font-black tracking-tighter flex items-center gap-2 text-[#f8f4ea]">
                    <ShieldCheck className="text-[#f0b35f]" />
                    TASKER
                </h1>
            </div>

            <nav className="flex-1 px-3 space-y-1">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => `
              flex items-center gap-3 px-3 py-3 rounded-xl transition-all group
              ${isActive
                                ? 'bg-[#f0b35f]/10 text-[#f0b35f] font-bold shadow-[inset_0_0_20px_rgba(240,179,95,0.05)]'
                                : 'text-muted-foreground hover:bg-white/5 hover:text-white'}
            `}
                    >
                        <span className="transition-transform group-hover:scale-110">
                            {link.icon}
                        </span>
                        <span className="text-sm tracking-wide">{link.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="px-6 mt-auto">
                <NavLink
                    to="/check-in"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#f0b35f] text-[#0b1218] font-black rounded-xl hover:bg-[#f0c38f] transition-all shadow-lg shadow-[#f0b35f]/10"
                >
                    Check-in
                </NavLink>
            </div>
        </aside>
    );
}
