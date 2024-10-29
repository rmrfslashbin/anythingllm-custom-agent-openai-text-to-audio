import os
import json
from datetime import datetime, timezone

def create_directory_structure():
    base_dir = "openai-text-to-audio"
    os.makedirs(base_dir, exist_ok=True)
    
    # Create necessary files
    files = [
        "README.md",
        "plugin.json",
        "handler.js",
        "package.json",
        ".gitignore"
    ]
    
    for file in files:
        with open(os.path.join(base_dir, file), 'w') as f:
            f.write("")

def write_plugin_json():
    plugin_data = {
        "name": "OpenAI Text-to-Audio Agent",
        "version": "1.0.0",
        "description": "Convert text to audio using OpenAI's API",
        "author": "Robert Sigler",
        "repository": "https://github.com/rmrfslashbin/openai-text-to-audio",
        "hubId": "openai-text-to-audio",
        "created": datetime.now(timezone.utc).isoformat(),
        "active": True,
        "schema": "skill-1.0.0",
        "setup_args": {
            "OPENAI_API_KEY": {
                "type": "string",
                "required": True,
                "input": {
                    "type": "text",
                    "placeholder": "sk-...",
                    "hint": "Your OpenAI API key"
                }
            }
        },
        "entrypoint": {
            "file": "handler.js",
            "params": {
                "text": {
                    "description": "The text to convert to audio",
                    "type": "string"
                }
            }
        }
    }
    
    with open("openai-text-to-audio/plugin.json", 'w') as f:
        json.dump(plugin_data, f, indent=2)

def write_readme():
    readme_content = """# OpenAI Text-to-Audio Agent

This custom agent skill for AnythingLLM converts text to audio using OpenAI's API.

## Usage

To use this skill, invoke it with the `@agent` command followed by the text you want to convert to audio:

@agent convert this text to audio: Hello, world!

## Requirements

- An OpenAI API key with access to the text-to-speech model
- Node.js environment

## Installation

1. Place this folder in the `server/storage/plugins/agent-skills` directory of your AnythingLLM installation.
2. Restart your AnythingLLM server to load the new skill.
3. Configure the skill with your OpenAI API key in the AnythingLLM UI.

## Author

Robert Sigler (GitHub: @rmrfslashbin)

## Version

1.0.0

## License

MIT
"""
    
    with open("openai-text-to-audio/README.md", 'w') as f:
        f.write(readme_content)

def write_handler_js():
    handler_content = """const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

module.exports.runtime = {
  handler: async function ({ text }) {
    if (!text) {
      return "Error: No text provided for conversion to audio.";
    }

    try {
      const openai = new OpenAI({ apiKey: this.runtimeArgs.OPENAI_API_KEY });

      this.introspect("Converting text to audio...");

      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: text,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      const outputPath = path.join(__dirname, 'output.mp3');
      fs.writeFileSync(outputPath, buffer);

      this.introspect("Audio file created successfully.");
      return `Audio file created successfully. Saved as: ${outputPath}`;
    } catch (error) {
      this.logger('Error in text-to-speech conversion:', error);
      return `Error in text-to-speech conversion: ${error.message}`;
    }
  }
};
"""
    
    with open("openai-text-to-audio/handler.js", 'w') as f:
        f.write(handler_content)

def write_package_json():
    package_data = {
        "name": "openai-text-to-audio",
        "version": "1.0.0",
        "description": "Convert text to audio using OpenAI's API",
        "main": "handler.js",
        "scripts": {
            "test": "echo \"Error: no test specified\" && exit 1"
        },
        "author": "Robert Sigler",
        "license": "MIT",
        "dependencies": {
            "openai": "^4.0.0"
        }
    }
    
    with open("openai-text-to-audio/package.json", 'w') as f:
        json.dump(package_data, f, indent=2)

def write_gitignore():
    gitignore_content = """# Node modules
node_modules/

# Generated audio files
*.mp3

# Environment variables
.env

# OS generated files
.DS_Store
Thumbs.db
"""
    
    with open("openai-text-to-audio/.gitignore", 'w') as f:
        f.write(gitignore_content)

def main():
    create_directory_structure()
    write_plugin_json()
    write_readme()
    write_handler_js()
    write_package_json()
    write_gitignore()
    print("Project structure and initial files created successfully.")

if __name__ == "__main__":
    main()

