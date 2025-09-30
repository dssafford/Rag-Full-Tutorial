import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RAG Ingest PDF",
  description: "Upload PDFs and query their content using RAG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-black text-gray-100">
        {children}
      </body>
    </html>
  );
}