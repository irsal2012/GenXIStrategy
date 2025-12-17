# Setup Guide - CAIO AI Portfolio & Governance Platform

## Prerequisites

- Docker & Docker Compose
- OpenAI API Key
- Git

## Quick Start with Docker (Recommended)

### 1. Clone and Setup Environment

```bash
# Navigate to project directory
cd UPM

# Copy environment file
cp .env.example .env

# Edit .env and add your OpenAI API key
# OPENAI_API_KEY=your-actual-api-key-here
```

### 2. Start the Application

```bash
# Start all services (MySQL, Backend, Frontend)
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### 4. Default Admin User (Development)

When the backend starts in **development** mode, it will ensure a default admin user exists:

- Email: `admin@example.com`
- Password: `admin123`

If the user already exists, the backend will also normalize the account to be active/superuser, and (in development) reset the password to `admin123`.

> Production note: disable/remove this behavior for real deployments.

### 5. Login

Go to http://localhost:3000 and login with:

- Email: `admin@example.com`
- Password: `admin123`

---

## Manual Setup (Without Docker)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup MySQL database
# Create database: caio_platform

# Copy and configure environment
cp .env.example .env
# Edit .env with your settings

# Run the backend
uvicorn app.main:app --reload
```

Backend will be available at http://localhost:8000

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will be available at http://localhost:3000

---

## Environment Variables

### Required Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required for AI features)

### Optional Variables

- `SECRET_KEY`: JWT secret key (change in production)
- `DATABASE_URL`: MySQL connection string
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time (default: 30)

---

## Database Migrations

The application automatically creates database tables on startup. For production, consider using Alembic for migrations:

```bash
cd backend

# Initialize Alembic (if not already done)
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Initial migration"

# Apply migration
alembic upgrade head
```

---

## Stopping the Application

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This deletes all data)
docker-compose down -v
```

---

## Troubleshooting

### Port Already in Use

If ports 3000, 8000, or 3306 are already in use, modify the ports in `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Change 3000 to 3001
```

### Database Connection Issues

1. Ensure MySQL container is healthy:
```bash
docker-compose ps
```

2. Check MySQL logs:
```bash
docker-compose logs mysql
```

3. Verify database credentials in `.env` file

### OpenAI API Issues

- Verify your API key is correct in `.env`
- Check your OpenAI account has available credits
- Ensure the model name is correct (default: gpt-4-turbo-preview)

---

## Development

### Backend Development

```bash
cd backend

# Run tests
pytest

# Format code
black app/

# Lint code
flake8 app/
```

### Frontend Development

```bash
cd frontend

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Production Deployment

### Security Checklist

- [ ] Change `SECRET_KEY` to a strong random value
- [ ] Use strong database passwords
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set `ENVIRONMENT=production`
- [ ] Use environment-specific OpenAI API keys
- [ ] Enable database backups
- [ ] Set up monitoring and logging

### Build for Production

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

# Frontend
cd frontend
npm run build
# Serve the dist/ folder with nginx or similar
```

---

## Support

For issues and questions:
- Check the main README.md
- Review API documentation at /docs
- Check Docker logs: `docker-compose logs`

---

## Next Steps

1. ✅ Start the application
2. ✅ Create your first user
3. ✅ Login to the platform
4. 📊 Create your first AI initiative
5. 🤖 Use OpenAI features to analyze risks
6. 📈 View analytics dashboard
7. 🔒 Set up governance policies

Enjoy using the CAIO AI Portfolio & Governance Platform!
