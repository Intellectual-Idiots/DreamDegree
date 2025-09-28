'use client';

import { useEffect, useState } from 'react';

type PineconeResult = Record<string, unknown>;

type ApiResponse = {
  results?: PineconeResult[];
  error?: string;
};

export default function PineconePage() {
  const [data, setData] = useState<PineconeResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/getall');
        const payload: ApiResponse = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || 'Request failed');
        }

        setData(payload.results ?? []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Pinecone Records</h1>
        <p className="text-sm text-muted-foreground">
          Simple test page that calls <code>/api/getall</code> and shows the raw results.
        </p>
      </header>

      {isLoading && <p>Loading records…</p>}
      {error && <p className="text-sm text-red-500">Error: {error}</p>}

      {!isLoading && !error && (
        <section className="rounded-md border p-4">
          {data.length === 0 ? (
            <p>No records returned.</p>
          ) : (
            <pre className="max-h-[480px] overflow-auto text-sm">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </section>
      )}
    </main>
  );
}
