import { NextResponse } from 'next/server';
import { Pinecone, type ListResponse, type PineconeRecord } from '@pinecone-database/pinecone';

const DEFAULT_INDEX_NAME = 'dense-for-hybrid-hackathon';
const DEFAULT_NAMESPACE = 'namespace-1';
const PAGE_SIZE = 100;
const FETCH_BATCH_SIZE = 100;

type ListVectors = NonNullable<ListResponse['vectors']>;

type ListVectorId = NonNullable<ListVectors[number]['id']>;

type FlattenedRecord = Record<string, unknown>;

const flattenRecord = (record: PineconeRecord): FlattenedRecord => {
  const { id, metadata } = record;
  const base: FlattenedRecord = id ? { id } : {};

  if (metadata && typeof metadata === 'object') {
    const { RAG, ...otherMetadata } = metadata as Record<string, unknown>;
    return { ...base, ...otherMetadata };
  }

  const {
    id: _ignoredId,
    values: _ignoredValues,
    sparseValues: _ignoredSparseValues,
    metadata: _ignoredMetadata,
    ...rest
  } =
    record as Record<string, unknown>;
  return { ...base, ...rest };
};

export async function GET() {
  const apiKey = process.env.PINECONE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Pinecone API key not configured' },
      { status: 500 }
    );
  }

  try {
    const pinecone = new Pinecone({ apiKey });
    const indexName = process.env.PINECONE_DENSE_INDEX ?? DEFAULT_INDEX_NAME;
    const namespace = process.env.PINECONE_NAMESPACE ?? DEFAULT_NAMESPACE;
    const index = pinecone.index(indexName).namespace(namespace);

    const allIds: ListVectorId[] = [];
    let paginationToken: string | undefined;

    do {
      const listResponse = await index.listPaginated({
        limit: PAGE_SIZE,
        paginationToken,
      });

      const pageIds = listResponse.vectors
        ?.map(({ id }) => id)
        .filter((id): id is ListVectorId => Boolean(id)) ?? [];

      allIds.push(...pageIds);
      paginationToken = listResponse.pagination?.next;
    } while (paginationToken);

    if (allIds.length === 0) {
      return NextResponse.json({ results: [] });
    }

    const records: FlattenedRecord[] = [];

    for (let i = 0; i < allIds.length; i += FETCH_BATCH_SIZE) {
      const chunk = allIds.slice(i, i + FETCH_BATCH_SIZE);
      if (chunk.length === 0) continue;

      const fetchResponse = await index.fetch(chunk);
      const sanitizedRecords = Object.values(fetchResponse.records ?? {}).map(
        flattenRecord
      );
      records.push(...sanitizedRecords);
    }

    return NextResponse.json({ results: records });
  } catch (error) {
    console.error('Error fetching Pinecone records:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve records from Pinecone' },
      { status: 500 }
    );
  }
}
