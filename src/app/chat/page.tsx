"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Send, Sparkles, User } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "@/utils/translate";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type Chat = {
  id: string;
  messages: Message[];
  model: string;
  createdAt: Date;
};

const SUGGESTION_KEYS = [
  "What degrees do I qualify for?",
  "List 5 degrees I can pursue at Wits",
  "What are some popular degree options?",
] as const;

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("gpt-4-turbo");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { t } = useTranslation();

  useEffect(() => {
    const savedChats = localStorage.getItem("chats");
    if (savedChats) {
      const chats: Chat[] = JSON.parse(savedChats);
      if (chats.length > 0) {
        const lastChat = chats[chats.length - 1];
        setCurrentChatId(lastChat.id);
        setMessages(lastChat.messages);
        setSelectedModel(lastChat.model || "gpt-4");
        return;
      }
    }

    setCurrentChatId(generateId());
  }, []);

  useEffect(() => {
    if (!currentChatId || messages.length === 0) {
      return;
    }

    const savedChats = localStorage.getItem("chats");
    const chats: Chat[] = savedChats ? JSON.parse(savedChats) : [];

    const existingChatIndex = chats.findIndex((chat) => chat.id === currentChatId);
    const chatData: Chat = {
      id: currentChatId,
      messages,
      model: selectedModel,
      createdAt: existingChatIndex >= 0 ? chats[existingChatIndex].createdAt : new Date(),
    };

    if (existingChatIndex >= 0) {
      chats[existingChatIndex] = chatData;
    } else {
      chats.push(chatData);
    }

    localStorage.setItem("chats", JSON.stringify(chats));
  }, [currentChatId, messages, selectedModel]);

  useEffect(() => {
    if (!scrollAreaRef.current) {
      return;
    }

    const scrollContainer = scrollAreaRef.current.querySelector(
      "[data-radix-scroll-area-viewport]",
    );

    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages]);

  const translatedSuggestions = useMemo(
    () => SUGGESTION_KEYS.map((suggestion) => t(suggestion)),
    [t],
  );

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (!input.trim() || isLoading) {
      return;
    }

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((message) => ({
            role: message.role,
            content: message.content,
          })),
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(generateId());
    setMessages([]);
    inputRef.current?.focus();
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const renderMarkdown = (content: string) =>
    content.split("\n").map((line, index) => {
      if (line.startsWith("# ")) {
        return (
          <h1 key={`h1-${index}`} className="my-3 text-2xl font-semibold text-[var(--color-text)]">
            {line.slice(2)}
          </h1>
        );
      }

      if (line.startsWith("## ")) {
        return (
          <h2 key={`h2-${index}`} className="my-2 text-xl font-semibold text-[var(--color-text)]">
            {line.slice(3)}
          </h2>
        );
      }

      if (line.startsWith("### ")) {
        return (
          <h3 key={`h3-${index}`} className="my-2 text-lg font-semibold text-[var(--color-text)]">
            {line.slice(4)}
          </h3>
        );
      }

      if (line.startsWith("```") && line.length > 3) {
        return (
          <code
            key={`code-${index}`}
            className="my-3 block rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3 font-mono text-sm text-[var(--color-text)]"
          >
            {line.slice(3)}
          </code>
        );
      }

      if (line.startsWith("- ")) {
        return (
          <p key={`li-${index}`} className="my-1 text-sm leading-6 text-[var(--color-text)]">
            • {line.slice(2)}
          </p>
        );
      }

      if (line.trim() === "") {
        return <div key={`spacer-${index}`} className="h-2" />;
      }

      return (
        <p key={`p-${index}`} className="my-2 text-sm leading-6 text-[var(--color-text)]">
          {line}
        </p>
      );
    });

  return (
    <div className="min-h-screen bg-[var(--color-page-bg)] px-4 py-16 text-[var(--color-text)]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-4 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-text-subtle)]">
              {t("Dream Mentor")}
            </p>
            <h1 className="text-3xl font-semibold text-[var(--color-text)]">
              {t("Chat About Your Future")}
            </h1>
            <p className="text-sm text-[var(--color-text-subtle)]">
              {t("Ask questions, explore degree options, and get personalised guidance.")}
            </p>
          </div>
          <button
            type="button"
            onClick={handleNewChat}
            className="ml-auto inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-6 py-2 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--color-primary-strong)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            {t("New Chat")}
          </button>
        </header>

        <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
          <div className="flex h-[70vh] flex-col">
            <div className="flex-1 overflow-hidden">
              <ScrollArea ref={scrollAreaRef} className="h-full px-6">
                <div className="mx-auto flex h-full max-w-3xl flex-col justify-center py-8">
                  {messages.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                        <Sparkles className="h-10 w-10" aria-hidden />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-2xl font-semibold text-[var(--color-text)]">
                          {t("Welcome to Dream Mentor")}
                        </h2>
                        <p className="text-sm text-[var(--color-text-subtle)]">
                          {t("Start the conversation or pick a prompt to get going.")}
                        </p>
                      </div>
                      <div className="grid w-full max-w-md gap-3">
                        {translatedSuggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => handleSuggestionSelect(suggestion)}
                            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-4 text-left text-sm text-[var(--color-text)] transition hover:-translate-y-0.5 hover:border-[var(--color-border-strong)] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-1 flex-col justify-start gap-6">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-4 ${
                            message.role === "assistant" ? "" : "justify-end"
                          }`}
                        >
                          {message.role === "assistant" && (
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                              <Bot className="h-5 w-5" aria-hidden />
                            </div>
                          )}
                          <div
                            className={
                              message.role === "assistant"
                                ? "max-w-[85%] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 text-sm leading-6 text-[var(--color-text)] shadow-sm"
                                : "max-w-[85%] rounded-2xl bg-[var(--color-primary)] p-4 text-sm leading-6 text-white shadow-lg"
                            }
                          >
                            {message.role === "assistant"
                              ? renderMarkdown(message.content)
                              : message.content}
                          </div>
                          {message.role === "user" && (
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white">
                              <User className="h-5 w-5" aria-hidden />
                            </div>
                          )}
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex gap-4">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                            <Bot className="h-5 w-5" aria-hidden />
                          </div>
                          <div className="flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-[var(--color-text-subtle)]">
                            <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-text-subtle)]" style={{ animationDelay: "0ms" }} />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-text-subtle)]" style={{ animationDelay: "150ms" }} />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-text-subtle)]" style={{ animationDelay: "300ms" }} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4">
              <form className="flex items-center gap-3" onSubmit={handleSubmit}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={t("Type your message...")}
                  disabled={isLoading}
                  className="flex-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void handleSubmit();
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--color-primary-strong)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send className="h-5 w-5" aria-hidden />
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
