# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a RAG (Retrieval-Augmented Generation) application that ingests PDFs, embeds their content into a vector database (Qdrant), and allows users to query the content using natural language. The application uses Inngest for event-driven workflow orchestration and provides a Streamlit UI for interaction.

## Architecture

### Core Components

1. **Inngest Event Handlers** (main.py): Two event-driven functions that orchestrate the RAG pipeline:
   - `rag_ingest_pdf`: Handles the `rag/ingest_pdf` event. Loads PDF → chunks text → generates embeddings → stores in Qdrant
   - `rag_query_pdf_ai`: Handles the `rag/query_pdf_ai` event. Embeds query → searches Qdrant → retrieves contexts → generates answer using GPT-4o-mini

2. **Vector Storage** (vector_db.py): `QdrantStorage` class provides interface to Qdrant running at `localhost:6333`
   - Collection: "docs" with 3072-dimensional vectors (COSINE distance)
   - Handles upsert and search operations with safeguards for empty collections

3. **Data Processing** (data_loader.py): PDF loading and embedding generation
   - Uses LlamaIndex `PDFReader` and `SentenceSplitter` (1000 chunk size, 200 overlap)
   - Embedding model: OpenAI `text-embedding-3-large` (3072 dimensions)

4. **Streamlit UI** (streamlit_app.py): Two-part interface
   - PDF upload → triggers `rag/ingest_pdf` event asynchronously
   - Question form → triggers `rag/query_pdf_ai` event → polls Inngest API for run output

5. **Type Definitions** (custom_types.py): Pydantic models for structured data between workflow steps

### Event Flow

**Ingestion**: User uploads PDF → Streamlit saves to `uploads/` → sends Inngest event → `rag_ingest_pdf` runs load-and-chunk step → embed-and-upsert step → stores vectors in Qdrant

**Querying**: User asks question → Streamlit sends Inngest event → `rag_query_pdf_ai` runs embed-and-search step → llm-answer step (using retrieved contexts) → returns answer and sources

## Development Commands

### Setup
```bash
# Install dependencies using uv
uv sync
```

### Running the Application

1. **Start Qdrant** (must be running on localhost:6333):
```bash
docker run -p 6333:6333 qdrant/qdrant
```

2. **Start FastAPI backend** (serves Inngest functions):
```bash
uv run uvicorn main:app --reload
```

3. **Start Inngest dev server** (in separate terminal):
```bash
npx inngest-cli@latest dev
```

4. **Start Streamlit UI** (in separate terminal):
```bash
uv run streamlit run streamlit_app.py
```

### Environment Variables
Create a `.env` file with:
```
OPENAI_API_KEY=your_key_here
INNGEST_API_BASE=http://127.0.0.1:8288/v1  # optional, defaults to this
```

## Important Notes

- **Rate Limiting**: PDF ingestion is throttled (2 per minute) and rate-limited (1 per 4 hours per source_id)
- **Deterministic IDs**: Vector IDs use UUID5 with namespace + source_id to ensure idempotency
- **Local Development**: All services run locally; `is_production=False` for Inngest client
- **Embedding Dimension**: Must match between data_loader (3072) and vector_db (3072)
- **Polling Pattern**: Streamlit polls Inngest API to wait for query results (120s timeout)