import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { NewsResponse, Source } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Timeout helper
const withTimeout = <T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> => {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) => 
            setTimeout(() => reject(new Error(errorMessage)), ms)
        )
    ]);
};

export const fetchNews = async (query: string): Promise<NewsResponse> => {
  try {
    const modelId = 'gemini-3-flash-preview';
    const today = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

    // Strongly enforcing Taiwan context, Traditional Chinese, and Current Date
    const fullQuery = `
    Context: Today is ${today}.
    Task: Search for the latest and most relevant news regarding: "${query}" in Taiwan (or related to Taiwan). 
    Constraint: Summarize the top 5-8 distinct stories in Traditional Chinese (Taiwan standard usage, zh-TW).
    Requirement: 
    1. Focus on local Taiwanese perspectives and accurate terminology.
    2. Format the output with Markdown. Use bolding for headlines. 
    3. Do not use JSON formatting in the text response, just clean readable Markdown.
    4. Ensure the news is strictly current relative to today's date.
    `;

    // Set a timeout of 60 seconds (Increased from 15s) to account for Search Grounding latency
    const response: GenerateContentResponse = await withTimeout(
        ai.models.generateContent({
            model: modelId,
            contents: fullQuery,
            config: {
                tools: [{ googleSearch: {} }],
                systemInstruction: "You are a professional Taiwanese news editor. You provide concise, objective summaries of current events in Traditional Chinese (zh-TW). You prioritize Taiwanese news sources and local context.",
            },
        }),
        60000, 
        "API_TIMEOUT"
    );

    const text = response.text || "目前無法獲取新聞，請稍後再試。";
    
    // Extract sources from grounding metadata safely
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources: Source[] = [];
    groundingChunks.forEach((chunk: any) => {
      // Robust check for web source structure
      if (chunk.web && chunk.web.uri && chunk.web.title) {
        sources.push({
          title: chunk.web.title,
          uri: chunk.web.uri
        });
      }
    });

    // Remove duplicates based on URI
    const uniqueSources = sources.filter((v, i, a) => a.findIndex(t => (t.uri === v.uri)) === i);

    return {
      summary: text,
      sources: uniqueSources
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    let errorMsg = "系統連線錯誤，無法擷取新聞。\n\nSystem Error: Connection Failed.";
    
    if (error.message === "API_TIMEOUT") {
        errorMsg = "⚠️ 運算時間較長 (Processing Delay)\n\n新聞搜尋與整理需要較多時間（約 20-40 秒），請再試一次，或檢查網路連線。";
    } else if (error.message && error.message.includes("429")) {
        errorMsg = "⚠️ 達到使用上限 (Rate Limit Exceeded)\n\n您測試的頻率較高，已達到 API 的短時間限制。請休息 1-2 分鐘後再試。\n(Quota exhausted, please wait a moment)";
    } else if (error.message && error.message.includes("API key")) {
        errorMsg = "⚠️ API Key 無效 (Invalid API Key)\n\n請檢查您的 API Key 是否正確設定。";
    }

    return {
      summary: errorMsg,
      sources: []
    };
  }
};