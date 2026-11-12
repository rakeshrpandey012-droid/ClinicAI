require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

// Models
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');
const Consultation = require('./models/Consultation');
const Prescription = require('./models/Prescription');

// Services
const BhashiniService = require('./services/bhashiniService');
const { extractClinicalSummary } = require('./services/geminiService');

// Controllers & Routes
const clinicalRoutes = require('./routes/clinicalRoutes');
const {
  inMemoryConsultations,
  inMemoryPatients,
  inMemoryPrescriptions,
} = require('./controllers/clinicalController');

const app = express();
const server = http.createServer(app);

// Configure Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Mount REST API Routes
app.use('/api', clinicalRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'online',
    appName: 'ClinicAI - Multilingual Intelligent Clinical Copilot',
    database: isDbConnected ? 'MongoDB' : 'In-Memory Engine',
    timestamp: new Date().toISOString(),
  });
});

// Prescription WhatsApp API Mock
app.post('/api/prescriptions/:id/whatsapp', (req, res) => {
  const { id } = req.params;
  const { phone, patientName } = req.body;
  res.json({
    success: true,
    message: `Prescription PDF successfully queued for WhatsApp delivery to ${phone}.`,
    messageId: `WA-MSG-${Date.now()}`,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Placeholder function processAudioToText(chunk)
 * Simulates sending data to an external ASR service (Bhashini/Whisper)
 * and returns interim and final transcripts.
 */
function processAudioToText(chunk, options = {}) {
  const language = options.language || 'hi-IN';
  const timestamp = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const dialogues = [
    { speaker: 'Doctor', interim: 'Bataiye kya takleef...', final: 'Bataiye Ramesh ji, pichle kuch dino se kya takleef ho rahi hai?' },
    { speaker: 'Patient', interim: 'Khansi aur bukhar...', final: 'Doctor sahiba, 10 dino se lagatar sookhi khansi hai aur shaam ko halka bukhar rehta hai.' },
    { speaker: 'Doctor', interim: 'Kya balgam nikalta...', final: 'Kya balgam peele rang ka hai aur chhati mein dard ho raha hai?' },
    { speaker: 'Patient', interim: 'Severe Penicillin allergy...', final: 'Haan doctor, aur mujhe Penicillin se severe allergy hai, pichli baar reaction hua tha.' },
    { speaker: 'Doctor', interim: 'Penicillin excluded, auscultating...', final: 'Penicillin allergy noted. Bilkul nahi denge. Deep breath lijiye auscultation ke liye.' },
    { speaker: 'Doctor', interim: 'Bilateral wheezing in lower lobes...', final: 'Bilateral expiratory wheezes and rhonchi in lower zones. Acute Bronchitis.' }
  ];

  const pick = dialogues[Math.floor(Math.random() * dialogues.length)];

  return {
    interim: {
      timestamp,
      speaker: pick.speaker,
      text: pick.interim,
      language,
      isFinal: false,
    },
    final: {
      timestamp,
      speaker: pick.speaker,
      text: pick.final,
      language,
      isFinal: true,
    },
  };
}

/* ==========================================================================
   Real-Time WebSocket Architecture (Socket.io)
   ========================================================================== */
io.on('connection', (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);

  let bhashiniInstance = null;

  // 1. Join consultation room
  socket.on('join_consultation', ({ consultationId, patientId, language }) => {
    socket.join(consultationId || 'default_room');
    console.log(`[Socket] Joined consultation room: ${consultationId}`);

    // Initialize Bhashini WebSocket streaming instance for this session
    bhashiniInstance = new BhashiniService({
      sourceLanguage: language || 'hi',
      consultationId,
    });

    bhashiniInstance.connect();

    // Listen to Bhashini VAD State Machine Events
    bhashiniInstance.on('speech_start', (event) => {
      io.to(consultationId || 'default_room').emit('vad_state', { state: 'speech_start', ...event });
    });

    bhashiniInstance.on('speech_pause', (event) => {
      io.to(consultationId || 'default_room').emit('vad_state', { state: 'speech_pause', ...event });
    });

    bhashiniInstance.on('speech_resume', (event) => {
      io.to(consultationId || 'default_room').emit('vad_state', { state: 'speech_resume', ...event });
    });

    bhashiniInstance.on('speech_end', (event) => {
      io.to(consultationId || 'default_room').emit('vad_state', { state: 'speech_end', ...event });
    });

    // Real-time transcript emission: partial to client, final to DB/memory document
    bhashiniInstance.on('transcript', async (transcriptData) => {
      // Emit transcript_update event back to client
      io.to(consultationId || 'default_room').emit('transcript_update', transcriptData);

      // If final, append to Consultation database/memory document
      if (transcriptData.isFinal) {
        if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(consultationId)) {
          await Consultation.findByIdAndUpdate(consultationId, {
            $push: { transcript: transcriptData },
          });
        } else {
          const consult = inMemoryConsultations.find((c) => c._id === consultationId);
          if (consult) {
            consult.transcript.push(transcriptData);
          }
        }
      }
    });
  });

  // 2. Receive audio_stream_chunk event from React MediaRecorder
  socket.on('audio_stream_chunk', (data) => {
    const { chunk, consultationId, language } = data || {};

    if (bhashiniInstance && bhashiniInstance.isConnected) {
      // Forward binary audio chunk to Bhashini Streaming STT
      bhashiniInstance.sendAudioChunk(chunk);
    } else {
      // Process through simulated ASR engine
      const { interim, final } = processAudioToText(chunk, { language });

      // Emit interim partial transcript
      socket.emit('transcript_update', interim);

      // Emit final completed transcript and persist
      setTimeout(async () => {
        io.to(consultationId || 'default_room').emit('transcript_update', final);

        const consult = inMemoryConsultations.find((c) => c._id === consultationId);
        if (consult) {
          consult.transcript.push(final);
        }
      }, 350);
    }
  });

  // Compatibility with existing frontend event 'audio_stream'
  socket.on('audio_stream', (data) => {
    socket.emit('audio_stream_chunk', data);
  });

  // 3. Request AI SOAP Notes & Prescription Generation
  socket.on('request_soap_generation', async ({ consultationId, patientId }) => {
    try {
      const consult = inMemoryConsultations.find((c) => c._id === consultationId) || inMemoryConsultations[0];
      const patient = inMemoryPatients.find((p) => p._id === patientId) || inMemoryPatients[0];

      const aiResult = await extractClinicalSummary(consult.transcript || [], {
        knownAllergies: patient.knownAllergies,
        patientName: patient.name,
      });

      consult.soapNote = aiResult.soapNote;
      socket.emit('soap_update', aiResult);
    } catch (err) {
      socket.emit('soap_error', { message: err.message });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
    if (bhashiniInstance) {
      bhashiniInstance.close();
    }
  });
});

// MongoDB Connection with seamless fallback
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/clinicai';
const PORT = process.env.PORT || 5000;

mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 })
  .then(() => {
    console.log('✅ Connected to MongoDB at:', MONGO_URI);
  })
  .catch(() => {
    console.log('⚠️ MongoDB not available locally, running with robust In-Memory Database engine.');
  });

server.listen(PORT, () => {
  console.log(`🏥 ClinicAI Server running on port ${PORT}`);
});
