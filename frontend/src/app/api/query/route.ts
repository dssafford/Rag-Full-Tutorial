import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/lib/inngest";

const INNGEST_API_BASE = process.env.INNGEST_API_BASE || "http://127.0.0.1:8288/v1";

interface InngestRun {
  status?: string;
  output?: {
    answer: string;
    sources: string[];
    num_contexts: number;
  };
}

async function fetchRuns(eventId: string): Promise<InngestRun[]> {
  const url = `${INNGEST_API_BASE}/events/${eventId}/runs`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch runs: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data || [];
}

async function waitForRunOutput(
  eventId: string,
  timeoutMs: number = 120000,
  pollIntervalMs: number = 500
): Promise<InngestRun["output"]> {
  const startTime = Date.now();
  let lastStatus: string | null = null;

  while (true) {
    const runs = await fetchRuns(eventId);

    if (runs.length > 0) {
      const run = runs[0];
      const status = run.status;
      lastStatus = status || lastStatus;

      // Check for completed status (case-insensitive)
      const statusLower = (status || "").toLowerCase();
      if (["completed", "succeeded", "success", "finished"].includes(statusLower)) {
        return run.output || { answer: "", sources: [], num_contexts: 0 };
      }

      if (["failed", "cancelled"].includes(statusLower)) {
        throw new Error(`Function run ${status}`);
      }
    }

    if (Date.now() - startTime > timeoutMs) {
      throw new Error(`Timed out waiting for run output (last status: ${lastStatus})`);
    }

    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, top_k } = body;

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    // Send Inngest event
    const result = await inngest.send({
      name: "rag/query_pdf_ai",
      data: {
        question: question.trim(),
        top_k: top_k || 5,
      },
    });

    // TypeScript SDK v3 returns { ids: string[] }
    const eventId = (result as any).ids?.[0];

    if (!eventId) {
      throw new Error("Failed to get event ID from Inngest");
    }

    // Small delay before polling to let the function start
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Poll for result
    const output = await waitForRunOutput(eventId);

    return NextResponse.json(output);
  } catch (error) {
    console.error("Query error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process query" },
      { status: 500 }
    );
  }
}