# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from requests.auth import HTTPBasicAuth
import uuid
import os
from urllib.parse import quote
from typing import Dict, List, Optional

# === spaCy ===
import spacy
from spacy.tokens import Doc

# Charger le modèle français
try:
    nlp = spacy.load("fr_core_news_md")
except OSError:
    print("⚠️  Modèle spaCy non trouvé. Exécute: python -m spacy download fr_core_news_md")
    exit(1)

app = Flask(__name__)
CORS(app)
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# === CONFIG ===
FUSEKI_URL = os.getenv("FUSEKI_URL", "http://localhost:3030")
FUSEKI_USERNAME = os.getenv("FUSEKI_USERNAME", "admin")
FUSEKI_PASSWORD = os.getenv("FUSEKI_PASSWORD", "admin")
DATASET_NAME = "nutrition"
SPARQL_QUERY_ENDPOINT = f"{FUSEKI_URL}/{DATASET_NAME}/sparql"
SPARQL_UPDATE_ENDPOINT = f"{FUSEKI_URL}/{DATASET_NAME}/update"
ONTOLOGY_PREFIX = "http://www.semanticweb.org/user/ontologies/2025/8/nutrition#"

# === MOTS-CLÉS & SYNONYMES ===
KEYWORDS = {
    "entity": {
        "aliment": ["aliment", "nourriture", "fruit", "légume", "viande", "poisson", "céréale", "légumineuse", "produit", "ingrédient"],
        "recette": ["recette", "plat", "préparation", "cuisiner", "cuisine", "repas"],
        "activite": ["activité", "sport", "exercice", "mouvement", "marche", "course", "vélo", "natation", "gym"],
        "personne": ["personne", "patient", "utilisateur", "individu", "client"]
    },
    "property": {
        "calories": ["calorie", "énergie", "kcal", "joule", "calorique"],
        "ig": ["index glycémique", "ig", "glycémie", "sucre", "glycémique"],
        "fibres": ["fibre", "fibres", "fibre alimentaire"],
        "sodium": ["sodium", "sel", "salé"]
    },
    "modifier": {
        "faible": ["faible", "bas", "peu", "léger", "light", "pauvre"],
        "élevé": ["élevé", "haut", "beaucoup", "riche", "fort", "abondant"],
        "moyen": ["moyen", "modéré", "moyennement"]
    }
}

# Seuils par défaut
THRESHOLDS = {
    "calories": {"faible": 150, "élevé": 300},
    "ig": {"faible": 55, "moyen": 70},
    "fibres": {"élevé": 5.0},
    "sodium": {"faible": 50}
}

# === UTILITAIRES SPARQL ===
def escape_sparql_string(s):
    if s is None: return ""
    return str(s).replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")

def build_sparql_value(value, data_type="string"):
    if value is None: return None
    if data_type == "string":
        return f'"{escape_sparql_string(value)}"^^xsd:string'
    elif data_type == "integer":
        return f'"{int(value)}"^^xsd:integer'
    elif data_type == "float":
        return f'"{float(value)}"^^xsd:float'
    return None

def generate_uri(entity_type, entity_id=None):
    if entity_id is None:
        entity_id = str(uuid.uuid4())
    safe_id = quote(str(entity_id), safe='')
    return f"{ONTOLOGY_PREFIX}{entity_type.lower()}_{safe_id}"

def sparql_update(query):
    try:
        full_query = f"PREFIX nutrition: <{ONTOLOGY_PREFIX}>\nPREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n{query}"
        response = requests.post(
            SPARQL_UPDATE_ENDPOINT,
            data={"update": full_query},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            auth=HTTPBasicAuth(FUSEKI_USERNAME, FUSEKI_PASSWORD),
            timeout=10
        )
        return response.status_code in [200, 204], response.text
    except Exception as e:
        return False, str(e)

def sparql_query(query):
    try:
        full_query = f"PREFIX nutrition: <{ONTOLOGY_PREFIX}>\nPREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n{query}"
        response = requests.post(
            SPARQL_QUERY_ENDPOINT,
            data={"query": full_query},
            headers={"Accept": "application/sparql-results+json"},
            auth=HTTPBasicAuth(FUSEKI_USERNAME, FUSEKI_PASSWORD),
            timeout=10
        )
        return response.json() if response.status_code == 200 else {"results": {"bindings": []}, "error": f"HTTP {response.status_code}"}
    except Exception as e:
        return {"results": {"bindings": []}, "error": str(e)}

# === NLP + SPARQL BUILDER ===
def build_sparql_from_natural_language(query_text: str) -> str:
    doc = nlp(query_text.lower())
    
    # Détection entité principale
    entity_type = detect_entity_type(doc)
    if not entity_type:
        return None

    # Détection propriétés + modificateurs
    properties = detect_properties(doc)
    
    # Variables SPARQL
    var_entity = "?entity"
    var_id = "?id"
    var_nom = "?nom"
    var_type = "?type"
    
    # SELECT
    select_vars = [var_id, var_nom, var_type]
    optional_triples = []
    filters = []
    order_by = None

    # Ajouter les propriétés
    prop_map = {
        "calories": ("nutrition:calories", "?calories"),
        "ig": ("nutrition:indexGlycémique", "?indexGlycemique"),
        "fibres": ("nutrition:teneurFibres", "?teneurFibres"),
        "sodium": ("nutrition:teneurSodium", "?teneurSodium")
    }

    for prop, modifier in properties.items():
        if prop not in prop_map:
            continue
        pred, var = prop_map[prop]
        optional_triples.append(f"OPTIONAL {{ {var_entity} {pred} {var} }}")
        select_vars.append(var)

        # Filtre selon modificateur
        threshold = THRESHOLDS.get(prop, {})
        if modifier == "faible" and "faible" in threshold:
            val = threshold["faible"]
            filters.append(f"({var} <= {val} || !BOUND({var}))")
            order_by = var
        elif modifier == "élevé" and "élevé" in threshold:
            val = threshold["élevé"]
            filters.append(f"{var} >= {val}")
            order_by = f"DESC({var})"
        elif modifier == "moyen" and prop == "ig":
            filters.append(f"{var} > 55 && {var} <= 70")

    # Corps principal
    class_map = {
        "Aliment": "nutrition:Aliment",
        "Recette": "nutrition:Recette",
        "ActivitePhysique": "nutrition:ActivitePhysique",
        "Personne": "nutrition:Personne"
    }
    class_uri = class_map.get(entity_type)
    if not class_uri:
        return None

    body = f"{var_entity} a {class_uri} ; nutrition:nom {var_nom} . "
    body += f"BIND(\"{entity_type}\" AS {var_type}) "
    body += f"BIND(STRAFTER(STR({var_entity}), \"#\") AS {var_id})"

    # Ajouter les optionnels
    for opt in optional_triples:
        body += opt + " "

    # Filtres
    if filters:
        body += " FILTER(" + " && ".join(filters) + ") "

    # Construire la requête finale
    query = f"SELECT {' '.join(select_vars)} WHERE {{ {body} }} "
    if order_by:
        query += f"ORDER BY {order_by} "
    query += "LIMIT 20"
    
    return query

def detect_entity_type(doc: Doc) -> Optional[str]:
    lemmas = [token.lemma_ for token in doc]
    for entity, keywords in KEYWORDS["entity"].items():
        if any(k in lemmas for k in keywords):
            return entity.capitalize()
    return "Aliment"  # fallback

def detect_properties(doc: Doc) -> Dict[str, str]:
    properties = {}
    current_prop = None
    current_mod = None
    tokens = [token.lemma_ for token in doc]

    for i, token in enumerate(doc):
        lemma = token.lemma_

        # Propriété
        for prop, keys in KEYWORDS["property"].items():
            if lemma in keys or (i > 0 and f"{doc[i-1].lemma_} {lemma}" in keys):
                current_prop = prop

        # Modificateur
        for mod, keys in KEYWORDS["modifier"].items():
            if lemma in keys:
                current_mod = mod

        # Associer
        if current_prop and current_mod:
            properties[current_prop] = current_mod
            current_prop = current_mod = None
        elif current_prop and i == len(doc) - 1:
            properties[current_prop] = "any"

    return properties

# ==================== HEALTH CHECK ====================
@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        response = requests.get(f"{FUSEKI_URL}/$/ping", timeout=5, auth=HTTPBasicAuth(FUSEKI_USERNAME, FUSEKI_PASSWORD))
        fuseki_ok = response.status_code == 200
    except:
        fuseki_ok = False
    return jsonify({
        "backend": "ok",
        "fuseki": "ok" if fuseki_ok else "error",
        "fuseki_url": FUSEKI_URL,
        "dataset": DATASET_NAME
    })

# ==================== PERSONNES ====================
@app.route('/api/personnes', methods=['GET'])
def get_personnes():
    query = """
    SELECT ?id ?nom ?âge ?poids ?taille ?objectifPoids WHERE {
      ?person a nutrition:Personne ;
              nutrition:nom ?nom ;
              nutrition:âge ?âge ;
              nutrition:poids ?poids ;
              nutrition:taille ?taille .
      OPTIONAL { ?person nutrition:objectifPoids ?objectifPoids }
      BIND(STRAFTER(STR(?person), "#") AS ?id)
    }
    """
    results = sparql_query(query)
    return jsonify(results.get("results", {}).get("bindings", []))

@app.route('/api/personnes', methods=['POST'])
def create_personne():
    try:
        data = request.json
        person_id = data.get('id', f"personne_{uuid.uuid4().hex[:8]}")
        person_uri = generate_uri("personne", person_id)
        nom_val = build_sparql_value(data.get('nom', 'Unknown'), 'string')
        age_val = build_sparql_value(data.get('âge', 0), 'integer')
        poids_val = build_sparql_value(data.get('poids', 0.0), 'float')
        taille_val = build_sparql_value(data.get('taille', 0.0), 'float')
        triples = f"<{person_uri}> a nutrition:Personne ; nutrition:nom {nom_val} ; nutrition:âge {age_val} ; nutrition:poids {poids_val} ; nutrition:taille {taille_val}"
        if data.get('objectifPoids'):
            objectif_val = build_sparql_value(data.get('objectifPoids'), 'float')
            triples += f" ; nutrition:objectifPoids {objectif_val}"
        triples += " ."
        success, error = sparql_update(f"INSERT DATA {{ {triples} }}")
        return jsonify({"success": success, "id": person_id if success else None}), 201 if success else 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/personnes/<person_id>', methods=['PUT', 'DELETE'])
def handle_personne(person_id):
    person_uri = generate_uri("personne", person_id)
    if request.method == 'DELETE':
        success, error = sparql_update(f"DELETE WHERE {{ <{person_uri}> ?p ?o }}")
        return jsonify({"success": success, "error": error if not success else ""})
    else:  # PUT
        try:
            data = request.json
            sparql_update(f"DELETE WHERE {{ <{person_uri}> ?p ?o }}")
            nom_val = build_sparql_value(data.get('nom', 'Unknown'), 'string')
            age_val = build_sparql_value(data.get('âge', 0), 'integer')
            poids_val = build_sparql_value(data.get('poids', 0.0), 'float')
            taille_val = build_sparql_value(data.get('taille', 0.0), 'float')
            triples = f"<{person_uri}> a nutrition:Personne ; nutrition:nom {nom_val} ; nutrition:âge {age_val} ; nutrition:poids {poids_val} ; nutrition:taille {taille_val}"
            if data.get('objectifPoids'):
                obj_val = build_sparql_value(data.get('objectifPoids'), 'float')
                triples += f" ; nutrition:objectifPoids {obj_val}"
            triples += " ."
            success, error = sparql_update(f"INSERT DATA {{ {triples} }}")
            return jsonify({"success": success, "error": error if not success else ""})
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 400

# ==================== ALIMENTS ====================
@app.route('/api/aliments', methods=['GET'])
def get_aliments():
    query = """
    SELECT ?id ?nom ?calories ?indexGlycémique ?teneurFibres ?teneurSodium WHERE {
      ?aliment a nutrition:Aliment ;
               nutrition:nom ?nom ;
               nutrition:calories ?calories ;
               nutrition:indexGlycémique ?indexGlycémique .
      OPTIONAL { ?aliment nutrition:teneurFibres ?teneurFibres }
      OPTIONAL { ?aliment nutrition:teneurSodium ?teneurSodium }
      BIND(STRAFTER(STR(?aliment), "#") AS ?id)
    }
    """
    results = sparql_query(query)
    return jsonify(results.get("results", {}).get("bindings", []))

@app.route('/api/aliments', methods=['POST'])
def create_aliment():
    try:
        data = request.json
        aliment_id = data.get('id', f"aliment_{uuid.uuid4().hex[:8]}")
        aliment_uri = generate_uri("aliment", aliment_id)
        nom_val = build_sparql_value(data.get('nom', 'Unknown'), 'string')
        cal_val = build_sparql_value(data.get('calories', 0), 'integer')
        ig_val = build_sparql_value(data.get('indexGlycémique', 0), 'integer')
        triples = f"<{aliment_uri}> a nutrition:Aliment ; nutrition:nom {nom_val} ; nutrition:calories {cal_val} ; nutrition:indexGlycémique {ig_val}"
        if data.get('teneurFibres'):
            fib_val = build_sparql_value(data.get('teneurFibres'), 'float')
            triples += f" ; nutrition:teneurFibres {fib_val}"
        if data.get('teneurSodium'):
            sod_val = build_sparql_value(data.get('teneurSodium'), 'float')
            triples += f" ; nutrition:teneurSodium {sod_val}"
        triples += " ."
        success, error = sparql_update(f"INSERT DATA {{ {triples} }}")
        return jsonify({"success": success, "id": aliment_id if success else None}), 201 if success else 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/aliments/<aliment_id>', methods=['PUT', 'DELETE'])
def handle_aliment(aliment_id):
    aliment_uri = generate_uri("aliment", aliment_id)
    if request.method == 'DELETE':
        success, error = sparql_update(f"DELETE WHERE {{ <{aliment_uri}> ?p ?o }}")
        return jsonify({"success": success, "error": error if not success else ""})
    else:
        try:
            data = request.json
            sparql_update(f"DELETE WHERE {{ <{aliment_uri}> ?p ?o }}")
            nom_val = build_sparql_value(data.get('nom', 'Unknown'), 'string')
            cal_val = build_sparql_value(data.get('calories', 0), 'integer')
            ig_val = build_sparql_value(data.get('indexGlycémique', 0), 'integer')
            triples = f"<{aliment_uri}> a nutrition:Aliment ; nutrition:nom {nom_val} ; nutrition:calories {cal_val} ; nutrition:indexGlycémique {ig_val}"
            if data.get('teneurFibres'):
                triples += f" ; nutrition:teneurFibres {build_sparql_value(data.get('teneurFibres'), 'float')}"
            if data.get('teneurSodium'):
                triples += f" ; nutrition:teneurSodium {build_sparql_value(data.get('teneurSodium'), 'float')}"
            triples += " ."
            success, error = sparql_update(f"INSERT DATA {{ {triples} }}")
            return jsonify({"success": success, "error": error if not success else ""})
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 400

# ==================== ACTIVITÉS ====================
@app.route('/api/activites', methods=['GET', 'POST'])
def handle_activites():
    if request.method == 'GET':
        query = """
        SELECT ?id ?nom ?dureeActivite ?type WHERE {
          ?activite a nutrition:ActivitePhysique ;
                    nutrition:nom ?nom ;
                    nutrition:dureeActivite ?dureeActivite .
          OPTIONAL { ?activite nutrition:type ?type }
          BIND(STRAFTER(STR(?activite), "#") AS ?id)
        }
        """
        results = sparql_query(query)
        return jsonify(results.get("results", {}).get("bindings", []))
    else:
        try:
            data = request.json
            act_id = data.get('id', f"activite_{uuid.uuid4().hex[:8]}")
            act_uri = generate_uri("activite", act_id)
            nom_val = build_sparql_value(data.get('nom', 'Unknown'), 'string')
            dur_val = build_sparql_value(data.get('dureeActivite', 0), 'integer')
            triples = f"<{act_uri}> a nutrition:ActivitePhysique ; nutrition:nom {nom_val} ; nutrition:dureeActivite {dur_val}"
            if data.get('type'):
                type_val = build_sparql_value(data.get('type'), 'string')
                triples += f" ; nutrition:type {type_val}"
            triples += " ."
            success, error = sparql_update(f"INSERT DATA {{ {triples} }}")
            return jsonify({"success": success, "id": act_id if success else None}), 201 if success else 400
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/activites/<activite_id>', methods=['PUT', 'DELETE'])
def handle_activite(activite_id):
    act_uri = generate_uri("activite", activite_id)
    if request.method == 'DELETE':
        success, error = sparql_update(f"DELETE WHERE {{ <{act_uri}> ?p ?o }}")
        return jsonify({"success": success})
    else:
        try:
            data = request.json
            sparql_update(f"DELETE WHERE {{ <{act_uri}> ?p ?o }}")
            nom_val = build_sparql_value(data.get('nom', 'Unknown'), 'string')
            dur_val = build_sparql_value(data.get('dureeActivite', 0), 'integer')
            triples = f"<{act_uri}> a nutrition:ActivitePhysique ; nutrition:nom {nom_val} ; nutrition:dureeActivite {dur_val}"
            if data.get('type'):
                triples += f" ; nutrition:type {build_sparql_value(data.get('type'), 'string')}"
            triples += " ."
            success, error = sparql_update(f"INSERT DATA {{ {triples} }}")
            return jsonify({"success": success})
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 400

# ==================== AUTRES (programmes, objectifs, recettes) ====================
# (Tu peux ajouter les autres routes si besoin, mais pas critiques pour la recherche)

# ==================== SEMANTIC SEARCH ====================
@app.route('/api/semantic-search', methods=['POST'])
def semantic_search():
    try:
        data = request.json
        query_text = data.get('query', '').strip()
        if not query_text:
            return jsonify({"error": "Query is required"}), 400

        sparql = build_sparql_from_natural_language(query_text)
        if not sparql:
            return jsonify({"error": "Impossible de comprendre la requête"}), 400

        results = sparql_query(sparql)
        if "error" in results:
            return jsonify({"error": results["error"]}), 400

        return jsonify({
            "results": results.get("results", {}).get("bindings", []),
            "generated_sparql": sparql,
            "original_query": query_text
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/search-suggestions', methods=['GET'])
def get_search_suggestions():
    return jsonify([
        "Quels aliments sont riches en fibres ?",
        "Donne-moi des recettes faibles en calories",
        "Aliments à index glycémique bas",
        "Activités pour brûler des calories",
        "Aliments riches en fibres et pauvres en sodium",
        "Recettes pour diabétiques"
    ])


# ==================== RECETTES (manquantes) ====================
@app.route('/api/recettes', methods=['GET'])
def get_recettes():
    query = """
    SELECT ?id ?nom ?description ?tempsPréparation ?niveauDifficulté WHERE {
      ?recette a nutrition:Recette ; nutrition:nom ?nom .
      OPTIONAL { ?recette nutrition:description ?description }
      OPTIONAL { ?recette nutrition:tempsPréparation ?tempsPréparation }
      OPTIONAL { ?recette nutrition:niveauDifficulté ?niveauDifficulté }
      BIND(STRAFTER(STR(?recette), "#") AS ?id)
    }
    """
    results = sparql_query(query)
    return jsonify(results.get("results", {}).get("bindings", []))

@app.route('/api/recettes', methods=['POST'])
def create_recette():
    try:
        data = request.json
        recette_id = data.get('id', f"recette_{uuid.uuid4().hex[:8]}")
        recette_uri = generate_uri("recette", recette_id)
        nom_val = build_sparql_value(data.get('nom', 'Unknown'), 'string')
        triples = f"<{recette_uri}> a nutrition:Recette ; nutrition:nom {nom_val}"
        if data.get('description'):
            triples += f" ; nutrition:description {build_sparql_value(data.get('description'), 'string')}"
        if data.get('tempsPréparation'):
            triples += f" ; nutrition:tempsPréparation {build_sparql_value(data.get('tempsPréparation'), 'integer')}"
        if data.get('niveauDifficulté'):
            triples += f" ; nutrition:niveauDifficulté {build_sparql_value(data.get('niveauDifficulté'), 'string')}"
        triples += " ."
        success, error = sparql_update(f"INSERT DATA {{ {triples} }}")
        return jsonify({"success": success, "id": recette_id if success else None}), 201 if success else 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/recettes/<recette_id>', methods=['PUT', 'DELETE'])
def handle_recette(recette_id):
    recette_uri = generate_uri("recette", recette_id)
    if request.method == 'DELETE':
        success, error = sparql_update(f"DELETE WHERE {{ <{recette_uri}> ?p ?o }}")
        return jsonify({"success": success})
    else:
        try:
            data = request.json
            sparql_update(f"DELETE WHERE {{ <{recette_uri}> ?p ?o }}")
            nom_val = build_sparql_value(data.get('nom', 'Unknown'), 'string')
            triples = f"<{recette_uri}> a nutrition:Recette ; nutrition:nom {nom_val}"
            if data.get('description'):
                triples += f" ; nutrition:description {build_sparql_value(data.get('description'), 'string')}"
            if data.get('tempsPréparation'):
                triples += f" ; nutrition:tempsPréparation {build_sparql_value(data.get('tempsPréparation'), 'integer')}"
            if data.get('niveauDifficulté'):
                triples += f" ; nutrition:niveauDifficulté {build_sparql_value(data.get('niveauDifficulté'), 'string')}"
            triples += " ."
            success, error = sparql_update(f"INSERT DATA {{ {triples} }}")
            return jsonify({"success": success})
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 400


# ==================== REPAS (manquantes) ====================
@app.route('/api/repas', methods=['GET'])
def get_repas():
    query = """
    SELECT ?id ?nom ?typeRepas ?caloriesTotales WHERE {
      ?repas a nutrition:Repas ; nutrition:nom ?nom .
      OPTIONAL { ?repas nutrition:typeRepas ?typeRepas }
      OPTIONAL { ?repas nutrition:caloriesTotales ?caloriesTotales }
      BIND(STRAFTER(STR(?repas), "#") AS ?id)
    }
    """
    results = sparql_query(query)
    return jsonify(results.get("results", {}).get("bindings", []))

@app.route('/api/repas', methods=['POST'])
def create_repas():
    try:
        data = request.json
        repas_id = data.get('id', f"repas_{uuid.uuid4().hex[:8]}")
        repas_uri = generate_uri("repas", repas_id)
        nom_val = build_sparql_value(data.get('nom', 'Unknown'), 'string')
        triples = f"<{repas_uri}> a nutrition:Repas ; nutrition:nom {nom_val}"
        if data.get('typeRepas'):
            triples += f" ; nutrition:typeRepas {build_sparql_value(data.get('typeRepas'), 'string')}"
        if data.get('caloriesTotales'):
            triples += f" ; nutrition:caloriesTotales {build_sparql_value(data.get('caloriesTotales'), 'integer')}"
        triples += " ."
        success, error = sparql_update(f"INSERT DATA {{ {triples} }}")
        return jsonify({"success": success, "id": repas_id if success else None}), 201 if success else 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


# ==================== NUTRIMENTS (manquantes) ====================



@app.route('/api/nutriments/<nut_id>', methods=['DELETE'])
def delete_nutriment(nut_id):
    try:
        nut_uri = generate_uri("nutriment", nut_id)
        success, error = sparql_update(f"DELETE WHERE {{ <{nut_uri}> ?p ?o }}")
        return jsonify({"success": success, "error": error if not success else ""})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/nutriments', methods=['GET'])
def get_nutriments():
    query = """
    SELECT ?id ?nom ?unite ?valeurPar100g WHERE {
      ?nutriment a nutrition:Nutriment ; nutrition:nom ?nom .
      OPTIONAL { ?nutriment nutrition:unite ?unite }
      OPTIONAL { ?nutriment nutrition:valeurPar100g ?valeurPar100g }
      BIND(STRAFTER(STR(?nutriment), "#") AS ?id)
    }
    """
    results = sparql_query(query)
    return jsonify(results.get("results", {}).get("bindings", []))

@app.route('/api/nutriments', methods=['POST'])
def create_nutriment():
    try:
        data = request.json
        nut_id = data.get('id', f"nutriment_{uuid.uuid4().hex[:8]}")
        nut_uri = generate_uri("nutriment", nut_id)
        nom_val = build_sparql_value(data.get('nom', 'Unknown'), 'string')
        triples = f"<{nut_uri}> a nutrition:Nutriment ; nutrition:nom {nom_val}"
        if data.get('unite'):
            triples += f" ; nutrition:unite {build_sparql_value(data.get('unite'), 'string')}"
        if data.get('valeurPar100g'):
            triples += f" ; nutrition:valeurPar100g {build_sparql_value(data.get('valeurPar100g'), 'float')}"
        triples += " ."
        success, error = sparql_update(f"INSERT DATA {{ {triples} }}")
        return jsonify({"success": success, "id": nut_id if success else None}), 201 if success else 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

# ==================== RUN ====================
if __name__ == '__main__':
    print("API Nutrition + spaCy NLP démarrée !")
    print("http://localhost:5000")
    app.run(debug=True, port=5000, host='0.0.0.0')