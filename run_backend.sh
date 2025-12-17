#!/bin/bash

# Script to run the backend server
# This script sets up the environment and starts the FastAPI backend

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting CAIO AI Portfolio & Governance Platform Backend...${NC}"

# Check if we're in the correct directory
if [ ! -d "backend" ]; then
    echo -e "${RED}Error: backend directory not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Navigate to backend directory
cd backend

# Check if .env file exists, if not copy from .env.example
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Warning: .env file not found. Creating from .env.example...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${YELLOW}Please update the .env file with your actual configuration values.${NC}"
    else
        echo -e "${RED}Error: .env.example file not found.${NC}"
        exit 1
    fi
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Virtual environment not found. Creating one...${NC}"
    python3 -m venv venv
    echo -e "${GREEN}Virtual environment created.${NC}"
fi

# Activate virtual environment
echo -e "${GREEN}Activating virtual environment...${NC}"
source venv/bin/activate

# Install/upgrade dependencies
echo -e "${GREEN}Installing dependencies...${NC}"
pip install --upgrade pip
pip install -r requirements.txt

# Run the FastAPI server
echo -e "${GREEN}Starting FastAPI server...${NC}"
echo -e "${GREEN}Server will be available at: http://localhost:8000${NC}"
echo -e "${GREEN}API documentation at: http://localhost:8000/api/v1/docs${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

# Start uvicorn server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
