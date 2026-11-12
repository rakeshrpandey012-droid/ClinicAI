import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../services/socket';

export default function Consultation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [consultation, setConsultation] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [activeLang, setActiveLang] = useState('hi-IN');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [soapNote, setSoapNote] = useState({ subjective: '', objective: '', assessment: '', plan: '' });
  const [allergyAlert, setAllergyAlert] = useState(null);
  const [vadState, setVadState] = useState('Idle');

  // Waveform canvas & audio analysis
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationFrameRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const transcriptBottomRef = useRef(null);

  // Fetch Patient & Consult Context
  useEffect(() => {
    fetch(`http://localhost:5000/api/patients/${id}`)
      .then((res) => res.json())
      .then((data) => setPatient(data?.patient || data))
      .catch((err) => console.error(err));

    fetch(`http://localhost:5000/api/consultations/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setConsultation(data);
        if (data.transcript) setTranscript(data.transcript);
        if (data.soapNote) {
          setSoapNote({
            subjective: data.soapNote.subjective || data.soapNote.S || '',
            objective: data.soapNote.objective || data.soapNote.O || '',
            assessment: data.soapNote.assessment || data.soapNote.A || '',
            plan: data.soapNote.plan || data.soapNote.P || '',
          });
        }
      })
      .catch((err) => console.error(err));

    // Connect Socket.io room
    socket.emit('join_consultation', { consultationId: id, patientId: id, language: activeLang });

    socket.on('transcript_update', (newSegment) => {
      setTranscript((prev) => {
        // If it's a replacement or new segment
        if (newSegment.isFinal === false) {
          const last = prev[prev.length - 1];
          if (last && last.isFinal === false) {
            return [...prev.slice(0, -1), newSegment];
          }
        }
        return [...prev, newSegment];
      });
    });

    socket.on('vad_state', (data) => {
      setVadState(data.state || 'Listening');
    });

    socket.on('soap_update', (aiData) => {
      if (aiData.soapNote) setSoapNote(aiData.soapNote);
      if (aiData.allergyAlert) setAllergyAlert(aiData.allergyAlert);
      setIsGeneratingAi(false);
    });

    return () => {
      socket.off('transcript_update');
      socket.off('vad_state');
      socket.off('soap_update');
      stopAudioRecording();
    };
  }, [id, activeLang]);

  useEffect(() => {
    transcriptBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Audio Waveform Visualization Loop
  const drawWaveform = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = dataArrayRef.current;

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = '#faf8ff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#006194';
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    render();
  };

  // Audio Recording with MediaRecorder API emitting in 1-second chunks
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // AudioContext + Analyser for Real-time Waveform
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      analyser.fftSize = 256;
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          // Emit audio chunk to backend Socket.io
          socket.emit('audio_stream_chunk', {
            chunk: event.data,
            consultationId: consultation?._id || id,
            language: activeLang,
          });
        }
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      drawWaveform();
    } catch (err) {
      console.warn('Microphone permission fallback mode:', err.message);
      setIsRecording(true);
      // Simulated interval emission
      const timer = setInterval(() => {
        socket.emit('audio_stream_chunk', {
          chunk: 'simulated_pcm_16khz_buffer',
          consultationId: consultation?._id || id,
          language: activeLang,
        });
      }, 1000);
      audioContextRef.current = timer;
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream?.getTracks().forEach((track) => track.stop());
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current && typeof audioContextRef.current.close === 'function') {
      audioContextRef.current.close();
    } else if (audioContextRef.current) {
      clearInterval(audioContextRef.current);
    }
    setIsRecording(false);
  };

  // Quick symptom insertion chips
  const addQuickSymptom = (symptomText) => {
    const entry = {
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      speaker: 'Doctor',
      text: symptomText,
      language: 'en',
      isFinal: true,
    };
    setTranscript((prev) => [...prev, entry]);
  };

  // Generate AI SOAP Notes and Prescriptions via Gemini
  const handleGenerateAiSoap = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch(`http://localhost:5000/api/consultations/${consultation?._id || id}/extract-soap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.soapNote) setSoapNote(data.soapNote);
      if (data.allergyAlert) setAllergyAlert(data.allergyAlert);
    } catch (err) {
      console.error('AI generation error:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-20 space-y-4">
      {/* Allergy Alert Banner if detected */}
      {allergyAlert && (
        <div className="p-3 bg-error-container text-on-error-container rounded-xl flex items-center justify-between text-xs font-bold border border-error/30 shadow-sm animate-pulse">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">warning</span>
            <span>{allergyAlert}</span>
          </div>
          <button onClick={() => setAllergyAlert(null)}>✕</button>
        </div>
      )}

      {/* 1. PATIENT CONTEXT & TRIAGE TOP STRIP */}
      <section className="w-full bg-surface-container-lowest rounded-xl shadow-sm p-4 sm:p-5 flex flex-col gap-3 border border-surface-container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary font-headline font-bold text-xl shrink-0">
              {patient?.name?.slice(0, 2).toUpperCase() || 'RS'}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-headline font-bold text-xl text-on-surface truncate">
                  {patient?.name || 'Ramesh Sharma'}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-semibold">
                  {patient?.age || 54} y/o {patient?.gender || 'Male'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface text-xs font-mono font-medium">
                  UHID: {patient?.uhid || 'CLN-2024-8891'}
                </span>
              </div>
              <p className="text-sm text-on-surface-variant truncate mt-0.5">
                <span className="font-semibold text-on-surface">Chief Complaint:</span> {patient?.chiefComplaint || 'Persistent dry cough × 10d, evening fever'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-error-container text-on-error-container shrink-0 self-start sm:self-center border border-error/20">
            <span className="material-symbols-outlined text-[20px]">warning</span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-on-error-container">Known Allergies</span>
              <span className="text-xs font-bold">{patient?.knownAllergies?.join(', ') || 'Penicillin (Severe)'}</span>
            </div>
          </div>
        </div>

        {/* Live Vitals Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-surface-container">
          <div className="flex items-center gap-2 bg-surface-container-low px-3 py-2 rounded-lg">
            <span className="material-symbols-outlined text-primary text-[20px]">speed</span>
            <div className="flex flex-col">
              <span className="text-[11px] text-on-surface-variant">BP (mmHg)</span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-on-surface">{patient?.vitals?.bp || '130/82'}</span>
                <span className="text-[10px] text-secondary font-semibold">Normal</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-surface-container-low px-3 py-2 rounded-lg">
            <span className="material-symbols-outlined text-tertiary text-[20px]">favorite</span>
            <div className="flex flex-col">
              <span className="text-[11px] text-on-surface-variant">Pulse Rate</span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-on-surface">{patient?.vitals?.pulse || 78}</span>
                <span className="text-[10px] text-on-surface-variant font-medium">bpm</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-surface-container-low px-3 py-2 rounded-lg">
            <span className="material-symbols-outlined text-secondary text-[20px]">air</span>
            <div className="flex flex-col">
              <span className="text-[11px] text-on-surface-variant">SpO2</span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-secondary">{patient?.vitals?.spo2 || 98}%</span>
                <span className="text-[10px] text-secondary font-semibold">Good</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-surface-container-low px-3 py-2 rounded-lg">
            <span className="material-symbols-outlined text-outline text-[20px]">device_thermostat</span>
            <div className="flex flex-col">
              <span className="text-[11px] text-on-surface-variant">Body Temp</span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-on-surface">{patient?.vitals?.temp || '98.4°F'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-surface-container-low px-3 py-2 rounded-lg">
            <span className="material-symbols-outlined text-primary text-[20px]">weight</span>
            <div className="flex flex-col">
              <span className="text-[11px] text-on-surface-variant">Weight</span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-on-surface">{patient?.vitals?.weight || '72 kg'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DUAL-PANE WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full items-start">
        {/* LEFT COLUMN: REAL-TIME MULTILINGUAL TRANSCRIPT & ASR */}
        <section className="lg:col-span-7 flex flex-col bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container h-[660px] overflow-hidden">
          {/* Header Bar */}
          <div className="p-3 px-4 bg-surface-container-low flex items-center justify-between border-b border-surface-container">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isRecording ? 'bg-error animate-ping' : 'bg-outline-variant'}`}></span>
              <span className="font-headline font-bold text-sm text-on-surface">
                {isRecording ? 'Bhashini Real-Time ASR Stream' : 'Consultation Audio Stream'}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-surface-container text-secondary font-mono font-bold">
                VAD: {vadState}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {['hi-IN', 'en', 'garh'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                    activeLang === lang
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Clinical Chips */}
          <div className="p-2 px-3 bg-surface-container-low/40 border-b border-surface-container flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-outline font-semibold">Quick Chips:</span>
            {[
              'Persistent dry cough × 10d',
              'Evening fever',
              'Bilateral wheezing in lower lobes',
              'Penicillin allergy confirmed',
              'BP 130/82 mmHg',
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => addQuickSymptom(chip)}
                className="px-2 py-0.5 rounded-full bg-surface-container hover:bg-primary-container hover:text-on-primary-container text-on-surface whitespace-nowrap transition-colors"
              >
                + {chip}
              </button>
            ))}
          </div>

          {/* Transcript Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-surface/50">
            {transcript.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-outline">
                <span className="material-symbols-outlined text-[48px] mb-2 text-outline-variant">mic_none</span>
                <p className="font-semibold text-sm">Awaiting consultation speech.</p>
                <p className="text-xs mt-1 max-w-sm">
                  Click "Start Ambient Recording" to stream 1-second chunks through Bhashini Streaming STT.
                </p>
              </div>
            ) : (
              transcript.map((item, idx) => {
                const isDoc = item.speaker === 'Doctor';
                return (
                  <div key={idx} className={`flex flex-col ${isDoc ? 'items-end' : 'items-start'} transition-all`}>
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className={`text-[11px] font-bold ${isDoc ? 'text-primary' : 'text-secondary'}`}>
                        {item.speaker || 'Speaker'}
                      </span>
                      <span className="text-[10px] text-outline">• {item.timestamp}</span>
                      {item.isFinal === false && (
                        <span className="text-[9px] px-1 rounded bg-secondary-container text-on-secondary-container font-semibold animate-pulse">
                          Interim
                        </span>
                      )}
                    </div>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-xs ${
                        isDoc
                          ? 'bg-primary-container text-on-primary-container rounded-tr-xs'
                          : 'bg-surface-container text-on-surface rounded-tl-xs'
                      }`}
                    >
                      {item.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={transcriptBottomRef} />
          </div>

          {/* Live Waveform Canvas & Controls */}
          <div className="p-3 px-4 bg-surface-container-lowest border-t border-surface-container flex flex-col gap-2">
            {isRecording && (
              <canvas
                ref={canvasRef}
                width={500}
                height={36}
                className="w-full h-9 rounded-lg bg-surface border border-surface-container"
              />
            )}

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={isRecording ? stopAudioRecording : startAudioRecording}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all ${
                  isRecording
                    ? 'bg-error text-on-error hover:bg-error/90 animate-pulse'
                    : 'bg-primary text-on-primary hover:bg-primary-container'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isRecording ? 'stop_circle' : 'mic'}
                </span>
                <span>{isRecording ? 'Stop Recording' : 'Start Ambient Recording'}</span>
              </button>

              <button
                onClick={handleGenerateAiSoap}
                disabled={isGeneratingAi}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-secondary text-on-secondary hover:bg-secondary/90 flex items-center gap-1.5 shadow-sm disabled:opacity-50 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isGeneratingAi ? 'autorenew' : 'auto_awesome'}
                </span>
                <span>{isGeneratingAi ? 'Extracting via Gemini...' : 'Extract Clinical SOAP'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: AI SOAP NOTES & DISCHARGE */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">clinical_notes</span>
                <h2 className="font-headline font-bold text-base text-on-surface">Structured SOAP Notes</h2>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed">
                Gemini Medical AI
              </span>
            </div>

            {/* Subjective */}
            <div className="bg-surface-container-low p-3 rounded-lg flex flex-col gap-1 border border-surface-container/60">
              <span className="text-xs font-bold text-primary uppercase tracking-wide">
                [S] Subjective (History of Present Illness)
              </span>
              <textarea
                rows={2}
                value={soapNote.subjective}
                onChange={(e) => setSoapNote({ ...soapNote, subjective: e.target.value })}
                placeholder="Patient symptoms, onset, allergies..."
                className="w-full bg-transparent text-xs text-on-surface outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Objective */}
            <div className="bg-surface-container-low p-3 rounded-lg flex flex-col gap-1 border border-surface-container/60">
              <span className="text-xs font-bold text-secondary uppercase tracking-wide">
                [O] Objective (Physical Exam & Vitals)
              </span>
              <textarea
                rows={2}
                value={soapNote.objective}
                onChange={(e) => setSoapNote({ ...soapNote, objective: e.target.value })}
                placeholder="Auscultation, vitals, exam..."
                className="w-full bg-transparent text-xs text-on-surface outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Assessment */}
            <div className="bg-surface-container-low p-3 rounded-lg flex flex-col gap-1 border border-surface-container/60">
              <span className="text-xs font-bold text-tertiary uppercase tracking-wide">
                [A] Assessment (Clinical Diagnosis & ICD-10)
              </span>
              <textarea
                rows={2}
                value={soapNote.assessment}
                onChange={(e) => setSoapNote({ ...soapNote, assessment: e.target.value })}
                placeholder="Primary clinical impression..."
                className="w-full bg-transparent text-xs text-on-surface outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Plan */}
            <div className="bg-surface-container-low p-3 rounded-lg flex flex-col gap-1 border border-surface-container/60">
              <span className="text-xs font-bold text-primary-container uppercase tracking-wide">
                [P] Plan (Therapeutics & Diagnostics)
              </span>
              <textarea
                rows={3}
                value={soapNote.plan}
                onChange={(e) => setSoapNote({ ...soapNote, plan: e.target.value })}
                placeholder="Medication regimen, lifestyle, follow-up..."
                className="w-full bg-transparent text-xs text-on-surface outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                onClick={() => navigate(`/history/${patient?._id || id}`)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">folder_open</span>
                <span>Past Records</span>
              </button>

              <button
                onClick={() => navigate(`/rx/674000000000000000000201`)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-on-primary hover:bg-primary-container flex items-center gap-1.5 shadow-sm transition-all"
              >
                <span>Finalize & Preview Rx</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
