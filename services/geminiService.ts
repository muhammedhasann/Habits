
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { AIModelMode, DailyStats, HealthMetrics, UserProfile, HabitSuggestion, Habit } from '../types';

// Helper to get client - ensures we use latest env key or window selection for Veo
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// --- Text & Chat & Thinking & Search ---
export const generateTextResponse = async (
  mode: AIModelMode,
  prompt: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[] = []
) => {
  const ai = getAIClient();
  
  let model = 'gemini-2.5-flash'; // Default
  let config: any = {};

  if (mode === AIModelMode.FAST_CHAT) {
    model = 'gemini-2.5-flash-lite-latest';
  } else if (mode === AIModelMode.DEEP_THINK) {
    model = 'gemini-3-pro-preview';
    config.thinkingConfig = { thinkingBudget: 32768 }; // Max thinking
  } else if (mode === AIModelMode.RESEARCH) {
    model = 'gemini-2.5-flash';
    config.tools = [{ googleSearch: {} }];
  } else {
    // Standard Smart Chat
    model = 'gemini-3-pro-preview'; // Use pro for better general reasoning
  }

  try {
    // We use chat for better context maintenance
    const chat = ai.chats.create({
      model,
      history: history,
      config,
    });

    const response = await chat.sendMessage({ message: prompt + " (Keep it simple, concise, no buzzwords. Use emojis where appropriate.)" });
    
    let text = response.text;
    let groundingLinks: { title: string; uri: string }[] = [];

    if (mode === AIModelMode.RESEARCH) {
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.web) groundingLinks.push(chunk.web);
        });
      }
    }

    return { text, groundingLinks };
  } catch (error) {
    console.error("GenAI Error:", error);
    throw error;
  }
};

// --- Specialized: Journal Analysis ---
export const analyzeJournalEntry = async (entry: string): Promise<DailyStats> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze this journal entry.
      Entry: "${entry}"
      
      Return valid JSON with:
      1. focus (0-100)
      2. energy (0-100)
      3. mood (0-100)
      4. wins (Array of 1-3 short strings with emojis)
      5. aiAdvice (One simple, human sentence. No buzzwords.)
      6. tags (Array of strings like Work, Health, Family, Learning)`,
      config: {
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingBudget: 2048 } 
      }
    });

    const json = JSON.parse(response.text || '{}');
    return {
      focus: json.focus || 50,
      energy: json.energy || 50,
      mood: json.mood || 50,
      wins: json.wins || [],
      aiAdvice: json.aiAdvice || "Rest well.",
      tags: json.tags || []
    };
  } catch (e) {
    console.error("Analysis failed", e);
    return {
      focus: 0, energy: 0, mood: 0, wins: [], aiAdvice: "Could not analyze.", tags: []
    };
  }
};

// --- Specialized: Bio-Data Analysis ---
export const analyzeBioData = async (metrics: HealthMetrics, profile: UserProfile): Promise<{ score: number, advice: string, workout: string }> => {
    const ai = getAIClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Analyze these stats for a ${profile.chronotype} person.
            Goal: ${profile.mainGoal}.
            
            Stats:
            HRV: ${metrics.hrv}
            Sleep: ${metrics.sleepHours}h
            Steps: ${metrics.steps}
            
            Return JSON:
            { 
              "score": number (0-100 readiness), 
              "advice": string (1 short sentence, plain english), 
              "workout": string (e.g., "Run 🏃‍♂️", "Rest 🛌") 
            }`,
            config: {
                responseMimeType: 'application/json',
                thinkingConfig: { thinkingBudget: 4096 }
            }
        });
        return JSON.parse(response.text || '{}');
    } catch (e) {
        console.error("Bio Analysis Failed", e);
        return { score: 50, advice: "Take it easy today.", workout: "Light Walk 🚶" };
    }
};

// --- Specialized: Periodic Review Analysis ---
export const generatePeriodicReview = async (
    period: 'weekly' | 'monthly' | 'quarterly',
    profile: UserProfile, 
    sleepMatrix: {sleep: number, focus: number}[],
    wins: string[],
    lessons: string,
    goals: string[]
): Promise<string> => {
    const ai = getAIClient();
    
    let persona = "High-performance tactical coach (like Jocko Willink). Focus on execution.";
    if (period === 'monthly') persona = "Strategic advisor. Focus on trends and habit formation.";
    if (period === 'quarterly') persona = "Visionary strategist (like Peter Thiel). Focus on macro goals and trajectory.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Act as: ${persona}.
            Task: Analyze my ${period} review.
            
            User Profile: ${profile.mainGoal}, ${profile.chronotype}.
            
            Data Correlation (Sleep vs Focus):
            ${JSON.stringify(sleepMatrix)}
            
            My Wins:
            ${wins.join(', ')}

            My Lessons Learned:
            ${lessons}

            My Next ${period} Goals:
            ${goals.join(', ')}
            
            Provide a Debrief in Markdown.
            Structure:
            ### 🧠 Data Insight
            [Analyze the sleep/focus data correlation]

            ### 🛡️ Win Analysis
            [Brief comment on wins]

            ### ⚔️ Strategic Pivot
            [Actionable advice based on lessons]

            ### 🚀 Trajectory Check
            [Critique the next goals. Are they ambitious enough? Too vague?]

            Keep it direct, scientific, and motivating. Use emojis. No corporate buzzwords.`,
            config: {
                thinkingConfig: { thinkingBudget: 8192 }
            }
        });
        return response.text || "Could not generate review.";
    } catch (e) {
        return "Error generating analysis.";
    }
}

// --- Specialized: Habit Suggestions ---
export const suggestNewHabits = async (profile: UserProfile, currentHabits: Habit[]): Promise<HabitSuggestion[]> => {
    const ai = getAIClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Suggest 3 specific, simple habits for a user who wants "${profile.mainGoal}".
            Current habits: ${currentHabits.map(h => h.title).join(', ')}.
            
            Avoid corporate jargon. Use plain English. Use Emojis in titles.
            Format JSON: [{ "title": "Title with emoji", "description": "Very short instruction", "benefit": "One word benefit", "reason": "Why?", "videoId": "Optional YouTube ID" }]`,
            config: {
                responseMimeType: 'application/json',
                thinkingConfig: { thinkingBudget: 4096 }
            }
        });
        return JSON.parse(response.text || '[]');
    } catch (e) {
        return [];
    }
}

// --- Specialized: Daily Plan ---
export const generateDailyPlan = async (profile: UserProfile): Promise<{ mit: string, top3: string[], quote: string }> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `User Goal: ${profile.mainGoal}.
        Generate a plan for today.
        1. MIT: One major task that moves the needle.
        2. Top 3: Supporting tasks.
        3. Quote: Short, stoic or scientific.
        
        Use simple language. No buzzwords.
        Return JSON: { "mit": "string", "top3": ["string", "string", "string"], "quote": "string" }`,
        config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return { mit: "Focus Work", top3: ["Hydrate", "Move", "Read"], quote: "Begin." };
  }
}

// --- Quick Action Command ---
export const executeQuickAction = async (command: string): Promise<string> => {
    const ai = getAIClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite-latest',
            contents: `User command: "${command}". 
            Reply briefly in 1 sentence. Be helpful and robotic. Use an emoji.`
        });
        return response.text || "Done. 🤖";
    } catch (e) {
        return "Error. ⚠️";
    }
}

// --- Image Generation ---
export const generateImage = async (prompt: string, aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4' = '1:1') => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: aspectRatio,
        outputMimeType: 'image/jpeg',
      },
    });
    
    const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (!base64ImageBytes) throw new Error("No image generated");
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};

// --- Video Generation (Veo) ---
export const generateVideo = async (prompt: string, aspectRatio: '16:9' | '9:16') => {
  // Veo check for API Key selection
  // @ts-ignore
  if (window.aistudio && window.aistudio.hasSelectedApiKey && !(await window.aistudio.hasSelectedApiKey())) {
    // @ts-ignore
     await window.aistudio.openSelectKey();
  }
  
  const ai = getAIClient(); 

  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio: aspectRatio,
      }
    });

    // Polling
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("Video generation failed");
    
    const videoRes = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
    const blob = await videoRes.blob();
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error("Video Gen Error:", error);
    throw error;
  }
};

// --- TTS (Text to Speech) ---
export const generateSpeech = async (text: string) => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, 
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio generated");
    return base64Audio;
  } catch (error) {
    console.error("TTS Error:", error);
    throw error;
  }
};

// --- Transcription (Audio to Text) ---
export const transcribeAudio = async (base64Audio: string, mimeType: string) => {
    const ai = getAIClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { data: base64Audio, mimeType: mimeType } },
                    { text: "Transcribe exactly." }
                ]
            }
        });
        return response.text;
    } catch (error) {
        console.error("Transcription Error", error);
        throw error;
    }
}

// --- Audio Decoding Utility ---
export async function decodeAudioData(
  base64EncodedAudioString: string,
  outputAudioContext: AudioContext
): Promise<AudioBuffer> {
  const binaryString = atob(base64EncodedAudioString);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return await outputAudioContext.decodeAudioData(bytes.buffer);
}
