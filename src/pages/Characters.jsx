import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Edit2, Trash2, Link2, Loader2, X, Check } from 'lucide-react';
import { addCharacter, subscribeToCharacters, updateCharacter, deleteCharacter } from '../firebase/characterService';
import AccessDenied from '../components/AccessDenied';

const Characters = ({ language, projectId, showToast }) => {
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newChar, setNewChar] = useState({ name: '', role: 'Protagonist', description: '', image: '' });
    const [editChar, setEditChar] = useState({ name: '', role: '', description: '', image: '' });

    const t = {
        TH: {
            title: 'ข้อมูลตัวละคร',
            desc: 'ออกแบบตัวละครในเรื่องราวของคุณ',
            newBtn: 'เพิ่มตัวละครใหม่',
            search: 'ค้นหาตัวละคร...',
            refine: 'กรอง',
            map: 'ผังความสัมพันธ์',
            save: 'บันทึก',
            cancel: 'ยกเลิก',
            namePlaceholder: 'ชื่อตัวละคร',
            rolePlaceholder: 'บทบาท',
            descPlaceholder: 'รายละเอียดตัวละคร...',
            loading: 'กำลังค้นหาพล็อต...',
            successAdd: 'เพิ่มตัวละครใหม่แล้ว',
            successUpdate: 'อัปเดตตัวละครแล้ว',
            successDelete: 'ลบตัวละครแล้ว',
            errorAdd: 'เกิดข้อผิดพลาด'
        },
        EN: {
            title: 'Cast & Crew',
            desc: 'Architect the souls that breathe life into your narrative.',
            newBtn: 'New Character',
            search: 'Search characters...',
            refine: 'Refine',
            map: 'Relationship Map',
            save: 'Save',
            cancel: 'Cancel',
            namePlaceholder: 'Character Name',
            rolePlaceholder: 'Role',
            descPlaceholder: 'Description...',
            loading: 'Searching...',
            successAdd: 'Character added',
            successUpdate: 'Character updated',
            successDelete: 'Character removed',
            errorAdd: 'Error occurred'
        }
    };

    const currentT = t[language];

    useEffect(() => {
        if (!projectId) return;
        setLoading(true);
        const unsubscribe = subscribeToCharacters(projectId, (data) => {
            setCharacters(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [projectId]);

    if (!projectId) return <AccessDenied language={language} />;

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const initials = newChar.name.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
            await addCharacter({ ...newChar, image: initials }, projectId);
            showToast(currentT.successAdd);
            setNewChar({ name: '', role: 'Protagonist', description: '', image: '' });
            setIsAdding(false);
        } catch (error) {
            console.error(error);
            showToast(currentT.errorAdd, 'error');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Confirm delete?')) {
            try {
                await deleteCharacter(id);
                showToast(currentT.successDelete);
            } catch (error) {
                console.error(error);
                showToast(currentT.errorAdd, 'error');
            }
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const initials = editChar.name.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
            await updateCharacter(editingId, { ...editChar, image: initials });
            showToast(currentT.successUpdate);
            setEditingId(null);
        } catch (error) {
            console.error(error);
            showToast(currentT.errorAdd, 'error');
        }
    };

    const startEditing = (char) => {
        setEditingId(char.id);
        setEditChar({
            name: char.name,
            role: char.role,
            description: char.description,
            image: char.image
        });
    };

    return (
        <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-2 md:mb-3">{currentT.title}</h1>
                    <p className="text-muted text-base md:text-lg font-light leading-relaxed">{currentT.desc}</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center justify-center space-x-3 bg-accent-primary hover:bg-accent-primary/80 text-white px-8 py-4 rounded-2xl transition-all shadow-xl shadow-accent-primary/20 active:scale-95 group w-full md:w-auto"
                    >
                        <UserPlus className="w-6 h-6 transition-transform group-hover:rotate-12" />
                        <span className="font-bold">{currentT.newBtn}</span>
                    </button>
                )}
            </header>

            {isAdding && (
                <div className="glass-card p-6 md:p-10 border-accent-primary/30 animate-in zoom-in-95 duration-500">
                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div className="space-y-4">
                            <input
                                required
                                value={newChar.name}
                                onChange={e => setNewChar({ ...newChar, name: e.target.value })}
                                placeholder={currentT.namePlaceholder}
                                className="w-full bg-white/5 border border-glass-stroke rounded-2xl py-4 md:py-5 px-6 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 text-xl md:text-2xl font-bold"
                            />
                            <input
                                required
                                value={newChar.role}
                                onChange={e => setNewChar({ ...newChar, role: e.target.value })}
                                placeholder={currentT.rolePlaceholder}
                                className="w-full bg-white/5 border border-glass-stroke rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 font-medium text-accent-primary"
                            />
                        </div>
                        <div className="space-y-4">
                            <textarea
                                required
                                value={newChar.description}
                                onChange={e => setNewChar({ ...newChar, description: e.target.value })}
                                placeholder={currentT.descPlaceholder}
                                className="w-full bg-white/5 border border-glass-stroke rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 min-h-[140px] md:min-h-[160px] font-light"
                            />
                        </div>
                        <div className="md:col-span-2 flex flex-col-reverse md:flex-row justify-end gap-4 pt-4 border-t border-glass-stroke">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="w-full md:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-2xl hover:bg-white/5 transition-all text-muted font-bold"
                            >
                                <X className="w-5 h-5" />
                                <span>{currentT.cancel}</span>
                            </button>
                            <button
                                type="submit"
                                className="w-full md:w-auto flex items-center justify-center space-x-2 bg-accent-primary text-white px-10 py-4 rounded-2xl hover:bg-accent-primary/80 transition-all shadow-lg shadow-accent-primary/20 font-bold"
                            >
                                <Check className="w-5 h-5" />
                                <span>{currentT.save}</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Search & Filter */}
            <div className="glass-card p-4 md:p-5 flex flex-col md:flex-row items-center gap-4 border-transparent shadow-none bg-black/5">
                <div className="w-full relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <input
                        type="text"
                        placeholder={currentT.search}
                        className="w-full bg-white/10 border border-white/10 rounded-2xl py-3.5 md:py-4 pl-14 md:pl-16 pr-6 focus:outline-none focus:ring-2 focus:ring-accent-primary/40 transition-all font-light text-sm"
                    />
                </div>
                <button className="w-full md:w-auto px-8 py-3.5 md:py-4 rounded-2xl border border-white/20 hover:bg-white/10 transition-colors text-muted font-bold whitespace-nowrap">
                    {currentT.refine}
                </button>
            </div>

            {/* Character Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-10">
                {loading ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-6 text-muted font-light italic text-xl">
                        <Loader2 className="w-10 h-10 animate-spin text-accent-primary opacity-50" />
                        <p>{currentT.loading}</p>
                    </div>
                ) : (
                    characters.map((char) => (
                        <div key={char.id} className="glass-card overflow-hidden group h-full flex flex-col transition-all duration-500">
                            <div className="h-48 md:h-56 lg:h-64 bg-white/5 flex items-center justify-center relative overflow-hidden shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <span className="text-7xl md:text-8xl font-black text-white/5 transition-all duration-700 transform group-hover:scale-110 group-hover:text-white/10">{char.image}</span>
                                <div className="absolute top-4 right-4 md:top-6 md:right-6 opacity-0 group-hover:opacity-100 flex space-x-2 transition-opacity">
                                    <button
                                        onClick={() => startEditing(char)}
                                        className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-md hover:bg-white text-accent-primary transition-all flex items-center justify-center shadow-lg hover:shadow-xl"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(char.id)}
                                        className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-md hover:bg-red-500 hover:text-white text-red-500 transition-all flex items-center justify-center shadow-lg hover:shadow-xl"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 md:p-8 space-y-5 flex-1 flex flex-col justify-between">
                                {editingId === char.id ? (
                                    <form onSubmit={handleUpdate} className="space-y-4 flex-1">
                                        <input
                                            required
                                            value={editChar.name}
                                            onChange={e => setEditChar({ ...editChar, name: e.target.value })}
                                            className="w-full bg-white/5 border border-glass-stroke rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-accent-primary font-bold text-xl"
                                        />
                                        <input
                                            required
                                            value={editChar.role}
                                            onChange={e => setEditChar({ ...editChar, role: e.target.value })}
                                            className="w-full bg-white/5 border border-glass-stroke rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-accent-primary text-sm font-black uppercase text-accent-primary tracking-widest"
                                        />
                                        <textarea
                                            required
                                            value={editChar.description}
                                            onChange={e => setEditChar({ ...editChar, description: e.target.value })}
                                            className="w-full bg-white/5 border border-glass-stroke rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-accent-primary text-sm min-h-[80px]"
                                        />
                                        <div className="flex justify-end gap-2 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setEditingId(null)}
                                                className="p-2 rounded-xl hover:bg-black/5 text-muted transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                            <button
                                                type="submit"
                                                className="p-2 rounded-xl bg-accent-primary hover:bg-accent-primary/80 text-white transition-colors"
                                            >
                                                <Check className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div className="space-y-4">
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-primary mb-2 block">{char.role}</span>
                                                <h3 className="text-xl md:text-2xl font-black truncate">{char.name}</h3>
                                            </div>
                                            <p className="text-muted font-light leading-relaxed text-sm md:text-base line-clamp-4">
                                                {char.description}
                                            </p>
                                        </div>
                                        <div className="pt-6 border-t border-glass-stroke flex items-center justify-between mt-auto">
                                            <button className="text-accent-primary text-xs md:text-sm font-bold hover:text-accent-secondary transition-colors flex items-center space-x-2">
                                                <Link2 className="w-4 h-4" />
                                                <span>{currentT.map}</span>
                                            </button>
                                            <div className="flex -space-x-2 md:-space-x-3">
                                                {[1, 2].map(i => (
                                                    <div key={i} className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-[var(--bg-mesh-4)] bg-white/20 shadow-sm" />
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Characters;
