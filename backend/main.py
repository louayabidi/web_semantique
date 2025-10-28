from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.api import auth, aliments, recettes, sparql, crud_entities
from app.services.ontology_loader import ontology_loader
import os

app = FastAPI(
    title="Nutrition Semantic API",
    description="API sémantique pour les recommandations nutritionnelles basée sur une ontologie OWL",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

try:
    ontology_loader.load_ontology()
    print("✓ Ontology loaded successfully at startup")
except Exception as e:
    print(f"⚠ Warning: Could not load ontology at startup: {e}")

app.include_router(auth.router, prefix="/api")
app.include_router(aliments.router, prefix="/api")
app.include_router(recettes.router, prefix="/api")
app.include_router(sparql.router, prefix="/api")
app.include_router(crud_entities.router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "API Sémantique Nutritionnelle",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/api/auth",
            "aliments": "/api/aliments",
            "recettes": "/api/recettes",
            "sparql": "/api/semantic/sparql",
            "nl_search": "/api/semantic/nl-search",
            "ontology": "/api/semantic/ontology",
            "docs": "/docs"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("API_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
