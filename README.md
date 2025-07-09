# Automatic Meeting Assistant

Automatic Meeting Assistant is a web-based application that lets you upload an MP3 meeting recording and receive a structured, AI-driven summary. The system uses a React frontend, a Go backend with the Gin web framework, and the OpenAI Whisper & GPT APIs for transcription and summarization.

---

## Directory Structure

meeting-assistant/
├── backend/      # Go backend code and Dockerfile
├── frontend/     # React frontend code, Dockerfile, nginx.conf
├── docker-compose.yml
├── .env          # Your OpenAI API key here (not tracked in git)
└── README.md
---

## Features

- Upload your MP3 meeting recordings for instant AI-powered summaries
- Step-by-step upload, transcribe, and summarize progress indicators
- Robust validation: only valid `.mp3` files <10MB allowed
- Secure handling: temporary storage only, deleted after processing
- Download meeting summaries as `.txt` or `.md` formats
- Responsive, modern UI

---

## Prerequisites

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- **An OpenAI API Key** (for Whisper and GPT APIs)
- This repository cloned to your machine

---

## Installation & Usage

### 1. Clone the Repository


git clone https://github.com/your-username/meeting-assistant.git
cd meeting-assistant



### 2. Directory Structure


meeting-assistant/
├── backend/      # Go backend code and Dockerfile
├── frontend/     # React frontend code, Dockerfile, nginx.conf
├── docker-compose.yml
├── .env          # Your OpenAI API key here (not tracked in git)
└── README.md
### 3. Create Your `.env` File

Create a file named `.env` in your project root (same directory as `docker-compose.yml`).
It should contain your OpenAI API key:


OPENAI_API_KEY=your-openai-api-key-here


### 4. Start the Application

docker-compose up

This will:
- Start the backend at http://localhost:8080
- Start the frontend at http://localhost:3000 (via Nginx proxy)




### 5. Use the App

- Visit http://localhost:3000 in your browser
- Upload an .mp3 file under 10MB
- Watch the real-time progress bar as your meeting is uploaded, transcribed, and summarized
- View and download your summary as .txt or .md

---


### 4. Start the Application

```sh
docker-compose up
```

This will:

- Start the backend at http://localhost:8080
- Start the frontend at http://localhost:3000 (via Nginx proxy)

### 5. Use the App

- Visit http://localhost:3000 in your browser
- Upload an .mp3 file under 10MB
- Watch the real-time progress bar as your meeting is uploaded, transcribed, and summarized
- View and download your summary as .txt or .md

### 6. Security and privacy

- Only accepts and processes valid .mp3 files under 10MB
- All files are sanitized on the backend; invalid/malicious files are rejected
- Uploaded audio is deleted after processing
- No persistent data storage or authentication in this demo (add as needed for production)

### 7. Tech Stack

- Frontend: React, HTML/CSS, Nginx (for static serving and proxy)
- Backend: Go, Gin
- AI APIs: OpenAI Whisper (speech-to-text), GPT (summarization)
- Deployment: Docker, Docker Compose