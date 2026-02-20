import React from 'react';
import { LayoutDashboard, Users, GitCommit, Library, LogOut, Settings, Globe, Feather, Crown } from 'lucide-react';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';

const Sidebar = ({ activeTab, setActiveTab, language, setLanguage, selectedProjectId }) => {
    const t = {
        TH: {
            dashboard: 'หน้าหลัก',
            characters: 'ข้อมูลตัวละคร',
            writing: 'เขียนนิยาย',
            timeline: 'เส้นเรื่อง (Timeline)',
            vocab: 'คลังคำศัพท์',
            premium: 'สิทธิพิเศษ (Premium)',
            settings: 'ตั้งค่า',
            logout: 'ออกจากระบบ',
            depart: 'ออกจากระบบ',
            lockMsg: 'กรุณาเลือกนิยายที่ต้องการเขียนก่อน'
        },
        EN: {
            dashboard: 'Dashboard',
            characters: 'Characters',
            writing: 'Writing Room',
            timeline: 'Timeline',
            vocab: 'Vocab',
            premium: 'Premium Features',
            settings: 'Settings',
            logout: 'Logout',
            depart: 'Depart',
            lockMsg: 'Please select a novel first'
        }
    };

    const currentT = t[language];

    const navItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: currentT.dashboard, locked: false },
        { id: 'characters', icon: Users, label: currentT.characters, locked: !selectedProjectId },
        { id: 'writing', icon: Feather, label: currentT.writing, locked: !selectedProjectId },
        { id: 'timeline', icon: GitCommit, label: currentT.timeline, locked: !selectedProjectId },
        { id: 'vocab', icon: Library, label: currentT.vocab, locked: !selectedProjectId },
        { id: 'premium', icon: Crown, label: currentT.premium, locked: false, isPremium: true },
    ];

    const handleLogout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('selectedProjectId');
            window.location.reload(); // Hard reset to ensure clean state
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <aside className="w-72 glass-sidebar h-screen sticky top-0 flex flex-col p-8 z-50 overflow-y-auto">
            <div className="flex items-center space-x-4 mb-16">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-xl shadow-accent-primary/30 shrink-0">
                    <GitCommit className="text-white w-7 h-7 rotate-90" />
                </div>
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-gradient leading-none">HorPlot | หอพล็อต</h2>
                    <p className="text-[11px] font-bold text-muted italic mt-1.5 tracking-wide">
                        หอพักนักเขียน
                    </p>
                </div>
            </div>

            <nav className="flex-1 space-y-3">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            disabled={item.locked}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-500 group relative ${isActive
                                ? item.isPremium
                                    ? 'bg-amber-500/10 text-amber-500 shadow-lg shadow-amber-500/10 border border-amber-500/20'
                                    : 'bg-white/10 text-[var(--text-main)] shadow-sm border border-white/20'
                                : item.locked
                                    ? 'opacity-40 cursor-not-allowed grayscale'
                                    : item.isPremium
                                        ? 'text-amber-500/60 hover:text-amber-500 hover:bg-amber-500/5'
                                        : 'text-muted hover:text-[var(--text-main)] hover:bg-white/5'
                                }`}
                            title={item.locked ? currentT.lockMsg : ""}
                        >
                            <Icon className={`w-6 h-6 transition-all duration-500 ${isActive ? 'scale-110 ' + (item.isPremium ? 'text-amber-500' : 'text-accent-primary') : item.locked ? '' : 'group-hover:scale-110'}`} />
                            <span className="font-bold tracking-tight text-lg">{item.label}</span>
                            {isActive && (
                                <div className={`absolute right-4 w-1.5 h-1.5 rounded-full shadow-lg ${item.isPremium ? 'bg-amber-500 shadow-amber-500/80' : 'bg-accent-primary shadow-[0_0_12px_rgba(129,140,248,0.8)]'}`} />
                            )}
                        </button>
                    );
                })}
            </nav>

            <div className="mt-auto pt-8 border-t border-glass-stroke space-y-3">
                <button
                    onClick={() => setLanguage(language === 'TH' ? 'EN' : 'TH')}
                    className="w-full flex items-center space-x-4 px-5 py-4 rounded-2xl text-accent-primary hover:bg-white/5 transition-all font-black"
                >
                    <div className="w-6 h-6 rounded-lg bg-accent-primary/10 flex items-center justify-center text-xs">
                        {language}
                    </div>
                    <span>{language === 'TH' ? 'English' : 'ภาษาไทย'}</span>
                </button>
                <button className="w-full flex items-center space-x-4 px-5 py-4 rounded-2xl text-muted hover:text-[var(--text-main)] hover:bg-white/5 transition-all">
                    <Settings className="w-6 h-6" />
                    <span className="font-bold">{currentT.settings}</span>
                </button>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-4 px-5 py-4 rounded-2xl text-muted hover:text-red-500 hover:bg-red-500/5 transition-all"
                >
                    <LogOut className="w-6 h-6" />
                    <span className="font-bold">{currentT.depart}</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
