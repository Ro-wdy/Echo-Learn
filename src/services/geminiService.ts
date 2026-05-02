export interface StudySuite {
  summary: string;
  keyConcepts: string[];
  flashcards: { q: string; a: string }[];
}

const STUDY_SUITE_PROMPT = `You are a Socratic Tutor. Analyze the provided study material and generate a comprehensive study suite.
The suite must include:
1. A clear, readable summary in Markdown.
2. A list of key concepts for deep understanding.
3. A set of interactive flashcards (Question/Answer format).

Maintain an encouraging, academic tone. Focus on clarity and conceptual depth.`;

const CHAT_SYSTEM_PROMPT = `You are a Socratic Tutor specialized in the study material provided.
Help the student understand concepts instead of just giving answers. Ask guiding questions.`;

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const processFile = async (base64Data: string, mimeType: string): Promise<StudySuite> => {
  return postJson<StudySuite>("/api/gemini/process-file", {
    base64Data,
    mimeType,
    prompt: STUDY_SUITE_PROMPT,
  });
};

export const processText = async (content: string): Promise<StudySuite> => {
  return postJson<StudySuite>("/api/gemini/process-text", {
    content,
    prompt: STUDY_SUITE_PROMPT,
  });
};

export const chatWithStudyMaterial = async (
  sessionContext: string, 
  history: { role: "user" | "model"; content: string }[],
  query: string
) => {
  const response = await postJson<{ text: string }>("/api/gemini/chat", {
    sessionContext,
    history,
    query,
    systemPrompt: CHAT_SYSTEM_PROMPT,
  });

  return response.text;
};
