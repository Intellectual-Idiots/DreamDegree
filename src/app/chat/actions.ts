"use server";

import { generateRagQuery } from "@/utils/openai/openai-rag-query-generator";
import type { PersonalitySummary } from "@/utils/generate-personality-summary";

type SimpleMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function generateRagQueryAction(params: {
  messages: SimpleMessage[];
  personalitySummary: PersonalitySummary | null;
}) {
  const { messages, personalitySummary } = params;

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("messages array is required to generate a query");
  }

  const sanitizedMessages = messages.map((message) => ({
    role: message.role,
    content: message.content.trim(),
  }));

  const query = await generateRagQuery(sanitizedMessages, personalitySummary);

  return { query };
}
