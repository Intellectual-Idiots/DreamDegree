"use server";

import { extractVisionResultsFromFile } from "@/utils/openai/vision-results";

export type AnalyzeReportResponse =
  | {
      success: true;
      subjects: {
        name: string;
        mark: number;
      }[];
    }
  | {
      success: false;
      error: string;
    };

export async function analyzeReportAction(formData: FormData): Promise<AnalyzeReportResponse> {
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return {
      success: false,
      error: "No file provided.",
    };
  }

  if (file.type !== "image/jpeg") {
    return {
      success: false,
      error: "Only JPG files are supported right now.",
    };
  }

  if (!process.env.OPENAI_API_KEY) {
    return {
      success: false,
      error:
        "Vision analysis is not configured. Add your OpenAI API key and try again.",
    };
  }

  try {
    const { subjects } = await extractVisionResultsFromFile(file);

    if (!subjects.length) {
      return {
        success: false,
        error: "Could not detect any subjects in the uploaded report.",
      };
    }

    return {
      success: true,
      subjects,
    };
  } catch (error) {
    console.error("analyzeReportAction error", error);

    if (error instanceof Error && error.message === "INVALID_VISION_RESPONSE") {
      return {
        success: false,
        error:
          "We could not read that document. Please upload a clear JPG matric results report.",
      };
    }

    return {
      success: false,
      error: "We could not process this report. Please try another image.",
    };
  }
}
