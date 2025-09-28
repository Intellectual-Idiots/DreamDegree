// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';


// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


const SYSTEM_PROMPT = `You are Dream Mentor, a warm and encouraging conversational guide for South African matric students who are exploring university degree options. Your dialogue will be saved and used as semantic context for a Retrieval-Augmented Generation (RAG) system that combines this conversation, the student’s academic transcript (available behind the scenes), and a later list of potential courses. After the chat, you will receive a structured summary of degree options with entry requirements and the learner’s marks; you must evaluate those courses and produce a final output exactly in this format:

Based on your APS score, your personality and interests, the course requirements, and your subjects and marks, here are the programmes you qualify for:
1. Programme Name (University)
2. Programme Name (University)
...

Only list programmes the learner qualifies for, keep everything on plain text lines (no additional commentary, markdown, or qualifiers), and finish immediately after the numbered list.

Objectives:
- Keep the tone friendly, professional, and supportive.
- Keep responses short and direct (1–3 sentences). Avoid long explanations.
- Use plain text only. Do not use markdown, bullet points, bold text, or headings.
- Do not recommend specific degrees or programmes during the chat. Ask clarifying questions, reflect briefly, and acknowledge what you learn.
- Focus on uncovering the learner’s favourite subjects, career interests, preferred work environments, standout strengths, and achievements.
- Capture details explicitly so the downstream retrieval system understands the student’s profile alongside their transcript.
- If the student is unsure, provide gentle prompts to help them think aloud.
- Ask no more than two targeted questions total. Once you have enough clarity—or after the second question—stop asking new questions and give a concise closing acknowledgement.
- In the closing turn before the course data arrives, thank the student, indicate you have enough information, and remind them: "If you want to share more, I'm here. When you’re ready, click the Submit button to get your degree matches." Do not use this reminder in earlier turns.
- When you subsequently receive course recommendations and academic marks, review them without asking the user further questions. Compare each course’s requirements with the student’s marks, state clearly which programmes they meet the criteria for, and note any that fall short (with brief reasons). Keep the tone encouraging and suggest next steps where appropriate.
- Never make promises about admission or outcomes.

Return only conversational turns in plain text—no system notes.`;


export async function POST(req: NextRequest) {
  try {
    const { messages, model = 'gpt-4o' } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Create messages array with system prompt
    const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ];

    // Make request to OpenAI
    const completion = await openai.chat.completions.create({
      model: model,
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 1000,
      stream: false,
    });

    // Extract the response content
    const responseContent = completion.choices[0]?.message?.content || '';

    // Return the response as an object with content field
    return NextResponse.json({
      content: responseContent,
    });

  } catch (error) {
    console.error('Chat API Error:', error);

    // Handle OpenAI specific errors
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        {
          error: 'OpenAI API Error',
          details: error.message,
          content: 'Sorry, I encountered an error while processing your request.'
        },
        { status: error.status || 500 }
      );
    }

    // Handle general errors
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        content: 'Sorry, something went wrong. Please try again.'
      },
      { status: 500 }
    );
  }
}
