# CAIO AI Portfolio & Governance Platform

A comprehensive platform for Chief AI Officers to manage, govern, and track AI initiatives across the enterprise.

## 🎯 Overview

This platform serves as the decision-intelligence layer for enterprise AI, enabling CAIOs to:
- Identify, prioritize, and govern AI initiatives
- Deliver and communicate measurable enterprise value
- Ensure responsible, transparent AI deployment at scale
- Track ROI and manage risks
- Report to board and executives

## 🏗️ Architecture

- **Backend**: FastAPI (Python) - High-performance async API
- **Frontend**: React 18 - Modern, responsive UI
- **Database**: MySQL - Relational data storage
- **Authentication**: JWT-based with role-based access control

## 📦 Project Structure

```
UPM/
├── backend/          # FastAPI backend application
├── frontend/         # React frontend application
├── docker-compose.yml
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- MySQL 8.0+
- Docker & Docker Compose (optional)

### Development Setup

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

#### Docker (Recommended)
```bash
docker-compose up --build
```

## 🔑 Key Features

### 1. AI Initiative Portfolio Management
- Complete initiative lifecycle tracking
- Prioritization and resource allocation
- Status monitoring and milestone tracking

### 2. Governance & Compliance
- AI ethics framework enforcement
- Regulatory compliance tracking
- Policy management and audit trails

### 3. Value & ROI Tracking
- Business case management
- Financial impact measurement
- Executive-level reporting

### 4. Risk Management
- Comprehensive risk registry
- Automated risk assessment
- Mitigation tracking

### 5. Executive Analytics
- Real-time dashboards
- Custom report generation
- Portfolio-wide insights

## 👥 User Roles

- **CAIO / Head of AI**: Full platform access, strategic oversight
- **AI Team Lead**: Initiative management, technical execution
- **Compliance Officer**: Governance and risk management
- **Executive**: Read-only access to reports and dashboards

## 📊 Technology Stack

### Backend
- FastAPI
- SQLAlchemy
- MySQL
- Pydantic
- Alembic
- python-jose (JWT)
- pytest

### Frontend
- React 18
- Material-UI (MUI)
- Redux Toolkit
- React Router v6
- Axios
- Recharts
- Formik + Yup

## 🔐 Security

- JWT authentication with refresh tokens
- Role-based access control (RBAC)
- Password hashing (bcrypt)
- SQL injection prevention
- Complete audit logging
- CORS configuration

## 📝 License

Proprietary - All rights reserved

## 🤝 Contributing

This is a private enterprise platform. Contact the development team for contribution guidelines.
