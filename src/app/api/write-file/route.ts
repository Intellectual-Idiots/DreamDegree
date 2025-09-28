import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, data } = body;

    // Validate required fields
    if (!filename || data === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: filename and data' },
        { status: 400 }
      );
    }

    // Validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json(
        { error: 'Invalid filename. Only simple filenames allowed in public directory.' },
        { status: 400 }
      );
    }

    // Construct the file path in the public directory
    const publicDir = path.join(process.cwd(), 'public');
    const filePath = path.join(publicDir, filename);

    // Convert data to JSON string if it's an object/array
    let fileContent: string;
    if (typeof data === 'string') {
      fileContent = data;
    } else {
      fileContent = JSON.stringify(data, null, 2);
    }

    // Write the file
    await writeFile(filePath, fileContent, 'utf8');

    return NextResponse.json(
      { 
        message: `Successfully wrote ${filename} to public directory`,
        filename: filename,
        path: filePath
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error writing file:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to write file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Optional: Add GET method to list files or retrieve file info
export async function GET() {
  return NextResponse.json(
    { 
      message: 'Write File API - Use POST method to write files to public directory',
      usage: {
        method: 'POST',
        endpoint: '/api/write-file',
        body: {
          filename: 'example.json',
          data: { key: 'value' }
        }
      }
    },
    { status: 200 }
  );
}
