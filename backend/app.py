from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from requests.auth import HTTPBasicAuth
import json
from datetime import datetime
from urllib.parse import quote
import os
import uuid

app = Flask(__name__)
CORS(app)

FUSEKI_URL = os.getenv("FUSEKI_URL", "http://localhost:3030")
FUSEKI_USERNAME = os.getenv("FUSEKI_USERNAME", "admin")
FUSEKI_PASSWORD = os.getenv("FUSEKI_PASSWORD", "admin")
DATASET_NAME = "nutrition"
SPARQL_QUERY_ENDPOINT = f"{FUSEKI_URL}/{DATASET_NAME}/sparql"
SPARQL_UPDATE_ENDPOINT = f"{FUSEKI_URL}/{DATASET_NAME}/update"

ONTOLOGY_PREFIX = "http://www.semanticweb.org/user/ontologies/2025/8/nutrition#"

def escape_sparql_string(s):
    """Escape special characters in SPARQL string literals"""
    if s is None:
        return ""
    s = str(s)
    s = s.replace("\\", "\\\\")
    s = s.replace('"', '\\"')
    s = s.replace("\n", "\\n")
    s = s.replace("\r", "\\r")
    s = s.replace("\t", "\\t")
    return s

def build_sparql_value(value, data_type="string"):
    """Build a properly formatted SPARQL value with type"""
    if value is None:
        return None
    
    if data_type == "string":
        escaped = escape_sparql_string(value)
        return f'"{escaped}"^^xsd:string'
    elif data_type == "integer":
        return f'"{int(value)}"^^xsd:integer'
    elif data_type == "float":
        return f'"{float(value)}"^^xsd:float'
    elif data_type == "boolean":
        return f'"{str(value).lower()}"^^xsd:boolean'
    return None

def check_fuseki_connection():
    """Check if Fuseki is accessible"""
    try:
        response = requests.get(
            f"{FUSEKI_URL}/$/ping",
            timeout=5,
            auth=HTTPBasicAuth(FUSEKI_USERNAME, FUSEKI_PASSWORD)
        )
        return response.status_code == 200
    except Exception as e:
        print(f"[v0] Fuseki connection error: {str(e)}")
        return False

def generate_uri(entity_type, entity_id=None):
    """Generate a URI for an entity"""
    if entity_id is None:
        entity_id = str(uuid.uuid4())
    safe_id = quote(str(entity_id), safe='')
    return f"{ONTOLOGY_PREFIX}{entity_type.lower()}_{safe_id}"



def sparql_update(query):
    """Execute a SPARQL UPDATE query"""
    try:
        # Ajouter les préfixes nécessaires
        full_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        {query}
        """
        print(f"[v0] SPARQL Update:\n{full_query}\n")
        response = requests.post(
            SPARQL_UPDATE_ENDPOINT,
            data={"update": full_query},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            auth=HTTPBasicAuth(FUSEKI_USERNAME, FUSEKI_PASSWORD),
            timeout=10
        )
        success = response.status_code == 200 or response.status_code == 204
        if not success:
            print(f"[v0] Update Error: {response.status_code} - {response.text[:300]}")
        else:
            print(f"[v0] Update successful")
        return success, response.text if not success else ""
    except Exception as e:
        print(f"[v0] Update Error: {str(e)}")
        return False, str(e)

def sparql_query(query):
    """Execute a SPARQL SELECT query"""
    try:
        # Ajouter les préfixes nécessaires
        full_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        {query}
        """
        print(f"[v0] SPARQL Query:\n{full_query}\n")
        response = requests.post(
            SPARQL_QUERY_ENDPOINT,
            data={"query": full_query},
            headers={"Accept": "application/sparql-results+json"},
            auth=HTTPBasicAuth(FUSEKI_USERNAME, FUSEKI_PASSWORD),
            timeout=10
        )
        if response.status_code == 200:
            result = response.json()
            bindings = result.get('results', {}).get('bindings', [])
            print(f"[v0] Query returned {len(bindings)} results")
            return result
        else:
            print(f"[v0] SPARQL Query Error: {response.status_code} - {response.text[:300]}")
            return {"results": {"bindings": []}, "error": f"HTTP {response.status_code}"}
    except Exception as e:
        print(f"[v0] Query Error: {str(e)}")
        return {"results": {"bindings": []}, "error": str(e)}


# ==================== HEALTH CHECK ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Check if backend and Fuseki are running"""
    fuseki_ok = check_fuseki_connection()
    return jsonify({
        "backend": "ok",
        "fuseki": "ok" if fuseki_ok else "error",
        "fuseki_url": FUSEKI_URL,
        "dataset": DATASET_NAME
    })

# ==================== PERSONNE CRUD ====================

@app.route('/api/personnes', methods=['GET'])
def get_personnes():
    """Get all persons"""
    query = f"""
    PREFIX nutrition: <{ONTOLOGY_PREFIX}>
    SELECT ?id ?nom ?âge ?poids ?taille ?objectifPoids WHERE {{
        ?person a nutrition:Personne ;
                nutrition:nom ?nom ;
                nutrition:âge ?âge ;
                nutrition:poids ?poids ;
                nutrition:taille ?taille .
        OPTIONAL {{ ?person nutrition:objectifPoids ?objectifPoids }}
        BIND(STRAFTER(STR(?person), "#") AS ?id)
    }}
    """
    results = sparql_query(query)
    return jsonify(results.get("results", {}).get("bindings", []))

@app.route('/api/personnes', methods=['POST'])
def create_personne():
    """Create a new person"""
    try:
        data = request.json
        person_id = data.get('id', f"personne_{uuid.uuid4().hex[:8]}")
        person_uri = generate_uri("personne", person_id)
        
        nom_val = build_sparql_value(data.get('nom', 'Unknown'), 'string')
        age_val = build_sparql_value(data.get('âge', 0), 'integer')
        poids_val = build_sparql_value(data.get('poids', 0.0), 'float')
        taille_val = build_sparql_value(data.get('taille', 0.0), 'float')
        
        triples = f"""
            <{person_uri}> a nutrition:Personne ;
                           nutrition:nom {nom_val} ;
                           nutrition:âge {age_val} ;
                           nutrition:poids {poids_val} ;
                           nutrition:taille {taille_val}"""
        
        if data.get('objectifPoids'):
            objectifPoids_val = build_sparql_value(data.get('objectifPoids'), 'float')
            triples += f" ;\n                           nutrition:objectifPoids {objectifPoids_val}"
        
        triples += " ."
        
        update_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        INSERT DATA {{
            {triples}
        }}
        """
        
        success, error = sparql_update(update_query)
        if success:
            return jsonify({"success": True, "id": person_id}), 201
        else:
            return jsonify({"success": False, "error": error}), 400
    except ValueError as e:
        return jsonify({"success": False, "error": f"Invalid data format: {str(e)}"}), 400
    except Exception as e:
        print(f"[v0] Error creating personne: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/personnes/<person_id>', methods=['PUT'])
def update_personne(person_id):
    """Update a person"""
    try:
        data = request.json
        person_uri = generate_uri("personne", person_id)
        
        # Delete old data
        delete_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        DELETE {{ <{person_uri}> ?p ?o }}
        WHERE {{ <{person_uri}> ?p ?o }}
        """
        sparql_update(delete_query)
        
        # Insert new data
        nom_val = build_sparql_value(data.get('nom', 'Unknown'), 'string')
        age_val = build_sparql_value(data.get('âge', 0), 'integer')
        poids_val = build_sparql_value(data.get('poids', 0.0), 'float')
        taille_val = build_sparql_value(data.get('taille', 0.0), 'float')
        
        triples = f"""
            <{person_uri}> a nutrition:Personne ;
                           nutrition:nom {nom_val} ;
                           nutrition:âge {age_val} ;
                           nutrition:poids {poids_val} ;
                           nutrition:taille {taille_val}"""
        
        if data.get('objectifPoids'):
            objectifPoids_val = build_sparql_value(data.get('objectifPoids'), 'float')
            triples += f" ;\n                           nutrition:objectifPoids {objectifPoids_val}"
        
        triples += " ."
        
        insert_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        INSERT DATA {{
            {triples}
        }}
        """
        
        success, error = sparql_update(insert_query)
        return jsonify({"success": success, "error": error if not success else ""})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/personnes/<person_id>', methods=['DELETE'])
def delete_personne(person_id):
    """Delete a person"""
    try:
        person_uri = generate_uri("personne", person_id)
        delete_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        DELETE {{ <{person_uri}> ?p ?o }}
        WHERE {{ <{person_uri}> ?p ?o }}
        """
        success, error = sparql_update(delete_query)
        return jsonify({"success": success, "error": error if not success else ""})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

# ==================== ALIMENT CRUD ====================

@app.route('/api/aliments', methods=['GET'])
def get_aliments():
    """Get all foods"""
    query = f"""
    PREFIX nutrition: <{ONTOLOGY_PREFIX}>
    SELECT ?id ?nom ?calories ?indexGlycémique ?teneurFibres ?teneurSodium WHERE {{
        ?aliment a nutrition:Aliment ;
                 nutrition:nom ?nom ;
                 nutrition:calories ?calories ;
                 nutrition:indexGlycémique ?indexGlycémique .
        OPTIONAL {{ ?aliment nutrition:teneurFibres ?teneurFibres }}
        OPTIONAL {{ ?aliment nutrition:teneurSodium ?teneurSodium }}
        BIND(STRAFTER(STR(?aliment), "#") AS ?id)
    }}
    """
    results = sparql_query(query)
    return jsonify(results.get("results", {}).get("bindings", []))

@app.route('/api/aliments', methods=['POST'])
def create_aliment():
    """Create a new food"""
    try:
        data = request.json
        aliment_id = data.get('id', f"aliment_{uuid.uuid4().hex[:8]}")
        aliment_uri = generate_uri("aliment", aliment_id)
        
        nom_val = build_sparql_value(data.get('nom', 'Unknown'), 'string')
        calories_val = build_sparql_value(data.get('calories', 0), 'integer')
        indexGlycemique_val = build_sparql_value(data.get('indexGlycémique', 0), 'integer')
        
        triples = f"""
            <{aliment_uri}> a nutrition:Aliment ;
                            nutrition:nom {nom_val} ;
                            nutrition:calories {calories_val} ;
                            nutrition:indexGlycémique {indexGlycemique_val}"""
        
        if data.get('teneurFibres'):
            teneurFibres_val = build_sparql_value(data.get('teneurFibres'), 'float')
            triples += f" ;\n                            nutrition:teneurFibres {teneurFibres_val}"
        
        if data.get('teneurSodium'):
            teneurSodium_val = build_sparql_value(data.get('teneurSodium'), 'float')
            triples += f" ;\n                            nutrition:teneurSodium {teneurSodium_val}"
        
        triples += " ."
        
        update_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        INSERT DATA {{
            {triples}
        }}
        """
        
        success, error = sparql_update(update_query)
        if success:
            return jsonify({"success": True, "id": aliment_id}), 201
        else:
            return jsonify({"success": False, "error": error}), 400
    except ValueError as e:
        return jsonify({"success": False, "error": f"Invalid data format: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/aliments/<aliment_id>', methods=['PUT'])
def update_aliment(aliment_id):
    """Update a food"""
    try:
        data = request.json
        aliment_uri = generate_uri("aliment", aliment_id)
        
        # Delete old data
        delete_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        DELETE {{ <{aliment_uri}> ?p ?o }}
        WHERE {{ <{aliment_uri}> ?p ?o }}
        """
        sparql_update(delete_query)
        
        # Insert new data
        nom_val = build_sparql_value(data.get('nom', 'Unknown'), 'string')
        calories_val = build_sparql_value(data.get('calories', 0), 'integer')
        indexGlycemique_val = build_sparql_value(data.get('indexGlycémique', 0), 'integer')
        
        triples = f"""
            <{aliment_uri}> a nutrition:Aliment ;
                            nutrition:nom {nom_val} ;
                            nutrition:calories {calories_val} ;
                            nutrition:indexGlycémique {indexGlycemique_val}"""
        
        if data.get('teneurFibres'):
            teneurFibres_val = build_sparql_value(data.get('teneurFibres'), 'float')
            triples += f" ;\n                            nutrition:teneurFibres {teneurFibres_val}"
        
        if data.get('teneurSodium'):
            teneurSodium_val = build_sparql_value(data.get('teneurSodium'), 'float')
            triples += f" ;\n                            nutrition:teneurSodium {teneurSodium_val}"
        
        triples += " ."
        
        insert_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        INSERT DATA {{
            {triples}
        }}
        """
        
        success, error = sparql_update(insert_query)
        return jsonify({"success": success, "error": error if not success else ""})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/aliments/<aliment_id>', methods=['DELETE'])
def delete_aliment(aliment_id):
    """Delete a food"""
    try:
        aliment_uri = generate_uri("aliment", aliment_id)
        delete_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        DELETE {{ <{aliment_uri}> ?p ?o }}
        WHERE {{ <{aliment_uri}> ?p ?o }}
        """
        success, error = sparql_update(delete_query)
        return jsonify({"success": success, "error": error if not success else ""})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

# ==================== ACTIVITÉ PHYSIQUE CRUD ====================

@app.route('/api/activites', methods=['GET'])
def get_activites():
    """Get all physical activities"""
    query = f"""
    PREFIX nutrition: <{ONTOLOGY_PREFIX}>
    SELECT ?id ?nom ?dureeActivite ?type WHERE {{
        ?activite a nutrition:ActivitePhysique ;
                  nutrition:nom ?nom ;
                  nutrition:dureeActivite ?dureeActivite .
        OPTIONAL {{ ?activite nutrition:type ?type }}
        BIND(STRAFTER(STR(?activite), "#") AS ?id)
    }}
    """
    results = sparql_query(query)
    return jsonify(results.get("results", {}).get("bindings", []))

@app.route('/api/activites', methods=['POST'])
def create_activite():
    """Create a new physical activity"""
    try:
        data = request.json
        activite_id = data.get('id', f"activite_{uuid.uuid4().hex[:8]}")
        activite_uri = generate_uri("activite", activite_id)
        
        nom_val = build_sparql_value(data.get('nom', 'Unknown'), 'string')
        dureeActivite_val = build_sparql_value(data.get('dureeActivite', 0), 'integer')
        
        triples = f"""
            <{activite_uri}> a nutrition:ActivitePhysique ;
                             nutrition:nom {nom_val} ;
                             nutrition:dureeActivite {dureeActivite_val}"""
        
        if data.get('type'):
            type_val = build_sparql_value(data.get('type'), 'string')
            triples += f" ;\n                             nutrition:type {type_val}"
        
        triples += " ."
        
        update_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        INSERT DATA {{
            {triples}
        }}
        """
        
        success, error = sparql_update(update_query)
        if success:
            return jsonify({"success": True, "id": activite_id}), 201
        else:
            return jsonify({"success": False, "error": error}), 400
    except ValueError as e:
        return jsonify({"success": False, "error": f"Invalid data format: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/activites/<activite_id>', methods=['PUT'])
def update_activite(activite_id):
    """Update a physical activity"""
    try:
        data = request.json
        activite_uri = generate_uri("activite", activite_id)
        
        # Delete old data
        delete_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        DELETE {{ <{activite_uri}> ?p ?o }}
        WHERE {{ <{activite_uri}> ?p ?o }}
        """
        sparql_update(delete_query)
        
        # Insert new data
        nom_val = build_sparql_value(data.get('nom', 'Unknown'), 'string')
        dureeActivite_val = build_sparql_value(data.get('dureeActivite', 0), 'integer')
        
        triples = f"""
            <{activite_uri}> a nutrition:ActivitePhysique ;
                             nutrition:nom {nom_val} ;
                             nutrition:dureeActivite {dureeActivite_val}"""
        
        if data.get('type'):
            type_val = build_sparql_value(data.get('type'), 'string')
            triples += f" ;\n                             nutrition:type {type_val}"
        
        triples += " ."
        
        insert_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        INSERT DATA {{
            {triples}
        }}
        """
        
        success, error = sparql_update(insert_query)
        return jsonify({"success": success, "error": error if not success else ""})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/activites/<activite_id>', methods=['DELETE'])
def delete_activite(activite_id):
    """Delete a physical activity"""
    try:
        activite_uri = generate_uri("activite", activite_id)
        delete_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        DELETE {{ <{activite_uri}> ?p ?o }}
        WHERE {{ <{activite_uri}> ?p ?o }}
        """
        success, error = sparql_update(delete_query)
        return jsonify({"success": success, "error": error if not success else ""})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

# ==================== NUTRIMENT CRUD ====================

@app.route('/api/nutriments', methods=['GET'])
def get_nutriments():
    """Get all nutrients"""
    query = f"""
    PREFIX nutrition: <{ONTOLOGY_PREFIX}>
    SELECT ?id ?nom ?doseRecommandée ?unitéDose WHERE {{
        ?nutriment a nutrition:Nutriment ;
                   nutrition:nom ?nom ;
                   nutrition:doseRecommandée ?doseRecommandée ;
                   nutrition:unitéDose ?unitéDose .
        BIND(STRAFTER(STR(?nutriment), "#") AS ?id)
    }}
    """
    results = sparql_query(query)
    return jsonify(results.get("results", {}).get("bindings", []))

@app.route('/api/nutriments', methods=['POST'])
def create_nutriment():
    """Create a new nutrient"""
    try:
        data = request.json
        nutriment_id = data.get('id', f"nutriment_{uuid.uuid4().hex[:8]}")
        nutriment_uri = generate_uri("nutriment", nutriment_id)
        
        nom_val = build_sparql_value(data.get('nom', 'Unknown'), 'string')
        doseRecommandee_val = build_sparql_value(data.get('doseRecommandée', 0.0), 'float')
        uniteDose_val = build_sparql_value(data.get('unitéDose', 'mg'), 'string')
        
        triples = f"""
            <{nutriment_uri}> a nutrition:Nutriment ;
                              nutrition:nom {nom_val} ;
                              nutrition:doseRecommandée {doseRecommandee_val} ;
                              nutrition:unitéDose {uniteDose_val} ."""
        
        update_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        INSERT DATA {{
            {triples}
        }}
        """
        
        success, error = sparql_update(update_query)
        if success:
            return jsonify({"success": True, "id": nutriment_id}), 201
        else:
            return jsonify({"success": False, "error": error}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/nutriments/<nutriment_id>', methods=['DELETE'])
def delete_nutriment(nutriment_id):
    """Delete a nutrient"""
    try:
        nutriment_uri = generate_uri("nutriment", nutriment_id)
        delete_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        DELETE {{ <{nutriment_uri}> ?p ?o }}
        WHERE {{ <{nutriment_uri}> ?p ?o }}
        """
        success, error = sparql_update(delete_query)
        return jsonify({"success": success, "error": error if not success else ""})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

# ==================== CONDITION MÉDICALE CRUD ====================

@app.route('/api/conditions', methods=['GET'])
def get_conditions():
    """Get all medical conditions"""
    query = f"""
    PREFIX nutrition: <{ONTOLOGY_PREFIX}>
    SELECT ?id ?nom WHERE {{
        ?condition a nutrition:ConditionMedicale ;
                   nutrition:nom ?nom .
        BIND(STRAFTER(STR(?condition), "#") AS ?id)
    }}
    """
    results = sparql_query(query)
    return jsonify(results.get("results", {}).get("bindings", []))

@app.route('/api/conditions', methods=['POST'])
def create_condition():
    """Create a new medical condition"""
    try:
        data = request.json
        condition_id = data.get('id', f"condition_{uuid.uuid4().hex[:8]}")
        condition_uri = generate_uri("condition", condition_id)
        
        nom_val = build_sparql_value(data.get('nom', 'Unknown'), 'string')
        
        triples = f"""
            <{condition_uri}> a nutrition:ConditionMedicale ;
                              nutrition:nom {nom_val} ."""
        
        update_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        INSERT DATA {{
            {triples}
        }}
        """
        
        success, error = sparql_update(update_query)
        if success:
            return jsonify({"success": True, "id": condition_id}), 201
        else:
            return jsonify({"success": False, "error": error}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/conditions/<condition_id>', methods=['DELETE'])
def delete_condition(condition_id):
    """Delete a medical condition"""
    try:
        condition_uri = generate_uri("condition", condition_id)
        delete_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        DELETE {{ <{condition_uri}> ?p ?o }}
        WHERE {{ <{condition_uri}> ?p ?o }}
        """
        success, error = sparql_update(delete_query)
        return jsonify({"success": success, "error": error if not success else ""})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

# ==================== ALLERGIE CRUD ====================

@app.route('/api/allergies', methods=['GET'])
def get_allergies():
    """Get all allergies"""
    query = f"""
    PREFIX nutrition: <{ONTOLOGY_PREFIX}>
    SELECT ?id ?nom ?typeAllergie WHERE {{
        ?allergie a nutrition:Allergie ;
                  nutrition:nom ?nom ;
                  nutrition:typeAllergie ?typeAllergie .
        BIND(STRAFTER(STR(?allergie), "#") AS ?id)
    }}
    """
    results = sparql_query(query)
    return jsonify(results.get("results", {}).get("bindings", []))

@app.route('/api/allergies', methods=['POST'])
def create_allergie():
    """Create a new allergy"""
    try:
        data = request.json
        allergie_id = data.get('id', f"allergie_{uuid.uuid4().hex[:8]}")
        allergie_uri = generate_uri("allergie", allergie_id)
        
        nom_val = build_sparql_value(data.get('nom', 'Unknown'), 'string')
        typeAllergie_val = build_sparql_value(data.get('typeAllergie', 'Unknown'), 'string')
        
        triples = f"""
            <{allergie_uri}> a nutrition:Allergie ;
                             nutrition:nom {nom_val} ;
                             nutrition:typeAllergie {typeAllergie_val} ."""
        
        update_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        INSERT DATA {{
            {triples}
        }}
        """
        
        success, error = sparql_update(update_query)
        if success:
            return jsonify({"success": True, "id": allergie_id}), 201
        else:
            return jsonify({"success": False, "error": error}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/allergies/<allergie_id>', methods=['DELETE'])
def delete_allergie(allergie_id):
    """Delete an allergy"""
    try:
        allergie_uri = generate_uri("allergie", allergie_id)
        delete_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        DELETE {{ <{allergie_uri}> ?p ?o }}
        WHERE {{ <{allergie_uri}> ?p ?o }}
        """
        success, error = sparql_update(delete_query)
        return jsonify({"success": success, "error": error if not success else ""})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

# ==================== OBJECTIF CRUD ====================

@app.route('/api/objectifs', methods=['GET'])
def get_objectifs():
    """Get all objectives"""
    query = f"""
    PREFIX nutrition: <{ONTOLOGY_PREFIX}>
    SELECT ?id ?nom WHERE {{
        ?objectif a nutrition:Objectif ;
                  nutrition:nom ?nom .
        BIND(STRAFTER(STR(?objectif), "#") AS ?id)
    }}
    """
    results = sparql_query(query)
    bindings = results.get("results", {}).get("bindings", [])
    print("[DEBUG] SPARQL bindings:", bindings)
    return jsonify(bindings)

@app.route('/api/objectifs', methods=['POST'])
def create_objectif():
    """Create a new objective"""
    try:
        data = request.json
        objectif_id = data.get('id', f"objectif_{uuid.uuid4().hex[:8]}")
        objectif_uri = generate_uri("objectif", objectif_id)
        
        nom_val = build_sparql_value(data.get('nom', 'Unknown'), 'string')
        
        triples = f"""
            <{objectif_uri}> a nutrition:Objectif ;
                             nutrition:nom {nom_val} ."""
        
        update_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        INSERT DATA {{
            {triples}
        }}
        """
        
        success, error = sparql_update(update_query)
        if success:
            return jsonify({"success": True, "id": objectif_id}), 201
        else:
            return jsonify({"success": False, "error": error}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400
def clean_objectif_id(objectif_id):
    while objectif_id.startswith("objectif_objectif_"):
        objectif_id = objectif_id[len("objectif_"):]
    return objectif_id
@app.route('/api/objectifs/<objectif_id>', methods=['DELETE'])
def delete_objectif(objectif_id):
    """Delete an objective"""
    try:
        objectif_uri = generate_uri("objectif", clean_objectif_id(objectif_id))
        delete_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        DELETE {{ <{objectif_uri}> ?p ?o }}
        WHERE {{ <{objectif_uri}> ?p ?o }}
        """
        print("[DEBUG] SPARQL Delete:", delete_query)
        success, error = sparql_update(delete_query)
        return jsonify({"success": success, "error": error if not success else ""})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@app.route('/api/objectifs/<objectif_id>', methods=['PUT'])
def update_objectif(objectif_id):
    try:
        data = request.get_json()
        print(f"[DEBUG] Data reçue pour {objectif_id}:", data)

        new_name = data.get("nom")
        if not new_name:
            return jsonify({"success": False, "error": "Nom manquant"}), 400

        objectif_uri = generate_uri("objectif", clean_objectif_id(objectif_id))
        update_query = f"""
PREFIX nutrition: <{ONTOLOGY_PREFIX}>
DELETE {{ <{objectif_uri}> nutrition:nom ?oldName }}
INSERT {{ <{objectif_uri}> nutrition:nom "{new_name}" }}
WHERE {{ <{objectif_uri}> nutrition:nom ?oldName }}
"""
        print("[DEBUG] SPARQL Update:", update_query)
        success, error = sparql_update(update_query)
        return jsonify({"success": success, "error": error if not success else ""})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400



# ==================== RECETTE CRUD ====================

@app.route('/api/recettes', methods=['GET'])
def get_recettes():
    """Get all recipes"""
    query = f"""
    PREFIX nutrition: <{ONTOLOGY_PREFIX}>
    SELECT ?id ?nom ?description ?tempsPréparation ?niveauDifficulté WHERE {{
        ?recette a nutrition:Recette ;
                 nutrition:nom ?nom .
        OPTIONAL {{ ?recette nutrition:description ?description }}
        OPTIONAL {{ ?recette nutrition:tempsPréparation ?tempsPréparation }}
        OPTIONAL {{ ?recette nutrition:niveauDifficulté ?niveauDifficulté }}
        BIND(STRAFTER(STR(?recette), "#") AS ?id)
    }}
    """
    results = sparql_query(query)
    return jsonify(results.get("results", {}).get("bindings", []))

@app.route('/api/recettes', methods=['POST'])
def create_recette():
    """Create a new recipe"""
    try:
        data = request.json
        recette_id = data.get('id', f"recette_{uuid.uuid4().hex[:8]}")
        recette_uri = generate_uri("recette", recette_id)
        
        nom_val = build_sparql_value(data.get('nom', 'Unknown'), 'string')
        description_val = build_sparql_value(data.get('description', 'Unknown'), 'string')
        temps_val = build_sparql_value(data.get('tempsPréparation', 'Unknown'), 'integer')
        niveau_val = build_sparql_value(data.get('niveauDifficulté', 'Unknown'), 'string')

        triples = f"""
            <{recette_uri}> a nutrition:Recette ;
                            nutrition:nom {nom_val} ;
                            nutrition:description {description_val} ;
                            nutrition:tempsPréparation {temps_val} ;
                            nutrition:niveauDifficulté {niveau_val} .
        """

        update_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        INSERT DATA {{
            {triples}
        }}
        """
        
        success, error = sparql_update(update_query)
        if success:
            return jsonify({"success": True, "id": recette_id}), 201
        else:
            return jsonify({"success": False, "error": error}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400
def clean_recette_id(recette_id):
    """Supprime les doublons de 'recette_' dans l'ID"""
    while recette_id.startswith("recette_recette_"):
        recette_id = recette_id[len("recette_"):]
    return recette_id
@app.route('/api/recettes/<recette_id>', methods=['DELETE'])
def delete_recette(recette_id):
    """Delete a recipe"""
    try:
        recette_uri = generate_uri("recette", clean_recette_id(recette_id))
        delete_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        DELETE {{ <{recette_uri}> ?p ?o }}
        WHERE {{ <{recette_uri}> ?p ?o }}
        """
        success, error = sparql_update(delete_query)
        return jsonify({"success": success, "error": error if not success else ""})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400
@app.route('/api/recettes/<recette_id>', methods=['PUT'])
def update_recette(recette_id):
    try:
        data = request.get_json()
        recette_uri = generate_uri("recette", clean_recette_id(recette_id))

        # Mandatory
        new_name = data.get("nom")
        if not new_name:
            return jsonify({"success": False, "error": "Nom manquant"}), 400

        # Optional fields
        new_description = data.get("description")
        new_temps = data.get("tempsPréparation")
        new_niveau = data.get("niveauDifficulté")

        # Update name (always exists)
        name_update = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        DELETE {{ <{recette_uri}> nutrition:nom ?oldName }}
        INSERT {{ <{recette_uri}> nutrition:nom {build_sparql_value(new_name, 'string')} }}
        WHERE {{ <{recette_uri}> nutrition:nom ?oldName }}
        """
        sparql_update(name_update)

        # Optional updates (use INSERT DATA, no DELETE needed)
        optional_triples = []
        if new_description is not None:
            optional_triples.append(f"<{recette_uri}> nutrition:description {build_sparql_value(new_description, 'string')} .")
        if new_temps is not None:
            optional_triples.append(f"<{recette_uri}> nutrition:tempsPréparation {build_sparql_value(new_temps, 'integer')} .")
        if new_niveau is not None:
            optional_triples.append(f"<{recette_uri}> nutrition:niveauDifficulté {build_sparql_value(new_niveau, 'string')} .")

        if optional_triples:
            insert_data = f"""
            PREFIX nutrition: <{ONTOLOGY_PREFIX}>
            INSERT DATA {{
                {' '.join(optional_triples)}
            }}
            """
            sparql_update(insert_data)

        return jsonify({"success": True}), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


# ==================== REPAS CRUD ====================

@app.route('/api/repas', methods=['GET'])
def get_repas():
    """Get all meals"""
    query = f"""
    PREFIX nutrition: <{ONTOLOGY_PREFIX}>
    SELECT ?id ?nom ?type WHERE {{
        ?repas a nutrition:Repas ;
               nutrition:nom ?nom .
        OPTIONAL {{ ?repas nutrition:type ?type }}
        BIND(STRAFTER(STR(?repas), "#") AS ?id)
    }}
    """
    results = sparql_query(query)
    return jsonify(results.get("results", {}).get("bindings", []))

@app.route('/api/repas', methods=['POST'])
def create_repas():
    """Create a new meal"""
    try:
        data = request.json
        repas_id = data.get('id', f"repas_{uuid.uuid4().hex[:8]}")
        repas_uri = generate_uri("repas", repas_id)
        
        nom_val = build_sparql_value(data.get('nom', 'Unknown'), 'string')
        
        triples = f"""
            <{repas_uri}> a nutrition:Repas ;
                          nutrition:nom {nom_val} ."""
        
        update_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        INSERT DATA {{
            {triples}
        }}
        """
        
        success, error = sparql_update(update_query)
        if success:
            return jsonify({"success": True, "id": repas_id}), 201
        else:
            return jsonify({"success": False, "error": error}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

def clean_repas_id(repas_id):
    """Supprime les doublons de 'repas_' dans l'ID"""
    while repas_id.startswith("repas_repas_"):
        repas_id = repas_id[len("repas_"):]
    return repas_id

@app.route('/api/repas/<repas_id>', methods=['DELETE'])
def delete_repas(repas_id):
    """Delete a meal"""
    try:
        clean_id = clean_repas_id(repas_id)
        repas_uri = generate_uri("repas", clean_id)  # ici "repas", pas "repas_id"
        delete_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        DELETE {{ <{repas_uri}> ?p ?o }}
        WHERE {{ <{repas_uri}> ?p ?o }}
        """
        print("[DEBUG] SPARQL Delete:", delete_query)
        success, error = sparql_update(delete_query)
        return jsonify({"success": success, "error": error if not success else ""})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400
@app.route('/api/repas/<repas_id>', methods=['PUT'])
def update_repas(repas_id):
    """Update a meal"""
    try:
        data = request.get_json()
        print(f"[DEBUG] Data reçue pour {repas_id}:", data)

        new_name = data.get("nom")
        if not new_name:
            return jsonify({"success": False, "error": "Nom manquant"}), 400

        clean_id = clean_repas_id(repas_id)   # <--- nettoyage
        repas_uri = generate_uri("repas", clean_id)

        update_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        DELETE {{ <{repas_uri}> nutrition:nom ?oldName }}
        INSERT {{ <{repas_uri}> nutrition:nom "{new_name}" }}
        WHERE {{ <{repas_uri}> nutrition:nom ?oldName }}
        """
        print("[DEBUG] SPARQL Update:", update_query)
        success, error = sparql_update(update_query)
        return jsonify({"success": success, "error": error if not success else ""})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


# ==================== PROGRAMME BIEN-ÊTRE CRUD ====================

@app.route('/api/programmes', methods=['GET'])
def get_programmes():
    """Get all wellness programs"""
    query = f"""
    PREFIX nutrition: <{ONTOLOGY_PREFIX}>
    SELECT ?id ?personneId ?objectifId ?dateDebut ?dateFin WHERE {{
        ?programme a nutrition:ProgrammeBienEtre ;
                   nutrition:AProgramme ?personne ;
                   nutrition:Vise ?objectif .
        OPTIONAL {{ ?programme nutrition:dateDebut ?dateDebut }}
        OPTIONAL {{ ?programme nutrition:dateFin ?dateFin }}
        BIND(STRAFTER(STR(?programme), "#") AS ?id)
        BIND(STRAFTER(STR(?personne), "#") AS ?personneId)
        BIND(STRAFTER(STR(?objectif), "#") AS ?objectifId)
    }}
    """
    results = sparql_query(query)
    return jsonify(results.get("results", {}).get("bindings", []))

@app.route('/api/programmes', methods=['POST'])
def create_programme():
    """Create a new wellness program"""
    try:
        data = request.json
        programme_id = data.get('id', f"programme_{uuid.uuid4().hex[:8]}")
        programme_uri = generate_uri("programme", programme_id)
        personne_uri = generate_uri("personne", data.get('personneId'))
        objectif_uri = generate_uri("objectif", data.get('objectifId'))
        
        update_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        INSERT DATA {{
            <{programme_uri}> a nutrition:ProgrammeBienEtre ;
                              nutrition:AProgramme <{personne_uri}> ;
                              nutrition:Vise <{objectif_uri}> .
        }}
        """
        success, error = sparql_update(update_query)
        if success:
            return jsonify({"success": True, "id": programme_id}), 201
        else:
            return jsonify({"success": False, "error": error}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/programmes/<programme_id>', methods=['DELETE'])
def delete_programme(programme_id):
    """Delete a wellness program"""
    try:
        programme_uri = generate_uri("programme", programme_id)
        delete_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        DELETE {{ <{programme_uri}> ?p ?o }}
        WHERE {{ <{programme_uri}> ?p ?o }}
        """
        success, error = sparql_update(delete_query)
        return jsonify({"success": success, "error": error if not success else ""})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

# ==================== PRÉFÉRENCE ALIMENTAIRE CRUD ====================

@app.route('/api/preferences', methods=['GET'])
def get_preferences():
    """Get all food preferences"""
    query = f"""
    PREFIX nutrition: <{ONTOLOGY_PREFIX}>
    SELECT ?id ?nom WHERE {{
        ?pref a nutrition:PreferenceAlimentaire ;
              nutrition:nom ?nom .
        BIND(STRAFTER(STR(?pref), "#") AS ?id)
    }}
    """
    results = sparql_query(query)
    return jsonify(results.get("results", {}).get("bindings", []))

@app.route('/api/preferences', methods=['POST'])
def create_preference():
    """Create a new food preference"""
    try:
        data = request.json
        pref_id = data.get('id', f"pref_{uuid.uuid4().hex[:8]}")
        pref_uri = generate_uri("pref", pref_id)
        
        nom_val = build_sparql_value(data.get('nom', 'Unknown'), 'string')
        
        triples = f"""
            <{pref_uri}> a nutrition:PreferenceAlimentaire ;
                         nutrition:nom {nom_val} ."""
        
        update_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        INSERT DATA {{
            {triples}
        }}
        """
        
        success, error = sparql_update(update_query)
        if success:
            return jsonify({"success": True, "id": pref_id}), 201
        else:
            return jsonify({"success": False, "error": error}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/preferences/<pref_id>', methods=['DELETE'])
def delete_preference(pref_id):
    """Delete a food preference"""
    try:
        pref_uri = generate_uri("pref", pref_id)
        delete_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        DELETE {{ <{pref_uri}> ?p ?o }}
        WHERE {{ <{pref_uri}> ?p ?o }}
        """
        success, error = sparql_update(delete_query)
        return jsonify({"success": success, "error": error if not success else ""})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

# ==================== RECOMMANDATION CRUD ====================

@app.route('/api/recommandations', methods=['GET'])
def get_recommandations():
    """Get all recommendations"""
    query = f"""
    PREFIX nutrition: <{ONTOLOGY_PREFIX}>
    SELECT ?id ?personneId ?alimentId ?activiteId ?dateCreation WHERE {{
        ?rec a nutrition:Recommandation ;
             nutrition:recommande ?personne ;
             nutrition:associeAliment ?aliment .
        OPTIONAL {{ ?rec nutrition:associeActivite ?activite }}
        OPTIONAL {{ ?rec nutrition:dateCreation ?dateCreation }}
        BIND(STRAFTER(STR(?rec), "#") AS ?id)
        BIND(STRAFTER(STR(?personne), "#") AS ?personneId)
        BIND(STRAFTER(STR(?aliment), "#") AS ?alimentId)
        BIND(STRAFTER(STR(?activite), "#") AS ?activiteId)
    }}
    """
    results = sparql_query(query)
    return jsonify(results.get("results", {}).get("bindings", []))

@app.route('/api/recommandations', methods=['POST'])
def create_recommandation():
    """Create a new recommendation"""
    try:
        data = request.json
        rec_id = data.get('id', f"recommandation_{uuid.uuid4().hex[:8]}")
        rec_uri = generate_uri("recommandation", rec_id)
        personne_uri = generate_uri("personne", data.get('personneId'))
        aliment_uri = generate_uri("aliment", data.get('alimentId'))
        
        update_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        INSERT DATA {{
            <{rec_uri}> a nutrition:Recommandation ;
                        nutrition:recommande <{personne_uri}> ;
                        nutrition:associeAliment <{aliment_uri}> ;
                        nutrition:dateCreation "{datetime.now().isoformat()}"^^<http://www.w3.org/2001/XMLSchema#string> .
        }}
        """
        
        success, error = sparql_update(update_query)
        if success:
            return jsonify({"success": True, "id": rec_id}), 201
        else:
            return jsonify({"success": False, "error": error}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/recommandations/<rec_id>', methods=['DELETE'])
def delete_recommandation(rec_id):
    """Delete a recommendation"""
    try:
        rec_uri = generate_uri("recommandation", rec_id)
        delete_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        DELETE {{ <{rec_uri}> ?p ?o }}
        WHERE {{ <{rec_uri}> ?p ?o }}
        """
        success, error = sparql_update(delete_query)
        return jsonify({"success": success, "error": error if not success else ""})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

# ==================== SEMANTIC SEARCH ENDPOINTS ====================

@app.route('/api/semantic-search', methods=['POST'])
def semantic_search():
    """Advanced semantic search using natural language queries"""
    try:
        data = request.json
        query_text = data.get('query', '').lower().strip()
        
        if not query_text:
            return jsonify({"error": "Query is required"}), 400
        
        # Analyse sémantique de la question
        sparql_query_text = build_sparql_from_natural_language(query_text)
        
        if not sparql_query_text:
            return jsonify({"error": "Désolé, je n'ai pas compris votre question. Essayez de la reformuler."}), 400
        
        print(f"[Semantic Search] Generated SPARQL:\n{sparql_query_text}")
        
        # Exécuter la requête SPARQL
        results = sparql_query(sparql_query_text)
        
        # Vérifier si c'est une erreur
        if "error" in results:
            return jsonify({"error": results["error"]}), 400
            
        return jsonify({
            "results": results.get("results", {}).get("bindings", []),
            "generated_sparql": sparql_query_text,
            "original_query": query_text
        })
        
    except Exception as e:
        print(f"[Semantic Search] Error: {str(e)}")
        return jsonify({"error": f"Erreur lors de la recherche: {str(e)}"}), 400

def build_sparql_from_natural_language(query_text):
    """Convert natural language query to SPARQL"""
    
    # Détection des intentions et entités
    words = query_text.split()
    
    # Détection du type d'entité recherché
    entity_type = "Aliment"  # Par défaut
    if any(word in query_text for word in ["recette", "recettes", "préparer", "cuisiner"]):
        entity_type = "Recette"
    elif any(word in query_text for word in ["activité", "activités", "sport", "exercice"]):
        entity_type = "ActivitePhysique"
    elif any(word in query_text for word in ["personne", "utilisateur", "patient"]):
        entity_type = "Personne"
    
    # Construction de la requête SPARQL de base
    base_query = f"""
    PREFIX nutrition: <{ONTOLOGY_PREFIX}>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    SELECT ?id ?nom ?type ?score ?details ?calories ?indexGlycemique ?teneurFibres ?teneurSodium WHERE {{
    """
    
    # Détection des critères de recherche
    filters = []
    additional_selects = []
    additional_triples = []
    order_by = "?nom"
    
    # Calories
    if any(word in query_text for word in ["calorie", "calories", "énergétique"]):
        additional_selects.append("?calories")
        additional_triples.append("OPTIONAL { ?entity nutrition:calories ?calories }")
        if "faible" in query_text or "bas" in query_text or "peu" in query_text:
            filters.append("(?calories <= 150 || !BOUND(?calories))")
            order_by = "?calories"
        elif "élevé" in query_text or "haut" in query_text or "beaucoup" in query_text:
            filters.append("?calories >= 300")
            order_by = "DESC(?calories)"
    
    # Index glycémique
    if any(word in query_text for word in ["glycémique", "ig", "index glycémique", "sucre"]):
        additional_selects.append("?indexGlycemique")
        additional_triples.append("OPTIONAL { ?entity nutrition:indexGlycémique ?indexGlycemique }")
        if "faible" in query_text or "bas" in query_text:
            filters.append("(?indexGlycemique <= 55 || !BOUND(?indexGlycemique))")
            order_by = "?indexGlycemique"
        elif "élevé" in query_text or "haut" in query_text:
            filters.append("?indexGlycemique >= 70")
            order_by = "DESC(?indexGlycemique)"
    
    # Fibres
    if any(word in query_text for word in ["fibre", "fibres", "fibreux"]):
        additional_selects.append("?teneurFibres")
        additional_triples.append("OPTIONAL { ?entity nutrition:teneurFibres ?teneurFibres }")
        if "riche" in query_text or "beaucoup" in query_text or "élevé" in query_text:
            filters.append("(?teneurFibres >= 5.0 || !BOUND(?teneurFibres))")
            order_by = "DESC(?teneurFibres)"
    
    # Sodium
    if any(word in query_text for word in ["sodium", "sel", "salé"]):
        additional_selects.append("?teneurSodium")
        additional_triples.append("OPTIONAL { ?entity nutrition:teneurSodium ?teneurSodium }")
        if "faible" in query_text or "peu" in query_text or "bas" in query_text:
            filters.append("(?teneurSodium <= 50 || !BOUND(?teneurSodium))")
            order_by = "?teneurSodium"
    
    # Pour diabétiques
    if "diabétique" in query_text or "diabète" in query_text:
        additional_selects.append("?indexGlycemique")
        additional_triples.append("OPTIONAL { ?entity nutrition:indexGlycémique ?indexGlycemique }")
        filters.append("(?indexGlycemique <= 55 || !BOUND(?indexGlycemique))")
        order_by = "?indexGlycemique"
    
    # Perte de poids
    if any(word in query_text for word in ["minceur", "maigrir", "perte poids", "régime"]):
        additional_selects.append("?calories")
        additional_selects.append("?teneurFibres")
        additional_triples.append("OPTIONAL { ?entity nutrition:calories ?calories }")
        additional_triples.append("OPTIONAL { ?entity nutrition:teneurFibres ?teneurFibres }")
        filters.append("(?calories <= 200 || !BOUND(?calories))")
        filters.append("(?teneurFibres >= 3.0 || !BOUND(?teneurFibres))")
        order_by = "?calories"
    
    # Recherche par nom
    if "appel" in query_text or "nommé" in query_text or "nomme" in query_text:
        # Extraire le nom recherché
        import re
        name_match = re.search(r'appel[ée]s?\s+([^,.!?]+)', query_text)
        if name_match:
            food_name = name_match.group(1).strip()
            filters.append(f'REGEX(?nom, "{food_name}", "i")')
    
    # Construction de la requête finale
    if entity_type == "Aliment":
        base_query += f"""
        ?entity a nutrition:Aliment ;
                nutrition:nom ?nom .
        BIND("Aliment" AS ?type)
        BIND(STRAFTER(STR(?entity), "#") AS ?id)
        """
    elif entity_type == "Recette":
        base_query += f"""
        ?entity a nutrition:Recette ;
                nutrition:nom ?nom .
        BIND("Recette" AS ?type)
        BIND(STRAFTER(STR(?entity), "#") AS ?id)
        """
    elif entity_type == "ActivitePhysique":
        base_query += f"""
        ?entity a nutrition:ActivitePhysique ;
                nutrition:nom ?nom .
        BIND("Activité" AS ?type)
        BIND(STRAFTER(STR(?entity), "#") AS ?id)
        """
    elif entity_type == "Personne":
        base_query += f"""
        ?entity a nutrition:Personne ;
                nutrition:nom ?nom .
        BIND("Personne" AS ?type)
        BIND(STRAFTER(STR(?entity), "#") AS ?id)
        """
    
    # Ajouter les triplets supplémentaires
    for triple in additional_triples:
        base_query += f"    {triple}\n"
    
    # Ajouter les filtres
    if filters:
        base_query += "    FILTER(" + " && ".join(filters) + ")\n"
    
    # Calcul du score de pertinence - version simplifiée sans CONCAT problématique
    base_query += """
        BIND(1.0 AS ?score)
        BIND("" AS ?details)
    """
    
    base_query += f"}} ORDER BY {order_by} LIMIT 20"
    
    return base_query

@app.route('/api/search-suggestions', methods=['GET'])
def get_search_suggestions():
    """Get search suggestions based on common queries"""
    suggestions = [
        "Quels aliments sont riches en fibres ?",
        "Montre-moi les aliments à faible index glycémique",
        "Donne-moi des recettes pour diabétiques",
        "Quels aliments pour perdre du poids ?",
        "Aliments faibles en calories",
        "Activités physiques pour brûler des calories",
        "Aliments riches en protéines",
        "Recettes rapides à préparer",
        "Aliments sans gluten",
        "Quels aliments sont bons pour le cœur ?"
    ]
    return jsonify(suggestions)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
