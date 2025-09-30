#!/bin/bash

# Start all services for RAG application
# This script runs 3 services in parallel:
# 1. FastAPI backend with Inngest functions
# 2. Inngest dev server
# 3. Next.js frontend

echo "🚀 Starting RAG Application Services..."
echo ""

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Trap EXIT and SIGINT (Ctrl+C) to cleanup
trap cleanup EXIT INT

# Start FastAPI backend
echo "📦 Starting FastAPI backend..."
uv run uvicorn main:app &

# Wait a moment for FastAPI to start
sleep 2

# Start Inngest dev server
echo "🔧 Starting Inngest dev server..."
npx inngest-cli@latest dev -u http://127.0.0.1:8000/api/inngest --no-discovery &

# Wait a moment for Inngest to start
sleep 2

# Start Next.js frontend
echo "🌐 Starting Next.js frontend..."
cd frontend && npm run dev &

echo ""
echo "✅ All services started!"
echo ""
echo "📍 Services running at:"
echo "   - FastAPI Backend:  http://localhost:8000"
echo "   - Inngest Dev UI:   http://localhost:8288"
echo "   - Next.js Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for all background processes
wait
