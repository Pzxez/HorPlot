import React, { useState, useEffect } from 'react';
import { Plus, Target, Flag, MessageSquare, Loader2, X, Check, Edit2, Trash2 } from 'lucide-react';
import { addPlot, subscribeToPlots, updatePlot, deletePlot } from '../firebase/plotService';
import Select from '../components/Select';
import AccessDenied from '../components/AccessDenied';

const Timeline = ({ language, projectId, showToast }) => {
    const [plotPoints, setPlotPoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', description: '', type: 'Plot Point', status: 'planned' });
    const [newBeat, setNewBeat] = useState({ title: '', description: '', type: 'Plot Point', status: 'planned' });

    const t = {
        TH: {
            title: 'เส้นเรื่อง (Timeline)',
            desc: 'ขัดเกลาจังหวะการไหลล่วงของเนื้อเรื่องมหากาพย์ของคุณ',
            newBtn: 'จังหวะใหม่ (Beat)',
            loading: 'กำลังจัดเรียงเส้นเรื่อง...',
            annotations: 'หมายเหตุ',
            save: 'บันทึกจังหวะ',
            cancel: 'ยกเลิก',
            titlePlaceholder: 'ชื่อเหตุการณ์...',
            descPlaceholder: 'เกิดอะไรขึ้นในตอนนี้...',
            typeLabel: 'ความสำคัญ',
            confirmDelete: 'ยืนยันการลบจังหวะนี้?',
            successAdd: 'เพิ่มจังหวะใหม่แล้ว',
            successUpdate: 'แก้ไขจังหวะเรียบร้อยแล้ว',
            successDelete: 'ลบจังหวะเรียบร้อยแล้ว',
            error: 'เกิดข้อผิดพลาด กรุณาลองใหม่',
            types: [
                { value: 'Plot Point', label: 'Plot Point' },
                { value: 'Character Beat', label: 'Character Beat' },
                { value: 'World Building', label: 'World Building' },
                { value: 'Climax', label: 'Climax' },
            ],
            statuses: [
                { value: 'planned', label: 'Planned' },
                { value: 'in-progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
            ]
        },
        EN: {
            title: 'Plot Arc',
            desc: 'Sculpt the temporal flow of your grand opus.',
            newBtn: 'New Beat',
            loading: 'Orchestrating the timeline...',
            annotations: 'annotations',
            save: 'Save Beat',
            cancel: 'Cancel',
            titlePlaceholder: 'Event title...',
            descPlaceholder: 'What happens here...',
            typeLabel: 'Significance',
            confirmDelete: 'Are you sure you want to delete this beat?',
            successAdd: 'Plot beat added',
            successUpdate: 'Plot beat updated',
            successDelete: 'Plot beat removed',
            error: 'An error occurred',
            types: [
                { value: 'Plot Point', label: 'Plot Point' },
                { value: 'Character Beat', label: 'Character Beat' },
                { value: 'World Building', label: 'World Building' },
                { value: 'Climax', label: 'Climax' },
            ],
            statuses: [
                { value: 'planned', label: 'Planned' },
                { value: 'in-progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
            ]
        }
    };

    const currentT = t[language];

    useEffect(() => {
        if (!projectId) return;
        setLoading(true);
        const unsubscribe = subscribeToPlots(projectId, (data) => {
            setPlotPoints(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [projectId]);

    if (!projectId) return <AccessDenied language={language} />;

    const handleAddPlotPoint = async (e) => {
        if (e) e.preventDefault();
        try {
            await addPlot({ ...newBeat }, projectId);
            showToast(currentT.successAdd);
            setNewBeat({ title: '', description: '', type: 'Plot Point', status: 'planned' });
            setIsAdding(false);
        } catch (error) {
            console.error(error);
            showToast(currentT.error, 'error');
        }
    };

    const handleUpdatePlot = async (e) => {
        if (e) e.preventDefault();
        try {
            await updatePlot(editingId, editForm);
            showToast(currentT.successUpdate);
            setEditingId(null);
        } catch (error) {
            console.error(error);
            showToast(currentT.error, 'error');
        }
    };

    const handleDeletePlot = async (id) => {
        if (confirm(currentT.confirmDelete)) {
            try {
                await deletePlot(id);
                showToast(currentT.successDelete);
            } catch (error) {
                console.error(error);
                showToast(currentT.error, 'error');
            }
        }
    };

    const startEditing = (point) => {
        setEditingId(point.id);
        setEditForm({
            title: point.title,
            description: point.description,
            type: point.type,
            status: point.status || 'planned'
        });
    };

    return (
        <div className="space-y-6 md:space-y-10 animate-in fade-in duration-1000">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-2 md:mb-3">{currentT.title}</h1>
                    <p className="text-muted text-base md:text-lg font-light leading-relaxed">{currentT.desc}</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => {
                            setIsAdding(true);
                            setEditingId(null);
                        }}
                        className="flex items-center justify-center space-x-3 bg-accent-secondary hover:bg-accent-secondary/80 text-white px-8 py-4 rounded-2xl transition-all shadow-xl shadow-accent-secondary/20 active:scale-95 font-bold w-full md:w-auto"
                    >
                        <Plus className="w-6 h-6" />
                        <span>{currentT.newBtn}</span>
                    </button>
                )}
            </header>

            {isAdding && (
                <div className="glass-card p-6 md:p-10 border-accent-secondary/30 animate-in slide-in-from-top-4 duration-500">
                    <form onSubmit={handleAddPlotPoint} className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        <div className="md:col-span-2 space-y-4">
                            <input
                                required
                                value={newBeat.title}
                                onChange={e => setNewBeat({ ...newBeat, title: e.target.value })}
                                placeholder={currentT.titlePlaceholder}
                                className="w-full bg-white/5 border border-glass-stroke rounded-2xl py-4 md:py-5 px-6 focus:outline-none focus:ring-2 focus:ring-accent-secondary/50 text-xl md:text-2xl font-bold"
                            />
                            <textarea
                                required
                                value={newBeat.description}
                                onChange={e => setNewBeat({ ...newBeat, description: e.target.value })}
                                placeholder={currentT.descPlaceholder}
                                className="w-full bg-white/5 border border-glass-stroke rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-accent-secondary/50 min-h-[100px] md:min-h-[120px] font-light text-sm md:text-base"
                            />
                        </div>
                        <div className="space-y-6">
                            <Select
                                value={newBeat.type}
                                onChange={val => setNewBeat({ ...newBeat, type: val })}
                                options={currentT.types}
                                label={currentT.typeLabel}
                            />
                            <div className="flex flex-col space-y-3 pt-4">
                                <button
                                    type="submit"
                                    className="w-full bg-accent-secondary text-white py-4 rounded-2xl hover:bg-accent-secondary/80 shadow-lg shadow-accent-secondary/20 transition-all font-bold flex items-center justify-center space-x-2"
                                >
                                    <Check className="w-5 h-5" />
                                    <span>{currentT.save}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="w-full py-4 rounded-2xl hover:bg-white/5 text-muted transition-all font-bold flex items-center justify-center space-x-2"
                                >
                                    <X className="w-5 h-5" />
                                    <span>{currentT.cancel}</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Timeline Scroll Container */}
            <div className="glass-card p-6 md:p-16 min-h-[400px] md:min-h-[550px] flex items-center overflow-x-auto relative scroll-smooth group border-transparent shadow-none bg-black/5 rounded-[2.5rem]">
                <div className="absolute left-6 right-6 md:left-16 md:right-16 h-1 bg-gradient-to-r from-accent-primary/10 via-accent-primary/40 to-accent-primary/10 top-1/2 -translate-y-1/2 rounded-full hidden md:block" />

                <div className="flex flex-col md:flex-row md:space-x-16 space-y-8 md:space-y-0 relative z-10 w-full md:w-auto">
                    {loading ? (
                        <div className="w-full flex items-center justify-center space-x-4 text-muted py-20">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <span className="text-xl font-light italic">{currentT.loading}</span>
                        </div>
                    ) : (
                        <>
                            {plotPoints.map((point, idx) => (
                                <div key={point.id || idx} className="flex md:flex-col items-center w-full md:w-80 shrink-0 gap-6 md:gap-0">
                                    {/* Point Indicator */}
                                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full border-[4px] md:border-[6px] border-[var(--bg-mesh-4)] flex items-center justify-center mb-0 md:mb-10 relative z-20 transition-all duration-500 transform md:group-hover:scale-110 shrink-0 ${point.status === 'completed' ? 'bg-accent-primary shadow-[0_0_20px_rgba(129,140,248,0.5)]' :
                                        point.status === 'in-progress' ? 'bg-accent-secondary animate-pulse' : 'bg-white/10'
                                        }`}>
                                        {point.status === 'completed' ? <Target className="w-5 h-5 md:w-6 md:h-6 text-white" /> : <Flag className="w-5 h-5 md:w-6 md:h-6 text-muted" />}

                                        {/* Vertical Connector Top */}
                                        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 w-0.5 h-12 bg-white/20 hidden md:block ${idx % 2 === 0 ? 'md:block' : 'md:hidden'
                                            }`} />
                                        {/* Vertical Connector Bottom */}
                                        <div className={`absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-12 bg-white/20 hidden md:block ${idx % 2 !== 0 ? 'md:block' : 'md:hidden'
                                            }`} />
                                    </div>

                                    {/* Card - Alternating Top/Bottom (only on Desktop) */}
                                    <div className={`glass-card p-6 md:p-8 w-full relative transition-all duration-700 md:order-none ${idx % 2 === 0 ? 'md:order-first md:mb-10' : 'md:order-last md:mt-10'
                                        } ${editingId === point.id ? 'border-accent-primary ring-2 ring-accent-primary/20' : ''}`}>

                                        {editingId === point.id ? (
                                            <form onSubmit={handleUpdatePlot} className="space-y-4">
                                                <input
                                                    autoFocus
                                                    value={editForm.title}
                                                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                                    className="w-full bg-white/5 border border-glass-stroke rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-accent-primary text-sm font-bold"
                                                />
                                                <textarea
                                                    value={editForm.description}
                                                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                                    className="w-full bg-white/5 border border-glass-stroke rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-accent-primary text-xs font-light min-h-[60px]"
                                                />
                                                <div className="flex items-center justify-between pt-2">
                                                    <Select
                                                        value={editForm.status}
                                                        onChange={val => setEditForm({ ...editForm, status: val })}
                                                        options={currentT.statuses}
                                                        className="min-w-[100px] md:min-w-[120px]"
                                                    />
                                                    <div className="flex space-x-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingId(null)}
                                                            className="p-1.5 rounded-lg hover:bg-white/5 text-muted transition-all"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            className="p-1.5 rounded-lg bg-accent-primary text-white shadow-sm transition-all"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </form>
                                        ) : (
                                            <div className="space-y-4 relative group/card">
                                                <div className="absolute -top-4 -right-4 md:opacity-0 md:group-hover/card:opacity-100 transition-opacity flex space-x-1">
                                                    <button
                                                        onClick={() => startEditing(point)}
                                                        className="w-8 h-8 rounded-lg bg-white shadow-lg border border-white/20 flex items-center justify-center hover:bg-accent-primary hover:text-white transition-all"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePlot(point.id)}
                                                        className="w-8 h-8 rounded-lg bg-white shadow-lg border border-white/20 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-primary bg-accent-primary/10 px-3 py-1.5 rounded-full border border-accent-primary/10">
                                                    {point.type}
                                                </span>
                                                <h4 className="font-black text-lg md:text-xl leading-tight truncate">{point.title}</h4>
                                                <p className="text-xs md:text-sm text-muted font-light leading-relaxed italic line-clamp-3">
                                                    "{point.description}"
                                                </p>
                                                <div className="pt-4 flex items-center justify-between text-muted">
                                                    <div className="flex items-center space-x-2">
                                                        <MessageSquare className="w-4 h-4 opacity-50" />
                                                        <span className="text-[10px] font-bold lowercase">7 {currentT.annotations}</span>
                                                    </div>
                                                    <div className={`w-2 h-2 rounded-full border ${point.status === 'completed' ? 'bg-emerald-500 border-emerald-500/50' :
                                                        point.status === 'in-progress' ? 'bg-orange-500 border-orange-500/50' :
                                                            'bg-slate-400 border-slate-400/50'
                                                        }`} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Add New Button on Timeline */}
                            <div className="flex flex-col items-center w-full md:w-80 shrink-0 justify-center py-6 md:py-0">
                                <button
                                    onClick={() => {
                                        setIsAdding(true);
                                        setEditingId(null);
                                    }}
                                    className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center hover:bg-white/10 hover:border-white/50 transition-all group/btn shadow-xl"
                                >
                                    <Plus className="w-8 h-8 text-muted group-hover/btn:text-accent-primary transition-colors" />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Timeline;
