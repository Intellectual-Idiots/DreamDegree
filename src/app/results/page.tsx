"use client";

import { type DragEvent, useEffect, useMemo, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SUBJECTS = [
  "Mathematics",
  "English",
  "Physical Sciences",
  "Life Sciences",
  "History",
  "Geography",
  "Accounting",
  "Economics",
  "Computer Studies",
];

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

export default function ResultsPage() {
  const createManualEntry = () => ({
    id: Math.random().toString(36).slice(2, 10),
    subject: "",
    mark: "",
  });

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [manualEntries, setManualEntries] = useState<ManualEntry[]>(() => [
    createManualEntry(),
  ]);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);

      if (stored) {
        const parsed: ResultRow[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setResults(parsed);
        }
      }
    } catch (err) {
      console.error("Failed to load stored results", err);
    }
  }, [hasHydrated]);

  const processUploadedReport = (file: File) => {
    // TODO: Provide processing implementation for uploaded report.
  };

  const handleFileInput = (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    if (file.type !== "image/jpeg") {
      setFileError("Please upload a JPG image file.");
      setSelectedFile(null);
      return;
    }

    setFileError(null);
    setSelectedFile(file);
    processUploadedReport(file);
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
    setManualEntries((prev) => [
      ...prev,
      createManualEntry(),
    ]);
  };

  const removeManualEntryRow = (id: string) => {
    setManualEntries((prev) =>
      prev.length === 1 ? prev : prev.filter((entry) => entry.id !== id),
    );
  };

  const manualEntriesAreValid = manualEntries.every((entry) => {
    if (!entry.subject || entry.mark.trim() === "") {
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
      return;
    }

    const parsedResults = cleaned
      .map((entry) => ({
        subject: entry.subject,
        mark: Math.min(100, Math.max(0, Number(entry.mark))),
      }))
      .filter((entry) => !Number.isNaN(entry.mark));

    setResults(parsedResults);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsedResults));
    setIsManualOpen(false);
  };

  const availableSubjectsById = useMemo(() => {
    const selectedSubjects = manualEntries.map((entry) => entry.subject);
    return manualEntries.reduce<Record<string, string[]>>((acc, entry) => {
      const available = SUBJECTS.filter(
        (subject) =>
          subject === entry.subject || !selectedSubjects.includes(subject),
      );
      acc[entry.id] = available;
      return acc;
    }, {});
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
          subject: value,
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
  };

  return (
    <div className="min-h-screen bg-[var(--color-page-bg)] px-4 py-16 text-[var(--color-text)]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12">
        <header className="text-center">
          <h1 className="text-3xl font-semibold text-[var(--color-text)]">
            Manage Your Results
          </h1>
          <p className="mt-2 text-base text-[var(--color-text-subtle)]">
            Upload your report or enter your marks manually. You can edit saved
            results anytime.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="group flex h-full flex-col rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-left shadow-sm transition hover:-translate-y-1 hover:border-[var(--color-border-strong)] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            <div className="flex h-full flex-col gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                <span className="text-2xl">⬆️</span>
              </div>
              <h2 className="text-xl font-semibold text-[var(--color-text)]">
                Upload Report
              </h2>
              <p className="flex-1 text-sm text-[var(--color-text-subtle)]">
                Upload your academic transcript or report card and we will
                extract your marks automatically.
              </p>
              <span className="mt-auto inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition group-hover:bg-[var(--color-primary-strong)]">
                Choose File to Upload
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
                <span className="text-2xl">➕</span>
              </div>
              <h2 className="text-xl font-semibold text-[var(--color-text)]">
                Manually Enter Marks
              </h2>
              <p className="flex-1 text-sm text-[var(--color-text-subtle)]">
                Enter your marks for each subject manually for complete control
                over your data.
              </p>
              <span className="mt-auto inline-flex items-center justify-center rounded-full border border-[var(--color-button-outline)] px-4 py-2 text-sm font-medium text-[var(--color-primary)] transition group-hover:bg-[var(--color-primary)] group-hover:text-white">
                Enter Marks
              </span>
            </div>
          </button>
        </section>

        {results.length > 0 && (
          <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--color-text)]">
                Saved Results
              </h3>
              <button
                type="button"
                onClick={saveResultsLocally}
                disabled={!resultsAreValid}
                className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-primary-strong)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Save Locally
              </button>
            </div>
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm text-[var(--color-text)]">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">
                    <th className="px-4 py-2">Subject</th>
                    <th className="px-4 py-2">Mark (%)</th>
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
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent className="border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]">
                            {SUBJECTS.map((subject) => (
                              <SelectItem key={subject} value={subject}>
                                {subject}
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
        )}
      </div>

      {(isUploadOpen || isManualOpen) && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[var(--color-overlay)] px-4">
          <div className="absolute inset-0" onClick={closeAllModals} />

          {isUploadOpen && (
            <div className="relative z-50 w-full max-w-lg rounded-3xl bg-[var(--color-surface)] p-8 text-[var(--color-text)] shadow-xl">
              <header className="mb-6">
                <h2 className="text-2xl font-semibold text-[var(--color-text)]">
                  Upload Report
                </h2>
                <p className="mt-2 text-sm text-[var(--color-text-subtle)]">
                  Drag and drop your JPG report card here, or click to select a
                  file.
                </p>
              </header>

              <label
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={`flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition ${
                  dragActive
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                    : "border-[var(--color-border)]"
                }`}
              >
                <input
                  type="file"
                  accept="image/jpeg"
                  className="hidden"
                  onChange={(event) => handleFileInput(event.target.files)}
                />
                <span className="text-4xl text-[var(--color-primary)]">⬆️</span>
                <p className="mt-3 text-sm text-[var(--color-text-subtle)]">
                  Drop JPG file here or click to browse
                </p>
                {selectedFile && (
                  <p className="mt-2 text-xs text-[var(--color-text-subtle)]">
                    Selected: {selectedFile.name}
                  </p>
                )}
                {fileError && (
                  <p className="mt-2 text-xs text-[var(--color-primary)]">
                    {fileError}
                  </p>
                )}
              </label>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeAllModals}
                  className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-subtle)] transition hover:bg-[var(--color-primary-soft)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedFile}
                  onClick={closeAllModals}
                  className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition enabled:hover:bg-[var(--color-primary-strong)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {isManualOpen && (
            <div className="relative z-50 w-full max-w-3xl rounded-3xl bg-[var(--color-surface)] p-8 text-[var(--color-text)] shadow-xl">
              <header className="mb-6">
                <h2 className="text-2xl font-semibold text-[var(--color-text)]">
                  Enter Marks Manually
                </h2>
                <p className="mt-2 text-sm text-[var(--color-text-subtle)]">
                  Choose a subject and enter the corresponding percentage mark.
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
                        Subject
                      </label>
                      <Select
                        value={entry.subject || undefined}
                        onValueChange={(value) =>
                          handleManualEntryChange(entry.id, "subject", value)
                        }
                      >
                        <SelectTrigger className="w-full border-[var(--color-border)] bg-[var(--color-surface)] text-left text-sm text-[var(--color-text)] focus-visible:ring-[var(--color-primary)]">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent className="border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]">
                          {availableSubjectsById[entry.id]?.map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-[var(--color-text-subtle)]">
                        Mark (%)
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
                        Remove
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
                  Add Subject
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeAllModals}
                    className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-subtle)] transition hover:bg-[var(--color-primary-soft)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleManualSave}
                    disabled={!manualEntriesAreValid}
                    className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-primary-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Save Table
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
