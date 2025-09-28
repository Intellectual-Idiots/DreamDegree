import OpenAI from "openai";

import type { PersonalitySummary } from "@/utils/generate-personality-summary";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const SYSTEM_PROMPT = `You are an expert query crafter for a degree recommendation Retrieval-Augmented Generation pipeline.
You receive a distilled view of a user's personality profile and their recent conversation with a career guidance assistant.
Your job is to produce a single, semantically rich Pinecone search query, no longer than two sentences, that will surface university programmes the person is most likely to qualify for and resonate with.
Do not add commentary, markdown, or explanations—only return the final query text in a single line of text.`;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateRagQuery(
  messages: ChatMessage[],
  personalitySummary?: PersonalitySummary | null,
) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  if (!Array.isArray(messages)) {
    throw new Error("messages must be an array of chat history objects");
  }

  const contextSummary = personalitySummary
    ? `User personality summary: ${JSON.stringify(personalitySummary)}`
    : "User personality summary: Not available";

  const conversationSummary = messages
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join("\n");

  const prompt = `Context for query generation:\n${contextSummary}\n\nRecent conversation transcript:\n${conversationSummary || "No recent messages."}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.2,
    max_tokens: 200,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
  });

  const ragQuery = completion.choices[0]?.message?.content?.trim();

  if (!ragQuery) {
    throw new Error("Failed to generate RAG query from OpenAI");
  }

  return ragQuery;
}
