const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema(
  {
    drugName: {
      type: String,
      required: true,
      trim: true,
    },
    dosage: {
      type: String,
      required: true,
      trim: true, // e.g. "500mg" or "10ml"
    },
    frequency: {
      type: String,
      required: true,
      trim: true, // e.g. "1-0-1" or "OD"
    },
    duration: {
      type: String,
      required: true,
      trim: true, // e.g. "5 Days"
    },
    instructions: {
      type: String,
      default: 'Take with warm water after meals',
    },
  },
  { _id: false }
);

const PrescriptionSchema = new mongoose.Schema(
  {
    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consultation',
      required: true,
    },
    medications: {
      type: [MedicationSchema],
      default: [],
    },
    generalAdvice: {
      type: [String],
      default: [
        'Rest adequately and maintain proper hydration.',
        'Avoid cold refrigerated drinks and sour foods.',
      ],
    },
    followUpDate: {
      type: Date,
      default: () => new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', PrescriptionSchema);
