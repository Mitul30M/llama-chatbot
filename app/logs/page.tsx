"use client";

import Link from "next/link";
import { useState } from "react";

export default function LogsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [resultText, setResultText] = useState<string>("");

  const handleFetchLogs = async () => {
    setIsLoading(true);
    setStatusCode(null);
    setResultText("");

    try {
      const response = await fetch("/app-logs", { method: "GET" });
      setStatusCode(response.status);

      const data = await response.json().catch(() => ({
        error: "Response was not valid JSON.",
      }));

      setResultText(JSON.stringify(data, null, 2));
    } catch (error) {
      setStatusCode(0);
      setResultText(
        JSON.stringify(
          {
            error: "Request failed.",
            reason: error instanceof Error ? error.message : String(error),
          },
          null,
          2
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center gap-8 py-20 px-16 bg-white dark:bg-black sm:items-start">
        <Link
          href="/"
          className="text-sm text-zinc-600 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Back
        </Link>

        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Fetch App Logs
        </h1>

        <button
          type="button"
          onClick={handleFetchLogs}
          disabled={isLoading}
          className="flex h-12 w-fit items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px] whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? "Fetching..." : "Fetch App Logs"}
        </button>

        {(statusCode !== null || resultText) && (
          <div className="w-full rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
              Status: {statusCode}
            </p>
            <pre className="max-h-[420px] overflow-auto text-xs leading-5 text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
              {resultText}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}
