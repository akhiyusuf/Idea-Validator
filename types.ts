// Enums
export enum StepStatus {
    LOCKED = 'LOCKED',
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    KILLED = 'KILLED'
}

export enum ValidationDecision {
    PROCEED = 'PROCEED',
    PIVOT = 'PIVOT',
    KILL = 'KILL'
}

export interface Source {
    title: string;
    uri: string;
}

// Data Structures for each step
export interface Step0Data {
    rawIdea: string;
    structured: {
        targetUser: string;
        problem: string;
        solution: string;
        outcome: string;
        alternative: string;
    };
    aiRefinement?: {
        hypothesis: string;
        assumptions: string[];
        vaguenessFlags: string[];
    };
}

export interface Step1Data {
    interviewQuestions?: string[];
    problemFrequencyScore: number; // 0-100
    painIntensityScore: number; // 0-100
    topQuotes?: string[];
    evidenceSources?: Source[];
}

export interface Step2Data {
    marketSize: string;
    competitors: string[];
    channels: string[];
    reachableAudienceScore: number; // 0-10
    marketSources?: Source[];
}

export interface Step3Data {
    priceAnchor: number;
    currency: string;
    commitmentType: 'email' | 'payment' | 'loi';
    conversionCount: number;
    pricingSources?: Source[];
}

export interface Step4Data {
    mvpType: string;
    activationRate: number; // Percentage
    retentionRate: number; // Percentage
    benchmarkSources?: Source[];
}

export interface Step5Data {
    cac: number;
    channelViability: string;
    bestCopy?: string;
    demandSources?: Source[];
}

export interface Step6Data {
    unitEconomics: string;
    scalabilityScore: number; // 0-10
    finalVerdict?: ValidationDecision;
    economicsSources?: Source[];
}

// Global App State
export interface ValidationState {
    currentStepIndex: number;
    steps: {
        0: Step0Data;
        1: Step1Data;
        2: Step2Data;
        3: Step3Data;
        4: Step4Data;
        5: Step5Data;
        6: Step6Data;
    };
    stepStatus: Record<number, StepStatus>;
}

export const INITIAL_STATE: ValidationState = {
    currentStepIndex: 0,
    steps: {
        0: { rawIdea: '', structured: { targetUser: '', problem: '', solution: '', outcome: '', alternative: '' } },
        1: { problemFrequencyScore: 0, painIntensityScore: 0, evidenceSources: [] },
        2: { marketSize: '', competitors: [], channels: [], reachableAudienceScore: 0, marketSources: [] },
        3: { priceAnchor: 0, currency: '$', commitmentType: 'email', conversionCount: 0, pricingSources: [] },
        4: { mvpType: 'landing_page', activationRate: 0, retentionRate: 0, benchmarkSources: [] },
        5: { cac: 0, channelViability: '', demandSources: [] },
        6: { unitEconomics: '', scalabilityScore: 0, economicsSources: [] }
    },
    stepStatus: {
        0: StepStatus.ACTIVE,
        1: StepStatus.LOCKED,
        2: StepStatus.LOCKED,
        3: StepStatus.LOCKED,
        4: StepStatus.LOCKED,
        5: StepStatus.LOCKED,
        6: StepStatus.LOCKED,
    }
};

export const STEP_TITLES = [
    "Idea Compression",
    "Problem Validation",
    "Market Reality",
    "Willingness to Pay",
    "Solution Validation",
    "Demand Validation",
    "Scalability Check"
];