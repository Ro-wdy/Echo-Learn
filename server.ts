import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import compression from "compression";
import helmet from "helmet";
import { GoogleGenAI, Type } from "@google/genai";

import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const studySuiteSchema = {
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
};

const model = "gemini-3-flash-preview";

async function generateStudySuiteFromContents(contents: any) {
  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: studySuiteSchema,
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");

  return JSON.parse(text);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(compression());
  app.use(helmet({
    contentSecurityPolicy: false, // AI Studio iframe needs more relaxed CSP
  }));
  app.use(express.json({ limit: "35mb" }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  app.post("/api/gemini/process-file", async (req, res) => {
    try {
      const { base64Data, mimeType, prompt } = req.body ?? {};
      if (!base64Data || !mimeType) {
        return res.status(400).json({ error: "base64Data and mimeType are required" });
      }

      const studyPrompt = typeof prompt === "string" && prompt.trim()
        ? prompt
        : `You are a Socratic Tutor. Analyze the provided study material and generate a comprehensive study suite.
  The suite must include:
  1. A clear, readable summary in Markdown.
  2. A list of key concepts for deep understanding.
  3. A set of interactive flashcards (Question/Answer format).
  
  Maintain an encouraging, academic tone. Focus on clarity and conceptual depth.`;

      const studySuite = await generateStudySuiteFromContents({
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType,
            },
          },
          {
            text: studyPrompt,
          },
        ],
      });

      res.json(studySuite);
    } catch (err) {
      console.error("Gemini process-file error:", err);
      res.status(500).json({ error: "Failed to process file with Gemini" });
    }
  });

  app.post("/api/gemini/process-text", async (req, res) => {
    try {
      const { content, prompt } = req.body ?? {};
      if (!content) {
        return res.status(400).json({ error: "content is required" });
      }

      const studyPrompt = typeof prompt === "string" && prompt.trim()
        ? prompt
        : `You are a Socratic Tutor. Analyze the provided text material and generate a comprehensive study suite.
  The suite must include:
  1. A clear, readable summary in Markdown.
  2. A list of key concepts for deep understanding.
  3. A set of interactive flashcards (Question/Answer format).
  
  Material: ${content}

  Maintain an encouraging, academic tone. Focus on clarity and conceptual depth.`;

      const studySuite = await generateStudySuiteFromContents({
        parts: [{ text: studyPrompt }],
      });

      res.json(studySuite);
    } catch (err) {
      console.error("Gemini process-text error:", err);
      res.status(500).json({ error: "Failed to process text with Gemini" });
    }
  });

  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { sessionContext, history, query, systemPrompt } = req.body ?? {};
      if (!sessionContext || !query || !Array.isArray(history)) {
        return res.status(400).json({ error: "sessionContext, history, and query are required" });
      }

      const chatSystemPrompt = typeof systemPrompt === "string" && systemPrompt.trim()
        ? systemPrompt
        : `You are a Socratic Tutor specialized in the study material provided.
      Help the student understand concepts instead of just giving answers. Ask guiding questions.`;

      const response = await ai.models.generateContent({
        model,
        contents: [
          { role: "user", parts: [{ text: `Study Material Context: ${sessionContext}` }] },
          ...history.map((h: { role: "user" | "model"; content: string }) => ({
            role: h.role,
            parts: [{ text: h.content }],
          })),
          { role: "user", parts: [{ text: query }] },
        ],
        config: {
          systemInstruction: chatSystemPrompt,
        },
      });

      res.json({ text: response.text ?? "" });
    } catch (err) {
      console.error("Gemini chat error:", err);
      res.status(500).json({ error: "Failed to generate chat response" });
    }
  });

  app.get("/api/youtube-transcript", async (req, res) => {
    const videoUrl = req.query.url as string;
    if (!videoUrl) {
      return res.status(400).json({ error: "YouTube URL is required" });
    }

    try {
      // Basic extraction of video ID from URL
      let videoId = "";
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = videoUrl.match(regExp);
      if (match && match[2].length === 11) {
        videoId = match[2];
      } else {
        throw new Error("Invalid YouTube URL");
      }

      // Instead of an external library that might fail in this env,
      // we'll use the youtube-transcript package which is more reliable for Node.
      const { YoutubeTranscript } = await import('youtube-transcript');
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      const fullText = transcript.map(t => t.text).join(" ");
      
      res.json({ transcript: fullText, videoId });
    } catch (err) {
      console.error("YouTube Error:", err);
      res.status(500).json({ error: "Failed to fetch YouTube transcript. Make sure the video has captions enabled." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
