import React, { useState } from 'react';
import { Step1Data, Step0Data } from '../../types';
import { Button, Card, ScoreBadge, SourceList } from '../Shared';
import { generateInterviewScript, researchProblem } from '../../services/geminiService';
import { Loader2, MessageSquare, ScanSearch, Quote } from 'lucide-react';

interface Props {
    data: Step1Data;
    prevStepData: Step0Data;
    onUpdate: (data: Step1Data) => void;
    onComplete: () => void;
    onFail: () => void;
}

export const Step1_ProblemValidation: React.FC<Props> = ({ data, prevStepData, onUpdate, onComplete, onFail }) => {
    const [loading, setLoading] = useState(false);
    const [researchLoading, setResearchLoading] = useState(false);

    const handleGenerateScript = async () => {
        setLoading(true);
        try {
            const result = await generateInterviewScript(prevStepData.structured.problem, prevStepData.structured.targetUser);
            onUpdate({ ...data, interviewQuestions: result.questions });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDeepResearch = async () => {
        setResearchLoading(true);
        try {
            const result = await researchProblem(prevStepData.structured.problem, prevStepData.structured.targetUser);
            onUpdate({
                ...data,
                problemFrequencyScore: result.frequencyScore,
                painIntensityScore: result.painScore,
                topQuotes: result.quotes,
                evidenceSources: result.sources
            });
        } catch (e) {
            console.error(e);
            alert("Research failed. Try again.");
        } finally {
            setResearchLoading(false);
        }
    };

    const handleScoreChange = (field: 'problemFrequencyScore' | 'painIntensityScore', val: string) => {
        onUpdate({ ...data, [field]: parseInt(val) || 0 });
    };

    const totalScore = (data.problemFrequencyScore + data.painIntensityScore) / 2;
    const canComplete = data.problemFrequencyScore > 0 && data.painIntensityScore > 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
             <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">1. Problem Validation</h2>
                <p className="text-gray-400 text-sm">Don't sell. Listen. Prove the problem exists before building.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Planning & Research */}
                <div className="space-y-6">
                    <Card title="Auto-Research (Recommended)">
                        <p className="text-sm text-gray-300 mb-4">
                            Let AI scour Reddit, forums, and reviews to find if people are actually complaining about this.
                        </p>
                        <Button 
                            onClick={handleDeepResearch} 
                            disabled={researchLoading} 
                            className="w-full flex justify-center gap-2 bg-blue-900/30 text-blue-400 border border-blue-800 hover:bg-blue-900/50"
                        >
                            {researchLoading ? <Loader2 className="animate-spin w-4 h-4"/> : <><ScanSearch className="w-4 h-4"/> Deep Scan for Evidence</>}
                        </Button>
                    </Card>

                    <Card title="Manual Validation">
                        <p className="text-sm text-gray-300 mb-4">
                            Or find 10-15 people matching <strong>{prevStepData.structured.targetUser}</strong> and interview them.
                        </p>
                        
                        <Button onClick={handleGenerateScript} disabled={loading} variant="secondary" className="w-full flex justify-center gap-2">
                            {loading ? <Loader2 className="animate-spin w-4 h-4"/> : <><MessageSquare className="w-4 h-4"/> Generate Script</>}
                        </Button>

                        {data.interviewQuestions && (
                            <div className="mt-6 space-y-3">
                                {data.interviewQuestions.map((q, i) => (
                                    <div key={i} className="p-3 bg-gray-900 border border-gray-800 text-sm text-gray-300">
                                        {q}
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right: Results */}
                <div className="space-y-6">
                    <Card title="Validation Data">
                        {data.topQuotes && data.topQuotes.length > 0 && (
                            <div className="mb-8 space-y-3">
                                <h4 className="text-xs font-bold uppercase text-gray-500">Real Complaints Found</h4>
                                {data.topQuotes.map((q, i) => (
                                    <div key={i} className="flex gap-3 text-sm italic text-gray-300 bg-gray-900 p-3 border-l-2 border-gray-700">
                                        <Quote className="w-4 h-4 text-gray-600 shrink-0" />
                                        "{q}"
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div>
                                <label className="flex justify-between text-xs font-mono text-gray-400 mb-2">
                                    <span>FREQUENCY (How often does it happen?)</span>
                                    <span>{data.problemFrequencyScore}</span>
                                </label>
                                <input 
                                    type="range" min="0" max="100" 
                                    value={data.problemFrequencyScore}
                                    onChange={(e) => handleScoreChange('problemFrequencyScore', e.target.value)}
                                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-white"
                                />
                            </div>

                            <div>
                                <label className="flex justify-between text-xs font-mono text-gray-400 mb-2">
                                    <span>PAIN INTENSITY (How bad is it?)</span>
                                    <span>{data.painIntensityScore}</span>
                                </label>
                                <input 
                                    type="range" min="0" max="100" 
                                    value={data.painIntensityScore}
                                    onChange={(e) => handleScoreChange('painIntensityScore', e.target.value)}
                                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-white"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <ScoreBadge score={data.problemFrequencyScore} label="Frequency" />
                            <ScoreBadge score={data.painIntensityScore} label="Pain" />
                        </div>

                        <SourceList sources={data.evidenceSources} />
                    </Card>

                    {canComplete && (
                        <div className="p-4 border border-gray-800 bg-gray-900/50">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm text-gray-400">Average Validation Score</span>
                                <span className={`text-xl font-bold ${totalScore < 50 ? 'text-red-500' : 'text-green-500'}`}>{totalScore}</span>
                            </div>
                            
                            {totalScore < 50 ? (
                                <div>
                                    <p className="text-red-400 text-sm mb-4">Score too low. Users don't care enough.</p>
                                    <Button onClick={onFail} variant="danger" className="w-full">Kill Idea</Button>
                                </div>
                            ) : (
                                <Button onClick={onComplete} className="w-full">Validate & Continue</Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};