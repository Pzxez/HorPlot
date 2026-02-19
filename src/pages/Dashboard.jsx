import React, { useState, useEffect } from 'react';
import { Plus, Book, ArrowRight, Loader2, X, Check, Edit2, Trash2 } from 'lucide-react';
import { addProject, subscribeToProjects, updateProject, deleteProject } from '../firebase/projectService';

const Dashboard = ({ language, onSelectProject, selectedProjectId, showToast }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [newTitle, setNewTitle] = useState('');

    const t = {
        TH: {
            title: 'เลือกนิยายของคุณ',
            desc: 'เลือกเรื่องที่คุณต้องการสานต่อ หรือเริ่มต้นมหากาพย์บทใหม่',
            newBtn: 'สร้างนิยายเรื่องใหม่',
            selectBtn: 'เลือกเขียนเรื่องนี้',
            createTitle: 'ตั้งชื่อนิยายใหม่',
            placeholder: 'ระบุชื่อนิยาย...',
            save: 'สร้างโปรเจกต์',
            editTitle: 'แก้ไขชื่อนิยาย',
            update: 'บันทึกการแก้ไข',
            cancel: 'ยกเลิก',
            loading: 'กำลังเรียกความทรงจำ...',
            empty: 'ยังไม่มีนิยายในคลังของคุณ เริ่มสร้างเรื่องแรกเลย!'
        },
        EN: {
            title: 'Select Your Novel',
            desc: 'Choose a story to continue or start a new epic journey.',
            newBtn: 'Create New Project',
            selectBtn: 'Select this Novel',
            createTitle: 'New Novel Title',
            placeholder: 'Enter title...',
            save: 'Create Project',
            editTitle: 'Edit Novel Title',
            update: 'Save Changes',
            cancel: 'Cancel',
            loading: 'Gathering memories...',
            empty: 'No novels in your library. Start your first epic!'
        }
    };

    const currentT = t[language];

    useEffect(() => {
        const unsubscribe = subscribeToProjects((data) => {
            setProjects(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        if (!newTitle.trim()) return;
        try {
            if (editingProject) {
                await updateProject(editingProject.id, { title: newTitle });
                showToast(language === 'TH' ? 'แก้ไขชื่อนิยายเรียบร้อยแล้ว' : 'Novel updated successfully');
            } else {
                await addProject({ title: newTitle });
                showToast(language === 'TH' ? 'สร้างนิยายเรื่องใหม่แล้ว' : 'New novel created');
            }
            setNewTitle('');
            setIsAdding(false);
            setEditingProject(null);
        } catch (error) {
            console.error(error);
            showToast(language === 'TH' ? 'เกิดข้อผิดพลาดในการบันทึก' : 'Error saving project', 'error');
        }
    };

    const handleDeleteProject = async (id, title) => {
        if (confirm(`Delete "${title}"? This cannot be undone.`)) {
            try {
                await deleteProject(id);
                showToast(language === 'TH' ? 'ลบนิยายเรียบร้อยแล้ว' : 'Novel deleted');
                if (selectedProjectId === id) {
                    onSelectProject(null);
                }
            } catch (error) {
                console.error(error);
                showToast(language === 'TH' ? 'เกิดข้อผิดพลาดในการลบ' : 'Error deleting project', 'error');
            }
        }
    };

    const startEditing = (project) => {
        setEditingProject(project);
        setNewTitle(project.title);
        setIsAdding(true);
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-1000">
            <header className="flex items-center justify-between flex-wrap gap-6">
                <div>
                    <h1 className="text-5xl font-black text-gradient mb-4">{currentT.title}</h1>
                    <p className="text-muted text-xl font-light">{currentT.desc}</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center space-x-3 bg-accent-primary hover:bg-accent-primary/80 text-white px-8 py-4 rounded-2xl transition-all shadow-xl shadow-accent-primary/20 active:scale-95 font-bold"
                >
                    <Plus className="w-6 h-6" />
                    <span>{currentT.newBtn}</span>
                </button>
            </header>

            {loading ? (
                <div className="py-24 flex flex-col items-center justify-center space-y-6 text-muted">
                    <Loader2 className="w-12 h-12 animate-spin text-accent-primary opacity-50" />
                    <p className="text-2xl font-light italic">{currentT.loading}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className={`glass-card p-10 flex flex-col justify-between group h-[320px] relative overflow-hidden ${selectedProjectId === project.id ? 'ring-4 ring-accent-primary/40 border-accent-primary' : ''}`}
                        >
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-primary/5 rounded-full blur-3xl group-hover:bg-accent-primary/10 transition-all duration-700" />

                            {/* Action Buttons */}
                            <div className="absolute top-6 right-6 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                <button
                                    onClick={(e) => { e.stopPropagation(); startEditing(project); }}
                                    className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-accent-primary hover:text-white transition-all shadow-lg"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id, project.title); }}
                                    className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-white/10 dark:bg-white/5 flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-500">
                                    <Book className="w-8 h-8 text-accent-primary" />
                                </div>
                                <h3 className="text-3xl font-black tracking-tight leading-tight">{project.title}</h3>
                            </div>

                            <button
                                onClick={() => onSelectProject(project.id)}
                                className={`w-full flex items-center justify-center space-x-3 py-4 rounded-2xl transition-all font-bold ${selectedProjectId === project.id
                                    ? 'bg-accent-primary text-white shadow-lg'
                                    : 'bg-white/10 hover:bg-accent-primary hover:text-white text-muted hover:shadow-lg'
                                    }`}
                            >
                                <span>{currentT.selectBtn}</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    ))}

                    {/* Quick Create Card */}
                    <div
                        onClick={() => setIsAdding(true)}
                        className="glass-card border-dashed border-2 border-white/20 p-10 flex flex-col items-center justify-center space-y-4 hover:bg-white/5 transition-all cursor-pointer group h-[320px]"
                    >
                        <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center group-hover:border-accent-primary group-hover:bg-white/10 transition-all duration-500">
                            <Plus className="w-10 h-10 text-muted group-hover:text-accent-primary" />
                        </div>
                        <span className="text-xl font-bold text-muted group-hover:text-[var(--text-main)]">{currentT.newBtn}</span>
                    </div>
                </div>
            )}

            {projects.length === 0 && !loading && (
                <div className="text-center py-20 opacity-40">
                    <p className="text-2xl font-light italic">{currentT.empty}</p>
                </div>
            )}

            {/* New/Edit Project Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => { setIsAdding(false); setEditingProject(null); setNewTitle(''); }} />
                    <div className="glass-card w-full max-w-xl p-12 relative z-10 border-white/30 shadow-2xl animate-in zoom-in-95 duration-300">
                        <header className="flex items-center justify-between mb-10">
                            <h2 className="text-3xl font-black">{editingProject ? currentT.editTitle : currentT.createTitle}</h2>
                            <button onClick={() => { setIsAdding(false); setEditingProject(null); setNewTitle(''); }} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                <X className="w-6 h-6 text-muted" />
                            </button>
                        </header>
                        <form onSubmit={handleSave} className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-[0.3em] text-accent-primary pl-1">
                                    {editingProject ? currentT.editTitle : currentT.createTitle}
                                </label>
                                <input
                                    autoFocus
                                    required
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    placeholder={currentT.placeholder}
                                    className="w-full bg-white/5 border border-glass-stroke rounded-3xl py-6 px-8 focus:outline-none focus:ring-4 focus:ring-accent-primary/30 text-2xl font-bold transition-all"
                                />
                            </div>
                            <div className="flex space-x-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setIsAdding(false); setEditingProject(null); setNewTitle(''); }}
                                    className="flex-1 py-5 rounded-2xl hover:bg-white/5 transition-all text-muted font-black uppercase tracking-widest"
                                >
                                    {currentT.cancel}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-accent-primary text-white py-5 rounded-2xl hover:bg-accent-primary/80 shadow-2xl shadow-accent-primary/40 transition-all font-black uppercase tracking-widest flex items-center justify-center space-x-3"
                                >
                                    <Check className="w-6 h-6" />
                                    <span>{editingProject ? currentT.update : currentT.save}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
