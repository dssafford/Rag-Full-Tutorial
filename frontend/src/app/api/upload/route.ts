import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { inngest } from "@/lib/inngest";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    // Create uploads directory in the parent project directory
    const uploadsDir = path.join(process.cwd(), "..", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(uploadsDir, file.name);
    await writeFile(filePath, buffer);

    // Send Inngest event
    await inngest.send({
      name: "rag/ingest_pdf",
      data: {
        pdf_path: filePath,
        source_id: file.name,
      },
    });

    return NextResponse.json({
      success: true,
      filename: file.name,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}