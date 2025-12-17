#!/bin/bash

# Script to run the frontend development server
# This script sets up the environment and starts the React/Vite frontend

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting CAIO AI Portfolio & Governance Platform Frontend...${NC}"

# Check if we're in the correct directory
if [ ! -d "frontend" ]; then
    echo -e "${RED}Error: frontend directory not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Navigate to frontend directory
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}node_modules not found. Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}Dependencies installed.${NC}"
else
    echo -e "${GREEN}Dependencies already installed.${NC}"
fi

# Run the Vite development server
echo -e "${GREEN}Starting Vite development server...${NC}"
echo -e "${GREEN}Frontend will be available at: http://localhost:3000${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

# Open the browser after a short delay (in background)
(sleep 3 && open http://localhost:3000) &

# Start Vite dev server
npm run dev
