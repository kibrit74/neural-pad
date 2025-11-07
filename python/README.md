# Python Whisper Server

## Installation

1. Install Python 3.8 or higher
2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage

The server runs automatically when you use voice input in Neural Pad.

## Manual Testing

```bash
python whisper_server.py base
```

Then send commands via stdin:
```json
{"action": "ping"}
```
