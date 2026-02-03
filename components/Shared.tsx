import React from 'react';
import { Source } from '../types';
import { ExternalLink } from 'lucide-react';

export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className = '', title }) => (
    <div className={`border border-truth-gray bg-[#0f0f0f] p-6 rounded-sm ${className}`}>
        {title && <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">{title}</h3>}
        {children}
    </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, className, ...props }) => (
    <div className="mb-4">
        <label className="block text-xs font-mono text-gray-400 mb-1 uppercase">{label}</label>
        <input 
            className={`w-full bg-black border border-gray-800 focus:border-white text-white p-3 text-sm outline-none transition-colors ${className}`}
            {...props}
        />
    </div>
);

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, className, ...props }) => (
    <div className="mb-4">
        <label className="block text-xs font-mono text-gray-400 mb-1 uppercase">{label}</label>
        <textarea 
            className={`w-full bg-black border border-gray-800 focus:border-white text-white p-3 text-sm outline-none transition-colors h-24 ${className}`}
            {...props}
        />
    </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' }> = ({ children, variant = 'primary', className, ...props }) => {
    const baseStyle = "px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
        primary: "bg-white text-black hover:bg-gray-200 border border-transparent",
        secondary: "bg-transparent text-white border border-gray-700 hover:border-gray-400",
        danger: "bg-red-900/20 text-red-500 border border-red-900 hover:bg-red-900/40"
    };

    return (
        <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};

export const ScoreBadge: React.FC<{ score: number; max?: number; label: string }> = ({ score, max = 100, label }) => {
    let color = 'text-gray-400';
    if (score < max * 0.4) color = 'text-truth-red';
    else if (score < max * 0.7) color = 'text-yellow-500';
    else color = 'text-truth-green';

    return (
        <div className="flex flex-col items-center p-4 border border-gray-800 bg-black/50">
            <span className={`text-3xl font-black ${color}`}>{score}</span>
            <span className="text-[10px] uppercase text-gray-500 mt-1">{label}</span>
        </div>
    );
};

export const SourceList: React.FC<{ sources?: Source[] }> = ({ sources }) => {
    if (!sources || sources.length === 0) return null;
    return (
        <div className="mt-4 pt-4 border-t border-gray-800">
            <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Sources of Truth</h4>
            <ul className="space-y-1">
                {sources.map((s, i) => (
                    <li key={i}>
                        <a href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-blue-400 hover:underline truncate">
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{s.title}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};