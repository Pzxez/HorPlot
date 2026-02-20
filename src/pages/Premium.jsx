import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { Sparkles, Share2, Network, Lock, Crown, ChevronRight, Loader2, Info } from 'lucide-react';

const Premium = ({ showToast, isPremium, purchasedFeatures, setActiveTab }) => {
    const handleComingSoon = () => {
        showToast('ระบบชำระเงินจะเปิดให้บริการเร็วๆ นี้', 'info');
    };

    const isOwned = (key) => isPremium || purchasedFeatures?.includes(key);

    const copyUID = () => {
        navigator.clipboard.writeText(auth.currentUser?.uid);
        showToast('คัดลอก User ID เรียบร้อยแล้ว', 'success');
    };

    return (
        <div className="flex-1 min-h-screen bg-gradient-to-br from-indigo-50/50 via-purple-50/50 to-amber-50/50 p-4 md:p-8 animate-in fade-in duration-700">
            <div className="max-w-6xl mx-auto pt-8 md:pt-12">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest mb-6 animate-bounce">
                        <Crown className="w-4 h-4" />
                        <span>Exclusive Features</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-gradient mb-6 tracking-tight">
                        Power Up Your Storytelling
                    </h1>
                    <p className="text-muted text-lg max-w-2xl mx-auto font-medium leading-relaxed">
                        ปลดล็อกเครื่องมือระดับมืออาชีพที่จะช่วยเปลี่ยนจินตนาการของคุณให้กลายเป็นโปรเจกต์ที่น่าตื่นตาตื่นใจที่สุด
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    {/* Feature 1: Social Media AU Simulator */}
                    <div className="group relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-accent-secondary rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative glass-card p-10 bg-white/40 backdrop-blur-3xl border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.05)] h-full flex flex-col">
                            <div className="flex justify-between items-start mb-8">
                                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30">
                                    <Sparkles className="text-white w-8 h-8" />
                                </div>
                                {!isOwned('social_sim') && (
                                    <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-500">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                )}
                            </div>

                            <h3 className="text-2xl font-bold text-[var(--text-main)] mb-4">Social Media AU Simulator</h3>
                            <p className="text-muted leading-relaxed mb-8 flex-grow">
                                เปลี่ยนพล็อตนิยายให้กลายเป็นภาพจำลองแชทและโซเชียล (X, Line, Instagram) ในสไตล์ Liquid Glass เพื่อใช้โปรโมตนิยายของคุณให้น่าดึงดูดกว่าใคร
                            </p>

                            {isOwned('social_sim') ? (
                                <button
                                    onClick={handleComingSoon}
                                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 py-4 rounded-2xl font-black text-white shadow-xl shadow-amber-500/20 hover:scale-[1.02] transition-all"
                                >
                                    <span>Get Started</span>
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            ) : (
                                <div className="flex items-center space-x-2 text-amber-500/40 font-bold uppercase tracking-widest text-[10px]">
                                    <Info className="w-3 h-3" />
                                    <span>Premium Access Required</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Feature 2: Interactive Character Relationship Map */}
                    <div className="group relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-primary to-amber-500 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative glass-card p-10 bg-white/40 backdrop-blur-3xl border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.05)] h-full flex flex-col">
                            <div className="flex justify-between items-start mb-8">
                                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
                                    <Network className="text-white w-8 h-8" />
                                </div>
                                {!isOwned('relationship_map') && (
                                    <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-500">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                )}
                            </div>

                            <h3 className="text-2xl font-bold text-[var(--text-main)] mb-4">Interactive Relationship Map</h3>
                            <p className="text-muted leading-relaxed mb-8 flex-grow">
                                จัดการความสัมพันธ์ที่ซับซ้อนด้วยแผนผังใยแมงมุมแบบลากวาง (Spider Web) เห็นภาพรวมความรักและความแค้นของตัวละครบนแผ่นกระจกสีทองแบบ Interactive
                            </p>

                            {isOwned('relationship_map') ? (
                                <button
                                    onClick={() => setActiveTab('relationship-map')}
                                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 py-4 rounded-2xl font-black text-white shadow-xl shadow-indigo-500/20 hover:scale-[1.02] transition-all"
                                >
                                    <span>Get Started</span>
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            ) : (
                                <div className="flex items-center space-x-2 text-amber-500/40 font-bold uppercase tracking-widest text-[10px]">
                                    <Info className="w-3 h-3" />
                                    <span>Premium Access Required</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pricing / CTA Section */}
                <div className="max-w-md mx-auto relative">
                    <div className="absolute -inset-4 bg-amber-500/5 blur-3xl opacity-30 rounded-full"></div>
                    <div className="relative glass-card bg-white/60 backdrop-blur-2xl border border-white/20 p-8 text-center rounded-[3rem]">
                        <h4 className="text-amber-500 font-bold tracking-[0.2em] uppercase text-sm mb-2">Premium Early Bird</h4>
                        <div className="text-4xl font-black text-[var(--text-main)] mb-8">
                            99.- <span className="text-lg text-muted font-bold tracking-normal italic">/ month</span>
                        </div>

                        {!isPremium ? (
                            <button
                                onClick={handleComingSoon}
                                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-5 rounded-3xl font-black shadow-2xl shadow-amber-500/30 hover:scale-[1.02] transition-all active:scale-[0.98]"
                            >
                                Unlock All Features
                            </button>
                        ) : (
                            <div className="py-4 px-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 font-black italic">
                                You are already a Legend.
                            </div>
                        )}

                        <p className="mt-6 text-[10px] text-muted/40 font-bold tracking-widest uppercase">
                            Secure your early bird price forever.
                        </p>
                    </div>
                </div>

                <div className="mt-20 text-center pb-12 flex flex-col items-center">
                    {!isPremium && (
                        <div className="mb-8 p-4 rounded-2xl bg-white/40 border border-white/60 backdrop-blur-md max-w-sm w-full shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2">Your Profile ID</p>
                            <div className="flex items-center space-x-2 bg-black/5 p-2 rounded-xl border border-black/5">
                                <code className="text-[10px] font-mono text-accent-primary break-all flex-1 text-left">{auth.currentUser?.uid}</code>
                                <button
                                    onClick={copyUID}
                                    className="p-1.5 hover:bg-accent-primary/10 rounded-lg transition-colors group"
                                    title="Copy ID"
                                >
                                    <ChevronRight className="w-3 h-3 text-muted group-hover:text-accent-primary" />
                                </button>
                            </div>
                            <p className="mt-2 text-[8px] text-muted italic leading-relaxed">
                                หากคุณตั้งค่า Premium ใน Firestore แล้วแต่ยังไม่ขึ้น <br />
                                โปรดตรวจสอบว่า Document ID ตรงกับไอดีด้านบน
                            </p>
                        </div>
                    )}
                    <p className="text-[10px] text-muted/20 font-black uppercase tracking-[0.3em] italic">
                        © 2026 HorPlot | หอพล็อต – หอพักนักเขียน
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Premium;
