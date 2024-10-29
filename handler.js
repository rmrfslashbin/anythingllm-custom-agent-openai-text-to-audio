// file: handler.js
const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');

// Simple rate limiting mechanism
const rateLimiter = {
  queue: [],
  lastCallTime: 0,
  minInterval: 1000 / 3, // 3 requests per second

  async call(fn, ...args) {
    const now = Date.now();
    if (now - this.lastCallTime < this.minInterval) {
      await new Promise(resolve => setTimeout(resolve, this.minInterval - (now - this.lastCallTime)));
    }
    this.lastCallTime = Date.now();
    return fn(...args);
  }
};

const runtime = {
  handler: async function ({ text }) {
    const callerId = `${this.config.name}-v${this.config.version}`;
    this.introspect(`${callerId} called with text input of length ${text ? text.length : 0} characters...`);

    try {
      // Input validation
      if (!text || typeof text !== 'string') {
        throw new Error('Invalid input: Text must be a non-empty string.');
      }
      if (text.length > 4096) {
        throw new Error(`Text exceeds maximum length: ${text.length} characters (max: 4096).`);
      }
      if (text.length < 3) {
        throw new Error(`Text is too short: ${text.length} characters (min: 3).`);
      }

      // Runtime args validation
      const requiredArgs = ['OPENAI_API_KEY', 'OUTPUT_DIRECTORY'];
      for (const arg of requiredArgs) {
        if (!this.runtimeArgs[arg]) {
          throw new Error(`Missing required runtime argument: ${arg}`);
        }
      }

      // OpenAI API parameters validation
      const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
      const validFormats = ['mp3', 'opus', 'aac', 'flac', 'wav', 'pcm'];
      const voice = this.runtimeArgs.OPENAI_TTS_VOICE || 'alloy';
      const format = this.runtimeArgs.AUDIO_FORMAT || 'mp3';
      const speed = parseFloat(this.runtimeArgs.AUDIO_SPEED) || 1.0;

      if (!validVoices.includes(voice)) {
        throw new Error(`Invalid voice: ${voice}. Must be one of: ${validVoices.join(', ')}`);
      }
      if (!validFormats.includes(format)) {
        throw new Error(`Invalid audio format: ${format}. Must be one of: ${validFormats.join(', ')}`);
      }
      if (speed < 0.25 || speed > 4.0) {
        throw new Error(`Invalid speed: ${speed}. Must be between 0.25 and 4.0`);
      }

      // Create OUTPUT_DIRECTORY if it doesn't exist
      await fs.mkdir(this.runtimeArgs.OUTPUT_DIRECTORY, { recursive: true });
      this.introspect(`Ensured output directory exists: ${this.runtimeArgs.OUTPUT_DIRECTORY}`);

      const openai = new OpenAI({ apiKey: this.runtimeArgs.OPENAI_API_KEY });

      this.introspect(`Converting text to audio with voice: ${voice}, format: ${format}, speed: ${speed}...`);

      const startTime = Date.now();
      const audioResponse = await rateLimiter.call(openai.audio.speech.create.bind(openai.audio.speech), {
        model: this.runtimeArgs.OPENAI_TTS_MODEL || 'tts-1',
        voice: voice,
        input: text,
        response_format: format,
        speed: speed
      });
      const endTime = Date.now();

      const buffer = Buffer.from(await audioResponse.arrayBuffer());
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const filename = `${timestamp}.${format}`;
      const outputPath = path.join(this.runtimeArgs.OUTPUT_DIRECTORY, filename);

      await fs.writeFile(outputPath, buffer);

      const wordCount = text.split(/\s+/).length;
      const conversionTime = (endTime - startTime) / 1000; // in seconds
      const estimatedDuration = (wordCount / 150) / speed; // Assuming average speaking rate of 150 words per minute

      this.introspect(`Audio file created successfully:
        - Size: ${buffer.length} bytes
        - Word count: ${wordCount}
        - Conversion time: ${conversionTime.toFixed(2)} seconds
        - Estimated duration: ${estimatedDuration.toFixed(2)} seconds
        - Format: ${format}
        - Voice: ${voice}
        - Speed: ${speed}x`);

      return `Audio file created successfully. Saved as: ${outputPath}`;
    } catch (error) {
      this.introspect(`${callerId} failed: ${error.message}`);
      this.logger('Error details:', {
        error: error.message,
        stack: error.stack,
        code: error.code,
        type: error.type,
        param: error.param,
        statusCode: error.statusCode,
        requestId: error.requestId
      });

      if (error.response) {
        this.logger('API Response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          data: error.response.data
        });
      }

      if (error.response && error.response.status === 429) {
        return `Error: API rate limit exceeded. Please try again later. Details: ${error.message}`;
      }

      return `Error in text-to-speech conversion: ${error.message}`;
    }
  }
};

module.exports = {
  runtime,
  rateLimiter
};
