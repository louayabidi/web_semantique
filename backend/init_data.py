#!/usr/bin/env python3
"""Initialize the Fuseki database with sample data"""

import requests
from requests.auth import HTTPBasicAuth
import os
import json

FUSEKI_URL = os.getenv("FUSEKI_URL", "http://localhost:3030")
FUSEKI_USERNAME = os.getenv("FUSEKI_USERNAME", "admin")
FUSEKI_PASSWORD = os.getenv("FUSEKI_PASSWORD", "admin")
DATASET_NAME = "nutrition"
SPARQL_UPDATE_ENDPOINT = f"{FUSEKI_URL}/{DATASET_NAME}/update"
ONTOLOGY_PREFIX = "http://www.semanticweb.org/user/ontologies/2025/8/nutrition#"

def sparql_update(query):
    """Execute a SPARQL UPDATE query"""
    try:
        print(f"[v0] Executing SPARQL Update...")
        response = requests.post(
            SPARQL_UPDATE_ENDPOINT,
            data={"update": query},
            headers={"Content-Type": "application/sparql-update"},
            auth=HTTPBasicAuth(FUSEKI_USERNAME, FUSEKI_PASSWORD),
            timeout=10
        )
        success = response.status_code == 204
        if success:
            print(f"[v0] Update successful")
        else:
            print(f"[v0] Update Error: {response.status_code} - {response.text[:300]}")
        return success, response.text if not success else ""
    except Exception as e:
        print(f"[v0] Update Error: {str(e)}")
        return False, str(e)

def init_data():
    """Initialize database with sample data"""
    
    # Sample data
    init_query = f"""
    PREFIX nutrition: <{ONTOLOGY_PREFIX}>
    
    INSERT DATA {{
        # Personnes
        <{ONTOLOGY_PREFIX}personne_jean> a nutrition:Personne ;
            nutrition:nom "Jean Dupont"^^<http://www.w3.org/2001/XMLSchema#string> ;
            nutrition:age 30^^<http://www.w3.org/2001/XMLSchema#integer> ;
            nutrition:poids 75.5^^<http://www.w3.org/2001/XMLSchema#float> ;
            nutrition:taille 1.75^^<http://www.w3.org/2001/XMLSchema#float> ;
            nutrition:objectifPoids 70.0^^<http://www.w3.org/2001/XMLSchema#float> .
        
        <{ONTOLOGY_PREFIX}personne_marie> a nutrition:Personne ;
            nutrition:nom "Marie Martin"^^<http://www.w3.org/2001/XMLSchema#string> ;
            nutrition:age 28^^<http://www.w3.org/2001/XMLSchema#integer> ;
            nutrition:poids 62.0^^<http://www.w3.org/2001/XMLSchema#float> ;
            nutrition:taille 1.65^^<http://www.w3.org/2001/XMLSchema#float> ;
            nutrition:objectifPoids 60.0^^<http://www.w3.org/2001/XMLSchema#float> .
        
        # Aliments
        <{ONTOLOGY_PREFIX}aliment_pomme> a nutrition:Aliment ;
            nutrition:nom "Pomme"^^<http://www.w3.org/2001/XMLSchema#string> ;
            nutrition:calories 52^^<http://www.w3.org/2001/XMLSchema#integer> ;
            nutrition:indexGlycemique 36^^<http://www.w3.org/2001/XMLSchema#integer> ;
            nutrition:teneurFibres 2.4^^<http://www.w3.org/2001/XMLSchema#float> ;
            nutrition:teneurSodium 2.0^^<http://www.w3.org/2001/XMLSchema#float> .
        
        <{ONTOLOGY_PREFIX}aliment_poulet> a nutrition:Aliment ;
            nutrition:nom "Poulet"^^<http://www.w3.org/2001/XMLSchema#string> ;
            nutrition:calories 165^^<http://www.w3.org/2001/XMLSchema#integer> ;
            nutrition:indexGlycemique 0^^<http://www.w3.org/2001/XMLSchema#integer> ;
            nutrition:teneurFibres 0.0^^<http://www.w3.org/2001/XMLSchema#float> ;
            nutrition:teneurSodium 75.0^^<http://www.w3.org/2001/XMLSchema#float> .
        
        <{ONTOLOGY_PREFIX}aliment_riz> a nutrition:Aliment ;
            nutrition:nom "Riz blanc"^^<http://www.w3.org/2001/XMLSchema#string> ;
            nutrition:calories 130^^<http://www.w3.org/2001/XMLSchema#integer> ;
            nutrition:indexGlycemique 73^^<http://www.w3.org/2001/XMLSchema#integer> ;
            nutrition:teneurFibres 0.4^^<http://www.w3.org/2001/XMLSchema#float> ;
            nutrition:teneurSodium 1.0^^<http://www.w3.org/2001/XMLSchema#float> .
        
        # Activités Physiques
        <{ONTOLOGY_PREFIX}activite_course> a nutrition:ActivitePhysique ;
            nutrition:nom "Course à pied"^^<http://www.w3.org/2001/XMLSchema#string> ;
            nutrition:dureeActivite 30^^<http://www.w3.org/2001/XMLSchema#integer> ;
            nutrition:type "Cardio"^^<http://www.w3.org/2001/XMLSchema#string> .
        
        <{ONTOLOGY_PREFIX}activite_natation> a nutrition:ActivitePhysique ;
            nutrition:nom "Natation"^^<http://www.w3.org/2001/XMLSchema#string> ;
            nutrition:dureeActivite 45^^<http://www.w3.org/2001/XMLSchema#integer> ;
            nutrition:type "Cardio"^^<http://www.w3.org/2001/XMLSchema#string> .
        
        <{ONTOLOGY_PREFIX}activite_musculation> a nutrition:ActivitePhysique ;
            nutrition:nom "Musculation"^^<http://www.w3.org/2001/XMLSchema#string> ;
            nutrition:dureeActivite 60^^<http://www.w3.org/2001/XMLSchema#integer> ;
            nutrition:type "Force"^^<http://www.w3.org/2001/XMLSchema#string> .
        
        # Nutriments
        <{ONTOLOGY_PREFIX}nutriment_vitaminC> a nutrition:Nutriment ;
            nutrition:nom "Vitamine C"^^<http://www.w3.org/2001/XMLSchema#string> ;
            nutrition:doseRecommandee 90.0^^<http://www.w3.org/2001/XMLSchema#float> ;
            nutrition:uniteDose "mg"^^<http://www.w3.org/2001/XMLSchema#string> .
        
        <{ONTOLOGY_PREFIX}nutriment_calcium> a nutrition:Nutriment ;
            nutrition:nom "Calcium"^^<http://www.w3.org/2001/XMLSchema#string> ;
            nutrition:doseRecommandee 1000.0^^<http://www.w3.org/2001/XMLSchema#float> ;
            nutrition:uniteDose "mg"^^<http://www.w3.org/2001/XMLSchema#string> .
        
        # Conditions Médicales
        <{ONTOLOGY_PREFIX}condition_diabete> a nutrition:ConditionMedicale ;
            nutrition:nom "Diabète"^^<http://www.w3.org/2001/XMLSchema#string> .
        
        <{ONTOLOGY_PREFIX}condition_hypertension> a nutrition:ConditionMedicale ;
            nutrition:nom "Hypertension"^^<http://www.w3.org/2001/XMLSchema#string> .
        
        # Allergies
        <{ONTOLOGY_PREFIX}allergie_arachide> a nutrition:Allergie ;
            nutrition:nom "Arachide"^^<http://www.w3.org/2001/XMLSchema#string> ;
            nutrition:typeAllergie "Alimentaire"^^<http://www.w3.org/2001/XMLSchema#string> .
        
        <{ONTOLOGY_PREFIX}allergie_gluten> a nutrition:Allergie ;
            nutrition:nom "Gluten"^^<http://www.w3.org/2001/XMLSchema#string> ;
            nutrition:typeAllergie "Alimentaire"^^<http://www.w3.org/2001/XMLSchema#string> .
        
        # Objectifs
        <{ONTOLOGY_PREFIX}objectif_perte> a nutrition:Objectif ;
            nutrition:nom "Perte de poids"^^<http://www.w3.org/2001/XMLSchema#string> .
        
        <{ONTOLOGY_PREFIX}objectif_muscle> a nutrition:Objectif ;
            nutrition:nom "Gain musculaire"^^<http://www.w3.org/2001/XMLSchema#string> .
        
        # Recettes
        <{ONTOLOGY_PREFIX}recette_salade> a nutrition:Recette ;
            nutrition:nom "Salade verte"^^<http://www.w3.org/2001/XMLSchema#string> ;
            nutrition:description "Salade simple avec vinaigrette"^^<http://www.w3.org/2001/XMLSchema#string> ;
            nutrition:tempsPreparation 10^^<http://www.w3.org/2001/XMLSchema#integer> ;
            nutrition:niveauDifficulte "Facile"^^<http://www.w3.org/2001/XMLSchema#string> .
        
        # Repas
        <{ONTOLOGY_PREFIX}repas_petit_dejeuner> a nutrition:Repas ;
            nutrition:nom "Petit déjeuner"^^<http://www.w3.org/2001/XMLSchema#string> ;
            nutrition:type "Matin"^^<http://www.w3.org/2001/XMLSchema#string> .
        
        <{ONTOLOGY_PREFIX}repas_dejeuner> a nutrition:Repas ;
            nutrition:nom "Déjeuner"^^<http://www.w3.org/2001/XMLSchema#string> ;
            nutrition:type "Midi"^^<http://www.w3.org/2001/XMLSchema#string> .
        
        # Préférences Alimentaires
        <{ONTOLOGY_PREFIX}pref_vegetarien> a nutrition:PreferenceAlimentaire ;
            nutrition:nom "Végétarien"^^<http://www.w3.org/2001/XMLSchema#string> .
        
        <{ONTOLOGY_PREFIX}pref_vegan> a nutrition:PreferenceAlimentaire ;
            nutrition:nom "Vegan"^^<http://www.w3.org/2001/XMLSchema#string> .
    }}
    """
    
    success, error = sparql_update(init_query)
    if success:
        print("[v0] Database initialized successfully!")
    else:
        print(f"[v0] Error initializing database: {error}")
    
    return success

if __name__ == "__main__":
    print("[v0] Initializing Fuseki database with sample data...")
    init_data()
