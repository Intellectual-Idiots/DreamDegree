'use client';

import { useEffect, useState } from 'react';

import { useTranslation } from '@/utils/translate';

type PineconeResult = Record<string, unknown>;

type ApiResponse = {
  results?: PineconeResult[];
  error?: string;
};

export default function PineconePage() {
  const [data, setData] = useState<PineconeResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

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
        <h1 className="text-2xl font-semibold">{t('Pinecone Records')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('Simple test page that calls')} <code>/api/getall</code> {t('and shows the raw results.')}
        </p>
      </header>

      {isLoading && <p>{t('Loading records…')}</p>}
      {error && <p className="text-sm text-red-500">{t('Error:')} {error}</p>}

      {!isLoading && !error && (
        <section className="rounded-md border p-4">
          {data.length === 0 ? (
            <p>{t('No records returned.')}</p>
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
