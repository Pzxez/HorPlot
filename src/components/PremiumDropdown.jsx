import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Network, Share2, ChevronDown, Lock } from 'lucide-react';

const PremiumDropdown = ({ setActiveTab, isPremium, purchasedFeatures, selectedProjectId, showToast, language }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const lockMsg = language === 'TH' ? 'กรุณาเลือกนิยายที่ต้องการเขียนก่อน' : 'Please select a novel first';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleItemClick = (id) => {
        if (!selectedProjectId) {
            setActiveTab('dashboard');
            showToast(lockMsg, 'info');
            setIsOpen(false);
            return;
        }
        setActiveTab(id);
        setIsOpen(false);
    };

    if (!isPremium && (!purchasedFeatures || purchasedFeatures.length === 0)) return null;

    const allItems = [
        {
            id: 'relationship-map',
            key: 'relationship_map',
            label: 'Relationship Map',
            icon: Network,
            desc: 'Character Spider Web',
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10'
        },
        {
            id: 'social-au',
            key: 'social_sim',
            label: 'Social Media AU',
            icon: Share2,
            desc: 'Chat Simulator',
            color: 'text-amber-500',
            bg: 'bg-amber-500/10'
        }
    ];

    const visibleItems = allItems.filter(item => isPremium || purchasedFeatures?.includes(item.key));

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-2xl font-bold text-xs transition-all duration-300 border-2 ${isOpen
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xl shadow-amber-500/20 scale-100'
                    : 'glass-card border-transparent text-amber-500 hover:bg-amber-500/5 hover:scale-100'
                    }`}
            >
                <Sparkles className="w-4 h-4" />
                <span className="hidden xl:inline">เครื่องมือพิเศษ</span>
                <span className="xl:hidden">Premium</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-3 w-72 glass-card p-3 border-white/20 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300 z-[100]">
                    <div className="space-y-1">
                        {visibleItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleItemClick(item.id)}
                                className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 text-left group border border-transparent hover:bg-accent-primary/5 hover:border-accent-primary/10 ${!selectedProjectId ? 'opacity-50' : ''}`}
                            >
                                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center border border-white/5 transition-transform group-hover:scale-110`}>
                                    <item.icon className={`w-5 h-5 ${item.color}`} />
                                </div>
                                <div className="flex-1">
                                    <span className="font-bold text-[var(--text-main)] text-sm">{item.label}</span>
                                    <p className="text-[10px] text-muted font-bold uppercase tracking-widest">{item.desc}</p>
                                </div>
                            </button>
                        ))}

                        <div className="h-px bg-glass-stroke my-2 mx-2" />

                        <button
                            onClick={() => {
                                setActiveTab('premium');
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center justify-center space-x-2 p-3 rounded-xl transition-all duration-300 text-amber-500 hover:bg-amber-500/5 font-bold text-xs"
                        >
                            <Sparkles className="w-3 h-3" />
                            <span>+ ซื้อฟีเจอร์พรีเมียมเพิ่ม</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PremiumDropdown;
