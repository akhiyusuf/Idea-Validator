import React, { useState } from 'react';
import { Step5Data, Step0Data, Step4Data } from '../../types';
import { Button, Card, Input, SourceList } from '../Shared';
import { generateCopyVariations, researchDemand } from '../../services/geminiService';
import { Loader2, Zap, Search } from 'lucide-react';

interface Props {
    data: Step5Data;
    prevHypothesis: string;
    mvpType: string;
    onUpdate: (data: Step5Data) => void;
    onComplete: () => void;
}

export const Step5_DemandValidation: React.FC<Props> = ({ data, prevHypothesis, mvpType, onUpdate, onComplete }) => {
    const [loading, setLoading] = useState(false);
    const [researchLoading, setResearchLoading] = useState(false);

    const handleGenerateCopy = async () => {
        setLoading(true);
        try {
            const res = await generateCopyVariations(prevHypothesis, mvpType);
            onUpdate({ ...data, bestCopy: res.bestCopy });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDemandResearch = async () => {
        setResearchLoading(true);
        try {
            // Extract persona/solution from hypothesis implicitly or pass explicitly if available
            // Using hypothesis as context
            const res = await researchDemand(prevHypothesis, "target customer");
            onUpdate({
                ...data,
                cac: res.cac,
                channelViability: res.channelViability,
                demandSources: res.sources
            });
        } catch (e) {
            console.error(e);
            alert("Demand research failed.");
        } finally {
            setResearchLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
             <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">5. Demand Validation</h2>
                <p className="text-gray-400 text-sm">Ensure demand exists without you begging.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Acquisition Test">
                     <Button 
                        onClick={handleDemandResearch} 
                        disabled={researchLoading} 
                        variant="secondary"
                        className="w-full mb-6 flex justify-center gap-2"
                    >
                        {researchLoading ? <Loader2 className="animate-spin w-4 h-4"/> : <><Search className="w-4 h-4"/> Estimate Demand & CAC</>}
                    </Button>

                     <Input 
                        label="CAC Estimate ($)" 
                        type="number"
                        value={data.cac}
                        onChange={(e) => onUpdate({...data, cac: parseInt(e.target.value) || 0})}
                    />
                    <div className="mb-4">
                        <label className="block text-xs font-mono text-gray-400 mb-1 uppercase">Channel Viability</label>
                        <select 
                            value={data.channelViability}
                            onChange={(e) => onUpdate({...data, channelViability: e.target.value})}
                            className="w-full bg-black border border-gray-800 focus:border-white text-white p-3 text-sm outline-none"
                        >
                            <option value="">Select...</option>
                            <option value="high">High (Organic/Viral)</option>
                            <option value="medium">Medium (Paid works)</option>
                            <option value="low">Low (Too expensive)</option>
                        </select>
                    </div>

                    <Button onClick={handleGenerateCopy} disabled={loading} variant="secondary" className="w-full mt-4 flex justify-center gap-2">
                         {loading ? <Loader2 className="animate-spin w-4 h-4"/> : <><Zap className="w-4 h-4"/> Generate High-Convert Copy</>}
                    </Button>
                </Card>

                <div className="space-y-6">
                    {data.bestCopy && (
                        <Card title="AI Suggested Copy">
                            <p className="text-lg font-serif italic text-gray-200">"{data.bestCopy}"</p>
                        </Card>
                    )}

                    <SourceList sources={data.demandSources} />

                    {data.cac > 0 && data.channelViability && (
                        <Button onClick={onComplete} className="w-full">
                            Confirm Demand
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};