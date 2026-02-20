import React, { useState, useEffect } from 'react';
import { User, Mail, X, Loader2, Edit2, Check } from 'lucide-react';
import { auth, db } from '../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const UserProfile = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editUsername, setEditUsername] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!auth.currentUser) return;
            try {
                const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen && !userData) {
            fetchUserData();
        }
    }, [isOpen, userData]);

    const handleSaveUsername = async () => {
        if (!editUsername.trim() || editUsername === userData?.username) {
            setIsEditing(false);
            return;
        }
        setSaving(true);
        try {
            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                username: editUsername.trim()
            });
            setUserData(prev => ({ ...prev, username: editUsername.trim() }));
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating username:", error);
        } finally {
            setSaving(false);
        }
    };

    const startEditing = () => {
        setEditUsername(userData?.username || '');
        setIsEditing(true);
    };

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 xl:p-3.5 rounded-2xl text-muted hover:text-accent-primary hover:bg-accent-primary/5 transition-all outline-none"
                title="Profile"
            >
                <User className="w-5 h-5 xl:w-6 xl:h-6" />
            </button>

            {/* Backdrop for Mobile/Closing */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[90] lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Profile Popover (Liquid Glass) */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-4 w-72 z-[100] animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="glass-card bg-white/60 backdrop-blur-3xl border border-white/40 shadow-2xl rounded-[2rem] p-6 text-left relative overflow-hidden">

                        {/* Decorative Background */}
                        <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-accent-primary/10 rounded-full blur-2xl" />
                        <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 bg-accent-secondary/10 rounded-full blur-2xl" />

                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <h3 className="text-sm font-black uppercase tracking-widest text-gradient">Profile</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded-xl hover:bg-black/5 text-muted transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center p-6">
                                <Loader2 className="w-6 h-6 animate-spin text-accent-primary" />
                            </div>
                        ) : (
                            <div className="space-y-6 relative z-10">
                                {/* Auto-Generated Avatar (Text Only) */}
                                <div className="flex justify-center">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-lg shadow-accent-primary/20 border-4 border-white/50">
                                        <span className="text-3xl font-black text-white">
                                            {userData?.username?.[0]?.toUpperCase() || userData?.email?.[0]?.toUpperCase() || '?'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-white/40 p-3 rounded-2xl border border-white/60">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-accent-primary opacity-70 mb-1">Username</p>
                                        <div className="flex items-center justify-between">
                                            {isEditing ? (
                                                <div className="flex items-center space-x-2 w-full">
                                                    <input
                                                        type="text"
                                                        value={editUsername}
                                                        onChange={(e) => setEditUsername(e.target.value)}
                                                        className="flex-1 bg-white/50 border border-white/60 rounded-xl px-3 py-1 text-sm font-semibold outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={handleSaveUsername}
                                                        disabled={saving}
                                                        className="p-1.5 rounded-xl bg-accent-primary text-white hover:bg-accent-primary/80 transition-colors disabled:opacity-50"
                                                    >
                                                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                                    </button>
                                                    <button
                                                        onClick={() => setIsEditing(false)}
                                                        className="p-1.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex items-center space-x-2 truncate">
                                                        <User className="w-4 h-4 text-muted shrink-0" />
                                                        <p className="font-semibold text-sm text-[var(--text-main)] truncate">
                                                            {userData?.username || 'Not set'}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={startEditing}
                                                        className="p-1.5 rounded-xl hover:bg-black/5 text-muted hover:text-accent-primary transition-colors shrink-0"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-white/40 p-4 rounded-2xl border border-white/60">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-accent-primary opacity-70 mb-1">Email</p>
                                        <div className="flex items-center space-x-2">
                                            <Mail className="w-4 h-4 text-muted shrink-0" />
                                            <p className="font-semibold text-sm text-[var(--text-main)] truncate">
                                                {userData?.email || auth.currentUser?.email || 'No email found'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
