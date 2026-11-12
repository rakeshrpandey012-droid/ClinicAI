# ClinicAI – Multilingual Intelligent Clinical Copilot for Indian Clinics

![ClinicAI](https://img.shields.io/badge/Status-Complete-success?style=for-the-badge)
![MERN](https://img.shields.io/badge/Stack-MERN%20%2B%20Socket.io-blue?style=for-the-badge)
![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini%20Flash-orange?style=for-the-badge)
![Bhashini](https://img.shields.io/badge/ASR-Bhashini%20Streaming%20STT-green?style=for-the-badge)

ClinicAI is a full-stack clinical copilot application designed specifically for Indian outpatient departments (OPDs). It captures live multi-lingual consultation dialogue (Hindi, English, regional dialects), streams real-time speech-to-text, uses Google Gemini to generate structured SOAP notes, cross-references dangerous drug allergies, generates ABDM-compliant A4 e-prescriptions with single-page print stylesheets, and dispatches them via WhatsApp.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 19 (Vite), Tailwind CSS (Sterile Clinical Palette), React Router v7, Lucide Icons & Material Symbols.
- **Backend**: Node.js, Express, Socket.io (Low-Latency Audio WebSockets), Mongoose (MongoDB).
- **Speech-to-Text (ASR)**: Bhashini Streaming STT WebSocket client with Voice Activity Detection (VAD: `speech_start`, `speech_pause`, `speech_resume`, `speech_end`) and Whisper API support.
- **Clinical AI Engine**: Google Gemini Flash API (`gemini-3.8-flash` / `gemini-2.5-flash`) for automated SOAP generation and allergy cross-referencing.
- **Document & Dispatch Engine**: PDFKit A4 electronic prescription generator and Meta WhatsApp Cloud API gateway.

---

## 📁 Repository Structure

```
├── client/                                 # Frontend (Vite + React)
│   ├── src/
│   │   ├── components/
│   │   │   └── Sidebar.jsx                 # Persistent clinical sidebar & OPD header
│   │   ├── pages/
│   │   │   ├── Queue.jsx                   # /queue: OPD Intake, Walk-in modal & Speech Announcer
│   │   │   ├── Consultation.jsx            # /consult/:id: Web Audio Waveform, MediaRecorder & SOAP
│   │   │   ├── History.jsx                 # /history/:id: Longitudinal EMR & ABHA Dossier
│   │   │   └── Prescription.jsx            # /rx/:id: A4 PDF Printable Sheet & WhatsApp Dispatch
│   │   ├── services/
│   │   │   └── socket.js                   # Socket.io client connector
│   │   ├── App.jsx                         # React routing
│   │   └── index.css                       # Sterile clinical design system & print styles
│   └── package.json
│
├── server/                                 # Backend (Node.js + Express)
│   ├── models/
│   │   ├── Patient.js                      # Schema: UHID, Name, Age, Allergies, Vitals
│   │   ├── Doctor.js                       # Schema: MCI Reg No, Specialization, Clinic
│   │   ├── Consultation.js                 # Schema: Audio, Transcript items, SOAP Note
│   │   └── Prescription.js                 # Schema: Medications, Dosage, Advice, Follow-up
│   ├── controllers/
│   │   └── clinicalController.js           # REST business logic for queue, EMR, consults & Rx
│   ├── routes/
│   │   └── clinicalRoutes.js               # API endpoints
│   ├── services/
│   │   ├── bhashiniService.js              # Streaming STT WebSocket client & VAD states
│   │   ├── geminiService.js                # Gemini clinical extraction & allergy checking
│   │   ├── pdfService.js                   # A4 Prescription PDF generator (PDFKit)
│   │   └── whatsappService.js              # WhatsApp Cloud API dispatch service
│   ├── server.js                           # Express entry point + Socket.io instance
│   └── package.json
├── .gitignore                              # Prevents secrets and node_modules from being pushed
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18 or higher
- **MongoDB Atlas** or local MongoDB instance

### 2. Backend Setup
```bash
cd server
npm install
```

Configure your environment variables in `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.vjeclrv.mongodb.net/clinicai?retryWrites=true&w=majority
GEMINI_API_KEY=your_gemini_api_key_here
BHASHINI_API_KEY=
BHASHINI_USER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
```

Start the backend server:
```bash
node server.js
```
*The server will run at [http://localhost:5000](http://localhost:5000).*

### 3. Frontend Setup
In a new terminal window:
```bash
cd client
npm install
npm run dev
```
*The React client will launch at [http://localhost:3000](http://localhost:3000).*

---

## 🌟 Key Features

1. **OPD Triage & Walk-in Registration (`/queue`)**:
   - Live metrics: Total scheduled, active consults, waiting room count, and dispensed prescriptions.
   - Walk-in patient modal capturing demographics, triage level, vitals, and known allergies.
   - Built-in Voice Announcer calling patient tokens out loud via Web Speech API.

2. **Real-Time Consultation & Waveform (`/consult/:id`)**:
   - Captures microphone audio using the `MediaRecorder API` in 1-second chunks and transmits via `Socket.io`.
   - Real-time HTML5 Canvas audio waveform visualizer.
   - Quick symptom insertion chips.
   - Generates structured SOAP notes via Google Gemini with automated Penicillin/antibiotic allergy alerts.

3. **Longitudinal EMR Dossier (`/history/:id`)**:
   - ABHA-linked patient dossier with past clinical episodes, adverse drug reaction history, and chronic vitals.

4. **A4 e-Prescription & WhatsApp Dispatch (`/rx/:id`)**:
   - Single-page A4 prescription layout mimicking official medical letterheads.
   - Direct binary PDF download (`/api/prescriptions/:id/pdf`).
   - One-click WhatsApp dispatch to the patient's phone.
   - Bilingual language view toggles (English, Hindi, and Bilingual).

---

## 🔒 Security & Privacy Notice
Never commit your `.env` file containing live MongoDB Atlas credentials or Gemini API keys to public repositories. The included `.gitignore` keeps your local `.env` secure.

---

## 📄 License
This project is part of the ClinicAI clinical intelligence system for OPD healthcare facilities.
