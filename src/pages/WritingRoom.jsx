import React, { useState, useEffect, useRef } from 'react';
import { Save, Loader2, Feather, Check, AlertCircle } from 'lucide-react';
import { saveStory, getStory } from '../firebase/storyService';
import AccessDenied from '../components/AccessDenied';

const WritingRoom = ({ language, projectId, showToast }) => {
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [lastSaved, setLastSaved] = useState(null);
    const [loading, setLoading] = useState(true);
    const saveTimerRef = useRef(null);

    const t = {
        TH: {
            placeholder: 'เริ่มเขียนเรื่องของคุณที่นี่...',
            words: 'คำ',
            saving: 'กำลังบันทึก...',
            saved: 'บันทึกแล้วเมื่อ',
            autoSaveMsg: 'ระบบบันทึกอัตโนมัติ',
            successSave: 'บันทึกเรื่องราวแล้ว',
            errorSave: 'เกิดข้อผิดพลาดในการบันทึก',
            loadingMsg: 'กำลังเปิดห้องทำงาน...'
        },
        EN: {
            placeholder: 'Begin your Novel here...',
            words: 'words',
            saving: 'Saving...',
            saved: 'Last saved at',
            autoSaveMsg: 'Auto-saving enabled',
            successSave: 'Story saved successfully',
            errorSave: 'Error saving story',
            loadingMsg: 'Opening the writing chamber...'
        }
    };

    const currentT = t[language];

    // Word count logic (Thai & English)
    useEffect(() => {
        if (!content) {
            setWordCount(0);
            return;
        }
        const enWords = content.trim().split(/\s+/).filter(w => w.length > 0).length;
        let thWords = 0;
        try {
            const segmenter = new Intl.Segmenter('th', { granularity: 'word' });
            const segments = Array.from(segmenter.segment(content));
            thWords = segments.filter(s => s.isWordLike).length;
        } catch (e) {
            thWords = enWords;
        }
        const hasThai = /[\u0E00-\u0E7F]/.test(content);
        setWordCount(hasThai ? thWords : enWords);
    }, [content]);

    // Initial load
    useEffect(() => {
        const loadContent = async () => {
            if (!projectId) return;
            setLoading(true);
            try {
                const savedContent = await getStory(projectId);
                setContent(savedContent || '');
            } catch (error) {
                console.error(error);
                showToast(currentT.errorSave, 'error');
            } finally {
                setLoading(false);
            }
        };
        loadContent();
    }, [projectId]);

    // Auto-save logic
    useEffect(() => {
        if (!projectId) return;
        saveTimerRef.current = setInterval(() => {
            handleSave(true);
        }, 60000); // Increased to 60s for auto-save
        return () => {
            if (saveTimerRef.current) clearInterval(saveTimerRef.current);
        };
    }, [content, projectId]);

    const handleSave = async (isAuto = false) => {
        if (!projectId || !content.trim()) return;
        setIsSaving(true);
        try {
            await saveStory(projectId, content);
            const now = new Date().toLocaleTimeString();
            setLastSaved(now);
            if (!isAuto) showToast(currentT.successSave);
        } catch (error) {
            console.error(error);
            if (!isAuto) showToast(currentT.errorSave, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (!projectId) return <AccessDenied language={language} />;

    if (loading) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center space-y-6 text-muted animate-pulse">
                <Loader2 className="w-12 h-12 animate-spin text-accent-primary opacity-50" />
                <p className="text-xl font-light italic">{currentT.loadingMsg}</p>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-140px)] flex flex-col space-y-4 md:space-y-6 animate-in fade-in duration-1000">
            {/* Minimal Header */}
            <header className="flex items-center justify-between shrink-0 px-2">
                <div className="flex items-center space-x-3 text-muted">
                    <Feather className="w-4 h-4 md:w-5 md:h-5 text-accent-primary animate-bounce" />
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">{currentT.autoSaveMsg}</span>
                </div>
                <div className="flex items-center space-x-4 md:space-x-6">
                    {lastSaved && (
                        <span className="hidden sm:block text-[10px] md:text-sm text-muted font-medium italic opacity-70">
                            {currentT.saved} {lastSaved}
                        </span>
                    )}
                    <button
                        onClick={() => handleSave(false)}
                        disabled={isSaving}
                        className="flex items-center space-x-2 bg-white/30 backdrop-blur-xl hover:bg-white/40 text-accent-primary px-4 md:px-6 py-2 md:py-2.5 rounded-2xl border border-white/40 transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-accent-primary/10"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">{isSaving ? currentT.saving : 'Save'}</span>
                    </button>
                </div>
            </header>

            {/* Distraction-Free Editor */}
            <div className="flex-1 glass-card p-0 overflow-hidden border-white/40 shadow-2xl relative bg-white/40 saturate-150 rounded-[2rem] md:rounded-[3rem]">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={currentT.placeholder}
                    className="w-full h-full bg-transparent p-6 sm:p-10 md:p-14 lg:p-20 focus:outline-none resize-none text-lg md:text-xl lg:text-2xl leading-relaxed text-slate-800 placeholder:text-muted/30 selection:bg-accent-primary/20"
                    style={{
                        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
                    }}
                />
            </div>

            {/* Status Bar */}
            <footer className="flex items-center justify-between px-6 shrink-0 py-2">
                <div className="flex items-center space-x-3">
                    <span className="text-2xl md:text-4xl font-black text-gradient">{wordCount.toLocaleString()}</span>
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted">{currentT.words}</span>
                </div>
                <div className="hidden md:flex items-center space-x-6 text-[10px] font-black uppercase tracking-widest text-muted/40 transition-opacity hover:opacity-100 opacity-60">
                    <div className="flex items-center space-x-2">
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span>Cloud Sync</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <AlertCircle className="w-3 h-3 text-accent-primary" />
                        <span>Focus Mode</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default WritingRoom;
