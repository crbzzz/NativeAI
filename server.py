import os
from fastapi import FastAPI
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from llama_cpp import Llama

MODEL_PATH = os.path.join(os.path.dirname(__file__), "gpt-oss-20b-Q4_K_M.gguf")
SYSTEM_PROMPT_FILE = os.path.join(os.path.dirname(__file__), "system_prompt_boosted.txt")

print(f"[NativeAI] Chargement du modèle: {MODEL_PATH}")
try:
    llm = Llama(
        model_path=MODEL_PATH,
        n_ctx=4096,       
        n_threads=8,      
        n_gpu_layers=0
    )
except Exception as e:
    print(f"[ERREUR] Impossible de charger le modèle : {e}")
    llm = None


if os.path.exists(SYSTEM_PROMPT_FILE):
    with open(SYSTEM_PROMPT_FILE, "r", encoding="utf-8") as f:
        SYSTEM_PROMPT = f.read().strip()
else:
    SYSTEM_PROMPT = "You are an AI assistant."
    print(f"[ATTENTION] {SYSTEM_PROMPT_FILE} introuvable — prompt par défaut utilisé.")


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.mount("/static", StaticFiles(directory="."), name="static")


class ChatMessage(BaseModel):
    message: str


@app.get("/")
async def root():
    return FileResponse("index.html")

@app.post("/chat")
async def chat_endpoint(data: ChatMessage):
    prompt = data.message.strip()
    if not prompt:
        return JSONResponse({"response": "⚠️ Message vide."})

    if llm is None:
        return JSONResponse({"response": "⚠️ Modèle non chargé. Vérifie ton chemin ou format GGUF."})

    try:
        full_prompt = f"{SYSTEM_PROMPT}\n\nUser: {prompt}\nAssistant:"

        output = llm(
            full_prompt,
            max_tokens=1024,
            temperature=0.7,
            stop=["User:", "Assistant:"]
        )
        response_text = output["choices"][0]["text"].strip()
        return JSONResponse({"response": response_text})
    except Exception as e:
        return JSONResponse({"response": f"Erreur LLaMA: {str(e)}"})


@app.get("/health")
async def health_check():
    return {"ok": True}

