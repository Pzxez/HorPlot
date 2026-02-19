import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
        error: <AlertCircle className="w-5 h-5 text-rose-500" />,
        info: <Info className="w-5 h-5 text-accent-primary" />
    };

    const colors = {
        success: 'border-emerald-500/20 bg-emerald-500/5',
        error: 'border-rose-500/20 bg-rose-500/5',
        info: 'border-accent-primary/20 bg-accent-primary/5'
    };

    return (
        <div className={`fixed bottom-8 right-8 z-[100] glass-card px-6 py-4 flex items-center space-x-4 border shadow-2xl animate-in slide-in-from-right-full fade-in duration-500 ${colors[type]}`}>
            <div className="shrink-0">{icons[type]}</div>
            <p className="text-sm font-bold tracking-tight pr-4">{message}</p>
            <button
                onClick={onClose}
                className="p-1 hover:bg-black/5 rounded-lg transition-colors text-muted hover:text-[var(--text-main)]"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default Toast;
