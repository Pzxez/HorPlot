import React, { useState } from 'react';
import ChangelogModal from './ChangelogModal';

const Footer = () => {
    const [isChangelogOpen, setIsChangelogOpen] = useState(false);

    return (
        <>
            <footer className="py-8 px-6 mt-auto border-t border-glass-stroke flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setIsChangelogOpen(true)}
                        className="text-[10px] font-black tracking-widest uppercase text-accent-primary hover:text-accent-secondary transition-colors italic px-3 py-1 rounded-full bg-accent-primary/5 border border-accent-primary/10"
                    >
                        HorPlot v1.0.3
                    </button>
                    <span className="text-[10px] text-muted font-bold uppercase tracking-widest opacity-30">
                        • หอพักนักเขียน
                    </span>
                </div>

                <div className="flex items-center space-x-6">
                    <a href="#" className="text-[9px] font-black text-muted hover:text-accent-primary uppercase tracking-widest transition-colors">Privacy Policy</a>
                    <a href="#" className="text-[9px] font-black text-muted hover:text-accent-primary uppercase tracking-widest transition-colors">Terms of Service</a>
                    <span className="text-[9px] font-black text-muted/20 uppercase tracking-[0.2em]">© 2026 Pzxez</span>
                </div>
            </footer>

            <ChangelogModal
                isOpen={isChangelogOpen}
                onClose={() => setIsChangelogOpen(false)}
            />
        </>
    );
};

export default Footer;
