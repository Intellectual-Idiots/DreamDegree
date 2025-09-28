"use client";

import { type DragEvent, useEffect, useMemo, useState } from "react";
import { Plus, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { analyzeReportAction } from "./action";
import { Toaster } from "@/components/ui/sonner";
import { useTranslation } from "@/utils/translate";

const SUBJECTS_RAW = [
  "life orientation",
  "life sciences",
  "further studies mathematics",
  "computer applications technology",
  "further studies english",
  "german second additional language",
  "german home language",
  "gujarati home language",
  "gujarati first additional language",
  "gujarati second additional language",
  "hebrew second additional language",
  "hindi home language",
  "hindi first additional language",
  "hindi second additional language",
  "tamil home language",
  "tamil first additional language",
  "tamil second additional language",
  "telugu home language",
  "telugu first additional language",
  "telugu second additional language",
  "urdu home language",
  "urdu first additional language",
  "urdu second additional language",
  "history",
  "arabic second additional language",
  "french second additional language",
  "italian second additional language",
  "latin second additional language",
  "mandarin second additional language",
  "modern greek second additional language",
  "portuguese home language",
  "portuguese first additional language",
  "portuguese second additional language",
  "serbian second additional language",
  "spanish second additional language",
  "dramatic arts",
  "equine studies",
  "agricultural science",
  "dance studies",
  "further studies physics",
  "mathematics",
  "afrikaans home language",
  "afrikaans first additional language",
  "isixhosa first additional language",
  "isizulu first additional language",
  "isizulu home language",
  "sepedi first additional language",
  "sepedi home language",
  "sesotho first additional language",
  "sesotho home language",
  "setswana first additional language",
  "siswati first additional language",
  "xitsonga first additional language",
  "tshivenda first additional language",
  "sport and exercise science",
  "tourism",
  "engineering graphics and design",
  "mathematical literacy",
  "physical sciences",
  "maritime economics",
  "english home language",
  "english first additional language",
  "business studies",
  "nautical science",
  "information technology",
  "marine sciences",
  "design",
  "geography",
  "consumer studies",
  "hospitality studies",
  "electrical technology",
  "agricultural management practices",
  "visual arts",
  "accounting",
  "music",
  "economics",
  "isindebele home language",
  "isindebele first additional language",
  "isindebele second additional language",
  "isixhosa home language",
  "setswana home language",
  "siswati home language",
  "tshivenda home language",
  "xitsonga home language",
  "afrikaans second additional language",
  "english second additional language",
  "isixhosa second additional language",
  "isizulu second additional language",
  "sepedi second additional language",
  "sesotho second additional language",
  "setswana second additional language",
  "siswati second additional language",
  "tshivenda second additional language",
  "xitsonga second additional language",
  "civil technology",
  "mechanical technology",
  "religion studies",
];

const SUBJECTS = [...SUBJECTS_RAW].sort((a, b) => a.localeCompare(b));

type SubjectOption = {
  value: string;
  label: string;
};

const formatSubjectLabel = (subject: string) =>
  subject
    .split(/\s+/)
    .map((word) =>
      word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word,
    )
    .join(" ")
    .replace(/\bAnd\b/g, "and");

const SUBJECT_OPTIONS: SubjectOption[] = SUBJECTS.map((subject) => ({
  value: subject,
  label: formatSubjectLabel(subject),
}));

const subjectLabelMap = new Map<string, string>(
  SUBJECT_OPTIONS.map((option) => [option.value, option.label]),
);

const levenshtein = (a: string, b: string) => {
  if (a === b) {
    return 0;
  }
  if (a.length === 0) {
    return b.length;
  }
  if (b.length === 0) {
    return a.length;
  }

  const matrix: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i]);

  for (let j = 0; j <= b.length; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      if (!matrix[i]) {
        matrix[i] = [];
      }

      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + 1,
        );
      }
    }
  }

  return matrix[a.length][b.length];
};

const matchSubjectName = (rawSubject: string) => {
  const normalized = rawSubject.trim().toLowerCase();

  if (!normalized) {
    return "";
  }

  if (subjectLabelMap.has(normalized)) {
    return normalized;
  }

  let bestMatch = SUBJECTS[0];
  let bestScore = Number.POSITIVE_INFINITY;

  for (const subject of SUBJECTS) {
    const distance = levenshtein(normalized, subject);
    if (distance < bestScore) {
      bestScore = distance;
      bestMatch = subject;
    }
  }

  return bestMatch;
};


const LOCAL_STORAGE_KEY = "resultsData";

type ManualEntry = {
  id: string;
  subject: string;
  mark: string;
};

type ResultRow = {
  subject: string;
  mark: number;
};

const createManualEntry = (overrides?: Partial<ManualEntry>): ManualEntry => ({
  id: Math.random().toString(36).slice(2, 10),
  subject: "",
  mark: "",
  ...overrides,
});

export default function ResultsPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [isLoadingStoredResults, setIsLoadingStoredResults] = useState(true);
  const [manualEntries, setManualEntries] = useState<ManualEntry[]>(() => [
    createManualEntry(),
  ]);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    setIsLoadingStoredResults(true);

    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);

      if (stored) {
        const parsed: ResultRow[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const normalized = parsed
            .map((row) => ({
              subject: matchSubjectName(row.subject ?? ""),
              mark: Math.min(100, Math.max(0, Number(row.mark))),
            }))
            .filter((row) => row.subject && Number.isFinite(row.mark));

          setResults(normalized);
        }
      }
    } catch (err) {
      console.error("Failed to load stored results", err);
      toast.error(t("We couldn't load your saved results. Starting fresh."));
      setResults([]);
    } finally {
      setIsLoadingStoredResults(false);
    }
  }, [hasHydrated]);

  useEffect(() => {
    if (!isManualOpen) {
      return;
    }

    setManualEntries(
      results.length > 0
        ? results.map((result) =>
          createManualEntry({
            subject: matchSubjectName(result.subject),
            mark: String(result.mark),
          }),
        )
        : [createManualEntry()],
    );
  }, [isManualOpen, results]);

  const processUploadedReport = async (file: File) => {
    setProcessingError(null);
    setIsProcessingUpload(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await analyzeReportAction(formData);

      if (!response.success) {
        setProcessingError(t(response.error));
        setSelectedFile(null);
        setDragActive(false);
        setIsProcessingUpload(false);
        toast.error(t(response.error));
        return;
      }

      const nextResults = response.subjects
        .map((subject) => ({
          subject: matchSubjectName(subject.name ?? ""),
          mark: Math.min(100, Math.max(0, Number(subject.mark))),
        }))
        .filter((subject) => subject.subject && !Number.isNaN(subject.mark));

      setResults(nextResults);
      setSelectedFile(null);
      setDragActive(false);
      toast.success(t("Report analyzed successfully. Review and save your marks."));

      setIsProcessingUpload(false);
      setIsUploadOpen(false);
      setIsManualOpen(true);
    } catch (error) {
      console.error("Failed to analyze report", error);
      setProcessingError(
        t("We ran into a problem analyzing the report. Please try again."),
      );
      setSelectedFile(null);
      setDragActive(false);
      setIsProcessingUpload(false);
      toast.error(t("We ran into a problem analyzing the report. Please try again."));
    }
  };

  const handleFileInput = (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      setFileError(t("Please upload a valid image file (JPG, PNG, WebP, etc.)."));
      setSelectedFile(null);
      return;
    }

    setFileError(null);
    setSelectedFile(file);
    void processUploadedReport(file);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragActive(false);
    handleFileInput(event.dataTransfer.files);
  };

  const handleManualEntryChange = (
    id: string,
    field: "subject" | "mark",
    value: string,
  ) => {
    setManualEntries((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? {
            ...entry,
            [field]: field === "mark" ? value.replace(/[^0-9]/g, "") : value,
          }
          : entry,
      ),
    );
  };

  const addManualEntryRow = () => {
    setManualEntries((prev) => [...prev, createManualEntry()]);
  };

  const removeManualEntryRow = (id: string) => {
    setManualEntries((prev) =>
      prev.length === 1 ? prev : prev.filter((entry) => entry.id !== id),
    );
  };

  const manualEntriesAreValid = manualEntries.every((entry) => {
    if (!entry.subject || !subjectLabelMap.has(entry.subject) || entry.mark.trim() === "") {
      return false;
    }

    const numeric = Number(entry.mark);
    return Number.isFinite(numeric) && numeric >= 0 && numeric <= 100;
  });

  const handleManualSave = () => {
    if (typeof window === "undefined") {
      return;
    }

    if (!manualEntriesAreValid) {
      toast.error(t("Please complete every subject and mark before saving."));
      return;
    }

    const cleaned = manualEntries
      .map((entry) => ({
        subject: entry.subject.trim(),
        mark: entry.mark.trim(),
      }))
      .filter((entry) => entry.subject && entry.mark !== "");

    if (cleaned.length === 0) {
      setResults([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setIsManualOpen(false);
      toast.success(t("Saved results cleared from local storage."));
      return;
    }

    const parsedResults = cleaned
      .map((entry) => ({
        subject: matchSubjectName(entry.subject),
        mark: Math.min(100, Math.max(0, Number(entry.mark))),
      }))
      .filter((entry) => !Number.isNaN(entry.mark));

    setResults(parsedResults);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsedResults));
    setIsManualOpen(false);
    toast.success(t("Results saved to local storage."));
  };

  const availableSubjectsById = useMemo(() => {
    const selectedSubjects = manualEntries
      .map((entry) => entry.subject)
      .filter((subject) => subject);

    return manualEntries.reduce<Record<string, SubjectOption[]>>(
      (acc, entry) => {
        acc[entry.id] = SUBJECT_OPTIONS.filter(
          (option) =>
            option.value === entry.subject ||
            !selectedSubjects.includes(option.value),
        );
        return acc;
      },
      {},
    );
  }, [manualEntries]);

  const updateResultRow = (
    index: number,
    field: keyof ResultRow,
    value: string,
  ) => {
    setResults((prev) => {
      const updated = [...prev];
      if (field === "mark") {
        const numeric = Number(value);
        if (Number.isNaN(numeric)) {
          return prev;
        }
        updated[index] = {
          ...updated[index],
          mark: Math.min(100, Math.max(0, numeric)),
        };
      } else {
        updated[index] = {
          ...updated[index],
          subject: matchSubjectName(value),
        };
      }
      return updated;
    });
  };

  const saveResultsLocally = () => {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(results));
    toast.success(t("Saved results updated locally."));
  };

  const clearResults = () => {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setResults([]);
    setManualEntries([createManualEntry()]);
    toast.success(t("Saved results cleared."));
  };

  const resultsAreValid = results.every(
    (row) => row.subject && Number.isFinite(row.mark),
  );

  const closeAllModals = () => {
    setIsUploadOpen(false);
    setIsManualOpen(false);
    setDragActive(false);
    setFileError(null);
    setSelectedFile(null);
    setProcessingError(null);
    setIsProcessingUpload(false);
  };

  const cardsSection = (
    <section className="grid gap-6 md:grid-cols-2">
      <button
        type="button"
        onClick={() => setIsUploadOpen(true)}
        className="group flex h-full flex-col rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-left shadow-sm transition hover:-translate-y-1 hover:border-[var(--color-border-strong)] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
      >
        <div className="flex h-full flex-col gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
            <UploadCloud className="h-8 w-8" aria-hidden />
          </div>
          <h2 className="text-xl font-semibold text-[var(--color-text)]">
            {t('Upload Report')}
          </h2>
          <p className="flex-1 text-sm text-[var(--color-text-subtle)]">
            {t('Upload your academic transcript or report card and we will extract your marks automatically.')}
          </p>
          <span className="mt-auto inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition group-hover:bg-[var(--color-primary-strong)]">
            {t('Choose File to Upload')}
          </span>
        </div>
      </button>

      <button
        type="button"
        onClick={() => setIsManualOpen(true)}
        className="group flex h-full flex-col rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-left shadow-sm transition hover:-translate-y-1 hover:border-[var(--color-border-strong)] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
      >
        <div className="flex h-full flex-col gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
            <Plus className="h-8 w-8" aria-hidden />
          </div>
          <h2 className="text-xl font-semibold text-[var(--color-text)]">
            {t('Manually Enter Marks')}
          </h2>
          <p className="flex-1 text-sm text-[var(--color-text-subtle)]">
            {t('Enter your marks for each subject manually.')}
          </p>
          <span className="mt-auto inline-flex items-center justify-center rounded-full border border-[var(--color-button-outline)] px-4 py-2 text-sm font-medium text-[var(--color-primary)] transition group-hover:bg-[var(--color-primary)] group-hover:text-white">
            {t('Enter Marks')}
          </span>
        </div>
      </button>
    </section>
  );

  const savedResultsSection = (
    <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-[var(--color-text)]">
          {t('Saved Results')}
        </h3>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={clearResults}
            className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-subtle)] transition hover:bg-[var(--color-primary-soft)]"
          >
            {t('Clear Results')}
          </button>
          <button
            type="button"
            onClick={saveResultsLocally}
            disabled={!resultsAreValid}
            className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-primary-strong)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t('Save Locally')}
          </button>
        </div>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm text-[var(--color-text)]">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">
              <th className="px-4 py-2">{t('Subject')}</th>
              <th className="px-4 py-2">{t('Mark (%)')}</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row, index) => (
              <tr
                key={`${row.subject}-${index}`}
                className="border-t border-[var(--color-border)]"
              >
                <td className="px-4 py-3">
                  <Select
                    value={row.subject || undefined}
                    onValueChange={(value) =>
                      updateResultRow(index, "subject", value)
                    }
                  >
                    <SelectTrigger className="w-full border-[var(--color-border)] bg-[var(--color-surface)] text-left text-sm text-[var(--color-text)] focus-visible:ring-[var(--color-primary)]">
                      <SelectValue placeholder={t('Select subject')} />
                    </SelectTrigger>
                    <SelectContent className="border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]">
                      {SUBJECT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {t(option.label)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={row.mark}
                    onChange={(event) =>
                      updateResultRow(index, "mark", event.target.value)
                    }
                    className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  const loadingSection = (
    <section className="flex items-center justify-center rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm">
      <div className="flex items-center gap-3 text-sm text-[var(--color-text-subtle)]">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
        <span>{t('Loading saved results…')}</span>
      </div>
    </section>
  );

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <div className="min-h-screen bg-[var(--color-page-bg)] px-4 py-16 text-[var(--color-text)]">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-12">
          <header className="text-center">
            <h1 className="text-3xl font-semibold text-[var(--color-text)]">
              {t('Manage Your Results')}
            </h1>
            <p className="mt-2 text-base text-[var(--color-text-subtle)]">
              {t('Upload your report or enter your marks manually. You can edit saved results anytime.')}
            </p>
          </header>

          {isLoadingStoredResults ? (
            loadingSection
          ) : results.length > 0 ? (
            <>
              {savedResultsSection}
              {cardsSection}
            </>
          ) : (
            cardsSection
          )}
        </div>

        {(isUploadOpen || isManualOpen) && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-[var(--color-overlay)] px-4">
            <div
              className="absolute inset-0"
              onClick={() => {
                if (isProcessingUpload) {
                  return;
                }
                closeAllModals();
              }}
            />

            {isUploadOpen && (
              <div className="relative z-50 w-full max-w-lg rounded-3xl bg-[var(--color-surface)] p-8 text-[var(--color-text)] shadow-xl">
                <header className="mb-6">
                  <h2 className="text-2xl font-semibold text-[var(--color-text)]">
                    {t('Upload Report')}
                  </h2>
                  <p className="mt-2 text-sm text-[var(--color-text-subtle)]">
                    {t('Drag and drop your report card image here, or click to select a file.')}
                  </p>
                </header>

                <label
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  className={`flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition ${dragActive
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                      : "border-[var(--color-border)]"
                    } ${isProcessingUpload ? "pointer-events-none opacity-60" : ""}`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => handleFileInput(event.target.files)}
                  />
                  <UploadCloud className="h-10 w-10 text-[var(--color-primary)]" aria-hidden />
                  <p className="mt-3 text-sm text-[var(--color-text-subtle)]">
                    {t('Drop an image here or click to browse')}
                  </p>
                  {selectedFile && (
                    <p className="mt-2 text-xs text-[var(--color-text-subtle)]">
                      {t('Selected:')} {selectedFile.name}
                    </p>
                  )}
                  {fileError && (
                    <p className="mt-2 text-xs text-[var(--color-primary)]">
                      {fileError}
                    </p>
                  )}
                </label>

                {isProcessingUpload && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-[var(--color-text-subtle)]">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
                    <span>{t('Analyzing report…')}</span>
                  </div>
                )}

                {processingError && (
                  <p className="mt-4 text-sm text-[var(--color-primary)]">
                    {processingError}
                  </p>
                )}

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    disabled={isProcessingUpload}
                    onClick={closeAllModals}
                    className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-subtle)] transition hover:bg-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {t('Cancel')}
                  </button>
                  <button
                    type="button"
                    disabled={!selectedFile || isProcessingUpload}
                    onClick={closeAllModals}
                    className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition enabled:hover:bg-[var(--color-primary-strong)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t('Done')}
                  </button>
                </div>
              </div>
            )}

            {isManualOpen && (
              <div className="relative z-50 w-full max-w-3xl rounded-3xl bg-[var(--color-surface)] p-8 text-[var(--color-text)] shadow-xl">
                <header className="mb-6">
                  <h2 className="text-2xl font-semibold text-[var(--color-text)]">
                    {t('Enter Marks Manually')}
                  </h2>
                  <p className="mt-2 text-sm text-[var(--color-text-subtle)]">
                    {t('Choose a subject and enter the corresponding percentage mark.')}
                  </p>
                </header>

                <div className="flex max-h-[55vh] flex-col gap-4 overflow-y-auto pr-1">
                  {manualEntries.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="grid gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 md:grid-cols-[1fr_160px_auto]"
                    >
                      <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-[var(--color-text-subtle)]">
                          {t('Subject')}
                        </label>
                        <Select
                          value={entry.subject || undefined}
                          onValueChange={(value) =>
                            handleManualEntryChange(entry.id, "subject", value)
                          }
                        >
                          <SelectTrigger className="w-full border-[var(--color-border)] bg-[var(--color-surface)] text-left text-sm text-[var(--color-text)] focus-visible:ring-[var(--color-primary)]">
                            <SelectValue placeholder={t('Select subject')} />
                          </SelectTrigger>
                          <SelectContent className="border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]">
                            {(availableSubjectsById[entry.id] ?? SUBJECT_OPTIONS).map(
                              (option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {t(option.label)}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-[var(--color-text-subtle)]">
                          {t('Mark (%)')}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={entry.mark}
                          onChange={(event) =>
                            handleManualEntryChange(entry.id, "mark", event.target.value)
                          }
                          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        />
                      </div>

                      <div className="flex items-end justify-end">
                        <button
                          type="button"
                          onClick={() => removeManualEntryRow(entry.id)}
                          className="h-10 rounded-full border border-[var(--color-border)] px-4 text-sm font-medium text-[var(--color-text-subtle)] transition hover:bg-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={manualEntries.length === 1}
                        >
                          {t('Remove')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={addManualEntryRow}
                    className="rounded-full border border-[var(--color-button-outline)] px-4 py-2 text-sm font-medium text-[var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-white"
                  >
                    {t('Add Subject')}
                  </button>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={closeAllModals}
                      className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-subtle)] transition hover:bg-[var(--color-primary-soft)]"
                    >
                      {t('Cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={handleManualSave}
                      disabled={!manualEntriesAreValid}
                      className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-primary-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {t('Save Table')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </>
  );
}
