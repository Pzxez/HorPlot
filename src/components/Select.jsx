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
                className="w-full bg-white/5 border border-glass-stroke rounded-2xl py-4 px-6 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all hover:bg-white/10 active:scale-[0.98]"
            >
                <span className="font-bold text-[var(--text-main)]">{selectedOption.label}</span>
                <ChevronDown className={`w-5 h-5 text-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-[100] w-full mt-2 bg-white/95 backdrop-blur-2xl border border-glass-stroke rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="py-2">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-6 py-4 flex items-center justify-between text-left transition-all hover:bg-accent-primary/5 group ${value === option.value ? 'bg-accent-primary/10' : ''
                                    }`}
                            >
                                <span className={`font-medium ${value === option.value ? 'text-accent-primary font-bold' : 'text-muted'
                                    } group-hover:text-accent-primary`}>
                                    {option.label}
                                </span>
                                {value === option.value && <Check className="w-4 h-4 text-accent-primary" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Select;
