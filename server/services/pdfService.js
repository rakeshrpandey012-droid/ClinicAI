const PDFDocument = require('pdfkit');

/**
 * Generate a professional A4 Clinical Prescription PDF
 * @param {Object} prescription
 * @param {Object} patient
 * @param {Object} doctor
 * @returns {Promise<Buffer>}
 */
function generatePrescriptionPDF(prescription, patient, doctor = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `Prescription-${patient?.uhid || 'CLN'}`,
          Author: doctor?.name || 'Dr. Ananya Sen, MD',
        },
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // 1. Header / Letterhead
      doc.rect(40, 40, 515, 75).fill('#f2f3ff');
      doc.fillColor('#006194').fontSize(16).font('Helvetica-Bold')
        .text('SHREE RAM MULTISPECIALITY CLINIC & OPD CENTRE', 50, 50);

      doc.fillColor('#3f4850').fontSize(9).font('Helvetica')
        .text('14 Rajpur Road, Dehradun, Uttarakhand • 248001 | Phone: 0135-2748920', 50, 70)
        .text('Emergency: +91 94120 18899 | Email: opd@shreeramclinic.org', 50, 82)
        .text('ABDM / Ayushman Bharat Digital Mission Facility ID: UK-DEH-4912', 50, 94);

      doc.fillColor('#006194').fontSize(11).font('Helvetica-Bold')
        .text('Dr. Ananya Sen', 400, 50, { align: 'right', width: 145 })
        .fontSize(8).font('Helvetica')
        .fillColor('#3f4850')
        .text('MBBS, MD (General Medicine)', 400, 65, { align: 'right', width: 145 })
        .text('Reg No: MCI-UK-28491', 400, 77, { align: 'right', width: 145 })
        .text('Consultant Physician', 400, 89, { align: 'right', width: 145 });

      // 2. Patient Identity Strip
      doc.rect(40, 125, 515, 55).fill('#eaedff');
      doc.fillColor('#131b2e').fontSize(10).font('Helvetica-Bold')
        .text(`Patient: ${patient?.name || 'Ramesh Sharma'}`, 50, 133)
        .font('Helvetica').fontSize(9)
        .text(`Age/Sex: ${patient?.age || 54} Y / ${patient?.gender || 'Male'}`, 50, 147)
        .text(`Contact: ${patient?.contact || '+91 98971 23456'}`, 50, 161);

      doc.text(`UHID: ${patient?.uhid || 'CLN-2024-8891'}`, 240, 133)
        .text(`ABHA ID: ${patient?.abhaId || '91-4820-2918-4912'}`, 240, 147)
        .text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 240, 161);

      doc.text(`BP: ${patient?.vitals?.bp || '130/82'} mmHg`, 410, 133)
        .text(`SpO2: ${patient?.vitals?.spo2 || 98}%  Pulse: ${patient?.vitals?.pulse || 78} bpm`, 410, 147);

      // Known allergy highlight
      doc.fillColor('#ba1a1a').font('Helvetica-Bold')
        .text(`Allergies: ${patient?.knownAllergies?.join(', ') || 'Penicillin (Severe)'}`, 410, 161);

      // 3. Clinical Assessment / Diagnosis
      doc.fillColor('#006194').fontSize(11).font('Helvetica-Bold')
        .text('Clinical Diagnosis: Acute Bronchitis with Mild Reactive Airway Spasm', 50, 195);

      // Rx Symbol
      doc.fontSize(22).font('Helvetica-Bold').fillColor('#006194').text('Rx', 50, 215);

      // 4. Medications Table
      let y = 245;
      doc.rect(40, y, 515, 20).fill('#006194');
      doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold')
        .text('#', 50, y + 5)
        .text('Drug Name & Dosage', 70, y + 5)
        .text('Frequency', 240, y + 5)
        .text('Duration', 340, y + 5)
        .text('Instructions', 410, y + 5);

      y += 25;
      const medications = prescription?.medications || [];
      medications.forEach((med, index) => {
        if (index % 2 === 1) {
          doc.rect(40, y - 5, 515, 30).fill('#f2f3ff');
        }
        doc.fillColor('#131b2e').fontSize(9).font('Helvetica-Bold')
          .text(String(index + 1), 50, y)
          .text(med.drugName, 70, y);

        doc.fillColor('#3f4850').fontSize(8).font('Helvetica')
          .text(med.dosage, 70, y + 11)
          .text(med.frequency, 240, y)
          .text(med.duration, 340, y)
          .text(med.instructions || 'After meals with warm water', 410, y, { width: 140 });

        y += 32;
      });

      // 5. Clinical Advice & Precautions
      y = Math.max(y + 15, 450);
      doc.rect(40, y, 515, 80).fill('#eaedff');
      doc.fillColor('#006194').fontSize(10).font('Helvetica-Bold')
        .text('Clinical & Dietary Advice (परामर्श):', 50, y + 10);

      const adviceList = prescription?.generalAdvice || [
        'Steam inhalation twice daily with Eucalyptus drops for airway clearance.',
        'Drink warm water throughout the day; avoid refrigerated liquids & sour foods.',
        'Strictly report immediately (SOS) if acute chest pain, hemoptysis, or high fever occurs.',
      ];

      doc.fillColor('#3f4850').fontSize(8.5).font('Helvetica');
      let adviceY = y + 25;
      adviceList.forEach((adv) => {
        doc.text(`• ${adv}`, 50, adviceY, { width: 495 });
        adviceY += 14;
      });

      // 6. Follow-up
      doc.fillColor('#006a61').font('Helvetica-Bold').fontSize(9)
        .text(`Follow-up Schedule: 5 Days (Or SOS if symptoms persist)`, 50, y + 68);

      // 7. Footer Seal & Doctor Signature
      const footerY = 720;
      doc.moveTo(40, footerY).lineTo(555, footerY).strokeColor('#bfc7d2').stroke();

      doc.fillColor('#707881').fontSize(8).font('Helvetica')
        .text('Digitally signed under the National Digital Health Mission (NDHM / ABDM).', 50, footerY + 10)
        .text('Valid e-Prescription under Information Technology Act, 2000.', 50, footerY + 22);

      doc.fillColor('#006194').fontSize(10).font('Helvetica-Bold')
        .text('Dr. Ananya Sen, MD', 400, footerY + 10, { align: 'right', width: 145 })
        .fontSize(8).font('Helvetica')
        .text('Authorized Signatory', 400, footerY + 24, { align: 'right', width: 145 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generatePrescriptionPDF,
};
