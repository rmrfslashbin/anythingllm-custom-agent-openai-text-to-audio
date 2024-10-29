# OpenAI Text-to-Audio Agent for AnythingLLM

## Version 1.0.0

This custom agent for AnythingLLM converts text to speech using OpenAI's advanced text-to-speech API. It supports multiple voices, audio formats, and speech speeds, allowing for versatile and high-quality audio generation.

## Features

- Convert text to speech using OpenAI's latest TTS models
- Support for multiple voices: alloy, echo, fable, onyx, nova, shimmer
- Adjustable speech speed (0.25x to 4.0x)
- Multiple output formats: mp3, opus, aac, flac, wav, pcm
- Robust error handling and input validation
- Rate limiting to prevent API overuse
- Comprehensive logging for both successful operations and errors

## Requirements

- AnythingLLM environment
- Node.js (version 14 or higher recommended)
- OpenAI API key with access to the text-to-speech model

## Installation

1. Clone this repository into your AnythingLLM custom agents directory:
   ```
   git clone https://github.com/yourusername/openai-text-to-audio.git
   ```

2. Navigate to the agent directory:
   ```
   cd openai-text-to-audio
   ```

3. Install dependencies:
   ```
   yarn install
   ```

4. Set up your OpenAI API key:
   - Create a `.env` file in the root directory of the agent
   - Add your OpenAI API key to the file:
     ```
     OPENAI_API_KEY=your_api_key_here
     ```

5. Configure the agent in AnythingLLM (refer to AnythingLLM documentation for specific steps)

## Usage

To use this agent in AnythingLLM, invoke it with the `@agent` command followed by your text-to-speech request. For example:

```
@agent convert to audio: Hello, world! This is a test of the OpenAI text-to-audio agent.
```

You can also specify additional parameters:

```
@agent convert to audio with voice nova and speed 1.5: Welcome to the future of AI!
```

### Parameters

- `voice`: alloy, echo, fable, onyx, nova, shimmer (default: alloy)
- `speed`: 0.25 to 4.0 (default: 1.0)
- `format`: mp3, opus, aac, flac, wav, pcm (default: mp3)

## Configuration

In the AnythingLLM UI, you can configure the following options:

- `OPENAI_API_KEY`: Your OpenAI API key
- `OUTPUT_DIRECTORY`: The directory where audio files will be saved
- `OPENAI_TTS_MODEL`: The text-to-speech model to use (e.g., 'tts-1', 'tts-1-hd')
- `OPENAI_TTS_VOICE`: The default voice to use
- `AUDIO_FORMAT`: The default output audio format
- `AUDIO_SPEED`: The default speed of the generated audio

## Error Handling

The agent includes robust error handling for various scenarios:

- Invalid input text (empty, too short, or too long)
- Missing required runtime arguments
- Invalid voice, format, or speed settings
- API rate limit exceeded
- File system errors

Error messages are logged and returned to the user for troubleshooting.

## Testing

To run unit tests:

```
yarn test
```

To run integration tests:

```
yarn test:integration
```

## Limitations

- Maximum input text length is 4096 characters
- API rate limits apply as per OpenAI's policies
- Audio file generation may take a few seconds, especially for longer texts

## Troubleshooting

If you encounter issues:

1. Check your OpenAI API key is correct and has the necessary permissions
2. Ensure the OUTPUT_DIRECTORY is writable
3. Verify your AnythingLLM setup is correct
4. Check the logs for detailed error messages

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your proposed changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenAI for providing the text-to-speech API
- AnythingLLM community for support and inspiration

## Contact

For questions or support, please open an issue on the GitHub repository or contact the maintainer at [code@sigler.io].
