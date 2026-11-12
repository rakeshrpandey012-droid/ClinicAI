// server/index.js
require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const Patient = require('./models/Patient');
const Consultation = require('./models/Consultation');
const Prescription = require('./models/Prescription');
const { transcribeAudioChunk } = require('./services/asrService');
const { generateClinicalSummary } = require('./services/llmService');

const app = express();
const server = http.createServer(app);

// Enable CORS for frontend Vite app
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// In-Memory Database store when MongoDB is not running locally
let inMemoryPatients = [];
let inMemoryConsultations = [];
let inMemoryPrescriptions = [];

// Seed baseline demo patients matching the ClinicAI high-fidelity UI
const seedDemoData = async () => {
  const initialPatients = [
    {
      _id: '674000000000000000000001',
      name: 'Ramesh Sharma',
      age: 54,
      gender: 'Male',
      contact: '+91 98971 23456',
      knownAllergies: ['Penicillin (Severe)', 'Dust Allergens'],
      uhid: 'CLN-2024-8891',
      abhaId: '91-4820-2918-4912',
      occupation: 'Civil Contractor • Dehradun',
      city: 'Dehradun, Uttarakhand',
      bloodGroup: 'B+',
      vitals: {
        bp: '130/82',
        pulse: 78,
        spo2: 98,
        temp: '98.4°F',
        weight: '72 kg',
      },
      chiefComplaint: 'Persistent dry cough × 10d, evening fever, throat irritation',
      triageCategory: 'Urgent',
      tokenNumber: 14,
      status: 'In Consult',
    },
    {
      _id: '674000000000000000000002',
      name: 'Sunita Devi',
      age: 48,
      gender: 'Female',
      contact: '+91 94120 77812',
      knownAllergies: ['Sulfa Drugs'],
      uhid: 'CLN-2024-8892',
      abhaId: '91-3210-9988-1204',
      occupation: 'Teacher • Rishikesh',
      city: 'Rishikesh',
      bloodGroup: 'O+',
      vitals: {
        bp: '138/88',
        pulse: 84,
        spo2: 97,
        temp: '99.1°F',
        weight: '62 kg',
      },
      chiefComplaint: 'Knee joint pain, swelling, difficulty climbing stairs for 3 weeks',
      triageCategory: 'Standard',
      tokenNumber: 15,
      status: 'Waiting',
    },
    {
      _id: '674000000000000000000003',
      name: 'Aarav Rawat',
      age: 8,
      gender: 'Male',
      contact: '+91 97190 44521',
      knownAllergies: ['None Reported'],
      uhid: 'CLN-2024-8893',
      abhaId: '91-1122-3344-5566',
      occupation: 'Student • Mussoorie',
      city: 'Mussoorie',
      bloodGroup: 'A+',
      vitals: {
        bp: '100/65',
        pulse: 92,
        spo2: 99,
        temp: '101.2°F',
        weight: '25 kg',
      },
      chiefComplaint: 'High grade fever with chills and vomiting since yesterday night',
      triageCategory: 'Critical',
      tokenNumber: 16,
      status: 'Waiting',
    },
    {
      _id: '674000000000000000000004',
      name: 'Kavita Joshi',
      age: 32,
      gender: 'Female',
      contact: '+91 98370 11982',
      knownAllergies: ['NSAIDs / Ibuprofen'],
      uhid: 'CLN-2024-8894',
      abhaId: '91-7788-9900-1122',
      occupation: 'IT Consultant • Dehradun',
      city: 'Dehradun',
      bloodGroup: 'AB+',
      vitals: {
        bp: '115/75',
        pulse: 74,
        spo2: 99,
        temp: '98.2°F',
        weight: '56 kg',
      },
      chiefComplaint: 'Migraine episodes triggered by screen work, nausea and photophobia',
      triageCategory: 'Follow-up',
      tokenNumber: 17,
      status: 'Waiting',
    },
  ];

  inMemoryPatients = initialPatients;

  // Initial consult for Ramesh Sharma
  const initialConsult = {
    _id: '674000000000000000000101',
    patientId: '674000000000000000000001',
    doctorName: 'Dr. Ananya Sen, MD',
    transcript: [
      {
        timestamp: '11:32:05 AM',
        speaker: 'Doctor',
        text: 'Namaste Ramesh ji, bataiye pichle kuch dino se kya pareshani ho rahi hai?',
        language: 'hi-IN',
      },
      {
        timestamp: '11:32:15 AM',
        speaker: 'Patient',
        text: 'Namaste Doctor sahiba. Lagbhag 10 din se sookhi khansi aa rahi hai, shaam hote hi badan garam lagta hai aur gale mein jalan rehti hai.',
        language: 'hi-IN',
      },
      {
        timestamp: '11:32:32 AM',
        speaker: 'Doctor',
        text: 'Kya khansi ke sath peela ya hara balgam (sputum) bhi aata hai? Aur chhati mein dard?',
        language: 'hi-IN',
      },
      {
        timestamp: '11:32:48 AM',
        speaker: 'Patient',
        text: 'Haan, subah thoda peela balgam nikalta hai aur gehri saans lene par chhati mein thoda dard hota hai.',
        language: 'hi-IN',
      },
      {
        timestamp: '11:33:05 AM',
        speaker: 'Doctor',
        text: 'Kya aapko kisi dawai se allergy hai? Koi purani dawa ya reaction?',
        language: 'hi-IN',
      },
      {
        timestamp: '11:33:18 AM',
        speaker: 'Patient',
        text: 'Doctor mujhe Penicillin se bahut sakht allergy hai! Pichli baar daane nikal aaye the aur saans phoolne lagi thi.',
        language: 'hi-IN',
      },
      {
        timestamp: '11:33:30 AM',
        speaker: 'Doctor',
        text: 'Bilkul theek, maine Penicillin allergy red flag kar di hai. Ab main aapka chest check kar leti hoon.',
        language: 'hi-IN',
      },
      {
        timestamp: '11:33:45 AM',
        speaker: 'Doctor',
        text: 'Bilateral expiratory wheezes audible in lower lung fields. Rhonchi present. No cyanosis.',
        language: 'en',
      },
    ],
    soapNote: {
      S: 'Patient presents with persistent dry cough × 10d, evening low-grade fever, sore throat, and morning yellow sputum. Chest tightness on deep inspiration. Known severe Penicillin allergy (anaphylactoid reaction).',
      O: 'Vitals: BP 130/82 mmHg, HR 78 bpm, SpO2 98%, Temp 98.4°F. Chest auscultation shows bilateral expiratory wheezes with coarse rhonchi in lower zones. Pharynx mildly congested.',
      A: 'Acute Bronchitis with reactive bronchospasm. Secondary: Mild URTI. Strict Penicillin Contraindication noted.',
      P: '1. Tab. Azithromycin 500mg 1-0-0 × 5d (Macrolide safe for Penicillin allergic patient).\n2. Syr. Ascoril-LS 10ml TDS × 5d.\n3. Tab. Paracetamol 650mg SOS.\n4. Tab. Pantoprazole 40mg OD AC × 5d.\n5. Warm steam inhalation and avoid refrigerated liquids. Follow up in 5 days.',
    },
    status: 'In Progress',
    activeLanguage: 'hi-IN',
  };

  inMemoryConsultations = [initialConsult];

  // Initial Prescription
  const initialPrescription = {
    _id: '674000000000000000000201',
    consultationId: '674000000000000000000101',
    patientId: '674000000000000000000001',
    medications: [
      {
        drugName: 'Tab. Azithromycin 500mg',
        dosage: '500 mg',
        frequency: '1-0-0 (Once daily before food)',
        duration: '5 Days',
        instructions: 'Take 1 hour before or 2 hours after meals with water',
        instructionsHindi: 'रोजाना एक बार भोजन से 1 घंटा पहले या 2 घंटे बाद लें',
      },
      {
        drugName: 'Syr. Ascoril-LS (Levosalbutamol + Ambroxol)',
        dosage: '10 ml',
        frequency: '1-1-1 (Thrice daily after food)',
        duration: '5 Days',
        instructions: 'Shake well before use, take with lukewarm water',
        instructionsHindi: 'अच्छी तरह हिलाएं, गुनगुने पानी के साथ दिन में तीन बार लें',
      },
      {
        drugName: 'Tab. Paracetamol 650mg (Dolo 650)',
        dosage: '650 mg',
        frequency: 'SOS (When temp > 99°F, max 3 times/day)',
        duration: '3 Days',
        instructions: 'Take only if fever or body pain occurs, after meals',
        instructionsHindi: 'सिर्फ बुखार या शरीर दर्द होने पर ही भोजन के बाद लें',
      },
      {
        drugName: 'Tab. Pantoprazole 40mg (Pan-40)',
        dosage: '40 mg',
        frequency: '1-0-0 (Once daily, early morning empty stomach)',
        duration: '5 Days',
        instructions: 'Take empty stomach 30 minutes before breakfast',
        instructionsHindi: 'सुबह खाली पेट नाश्ते से 30 मिनट पहले लें',
      },
    ],
    generalAdvice:
      'Steam inhalation twice daily with Eucalyptus drops. Drink warm water throughout the day. Strictly avoid cold refrigerated drinks, fried foods, and direct exposure to dust or smoke.',
    generalAdviceHindi:
      'दिन में दो बार गर्म पानी की भाप लें। पूरे दिन गुनगुना पानी पिएं। फ्रिज का ठंडा पानी, तली-भुनी चीजें और धूल-धुएं से पूरी तरह बचें।',
    dietaryRestrictions: ['Avoid oily and sour foods', 'Do not consume cold refrigerated items'],
    investigationsOrdered: ['Chest X-Ray PA View (if cough persists > 5 days)', 'CBC with ESR'],
    followUpDate: 'After 5 Days (Or SOS if breathlessness worsens)',
  };

  inMemoryPrescriptions = [initialPrescription];
};

seedDemoData();

// MongoDB Connection with seamless fallback to In-Memory mode
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/clinicai';
let isMongoConnected = false;

mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 })
  .then(() => {
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB at:', MONGO_URI);
  })
  .catch((err) => {
    console.log('⚠️ MongoDB not available locally, running with robust In-Memory Database engine.');
    isMongoConnected = false;
  });

/* ==========================================================================
   REST API Endpoints for ClinicAI
   ========================================================================== */

// 1. Health check & EMR Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'ClinicAI - Multilingual Intelligent Clinical Copilot',
    database: isMongoConnected ? 'MongoDB' : 'In-Memory Engine',
    timestamp: new Date().toISOString(),
  });
});

// 2. Patient Queue / List
app.get('/api/patients', async (req, res) => {
  try {
    if (isMongoConnected) {
      const patients = await Patient.find().sort({ tokenNumber: 1 });
      return res.json(patients.length ? patients : inMemoryPatients);
    }
    res.json(inMemoryPatients);
  } catch (err) {
    res.json(inMemoryPatients);
  }
});

// 3. Get single patient by ID or UHID
app.get('/api/patients/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (isMongoConnected && mongoose.isValidObjectId(id)) {
      const patient = await Patient.findById(id);
      if (patient) return res.json(patient);
    }
    const found = inMemoryPatients.find((p) => p._id === id || p.uhid === id);
    if (found) return res.json(found);
    return res.json(inMemoryPatients[0]); // fallback to demo patient
  } catch (err) {
    res.json(inMemoryPatients[0]);
  }
});

// 4. Create or update patient
app.post('/api/patients', async (req, res) => {
  try {
    const newPatient = {
      _id: req.body._id || new mongoose.Types.ObjectId().toString(),
      uhid: req.body.uhid || `CLN-2024-${Math.floor(1000 + Math.random() * 9000)}`,
      tokenNumber: inMemoryPatients.length + 1,
      status: 'Waiting',
      ...req.body,
    };
    if (isMongoConnected) {
      const doc = await Patient.create(newPatient);
      return res.status(201).json(doc);
    }
    inMemoryPatients.push(newPatient);
    res.status(201).json(newPatient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Get Consultation by Patient ID or Consultation ID
app.get('/api/consultations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (isMongoConnected && mongoose.isValidObjectId(id)) {
      const consult = await Consultation.findOne({
        $or: [{ _id: id }, { patientId: id }],
      }).populate('patientId');
      if (consult) return res.json(consult);
    }
    const found = inMemoryConsultations.find(
      (c) => c._id === id || c.patientId === id
    );
    if (found) return res.json(found);
    return res.json(inMemoryConsultations[0]);
  } catch (err) {
    res.json(inMemoryConsultations[0]);
  }
});

// 6. Update Consultation (SOAP notes, transcript)
app.put('/api/consultations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const update = req.body;
    if (isMongoConnected && mongoose.isValidObjectId(id)) {
      const updated = await Consultation.findByIdAndUpdate(id, update, { new: true });
      if (updated) return res.json(updated);
    }
    const idx = inMemoryConsultations.findIndex((c) => c._id === id || c.patientId === id);
    if (idx !== -1) {
      inMemoryConsultations[idx] = { ...inMemoryConsultations[idx], ...update };
      return res.json(inMemoryConsultations[idx]);
    }
    res.status(404).json({ error: 'Consultation not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Trigger AI SOAP & Rx Generation manually or via API
app.post('/api/consultations/:id/generate-ai', async (req, res) => {
  const { id } = req.params;
  try {
    let consult = inMemoryConsultations.find((c) => c._id === id || c.patientId === id);
    let patient = inMemoryPatients.find((p) => p._id === (consult?.patientId || id));

    if (!consult) consult = inMemoryConsultations[0];
    if (!patient) patient = inMemoryPatients[0];

    const aiResult = await generateClinicalSummary(consult.transcript || [], patient);

    // Update consult SOAP
    consult.soapNote = aiResult.soapNote;

    // Create or update prescription
    let rx = inMemoryPrescriptions.find((p) => p.consultationId === consult._id);
    if (!rx) {
      rx = {
        _id: '674000000000000000000201',
        consultationId: consult._id,
        patientId: patient._id,
      };
      inMemoryPrescriptions.push(rx);
    }
    rx.medications = aiResult.medications;
    rx.generalAdvice = aiResult.generalAdvice;
    rx.generalAdviceHindi = aiResult.generalAdviceHindi;
    rx.followUpDate = aiResult.followUp || rx.followUpDate;

    res.json({
      success: true,
      soapNote: aiResult.soapNote,
      medications: aiResult.medications,
      generalAdvice: aiResult.generalAdvice,
      generalAdviceHindi: aiResult.generalAdviceHindi,
      prescriptionId: rx._id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Get Prescription by Consultation or Patient ID
app.get('/api/prescriptions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (isMongoConnected && mongoose.isValidObjectId(id)) {
      const rx = await Prescription.findOne({
        $or: [{ _id: id }, { consultationId: id }, { patientId: id }],
      }).populate('patientId');
      if (rx) return res.json(rx);
    }
    const found = inMemoryPrescriptions.find(
      (p) => p._id === id || p.consultationId === id || p.patientId === id
    );
    if (found) return res.json(found);
    return res.json(inMemoryPrescriptions[0]);
  } catch (err) {
    res.json(inMemoryPrescriptions[0]);
  }
});

// 9. Mock WhatsApp Dispatch API
app.post('/api/prescriptions/:id/whatsapp', (req, res) => {
  const { id } = req.params;
  const { phone, patientName } = req.body;
  console.log(`[WhatsApp API Dispatch]: Sending Rx #${id} to ${patientName} at ${phone}...`);
  res.json({
    success: true,
    message: `Prescription PDF successfully queued for WhatsApp delivery to ${phone}.`,
    messageId: `WA-MSG-${Date.now()}`,
    timestamp: new Date().toISOString(),
  });
});

/* ==========================================================================
   Socket.io Real-Time Audio Streaming & Live Transcription
   ========================================================================== */

io.on('connection', (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);

  // Client joins consultation room
  socket.on('join_consultation', ({ consultationId, patientId }) => {
    socket.join(consultationId || 'default_room');
    console.log(`User ${socket.id} joined consultation: ${consultationId}`);
  });

  // Client streams audio chunk (from MediaRecorder)
  socket.on('audio_stream', async (data) => {
    try {
      const { chunk, consultationId, language } = data;

      // Send to ASR Service (Bhashini / Whisper / Clinical Speech Simulation)
      const transcriptUpdate = await transcribeAudioChunk(chunk, {
        language: language || 'hi-IN',
        consultationId,
      });

      // Append to the consultation record
      const consult = inMemoryConsultations.find((c) => c._id === consultationId);
      if (consult) {
        consult.transcript.push(transcriptUpdate);
      }

      // Emit back to all clients in this consultation room
      io.to(consultationId || 'default_room').emit('transcript_update', transcriptUpdate);
      // Also emit to the direct socket
      socket.emit('transcript_update', transcriptUpdate);
    } catch (err) {
      console.error('Audio stream processing error:', err.message);
    }
  });

  // Real-time SOAP note generation event
  socket.on('request_soap_generation', async ({ consultationId, patientId }) => {
    try {
      const consult = inMemoryConsultations.find((c) => c._id === consultationId) || inMemoryConsultations[0];
      const patient = inMemoryPatients.find((p) => p._id === patientId) || inMemoryPatients[0];

      const aiResult = await generateClinicalSummary(consult.transcript || [], patient);
      consult.soapNote = aiResult.soapNote;

      socket.emit('soap_update', aiResult);
    } catch (err) {
      socket.emit('soap_error', { message: err.message });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🏥 ClinicAI Server running on http://localhost:${PORT}`);
});
