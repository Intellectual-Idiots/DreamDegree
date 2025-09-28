import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';

const DEFAULT_INDEX_NAME = 'dense-for-hybrid-hackathon';
const DEFAULT_NAMESPACE = 'namespace-1';
const TOP_K = 10;

type SearchHit = {
  _id: string;
  _score?: number;
  fields?: Record<string, unknown> | null;
};

const sanitizeRecord = ({ _id, _score, fields }: SearchHit) => {
  const sanitizedFields = { ...(fields ?? {}) };
  if ('RAG' in sanitizedFields) {
    delete sanitizedFields.RAG;
  }

  return {
    id: _id,
    score: _score,
    ...sanitizedFields,
  };
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.PINECONE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Pinecone API key not configured' },
      { status: 500 },
    );
  }

  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query string is required' },
        { status: 400 },
      );
    }

    const trimmedQuery = query.trim();

    if (trimmedQuery.length === 0) {
      return NextResponse.json(
        { error: 'Query string is required' },
        { status: 400 },
      );
    }

    console.info("[/api/pinecone] Query text:", trimmedQuery);

    const pinecone = new Pinecone({ apiKey });
    const indexName = process.env.PINECONE_DENSE_INDEX ?? DEFAULT_INDEX_NAME;
    const namespace = process.env.PINECONE_NAMESPACE ?? DEFAULT_NAMESPACE;
    const indexHost = process.env.PINECONE_DENSE_HOST;
    const index = pinecone.index(indexName, indexHost);
    const namespaceClient = index.namespace(namespace);

    const searchResponse = await namespaceClient.searchRecords({
      query: {
        topK: TOP_K,
        inputs: {
          text: trimmedQuery,
        },
      },
    });

    const hits = searchResponse.result?.hits ?? [];
    const sanitizedMatches = hits.map(({ _id, _score, fields }) =>
      sanitizeRecord({ _id, _score, fields: fields as Record<string, unknown> | null })
    );

    console.info(`[/api/pinecone] Retrieved ${sanitizedMatches.length} matches from ${indexName}/${namespace}`);
    console.info("[/api/pinecone] Matches:", sanitizedMatches);

    return NextResponse.json({ results: sanitizedMatches });
  } catch (error) {
    console.error('Pinecone query error:', error);
    return NextResponse.json(
      { error: 'Failed to query Pinecone' },
      { status: 500 },
    );
  }
}
