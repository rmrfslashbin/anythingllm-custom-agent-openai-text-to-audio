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

module.exports.runtime = {
  handler: async function ({ text }) {
    const callerId = `${this.config.name}-v${this.config.version}`;
    this.introspect(`${callerId} called with text input of length ${text ? text.length : 0} characters...`);

    // Input validation
    if (!text || typeof text !== 'string') {
      this.introspect(`${callerId} failed: Invalid input. Text must be a non-empty string.`);
      return "Error: Invalid input. Text must be a non-empty string.";
    }
    if (text.length > 4096) {
      this.introspect(`${callerId} failed: Text exceeds maximum length of 4096 characters.`);
      return "Error: Text exceeds maximum length of 4096 characters.";
    }
    if (text.length < 3) {
      this.introspect(`${callerId} failed: Text is too short. Minimum length is 3 characters.`);
      return "Error: Text is too short. Minimum length is 3 characters.";
    }

    // Runtime args validation
    const requiredArgs = ['OPENAI_API_KEY', 'OUTPUT_DIRECTORY'];
    for (const arg of requiredArgs) {
      if (!this.runtimeArgs[arg]) {
        this.introspect(`${callerId} failed: Missing required runtime argument: ${arg}`);
        return `Error: Missing required runtime argument: ${arg}`;
      }
    }

    // OpenAI API parameters validation
    const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    const validFormats = ['mp3', 'opus', 'aac', 'flac', 'wav', 'pcm'];
    const voice = this.runtimeArgs.OPENAI_TTS_VOICE || 'alloy';
    const format = this.runtimeArgs.AUDIO_FORMAT || 'mp3';
    const speed = parseFloat(this.runtimeArgs.AUDIO_SPEED) || 1.0;

    if (!validVoices.includes(voice)) {
      this.introspect(`${callerId} failed: Invalid voice specified.`);
      return `Error: Invalid voice. Must be one of: ${validVoices.join(', ')}`;
    }
    if (!validFormats.includes(format)) {
      this.introspect(`${callerId} failed: Invalid audio format specified.`);
      return `Error: Invalid audio format. Must be one of: ${validFormats.join(', ')}`;
    }
    if (speed < 0.25 || speed > 4.0) {
      this.introspect(`${callerId} failed: Invalid speed specified.`);
      return "Error: Speed must be between 0.25 and 4.0";
    }

    try {
      // Create OUTPUT_DIRECTORY if it doesn't exist
      await fs.mkdir(this.runtimeArgs.OUTPUT_DIRECTORY, { recursive: true });
      this.introspect(`Ensured output directory exists: ${this.runtimeArgs.OUTPUT_DIRECTORY}`);
    } catch (error) {
      this.introspect(`${callerId} failed: Unable to create or access OUTPUT_DIRECTORY.`);
      return `Error: Failed to create or access OUTPUT_DIRECTORY (${this.runtimeArgs.OUTPUT_DIRECTORY}). ${error.message}`;
    }

    try {
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
      this.introspect(`${callerId} failed: Error in text-to-speech conversion.`);
      this.logger('Error in text-to-speech conversion:', error);

      if (error.response && error.response.status === 429) {
        return `Error: API rate limit exceeded. Please try again later.`;
      }

      return `Error in text-to-speech conversion: ${error.message}`;
    }
  }
};
