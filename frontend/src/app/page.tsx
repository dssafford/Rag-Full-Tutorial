import PDFUpload from "@/components/PDFUpload";
import QueryForm from "@/components/QueryForm";

export default function Home() {
  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <PDFUpload />

        <div className="my-8 border-t border-amber-500/20"></div>

        <QueryForm />
      </div>
    </main>
  );
}