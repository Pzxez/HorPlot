import React, { useState } from 'react';
import { Menu, X, GitCommit, LogOut, Settings, Globe, LayoutDashboard, Users, Feather, GitPullRequest, Library, Crown, Network, Share2, Lock } from 'lucide-react';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import PremiumDropdown from './PremiumDropdown';
import UserProfile from './UserProfile';

const Navbar = ({ activeTab, setActiveTab, language, setLanguage, selectedProjectId, selectedProject, isPremium, purchasedFeatures, showToast }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const t = {
        TH: {
            dashboard: 'หน้าหลัก',
            characters: 'ข้อมูลตัวละคร',
            writing: 'เขียนนิยาย',
            timeline: 'เส้นเรื่อง',
            vocab: 'คลังคำศัพท์',
            premium: 'Premium',
            logout: 'ออกจากระบบ',
            logout: 'ออกจากระบบ',
            lockMsg: 'กรุณาเลือกนิยายที่ต้องการเขียนก่อน',
            activeProject: 'กำลังเขียนเรื่อง:',
            premiumTools: 'เครื่องมือพิเศษ',
            buyMore: '+ ซื้อฟีเจอร์พรีเมียมเพิ่ม'
        },
        EN: {
            dashboard: 'Dashboard',
            characters: 'Characters',
            writing: 'Writing Room',
            timeline: 'Timeline',
            vocab: 'Vocab',
            premium: 'Premium',
            logout: 'Logout',
            lockMsg: 'Please select a novel first',
            activeProject: 'Active Project:',
            premiumTools: 'Premium Tools',
            buyMore: '+ Unlock More Features'
        }
    };

    const currentT = t[language];

    const navItems = [
        { id: 'dashboard', label: currentT.dashboard, icon: LayoutDashboard },
        { id: 'characters', label: currentT.characters, icon: Users, guard: true },
        { id: 'writing', label: currentT.writing, icon: Feather, guard: true },
        { id: 'timeline', label: currentT.timeline, icon: GitPullRequest, guard: true },
        { id: 'vocab', label: currentT.vocab, icon: Library, guard: true },
        {
            id: 'premium',
            label: currentT.premium,
            icon: Crown,
            premium: true,
            hidden: isPremium || (purchasedFeatures && purchasedFeatures.length > 0)
        }
    ];

    const handleTabClick = (itemId) => {
        const item = navItems.find(i => i.id === itemId);
        if (item?.guard && !selectedProjectId) {
            setActiveTab('dashboard');
            showToast(currentT.lockMsg, 'info');
            return;
        }
        setActiveTab(itemId);
    };

    const filteredNavItems = navItems.filter(item => !item.hidden);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('selectedProjectId');
            window.location.reload();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <>
            <nav className="sticky top-0 w-full z-[80] backdrop-blur-md bg-white/70 border-b border-glass-stroke transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    {/* Brand & Active Badge */}
                    <div className="flex items-center space-x-4 xl:space-x-8 shrink-0">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className="flex items-center space-x-3 group active:scale-95 transition-transform"
                        >
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-lg shadow-accent-primary/20 rotate-12 group-hover:rotate-0 transition-transform duration-500 shrink-0">
                                <GitCommit className="text-white w-6 h-6 rotate-90" />
                            </div>
                            <div className="hidden sm:block text-left shrink-0">
                                <h2 className="text-2xl font-black tracking-tight text-gradient leading-none whitespace-nowrap">HorPlot | หอพล็อต</h2>
                                <p className="text-[9px] font-bold text-muted uppercase tracking-[0.2em] mt-1 opacity-60">หอพักนักเขียน</p>
                            </div>
                        </button>

                        {selectedProject && (
                            <div className="hidden md:flex items-center space-x-3 bg-accent-primary/5 border border-accent-primary/20 px-4 py-2 rounded-2xl animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
                                <div className="text-[10px] font-black uppercase tracking-widest text-accent-primary flex flex-col">
                                    <span className="opacity-50 text-[8px]">{currentT.activeProject}</span>
                                    <span className="truncate max-w-[150px]">{selectedProject.title}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center space-x-2">
                        {filteredNavItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleTabClick(item.id)}
                                className={`px-4 py-2 rounded-2xl font-bold text-sm transition-all duration-300 relative group flex items-center space-x-2 whitespace-nowrap ${activeTab === item.id
                                    ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/20 scale-100'
                                    : (item.guard && !selectedProjectId)
                                        ? 'opacity-40 hover:opacity-100'
                                        : 'text-muted hover:text-accent-primary hover:bg-accent-primary/5 hover:scale-100'
                                    }`}
                            >
                                <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'opacity-100' : 'opacity-50'}`} />
                                <span>{item.label}</span>
                                {activeTab === item.id && (
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent-primary shadow-lg shadow-accent-primary animate-pulse" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-3 shrink-0">
                        <div className="hidden lg:block">
                            <PremiumDropdown
                                isPremium={isPremium}
                                purchasedFeatures={purchasedFeatures}
                                setActiveTab={setActiveTab}
                                selectedProjectId={selectedProjectId}
                                showToast={showToast}
                                language={language}
                            />
                        </div>

                        <div className="hidden lg:block h-5 w-[1px] bg-glass-stroke mx-2" />

                        <button
                            onClick={() => setLanguage(language === 'TH' ? 'EN' : 'TH')}
                            className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-black/5 hover:bg-black/10 text-[10px] font-black uppercase tracking-widest text-muted transition-colors"
                        >
                            <Globe className="w-4 h-4 text-accent-primary" />
                            <span>{language}</span>
                        </button>

                        <UserProfile />

                        <button
                            onClick={handleLogout}
                            className="hidden lg:flex p-2.5 rounded-2xl text-muted hover:text-red-500 hover:bg-red-500/5 transition-all"
                            title={currentT.logout}
                        >
                            <LogOut className="w-5 h-5" />
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="lg:hidden p-3 rounded-2xl glass-card border-transparent text-muted active:scale-90 transition-transform"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Sidebar Navigation */}
            <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
                <aside className={`absolute right-0 top-0 h-full w-full max-w-xs bg-[var(--bg-mesh-4)] border-l border-glass-stroke shadow-2xl transition-transform duration-500 flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="p-8 flex items-center justify-between border-b border-glass-stroke bg-white/5">
                        <h2 className="text-xl font-bold text-gradient uppercase tracking-widest">Navigation</h2>
                        <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-xl hover:bg-white/10 text-muted">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                        {filteredNavItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    handleTabClick(item.id);
                                    setIsMenuOpen(false);
                                }}
                                className={`w-full flex items-center space-x-4 p-5 rounded-2xl transition-all duration-300 group ${activeTab === item.id
                                    ? 'bg-accent-primary text-white ring-1 ring-accent-primary/20 shadow-lg shadow-accent-primary/20'
                                    : (item.guard && !selectedProjectId)
                                        ? 'opacity-40 grayscale'
                                        : 'text-muted hover:bg-black/5'
                                    }`}
                            >
                                <item.icon className={`w-6 h-6 ${activeTab === item.id ? 'text-white' : ''}`} />
                                <span className="font-bold text-lg">{item.label}</span>
                                {item.premium && (
                                    <Crown className="w-4 h-4 ml-auto text-amber-500 animate-pulse" />
                                )}
                            </button>
                        ))}

                        {(isPremium || (purchasedFeatures && purchasedFeatures.length > 0)) && (
                            <div className="pt-6 mt-6 border-t border-glass-stroke space-y-2">
                                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.2em] ml-2 mb-4">{currentT.premiumTools}</p>

                                <button
                                    onClick={() => {
                                        if (isPremium || purchasedFeatures?.includes('relationship_map')) {
                                            setActiveTab('relationship-map');
                                            setIsMenuOpen(false);
                                        }
                                    }}
                                    className={`w-full flex items-center space-x-4 p-5 rounded-2xl transition-all border 
                                        ${(isPremium || purchasedFeatures?.includes('relationship_map'))
                                            ? 'text-indigo-500 bg-indigo-500/5 hover:bg-indigo-500/10 border-indigo-500/20 cursor-pointer'
                                            : 'text-muted bg-white/5 opacity-50 grayscale cursor-not-allowed border-transparent'
                                        }`}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center space-x-4">
                                            <Network className="w-6 h-6" />
                                            <span className="font-bold text-lg">Relationship Map</span>
                                        </div>
                                        {!(isPremium || purchasedFeatures?.includes('relationship_map')) && (
                                            <Lock className="w-4 h-4" />
                                        )}
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        if (isPremium || purchasedFeatures?.includes('social_sim')) {
                                            setActiveTab('social-au');
                                            setIsMenuOpen(false);
                                        }
                                    }}
                                    className={`w-full flex items-center space-x-4 p-5 rounded-2xl transition-all border 
                                        ${(isPremium || purchasedFeatures?.includes('social_sim'))
                                            ? 'text-amber-500 bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/20 cursor-pointer'
                                            : 'text-muted bg-white/5 opacity-50 grayscale cursor-not-allowed border-transparent'
                                        }`}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center space-x-4">
                                            <Share2 className="w-6 h-6" />
                                            <span className="font-bold text-lg">Social Media AU</span>
                                        </div>
                                        {!(isPremium || purchasedFeatures?.includes('social_sim')) && (
                                            <Lock className="w-4 h-4" />
                                        )}
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        setActiveTab('premium');
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full flex items-center justify-center space-x-2 p-4 rounded-2xl text-amber-500 hover:bg-amber-500/5 font-bold mt-4 border border-dashed border-amber-500/30"
                                >
                                    <Crown className="w-4 h-4" />
                                    <span>{currentT.buyMore}</span>
                                </button>
                            </div>
                        )}
                    </nav>

                    <div className="p-6 bg-black/5 border-t border-glass-stroke space-y-4">
                        <button
                            onClick={() => {
                                setLanguage(language === 'TH' ? 'EN' : 'TH');
                                setIsMenuOpen(false);
                            }}
                            className="w-full flex items-center justify-between p-5 rounded-2xl bg-black/5 text-muted font-bold"
                        >
                            <div className="flex items-center space-x-4">
                                <Globe className="w-5 h-5 text-accent-primary" />
                                <span>Switch Language</span>
                            </div>
                            <span className="text-xs px-2 py-1 rounded-lg bg-accent-primary/10 text-accent-primary">{language}</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-4 p-5 rounded-2xl text-red-500 hover:bg-red-500/5 transition-all font-bold"
                        >
                            <LogOut className="w-6 h-6" />
                            <span>{currentT.logout}</span>
                        </button>
                    </div>
                </aside>
            </div>
        </>
    );
};

export default Navbar;
