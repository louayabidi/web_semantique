from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

from fuseki_client import FusekiClient
from sparql_queries import SparqlQueries

app = FastAPI(title="Nutrition Semantic API")

# CORS pour React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Clients
fuseki = FusekiClient()
sparql = SparqlQueries()

# Models
class PersonneCreate(BaseModel):
    nom: str
    age: int
    poids: float

class AlimentCreate(BaseModel):
    nom: str
    calories: int

class QuestionRequest(BaseModel):  # ← NOUVEAU MODEL
    question: str

@app.get("/")
def read_root():
    return {"message": "API Nutrition Sémantique - Prête avec Fuseki!"}

# CRUD Personnes
@app.get("/personnes")
def get_personnes():
    try:
        query = sparql.get_all_personnes()
        results = fuseki.execute_query(query)
        return {"personnes": results["results"]["bindings"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/personnes")
def create_personne(personne: PersonneCreate):
    try:
        personne_id = f"Personne_{personne.nom.replace(' ', '_')}"
        query = sparql.create_personne(personne_id, personne.nom, personne.age, personne.poids)
        success = fuseki.execute_update(query)
        return {"message": "Personne créée", "id": personne_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# CRUD Aliments
@app.get("/aliments")
def get_aliments():
    try:
        query = sparql.get_all_aliments()
        results = fuseki.execute_query(query)
        return {"aliments": results["results"]["bindings"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/aliments")
def create_aliment(aliment: AlimentCreate):
    try:
        aliment_id = f"Aliment_{aliment.nom.replace(' ', '_')}"
        query = sparql.create_aliment(aliment_id, aliment.nom, aliment.calories)
        success = fuseki.execute_update(query)
        return {"message": "Aliment créé", "id": aliment_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Recherche sémantique - CORRIGÉE
@app.post("/recherche")
def recherche_semantique(request: QuestionRequest):  # ← CORRECTION ICI
    try:
        from ai_translator_simple import SimpleQueryTranslator
        translator = SimpleQueryTranslator()
        sparql_query = translator.question_to_sparql(request.question)  # ← request.question
        results = fuseki.execute_query(sparql_query)
        return {
            "question": request.question,  # ← request.question
            "sparql_query": sparql_query,
            "results": results["results"]["bindings"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)