"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const STORAGE_KEYS = {
  personalitySummary: "personality_summary",
  resultsData: "resultsData",
} as const;

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

type NavLink = {
  href: string;
  label: string;
  requiresKeys?: StorageKey[];
};

const navLinks: NavLink[] = [
  { href: "/results", label: "Results" },
  { href: "/quiz", label: "Quiz" },
  {
    href: "/qualifying-degrees",
    label: "Qualifying Degrees",
    requiresKeys: [
      STORAGE_KEYS.personalitySummary,
      STORAGE_KEYS.resultsData,
    ],
  },
  {
    href: "/gap-analysis",
    label: "Gap Analysis",
    requiresKeys: [
      STORAGE_KEYS.personalitySummary,
      STORAGE_KEYS.resultsData,
    ],
  },
  {
    href: "/chat",
    label: "Chat",
    requiresKeys: [
      STORAGE_KEYS.personalitySummary,
      STORAGE_KEYS.resultsData,
    ],
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [storageState, setStorageState] = useState<Record<StorageKey, boolean>>({
    [STORAGE_KEYS.personalitySummary]: false,
    [STORAGE_KEYS.resultsData]: false,
  });

  useEffect(() => {
    const evaluateStorage = () => {
      if (typeof window === "undefined") return;

      setStorageState((current) => {
        const nextState: Record<StorageKey, boolean> = {
          [STORAGE_KEYS.personalitySummary]: Boolean(
            window.localStorage.getItem(STORAGE_KEYS.personalitySummary)
          ),
          [STORAGE_KEYS.resultsData]: Boolean(
            window.localStorage.getItem(STORAGE_KEYS.resultsData)
          ),
        };

        const hasChanged = Object.entries(nextState).some(
          ([key, value]) => current[key as StorageKey] !== value
        );

        return hasChanged ? nextState : current;
      });
    };

    if (typeof window === "undefined") return;

    evaluateStorage();

    const handleVisibilityChange = () => {
      if (!document.hidden) evaluateStorage();
    };

    window.addEventListener("storage", evaluateStorage);
    window.addEventListener("focus", evaluateStorage);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    const intervalId = window.setInterval(evaluateStorage, 1000);

    return () => {
      window.removeEventListener("storage", evaluateStorage);
      window.removeEventListener("focus", evaluateStorage);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
      window.clearInterval(intervalId);
    };
  }, []);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-40">
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold text-[var(--color-text)]"
            onClick={closeMenu}
          >
            DreamDegree
          </Link>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-[var(--color-border)] text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] md:hidden"
            onClick={toggleMenu}
            aria-expanded={isOpen}
            aria-label="Toggle navigation menu"
          >
            <span className="sr-only">Toggle navigation menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-6 w-6"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 6.75h15m-15 5.25h15m-15 5.25h15"
                />
              )}
            </svg>
          </button>

          <nav className="hidden items-center gap-2 md:flex">
            {navLinks.map(({ href, label, requiresKeys }) => {
              const isActive =
                pathname === href || (href !== "/" && pathname.startsWith(href));
              const isLocked = Array.isArray(requiresKeys)
                ? requiresKeys.some((key) => !storageState[key])
                : false;

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={(event) => {
                    if (isLocked) {
                      event.preventDefault();
                      setIsOpen(false);
                    } else {
                      closeMenu();
                    }
                  }}
                  className={cn(
                    "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                    "text-[var(--color-text-subtle)] hover:text-[var(--color-text)]",
                    isActive &&
                      "bg-[var(--color-primary-soft)] text-[var(--color-primary)]",
                    isLocked &&
                      "cursor-not-allowed opacity-60 hover:text-[var(--color-text-subtle)]"
                  )}
                  title={
                    isLocked
                      ? "Complete the Quiz and Results to unlock this page"
                      : undefined
                  }
                >
                  {isLocked ? (
                    <span aria-hidden className="text-[var(--color-primary)]">
                      🔒
                    </span>
                  ) : null}
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        {isOpen ? (
          <nav className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 sm:px-6 md:hidden">
            <div className="flex flex-col gap-2">
              {navLinks.map(({ href, label, requiresKeys }) => {
                const isActive =
                  pathname === href || (href !== "/" && pathname.startsWith(href));
                const isLocked = Array.isArray(requiresKeys)
                  ? requiresKeys.some((key) => !storageState[key])
                  : false;

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={(event) => {
                      if (isLocked) {
                        event.preventDefault();
                      } else {
                        closeMenu();
                      }
                    }}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                      "text-[var(--color-text-subtle)] hover:text-[var(--color-text)]",
                      isActive &&
                        "bg-[var(--color-primary-soft)] text-[var(--color-primary)]",
                      isLocked &&
                        "cursor-not-allowed opacity-60 hover:text-[var(--color-text-subtle)]"
                    )}
                    title={
                      isLocked
                        ? "Complete the Quiz and Results to unlock this page"
                        : undefined
                    }
                  >
                    {isLocked ? (
                      <span aria-hidden className="text-[var(--color-primary)]">
                        🔒
                      </span>
                    ) : null}
                    {label}
                  </Link>
                );
              })}
            </div>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
