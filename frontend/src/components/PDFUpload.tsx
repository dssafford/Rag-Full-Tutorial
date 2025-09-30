"use client";

import { useState } from "react";

export default function PDFUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setMessage({ type: "success", text: `Triggered ingestion for: ${data.filename}` });
      setFile(null);

      // Reset file input
      const fileInput = document.getElementById("file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      setMessage({ type: "error", text: "Failed to upload and ingest PDF" });
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-zinc-900 rounded-lg shadow-xl shadow-amber-500/10 border border-amber-500/20 p-6 mb-8">
      <h1 className="text-2xl font-bold mb-4 text-amber-500">📄 Upload a PDF to Ingest</h1>

      <div className="mb-4">
        <input
          id="file-input"
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-400
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border file:border-amber-500/30
            file:text-sm file:font-semibold
            file:bg-amber-500/10 file:text-amber-500
            hover:file:bg-amber-500/20
            file:transition-colors
            cursor-pointer"
          disabled={uploading}
        />
      </div>

      {file && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full bg-amber-500 text-black py-2 px-4 rounded-md hover:bg-amber-400 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          {uploading ? "Uploading and triggering ingestion..." : "Upload and Ingest"}
        </button>
      )}

      {message && (
        <div className={`mt-4 p-3 rounded-md border ${
          message.type === "success"
            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
            : "bg-red-500/10 text-red-400 border-red-500/30"
        }`}>
          {message.text}
        </div>
      )}

      {message?.type === "success" && (
        <p className="mt-2 text-sm text-gray-400">You can upload another PDF if you like.</p>
      )}
    </div>
  );
}