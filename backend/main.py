from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from ontology import NutritionOntology
from rdflib import Literal
from rdflib.namespace import XSD

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase_url = os.environ.get("VITE_SUPABASE_URL")
supabase_key = os.environ.get("VITE_SUPABASE_ANON_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

ontology = NutritionOntology()

class SearchQuery(BaseModel):
    query: str
    type: str

class PersonProfile(BaseModel):
    nom: str
    prenom: str
    age: Optional[int] = None
    poids: Optional[float] = None
    taille: Optional[float] = None
    sexe: Optional[str] = None

class HealthState(BaseModel):
    personne_id: str
    condition: Optional[str] = None
    allergies: Optional[List[str]] = None
    intolerance: Optional[List[str]] = None

class Recommendation(BaseModel):
    type: str
    items: List[dict]

@app.get("/")
async def root():
    return {"message": "Nutrition & Wellness Ontology API"}

@app.get("/ontology")
async def get_ontology():
    return {"ontology": ontology.serialize_ontology(format='turtle')}

@app.post("/search/semantic")
async def semantic_search(search: SearchQuery):
    try:
        if search.type == "aliment":
            sparql_query = f"""
            PREFIX nutrition: <http://www.nutrition-wellness.org/ontology#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

            SELECT ?aliment ?nom ?calories
            WHERE {{
                ?aliment a nutrition:Aliment .
                ?aliment nutrition:nom ?nom .
                ?aliment nutrition:calories ?calories .
                FILTER(CONTAINS(LCASE(?nom), LCASE("{search.query}")))
            }}
            """
        elif search.type == "activite":
            sparql_query = f"""
            PREFIX nutrition: <http://www.nutrition-wellness.org/ontology#>

            SELECT ?activite ?nom
            WHERE {{
                ?activite a nutrition:ActivitePhysique .
                ?activite nutrition:nom ?nom .
                FILTER(CONTAINS(LCASE(?nom), LCASE("{search.query}")))
            }}
            """
        else:
            sparql_query = f"""
            PREFIX nutrition: <http://www.nutrition-wellness.org/ontology#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

            SELECT ?subject ?label
            WHERE {{
                ?subject rdfs:label ?label .
                FILTER(CONTAINS(LCASE(?label), LCASE("{search.query}")))
            }}
            """

        results = ontology.execute_sparql(sparql_query)
        result_list = []
        for row in results:
            result_list.append({str(var): str(row[var]) for var in row.labels})

        return {"results": result_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/aliments")
async def get_aliments():
    try:
        response = supabase.table("aliment").select("*").execute()
        for aliment in response.data:
            ontology.add_food_instance(aliment)
        return {"data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/aliments/{aliment_id}")
async def get_aliment(aliment_id: str):
    try:
        response = supabase.table("aliment").select("*").eq("id", aliment_id).maybeSingle().execute()
        return {"data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/activites")
async def get_activites():
    try:
        response = supabase.table("activite_physique").select("*").execute()
        return {"data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommendations/{personne_id}")
async def get_recommendations(personne_id: str):
    try:
        health_response = supabase.table("etat_de_sante").select("*").eq("personne_id", personne_id).execute()
        objective_response = supabase.table("objectif").select("*").eq("personne_id", personne_id).execute()

        health_state = health_response.data[0] if health_response.data else None
        objective = objective_response.data[0] if objective_response.data else None

        aliments_response = supabase.table("aliment").select("*").execute()
        activites_response = supabase.table("activite_physique").select("*").execute()

        recommended_foods = []
        recommended_activities = []

        if objective:
            if objective['type'] == 'perte de poids':
                recommended_foods = [a for a in aliments_response.data if a['calories'] < 200][:5]
                recommended_activities = [a for a in activites_response.data if a['intensite'] == 'élevée'][:5]
            elif objective['type'] == 'gain musculaire':
                recommended_foods = [a for a in aliments_response.data if a['proteines'] > 10][:5]
                recommended_activities = [a for a in activites_response.data if a['type'] == 'musculation'][:5]
            else:
                recommended_foods = aliments_response.data[:5]
                recommended_activities = activites_response.data[:5]
        else:
            recommended_foods = aliments_response.data[:5]
            recommended_activities = activites_response.data[:5]

        if health_state and health_state.get('allergies'):
            for allergen in health_state['allergies']:
                recommended_foods = [f for f in recommended_foods if allergen.lower() not in f['nom'].lower()]

        return {
            "aliments": recommended_foods,
            "activites": recommended_activities,
            "raison": f"Recommandations basées sur l'objectif: {objective['type'] if objective else 'maintien'}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/sparql")
async def execute_sparql(query: dict):
    try:
        results = ontology.execute_sparql(query["query"])
        result_list = []
        for row in results:
            result_list.append({str(var): str(row[var]) for var in row.labels})
        return {"results": result_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
