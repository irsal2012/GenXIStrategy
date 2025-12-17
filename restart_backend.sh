#!/bin/bash

# Script to restart the backend server
# This script stops any running backend processes and starts a fresh instance

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Restarting CAIO AI Portfolio & Governance Platform Backend...${NC}"

# Check if we're in the correct directory
if [ ! -d "backend" ]; then
    echo -e "${RED}Error: backend directory not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Find and kill any running uvicorn processes on port 8000
echo -e "${YELLOW}Checking for running backend processes...${NC}"

# Try to find processes using port 8000
if command -v lsof &> /dev/null; then
    PIDS=$(lsof -ti:8000 2>/dev/null || true)
    
    if [ -n "$PIDS" ]; then
        echo -e "${YELLOW}Found running processes on port 8000. Stopping them...${NC}"
        echo "$PIDS" | xargs kill -9 2>/dev/null || true
        sleep 2
        echo -e "${GREEN}Stopped existing backend processes.${NC}"
    else
        echo -e "${GREEN}No running backend processes found.${NC}"
    fi
else
    # Fallback: try to kill uvicorn processes by name
    echo -e "${YELLOW}lsof not available, trying alternative method...${NC}"
    pkill -9 -f "uvicorn.*app.main:app" 2>/dev/null || true
    sleep 2
    echo -e "${GREEN}Attempted to stop any running uvicorn processes.${NC}"
fi

# Start the backend
echo -e "${GREEN}Starting fresh backend instance...${NC}"
echo ""

# Navigate to backend directory and start uvicorn
cd backend

# Check if virtual environment exists
if [ -d "venv" ]; then
    echo -e "${YELLOW}Activating virtual environment...${NC}"
    source venv/bin/activate
fi

# Start uvicorn with reload
echo -e "${GREEN}Starting uvicorn server...${NC}"
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
