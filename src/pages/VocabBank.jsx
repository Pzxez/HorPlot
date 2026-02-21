import React, { useState, useEffect } from 'react';
import { Plus, Search, Library, Tag, Trash2, ChevronRight, Globe, Loader2, X, Check } from 'lucide-react';
import { addVocab, subscribeToVocab, deleteVocab, updateVocab } from '../firebase/vocabService';
import Select from '../components/Select';
import AccessDenied from '../components/AccessDenied';

const VocabBank = ({ language, setLanguage, projectId, showToast }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('ทั้งหมด');
    const [vocabList, setVocabList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newWord, setNewWord] = useState({ word: '', meaning: '', category: 'คำนาม', customCategory: '' });
    const [editWord, setEditWord] = useState({ word: '', meaning: '', category: 'คำนาม', customCategory: '' });

    const t = {
        TH: {
            title: 'คลังคำศัพท์',
            desc: 'รวบรวมศัพท์ของคุณและจัดเก็บคำเฉพาะของโลกนิยาย',
            addBtn: 'เพิ่มคำใหม่',
            search: 'ค้นหาคำศัพท์...',
            save: 'บันทึก',
            cancel: 'ยกเลิก',
            wordLabel: 'คำศัพท์',
            meaningLabel: 'ความหมาย',
            catLabel: 'หมวดหมู่',
            customCatPlaceholder: 'ระบุหมวดหมู่...',
            noResult: 'ไม่พบคำศัพท์',
            loading: 'กำลังโหลด...',
            successAdd: 'เพิ่มคำศัพท์แล้ว',
            successUpdate: 'แก้ไขคำศัพท์แล้ว',
            successDelete: 'ลบคำศัพท์แล้ว',
            error: 'เกิดข้อผิดพลาด',
            categories: ['ทั้งหมด', 'คำนาม', 'คำกริยา', 'คำคุณศัพท์', 'อารมณ์', 'อื่น ๆ'],
            other: 'อื่น ๆ'
        },
        EN: {
            title: 'Vocab Bank',
            desc: 'Refine your lexicon and keep track of world-specific terms.',
            addBtn: 'Add Word',
            search: 'Search words...',
            save: 'Save',
            cancel: 'Cancel',
            wordLabel: 'Word',
            meaningLabel: 'Meaning',
            catLabel: 'Category',
            customCatPlaceholder: 'Specify...',
            noResult: 'No words found',
            loading: 'Loading...',
            successAdd: 'Word added',
            successUpdate: 'Word updated',
            successDelete: 'Word deleted',
            error: 'Error occurred',
            categories: ['All', 'Noun', 'Verb', 'Adjective', 'Emotion', 'Other'],
            other: 'Other'
        }
    };

    const currentT = t[language];

    useEffect(() => {
        if (!projectId) return;
        setLoading(true);
        const unsubscribe = subscribeToVocab(projectId, (data) => {
            setVocabList(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [projectId]);

    if (!projectId) return <AccessDenied language={language} />;

    const handleAddWord = async (e) => {
        e.preventDefault();
        const finalCategory = newWord.category === currentT.other ? newWord.customCategory : newWord.category;
        try {
            await addVocab({
                word: newWord.word,
                meaning: newWord.meaning,
                category: finalCategory || currentT.other
            }, projectId);
            showToast(currentT.successAdd);
            setNewWord({ word: '', meaning: '', category: 'คำนาม', customCategory: '' });
            setIsAdding(false);
        } catch (error) {
            console.error(error);
            showToast(currentT.error, 'error');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Confirm delete?')) {
            try {
                await deleteVocab(id);
                showToast(currentT.successDelete);
            } catch (error) {
                console.error(error);
                showToast(currentT.error, 'error');
            }
        }
    };

    const handleUpdateWord = async (e) => {
        e.preventDefault();
        const finalCategory = editWord.category === currentT.other ? editWord.customCategory : editWord.category;
        try {
            await updateVocab(editingId, {
                word: editWord.word,
                meaning: editWord.meaning,
                category: finalCategory || currentT.other
            });
            showToast(currentT.successUpdate);
            setEditingId(null);
        } catch (error) {
            console.error(error);
            showToast(currentT.error, 'error');
        }
    };

    const startEditing = (item) => {
        setEditingId(item.id);
        const isCustom = !currentT.categories.includes(item.category);
        setEditWord({
            word: item.word,
            meaning: item.meaning,
            category: isCustom ? currentT.other : item.category,
            customCategory: isCustom ? item.category : ''
        });
    };

    const filteredVocab = vocabList.filter(item => {
        const matchesSearch = item.word?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.meaning?.toLowerCase().includes(searchTerm.toLowerCase());
        const isAll = activeCategory === 'ทั้งหมด' || activeCategory === 'All';
        const matchesCategory = isAll || item.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const categoryOptions = currentT.categories
        .filter(c => c !== 'ทั้งหมด' && c !== 'All')
        .map(c => ({ value: c, label: c }));

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-2">{currentT.title}</h1>
                    <p className="text-muted font-light text-base md:text-lg leading-relaxed">{currentT.desc}</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center justify-center space-x-2 bg-accent-primary hover:bg-accent-primary/80 text-white px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-accent-primary/20 active:scale-95 w-full md:w-auto font-bold"
                    >
                        <Plus className="w-5 h-5" />
                        <span>{currentT.addBtn}</span>
                    </button>
                )}
            </header>

            {/* Category Filter */}
            <div className="flex items-center space-x-3 overflow-x-auto pb-4 scrollbar-none scroll-smooth">
                {currentT.categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`shrink-0 px-6 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 border-2 ${activeCategory === cat
                            ? 'bg-accent-primary text-white border-accent-primary shadow-lg shadow-accent-primary/20'
                            : 'glass-card border-transparent shadow-none hover:bg-white/10 text-muted'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {isAdding && (
                <div className="glass-card p-6 md:p-8 border-accent-primary/30 animate-in slide-in-from-top-4 duration-500">
                    <form onSubmit={handleAddWord} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-accent-primary uppercase tracking-[0.2em] ml-2">{currentT.wordLabel}</label>
                            <input
                                required
                                value={newWord.word}
                                onChange={e => setNewWord({ ...newWord, word: e.target.value })}
                                type="text"
                                className="w-full bg-white/5 border border-glass-stroke rounded-2xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all font-bold text-lg"
                                placeholder="..."
                            />
                        </div>
                        <div className="flex flex-col space-y-4">
                            <Select
                                value={newWord.category}
                                onChange={val => setNewWord({ ...newWord, category: val })}
                                options={categoryOptions}
                                label={currentT.catLabel}
                            />
                            {newWord.category === currentT.other && (
                                <input
                                    type="text"
                                    required
                                    value={newWord.customCategory}
                                    onChange={e => setNewWord({ ...newWord, customCategory: e.target.value })}
                                    placeholder={currentT.customCatPlaceholder}
                                    className="w-full bg-white/10 border border-accent-primary/30 rounded-2xl py-3.5 px-5 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 animate-in fade-in"
                                />
                            )}
                        </div>
                        <div className="space-y-4 lg:col-span-3">
                            <label className="text-[10px] font-black text-accent-primary uppercase tracking-[0.2em] ml-2">{currentT.meaningLabel}</label>
                            <textarea
                                required
                                value={newWord.meaning}
                                onChange={e => setNewWord({ ...newWord, meaning: e.target.value })}
                                className="w-full bg-white/5 border border-glass-stroke rounded-2xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 min-h-[100px] font-light text-sm md:text-base leading-relaxed"
                                placeholder="..."
                            />
                        </div>
                        <div className="lg:col-span-3 flex flex-col-reverse md:flex-row justify-end gap-4 pt-4 border-t border-glass-stroke">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-8 py-3.5 rounded-2xl hover:bg-white/5 transition-colors text-muted font-bold flex items-center justify-center space-x-2"
                            >
                                <X className="w-4 h-4" />
                                <span>{currentT.cancel}</span>
                            </button>
                            <button
                                type="submit"
                                className="bg-accent-primary hover:bg-accent-primary/80 text-white px-10 py-3.5 rounded-2xl transition-all shadow-lg shadow-accent-primary/20 active:scale-95 font-bold flex items-center justify-center space-x-2"
                            >
                                <Check className="w-4 h-4" />
                                <span>{currentT.save}</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Search */}
            <div className="glass-card p-4 md:p-5 flex items-center shadow-none border-transparent bg-black/5">
                <div className="flex-1 relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <input
                        type="text"
                        placeholder={currentT.search}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-white/10 border border-white/10 rounded-2xl py-3.5 md:py-4 pl-14 pr-6 focus:outline-none focus:border-accent-primary/40 transition-all font-light text-sm"
                    />
                </div>
            </div>

            {/* Vocab List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                {loading ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-4 text-muted">
                        <Loader2 className="w-10 h-10 animate-spin text-accent-primary opacity-50" />
                        <p className="font-light italic">{currentT.loading}</p>
                    </div>
                ) : (
                    <>
                        {filteredVocab.map((item) => (
                            <div key={item.id} className="glass-card p-6 md:p-8 flex flex-col justify-between group h-full transition-all duration-500">
                                {editingId === item.id ? (
                                    <form onSubmit={handleUpdateWord} className="space-y-4">
                                        <input
                                            required
                                            value={editWord.word}
                                            onChange={e => setEditWord({ ...editWord, word: e.target.value })}
                                            className="w-full bg-white/5 border border-glass-stroke rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-accent-primary font-bold"
                                        />
                                        <textarea
                                            required
                                            value={editWord.meaning}
                                            onChange={e => setEditWord({ ...editWord, meaning: e.target.value })}
                                            className="w-full bg-white/5 border border-glass-stroke rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-accent-primary text-sm min-h-[60px]"
                                        />
                                        <div className="flex gap-2">
                                            <Select
                                                value={editWord.category}
                                                onChange={val => setEditWord({ ...editWord, category: val })}
                                                options={categoryOptions}
                                                className="flex-1"
                                            />
                                        </div>
                                        {editWord.category === currentT.other && (
                                            <input
                                                required
                                                value={editWord.customCategory}
                                                onChange={e => setEditWord({ ...editWord, customCategory: e.target.value })}
                                                placeholder={currentT.customCatPlaceholder}
                                                className="w-full bg-white/5 border border-glass-stroke rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-accent-primary text-sm"
                                            />
                                        )}
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
                                        <div className="space-y-5">
                                            <div className="flex items-center justify-between">
                                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-accent-primary/10 flex items-center justify-center border border-accent-primary/20">
                                                    <Library className="w-5 h-5 md:w-6 md:h-6 text-accent-primary" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-accent-secondary bg-accent-secondary/10 px-3 py-1.5 rounded-full border border-accent-secondary/10">
                                                    {item.category}
                                                </span>
                                            </div>
                                            <div className="space-y-3">
                                                <h3 className="text-xl md:text-2xl font-black truncate">{item.word}</h3>
                                                <p className="text-muted font-light leading-relaxed text-sm md:text-base line-clamp-4">{item.meaning}</p>
                                            </div>
                                        </div>
                                        <div className="mt-6 pt-6 border-t border-glass-stroke flex items-center justify-between md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 transform md:translate-y-2 md:group-hover:translate-y-0">
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-red-500/10 text-muted hover:text-red-500 transition-colors border border-transparent hover:border-red-500/20"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => startEditing(item)}
                                                className="flex items-center space-x-2 text-accent-primary font-black text-xs uppercase tracking-widest hover:text-accent-secondary transition-colors"
                                            >
                                                <span>Edit</span>
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                        {filteredVocab.length === 0 && (
                            <div className="col-span-full text-center py-20 opacity-30 italic">
                                <Library className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p className="text-lg font-light">{currentT.noResult}</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default VocabBank;
