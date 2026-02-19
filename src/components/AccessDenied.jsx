import React from 'react';
import { Lock, ArrowRight } from 'lucide-react';

const AccessDenied = ({ language }) => {
    const t = {
        TH: {
            title: 'พื้นที่เฉพาะกิจ',
            desc: 'กรุณาเลือกหรือสร้างนิยายในหน้าหลักก่อนเพื่อเริ่มต้นบันทึกข้อมูล',
            back: 'กลับไปที่หน้าหลัก'
        },
        EN: {
            title: 'Chamber Locked',
            desc: 'Please select or create a novel from the Dashboard to access this section.',
            back: 'Go to Dashboard'
        }
    };

    const currentT = t[language] || t.EN;

    return (
        <div className="h-[70vh] flex items-center justify-center p-6 mt-10">
            <div className="glass-card max-w-lg w-full p-12 text-center space-y-8 animate-in zoom-in-95 duration-700 border-white/40 shadow-2xl">
                <div className="inline-flex p-6 rounded-3xl bg-accent-primary/10 text-accent-primary mb-2 shadow-inner">
                    <Lock className="w-12 h-12" />
                </div>
                <div className="space-y-4">
                    <h2 className="text-4xl font-black text-gradient">{currentT.title}</h2>
                    <p className="text-muted font-medium text-lg leading-relaxed">
                        {currentT.desc}
                    </p>
                </div>
                <div className="pt-4">
                    <button
                        onClick={() => window.location.reload()} // Easy way to trigger re-nav if App handles state
                        className="inline-flex items-center space-x-3 text-accent-primary font-black uppercase tracking-widest hover:text-accent-secondary transition-colors group"
                    >
                        <span>{currentT.back}</span>
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccessDenied;
