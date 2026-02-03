import React, { useState } from 'react';
import { 
    ValidationState, 
    INITIAL_STATE, 
    StepStatus, 
    STEP_TITLES,
    Step0Data, Step1Data, Step2Data, Step3Data, Step4Data, Step5Data, Step6Data,
    ValidationDecision
} from './types';
import { Step0_IdeaCompression } from './components/Steps/Step0_IdeaCompression';
import { Step1_ProblemValidation } from './components/Steps/Step1_ProblemValidation';
import { Step2_MarketReality } from './components/Steps/Step2_MarketReality';
import { Step3_WillingnessToPay } from './components/Steps/Step3_WillingnessToPay';
import { Step4_SolutionValidation } from './components/Steps/Step4_SolutionValidation';
import { Step5_DemandValidation } from './components/Steps/Step5_DemandValidation';
import { Step6_Scalability } from './components/Steps/Step6_Scalability';
import { KillScreen } from './components/KillScreen';
import { ReportView } from './components/ReportView';
import { Button } from './components/Shared';
import { Check, Lock, Loader2, FileText } from 'lucide-react';
import { 
    compressIdea, researchProblem, researchMarket, researchCompetitorPricing, 
    estimateConversionPotential, researchBenchmarks, researchDemand, researchEconomics, analyzeScalability 
} from './services/geminiService';

export default function App() {
    const [state, setState] = useState<ValidationState>(INITIAL_STATE);
    const [isKilled, setIsKilled] = useState(false);
    const [isAutoPilotRunning, setIsAutoPilotRunning] = useState(false);
    const [autoPilotStatus, setAutoPilotStatus] = useState('');
    const [showReport, setShowReport] = useState(false);

    const updateStepData = (stepIndex: number, data: any) => {
        setState(prev => ({
            ...prev,
            steps: { ...prev.steps, [stepIndex]: data }
        }));
    };

    const nextStep = () => {
        const nextIndex = state.currentStepIndex + 1;
        if (nextIndex <= 6) {
            setState(prev => ({
                ...prev,
                currentStepIndex: nextIndex,
                stepStatus: {
                    ...prev.stepStatus,
                    [prev.currentStepIndex]: StepStatus.COMPLETED,
                    [nextIndex]: StepStatus.ACTIVE
                }
            }));
        } else {
            // Completed Step 6
            setState(prev => ({
                ...prev,
                stepStatus: { ...prev.stepStatus, 6: StepStatus.COMPLETED }
            }));
            setShowReport(true);
        }
    };

    const killIdea = () => {
        setIsKilled(true);
        setState(prev => ({
            ...prev,
            stepStatus: { ...prev.stepStatus, [prev.currentStepIndex]: StepStatus.KILLED }
        }));
    };

    const restart = () => {
        setState(INITIAL_STATE);
        setIsKilled(false);
        setShowReport(false);
    };

    const runAutoPilot = async () => {
        setIsAutoPilotRunning(true);
        try {
            // 0. Compress
            setAutoPilotStatus("Compressing Idea...");
            const s0 = state.steps[0];
            const compressed = await compressIdea(s0.structured);
            const updatedS0 = { ...s0, aiRefinement: compressed };
            updateStepData(0, updatedS0);

            const hypothesis = compressed.hypothesis;
            const persona = s0.structured.targetUser;
            const problem = s0.structured.problem;
            const solution = s0.structured.solution;

            // 1. Problem
            setAutoPilotStatus("Validating Problem (Reddit/Forums)...");
            const res1 = await researchProblem(problem, persona);
            const updatedS1 = {
                ...state.steps[1],
                problemFrequencyScore: res1.frequencyScore,
                painIntensityScore: res1.painScore,
                topQuotes: res1.quotes,
                evidenceSources: res1.sources
            };
            updateStepData(1, updatedS1);

            // 2. Market
            setAutoPilotStatus("Analyzing Market Size & Competitors...");
            const res2 = await researchMarket(persona, problem, solution);
            const updatedS2 = {
                ...state.steps[2],
                marketSize: res2.marketSize,
                channels: res2.channels,
                competitors: res2.competitors,
                reachableAudienceScore: res2.reachableScore,
                marketSources: res2.sources
            };
            updateStepData(2, updatedS2);

            // 3. Pricing & Conversion
            setAutoPilotStatus("Estimating Pricing & Traction...");
            const res3Pricing = await researchCompetitorPricing(res2.competitors, solution);
            const res3Conv = await estimateConversionPotential(problem, solution, res3Pricing.priceAnchor || 50);
            const updatedS3 = {
                ...state.steps[3],
                priceAnchor: res3Pricing.priceAnchor,
                currency: res3Pricing.currency || '$',
                pricingSources: res3Pricing.sources,
                conversionCount: res3Conv.estimatedConversionRate,
                commitmentType: 'email' as const
            };
            updateStepData(3, updatedS3);

            // 4. Benchmarks
            setAutoPilotStatus("Finding Industry Benchmarks...");
            const res4 = await researchBenchmarks("SaaS/Tech", "Technology");
            const updatedS4 = {
                ...state.steps[4],
                mvpType: 'landing_page',
                activationRate: res4.activationRate,
                retentionRate: res4.retentionRate,
                benchmarkSources: res4.sources
            };
            updateStepData(4, updatedS4);

            // 5. Demand
            setAutoPilotStatus("Calculating Demand & CAC...");
            const res5 = await researchDemand(hypothesis, persona);
            const updatedS5 = {
                ...state.steps[5],
                cac: res5.cac,
                channelViability: res5.channelViability,
                demandSources: res5.sources
            };
            updateStepData(5, updatedS5);

            // 6. Economics & Verdict
            setAutoPilotStatus("Forecasting Unit Economics & Final Verdict...");
            const res6Eco = await researchEconomics(solution, res3Pricing.priceAnchor);
            
            // Create a summary for the final check
            const summary = {
                hypothesis: hypothesis,
                problemScore: res1.painScore,
                marketReachable: res2.reachableScore,
                willingnessToPay: res3Conv.estimatedConversionRate,
                retention: res4.retentionRate,
                cac: res5.cac,
                unitEconomics: res6Eco.unitEconomics
            };
            
            const res6Verdict = await analyzeScalability(summary);
            const updatedS6 = {
                ...state.steps[6],
                unitEconomics: res6Eco.unitEconomics,
                economicsSources: res6Eco.sources,
                finalVerdict: res6Verdict.verdict as ValidationDecision
            };
            updateStepData(6, updatedS6);

            // Finish
            setState(prev => ({
                ...prev,
                currentStepIndex: 6,
                stepStatus: {
                    0: StepStatus.COMPLETED,
                    1: StepStatus.COMPLETED,
                    2: StepStatus.COMPLETED,
                    3: StepStatus.COMPLETED,
                    4: StepStatus.COMPLETED,
                    5: StepStatus.COMPLETED,
                    6: StepStatus.COMPLETED,
                }
            }));
            setShowReport(true);

        } catch (e) {
            console.error(e);
            alert("Auto-Pilot failed. Please try manual mode or check API key.");
        } finally {
            setIsAutoPilotRunning(false);
            setAutoPilotStatus('');
        }
    };

    const renderStep = () => {
        if (isAutoPilotRunning) {
            return (
                <div className="h-full flex flex-col items-center justify-center animate-pulse">
                    <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mb-6" />
                    <h2 className="text-2xl font-bold text-white mb-2">{autoPilotStatus}</h2>
                    <p className="text-gray-400">AI Agents are researching your idea...</p>
                </div>
            );
        }

        if (showReport) return <ReportView state={state} onClose={() => setShowReport(false)} />;
        if (isKilled) return <KillScreen onRestart={restart} />;

        switch (state.currentStepIndex) {
            case 0: return <Step0_IdeaCompression 
                data={state.steps[0]} 
                onUpdate={(d: Step0Data) => updateStepData(0, d)} 
                onComplete={nextStep} 
                onRunAutoPilot={runAutoPilot}
            />;
            case 1: return <Step1_ProblemValidation 
                data={state.steps[1]} 
                prevStepData={state.steps[0]}
                onUpdate={(d: Step1Data) => updateStepData(1, d)} 
                onComplete={nextStep}
                onFail={killIdea}
            />;
            case 2: return <Step2_MarketReality 
                data={state.steps[2]} 
                prevStepData={state.steps[0]}
                onUpdate={(d: Step2Data) => updateStepData(2, d)} 
                onComplete={nextStep}
                onFail={killIdea}
            />;
            case 3: return <Step3_WillingnessToPay
                data={state.steps[3]}
                onUpdate={(d: Step3Data) => updateStepData(3, d)}
                onComplete={nextStep}
                onFail={killIdea}
                competitors={state.steps[2].competitors}
                context={{ problem: state.steps[0].structured.problem, solution: state.steps[0].structured.solution }}
            />;
            case 4: return <Step4_SolutionValidation
                data={state.steps[4]}
                onUpdate={(d: Step4Data) => updateStepData(4, d)}
                onComplete={nextStep}
            />;
            case 5: return <Step5_DemandValidation
                data={state.steps[5]}
                prevHypothesis={state.steps[0].aiRefinement?.hypothesis || ''}
                mvpType={state.steps[4].mvpType}
                onUpdate={(d: Step5Data) => updateStepData(5, d)}
                onComplete={nextStep}
            />;
            case 6: return <Step6_Scalability
                data={state.steps[6]}
                fullState={state}
                onUpdate={(d: Step6Data) => updateStepData(6, d)}
                onComplete={() => setShowReport(true)}
            />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-truth-black text-white flex flex-col md:flex-row">
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 border-r border-truth-gray bg-[#050505] p-6 flex flex-col">
                <div className="mb-8">
                    <h1 className="text-xl font-black uppercase tracking-widest text-white">Validation<br/>Stack</h1>
                    <span className="text-xs text-gray-500 font-mono">The Funnel of Truth</span>
                </div>

                <nav className="space-y-1 flex-1">
                    {STEP_TITLES.map((title, index) => {
                        const status = state.stepStatus[index];
                        const isActive = state.currentStepIndex === index && !showReport;
                        const isCompleted = status === StepStatus.COMPLETED;
                        const isLocked = status === StepStatus.LOCKED;
                        const isKilledStep = status === StepStatus.KILLED;

                        let icon = <span className="text-xs font-mono">{index}</span>;
                        let textColor = "text-gray-600";
                        
                        if (isActive) {
                             textColor = "text-white";
                        } else if (isCompleted) {
                            textColor = "text-gray-400";
                            icon = <Check className="w-3 h-3 text-truth-green" />;
                        } else if (isLocked) {
                            textColor = "text-gray-700";
                            icon = <Lock className="w-3 h-3" />;
                        } else if (isKilledStep) {
                            textColor = "text-red-500";
                        }

                        return (
                            <div 
                                key={index}
                                className={`flex items-center gap-3 px-3 py-2 text-sm rounded-sm transition-colors ${isActive ? 'bg-white/5 font-bold' : ''} ${textColor}`}
                            >
                                <div className={`w-5 h-5 flex items-center justify-center border rounded-full ${isActive ? 'border-white' : 'border-gray-800'}`}>
                                    {icon}
                                </div>
                                <span>{title}</span>
                            </div>
                        );
                    })}
                </nav>

                <div className="pt-6 border-t border-truth-gray space-y-4">
                    {/* View Report Button (Always visible if steps are done) */}
                    {(state.stepStatus[6] === StepStatus.COMPLETED || showReport) && (
                        <Button 
                            onClick={() => setShowReport(true)} 
                            className="w-full flex items-center justify-center gap-2 bg-gray-800 text-xs"
                        >
                            <FileText className="w-3 h-3"/> View PDF Report
                        </Button>
                    )}

                    <div className="text-xs text-gray-600 font-mono">
                        STATUS: {isKilled ? 'DEAD' : 'ALIVE'}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-12 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    {renderStep()}
                </div>
            </main>
        </div>
    );
}