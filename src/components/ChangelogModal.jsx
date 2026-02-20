import React from 'react';
import { X, CheckCircle2, Zap, Layout, ShieldCheck } from 'lucide-react';

const ChangelogModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const changes = [
        {
            type: 'Legal',
            icon: ShieldCheck,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            title: 'High-Security Legal Gate (v1.1.3)',
            desc: 'Implemented a mandatory, bank-grade E-signature overlay requiring users to explicitly accept updated Thai/English PDPA terms before accessing the app.'
        },
        {
            type: 'Security',
            icon: Lock,
            color: 'text-rose-500',
            bg: 'bg-rose-500/10',
            title: 'Firestore Guardian Rules',
            desc: 'Upgraded database permissions. All core collections now strictly verify explicit term acceptance before allowing any read/write operations.'
        },
        {
            type: 'Update',
            icon: Layout,
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10',
            title: 'Refined UI & Branding',
            desc: 'Enhanced the Terms Modal with a "Force Scroll" requirement, a new acceptance checkbox, and updated app-wide branding to "HorPlot | หอพล็อต".'
        },
        {
            type: 'Fix',
            icon: Zap,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            title: 'E-signature Canvas Reliability',
            desc: 'Resolved edge-case crashes when saving blank or un-trimmed signatures by adding robust fallback mechanisms.'
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/20 backdrop-blur-md animate-in fade-in duration-300">
            <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border-white/40 shadow-2xl animate-in zoom-in-95 duration-300 bg-white/80">
                {/* Header */}
                <div className="p-6 md:p-8 flex items-center justify-between border-b border-glass-stroke bg-white/20">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gradient">HorPlot v1.0.3</h2>
                        <p className="text-xs font-bold text-muted uppercase tracking-widest mt-1">Security & Legal Gate Update</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-black/5 transition-colors text-muted hover:text-accent-primary"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
                    {changes.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <div key={idx} className="flex gap-6 group">
                                <div className={`shrink-0 w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center border border-white/10 transition-transform group-hover:scale-110 duration-500`}>
                                    <Icon className={`w-6 h-6 ${item.color}`} />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${item.bg} ${item.color} border border-white/40`}>
                                            {item.type}
                                        </span>
                                        <h3 className="font-bold text-[var(--text-main)] text-lg">{item.title}</h3>
                                    </div>
                                    <p className="text-muted text-sm leading-relaxed font-medium">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-glass-stroke bg-white/20 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-accent-primary hover:bg-accent-primary/80 text-white px-8 py-3 rounded-2xl font-black transition-all shadow-lg shadow-accent-primary/20"
                    >
                        Got it!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangelogModal;
