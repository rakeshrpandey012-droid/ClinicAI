const mongoose = require('mongoose');

const TranscriptItemSchema = new mongoose.Schema(
  {
    timestamp: {
      type: String,
      default: () =>
        new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
    },
    speaker: {
      type: String,
      enum: ['Doctor', 'Patient', 'AI Copilot'],
      default: 'Doctor',
    },
    text: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: 'hi-IN',
    },
    isFinal: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const SoapNoteSchema = new mongoose.Schema(
  {
    subjective: {
      type: String,
      default: '',
    },
    objective: {
      type: String,
      default: '',
    },
    assessment: {
      type: String,
      default: '',
    },
    plan: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const ConsultationSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: false,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    rawAudioUrl: {
      type: String,
      default: '',
    },
    transcript: {
      type: [TranscriptItemSchema],
      default: [],
    },
    soapNote: {
      type: SoapNoteSchema,
      default: () => ({
        subjective: '',
        objective: '',
        assessment: '',
        plan: '',
      }),
    },
    status: {
      type: String,
      enum: ['Active', 'Completed'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Consultation', ConsultationSchema);
