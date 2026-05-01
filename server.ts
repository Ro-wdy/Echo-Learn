import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import compression from "compression";
import helmet from "helmet";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(compression());
  app.use(helmet({
    contentSecurityPolicy: false, // AI Studio iframe needs more relaxed CSP
  }));
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // EchoLearn specific endpoint - acts as a light processor or just a placeholder
  app.post("/api/process", (req, res) => {
    res.json({ message: "File received. Processing in client-side Gemini." });
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
