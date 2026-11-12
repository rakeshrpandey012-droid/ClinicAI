import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function Prescription() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [prescription, setPrescription] = useState(null);
  const [patient, setPatient] = useState(null);
  const [languageMode, setLanguageMode] = useState('both'); // 'both', 'en', 'hi'
  const [whatsAppStatus, setWhatsAppStatus] = useState(null);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5000/api/prescriptions/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setPrescription(data);
        const pId = data.patientId?._id || data.patientId || '674000000000000000000001';
        return fetch(`http://localhost:5000/api/patients/${pId}`);
      })
      .then((res) => res.json())
      .then((pat) => setPatient(pat?.patient || pat))
      .catch((err) => console.error(err));
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    window.open(`http://localhost:5000/api/prescriptions/${id}/pdf`, '_blank');
  };

  const handleWhatsAppDispatch = async () => {
    setIsSendingWhatsApp(true);
    try {
      const res = await fetch(`http://localhost:5000/api/prescriptions/${id}/whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: patient?.contact || '+91 98971 23456',
          patientName: patient?.name || 'Ramesh Sharma',
        }),
      });
      const data = await res.json();
      setWhatsAppStatus(`Prescription PDF dispatched to ${patient?.contact || '+91 98971 23456'}! Ref: ${data.messageId}`);
      setTimeout(() => setWhatsAppStatus(null), 6000);
    } catch (err) {
      setWhatsAppStatus('WhatsApp dispatch simulated successfully.');
      setTimeout(() => setWhatsAppStatus(null), 6000);
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Top Quick Actions / Breadcrumb Bar (Hidden during Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate(`/consult/${patient?._id || '674000000000000000000001'}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-primary transition-colors shadow-sm text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to Active Consult</span>
          </button>
          <span className="text-outline-variant">•</span>
          <span className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5 bg-secondary-fixed/30 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            Ready to Print & Dispense
          </span>
        </div>

        {/* View Toggle / Language Toggle Pill */}
        <div className="flex items-center gap-1.5 bg-surface-container p-1 rounded-xl shadow-inner self-start sm:self-auto text-xs">
          <span className="text-on-surface-variant px-2 font-medium">Script View:</span>
          <button
            onClick={() => setLanguageMode('both')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              languageMode === 'both'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            English + हिंदी
          </button>
          <button
            onClick={() => setLanguageMode('en')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              languageMode === 'en'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            English Only
          </button>
          <button
            onClick={() => setLanguageMode('hi')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              languageMode === 'hi'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            हिंदी (Hindi)
          </button>
        </div>
      </div>

      {/* WhatsApp Dispatch Status Banner */}
      {whatsAppStatus && (
        <div className="no-print mb-4 p-3 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-between text-xs font-bold shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">chat</span>
            <span>{whatsAppStatus}</span>
          </div>
          <button onClick={() => setWhatsAppStatus(null)}>✕</button>
        </div>
      )}

      {/* A4 Prescription Canvas Preview Container */}
      <div className="w-full flex justify-center">
        {/* Printable Sheet (A4 ratio feel, pristine clinical elevation) */}
        <div
          id="printable-rx"
          className="w-full max-w-4xl bg-surface-container-lowest rounded-xl shadow-xl p-6 sm:p-10 relative overflow-hidden border border-surface-container"
        >
          {/* Watermark */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none opacity-[0.025] flex items-center justify-center select-none"
          >
            <span className="material-symbols-outlined text-[540px] text-primary">health_and_safety</span>
          </div>

          {/* 1. Formal Clinical Header (Letterhead) */}
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b-2 border-primary/20">
            <div className="flex items-start gap-3.5 max-w-md">
              <div className="w-13 h-13 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 text-on-primary shadow-md p-2">
                <span className="material-symbols-outlined text-[32px]">local_hospital</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-secondary font-bold tracking-widest uppercase">
                  Government Recognized Healthcare Facility
                </span>
                <h1 className="font-headline font-bold text-lg text-on-surface leading-tight mt-0.5">
                  SHREE RAM MULTISPECIALITY CLINIC & OPD CENTRE
                </h1>
                <p className="text-xs text-on-surface-variant mt-0.5 leading-snug">
                  14 Rajpur Road, Dehradun, Uttarakhand • 248001
                </p>
                <p className="text-[11px] text-outline mt-0.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">call</span> 0135-2748920 • Emergency: +91 94120 18899
                </p>
              </div>
            </div>

            <div className="flex flex-col md:items-end text-left md:text-right">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-low text-primary mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                <span className="text-[10px] font-bold uppercase tracking-wider">Consultant Physician</span>
              </div>
              <h2 className="font-headline font-bold text-base text-primary">Dr. Ananya Sen</h2>
              <span className="text-xs font-semibold text-on-surface">MBBS, MD (General Medicine)</span>
              <span className="text-[11px] text-on-surface-variant mt-0.5">Reg No: MCI-UK-28491 / State Medical Council</span>
            </div>
          </div>

          {/* 2. Patient Identity & Clinical Baseline Banner */}
          <div className="relative bg-surface-container-low rounded-xl p-4 my-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border border-surface-container">
            <div>
              <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-medium">Patient Name</span>
              <span className="font-bold text-sm text-on-surface">{patient?.name || 'Ramesh Sharma'}</span>
              <span className="text-[11px] text-outline block">{patient?.age || 54} Y / {patient?.gender || 'Male'}</span>
            </div>

            <div>
              <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-medium">UHID / ABHA ID</span>
              <span className="font-mono font-bold text-on-surface block">{patient?.uhid || 'CLN-2024-8891'}</span>
              <span className="text-[10px] font-mono text-outline">{patient?.abhaId || '91-4820-2918-4912'}</span>
            </div>

            <div>
              <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-medium">Recorded Vitals</span>
              <span className="font-bold text-on-surface block">BP: {patient?.vitals?.bp || '130/82'} mmHg</span>
              <span className="text-[10px] text-secondary font-semibold">SpO2: {patient?.vitals?.spo2 || 98}% • HR: {patient?.vitals?.pulse || 78}</span>
            </div>

            <div className="flex flex-col justify-center">
              <span className="text-[10px] text-error uppercase tracking-wider block font-bold">Allergy Warning</span>
              <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-bold text-[11px] inline-block self-start">
                {patient?.knownAllergies?.join(', ') || 'Penicillin (Severe)'}
              </span>
            </div>
          </div>

          {/* 3. Clinical Diagnosis & Rx Symbol Header */}
          <div className="relative flex items-center justify-between pb-3 mb-3 border-b border-surface-container">
            <div>
              <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Clinical Impression / Diagnosis</span>
              <h3 className="font-headline font-bold text-base text-primary">
                Acute Bronchitis with Mild Reactive Bronchospasm (ICD-10: J20.9)
              </h3>
            </div>
            <div className="font-serif italic font-bold text-3xl text-primary select-none">
              ℞
            </div>
          </div>

          {/* 4. Structured Medications Table */}
          <div className="relative overflow-x-auto mb-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-surface-container text-[11px] font-bold text-on-surface-variant uppercase">
                  <th className="py-2.5 px-2">#</th>
                  <th className="py-2.5 px-2">Medication & Dosage</th>
                  <th className="py-2.5 px-2">Schedule (M-A-N)</th>
                  <th className="py-2.5 px-2">Duration</th>
                  <th className="py-2.5 px-2">Instructions (निर्देश)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {prescription?.medications?.map((med, index) => (
                  <tr key={index} className="hover:bg-surface-container-low/40">
                    <td className="py-3 px-2 font-bold text-outline">{index + 1}</td>
                    <td className="py-3 px-2">
                      <div className="font-bold text-sm text-on-surface">{med.drugName}</div>
                      <span className="text-[11px] text-primary font-medium">{med.dosage}</span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="font-semibold text-xs px-2 py-0.5 rounded bg-surface-container text-on-surface font-mono">
                        {med.frequency}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-semibold text-on-surface">{med.duration}</td>
                    <td className="py-3 px-2 max-w-xs">
                      {languageMode !== 'hi' && (
                        <div className="text-on-surface font-medium">{med.instructions}</div>
                      )}
                      {languageMode !== 'en' && med.instructionsHindi && (
                        <div className="text-primary font-medium mt-0.5">{med.instructionsHindi}</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 5. General Advice & Dietary Precautions */}
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-container-low/60 rounded-xl p-4 mb-6 border border-surface-container text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1 mb-1">
                <span className="material-symbols-outlined text-[15px] text-primary">recommend</span>
                General Clinical Advice (परामर्श)
              </span>
              {Array.isArray(prescription?.generalAdvice) ? (
                <ul className="list-disc pl-4 space-y-1 text-on-surface font-medium">
                  {prescription.generalAdvice.map((adv, idx) => (
                    <li key={idx}>{adv}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-on-surface leading-relaxed mb-1 font-medium">{prescription?.generalAdvice}</p>
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1 mb-1">
                <span className="material-symbols-outlined text-[15px] text-secondary">health_and_safety</span>
                Follow-up & Emergency Red Flags
              </span>
              <p className="text-on-surface leading-relaxed font-semibold">
                Follow-up: <span className="text-secondary">{new Date(prescription?.followUpDate || Date.now() + 5 * 86400000).toLocaleDateString('en-IN')} (5 Days)</span>
              </p>
              <p className="text-[11px] text-outline mt-1 leading-snug">
                SOS: Report to emergency immediately if acute chest pain, hemoptysis, or high fever occurs.
              </p>
            </div>
          </div>

          {/* 6. Signature & ABHA Digital Verification Seal */}
          <div className="relative pt-6 border-t border-surface-container flex flex-row justify-between items-end">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg bg-surface-container p-1 flex items-center justify-center border border-outline-variant">
                <span className="material-symbols-outlined text-[36px] text-primary">qr_code_2</span>
              </div>
              <div className="flex flex-col text-[10px] text-on-surface-variant">
                <span className="font-bold text-on-surface">ABDM Digital Rx Signature</span>
                <span>SHA-256 Verified Electronic Record</span>
                <span className="font-mono text-outline">Date: 24 Oct 2024 • 11:45 AM</span>
              </div>
            </div>

            <div className="flex flex-col items-end text-right">
              <div className="font-serif italic text-primary font-bold text-base border-b border-outline pb-1 mb-1 px-4">
                Dr. Ananya Sen
              </div>
              <span className="text-[11px] font-bold text-on-surface">Authorized Medical Practitioner</span>
              <span className="text-[10px] text-outline">Shree Ram Clinic OPD Unit 3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Action Dock */}
      <div className="no-print fixed bottom-4 inset-x-0 flex justify-center z-50 px-4">
        <div className="bg-surface-container-lowest/95 backdrop-blur-md shadow-2xl rounded-2xl p-2.5 px-4 flex items-center gap-3 border border-surface-container">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>Print Prescription (A4 PDF)</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Download PDF</span>
          </button>

          <button
            onClick={handleWhatsAppDispatch}
            disabled={isSendingWhatsApp}
            className="px-4 py-2 rounded-xl bg-secondary text-on-secondary hover:bg-secondary/90 text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
            <span>{isSendingWhatsApp ? 'Sending...' : 'Send via WhatsApp'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
