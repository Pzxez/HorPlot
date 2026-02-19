import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const Select = ({ value, onChange, options, label, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value) || options[0] || { label: 'Select...', value: '' };

    return (
        <div className={`relative space-y-2 ${className}`} ref={dropdownRef}>
            {label && (
                <label className="text-xs font-bold text-accent-secondary dark:text-accent-primary uppercase tracking-[0.2em]">
                    {label}
                </label>
            )}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-slate-900/5 dark:bg-white/10 border border-glass-stroke rounded-2xl py-4 px-6 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-accent-secondary/50 transition-all hover:bg-slate-900/10 dark:hover:bg-white/20 active:scale-[0.98]"
            >
                <span className="font-bold text-slate-900 dark:text-slate-100">{selectedOption.label}</span>
                <ChevronDown className={`w-5 h-5 text-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-[100] w-full mt-2 bg-white/80 dark:bg-black/80 backdrop-blur-2xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="py-2">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-6 py-4 flex items-center justify-between text-left transition-all hover:bg-purple-600/50 group ${value === option.value ? 'bg-purple-600/30' : ''
                                    }`}
                            >
                                <span className={`font-medium ${value === option.value ? 'text-slate-900 dark:text-slate-100 font-bold' : 'text-slate-700 dark:text-slate-300'
                                    } group-hover:text-white`}>
                                    {option.label}
                                </span>
                                {value === option.value && <Check className="w-4 h-4 text-purple-400" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Select;
