"use client";

import { type DragEvent, useEffect, useMemo, useState } from "react";

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

  const handleManualSave = () => {
    if (typeof window === "undefined") {
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

  const closeAllModals = () => {
    setIsUploadOpen(false);
    setIsManualOpen(false);
    setDragActive(false);
    setFileError(null);
    setSelectedFile(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12">
        <header className="text-center">
          <h1 className="text-3xl font-semibold text-slate-900">
            Manage Your Results
          </h1>
          <p className="mt-2 text-base text-slate-600">
            Upload your report or enter your marks manually. You can edit saved
            results anytime.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-8 text-left shadow-sm transition hover:-translate-y-1 hover:border-violet-400 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <div className="flex h-full flex-col gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                <span className="text-2xl">⬆️</span>
              </div>
              <h2 className="text-xl font-semibold text-slate-900">
                Upload Report
              </h2>
              <p className="flex-1 text-sm text-slate-600">
                Upload your academic transcript or report card and we will
                extract your marks automatically.
              </p>
              <span className="mt-auto inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-medium text-white transition group-hover:from-violet-600 group-hover:to-fuchsia-600">
                Choose File to Upload
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setIsManualOpen(true)}
            className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-8 text-left shadow-sm transition hover:-translate-y-1 hover:border-emerald-400 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <div className="flex h-full flex-col gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <span className="text-2xl">➕</span>
              </div>
              <h2 className="text-xl font-semibold text-slate-900">
                Manually Enter Marks
              </h2>
              <p className="flex-1 text-sm text-slate-600">
                Enter your marks for each subject manually for complete control
                over your data.
              </p>
              <span className="mt-auto inline-flex items-center justify-center rounded-full border border-emerald-500 px-4 py-2 text-sm font-medium text-emerald-600 transition group-hover:bg-emerald-500 group-hover:text-white">
                Enter Marks
              </span>
            </div>
          </button>
        </section>

        {results.length > 0 && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                Saved Results
              </h3>
              <button
                type="button"
                onClick={saveResultsLocally}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
              >
                Save Locally
              </button>
            </div>
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-2">Subject</th>
                    <th className="px-4 py-2">Mark (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, index) => (
                    <tr key={`${row.subject}-${index}`} className="border-t">
                      <td className="px-4 py-3">
                        <select
                          value={row.subject}
                          onChange={(event) =>
                            updateResultRow(index, "subject", event.target.value)
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                        >
                          <option value="">Select subject</option>
                          {SUBJECTS.map((subject) => (
                            <option key={subject} value={subject}>
                              {subject}
                            </option>
                          ))}
                        </select>
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
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
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
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="absolute inset-0" onClick={closeAllModals} />

          {isUploadOpen && (
            <div className="relative z-50 w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl">
              <header className="mb-6">
                <h2 className="text-2xl font-semibold text-slate-900">
                  Upload Report
                </h2>
                <p className="mt-2 text-sm text-slate-600">
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
                className={`flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed ${
                  dragActive ? "border-violet-500 bg-violet-50" : "border-slate-200"
                } transition`}
              >
                <input
                  type="file"
                  accept="image/jpeg"
                  className="hidden"
                  onChange={(event) => handleFileInput(event.target.files)}
                />
                <span className="text-4xl text-violet-500">⬆️</span>
                <p className="mt-3 text-sm text-slate-600">
                  Drop JPG file here or click to browse
                </p>
                {selectedFile && (
                  <p className="mt-2 text-xs text-slate-500">
                    Selected: {selectedFile.name}
                  </p>
                )}
                {fileError && (
                  <p className="mt-2 text-xs text-rose-500">{fileError}</p>
                )}
              </label>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeAllModals}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedFile}
                  onClick={closeAllModals}
                  className="rounded-full bg-violet-500 px-4 py-2 text-sm font-medium text-white transition enabled:hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {isManualOpen && (
            <div className="relative z-50 w-full max-w-3xl rounded-3xl bg-white p-8 shadow-xl">
              <header className="mb-6">
                <h2 className="text-2xl font-semibold text-slate-900">
                  Enter Marks Manually
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Choose a subject and enter the corresponding percentage mark.
                </p>
              </header>

              <div className="flex flex-col gap-4">
                {manualEntries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-[1fr_160px_auto]"
                  >
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                        Subject
                      </label>
                      <select
                        value={entry.subject}
                        onChange={(event) =>
                          handleManualEntryChange(entry.id, "subject", event.target.value)
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Select subject</option>
                        {availableSubjectsById[entry.id]?.map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
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
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="flex items-end justify-end">
                      <button
                        type="button"
                        onClick={() => removeManualEntryRow(entry.id)}
                        className="h-10 rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
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
                  className="rounded-full border border-emerald-500 px-4 py-2 text-sm font-medium text-emerald-600 transition hover:bg-emerald-500 hover:text-white"
                >
                  Add Subject
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeAllModals}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleManualSave}
                    className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
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
