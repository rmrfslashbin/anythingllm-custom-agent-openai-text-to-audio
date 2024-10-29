# OpenAI Text-to-Audio Agent

This custom agent skill for AnythingLLM converts text to audio using OpenAI's API.

## Features

- Convert text to speech using OpenAI's latest text-to-speech models
- Support for multiple voices (alloy, echo, fable, onyx, nova, shimmer)
- Adjustable speech speed (0.25x to 4.0x)
- Multiple output formats (mp3, opus, aac, flac, wav, pcm)

## Usage

To use this skill, invoke it with the `@agent` command followed by the text you want to convert to audio:

```
@agent convert this text to audio: Hello, world!
```

You can also specify additional parameters:

```
@agent convert to audio with voice nova and speed 1.5: Welcome to the future of AI!
```

## Requirements

- An OpenAI API key with access to the text-to-speech model
- Node.js environment

## Installation

1. Place this folder in the `server/storage/plugins/agent-skills` directory of your AnythingLLM installation.
2. Restart your AnythingLLM server to load the new skill.
3. Configure the skill with your OpenAI API key in the AnythingLLM UI.

## Configuration

In the AnythingLLM UI, you can configure the following options:

- OPENAI_API_KEY: Your OpenAI API key
- OPENAI_TTS_MODEL: The text-to-speech model to use (e.g., 'tts-1', 'tts-1-hd')
- OPENAI_TTS_VOICE: The voice to use (e.g., 'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer')
- OUTPUT_DIRECTORY: The directory where audio files will be saved
- AUDIO_FORMAT: The output audio format (mp3, opus, aac, flac, wav, pcm)
- AUDIO_SPEED: The speed of the generated audio (0.25 to 4.0)

## Author

Robert Sigler (GitHub: @mrrfslashbin)

## Version

1.0.0

## License

MIT
