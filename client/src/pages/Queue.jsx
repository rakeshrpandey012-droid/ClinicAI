import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Queue() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeAnnouncement, setActiveAnnouncement] = useState(null);

  // New Patient Form State
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    contact: '',
    bloodGroup: 'B+',
    chiefComplaint: '',
    knownAllergies: '',
    triageCategory: 'Standard',
    bp: '120/80',
    pulse: '76',
    spo2: '98',
  });

  const fetchPatients = () => {
    fetch('http://localhost:5000/api/patients/queue')
      .then((res) => res.json())
      .then((data) => {
        setPatients(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch queue error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Web Speech API Voice Token Announcement for Indian OPD Clinics
  const announceToken = (patient) => {
    const message = `Token number ${patient.tokenNumber}. Patient ${patient.name}. Please proceed to OPD Room 3.`;
    setActiveAnnouncement(message);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }

    setTimeout(() => setActiveAnnouncement(null), 6000);
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/patients/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          knownAllergies: formData.knownAllergies ? formData.knownAllergies.split(',').map((s) => s.trim()) : [],
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormData({
          name: '',
          age: '',
          gender: 'Male',
          contact: '',
          bloodGroup: 'B+',
          chiefComplaint: '',
          knownAllergies: '',
          triageCategory: 'Standard',
          bp: '120/80',
          pulse: '76',
          spo2: '98',
        });
        fetchPatients();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPatients = patients.filter((p) => {
    const matchesFilter = filter === 'All' || p.triageCategory === filter || p.status === filter;
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.uhid?.toLowerCase().includes(search.toLowerCase()) ||
      p.chiefComplaint?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col w-full pb-20">
      {/* Voice Announcement Banner */}
      {activeAnnouncement && (
        <div className="mb-4 p-3 bg-primary text-on-primary rounded-xl flex items-center justify-between shadow-md animate-bounce">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">campaign</span>
            <span className="text-xs font-bold uppercase tracking-wider">Acoustic Token Announcer:</span>
            <span className="text-xs font-semibold">{activeAnnouncement}</span>
          </div>
          <button onClick={() => setActiveAnnouncement(null)} className="text-xs font-bold px-2">✕</button>
        </div>
      )}

      {/* Top Triage Strip & Clinic Ambient Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-on-primary shadow-sm">
            <span className="material-symbols-outlined text-[28px]">fluid_med</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline font-bold text-2xl text-on-surface">OPD Patient Triage & Intake</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary text-xs font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping"></span>
                Real-Time ASR Engine
              </span>
            </div>
            <p className="text-sm text-on-surface-variant">Live Acoustic Queue Monitor • Automated Triaging • Shree Ram Clinic Unit 3</p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="h-10 px-4 rounded-xl bg-primary text-on-primary hover:bg-primary-container text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>New Patient Walk-in</span>
          </button>

          <div className="flex items-center bg-surface-container px-3.5 py-1.5 rounded-xl shadow-sm text-sm">
            <span className="material-symbols-outlined text-primary text-[20px] mr-1.5">calendar_today</span>
            <span className="font-medium text-on-surface">Today, 24 Oct 2024</span>
            <span className="mx-2 text-outline-variant">•</span>
            <span className="text-xs font-bold text-secondary">11:32 AM IST</span>
          </div>

          <button 
            onClick={fetchPatients}
            className="w-10 h-10 rounded-xl bg-surface-container-lowest text-primary flex items-center justify-center shadow-sm hover:bg-surface-container transition-colors"
            title="Force Sync Queue"
          >
            <span className="material-symbols-outlined text-[20px]">sync</span>
          </button>
        </div>
      </div>

      {/* Metric Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden border border-surface-container">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-on-surface-variant font-bold">Total Scheduled</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-headline font-bold text-3xl text-on-surface">{patients.length + 24}</span>
                <span className="text-xs text-on-surface-variant font-medium">Registered</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container-low text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">groups</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 pt-1 text-xs text-on-surface-variant">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary"></span> 14 OPD</span>
            <span>•</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary"></span> 8 Follow-up</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden border border-surface-container">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-on-surface-variant font-bold">In Consultation</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-headline font-bold text-3xl text-primary">01</span>
                <span className="text-xs text-on-surface-variant font-medium">Active Room 3</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">stethoscope</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 pt-1 text-xs text-on-surface-variant">
            <span className="text-primary font-semibold">Ramesh Sharma (54M)</span>
            <span>•</span>
            <span>12 mins in</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden border border-surface-container">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-on-surface-variant font-bold">Waiting in Lobby</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-headline font-bold text-3xl text-secondary">0{patients.length}</span>
                <span className="text-xs text-on-surface-variant font-medium">Avg wait: 8 min</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-secondary-container/30 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">hourglass_top</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 pt-1 text-xs text-on-surface-variant">
            <span className="text-tertiary font-bold">1 High Priority Flag</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden border border-surface-container">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-on-surface-variant font-bold">Completed & Dispensed</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-headline font-bold text-3xl text-on-surface">20</span>
                <span className="text-xs text-on-surface-variant font-medium">Rx Printed</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container-low text-on-surface-variant flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">task_alt</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 pt-1 text-xs text-on-surface-variant">
            <span className="text-secondary font-medium">100% ABHA Linked</span>
          </div>
        </div>
      </div>

      {/* Table & Controls Section */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-4 sm:p-6 border border-surface-container">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2 w-full md:w-80 bg-surface-container-low px-3 py-2 rounded-xl">
            <span className="material-symbols-outlined text-outline text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search patient, UHID or symptom..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm w-full outline-none text-on-surface placeholder:text-outline"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['All', 'Urgent', 'Standard', 'Critical', 'Follow-up'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  filter === tab
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Patient Queue List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-surface-container text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                <th className="py-3 px-3">Token</th>
                <th className="py-3 px-3">Patient Details</th>
                <th className="py-3 px-3">Chief Complaint</th>
                <th className="py-3 px-3">Vitals</th>
                <th className="py-3 px-3">Known Allergies</th>
                <th className="py-3 px-3">Triage</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {filteredPatients.map((patient) => {
                const isCurrent = patient.status === 'In Consult';
                const isCritical = patient.triageCategory === 'Critical';

                return (
                  <tr
                    key={patient._id}
                    className={`hover:bg-surface-container-low/60 transition-colors ${
                      isCurrent ? 'bg-primary-fixed/20' : ''
                    }`}
                  >
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-xs ${
                        isCurrent
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container text-on-surface'
                      }`}>
                        #{patient.tokenNumber}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary font-bold text-xs">
                          {patient.name?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-on-surface flex items-center gap-1.5">
                            {patient.name}
                            <span className="text-xs font-normal text-on-surface-variant">
                              ({patient.age}y / {patient.gender?.[0]})
                            </span>
                          </div>
                          <div className="text-[11px] text-outline flex items-center gap-1">
                            <span>UHID: {patient.uhid}</span>
                            <span>•</span>
                            <span>{patient.city || 'Dehradun'}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 max-w-xs">
                      <p className="text-xs text-on-surface-variant truncate">
                        {patient.chiefComplaint}
                      </p>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="text-xs text-on-surface font-medium">
                        BP: <span className="font-bold">{patient.vitals?.bp || '120/80'}</span>
                      </div>
                      <div className="text-[11px] text-on-surface-variant">
                        SpO2: <span className="text-secondary font-bold">{patient.vitals?.spo2 || 98}%</span> • HR: {patient.vitals?.pulse || 76}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      {patient.knownAllergies?.length > 0 && patient.knownAllergies[0] !== 'None Reported' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-error-container text-on-error-container text-xs font-bold">
                          <span className="material-symbols-outlined text-[14px]">warning</span>
                          {patient.knownAllergies.join(', ')}
                        </span>
                      ) : (
                        <span className="text-xs text-outline">None</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                        isCritical
                          ? 'bg-tertiary-container text-on-tertiary-container'
                          : patient.triageCategory === 'Urgent'
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}>
                        {patient.triageCategory || 'Standard'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => announceToken(patient)}
                          className="p-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-secondary transition-colors"
                          title="Call token out loud (Voice Announcer)"
                        >
                          <span className="material-symbols-outlined text-[18px]">volume_up</span>
                        </button>

                        <button
                          onClick={() => navigate(`/history/${patient._id}`)}
                          className="p-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors"
                          title="View Dossier & EMR History"
                        >
                          <span className="material-symbols-outlined text-[18px]">folder_shared</span>
                        </button>

                        <button
                          onClick={() => navigate(`/consult/${patient._id}`)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition-all ${
                            isCurrent
                              ? 'bg-primary text-on-primary hover:bg-primary-container'
                              : 'bg-primary-fixed text-on-primary-fixed hover:bg-primary hover:text-on-primary'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {isCurrent ? 'headset_mic' : 'stethoscope'}
                          </span>
                          <span>{isCurrent ? 'In Consult' : 'Start Consult'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Patient Registration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-surface-container animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">person_add</span>
                <h3 className="font-headline font-bold text-lg text-on-surface">New OPD Walk-in Registration</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-on-surface-variant hover:text-on-surface">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-on-surface block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Deepak Negi"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-surface-container-low px-3 py-2 rounded-lg outline-none text-on-surface"
                  />
                </div>
                <div>
                  <label className="font-bold text-on-surface block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98000 00000"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full bg-surface-container-low px-3 py-2 rounded-lg outline-none text-on-surface"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-on-surface block mb-1">Age (Years)</label>
                  <input
                    type="number"
                    required
                    placeholder="42"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full bg-surface-container-low px-3 py-2 rounded-lg outline-none text-on-surface"
                  />
                </div>
                <div>
                  <label className="font-bold text-on-surface block mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-surface-container-low px-3 py-2 rounded-lg outline-none text-on-surface"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-on-surface block mb-1">Triage Priority</label>
                  <select
                    value={formData.triageCategory}
                    onChange={(e) => setFormData({ ...formData, triageCategory: e.target.value })}
                    className="w-full bg-surface-container-low px-3 py-2 rounded-lg outline-none text-on-surface"
                  >
                    <option>Standard</option>
                    <option>Urgent</option>
                    <option>Critical</option>
                    <option>Follow-up</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-on-surface block mb-1">Chief Complaint (Presenting symptoms)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sore throat, dry cough and mild fever × 4 days"
                  value={formData.chiefComplaint}
                  onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                  className="w-full bg-surface-container-low px-3 py-2 rounded-lg outline-none text-on-surface"
                />
              </div>

              <div>
                <label className="font-bold text-error block mb-1">Known Allergies (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Sulfa, Dust"
                  value={formData.knownAllergies}
                  onChange={(e) => setFormData({ ...formData, knownAllergies: e.target.value })}
                  className="w-full bg-surface-container-low px-3 py-2 rounded-lg outline-none text-on-surface border border-error/30"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="font-bold text-on-surface block mb-1">BP (mmHg)</label>
                  <input
                    type="text"
                    value={formData.bp}
                    onChange={(e) => setFormData({ ...formData, bp: e.target.value })}
                    className="w-full bg-surface-container-low px-3 py-2 rounded-lg outline-none text-on-surface"
                  />
                </div>
                <div>
                  <label className="font-bold text-on-surface block mb-1">Pulse (bpm)</label>
                  <input
                    type="number"
                    value={formData.pulse}
                    onChange={(e) => setFormData({ ...formData, pulse: e.target.value })}
                    className="w-full bg-surface-container-low px-3 py-2 rounded-lg outline-none text-on-surface"
                  />
                </div>
                <div>
                  <label className="font-bold text-on-surface block mb-1">SpO2 (%)</label>
                  <input
                    type="number"
                    value={formData.spo2}
                    onChange={(e) => setFormData({ ...formData, spo2: e.target.value })}
                    className="w-full bg-surface-container-low px-3 py-2 rounded-lg outline-none text-on-surface"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-bold shadow-sm"
                >
                  Generate Token & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
