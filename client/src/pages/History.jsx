import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function History() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('Timeline');

  useEffect(() => {
    fetch(`http://localhost:5000/api/patients/${id}`)
      .then((res) => res.json())
      .then((data) => setPatient(data))
      .catch((err) => console.error(err));
  }, [id]);

  return (
    <div className="flex flex-col w-full pb-20 space-y-4">
      {/* Patient Top Micro-Bar (Quick Identity Anchor) */}
      <div className="w-full bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 border border-surface-container">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/queue')}
            className="w-10 h-10 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="font-headline font-bold text-xl text-on-surface">Medical Record Dossier</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-semibold tracking-wider">
              CONFIDENTIAL EMR
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-9 px-3 rounded-lg bg-surface-container-low text-primary text-xs font-bold flex items-center gap-1.5 border border-primary/20">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span>ABHA Linked: Active</span>
          </div>

          <button
            onClick={() => navigate(`/rx/674000000000000000000201`)}
            className="h-9 px-3.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>View Prescription</span>
          </button>
        </div>
      </div>

      {/* Dual-Pane Clinical Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full items-start">
        {/* LEFT COLUMN: Patient Profile & Baselines */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="relative w-18 h-18 rounded-xl overflow-hidden bg-primary-fixed flex items-center justify-center text-primary font-headline font-bold text-2xl flex-shrink-0 shadow-sm">
                {patient?.name?.slice(0, 2).toUpperCase() || 'RS'}
                <div className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-surface-container-lowest text-primary text-[10px] font-bold shadow-xs">
                  {patient?.bloodGroup || 'B+'}
                </div>
              </div>

              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-headline font-bold text-lg text-on-surface truncate">
                    {patient?.name || 'Ramesh Sharma'}
                  </h2>
                  <span className="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed text-[11px] font-bold">
                    Active
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {patient?.age || 54} y/o {patient?.gender || 'Male'} • DOB: 14 Aug 1970
                </p>
                <div className="mt-1 flex items-center gap-1 text-on-surface-variant text-xs">
                  <span className="material-symbols-outlined text-[15px] text-primary">engineering</span>
                  <span className="truncate">{patient?.occupation || 'Civil Contractor • Dehradun'}</span>
                </div>
              </div>
            </div>

            {/* IDs Micro-Grid */}
            <div className="grid grid-cols-1 gap-2 bg-surface-container-low p-3 rounded-lg text-xs">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant font-medium">UHID</span>
                <span className="font-mono font-bold text-on-surface">{patient?.uhid || 'CLN-2024-8891'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant font-medium">ABHA ID</span>
                <span className="font-mono font-bold text-on-surface">{patient?.abhaId || '91-4820-2918-4912'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant font-medium">Primary Contact</span>
                <span className="font-semibold text-on-surface">{patient?.contact || '+91 98971 23456'}</span>
              </div>
            </div>

            {/* Known Allergies Callout */}
            <div className="bg-error-container/30 border border-error/30 p-3 rounded-xl flex items-start gap-2.5">
              <span className="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">warning</span>
              <div>
                <span className="text-xs font-bold text-error block">STRICT CONTRAINDICATIONS</span>
                <p className="text-xs text-on-error-container font-medium mt-0.5">
                  Severe Penicillin Allergy (urticaria + bronchospasm in 2021). Avoid Amoxicillin, Ampicillin.
                </p>
              </div>
            </div>

            {/* Baseline Conditions */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Chronic Conditions</span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-lg bg-surface-container text-xs font-semibold text-on-surface">
                  Hypertension (Grade 1)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-surface-container text-xs font-semibold text-on-surface">
                  Seasonal Bronchitis
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Medical Timeline & Episodes */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">history</span>
                <h3 className="font-headline font-bold text-base text-on-surface">Clinical Longitudinal Timeline</h3>
              </div>
              <div className="flex items-center gap-1">
                {['Timeline', 'Prescriptions', 'Lab Reports'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      activeTab === t
                        ? 'bg-primary text-on-primary'
                        : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline Stream */}
            <div className="space-y-4 pl-2 border-l-2 border-primary/20">
              {/* Event 1 */}
              <div className="relative pl-6">
                <div className="absolute -left-[1.35rem] top-0 w-4 h-4 rounded-full bg-primary border-4 border-surface"></div>
                <div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-2 border border-surface-container">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary">Today • 24 Oct 2024 (OPD Active)</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-semibold">
                      In Consult
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm text-on-surface">Acute Bronchitis & Persistent Cough</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Patient attended OPD with 10 days history of dry hacking cough and low grade evening fever. Bilateral wheezing auscultated.
                  </p>
                  <div className="pt-2 flex items-center gap-3 text-xs">
                    <span className="font-semibold text-primary">Rx: Azithromycin 500mg, Syr. Ascoril-LS</span>
                  </div>
                </div>
              </div>

              {/* Event 2 */}
              <div className="relative pl-6">
                <div className="absolute -left-[1.35rem] top-0 w-4 h-4 rounded-full bg-outline-variant border-4 border-surface"></div>
                <div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-2 border border-surface-container">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-outline">12 May 2024</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-medium">
                      Routine Follow-up
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm text-on-surface">Hypertension Management & Lipid Profile</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    BP controlled at 126/80 mmHg on Telmisartan 40mg. Serum Creatinine 0.9 mg/dL. Advised regular morning walks and low sodium diet.
                  </p>
                </div>
              </div>

              {/* Event 3 */}
              <div className="relative pl-6">
                <div className="absolute -left-[1.35rem] top-0 w-4 h-4 rounded-full bg-error border-4 border-surface"></div>
                <div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-2 border border-surface-container">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-error">18 Nov 2021 (Allergy Incident)</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-error-container text-on-error-container font-bold">
                      Adverse Drug Reaction
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm text-on-surface">Penicillin Anaphylactoid Reaction</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Developed severe generalized urticaria, facial edema and bronchospasm 20 minutes after ingestion of Amoxicillin-Clav. Treated with IM Hydrocortisone and Adrenaline. Strict permanent warning logged in EMR.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
