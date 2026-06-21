#!/bin/bash
set -e

echo "=== Post-merge setup ==="

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend && npm install --legacy-peer-deps && cd ..

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend && pip install -r requirements.txt -q && cd ..

echo "=== Post-merge setup complete ==="
