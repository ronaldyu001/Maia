# Helper Functions Catalog

This catalog documents the helper functions used in the context engineering system.

## Conversation Management

### `add_turn.py`

- **Purpose**: Adds a new conversation turn to the chat history
- **Usage**: Manages the addition of messages from both user and Maia to the conversation

### `load_conversation.py`

- **Purpose**: Loads existing conversation data from storage
- **Usage**: Retrieves chat history for context window generation

## Text Processing

### `generic_trimmer.py`

- **Purpose**: Trims text content to fit within token limits
- **Usage**: Ensures text segments fit within context window size constraints

### `parse_json.py`

- **Purpose**: Handles JSON parsing operations
- **Usage**: Safely parses JSON data from messages and tool responses

### `token_counter.py`

- **Purpose**: Counts tokens in text for different LLM models
- **Usage**: Ensures context windows stay within model token limits

### `transcript.py`

- **Purpose**: Generates formatted conversation transcripts
- **Usage**: Creates readable conversation histories for context windows

## Usage Notes

- All helpers are designed to be modular and reusable
- Each helper follows single responsibility principle
- Functions are optimized for context window generation pipeline
