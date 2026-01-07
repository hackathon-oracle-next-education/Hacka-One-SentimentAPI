# -*- coding: utf-8 -*-
import logging
import sys
import traceback
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import joblib
import numpy as np

# ========== CONFIGURAÇÃO DE LOGS ==========
# Configuração básica de logs (funciona sem arquivos externos)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('api.log', encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# ========== INICIALIZAÇÃO DA APP ==========
app = FastAPI(
    title="Sentiment Analysis API",
    version="1.0",
    description="API para análise de sentimentos"
)

# ========== MODELO ==========
model = None
try:
    model = joblib.load("sentiment_model_olist.joblib")
    logger.info("✅ Modelo carregado com sucesso")
except Exception as e:
    logger.error(f"❌ Erro ao carregar modelo: {str(e)}")

# ========== MODELOS PYDANTIC ==========
class TextInput(BaseModel):
    text: str = Field(..., min_length=5, max_length=5000)

class PredictionResponse(BaseModel):
    previsao: str
    probabilidade: float
    mensagem: str = "Sucesso"
    timestamp: str

# ========== MIDDLEWARE DE LOGS ==========
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = datetime.now()
    
    try:
        response = await call_next(request)
        process_time = (datetime.now() - start_time).total_seconds() * 1000
        
        logger.info(
            f"🌐 {request.method} {request.url.path} - "
            f"Status: {response.status_code} - "
            f"Tempo: {process_time:.2f}ms"
        )
        
        return response
    except Exception as e:
        logger.error(f"💥 Erro no middleware: {str(e)}")
        raise

# ========== HANDLERS DE ERRO ==========
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Captura TODOS os erros não tratados"""
    logger.error(
        f"💥 ERRO GLOBAL - URL: {request.url} - "
        f"Erro: {str(exc)}\n"
        f"Traceback: {traceback.format_exc()}"
    )
    
    return JSONResponse(
        status_code=500,
        content={
            "erro": "Erro interno do servidor",
            "detalhe": str(exc),
            "timestamp": datetime.now().isoformat()
        }
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Captura erros HTTP (400, 404, etc.)"""
    logger.warning(f"⚠️  HTTP {exc.status_code} - {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "erro": exc.detail,
            "timestamp": datetime.now().isoformat()
        }
    )

# ========== ENDPOINTS ==========
@app.post("/predict", response_model=PredictionResponse)
def predict_sentiment(input: TextInput):
    """
    Analisa o sentimento de um texto
    """
    # Log da requisição
    logger.info(f"📝 Analisando texto: '{input.text[:50]}...'")
    
    # Verifica se modelo está carregado
    if model is None:
        logger.error("❌ Modelo não carregado")
        raise HTTPException(
            status_code=503,
            detail="Serviço temporariamente indisponível. Modelo não carregado."
        )
    
    try:
        # Faz a predição
        prediction = model.predict([input.text])[0]
        
        # Tenta obter probabilidade
        if hasattr(model, 'predict_proba'):
            probabilities = model.predict_proba([input.text])[0]
            probability = float(np.max(probabilities))
        else:
            probability = 1.0
            logger.warning("⚠️  Modelo sem predict_proba, usando probabilidade=1.0")
        
        logger.info(f"✅ Resultado: {prediction} (prob: {probability:.2%})")
        
        return {
            "previsao": str(prediction),
            "probabilidade": probability,
            "mensagem": "Análise realizada com sucesso",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Erro na predição: {str(e)}")
        raise HTTPException(
            status_code=422,
            detail=f"Erro ao analisar o texto: {str(e)}"
        )

@app.get("/health")
def health_check():
    """Verifica se a API está saudável"""
    return {
        "status": "healthy" if model is not None else "unhealthy",
        "model_loaded": model is not None,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/")
def root():
    """Página inicial"""
    return {
        "mensagem": "API de Análise de Sentimentos",
        "version": "1.0",
        "endpoints": ["/predict", "/health", "/docs"]
    }

# ========== EXECUÇÃO ==========
if __name__ == "__main__":
    import uvicorn
    
    logger.info("🚀 Iniciando API...")
    uvicorn.run(app, host="0.0.0.0", port=8000)