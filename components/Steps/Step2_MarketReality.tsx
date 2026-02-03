import React, { useState } from 'react';
import { Step2Data, Step0Data } from '../../types';
import { Button, Card, Input, SourceList } from '../Shared';
import { researchMarket } from '../../services/geminiService';
import { Loader2, Users, Search, Globe } from 'lucide-react';

interface Props {
    data: Step2Data;
    prevStepData: Step0Data;
    onUpdate: (data: Step2Data) => void;
    onComplete: () => void;
    onFail: () => void;
}

export const Step2_MarketReality: React.FC<Props> = ({ data, prevStepData, onUpdate, onComplete, onFail }) => {
    const [loading, setLoading] = useState(false);

    const handleResearch = async () => {
        setLoading(true);
        try {
            const result = await researchMarket(
                prevStepData.structured.targetUser, 
                prevStepData.structured.problem,
                prevStepData.structured.solution
            );
            onUpdate({
                ...data,
                marketSize: result.marketSize,
                channels: result.channels,
                competitors: result.competitors,
                reachableAudienceScore: result.reachableScore,
                marketSources: result.sources
            });
        } catch (e) {
            console.error(e);
            alert("Market research failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
             <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">2. Market Reality Check</h2>
                <p className="text-gray-400 text-sm">If you can't name where to find them tomorrow, you don't have a market.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Deep Market Scan">
                     <p className="text-sm text-gray-300 mb-4">
                        Use AI to find competitor websites, community hubs, and market size data.
                    </p>
                    <Button onClick={handleResearch} disabled={loading} className="w-full mb-6 flex justify-center gap-2 bg-blue-900/30 text-blue-400 border border-blue-800 hover:bg-blue-900/50">
                        {loading ? <Loader2 className="animate-spin w-4 h-4"/> : <><Globe className="w-4 h-4"/> Auto-Research Market</>}
                    </Button>

                    <Input 
                        label="Reachable Audience (Number of people)" 
                        type="text" 
                        placeholder="e.g. 5,000 active members in subreddit X"
                        value={data.marketSize}
                        onChange={(e) => onUpdate({...data, marketSize: e.target.value})}
                    />
                    <div className="mt-4">
                        <label className="block text-xs font-mono text-gray-400 mb-1 uppercase">Reachability Score (1-10)</label>
                        <input 
                            type="range" min="1" max="10" 
                            value={data.reachableAudienceScore}
                            onChange={(e) => onUpdate({...data, reachableAudienceScore: parseInt(e.target.value)})}
                            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Invisible</span>
                            <span>I have their emails</span>
                        </div>
                        <p className="text-right font-bold text-white mt-2">{data.reachableAudienceScore}/10</p>
                    </div>
                </Card>

                <div className="space-y-6">
                    {data.channels.length > 0 && (
                        <Card title="Where they hang out">
                            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-300">
                                {data.channels.map((c, i) => <li key={i}>{c}</li>)}
                            </ul>
                        </Card>
                    )}
                    {data.competitors.length > 0 && (
                        <Card title="Who is already selling">
                            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-300">
                                {data.competitors.map((c, i) => <li key={i}>{c}</li>)}
                            </ul>
                        </Card>
                    )}

                    <SourceList sources={data.marketSources} />

                    {data.reachableAudienceScore > 0 && (
                        <div className="mt-4">
                             {data.reachableAudienceScore < 4 ? (
                                <div className="text-center p-4 bg-red-900/20 border border-red-900">
                                    <p className="text-red-400 text-sm mb-4">Market is too hard to reach.</p>
                                    <Button onClick={onFail} variant="danger" className="w-full">Kill Idea</Button>
                                </div>
                            ) : (
                                <Button onClick={onComplete} className="w-full">Confirm Market</Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};