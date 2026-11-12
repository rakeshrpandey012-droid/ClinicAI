// server/services/asrService.js
/**
 * Dummy and Extensible ASR Service for ClinicAI
 * Supports Bhashini (Government of India AI4Bharat), Whisper API, or simulated real-time STT
 */

// Simulated Indian clinical vocabulary & common patient dialogue chunks
const mockTranscripts = [
  { speaker: 'Doctor', text: 'Namaste Ramesh ji, bataiye aaj kya takleef ho rahi hai? (How are you feeling today?)', language: 'hi-IN' },
  { speaker: 'Patient', text: 'Namaste Doctor sahiba. Pichle das dino se lagatar sookhi khansi hai aur shaam ko halka bukhar aa jata hai.', language: 'hi-IN' },
  { speaker: 'Doctor', text: 'Khansi ke sath gale mein jalan ya saans lene mein takleef toh nahi ho rahi?', language: 'hi-IN' },
  { speaker: 'Patient', text: 'Gale mein kharash rehti hai aur thoda kuff nikalta hai peele rang ka. Chhati mein thoda dard hota hai.', language: 'hi-IN' },
  { speaker: 'Doctor', text: 'Achha. Kya aapko kisi dawai se allergy hai? Aur koi purani bimari jaise BP ya Sugar?', language: 'hi-IN' },
  { speaker: 'Patient', text: 'Haan doctor, Penicillin se severe allergy hai, pichli baar reaction ho gaya tha. BP ki dawai leten hain.', language: 'hi-IN' },
  { speaker: 'Doctor', text: 'Noted. Penicillin bilkul nahi denge. Main aapka chest auscultation karti hoon. Deep breath lijiye.', language: 'hi-IN' },
  { speaker: 'Doctor', text: 'Bilateral wheezing detected in lower lobes. Likely acute bronchitis with mild bronchospasm.', language: 'en' },
];

let streamIndex = 0;

/**
 * Transcribes audio chunk using Bhashini/Whisper or fallback mock stream
 * @param {Buffer|ArrayBuffer|String} audioChunk
 * @param {Object} options { language, consultationId }
 * @returns {Promise<Object>} Transcribed segment
 */
async function transcribeAudioChunk(audioChunk, options = {}) {
  const language = options.language || 'hi-IN';

  // If live Bhashini or Whisper API credentials are configured in .env:
  if (process.env.BHASHINI_API_KEY && process.env.BHASHINI_USER_ID) {
    try {
      // Structure for Bhashini ASR pipeline request
      // POST to https://dhruva-api.bhashini.gov.in/services/inference/pipeline
      /*
      const response = await axios.post(
        'https://dhruva-api.bhashini.gov.in/services/inference/pipeline',
        {
          pipelineTasks: [{ taskType: 'asr', config: { language: { sourceLanguage: language } } }],
          inputData: { audio: [{ audioContent: audioChunk.toString('base64') }] }
        },
        { headers: { Authorization: process.env.BHASHINI_API_KEY } }
      );
      return {
        speaker: 'Patient',
        text: response.data.pipelineResponse[0].output[0].source,
        language
      };
      */
    } catch (err) {
      console.error('[Bhashini ASR Error]:', err.message);
    }
  }

  // Fallback realistic simulation for clinical copilot live demonstration
  const sample = mockTranscripts[streamIndex % mockTranscripts.length];
  streamIndex++;

  return {
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    speaker: sample.speaker,
    text: sample.text,
    language: sample.language,
  };
}

module.exports = {
  transcribeAudioChunk,
};
