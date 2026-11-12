const WebSocket = require('ws');
const EventEmitter = require('events');

/**
 * Bhashini Streaming Speech-to-Text (STT) WebSocket Client
 * Connects to Bhashini's low-latency streaming ASR endpoint for Indian languages.
 * Handles Voice Activity Detection (VAD) state events:
 * - speech_start
 * - speech_pause
 * - speech_resume
 * - speech_end
 */
class BhashiniService extends EventEmitter {
  constructor(options = {}) {
    super();
    this.ws = null;
    this.sourceLanguage = options.sourceLanguage || 'hi'; // Hindi, Garhwali, etc.
    this.consultationId = options.consultationId || null;
    this.apiKey = process.env.BHASHINI_API_KEY || '';
    this.inferenceUrl =
      process.env.BHASHINI_WS_URL ||
      'wss://dhruva-api.bhashini.gov.in/services/inference/stream';
    this.isConnected = false;
  }

  /**
   * Connect to the Bhashini Streaming STT WebSocket API
   */
  connect() {
    // If live credentials are provided in .env, initiate real WS connection
    if (this.apiKey && this.apiKey !== 'YOUR_BHASHINI_API_KEY') {
      try {
        this.ws = new WebSocket(this.inferenceUrl, {
          headers: {
            Authorization: this.apiKey,
            'User-ID': process.env.BHASHINI_USER_ID || '',
          },
        });

        this.ws.on('open', () => {
          this.isConnected = true;
          this.emit('connected');
          // Send initial configuration packet
          this.ws.send(
            JSON.stringify({
              type: 'configure',
              config: {
                language: { sourceLanguage: this.sourceLanguage },
                samplingRate: 16000,
                encoding: 'linear16',
                vad: { enabled: true },
              },
            })
          );
        });

        this.ws.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            this.handleBhashiniMessage(message);
          } catch (err) {
            console.error('[Bhashini WS Parse Error]:', err);
          }
        });

        this.ws.on('error', (err) => {
          console.error('[Bhashini WS Error]:', err.message);
          this.emit('error', err);
        });

        this.ws.on('close', () => {
          this.isConnected = false;
          this.emit('disconnected');
        });

        return;
      } catch (err) {
        console.warn('[Bhashini Connection Failed, using simulation fallback]:', err.message);
      }
    }

    // Default: local mock connection for development without live external keys
    this.isConnected = true;
    setTimeout(() => this.emit('connected'), 50);
  }

  /**
   * Stream binary or base64 audio chunk to Bhashini
   * @param {Buffer|ArrayBuffer|String} audioChunk
   */
  sendAudioChunk(audioChunk) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      if (Buffer.isBuffer(audioChunk) || audioChunk instanceof ArrayBuffer) {
        this.ws.send(audioChunk);
      } else {
        this.ws.send(JSON.stringify({ type: 'audio', chunk: audioChunk }));
      }
      return;
    }

    // Fallback simulation emitting realistic VAD states & transcripts
    this.simulateStreamingResponse();
  }

  /**
   * Handle incoming messages from Bhashini STT stream
   * @param {Object} message
   */
  handleBhashiniMessage(message) {
    // VAD State Machine handling
    if (message.event) {
      switch (message.event) {
        case 'speech_start':
          this.emit('speech_start', message);
          break;
        case 'speech_pause':
          this.emit('speech_pause', message);
          break;
        case 'speech_resume':
          this.emit('speech_resume', message);
          break;
        case 'speech_end':
          this.emit('speech_end', message);
          break;
        default:
          break;
      }
    }

    // Transcript handling: partial vs final
    if (message.output && message.output.length > 0) {
      const text = message.output[0].source || message.output[0].text;
      const isFinal = Boolean(message.isFinal);

      this.emit('transcript', {
        text,
        isFinal,
        language: this.sourceLanguage,
        timestamp: new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      });
    }
  }

  /**
   * Realistic Simulation for Bhashini ASR stream
   */
  simulateStreamingResponse() {
    const mockDialogues = [
      { speaker: 'Doctor', interim: 'Namaste Ramesh ji...', final: 'Namaste Ramesh ji, bataiye pichle kuch dino se kya takleef ho rahi hai?' },
      { speaker: 'Patient', interim: 'Doctor sahiba khansi...', final: 'Doctor sahiba, pichle 10 dino se lagatar sookhi khansi hai aur shaam ko halka bukhar aa jata hai.' },
      { speaker: 'Doctor', interim: 'Kya gale mein jalan...', final: 'Kya khansi ke sath balgam nikalta hai ya gale mein jalan hoti hai?' },
      { speaker: 'Patient', interim: 'Subah balgam aur...', final: 'Haan doctor, subah thoda peela balgam nikalta hai aur chhati mein thoda dard rehta hai.' },
      { speaker: 'Doctor', interim: 'Kisi dawa se allergy...', final: 'Theek hai. Kya aapko kisi dawa se koi allergy hai jaise Penicillin?' },
      { speaker: 'Patient', interim: 'Haan Penicillin se...', final: 'Haan, Penicillin se severe allergy hai! Pichli baar daane aur saans ki takleef ho gayi thi.' },
      { speaker: 'Doctor', interim: 'Noted, Penicillin contraindicated...', final: 'Noted. Bilkul Penicillin nahi denge. Main chest check karti hoon. Deep breath lijiye.' }
    ];

    const pick = mockDialogues[Math.floor(Math.random() * mockDialogues.length)];
    const timestamp = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    // 1. Emit VAD speech_start
    this.emit('speech_start', { timestamp });

    // 2. Emit interim partial transcript (isFinal: false)
    setTimeout(() => {
      this.emit('transcript', {
        speaker: pick.speaker,
        text: pick.interim,
        isFinal: false,
        language: this.sourceLanguage,
        timestamp,
      });
    }, 200);

    // 3. Emit final completed transcript (isFinal: true)
    setTimeout(() => {
      this.emit('transcript', {
        speaker: pick.speaker,
        text: pick.final,
        isFinal: true,
        language: this.sourceLanguage,
        timestamp,
      });
      // 4. Emit speech_end
      this.emit('speech_end', { timestamp });
    }, 600);
  }

  /**
   * Close WebSocket connection when consultation ends
   */
  close() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
      this.ws = null;
    }
    this.isConnected = false;
  }
}

module.exports = BhashiniService;
