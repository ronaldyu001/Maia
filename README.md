# Maia Tech Stack

## Backend (Python)

### Framework & Server
- **FastAPI** - Async web framework for building REST APIs
- **Uvicorn** - ASGI server for running the application
- **Starlette** - Underlying web framework used by FastAPI

### LLM & AI/ML
- **Ollama** - Local LLM inference engine (runs at `localhost:11434`)
  - Custom models: `maia-llama3:v1`, `maia-deepseek:v1`
- **Llama-cpp-python** - Python bindings for running GGUF format models
- **LlamaIndex** - RAG (Retrieval-Augmented Generation) framework
  - Vector store integration (FAISS)
  - HuggingFace and OpenAI embeddings support
  - File reading capabilities

### Vector Search & Embeddings
- **FAISS** - Facebook AI Similarity Search for vector operations
- **Sentence-Transformers** - Pre-trained models for embeddings (default: `all-MiniLM-L6-v2`)
- **Nomic Embeddings** - Alternative embedding option (`nomic-ai/nomic-embed-text-v1.5`)

### NLP & Text Processing
- **Transformers** - Hugging Face transformers library
- **NLTK** - Natural Language Toolkit
- **BeautifulSoup4** - HTML/XML parsing
- **PyPDF** - PDF processing
- **LlamaParse** - Document parsing

### Deep Learning
- **PyTorch** - Deep learning framework for GPU/CPU computation

### Data & Storage
- **SQLAlchemy** - SQL toolkit and ORM
- **Pandas** - Data manipulation and analysis
- **NumPy** - Numerical computing
- **Pydantic** - Data validation using Python type annotations
- **DiskCache** - Persistent caching

### Utilities
- **Requests / httpx** - HTTP client libraries
- **Loguru** - Advanced logging
- **python-dotenv** - Environment variable management
- **Pytest** - Testing framework

---

## Frontend (TypeScript/React)

### Framework & Runtime
- **React 19** - UI library
- **React DOM** - React rendering for web

### Build Tools
- **Vite** - Frontend build tool and dev server
- **TypeScript** - Typed superset of JavaScript

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS transformation tool
- **Autoprefixer** - Vendor prefixer

### HTTP Client
- **Axios** - Promise-based HTTP client for API calls

### Code Quality
- **ESLint** - Code linting
- **@typescript-eslint** - TypeScript linting support

---

## Frontend-Backend Interaction

### Communication Pattern
- **Protocol**: REST API over HTTP
- **Format**: JSON request/response
- **Client**: Axios (frontend) to FastAPI (backend)

### Chat Endpoint
```
POST http://127.0.0.1:8000/chat
Content-Type: application/json

Request:
{
  "message": "string",
  "session_id": "string"
}

Response:
{
  "response": "string"
}
```

### CORS Configuration
- Allowed origins: `http://localhost:5173`, `http://127.0.0.1:5173`
- All methods allowed
- Credentials enabled

### Data Flow
```
Frontend (React/Vite)
    | (Axios HTTP POST)
    v
FastAPI Backend + CORS Middleware
    |
    v
Context Engineering (Token counting, window generation)
    |
    v
RAG Pipeline (LlamaIndex + FAISS + Embeddings)
    |
    v
LLM Inference (Ollama API)
    |
    v
Tool System (Session management, file operations)
    |
    v
Memory Management (Conversations + Vector store)
    |
    v
Response returned to Frontend
```

---

## Storage & Memory

### Conversation Storage
- **Short-term**: JSON files at `Maia/memory/raw/short_term/conversations/`
- **Long-term**: Archived sessions at `Maia/memory/raw/long_term/conversations/`

### Vector Storage (FAISS)
Three categories stored at `Maia/memory/RAG/store/`:
- `facts` - Factual information
- `goals` - Goal tracking
- `events` - Event logging

---

## Development Environment

### Backend
- Python 3.11
- Virtual environment: `.venv`
- Package management: pip with `requirements.txt`
- Dev server: `uvicorn main:app` on port 8000

### Frontend
- Node.js with npm
- Dev server: Vite on port 5173
- Build: `npm run build`
