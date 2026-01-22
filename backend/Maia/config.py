# ----- Model .gguf Paths -----
MAIA_LLAMA3_V1 = "/Users/ronaldyu/.ollama/models/blobs/sha256-6a0746a1ec1aef3e7ec53868f220ff6e389f6f8ef87a01d77c96807de94ca2aa"

# ----- Maia's llms -----
llms = {
    1: "ministral-3:latest",
    2: "stablelm-zephyr:latest",
    3: "qwen2.5:3b",
    4: "phi3.5:latest"
}

# ----- Ollama Wrapper Variables -----
OLLAMA_HOST = "http://localhost:11434"
OLLAMA_MODEL_NAME = llms[3]
