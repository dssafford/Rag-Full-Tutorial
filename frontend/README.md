# RAG Frontend

Next.js/React frontend for the RAG PDF ingestion and query application.

## Features

- **PDF Upload**: Upload PDFs and trigger Inngest ingestion events
- **Query Interface**: Ask questions about ingested PDFs with configurable retrieval count
- **Inngest Integration**: Uses Inngest for event-driven workflows and observability
- **Polling Pattern**: Polls Inngest API to wait for query results (matches Streamlit behavior)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

3. Ensure the following services are running:
   - Qdrant (localhost:6333)
   - FastAPI backend with Inngest functions (localhost:8000)
   - Inngest dev server (localhost:8288)

## Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

### PDF Upload Flow
1. User selects PDF file
2. File uploaded to `/api/upload` route
3. File saved to `../uploads/` directory
4. Inngest event `rag/ingest_pdf` sent with file path
5. Backend Inngest function processes the PDF

### Query Flow
1. User submits question and top_k value
2. Request sent to `/api/query` route
3. Inngest event `rag/query_pdf_ai` sent
4. API polls Inngest API for run completion
5. Returns answer and sources to frontend

## API Routes

- `POST /api/upload`: Upload PDF and trigger ingestion
- `POST /api/query`: Send query and wait for result

## Components

- `PDFUpload`: File upload component with status feedback
- `QueryForm`: Question input and result display component