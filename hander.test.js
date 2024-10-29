// file: handler.test.js
const { runtime, rateLimiter } = require('./handler');

// Mock dependencies
jest.mock('fs', () => ({
    promises: {
        mkdir: jest.fn().mockResolvedValue(undefined),
        writeFile: jest.fn().mockResolvedValue(undefined)
    }
}));
jest.mock('openai', () => {
    return jest.fn().mockImplementation(() => ({
        audio: {
            speech: {
                create: jest.fn().mockResolvedValue({
                    arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8))
                })
            }
        }
    }));
});

// Mock rateLimiter
jest.mock('./handler', () => {
    const originalModule = jest.requireActual('./handler');
    return {
        ...originalModule,
        rateLimiter: {
            call: jest.fn().mockImplementation((fn, ...args) => fn(...args))
        }
    };
});

describe('Text-to-Speech Handler', () => {
    let mockContext;

    beforeEach(() => {
        mockContext = {
            config: { name: 'TestTTS', version: '1.0.0' },
            runtimeArgs: {
                OPENAI_API_KEY: 'test-api-key',
                OUTPUT_DIRECTORY: './test-output',
                OPENAI_TTS_MODEL: 'tts-1',
                OPENAI_TTS_VOICE: 'alloy',
                AUDIO_FORMAT: 'mp3',
                AUDIO_SPEED: 1.0
            },
            introspect: jest.fn(),
            logger: jest.fn()
        };
    });

    test('should successfully convert text to speech', async () => {
        const result = await runtime.handler.call(mockContext, { text: 'Hello, world!' });
        expect(result).toContain('Audio file created successfully');
        expect(mockContext.introspect).toHaveBeenCalledWith(expect.stringContaining('Audio file created successfully'));
    });

    // ... (keep other test cases)
});
