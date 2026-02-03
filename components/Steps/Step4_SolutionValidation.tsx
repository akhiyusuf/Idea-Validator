import React, { useState } from 'react';
import { Step4Data } from '../../types';
import { Button, Card, Input, SourceList } from '../Shared';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { researchBenchmarks } from '../../services/geminiService';
import { Loader2, Search } from 'lucide-react';

interface Props {
    data: Step4Data;
    onUpdate: (data: Step4Data) => void;
    onComplete: () => void;
}

export const Step4_SolutionValidation: React.FC<Props> = ({ data, onUpdate, onComplete }) => {
    const [loading, setLoading] = useState(false);

    const handleBenchmarks = async () => {
        setLoading(true);
        try {
            const result = await researchBenchmarks(data.mvpType, "SaaS/Tech"); // Defaulting to generic tech, could be dynamic
            onUpdate({
                ...data,
                activationRate: result.activationRate,
                retentionRate: result.retentionRate,
                benchmarkSources: result.sources
            });
        } catch (e) {
            console.error(e);
            alert("Benchmark research failed.");
        } finally {
            setLoading(false);
        }
    };
    
    // Mock data for visualization based on inputs
    const chartData = [
        { name: 'Activation', val: data.activationRate },
        { name: 'Retention', val: data.retentionRate },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
             <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">4. Solution Validation (MVP)</h2>
                <p className="text-gray-400 text-sm">Did the MVP actually solve the problem?</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="MVP Metrics">
                     <div className="mb-4">
                        <label className="block text-xs font-mono text-gray-400 mb-1 uppercase">MVP Type</label>
                        <select 
                            value={data.mvpType}
                            onChange={(e) => onUpdate({...data, mvpType: e.target.value})}
                            className="w-full bg-black border border-gray-800 focus:border-white text-white p-3 text-sm outline-none"
                        >
                            <option value="landing_page">Landing Page</option>
                            <option value="figma">Figma Prototype</option>
                            <option value="concierge">Concierge Service</option>
                            <option value="code">No-Code / Code</option>
                        </select>
                    </div>

                    <Button 
                        onClick={handleBenchmarks} 
                        disabled={loading} 
                        variant="secondary"
                        className="w-full mb-6 flex justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin w-4 h-4"/> : <><Search className="w-4 h-4"/> Find Industry Benchmarks</>}
                    </Button>

                    <Input 
                        label="Activation Rate (%) - Did they try it?" 
                        type="number"
                        max="100"
                        value={data.activationRate}
                        onChange={(e) => onUpdate({...data, activationRate: parseInt(e.target.value) || 0})}
                    />
                    <Input 
                        label="Retention Rate (%) - Did they come back?" 
                        type="number"
                        max="100"
                        value={data.retentionRate}
                        onChange={(e) => onUpdate({...data, retentionRate: parseInt(e.target.value) || 0})}
                    />
                </Card>

                <div className="space-y-6">
                    <Card title="Health Check" className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" stroke="#666" fontSize={12} />
                                <YAxis stroke="#666" fontSize={12} domain={[0, 100]} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="val" fill="#333" stroke="#fff" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>

                    <SourceList sources={data.benchmarkSources} />

                    {data.retentionRate > 10 ? (
                        <Button onClick={onComplete} className="w-full">
                            Solution Validated
                        </Button>
                    ) : (
                         <div className="p-4 border border-yellow-900 bg-yellow-900/10">
                            <p className="text-yellow-500 text-xs text-center">Retention is low. You might have a leaky bucket.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};