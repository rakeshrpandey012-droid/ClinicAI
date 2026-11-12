const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema(
  {
    mciRegNo: {
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
    specialization: {
      type: String,
      required: true,
      default: 'General Medicine',
    },
    clinicName: {
      type: String,
      required: true,
      default: 'Shree Ram Multispeciality Clinic & OPD Centre',
    },
    contact: {
      type: String,
      default: '+91 94120 18899',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', DoctorSchema);
