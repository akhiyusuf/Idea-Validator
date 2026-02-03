import React, { useState } from 'react';
import { Step6Data, ValidationState, ValidationDecision } from '../../types';
import { Button, Card, TextArea, SourceList } from '../Shared';
import { analyzeScalability, researchEconomics } from '../../services/geminiService';
import { Loader2, TrendingUp, AlertOctagon, Search } from 'lucide-react';

interface Props {
    data: Step6Data;
    fullState: ValidationState;
    onUpdate: (data: Step6Data) => void;
    onComplete: () => void;
}

export const Step6_Scalability: React.FC<Props> = ({ data, fullState, onUpdate, onComplete }) => {
    const [loading, setLoading] = useState(false);
    const [researchLoading, setResearchLoading] = useState(false);
    const [aiReason, setAiReason] = useState<string>('');

    const handleEconomicsResearch = async () => {
        setResearchLoading(true);
        try {
            const solution = fullState.steps[0].structured.solution;
            const price = fullState.steps[3].priceAnchor;
            const res = await researchEconomics(solution, price);
            onUpdate({ 
                ...data, 
                unitEconomics: res.unitEconomics,
                economicsSources: res.sources
            });
        } catch (e) {
            console.error(e);
            alert("Economics research failed.");
        } finally {
            setResearchLoading(false);
        }
    };

    const handleFinalCheck = async () => {
        setLoading(true);
        try {
            // Compile summary of all previous steps
            const summary = {
                hypothesis: fullState.steps[0].aiRefinement?.hypothesis,
                problemScore: fullState.steps[1].painIntensityScore,
                marketReachable: fullState.steps[2].reachableAudienceScore,
                willingnessToPay: fullState.steps[3].conversionCount,
                retention: fullState.steps[4].retentionRate,
                cac: fullState.steps[5].cac,
                unitEconomics: data.unitEconomics
            };

            const result = await analyzeScalability(summary);
            onUpdate({ 
                ...data, 
                finalVerdict: result.verdict as ValidationDecision 
            });
            setAiReason(result.reason);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
             <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">6. Scalability Reality Check</h2>
                <p className="text-gray-400 text-sm">Avoid building a trap disguised as a startup.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Unit Economics">
                    <Button 
                        onClick={handleEconomicsResearch} 
                        disabled={researchLoading} 
                        variant="secondary"
                        className="w-full mb-6 flex justify-center gap-2"
                    >
                        {researchLoading ? <Loader2 className="animate-spin w-4 h-4"/> : <><Search className="w-4 h-4"/> Forecast Unit Economics</>}
                    </Button>

                    <TextArea 
                        label="Describe Unit Economics (LTV vs CAC, Margins)" 
                        placeholder="e.g. LTV is $500, CAC is $100. 80% gross margins."
                        value={data.unitEconomics}
                        onChange={(e) => onUpdate({...data, unitEconomics: e.target.value})}
                    />
                    
                    <Button onClick={handleFinalCheck} disabled={loading || !data.unitEconomics} className="w-full flex justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin w-4 h-4"/> : <><TrendingUp className="w-4 h-4"/> Run Final Analysis</>}
                    </Button>
                </Card>

                <div className="space-y-6">
                    <SourceList sources={data.economicsSources} />

                    {data.finalVerdict && (
                        <div className={`p-8 border-4 text-center ${
                            data.finalVerdict === ValidationDecision.PROCEED ? 'border-green-500 bg-green-900/20' : 
                            data.finalVerdict === ValidationDecision.PIVOT ? 'border-yellow-500 bg-yellow-900/20' : 
                            'border-red-500 bg-red-900/20'
                        }`}>
                            <h3 className="text-4xl font-black uppercase mb-4 text-white">{data.finalVerdict}</h3>
                            <p className="text-lg text-gray-200 mb-6">{aiReason}</p>
                            
                            {data.finalVerdict === ValidationDecision.PROCEED && (
                                <div className="flex items-center justify-center gap-2 text-green-400">
                                    <TrendingUp />
                                    <span>You are ready to build.</span>
                                </div>
                            )}
                            {data.finalVerdict === ValidationDecision.KILL && (
                                <div className="flex items-center justify-center gap-2 text-red-400">
                                    <AlertOctagon />
                                    <span>Don't waste another dollar.</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};