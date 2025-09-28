import { Buffer } from "buffer";
import OpenAI from "openai";

export type VisionSubject = {
  name: string;
  mark: number;
};

export type VisionResponse = {
  subjects: VisionSubject[];
};

let cachedClient: OpenAI | null = null;

const getClient = () => {
  if (cachedClient) {
    return cachedClient;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  console.log("This line ran");
  console.log(apiKey);
  if (!apiKey) {
    throw new Error("OpenAI API key is not configured.");
  }

  cachedClient = new OpenAI({ apiKey });
  return cachedClient;
};

const systemPrompt = `You are an expert vision assistant.
You will receive a South African Matriculant's transcript (Grade 12/11 final results).
Your role is to:
1. Analyze the transcript image carefully.
2. Extract all the subjects and their marks as percentages.
3. Write out subject names in full (no abbreviations, e.g., "Maths" → "Mathematics", "Afr" → "Afrikaans", "English" → "English Home Language" , "Life Sciences" → "Life Sciences").
4. Return strictly a JSON object with the structure:

{
  "subjects": [
    { "name": "English Home Language", "mark": 72 },
    { "name": "Mathematics", "mark": 65 },
    { "name": "Physical Sciences", "mark": 70 }
  ]
}

Do not include explanations, commentary, code fences (\`\`\`), or extra text — output only valid JSON.`;

const userPrompt = `Analyze the image of a South African Matriculant's transcript (Grade 12/11 final results) and return the subjects and their marks as percentages.`;

const parseVisionResponse = (content: string | null | undefined): VisionResponse => {
  if (!content) {
    throw new Error("INVALID_VISION_RESPONSE");
  }

  try {
    const normalized = content.trim().replace(/^```json\s*|```$/g, "");
    const parsed = JSON.parse(normalized) as VisionResponse;
    if (!parsed.subjects || !Array.isArray(parsed.subjects)) {
      throw new Error("INVALID_VISION_RESPONSE");
    }

    return {
      subjects: parsed.subjects
        .map((subject) => ({
          name: subject.name?.trim(),
          mark: Number(subject.mark),
        }))
        .filter((subject) => subject.name && Number.isFinite(subject.mark)) as VisionSubject[],
    };
  } catch (error) {
    throw new Error("INVALID_VISION_RESPONSE");
  }
};

const VISION_MODEL = process.env.OPENAI_VISION_MODEL ?? "gpt-4o-mini";

export async function extractVisionResultsFromFile(file: File | Blob): Promise<VisionResponse> {
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const mimeType = file instanceof File ? file.type : "image/jpeg";

  const dataUrl = `data:${mimeType};base64,${base64}`;

  const client = getClient();

  const start = Date.now();

  const response = await client.chat.completions.create({
    model: VISION_MODEL,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          {
            type: "image_url",
            image_url: {
              url: dataUrl,
              detail: "low",
            },
          },
        ],
      },
    ],
    max_tokens: 400,
  });

  const elapsed = Date.now() - start;
  const content = response.choices[0]?.message?.content;
  console.log("Vision model raw response (", elapsed, "ms):", content);
  return parseVisionResponse(content);
}
