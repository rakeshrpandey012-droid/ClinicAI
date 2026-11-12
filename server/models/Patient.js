const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema(
  {
    uhid: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ['Male', 'Female', 'Other'],
      default: 'Male',
    },
    contact: {
      type: String,
      required: true,
      trim: true,
    },
    bloodGroup: {
      type: String,
      default: 'B+',
    },
    knownAllergies: {
      type: [String],
      default: [],
    },
    // Supporting clinical & queue metadata
    abhaId: {
      type: String,
      sparse: true,
    },
    vitals: {
      bp: { type: String, default: '120/80' },
      pulse: { type: Number, default: 72 },
      spo2: { type: Number, default: 98 },
      temp: { type: String, default: '98.4°F' },
      weight: { type: String, default: '68 kg' },
    },
    chiefComplaint: {
      type: String,
      default: 'Routine Consultation',
    },
    triageCategory: {
      type: String,
      enum: ['Critical', 'Urgent', 'Standard', 'Follow-up'],
      default: 'Standard',
    },
    tokenNumber: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['Waiting', 'In Consult', 'Completed'],
      default: 'Waiting',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', PatientSchema);
