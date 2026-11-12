const Patient = require('../models/Patient');
const Consultation = require('../models/Consultation');
const Prescription = require('../models/Prescription');
const Doctor = require('../models/Doctor');
const { extractClinicalSummary } = require('../services/geminiService');

// Seed in-memory store for seamless offline/local operation
let inMemoryPatients = [
  {
    _id: '674000000000000000000001',
    uhid: 'CLN-2024-8891',
    name: 'Ramesh Sharma',
    age: 54,
    gender: 'Male',
    contact: '+91 98971 23456',
    bloodGroup: 'B+',
    knownAllergies: ['Penicillin (Severe)', 'Dust Allergens'],
    abhaId: '91-4820-2918-4912',
    vitals: { bp: '130/82', pulse: 78, spo2: 98, temp: '98.4°F', weight: '72 kg' },
    chiefComplaint: 'Persistent dry cough × 10d, evening fever, throat irritation',
    triageCategory: 'Urgent',
    tokenNumber: 14,
    status: 'In Consult',
  },
  {
    _id: '674000000000000000000002',
    uhid: 'CLN-2024-8892',
    name: 'Sunita Devi',
    age: 48,
    gender: 'Female',
    contact: '+91 94120 77812',
    bloodGroup: 'O+',
    knownAllergies: ['Sulfa Drugs'],
    abhaId: '91-3210-9988-1204',
    vitals: { bp: '138/88', pulse: 84, spo2: 97, temp: '99.1°F', weight: '62 kg' },
    chiefComplaint: 'Knee joint pain, swelling, difficulty climbing stairs for 3 weeks',
    triageCategory: 'Standard',
    tokenNumber: 15,
    status: 'Waiting',
  },
  {
    _id: '674000000000000000000003',
    uhid: 'CLN-2024-8893',
    name: 'Aarav Rawat',
    age: 8,
    gender: 'Male',
    contact: '+91 97190 44521',
    bloodGroup: 'A+',
    knownAllergies: ['None Reported'],
    abhaId: '91-1122-3344-5566',
    vitals: { bp: '100/65', pulse: 92, spo2: 99, temp: '101.2°F', weight: '25 kg' },
    chiefComplaint: 'High grade fever with chills and vomiting since yesterday night',
    triageCategory: 'Critical',
    tokenNumber: 16,
    status: 'Waiting',
  },
];

let inMemoryConsultations = [
  {
    _id: '674000000000000000000101',
    patientId: '674000000000000000000001',
    doctorId: '674000000000000000000301',
    startTime: new Date(),
    rawAudioUrl: '',
    transcript: [
      {
        timestamp: '11:32:05 AM',
        speaker: 'Doctor',
        text: 'Namaste Ramesh ji, bataiye pichle kuch dino se kya takleef ho rahi hai?',
        language: 'hi-IN',
        isFinal: true,
      },
      {
        timestamp: '11:32:15 AM',
        speaker: 'Patient',
        text: 'Doctor sahiba, pichle 10 dino se lagatar sookhi khansi hai aur shaam ko halka bukhar aa jata hai.',
        language: 'hi-IN',
        isFinal: true,
      },
      {
        timestamp: '11:32:32 AM',
        speaker: 'Doctor',
        text: 'Kya khansi ke sath balgam nikalta hai ya gale mein jalan hoti hai?',
        language: 'hi-IN',
        isFinal: true,
      },
      {
        timestamp: '11:32:48 AM',
        speaker: 'Patient',
        text: 'Haan doctor, subah thoda peela balgam nikalta hai aur chhati mein thoda dard rehta hai.',
        language: 'hi-IN',
        isFinal: true,
      },
      {
        timestamp: '11:33:05 AM',
        speaker: 'Doctor',
        text: 'Theek hai. Kya aapko kisi dawa se koi allergy hai jaise Penicillin?',
        language: 'hi-IN',
        isFinal: true,
      },
      {
        timestamp: '11:33:18 AM',
        speaker: 'Patient',
        text: 'Haan, Penicillin se severe allergy hai! Pichli baar daane aur saans ki takleef ho gayi thi.',
        language: 'hi-IN',
        isFinal: true,
      },
    ],
    soapNote: {
      subjective:
        'Patient presents with persistent dry cough for 10 days, accompanied by low-grade evening fever, sore throat, and morning yellow sputum.',
      objective:
        'BP 130/82 mmHg, HR 78 bpm, SpO2 98%, Temp 98.4°F. Chest auscultation shows bilateral expiratory wheezes in lower lobes.',
      assessment:
        'Acute Bronchitis with reactive bronchospasm (ICD-10: J20.9). Strict Penicillin Contraindication noted.',
      plan:
        'Azithromycin 500mg 1-0-0 × 5d, Syr. Ascoril-LS 10ml TDS × 5d, Paracetamol 650mg SOS. Follow up in 5 days.',
    },
    status: 'Active',
  },
];

let inMemoryPrescriptions = [
  {
    _id: '674000000000000000000201',
    consultationId: '674000000000000000000101',
    medications: [
      {
        drugName: 'Tab. Azithromycin 500mg',
        dosage: '500mg',
        frequency: '1-0-0 (OD)',
        duration: '5 Days',
        instructions: 'Take 1 hour before or 2 hours after meals with water',
      },
      {
        drugName: 'Syr. Ascoril-LS (Levosalbutamol + Ambroxol)',
        dosage: '10ml',
        frequency: '1-1-1 (TDS)',
        duration: '5 Days',
        instructions: 'Shake well before use, take with lukewarm water',
      },
      {
        drugName: 'Tab. Paracetamol 650mg (Dolo 650)',
        dosage: '650mg',
        frequency: 'SOS',
        duration: '3 Days',
        instructions: 'Take only if fever or body pain occurs, after meals',
      },
      {
        drugName: 'Tab. Pantoprazole 40mg (Pan-40)',
        dosage: '40mg',
        frequency: '1-0-0 (OD AC)',
        duration: '5 Days',
        instructions: 'Take empty stomach 30 minutes before breakfast',
      },
    ],
    generalAdvice: [
      'Steam inhalation twice daily with Eucalyptus drops.',
      'Drink warm water throughout the day; avoid cold refrigerated beverages.',
      'Avoid oily and sour foods.',
    ],
    followUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  },
];

// Helper to check MongoDB connection state
const isDbConnected = () => {
  const mongoose = require('mongoose');
  return mongoose.connection.readyState === 1;
};

/* 1. Fetch Patient Queue */
exports.getPatientQueue = async (req, res) => {
  try {
    if (isDbConnected()) {
      const patients = await Patient.find().sort({ tokenNumber: 1 });
      return res.json(patients.length ? patients : inMemoryPatients);
    }
    return res.json(inMemoryPatients);
  } catch (err) {
    return res.json(inMemoryPatients);
  }
};

/* 2. Retrieve Patient Medical History & Dossier */
exports.getPatientHistory = async (req, res) => {
  const { id } = req.params;
  try {
    if (isDbConnected()) {
      const patient = await Patient.findOne({
        $or: [{ _id: id }, { uhid: id }],
      });
      if (patient) {
        const consults = await Consultation.find({ patientId: patient._id });
        return res.json({ patient, consultations: consults });
      }
    }
    const foundPatient = inMemoryPatients.find((p) => p._id === id || p.uhid === id) || inMemoryPatients[0];
    const consults = inMemoryConsultations.filter((c) => c.patientId === foundPatient._id);
    return res.json({ patient: foundPatient, consultations: consults });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* 3. Create a New Consultation */
exports.createConsultation = async (req, res) => {
  try {
    const { patientId, doctorId } = req.body;
    const newConsultationData = {
      patientId: patientId || '674000000000000000000001',
      doctorId: doctorId || null,
      startTime: new Date(),
      status: 'Active',
      transcript: [],
      soapNote: { subjective: '', objective: '', assessment: '', plan: '' },
    };

    if (isDbConnected()) {
      const doc = await Consultation.create(newConsultationData);
      return res.status(201).json(doc);
    }

    const mockId = '67400000000000000000' + Math.floor(1000 + Math.random() * 9000);
    const consult = { _id: mockId, ...newConsultationData };
    inMemoryConsultations.push(consult);
    res.status(201).json(consult);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* 4. Finalize a Prescription */
exports.finalizePrescription = async (req, res) => {
  try {
    const { consultationId, medications, generalAdvice, followUpDate } = req.body;

    const prescriptionData = {
      consultationId,
      medications: medications || [],
      generalAdvice: generalAdvice || ['Rest adequately', 'Avoid cold water'],
      followUpDate: followUpDate || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    };

    if (isDbConnected()) {
      const rx = await Prescription.findOneAndUpdate(
        { consultationId },
        prescriptionData,
        { upsert: true, new: true }
      );
      // Mark consultation as completed
      await Consultation.findByIdAndUpdate(consultationId, {
        status: 'Completed',
        endTime: new Date(),
      });
      return res.status(201).json(rx);
    }

    let rx = inMemoryPrescriptions.find((p) => p.consultationId === consultationId);
    if (!rx) {
      rx = {
        _id: '674000000000000000000' + Math.floor(200 + Math.random() * 800),
        ...prescriptionData,
      };
      inMemoryPrescriptions.push(rx);
    } else {
      Object.assign(rx, prescriptionData);
    }

    const consult = inMemoryConsultations.find((c) => c._id === consultationId);
    if (consult) {
      consult.status = 'Completed';
      consult.endTime = new Date();
    }

    res.status(201).json(rx);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* 5. Trigger Gemini Clinical Extraction */
exports.extractSoapFromTranscript = async (req, res) => {
  const { consultationId } = req.params;
  try {
    let consult = inMemoryConsultations.find((c) => c._id === consultationId) || inMemoryConsultations[0];
    let patient = inMemoryPatients.find((p) => p._id === consult.patientId) || inMemoryPatients[0];

    const extracted = await extractClinicalSummary(consult.transcript || [], {
      knownAllergies: patient.knownAllergies,
      patientName: patient.name,
    });

    consult.soapNote = extracted.soapNote;
    res.json(extracted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Export in-memory objects for server and socket access
exports.inMemoryPatients = inMemoryPatients;
exports.inMemoryConsultations = inMemoryConsultations;
exports.inMemoryPrescriptions = inMemoryPrescriptions;
