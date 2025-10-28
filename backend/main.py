from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from typing import List, Optional
from rdflib import Graph


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
    indexGlycémique: int
    indiceSatiété: int
    scoreNutritionnel: int
    
    # Ajouter toutes les relations
    groupes: List[str] = []
    nutriments: List[str] = []
    recommandations: List[str] = []
    contre_indications: List[str] = []
    
    # Flags pour les sous-classes
    est_riche_en_fibres: bool = False
    est_index_glycemique_eleve: bool = False
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
        print(f"📥 POST /aliments - Données reçues: {aliment.dict()}")  # DEBUG
        
        # Générer l'ID
        aliment_id = f"Aliment_{aliment.nom.replace(' ', '_')}"
        print(f"🔧 ID généré: {aliment_id}")  # DEBUG
        
        # UTILISER LA NOUVELLE MÉTHODE COMPLÈTE
        query = sparql.create_aliment(aliment_id, aliment)
        print(f"🚀 REQUÊTE SPARQL GÉNÉRÉE:\n{query}")  # DEBUG
        
        success = fuseki.execute_update(query)
        print(f"✅ RÉSULTAT FUSEKI UPDATE: {success}")  # DEBUG
        
        if success:
            # Vérification IMMÉDIATE
            verify_query = f"""
            PREFIX nutrition: <http://www.semanticweb.org/user/ontologies/2025/8/nutrition#>
            ASK WHERE {{
                nutrition:{aliment_id} a nutrition:Aliment
            }}
            """
            verify_result = fuseki.execute_query(verify_query)
            print(f"🔍 VÉRIFICATION EXISTENCE: {verify_result.get('boolean', False)}")  # DEBUG
            
            # Vérification de tous les aliments
            all_query = sparql.get_all_aliments()
            all_results = fuseki.execute_query(all_query)
            print(f"📊 TOUS LES ALIMENTS MAINTENANT: {len(all_results['results']['bindings'])}")  # DEBUG
        
        return {
            "message": "Aliment créé avec succès", 
            "id": aliment_id,
            "uri": f"nutrition:{aliment_id}",
            "fuseki_success": success,
            "verification_exists": verify_result.get('boolean', False) if success else None,
            "total_aliments": len(all_results['results']['bindings']) if success else 0
        }
    except Exception as e:
        print(f"❌ ERREUR POST /aliments: {str(e)}")  # DEBUG
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
@app.get("/test_sparql")
def test_sparql():
    g = Graph()
    g.parse("ontology.owl")  # chemin vers ton fichier .owl
    
    query = """
    PREFIX nutrition: <http://www.semanticweb.org/user/ontologies/2025/8/nutrition#>
    SELECT ?aliment ?nom ?calories ?indexGlycémique
    WHERE {
        ?aliment a nutrition:Aliment ;
                 nutrition:nom ?nom ;
                 nutrition:recommandation nutrition:GrossesseTrimestre2 .
        OPTIONAL { ?aliment nutrition:Calories ?calories }
        OPTIONAL { ?aliment nutrition:indexGlycémique ?indexGlycémique }
    }
    ORDER BY ?nom
    """
    results = g.query(query)
    return {"results": [dict(r) for r in results]}