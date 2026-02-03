import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Step0Data } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });
const MODEL_NAME = 'gemini-3-flash-preview';
const RESEARCH_MODEL = 'gemini-3-pro-preview'; // Stronger reasoning for research

// Helper to clean JSON string if markdown code blocks exist
const cleanJson = (text: string) => {
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

// Helper to extract sources from grounding metadata
const extractSources = (response: any) => {
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return chunks
        .filter((c: any) => c.web?.uri)
        .map((c: any) => ({ title: c.web.title || 'Source', uri: c.web.uri }));
};

export const compressIdea = async (data: Step0Data['structured']) => {
    if (!apiKey) throw new Error("API Key missing");

    const prompt = `
    You are a brutal startup validator. Analyze this business idea structure.
    
    Target User: ${data.targetUser}
    Problem: ${data.problem}
    Solution: ${data.solution}
    Outcome: ${data.outcome}
    Alternative: ${data.alternative}

    1. Rewrite this into a single, sharp "Value Hypothesis" sentence.
    2. Identify the top 3 riskiest assumptions.
    3. Identify any vague words (e.g., "easy", "better", "disruptive") that need defining.

    Return JSON.
    `;

    const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
            hypothesis: { type: Type.STRING },
            assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
            vaguenessFlags: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["hypothesis", "assumptions"]
    };

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                systemInstruction: "You are a Y-Combinator style partner. Harsh but helpful. No fluff."
            }
        });
        
        return JSON.parse(cleanJson(response.text || '{}'));
    } catch (error) {
        console.error("Gemini Error:", error);
        throw error;
    }
};

export const researchProblem = async (problem: string, persona: string) => {
    if (!apiKey) throw new Error("API Key missing");

    const prompt = `
    Search specifically for forum discussions (Reddit, Quora, IndieHackers), reviews, and social media complaints where '${persona}' talks about '${problem}'.
    
    Based on the SEARCH RESULTS (not your internal knowledge):
    1. Estimate a 'frequency' score (0-100): How often does this come up?
    2. Estimate a 'pain' score (0-100): How angry/desperate are they?
    3. Extract 3 direct quotes or very close paraphrases of complaints found in the search.
    
    Return JSON.
    `;

    const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
            frequencyScore: { type: Type.INTEGER },
            painScore: { type: Type.INTEGER },
            quotes: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
    };

    const response = await ai.models.generateContent({
        model: RESEARCH_MODEL,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: responseSchema
        }
    });

    return {
        ...JSON.parse(cleanJson(response.text || '{}')),
        sources: extractSources(response)
    };
};

export const researchMarket = async (persona: string, problem: string, solution: string) => {
    if (!apiKey) throw new Error("API Key missing");

    const prompt = `
    Research the market for '${solution}' targeting '${persona}'.
    
    1. Find specific online communities, subreddits, or newsletters where '${persona}' hangs out.
    2. Identify 3 real competitors or existing alternatives for '${problem}'.
    3. Estimate the 'reachable' audience size (e.g. "200k active subreddit members", not "Global Population").
    
    Return JSON.
    `;

    const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
            marketSize: { type: Type.STRING },
            competitors: { type: Type.ARRAY, items: { type: Type.STRING } },
            channels: { type: Type.ARRAY, items: { type: Type.STRING } },
            reachableScore: { type: Type.INTEGER, description: "1-10 score based on how easy it is to find them." }
        }
    };

    const response = await ai.models.generateContent({
        model: RESEARCH_MODEL,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: responseSchema
        }
    });

    return {
        ...JSON.parse(cleanJson(response.text || '{}')),
        sources: extractSources(response)
    };
};

export const researchCompetitorPricing = async (competitors: string[], solution: string) => {
    if (!apiKey) throw new Error("API Key missing");

    const comps = competitors.length > 0 ? competitors.join(", ") : solution;
    const prompt = `
    Search for pricing pages of these competitors or similar solutions: ${comps}.
    
    Determine a realistic price anchor (average monthly cost in USD).
    
    Return JSON.
    `;

    const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
            priceAnchor: { type: Type.INTEGER },
            currency: { type: Type.STRING }
        }
    };

    const response = await ai.models.generateContent({
        model: RESEARCH_MODEL,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: responseSchema
        }
    });

    return {
        ...JSON.parse(cleanJson(response.text || '{}')),
        sources: extractSources(response)
    };
};

export const estimateConversionPotential = async (problem: string, solution: string, price: number) => {
    if (!apiKey) throw new Error("API Key missing");

    const prompt = `
    Analyze average conversion rates for landing pages offering a solution like "${solution}" at price point $${price}.
    
    Estimate a realistic number of signups/purchases if 100 targeted visitors land on the page (Conversion Rate %).
    
    Return JSON.
    `;

    const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
            estimatedConversionRate: { type: Type.INTEGER, description: "Number of conversions per 100 visitors" }
        }
    };

    const response = await ai.models.generateContent({
        model: RESEARCH_MODEL,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: responseSchema
        }
    });

    return {
        ...JSON.parse(cleanJson(response.text || '{}')),
        sources: extractSources(response)
    };
};

export const researchBenchmarks = async (mvpType: string, industry: string) => {
    if (!apiKey) throw new Error("API Key missing");

    const prompt = `
    Search for industry standard benchmarks for a ${mvpType} in the ${industry} space.
    
    Find realistic average:
    1. Activation Rates (visitor to signup/usage).
    2. Retention Rates (30-day or 90-day).
    
    Return JSON.
    `;

    const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
            activationRate: { type: Type.INTEGER },
            retentionRate: { type: Type.INTEGER }
        }
    };

    const response = await ai.models.generateContent({
        model: RESEARCH_MODEL,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: responseSchema
        }
    });

    return {
        ...JSON.parse(cleanJson(response.text || '{}')),
        sources: extractSources(response)
    };
};

export const researchDemand = async (solution: string, persona: string) => {
    if (!apiKey) throw new Error("API Key missing");

    const prompt = `
    Search for "average customer acquisition cost" (CAC) for B2B/B2C SaaS products targeting ${persona} or similar solutions to "${solution}".
    Search for effective marketing channels for this specific persona.
    
    1. Estimate a realistic CAC in USD.
    2. Assess channel viability (High, Medium, Low) based on where these users are active.
    
    Return JSON.
    `;

    const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
            cac: { type: Type.INTEGER },
            channelViability: { type: Type.STRING, enum: ["high", "medium", "low"] }
        }
    };

    const response = await ai.models.generateContent({
        model: RESEARCH_MODEL,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: responseSchema
        }
    });

    return {
        ...JSON.parse(cleanJson(response.text || '{}')),
        sources: extractSources(response)
    };
};

export const researchEconomics = async (solution: string, price: number) => {
    if (!apiKey) throw new Error("API Key missing");

    const prompt = `
    Analyze the unit economics for a business selling "${solution}" at approx $${price}.
    
    Search for:
    1. Typical profit margins for this business model.
    2. Common operational bottlenecks or "hidden costs" that kill these startups.
    
    Summarize the Unit Economics (LTV, Margins, Costs) in a short paragraph.
    
    Return JSON.
    `;

    const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
            unitEconomics: { type: Type.STRING }
        }
    };

    const response = await ai.models.generateContent({
        model: RESEARCH_MODEL,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: responseSchema
        }
    });

    return {
        ...JSON.parse(cleanJson(response.text || '{}')),
        sources: extractSources(response)
    };
};

export const generateInterviewScript = async (problem: string, persona: string) => {
    if (!apiKey) throw new Error("API Key missing");
    
    const prompt = `
    Generate 5 user interview questions to validate this problem: "${problem}" for this persona: "${persona}".
    
    RULES:
    1. DO NOT mention the solution.
    2. Focus on past behavior, frequency, and current workarounds.
    3. Questions must be open-ended (The Mom Test style).
    
    Return JSON.
    `;

    const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
            questions: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
    };

    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema }
    });
    return JSON.parse(cleanJson(response.text || '{}'));
};

export const analyzeMarket = async (persona: string, problem: string) => {
    // Legacy function kept for fallback if needed, but researchMarket covers this now
    return researchMarket(persona, problem, "solution"); 
};

export const generateCopyVariations = async (hypothesis: string, mvpType: string) => {
     if (!apiKey) throw new Error("API Key missing");

     const prompt = `
     Write a high-conversion headline and subheadline for a ${mvpType} based on this hypothesis: "${hypothesis}".
     Focus on the outcome, not the features.
     Return JSON.
     `;

      const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
            bestCopy: { type: Type.STRING }
        }
    };
    
    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema }
    });
    return JSON.parse(cleanJson(response.text || '{}'));
}

export const analyzeScalability = async (data: any) => {
     if (!apiKey) throw new Error("API Key missing");

     const prompt = `
     You are the Final Gatekeeper. Perform a deep validation review of this startup concept based on all gathered data.
     
     Data: ${JSON.stringify(data)}

     Search the web for "failures of [similar startups]" or "why [business model] is hard" to check for fatal flaws that might contradict the user's optimistic data.
     
     Decide:
     - PROCEED: If the problem is real, market is reachable, and economics work.
     - PIVOT: If there is a signal but the current approach/channel/price is wrong.
     - KILL: If the problem is weak, market is too small, or economics don't scale.
     
     Provide a brutal, evidence-backed reason.
     
     Return JSON.
     `;

    const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
            verdict: { type: Type.STRING, enum: ["PROCEED", "PIVOT", "KILL"] },
            reason: { type: Type.STRING }
        }
    };

    const response = await ai.models.generateContent({
        model: RESEARCH_MODEL,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: responseSchema
        }
    });
    return JSON.parse(cleanJson(response.text || '{}'));
}