import { GoogleGenAI, Type } from "@google/genai";
import { DesignState } from "../types";
import { VISUAL_STYLES, PHOTOGRAPHY_STYLES, FONT_STYLES, CONTENT_PILLARS } from "../constants";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper for text generation
const generateText = async (prompt: string): Promise<string> => {
    const ai = getClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text?.trim() || "";
    } catch (e) {
        console.error(e);
        return "";
    }
};

// Convert file to base64
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// --- AUTO GENERATORS ---

// 1. Generate Theme (Based on Audience)
export const generateTheme = async (audience: string): Promise<string> => {
    if (!audience) return "Trending Lifestyle";
    return generateText(`Generate a single, specific, creative content theme or topic for a social media post targeting: ${audience}. Return ONLY the topic phrase.`);
}

// 2. Generate Hook (Based on Audience, Pillar, Theme)
export const generateHook = async (audience: string, pillar: string, theme: string): Promise<string> => {
    const ctx = `Audience: ${audience || 'General'}, Theme: ${theme || 'Lifestyle'}, Pillar: ${pillar}.`;
    return generateText(`Write a short, catchy hook (max 10 words) for a social media post. ${ctx}. Return ONLY the hook text.`);
}

// 3. Generate Content Description (Based on Audience, Pillar, Theme, Hook)
export const generateContentDescription = async (audience: string, pillar: string, theme: string, hook: string): Promise<string> => {
    const ctx = `Audience: ${audience}, Theme: ${theme}, Pillar: ${pillar}, Hook: "${hook}".`;
    return generateText(`Describe the visual scene for a social media image/video. Describe the action, setting, and mood. ${ctx}. Keep it concise (2 sentences).`);
}

// 4. Generate Image Overlay Text (Based on Hook, Theme)
export const generateOverlayText = async (theme: string, hook: string): Promise<string> => {
    return generateText(`Create a short punchy text overlay (max 5 words) for an image design. Theme: ${theme}. Hook Context: "${hook}". Return ONLY the text.`);
}

// 5. Generate Social Media Caption (Based on everything)
export const generateSocialCaption = async (state: Partial<DesignState>): Promise<string> => {
    const { targetAudience, contentPillar, theme, hook, contentDescription } = state;
    const ctx = `Audience: ${targetAudience}, Theme: ${theme}, Pillar: ${contentPillar}, Hook: "${hook}", Visual Context: "${contentDescription}".`;
    return generateText(`Write an engaging social media caption (Instagram/TikTok style). ${ctx}. Include emojis and 3 relevant hashtags. Return ONLY the caption.`);
}

// --- CORE FUNCTIONS ---

// Suggest Content (Full Auto-fill)
export const suggestDesign = async (currentTheme?: string): Promise<Partial<DesignState>> => {
  const ai = getClient();
  
  const prompt = `
    You are a professional social media creative director.
    Generate a creative feed design configuration JSON.
    Theme Context: "${currentTheme || 'Trending Lifestyle'}".
    
    Available Visual Styles: ${VISUAL_STYLES.join(', ')}
    Available Photo Styles: ${PHOTOGRAPHY_STYLES.join(', ')}
    Available Pillars: ${CONTENT_PILLARS.join(', ')}
    
    Return ONLY JSON matching this schema:
    {
      "targetAudience": "string",
      "theme": "string",
      "contentPillar": "string (one from list)",
      "hook": "string (attention grabber)",
      "contentDescription": "string (visual scene description)",
      "socialMediaCaption": "string (post caption with hashtags)",
      "caption": "string (short image overlay text)",
      "visualStyle": "string",
      "photographyStyle": "string",
      "fontStyle": "string",
      "modelDetails": {
        "age": "string",
        "gender": "string",
        "category": "Person" | "Couple" | "Group",
        "race": "string",
        "hijab": boolean,
        "faceless": boolean
      }
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No suggestion generated");
  } catch (error) {
    console.error("Auto-fill error:", error);
    throw error;
  }
};

// Search Grounding for Trends
export const getTrendingTopic = async (): Promise<string> => {
    const ai = getClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "What is a current trending aesthetic or topic on Instagram/TikTok for feed design right now? Give me just one specific concept phrase.",
            config: {
                tools: [{ googleSearch: {} }]
            }
        });
        return response.text || "Y2K Cyberpunk Fashion";
    } catch (e) {
        console.error(e);
        return "Minimalist Beige Aesthetic";
    }
}

// Generate Image Preview
export const generateImagePreview = async (prompt: string, referenceImages: File[]): Promise<string> => {
  const ai = getClient();
  
  const parts: any[] = [{ text: prompt }];
  
  for (const file of referenceImages) {
    const part = await fileToGenerativePart(file);
    parts.push(part);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview', 
      contents: { parts },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image generated in response");
  } catch (error) {
    console.error("Image gen error:", error);
    throw error;
  }
};
