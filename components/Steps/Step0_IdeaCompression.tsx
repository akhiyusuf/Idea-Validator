import React, { useState } from 'react';
import { Step0Data } from '../../types';
import { Button, Input, TextArea, Card } from '../Shared';
import { compressIdea } from '../../services/geminiService';
import { Loader2, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

interface Props {
    data: Step0Data;
    onUpdate: (data: Step0Data) => void;
    onComplete: () => void;
    onRunAutoPilot: () => void;
}

export const Step0_IdeaCompression: React.FC<Props> = ({ data, onUpdate, onComplete, onRunAutoPilot }) => {
    const [loading, setLoading] = useState(false);

    const handleChange = (field: keyof Step0Data['structured'], value: string) => {
        onUpdate({
            ...data,
            structured: { ...data.structured, [field]: value }
        });
    };

    const handleCompress = async () => {
        setLoading(true);
        try {
            const result = await compressIdea(data.structured);
            onUpdate({
                ...data,
                aiRefinement: result
            });
        } catch (e) {
            alert("Failed to compress idea. Check API Key.");
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = Object.values(data.structured).every((val) => (val as string).trim().length > 3);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">0. Idea Compression</h2>
                    <p className="text-gray-400 text-sm">Kill ambiguity. Turn your vague idea into a testable claim.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="The Framework">
                    <Input 
                        label="For (Specific User)" 
                        placeholder="e.g. Remote HR Managers"
                        value={data.structured.targetUser}
                        onChange={(e) => handleChange('targetUser', e.target.value)}
                    />
                    <Input 
                        label="Who has (Painful Problem)" 
                        placeholder="e.g. Can't track employee burnout"
                        value={data.structured.problem}
                        onChange={(e) => handleChange('problem', e.target.value)}
                    />
                    <Input 
                        label="I Offer (Specific Solution)" 
                        placeholder="e.g. Slack-bot sentiment analyzer"
                        value={data.structured.solution}
                        onChange={(e) => handleChange('solution', e.target.value)}
                    />
                    <Input 
                        label="That Delivers (Measurable Outcome)" 
                        placeholder="e.g. Reduces turnover by 20%"
                        value={data.structured.outcome}
                        onChange={(e) => handleChange('outcome', e.target.value)}
                    />
                    <Input 
                        label="Better Than (Current Alternative)" 
                        placeholder="e.g. Annual surveys"
                        value={data.structured.alternative}
                        onChange={(e) => handleChange('alternative', e.target.value)}
                    />
                    
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <Button 
                            onClick={handleCompress} 
                            disabled={loading || !isFormValid}
                            className="flex justify-center items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Compress Idea'}
                        </Button>
                        <Button 
                             onClick={onRunAutoPilot}
                             disabled={loading || !isFormValid}
                             className="flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-900 to-purple-900 border-indigo-700 text-indigo-100 hover:from-indigo-800 hover:to-purple-800"
                        >
                            <Zap className="w-4 h-4" /> Run Auto-Pilot
                        </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">Auto-Pilot runs all 7 steps automatically using AI research.</p>
                </Card>

                <div className="space-y-6">
                    {data.aiRefinement ? (
                        <>
                            <Card title="Hypothesis" className="border-l-4 border-l-truth-green">
                                <p className="text-lg font-medium text-white">
                                    "{data.aiRefinement.hypothesis}"
                                </p>
                            </Card>

                            <Card title="Riskiest Assumptions">
                                <ul className="space-y-3">
                                    {data.aiRefinement.assumptions.map((assump, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-gray-300">
                                            <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                                            {assump}
                                        </li>
                                    ))}
                                </ul>
                            </Card>

                            {data.aiRefinement.vaguenessFlags && data.aiRefinement.vaguenessFlags.length > 0 && (
                                <Card title="Vague Words Detected" className="border-red-900/30 bg-red-900/10">
                                    <div className="flex flex-wrap gap-2">
                                        {data.aiRefinement.vaguenessFlags.map((word, i) => (
                                            <span key={i} className="px-2 py-1 bg-red-500/20 text-red-400 text-xs border border-red-500/50 rounded">
                                                {word}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-xs text-red-300 mt-2">Be more specific. Vague ideas die.</p>
                                </Card>
                            )}

                            <Button onClick={onComplete} className="w-full" variant="secondary">
                                Accept & Proceed
                            </Button>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600 border border-dashed border-gray-800 rounded p-8">
                            <p className="text-center text-sm">Fill out the form to generate your validation hypothesis.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};