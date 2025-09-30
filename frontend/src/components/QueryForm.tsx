"use client";

import { useState } from "react";

interface QueryResult {
  answer: string;
  sources: string[];
  num_contexts: number;
}

export default function QueryForm() {
  const [question, setQuestion] = useState("");
  const [topK, setTopK] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.trim(),
          top_k: topK,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || "Query failed";
        throw new Error(errorMsg);
      }

      setResult(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to get answer. Please try again.";
      setError(errorMsg);
      console.error("Query error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 rounded-lg shadow-xl shadow-amber-500/10 border border-amber-500/20 p-6">
      <h1 className="text-2xl font-bold mb-4 text-amber-500">💬 Ask a question about your PDFs</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="question" className="block text-sm font-medium text-amber-400 mb-1">
            Your question
          </label>
          <input
            id="question"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full px-4 py-2 bg-black border border-amber-500/30 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-100 placeholder-gray-500 transition-colors"
            placeholder="Enter your question..."
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="topK" className="block text-sm font-medium text-amber-400 mb-1">
            How many chunks to retrieve
          </label>
          <input
            id="topK"
            type="number"
            min="1"
            max="20"
            value={topK}
            onChange={(e) => setTopK(parseInt(e.target.value))}
            className="w-full px-4 py-2 bg-black border border-amber-500/30 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-100 transition-colors"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="w-full bg-amber-500 text-black py-2 px-4 rounded-md hover:bg-amber-400 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          {loading ? "Sending event and generating answer..." : "Ask"}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 rounded-md border bg-red-500/10 text-red-400 border-red-500/30">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2 text-amber-500">Answer</h2>
          <div className="bg-black border border-amber-500/30 p-4 rounded-md mb-4">
            <p className="text-gray-300">{result.answer || "(No answer)"}</p>
          </div>

          {result.sources && result.sources.length > 0 && (
            <div>
              <p className="text-sm font-medium text-amber-400 mb-2">Sources</p>
              <ul className="list-disc list-inside space-y-1">
                {result.sources.map((source, idx) => (
                  <li key={idx} className="text-sm text-gray-400">
                    {source}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}