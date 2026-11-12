const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const {
  getPatientQueue,
  getPatientHistory,
  createConsultation,
  finalizePrescription,
  extractSoapFromTranscript,
  inMemoryPatients,
  inMemoryPrescriptions,
} = require('../controllers/clinicalController');

const { generatePrescriptionPDF } = require('../services/pdfService');
const whatsappService = require('../services/whatsappService');

// 1. Fetch patient queue
router.get('/patients/queue', getPatientQueue);
router.get('/patients', getPatientQueue);

// 2. Register New Patient Walk-in
router.post('/patients/register', (req, res) => {
  try {
    const { name, age, gender, contact, bloodGroup, knownAllergies, chiefComplaint, triageCategory } = req.body;
    const uhidNum = Math.floor(1000 + Math.random() * 9000);
    const newPatient = {
      _id: '67400000000000000000' + Math.floor(1000 + Math.random() * 9000),
      uhid: `CLN-2024-${uhidNum}`,
      name: name || 'Walk-in Patient',
      age: Number(age) || 30,
      gender: gender || 'Male',
      contact: contact || '+91 98000 00000',
      bloodGroup: bloodGroup || 'B+',
      knownAllergies: Array.isArray(knownAllergies) ? knownAllergies : (knownAllergies ? [knownAllergies] : ['None Reported']),
      abhaId: `91-${Math.floor(1000+Math.random()*9000)}-${Math.floor(1000+Math.random()*9000)}-${Math.floor(1000+Math.random()*9000)}`,
      vitals: {
        bp: req.body.bp || '120/80',
        pulse: Number(req.body.pulse) || 76,
        spo2: Number(req.body.spo2) || 98,
        temp: req.body.temp || '98.6°F',
        weight: req.body.weight || '65 kg',
      },
      chiefComplaint: chiefComplaint || 'OPD Walk-in consultation',
      triageCategory: triageCategory || 'Standard',
      tokenNumber: inMemoryPatients.length + 1,
      status: 'Waiting',
    };
    inMemoryPatients.push(newPatient);
    res.status(201).json(newPatient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Retrieve patient medical history & dossier
router.get('/patients/:id/history', getPatientHistory);
router.get('/patients/:id', getPatientHistory);

// 4. Create a new consultation
router.post('/consultations', createConsultation);

// 5. Trigger Gemini clinical extraction from transcript
router.post('/consultations/:consultationId/extract-soap', extractSoapFromTranscript);

// 6. Finalize a prescription
router.post('/prescriptions/finalize', finalizePrescription);
router.post('/prescriptions', finalizePrescription);

// 7. Download Direct PDF of Prescription
router.get('/prescriptions/:id/pdf', async (req, res) => {
  try {
    const rx = inMemoryPrescriptions.find((p) => p._id === req.params.id || p.consultationId === req.params.id) || inMemoryPrescriptions[0];
    const patient = inMemoryPatients.find((p) => p._id === rx.patientId) || inMemoryPatients[0];
    const pdfBuffer = await generatePrescriptionPDF(rx, patient);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="prescription-${patient.uhid}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. WhatsApp Cloud API Dispatch
router.post('/prescriptions/:id/whatsapp', async (req, res) => {
  try {
    const rx = inMemoryPrescriptions.find((p) => p._id === req.params.id || p.consultationId === req.params.id) || inMemoryPrescriptions[0];
    const patient = inMemoryPatients.find((p) => p._id === rx.patientId) || inMemoryPatients[0];

    const result = await whatsappService.sendPrescription({
      phone: req.body.phone || patient.contact,
      patientName: req.body.patientName || patient.name,
      prescription: rx,
      patient,
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Audio upload route using multer
router.post('/consultations/:consultationId/upload-audio', upload.single('audio'), (req, res) => {
  res.json({
    message: 'Audio chunk uploaded successfully',
    filename: req.file?.filename,
    path: req.file?.path,
  });
});

module.exports = router;
