#!/bin/bash
# PhoneApp 2.0 Development Startup Script

echo "================================"
echo "PhoneApp 2.0 - Development Stack"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Backend setup
echo -e "${BLUE}[1/4] Setting up backend...${NC}"
cd backend

if [ ! -f ".env" ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
fi

if [ ! -d "instance" ]; then
  mkdir instance
fi

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt > /dev/null 2>&1

# Initialize database and seed data
echo "Initializing database..."
python scripts/seed_data.py > /dev/null 2>&1

cd ..

# Frontend setup
echo -e "${BLUE}[2/4] Setting up frontend...${NC}"
cd frontend

if [ ! -d "node_modules" ]; then
  echo "Installing npm dependencies..."
  npm install > /dev/null 2>&1
fi

cd ..

echo ""
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo -e "${YELLOW}To start development:${NC}"
echo ""
echo "  Terminal 1 (Backend):"
echo "    ${BLUE}cd backend${NC}"
echo "    ${BLUE}uvicorn app.main:app --reload${NC}"
echo ""
echo "  Terminal 2 (Frontend):"
echo "    ${BLUE}cd frontend${NC}"
echo "    ${BLUE}npm run dev${NC}"
echo ""
echo -e "${YELLOW}Access points:${NC}"
echo "  • Frontend:     ${GREEN}http://localhost:5173${NC}"
echo "  • Backend API:  ${GREEN}http://localhost:8000${NC}"
echo "  • API Docs:     ${GREEN}http://localhost:8000/docs${NC}"
echo ""
echo -e "${YELLOW}Test Account:${NC}"
echo "  • Email:    veteran@example.com"
echo "  • Password: securepassword123"
echo ""
