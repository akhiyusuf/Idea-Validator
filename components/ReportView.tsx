import React from 'react';
import { ValidationState, ValidationDecision } from '../types';
import { Button } from './Shared';
import { Printer, X } from 'lucide-react';

interface Props {
    state: ValidationState;
    onClose: () => void;
}

export const ReportView: React.FC<Props> = ({ state, onClose }) => {
    const handlePrint = () => {
        window.print();
    };

    const s0 = state.steps[0];
    const s1 = state.steps[1];
    const s2 = state.steps[2];
    const s3 = state.steps[3];
    const s4 = state.steps[4];
    const s5 = state.steps[5];
    const s6 = state.steps[6];

    const verdictColor = s6.finalVerdict === ValidationDecision.PROCEED ? 'text-green-600' 
        : s6.finalVerdict === ValidationDecision.PIVOT ? 'text-yellow-600' 
        : 'text-red-600';

    return (
        <div className="fixed inset-0 z-50 bg-white text-black overflow-y-auto">
            {/* Toolbar - Hidden when printing */}
            <div className="print:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900 text-white flex justify-between items-center px-6 shadow-lg">
                <h2 className="font-bold">Validation Stack Report</h2>
                <div className="flex gap-4">
                    <Button onClick={handlePrint} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white border-0">
                        <Printer size={16} /> Print / Save as PDF
                    </Button>
                    <Button onClick={onClose} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white border-0">
                        <X size={16} /> Close
                    </Button>
                </div>
            </div>

            {/* Document Content */}
            <div className="max-w-[210mm] mx-auto pt-24 pb-12 px-12 print:pt-0 print:px-0 print:pb-0">
                <div className="text-center border-b-2 border-black pb-8 mb-8">
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Validation Report</h1>
                    <p className="text-gray-500 text-sm font-mono">{new Date().toLocaleDateString()}</p>
                    <div className={`mt-4 text-2xl font-bold border-4 inline-block px-6 py-2 border-current ${verdictColor}`}>
                        VERDICT: {s6.finalVerdict || 'IN PROGRESS'}
                    </div>
                </div>

                {/* Executive Summary */}
                <section className="mb-8">
                    <h3 className="text-xs font-bold uppercase text-gray-400 mb-2 border-b border-gray-200 pb-1">Concept</h3>
                    <p className="text-lg font-serif italic mb-4">"{s0.aiRefinement?.hypothesis || s0.structured.problem}"</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="font-bold">User:</span> {s0.structured.targetUser}</div>
                        <div><span className="font-bold">Problem:</span> {s0.structured.problem}</div>
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section className="mb-6">
                        <h3 className="text-xs font-bold uppercase text-gray-400 mb-4 border-b border-gray-200 pb-1">1. Problem Validation</h3>
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-sm">Frequency Score</span>
                            <span className="font-bold">{s1.problemFrequencyScore}/100</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 mb-4"><div className="bg-black h-2" style={{width: `${s1.problemFrequencyScore}%`}}></div></div>
                        
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-sm">Pain Score</span>
                            <span className="font-bold">{s1.painIntensityScore}/100</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 mb-4"><div className="bg-black h-2" style={{width: `${s1.painIntensityScore}%`}}></div></div>
                        
                        {s1.topQuotes && s1.topQuotes.length > 0 && (
                             <div className="mt-4 text-xs italic text-gray-600 bg-gray-50 p-2 border-l-2 border-gray-300">
                                "{s1.topQuotes[0]}"
                            </div>
                        )}
                    </section>

                    <section className="mb-6">
                        <h3 className="text-xs font-bold uppercase text-gray-400 mb-4 border-b border-gray-200 pb-1">2. Market Reality</h3>
                        <div className="mb-2 text-sm">
                            <span className="font-bold block">Market Size:</span> {s2.marketSize}
                        </div>
                        <div className="mb-2 text-sm">
                            <span className="font-bold block">Competitors:</span> {s2.competitors.slice(0, 3).join(', ')}
                        </div>
                        <div className="mb-2 text-sm">
                            <span className="font-bold block">Channels:</span> {s2.channels.slice(0, 3).join(', ')}
                        </div>
                    </section>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section className="mb-6">
                        <h3 className="text-xs font-bold uppercase text-gray-400 mb-4 border-b border-gray-200 pb-1">3. Economics & Pricing</h3>
                        <div className="text-3xl font-bold mb-2">{s3.currency}{s3.priceAnchor}<span className="text-base font-normal text-gray-500">/mo</span></div>
                        <div className="text-sm mb-1">CAC Est: <span className="font-bold">${s5.cac}</span></div>
                        <div className="text-sm text-gray-600 mt-2">{s6.unitEconomics}</div>
                    </section>

                    <section className="mb-6">
                        <h3 className="text-xs font-bold uppercase text-gray-400 mb-4 border-b border-gray-200 pb-1">4. Performance Benchmarks</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-2 border border-gray-200">
                                <div className="text-2xl font-bold">{s4.activationRate}%</div>
                                <div className="text-[10px] uppercase">Activation</div>
                            </div>
                            <div className="text-center p-2 border border-gray-200">
                                <div className="text-2xl font-bold">{s4.retentionRate}%</div>
                                <div className="text-[10px] uppercase">Retention</div>
                            </div>
                        </div>
                         <div className="text-center p-2 mt-2 border border-gray-200 bg-gray-50">
                                <div className="text-xl font-bold">{s3.conversionCount}%</div>
                                <div className="text-[10px] uppercase">Projected Conversion</div>
                        </div>
                    </section>
                </div>
                
                 <section className="mb-6">
                    <h3 className="text-xs font-bold uppercase text-gray-400 mb-4 border-b border-gray-200 pb-1">5. AI Analysis</h3>
                    <div className="p-4 bg-gray-100 text-sm leading-relaxed">
                        {/* We use unit economics text area as a general summary if Step 6 verdict reason isn't stored separately, 
                            but in current architecture, Step 6 analysis populates unitEconomics text area if manually done, 
                            or we can just show the unitEconomics text. Ideally we'd have a specific "reason" field. 
                            Let's assume the unitEconomics field captures the summary. */}
                        {s6.unitEconomics}
                    </div>
                </section>

                <footer className="mt-12 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
                    Generated by Validation Stack - The Funnel of Truth
                </footer>
            </div>
        </div>
    );
};