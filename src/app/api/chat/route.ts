// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { SYSTEM_PROMPT } from '@/constants';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages, model = 'gpt-4o-mini' } = await req.json();

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