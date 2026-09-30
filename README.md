# Digital Twin of Eye

A full-stack retinal health platform that combines AI-powered eye disease detection with patient monitoring, scan history, and medical reporting.

The project allows users to:
- register and log in securely
- upload retinal images for analysis
- receive disease predictions from an AI model
- view diagnostic confidence and probability breakdowns
- track scan history and health profile
- review generated patient reports

## Project Overview

This repository contains three major components:

- Backend: Java + Spring Boot REST API with JWT authentication and MySQL persistence
- Frontend: React + Vite single-page dashboard for users to interact with the application
- ML Service: Python + FastAPI + PyTorch service that runs retinal disease inference using pretrained RETFound-based models

## Architecture

```text
Frontend (React/Vite)
        |
        v
Backend (Spring Boot API)
        |
        +--> MySQL Database
        |
        +--> ML Service (FastAPI + PyTorch)
                    |
                    +--> Retinal disease prediction models
```

## Tech Stack

### Backend
- Java 21
- Spring Boot 4.1.1
- Spring Security
- Spring Data JPA
- MySQL
- JWT authentication

### Frontend
- React 19
- Vite
- React Router
- Axios
- Framer Motion

### AI / ML Service
- Python 3.10+
- FastAPI
- PyTorch
- Torchvision
- timm
- Pillow
- OpenCV

## Repository Structure

```text
Digital-Twin-Of-Eye/
├── Backend/
│   ├── src/
│   ├── pom.xml
│   ├── mvnw
│   └── mvnw.cmd
├── Frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── ml_service/
│   ├── app.py
│   ├── requirements.txt
│   └── saved_models/
├── README.md
└── .gitignore
```

## Prerequisites

Before starting the application, make sure you have installed:

- Java 21+
- Maven or Maven Wrapper (`./mvnw` included)
- Node.js 18+
- npm
- Python 3.10+
- MySQL Server

## Database Setup

Create a MySQL database named `dtwin`:

```sql
CREATE DATABASE dtwin;
```

Update database credentials in:

- `Backend/src/main/resources/application.properties`

Default project configuration expects:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/dtwin
spring.datasource.username=root
spring.datasource.password=your_password
server.port=8081
ai.service.url=http://localhost:8000
```

## Backend Setup

From the project root:

```bash
cd Backend
./mvnw clean install
./mvnw spring-boot:run
```

On Windows PowerShell:

```powershell
cd Backend
mvnw.cmd clean install
mvnw.cmd spring-boot:run
```

The backend should run on:

- http://localhost:8081

## ML Service Setup

From the project root:

```bash
cd ml_service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

On Windows PowerShell:

```powershell
cd ml_service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

The AI service exposes:

- http://localhost:8000/
- http://localhost:8000/health
- http://localhost:8000/predict

## Frontend Setup

From the project root:

```bash
cd Frontend
npm install
npm run dev
```

The frontend UI will typically run at:

- http://localhost:5173

## Running the Full Application

Start all three services in this order:

1. MySQL database
2. Backend API
3. ML prediction service
4. Frontend app

Then open:

- http://localhost:5173

## Features

- user authentication and authorization
- retinal image upload and analysis
- disease classification and confidence scores
- probability breakdowns across multiple disease classes
- digital twin-style health monitoring dashboard
- scan history and report tracking
- profile and health data management

## Notes

- The ML service loads pretrained model weights from `ml_service/saved_models/`.
- Ensure the model files exist before launching the prediction API.
- If you change ports, update the related configuration in both Spring Boot and frontend services.

## License

This project is currently intended for academic, research, or internal project use unless a separate license is added.

## Contact

If you want to extend or deploy this application, start by ensuring the backend, ML service, and database are all running and configured to the same local environment.
