# ----- Model .gguf Paths -----
MAIA_LLAMA3_V1 = "/Users/ronaldyu/.ollama/models/blobs/sha256-6a0746a1ec1aef3e7ec53868f220ff6e389f6f8ef87a01d77c96807de94ca2aa"

# ----- Maia's llms -----
llms = {
    1: "maia-llama3:v1",
    2: "maia-deepseek:v1"
}

# ----- Ollama Wrapper Variables -----
OLLAMA_HOST = "http://localhost:11434"
OLLAMA_MODEL_NAME = llms[1]
