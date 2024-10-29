// file: test.js
const { runtime } = require('./handler');
const fs = require('fs').promises;
const path = require('path');

async function ensureDirectoryExists(directory) {
  try {
    await fs.access(directory);
  } catch (error) {
    await fs.mkdir(directory, { recursive: true });
  }
}

async function test() {
  const baseRuntimeArgs = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_TTS_MODEL: 'tts-1',
    OPENAI_TTS_VOICE: 'alloy',
    OUTPUT_DIRECTORY: './test-output',
    AUDIO_FORMAT: 'mp3',
    AUDIO_SPEED: 1.0
  };

  // Ensure the output directory exists
  await ensureDirectoryExists(baseRuntimeArgs.OUTPUT_DIRECTORY);

  const testCases = [
    {
      name: "Basic test",
      text: "Hello, world! This is a test of the OpenAI text-to-audio agent.",
      runtimeArgs: {}
    },
    {
      name: "Long text test",
      text: "This is a very long text that exceeds the maximum length of 4096 characters. ".repeat(100),
      runtimeArgs: {}
    },
    {
      name: "Different voice test",
      text: "This is a test with a different voice.",
      runtimeArgs: { OPENAI_TTS_VOICE: 'nova' }
    },
    {
      name: "Different format test",
      text: "This is a test with a different audio format.",
      runtimeArgs: { AUDIO_FORMAT: 'wav' }
    },
    {
      name: "Speed test - fast",
      text: "This is a fast speech test.",
      runtimeArgs: { AUDIO_SPEED: 2.0 }
    },
    {
      name: "Speed test - slow",
      text: "This is a slow speech test.",
      runtimeArgs: { AUDIO_SPEED: 0.5 }
    },
    {
      name: "Invalid output directory test",
      text: "This should fail due to an invalid output directory.",
      runtimeArgs: { OUTPUT_DIRECTORY: '/invalid/directory' }
    },
    {
      name: "Very short input test",
      text: "Hi",
      runtimeArgs: {}
    },
    {
      name: "Maximum allowed text length",
      text: "A".repeat(4095),
      runtimeArgs: {}
    },
    {
      name: "Text with special characters",
      text: "Hello! This text includes special characters: @#$%^&*()_+{}[]|\\:;\"'<>,.?/~`",
      runtimeArgs: {}
    },
    {
      name: "Non-English text",
      text: "こんにちは、世界！Bonjour le monde! Hola Mundo! Здравствуй, мир!",
      runtimeArgs: {}
    },
    {
      name: "All voices test",
      text: "This is a test of all available voices.",
      runtimeArgs: { OPENAI_TTS_VOICE: 'alloy' }
    },
    {
      name: "All formats test",
      text: "This is a test of all available audio formats.",
      runtimeArgs: { AUDIO_FORMAT: 'mp3' }
    }
  ];
  const allVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
  const allFormats = ['mp3', 'opus', 'aac', 'flac', 'wav', 'pcm'];

  for (const voice of allVoices) {
    testCases.push({
      name: `Voice test: ${voice}`,
      text: `This is a test of the ${voice} voice.`,
      runtimeArgs: { OPENAI_TTS_VOICE: voice }
    });
  }

  for (const format of allFormats) {
    testCases.push({
      name: `Format test: ${format}`,
      text: `This is a test of the ${format} audio format.`,
      runtimeArgs: { AUDIO_FORMAT: format }
    });
  }

  for (const testCase of testCases) {
    console.log(`\nRunning test: ${testCase.name}`);
    const runtimeArgs = { ...baseRuntimeArgs, ...testCase.runtimeArgs };

    try {
      const result = await runtime.handler.call({
        runtimeArgs,
        introspect: console.log,
        logger: console.error,
        config: { name: "OpenAI TTS", version: "1.0.0" }
      }, { text: testCase.text });

      console.log(result);

      if (result.startsWith("Audio file created successfully")) {
        const filePath = result.split("Saved as: ")[1];
        const stats = await fs.stat(filePath);
        console.log(`File size: ${stats.size} bytes`);
        console.log(`File exists: ${await fs.access(filePath).then(() => true).catch(() => false)}`);
      }
    } catch (error) {
      console.error(`Test failed: ${error.message}`);
    }
  }
}

test().catch(console.error);
