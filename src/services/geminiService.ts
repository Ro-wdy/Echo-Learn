import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface StudySuite {
  summary: string;
  keyConcepts: string[];
  flashcards: { q: string; a: string }[];
}

export const processFile = async (base64Data: string, mimeType: string): Promise<StudySuite> => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `You are a Socratic Tutor. Analyze the provided study material and generate a comprehensive study suite.
  The suite must include:
  1. A clear, readable summary in Markdown.
  2. A list of key concepts for deep understanding.
  3. A set of interactive flashcards (Question/Answer format).
  
  Maintain an encouraging, academic tone. Focus on clarity and conceptual depth.`;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        { text: prompt },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "Markdown summary" },
          keyConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
          flashcards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                q: { type: Type.STRING },
                a: { type: Type.STRING },
              },
              required: ["q", "a"],
            },
          },
        },
        required: ["summary", "keyConcepts", "flashcards"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  
  return JSON.parse(text) as StudySuite;
};

export const chatWithStudyMaterial = async (
  sessionContext: string, 
  history: { role: "user" | "model"; content: string }[],
  query: string
) => {
  const model = "gemini-3-flash-preview";
  
  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: `You are a Socratic Tutor specialized in this study material: ${sessionContext}. 
      Help the student understand concepts instead of just giving answers. Ask guiding questions.`,
    }
  });

  // Convert history to correct format for the SDK
  // The SDK doesn't natively support a simple 'history' array in create(), 
  // but we can sendMessage and it manages state if we keep the chat object.
  // Actually, we can pass initial contents to the chat.
  
  const response = await ai.models.generateContent({
    model,
    contents: [
      { role: "user", parts: [{ text: `Study Material Context: ${sessionContext}` }] },
      ...history.map(h => ({
        role: h.role,
        parts: [{ text: h.content }]
      })),
      { role: "user", parts: [{ text: query }] }
    ],
    config: {
       systemInstruction: `You are a Socratic Tutor specialized in the study material provided. 
      Help the student understand concepts instead of just giving answers. Ask guiding questions.`
    }
  });

  return response.text;
};
