import React, { useState } from 'react';
import { Step3Data, Step2Data } from '../../types';
import { Button, Card, Input, SourceList } from '../Shared';
import { researchCompetitorPricing, estimateConversionPotential } from '../../services/geminiService';
import { DollarSign, Loader2, Search, Zap } from 'lucide-react';

interface Props {
    data: Step3Data;
    onUpdate: (data: Step3Data) => void;
    onComplete: () => void;
    onFail: () => void;
    competitors?: string[]; // passed from step 2
    context?: { problem: string; solution: string }; // passed for context
}

export const Step3_WillingnessToPay: React.FC<Props> = ({ data, onUpdate, onComplete, onFail, competitors = [], context }) => {
    const [loading, setLoading] = useState(false);
    const [simLoading, setSimLoading] = useState(false);

    const handlePricingResearch = async () => {
        setLoading(true);
        try {
            const result = await researchCompetitorPricing(competitors, "this problem");
            onUpdate({
                ...data,
                priceAnchor: result.priceAnchor,
                currency: result.currency || '$',
                pricingSources: result.sources
            });
        } catch (e) {
            console.error(e);
            alert("Pricing research failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleSimulation = async () => {
        setSimLoading(true);
        try {
            const problem = context?.problem || "this problem";
            const solution = context?.solution || "this solution";
            
            const result = await estimateConversionPotential(problem, solution, data.priceAnchor);
            onUpdate({
                ...data,
                conversionCount: result.estimatedConversionRate || 0,
                commitmentType: 'email', // Default for simulation
            });
        } catch (e) {
            console.error(e);
            alert("Simulation failed.");
        } finally {
            setSimLoading(false);
        }
    };
    
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
             <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">3. Willingness To Pay</h2>
                <p className="text-gray-400 text-sm">Prove they will pay, not just "like it".</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card title="The Ask">
                     <Button 
                        onClick={handlePricingResearch} 
                        disabled={loading} 
                        variant="secondary"
                        className="w-full mb-6 flex justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin w-4 h-4"/> : <><Search className="w-4 h-4"/> Analyze Competitor Pricing</>}
                    </Button>

                    <Input 
                        label="Price Anchor ($)" 
                        type="number"
                        value={data.priceAnchor}
                        onChange={(e) => onUpdate({...data, priceAnchor: parseInt(e.target.value) || 0})}
                    />
                     <div className="mb-4">
                        <label className="block text-xs font-mono text-gray-400 mb-1 uppercase">Commitment Signal</label>
                        <select 
                            value={data.commitmentType}
                            onChange={(e) => onUpdate({...data, commitmentType: e.target.value as any})}
                            className="w-full bg-black border border-gray-800 focus:border-white text-white p-3 text-sm outline-none"
                        >
                            <option value="email">Waitlist Email (Weakest)</option>
                            <option value="loi">Letter of Intent (Strong)</option>
                            <option value="payment">Pre-order / Payment (Strongest)</option>
                        </select>
                    </div>
                </Card>

                <Card title="Validation Results">
                     <p className="text-xs text-gray-500 mb-4">You can validate this manually by building a landing page, or use AI to simulate demand based on industry data.</p>
                     
                     <Button 
                        onClick={handleSimulation} 
                        disabled={simLoading} 
                        className="w-full mb-6 flex justify-center gap-2 bg-purple-900/30 text-purple-400 border border-purple-800 hover:bg-purple-900/50"
                    >
                        {simLoading ? <Loader2 className="animate-spin w-4 h-4"/> : <><Zap className="w-4 h-4"/> Simulate Traction (AI)</>}
                    </Button>

                     <Input 
                        label="Projected Conversion Rate (Estimate / 100)" 
                        type="number"
                        value={data.conversionCount}
                        onChange={(e) => onUpdate({...data, conversionCount: parseInt(e.target.value) || 0})}
                    />

                    <SourceList sources={data.pricingSources} />

                    <div className="mt-8 pt-6 border-t border-gray-800">
                        {data.conversionCount === 0 ? (
                             <div className="text-center">
                                <p className="text-red-400 text-sm mb-4">Zero traction? You have a hobby, not a business.</p>
                                <Button onClick={onFail} variant="danger" className="w-full">Kill Idea</Button>
                            </div>
                        ) : (
                             <div className="text-center">
                                <p className="text-green-400 text-sm mb-4">Traction detected.</p>
                                <Button onClick={onComplete} className="w-full">Proceed to Build MVP</Button>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};