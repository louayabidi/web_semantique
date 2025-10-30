from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from requests.auth import HTTPBasicAuth
import json
from datetime import datetime
from urllib.parse import quote
import os
import uuid
import re

import spacy
from collections import defaultdict
ONTOLOGY_PREFIX = "http://www.semanticweb.org/user/ontologies/2025/8/nutrition#"
FUSEKI_URL = os.getenv("FUSEKI_URL", "http://localhost:3030")
FUSEKI_USERNAME = os.getenv("FUSEKI_USERNAME", "admin")
FUSEKI_PASSWORD = os.getenv("FUSEKI_PASSWORD", "admin")
DATASET_NAME = "nutrition"
SPARQL_QUERY_ENDPOINT = f"{FUSEKI_URL}/{DATASET_NAME}/sparql"
SPARQL_UPDATE_ENDPOINT = f"{FUSEKI_URL}/{DATASET_NAME}/update"

# Charger le modèle SpaCy avec gestion d'erreur améliorée
try:
    nlp = spacy.load("fr_core_news_sm")
    print("✅ Modèle SpaCy français chargé avec succès")
except OSError:
    try:
        # Essayer de télécharger le modèle si absent
        from spacy.cli import download
        download("fr_core_news_sm")
        nlp = spacy.load("fr_core_news_sm")
        print("✅ Modèle SpaCy téléchargé et chargé")
    except:
        print("❌ Impossible de charger SpaCy, utilisation du mode fallback")
        nlp = None

# ==================== PARSER INTELLIGENT AVEC SPAcy ====================
app = Flask(__name__)
CORS(app)
# ==================== PARSER INTELLIGENT AVEC SPAcy ====================

# ==================== PARSER INTELLIGENT AVEC SPAcy ====================

class AdvancedNutritionQueryParser:
    def __init__(self):
        self.nlp = nlp
        
    def parse_query(self, query_text):
        """Parse la requête avec SpaCy et retourne la requête SPARQL"""
        if self.nlp is None:
            return self.fallback_parser(query_text)
        
        print(f"[SpaCy] Analyse de la requête: {query_text}")
        doc = self.nlp(query_text.lower())
        
        # Détection d'entité avec SpaCy
        entity_type = self.detect_entity_spacy(doc)
        if not entity_type:
            entity_type = "Personne"  # Par défaut pour les requêtes sur les personnes
        
        # Analyse des critères avec SpaCy ET regex pour les nombres
        analysis = self.analyze_criteria_advanced(doc, entity_type, query_text)
        
        return self.build_sparql_query(entity_type, analysis, query_text)
    
    def detect_entity_spacy(self, doc):
        """Détection d'entité intelligente avec SpaCy"""
        scores = defaultdict(int)
        
        for token in doc:
            if token.pos_ in ["NOUN", "PROPN"]:
                if self.is_person_related(token):
                    scores["Personne"] += 2
                elif self.is_food_related(token):
                    scores["Aliment"] += 2
                elif self.is_recipe_related(token):
                    scores["Recette"] += 2
                elif self.is_activity_related(token):
                    scores["ActivitePhysique"] += 2
        
        # Détection par contexte
        text = doc.text
        if any(word in text for word in ["être humain", "personne", "utilisateur", "patient"]):
            scores["Personne"] += 3
        if any(word in text for word in ["âge", "ans", "vieux", "jeune", "taille", "poids"]):
            scores["Personne"] += 2
        
        if scores:
            best_entity = max(scores.items(), key=lambda x: x[1])
            print(f"[SpaCy] Entité détectée: {best_entity[0]} (score: {best_entity[1]})")
            return best_entity[0]
        
        return None

    def analyze_criteria_advanced(self, doc, entity_type, original_query):
        """Analyse avancée des critères avec SpaCy + regex pour les nombres"""
        analysis = {
            'filters': [],
            'additional_selects': [],
            'additional_triples': [],
            'order_by': "?nom"
        }
        
        if entity_type == "Personne":
            # Configuration de base pour les personnes
            analysis['additional_selects'].extend(["?âge", "?poids", "?taille"])
            analysis['additional_triples'].extend([
                "?entity nutrition:âge ?âge .",
                "?entity nutrition:poids ?poids .", 
                "?entity nutrition:taille ?taille ."
            ])
            
            # ANALYSE AVANCÉE DES CRITÈRES NUMÉRIQUES
            self.extract_numerical_criteria(original_query, analysis)
            
            # Analyse SpaCy pour les critères qualitatifs
            for token in doc:
                if token.lemma_ in ["jeune"]:
                    analysis['filters'].append("?âge <= 30")
                    analysis['order_by'] = "?âge"
                    print(f"[SpaCy] Critère jeune détecté")
                elif token.lemma_ in ["vieux", "âgé", "vieille"]:
                    analysis['filters'].append("?âge >= 60")
                    analysis['order_by'] = "DESC(?âge)"
                    print(f"[SpaCy] Critère âgé détecté")
        
        return analysis
    
    def extract_numerical_criteria(self, query_text, analysis):
        """Extraction des critères numériques avec regex"""
        print(f"[Extraction] Analyse des critères numériques dans: {query_text}")
        
        # Extraction de la taille (ex: "taille 177", "177 cm", "taille 1.77")
        taille_patterns = [
            r'taille\s*[:\s]*(\d{2,3}(?:[.,]\d+)?)\s*(?:cm)?',
            r'(\d{2,3}(?:[.,]\d+)?)\s*cm',
            r'(\d{1}\.\d{2})\s*m'
        ]
        
        for pattern in taille_patterns:
            match = re.search(pattern, query_text, re.IGNORECASE)
            if match:
                taille_value = float(match.group(1).replace(',', '.'))
                print(f"[Extraction] Taille détectée: {taille_value}")
                analysis['filters'].append(f"?taille = {taille_value}")
                break
        
        # Extraction de l'âge (ex: "âge 80 ans", "80 ans", "plus que 80 ans")
        age_patterns = [
            r'âge\s*[:\s]*(\d{1,3})\s*(?:ans)?',
            r'(\d{1,3})\s*ans',
            r'plus\s*(?:que|de)\s*(\d{1,3})\s*ans',
            r'supérieur\s*à\s*(\d{1,3})\s*ans',
            r'greater\s*than\s*(\d{1,3})'
        ]
        
        for pattern in age_patterns:
            match = re.search(pattern, query_text, re.IGNORECASE)
            if match:
                age_value = int(match.group(1))
                print(f"[Extraction] Âge détecté: {age_value} ans")
                
                # Détection du type de comparaison
                if "plus que" in query_text.lower() or "supérieur" in query_text.lower() or "greater" in query_text.lower():
                    analysis['filters'].append(f"?âge > {age_value}")
                    print(f"[Extraction] Filtre: âge > {age_value}")
                else:
                    analysis['filters'].append(f"?âge = {age_value}")
                    print(f"[Extraction] Filtre: âge = {age_value}")
                break
        
        # Extraction du poids si présent
        poids_patterns = [
            r'poids\s*[:\s]*(\d{2,3}(?:[.,]\d+)?)\s*(?:kg)?',
            r'(\d{2,3}(?:[.,]\d+)?)\s*kg'
        ]
        
        for pattern in poids_patterns:
            match = re.search(pattern, query_text, re.IGNORECASE)
            if match:
                poids_value = float(match.group(1).replace(',', '.'))
                print(f"[Extraction] Poids détecté: {poids_value}")
                analysis['filters'].append(f"?poids = {poids_value}")
                break
    
    def build_sparql_query(self, entity_type, analysis, original_query):
        """Construction de la requête SPARQL finale"""
        
        entity_mapping = {
            "Aliment": "?entity a nutrition:Aliment ; nutrition:nom ?nom .",
            "Recette": "?entity a nutrition:Recette ; nutrition:nom ?nom .", 
            "ActivitePhysique": "?entity a nutrition:ActivitePhysique ; nutrition:nom ?nom .",
            "Personne": "?entity a nutrition:Personne ; nutrition:nom ?nom ."
        }
        
        base_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        SELECT ?id ?nom ?type ?score ?details {' '.join(analysis['additional_selects'])} WHERE {{
            {entity_mapping[entity_type]}
            BIND("{entity_type}" AS ?type)
            BIND(STRAFTER(STR(?entity), "#") AS ?id)
        """
        
        # Ajouter les triplets supplémentaires
        for triple in analysis['additional_triples']:
            base_query += f"    {triple}\n"
        
        # Ajouter les filtres
        if analysis['filters']:
            base_query += "    FILTER(" + " && ".join(analysis['filters']) + ")\n"
        
        base_query += """
            BIND(1.0 AS ?score)
            BIND("" AS ?details)
        """
        
        base_query += f"}} ORDER BY {analysis['order_by']} LIMIT 20"
        
        print(f"[SpaCy] Requête SPARQL générée pour {entity_type}")
        print(f"[SpaCy] Filtres appliqués: {analysis['filters']}")
        return base_query
    
    def fallback_parser(self, query_text):
        """Parser de secours si SpaCy n'est pas disponible"""
        print("[SpaCy] Utilisation du parser de secours")
        return self.build_advanced_fallback_query(query_text)
    
    def build_advanced_fallback_query(self, query_text):
        """Parser de secours avancé avec extraction regex"""
        print(f"[Fallback] Analyse de: {query_text}")
        
        # Détection du type d'entité
        if any(word in query_text.lower() for word in ["être humain", "personne", "âge", "ans", "taille", "poids"]):
            entity_type = "Personne"
        elif any(word in query_text.lower() for word in ["aliment", "nourriture", "calorie"]):
            entity_type = "Aliment"
        else:
            entity_type = "Personne"  # Par défaut
        
        analysis = {
            'filters': [],
            'additional_selects': ["?âge", "?poids", "?taille"],
            'additional_triples': [
                "?entity nutrition:âge ?âge .",
                "?entity nutrition:poids ?poids .", 
                "?entity nutrition:taille ?taille ."
            ],
            'order_by': "?nom"
        }
        
        # Extraction des critères
        self.extract_numerical_criteria(query_text, analysis)
        
        return self.build_sparql_query(entity_type, analysis, query_text)

    # Les autres méthodes restent les mêmes...
    def is_person_related(self, token):
        person_patterns = [
            lambda t: t.lemma_ in ["personne", "individu", "utilisateur", "patient", "client", "humain", "être"],
            lambda t: any(child.lemma_ in ["âge", "poids", "taille"] for child in t.children),
            lambda t: any(ancestor.lemma_ in ["profil", "santé", "bienêtre"] for ancestor in t.ancestors)
        ]
        return any(pattern(token) for pattern in person_patterns)

    def is_food_related(self, token):
        food_patterns = [
            lambda t: t.lemma_ in ["aliment", "nourriture", "fruit", "légume", "viande", "poisson", "produit"],
            lambda t: any(child.lemma_ in ["calorie", "fibre", "nutrition", "manger"] for child in t.children),
        ]
        return any(pattern(token) for pattern in food_patterns)

    def is_recipe_related(self, token):
        recipe_patterns = [
            lambda t: t.lemma_ in ["recette", "plat", "menu", "cuisine", "préparation"],
            lambda t: any(child.lemma_ in ["ingrédient", "cuisiner", "préparer"] for child in t.children),
        ]
        return any(pattern(token) for pattern in recipe_patterns)

    def is_activity_related(self, token):
        activity_patterns = [
            lambda t: t.lemma_ in ["activité", "sport", "exercice", "entraînement", "course"],
            lambda t: any(child.lemma_ in ["physique", "musculation", "cardio"] for child in t.children),
        ]
        return any(pattern(token) for pattern in activity_patterns)

    def build_multi_entity_search(self, query_text):
        """Recherche multi-entités"""
        print("[SpaCy] Recherche multi-entités")
        return f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        SELECT ?id ?nom ?type ?âge ?poids ?taille WHERE {{
          {{
            ?entity a nutrition:Personne ; nutrition:nom ?nom .
            OPTIONAL {{ ?entity nutrition:âge ?âge }}
            OPTIONAL {{ ?entity nutrition:poids ?poids }}
            OPTIONAL {{ ?entity nutrition:taille ?taille }}
            BIND("Personne" AS ?type)
            BIND(STRAFTER(STR(?entity), "#") AS ?id)
          }}
          UNION
          {{
            ?entity a nutrition:Aliment ; nutrition:nom ?nom .
            BIND("Aliment" AS ?type)
            BIND(STRAFTER(STR(?entity), "#") AS ?id)
            BIND("" AS ?âge)
            BIND("" AS ?poids)
            BIND("" AS ?taille)
          }}
          FILTER(REGEX(?nom, "{query_text}", "i"))
        }} LIMIT 20
        """

class AdvancedNutritionQueryParser:
    def __init__(self):
        self.nlp = nlp
        self.entity_keywords = {
            "Personne": ["personne", "utilisateur", "patient", "client", "humain", "être", "âge", "poids", "taille"],
            "Aliment": ["aliment", "nourriture", "fruit", "légume", "viande", "poisson", "produit", "calorie"],
            "Recette": ["recette", "plat", "menu", "cuisine", "préparation", "ingrédient"],
            "ActivitePhysique": ["activité", "sport", "exercice", "entraînement", "course", "marche"]
        }
        
    def parse_query(self, query_text):
        """Parse la requête avec analyse sémantique avancée"""
        if self.nlp is None:
            return self.fallback_parser(query_text)
        
        print(f"🔍 [SpaCy] Analyse de: '{query_text}'")
        doc = self.nlp(query_text.lower())
        
        # Détection d'entité améliorée
        entity_type = self.detect_entity_advanced(doc, query_text)
        
        # Analyse des critères
        analysis = self.analyze_criteria_advanced(doc, entity_type, query_text)
        
        return self.build_sparql_query(entity_type, analysis, query_text)
    
    def detect_entity_advanced(self, doc, query_text):
        """Détection d'entité avec scores pondérés"""
        scores = defaultdict(int)
        
        # Score basé sur les mots-clés
        for entity_type, keywords in self.entity_keywords.items():
            for keyword in keywords:
                if keyword in query_text.lower():
                    scores[entity_type] += 2
        
        # Score basé sur l'analyse SpaCy
        for token in doc:
            if token.pos_ in ["NOUN", "PROPN"]:
                if self.is_person_related(token):
                    scores["Personne"] += 1
                elif self.is_food_related(token):
                    scores["Aliment"] += 1
                elif self.is_recipe_related(token):
                    scores["Recette"] += 1
                elif self.is_activity_related(token):
                    scores["ActivitePhysique"] += 1
        
        # Score basé sur le contexte
        if any(word in query_text for word in ["âge", "ans", "vieux", "jeune", "poids", "kg", "taille", "cm"]):
            scores["Personne"] += 3
            
        if any(word in query_text for word in ["calorie", "fibre", "nutrition", "protéine", "vitamine"]):
            scores["Aliment"] += 2
            
        if any(word in query_text for word in ["cuisiner", "préparer", "ingrédients", "temps de préparation"]):
            scores["Recette"] += 2
            
        if any(word in query_text for word in ["brûler", "sport", "exercice", "entraînement", "durée"]):
            scores["ActivitePhysique"] += 2
        
        if scores:
            best_entity = max(scores.items(), key=lambda x: x[1])
            print(f"🎯 [SpaCy] Entité détectée: {best_entity[0]} (score: {best_entity[1]})")
            return best_entity[0]
        
        return "Aliment"  # Par défaut
    
    def analyze_criteria_advanced(self, doc, entity_type, original_query):
        """Analyse avancée des critères de recherche"""
        analysis = {
            'filters': [],
            'additional_selects': [],
            'additional_triples': [],
            'order_by': "?nom",
            'search_patterns': []
        }
        
        # Configuration par type d'entité
        if entity_type == "Personne":
            analysis['additional_selects'].extend(["?âge", "?poids", "?taille"])
            analysis['additional_triples'].extend([
                "OPTIONAL { ?entity nutrition:âge ?âge }",
                "OPTIONAL { ?entity nutrition:poids ?poids }", 
                "OPTIONAL { ?entity nutrition:taille ?taille }"
            ])
            
        elif entity_type == "Aliment":
            analysis['additional_selects'].extend(["?calories", "?indexGlycemique"])
            analysis['additional_triples'].extend([
                "OPTIONAL { ?entity nutrition:calories ?calories }",
                "OPTIONAL { ?entity nutrition:indexGlycémique ?indexGlycemique }"
            ])
            
        # Extraction des critères numériques
        self.extract_numerical_criteria(original_query, analysis)
        
        # Extraction des critères qualitatifs
        self.extract_qualitative_criteria(doc, original_query, analysis)
        
        # Recherche par nom
        self.extract_name_search(original_query, analysis)
        
        return analysis
    
    def extract_numerical_criteria(self, query_text, analysis):
        """Extraction des critères numériques avec regex améliorée"""
        print(f"🔢 [Extraction] Analyse des critères numériques")
        
        # Âge
        age_patterns = [
            r'âge\s*[:\s]*(\d{1,3})\s*(?:ans)?',
            r'(\d{1,3})\s*ans',
            r'plus\s*(?:que|de)\s*(\d{1,3})\s*ans',
            r'moins\s*(?:que|de)\s*(\d{1,3})\s*ans',
            r'supérieur\s*à\s*(\d{1,3})\s*ans',
            r'inférieur\s*à\s*(\d{1,3})\s*ans'
        ]
        
        for pattern in age_patterns:
            matches = re.finditer(pattern, query_text, re.IGNORECASE)
            for match in matches:
                age_value = int(match.group(1))
                if "plus" in match.group(0) or "supérieur" in match.group(0):
                    analysis['filters'].append(f"(?âge > {age_value})")
                    print(f"✅ Filtre âge: > {age_value} ans")
                elif "moins" in match.group(0) or "inférieur" in match.group(0):
                    analysis['filters'].append(f"(?âge < {age_value})")
                    print(f"✅ Filtre âge: < {age_value} ans")
                else:
                    analysis['filters'].append(f"(?âge = {age_value})")
                    print(f"✅ Filtre âge: = {age_value} ans")
        
        # Poids
        poids_patterns = [
            r'poids\s*[:\s]*(\d{2,3}(?:[.,]\d+)?)\s*(?:kg)?',
            r'(\d{2,3}(?:[.,]\d+)?)\s*kg',
            r'poids\s*(?:supérieur|plus)\s*à\s*(\d+)\s*kg',
            r'poids\s*(?:inférieur|moins)\s*à\s*(\d+)\s*kg'
        ]
        
        for pattern in poids_patterns:
            matches = re.finditer(pattern, query_text, re.IGNORECASE)
            for match in matches:
                poids_value = float(match.group(1).replace(',', '.'))
                if "supérieur" in match.group(0) or "plus" in match.group(0):
                    analysis['filters'].append(f"(?poids > {poids_value})")
                    print(f"✅ Filtre poids: > {poids_value} kg")
                elif "inférieur" in match.group(0) or "moins" in match.group(0):
                    analysis['filters'].append(f"(?poids < {poids_value})")
                    print(f"✅ Filtre poids: < {poids_value} kg")
                else:
                    analysis['filters'].append(f"(?poids = {poids_value})")
                    print(f"✅ Filtre poids: = {poids_value} kg")
        
        # Taille
        taille_patterns = [
            r'taille\s*[:\s]*(\d{2,3}(?:[.,]\d+)?)\s*(?:cm)?',
            r'(\d{2,3}(?:[.,]\d+)?)\s*cm',
            r'taille\s*(?:supérieur|plus)\s*à\s*(\d+)\s*cm',
            r'taille\s*(?:inférieur|moins)\s*à\s*(\d+)\s*cm'
        ]
        
        for pattern in taille_patterns:
            matches = re.finditer(pattern, query_text, re.IGNORECASE)
            for match in matches:
                taille_value = float(match.group(1).replace(',', '.'))
                if "supérieur" in match.group(0) or "plus" in match.group(0):
                    analysis['filters'].append(f"(?taille > {taille_value})")
                    print(f"✅ Filtre taille: > {taille_value} cm")
                elif "inférieur" in match.group(0) or "moins" in match.group(0):
                    analysis['filters'].append(f"(?taille < {taille_value})")
                    print(f"✅ Filtre taille: < {taille_value} cm")
                else:
                    analysis['filters'].append(f"(?taille = {taille_value})")
                    print(f"✅ Filtre taille: = {taille_value} cm")
    
    def extract_qualitative_criteria(self, doc, query_text, analysis):
        """Extraction des critères qualitatifs"""
        text_lower = query_text.lower()
        
        # Critères pour les aliments
        if "faible calorie" in text_lower or "peu calorique" in text_lower:
            analysis['filters'].append("(?calories <= 150)")
            analysis['order_by'] = "?calories"
            print("✅ Filtre: faible calories")
            
        if "riche en fibre" in text_lower or "beaucoup de fibre" in text_lower:
            analysis['filters'].append("(?teneurFibres >= 5)")
            analysis['order_by'] = "DESC(?teneurFibres)"
            print("✅ Filtre: riche en fibres")
            
        if "faible ig" in text_lower or "index glycémique bas" in text_lower:
            analysis['filters'].append("(?indexGlycemique <= 55)")
            analysis['order_by'] = "?indexGlycemique"
            print("✅ Filtre: faible index glycémique")
        
        # Critères pour les personnes
        if "jeune" in text_lower:
            analysis['filters'].append("(?âge <= 30)")
            analysis['order_by'] = "?âge"
            print("✅ Filtre: jeune")
            
        if "âgé" in text_lower or "vieux" in text_lower or "senior" in text_lower:
            analysis['filters'].append("(?âge >= 60)")
            analysis['order_by'] = "DESC(?âge)"
            print("✅ Filtre: âgé")
    
    def extract_name_search(self, query_text, analysis):
        """Extraction de la recherche par nom"""
        name_patterns = [
            r'appel[ée]s?\s+([^,.!?]+)',
            r'nomm[ée]s?\s+([^,.!?]+)',
            r'prénom\s+([^,.!?]+)',
            r'qui s\'appelle\s+([^,.!?]+)'
        ]
        
        for pattern in name_patterns:
            match = re.search(pattern, query_text, re.IGNORECASE)
            if match:
                name = match.group(1).strip()
                analysis['search_patterns'].append(name)
                print(f"✅ Recherche par nom: '{name}'")
                break
    
    def build_sparql_query(self, entity_type, analysis, original_query):
        """Construction de la requête SPARQL finale"""
        
        entity_mapping = {
            "Aliment": "?entity a nutrition:Aliment ; nutrition:nom ?nom .",
            "Recette": "?entity a nutrition:Recette ; nutrition:nom ?nom .", 
            "ActivitePhysique": "?entity a nutrition:ActivitePhysique ; nutrition:nom ?nom .",
            "Personne": "?entity a nutrition:Personne ; nutrition:nom ?nom ."
        }
        
        # Construction de la requête de base
        base_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        SELECT DISTINCT ?id ?nom ?type ?score {' '.join(analysis['additional_selects'])} WHERE {{
            {entity_mapping.get(entity_type, entity_mapping['Aliment'])}
            BIND("{entity_type}" AS ?type)
            BIND(STRAFTER(STR(?entity), "#") AS ?id)
            BIND(1.0 AS ?score)
        """
        
        # Ajouter les triplets supplémentaires
        for triple in analysis['additional_triples']:
            base_query += f"    {triple}\n"
        
        # Ajouter la recherche par nom si spécifiée
        if analysis['search_patterns']:
            name_pattern = analysis['search_patterns'][0]
            base_query += f'    FILTER(REGEX(?nom, "{name_pattern}", "i"))\n'
        
        # Ajouter les filtres
        if analysis['filters']:
            base_query += "    FILTER(" + " && ".join(analysis['filters']) + ")\n"
        
        base_query += f"}} ORDER BY {analysis['order_by']} LIMIT 20"
        
        print(f"📊 [SpaCy] Requête SPARQL générée pour {entity_type}")
        print(f"🎯 [SpaCy] Filtres: {analysis['filters']}")
        return base_query
    
    def fallback_parser(self, query_text):
        """Parser de secours amélioré"""
        print("🔄 [SpaCy] Utilisation du parser de secours")
        return self.build_advanced_fallback_query(query_text)
    
    def build_advanced_fallback_query(self, query_text):
        """Parser de secours avec extraction regex avancée"""
        print(f"🔄 [Fallback] Analyse de: {query_text}")
        
        # Détection du type d'entité
        entity_type = "Aliment"  # Par défaut
        
        if any(word in query_text.lower() for word in ["personne", "utilisateur", "âge", "ans", "poids", "taille"]):
            entity_type = "Personne"
        elif any(word in query_text.lower() for word in ["recette", "plat", "menu", "cuisine"]):
            entity_type = "Recette"
        elif any(word in query_text.lower() for word in ["activité", "sport", "exercice"]):
            entity_type = "ActivitePhysique"
        
        analysis = {
            'filters': [],
            'additional_selects': [],
            'additional_triples': [],
            'order_by': "?nom",
            'search_patterns': []
        }
        
        # Configuration basée sur le type d'entité
        if entity_type == "Personne":
            analysis['additional_selects'].extend(["?âge", "?poids", "?taille"])
            analysis['additional_triples'].extend([
                "OPTIONAL { ?entity nutrition:âge ?âge }",
                "OPTIONAL { ?entity nutrition:poids ?poids }", 
                "OPTIONAL { ?entity nutrition:taille ?taille }"
            ])
        elif entity_type == "Aliment":
            analysis['additional_selects'].extend(["?calories", "?indexGlycemique"])
            analysis['additional_triples'].extend([
                "OPTIONAL { ?entity nutrition:calories ?calories }",
                "OPTIONAL { ?entity nutrition:indexGlycémique ?indexGlycemique }"
            ])
        
        # Extraction des critères
        self.extract_numerical_criteria(query_text, analysis)
        self.extract_name_search(query_text, analysis)
        
        return self.build_sparql_query(entity_type, analysis, query_text)

    # Méthodes d'analyse sémantique (garder celles que vous avez)
    def is_person_related(self, token):
        person_indicators = ["personne", "utilisateur", "patient", "client", "humain"]
        return token.lemma_ in person_indicators or any(child.lemma_ in ["âge", "poids", "taille"] for child in token.children)

    def is_food_related(self, token):
        food_indicators = ["aliment", "nourriture", "fruit", "légume", "viande", "poisson"]
        return token.lemma_ in food_indicators

    def is_recipe_related(self, token):
        recipe_indicators = ["recette", "plat", "menu", "cuisine"]
        return token.lemma_ in recipe_indicators

    def is_activity_related(self, token):
        activity_indicators = ["activité", "sport", "exercice", "entraînement"]
        return token.lemma_ in activity_indicators

# Initialisation du parser
nutrition_parser = AdvancedNutritionQueryParser()



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
    """Generate a URI for an entity - VERSION DEBUG"""
    if entity_id is None:
        entity_id = str(uuid.uuid4())
    
    # SIMPLIFIONS pour debug
    if entity_type == "personne":
        uri = f"{ONTOLOGY_PREFIX}personne_{entity_id}"
    elif entity_type == "allergie":
        uri = f"{ONTOLOGY_PREFIX}allergie_{entity_id}"
    else:
        uri = f"{ONTOLOGY_PREFIX}{entity_type}_{entity_id}"
    
    print(f"🚨 [DEBUG URI] Type: {entity_type}, ID: {entity_id}")
    print(f"🚨 [DEBUG URI] Generated: {uri}")
    return uri

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
        
        # Generate a stable person_id
        person_id = data.get('id')
        if not person_id:
            person_id = uuid.uuid4().hex[:8]  # short UUID only
        
        person_uri = generate_uri("personne", person_id)
        
        # Build your triples
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
        
        if success:
            # ✅ This is the correct place to return the ID to the frontend
            return jsonify({"success": True, "id": person_id}), 201
        else:
            return jsonify({"success": False, "error": error}), 400
        
    except Exception as e:
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
        print("DELETE PERSONNE CALLED WITH:", person_id)
        person_uri = generate_uri("personne", person_id)
        print("PERSON URI TO DELETE:", person_uri)
        delete_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        DELETE {{ <{person_uri}> ?p ?o }}
        WHERE {{ <{person_uri}> ?p ?o }}
        """
        success, error = sparql_update(delete_query)
        return jsonify({"success": success, "error": error if not success else ""})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400






# ==================== RELATIONS PERSONNES CRUD ====================

@app.route('/api/relations-personnes', methods=['GET'])
def get_all_relations_personnes():
    """Get all person relations - VERSION ULTRA SIMPLE"""
    query = f"""
    PREFIX nutrition: <{ONTOLOGY_PREFIX}>
    SELECT ?personneId ?personneNom ?typeRelation ?cibleId ?cibleNom WHERE {{
        # Trouve TOUTES les relations, même si la personne n'a pas de nom
        {{
            ?personne nutrition:aAllergie ?cible .
            BIND("ALLERGIE" AS ?typeRelation)
            OPTIONAL {{ ?cible nutrition:nom ?cibleNom }}
        }}
        UNION
        {{
            ?personne nutrition:aCondition ?cible .
            BIND("CONDITION" AS ?typeRelation)
            OPTIONAL {{ ?cible nutrition:nom ?cibleNom }}
        }}
        UNION
        {{
            ?personne nutrition:aPreference ?cible .
            BIND("PREFERENCE" AS ?typeRelation)
            OPTIONAL {{ ?cible nutrition:nom ?cibleNom }}
        }}
        UNION
        {{
            ?personne nutrition:participeÀ ?cible .
            BIND("OBJECTIF" AS ?typeRelation)
            OPTIONAL {{ ?cible nutrition:nom ?cibleNom }}
        }}
        
        # OPTIONAL pour le nom de la personne
        OPTIONAL {{ ?personne nutrition:nom ?personneNom }}
        BIND(STRAFTER(STR(?personne), "#") AS ?personneId)
        BIND(STRAFTER(STR(?cible), "#") AS ?cibleId)
    }}
    ORDER BY ?personneNom ?typeRelation
    """
    print(f"[DEBUG] SPARQL Query: {query}")
    results = sparql_query(query)
    print(f"[DEBUG] SPARQL Results: {results}")
    return jsonify(results.get("results", {}).get("bindings", []))

@app.route('/api/personnes/<personne_id>/relations', methods=['POST', 'OPTIONS'])
def create_personne_relation(personne_id):
    """Create a relation for a person - VERSION CORRECTE"""
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.json
        type_relation = data.get('typeRelation')
        cible_id = data.get('cibleId')
        
        print(f"🎯 [DEBUG] Creating relation: {personne_id} -> {type_relation} -> {cible_id}")
        
        # URIs
        personne_uri = f"{ONTOLOGY_PREFIX}personne_{personne_id}"
        
        if type_relation == "ALLERGIE":
            cible_uri = f"{ONTOLOGY_PREFIX}allergie_{cible_id}"
            propriete = "aAllergie"
        elif type_relation == "CONDITION":
            cible_uri = f"{ONTOLOGY_PREFIX}condition_{cible_id}"
            propriete = "aCondition"
        elif type_relation == "PREFERENCE":
            cible_uri = f"{ONTOLOGY_PREFIX}preference_{cible_id}"
            propriete = "aPreference"
        elif type_relation == "OBJECTIF":
            cible_uri = f"{ONTOLOGY_PREFIX}objectif_{cible_id}"
            propriete = "participeÀ"
        else:
            return jsonify({"success": False, "error": "Type de relation invalide"}), 400
        
        # REQUÊTE SPARQL qui CRÉE la personne si elle n'existe pas
        update_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        INSERT DATA {{
            <{personne_uri}> rdf:type nutrition:Personne .
            <{personne_uri}> nutrition:nom "{personne_id}" .
            <{personne_uri}> nutrition:{propriete} <{cible_uri}> .
        }}
        """
        
        print(f"🎯 [DEBUG] SPARQL Query: {update_query}")
        
        success, error = sparql_update(update_query)
        
        if success:
            print("✅ [SUCCESS] Relation créée avec succès!")
            return jsonify({"success": True}), 201
        else:
            print(f"❌ [ERROR] Erreur SPARQL: {error}")
            return jsonify({"success": False, "error": error}), 400
            
    except Exception as e:
        print(f"❌ [EXCEPTION] Erreur: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/personnes/<personne_id>/relations/<type_relation>/<cible_id>', methods=['DELETE', 'OPTIONS'])
def delete_personne_relation(personne_id, type_relation, cible_id):
    """Delete a specific relation for a person"""
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        personne_uri = generate_uri("personne", personne_id)
        
        relation_mapping = {
            "ALLERGIE": ("aAllergie", "allergie"),
            "CONDITION": ("aCondition", "condition"),
            "PREFERENCE": ("aPreference", "preference"), 
            "OBJECTIF": ("participeÀ", "objectif")
        }
        
        if type_relation not in relation_mapping:
            return jsonify({"success": False, "error": "Type de relation invalide"}), 400
        
        propriete, type_cible = relation_mapping[type_relation]
        cible_uri = generate_uri(type_cible, cible_id)
        
        delete_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        DELETE WHERE {{
            <{personne_uri}> nutrition:{propriete} <{cible_uri}> .
        }}
        """
        
        success, error = sparql_update(delete_query)
        return jsonify({"success": success, "error": error if not success else ""})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


# ==================== RELATIONS ALIMENTS CRUD ====================

@app.route('/api/relations-aliments', methods=['GET'])
def get_all_relations_aliments():
    """Get all food relations"""
    query = f"""
    PREFIX nutrition: <{ONTOLOGY_PREFIX}>
    SELECT ?alimentId ?alimentNom ?typeRelation ?cibleId ?cibleNom ?quantite ?unite WHERE {{
        ?aliment a nutrition:Aliment ;
                 nutrition:nom ?alimentNom .
        BIND(STRAFTER(STR(?aliment), "#") AS ?alimentId)
        
        {{
            ?aliment nutrition:contientNutriment ?cible .
            ?aliment nutrition:quantiteNutriment ?quantite .
            ?aliment nutrition:uniteNutriment ?unite .
            BIND("NUTRIMENT" AS ?typeRelation)
            OPTIONAL {{ ?cible nutrition:nom ?cibleNom }}
            BIND(STRAFTER(STR(?cible), "#") AS ?cibleId)
        }}
        UNION
        {{
            ?aliment nutrition:estDansRepas ?cible .
            ?aliment nutrition:quantiteRepas ?quantite .
            ?aliment nutrition:uniteRepas ?unite .
            BIND("REPAS" AS ?typeRelation)
            OPTIONAL {{ ?cible nutrition:nom ?cibleNom }}
            BIND(STRAFTER(STR(?cible), "#") AS ?cibleId)
        }}
        UNION
        {{
            ?aliment nutrition:estDansRecette ?cible .
            ?aliment nutrition:quantiteRecette ?quantite .
            ?aliment nutrition:uniteRecette ?unite .
            BIND("RECETTE" AS ?typeRelation)
            OPTIONAL {{ ?cible nutrition:nom ?cibleNom }}
            BIND(STRAFTER(STR(?cible), "#") AS ?cibleId)
        }}
    }}
    ORDER BY ?alimentNom ?typeRelation
    """
    results = sparql_query(query)
    return jsonify(results.get("results", {}).get("bindings", []))

@app.route('/api/aliments/<aliment_id>/relations', methods=['POST', 'OPTIONS'])
def create_aliment_relation(aliment_id):
    """Create a relation for a food - VERSION CORRIGÉE"""
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.json
        type_relation = data.get('typeRelation')
        cible_id = data.get('cibleId')
        quantite = data.get('quantite', 0)
        unite = data.get('unite', 'g')
        
        print(f"🎯 [DEBUG] Creating food relation: {aliment_id} -> {type_relation} -> {cible_id} ({quantite}{unite})")
        
        # URIs CORRIGÉES - sans préfixes en double
        aliment_uri = f"{ONTOLOGY_PREFIX}{aliment_id}"
        
        if type_relation == "NUTRIMENT":
            cible_uri = f"{ONTOLOGY_PREFIX}{cible_id}"
            propriete_relation = "contientNutriment"
            propriete_quantite = "quantiteNutriment"
            propriete_unite = "uniteNutriment"
        elif type_relation == "REPAS":
            cible_uri = f"{ONTOLOGY_PREFIX}{cible_id}"
            propriete_relation = "estDansRepas"
            propriete_quantite = "quantiteRepas"
            propriete_unite = "uniteRepas"
        elif type_relation == "RECETTE":
            cible_uri = f"{ONTOLOGY_PREFIX}{cible_id}"
            propriete_relation = "estDansRecette"
            propriete_quantite = "quantiteRecette"
            propriete_unite = "uniteRecette"
        else:
            return jsonify({"success": False, "error": "Type de relation invalide"}), 400
        
        print(f"🎯 [DEBUG] Aliment URI: {aliment_uri}")
        print(f"🎯 [DEBUG] Cible URI: {cible_uri}")
        
        # REQUÊTE SPARQL
        update_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        INSERT DATA {{
            <{aliment_uri}> nutrition:{propriete_relation} <{cible_uri}> .
            <{aliment_uri}> nutrition:{propriete_quantite} "{quantite}"^^xsd:float .
            <{aliment_uri}> nutrition:{propriete_unite} "{unite}"^^xsd:string .
        }}
        """
        
        print(f"🎯 [DEBUG] SPARQL Query: {update_query}")
        
        success, error = sparql_update(update_query)
        
        if success:
            print("✅ [SUCCESS] Relation aliment créée avec succès!")
            return jsonify({"success": True}), 201
        else:
            print(f"❌ [ERROR] Erreur SPARQL: {error}")
            return jsonify({"success": False, "error": error}), 400
            
    except Exception as e:
        print(f"❌ [EXCEPTION] Erreur: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 400

        
@app.route('/api/aliments/<aliment_id>/relations/<type_relation>/<cible_id>', methods=['DELETE', 'OPTIONS'])
def delete_aliment_relation(aliment_id, type_relation, cible_id):
    """Delete a specific relation for a food"""
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        aliment_uri = f"{ONTOLOGY_PREFIX}aliment_{aliment_id}"
        
        if type_relation == "NUTRIMENT":
            cible_uri = f"{ONTOLOGY_PREFIX}nutriment_{cible_id}"
            propriete_relation = "contientNutriment"
            propriete_quantite = "quantiteNutriment"
            propriete_unite = "uniteNutriment"
        elif type_relation == "REPAS":
            cible_uri = f"{ONTOLOGY_PREFIX}repas_{cible_id}"
            propriete_relation = "estDansRepas"
            propriete_quantite = "quantiteRepas"
            propriete_unite = "uniteRepas"
        elif type_relation == "RECETTE":
            cible_uri = f"{ONTOLOGY_PREFIX}recette_{cible_id}"
            propriete_relation = "estDansRecette"
            propriete_quantite = "quantiteRecette"
            propriete_unite = "uniteRecette"
        else:
            return jsonify({"success": False, "error": "Type de relation invalide"}), 400
        
        delete_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        DELETE WHERE {{
            <{aliment_uri}> nutrition:{propriete_relation} <{cible_uri}> .
            <{aliment_uri}> nutrition:{propriete_quantite} ?quantite .
            <{aliment_uri}> nutrition:{propriete_unite} ?unite .
        }}
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
        aliment_id = data.get('id')
        if not aliment_id:
            aliment_id = uuid.uuid4().hex[:8]  # short UUID only
        
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
        
        activite_id = data.get('id')
        if not activite_id:
            activite_id = uuid.uuid4().hex[:8]  # short UUID only
        
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
        
        nutriment_id = data.get('id')
        if not nutriment_id:
            nutriment_id = uuid.uuid4().hex[:8]  # short UUID only
        
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

@app.route('/api/nutriments/<nutriment_id>', methods=['PUT'])
def update_nutriment(nutriment_id):
    """Update a nutriment"""
    try:
        data = request.json
        nutriment_uri = generate_uri("nutriment", nutriment_id)
        print("UPDATE NUTRIMENT URI:", nutriment_uri)

        # Delete old data
        delete_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        DELETE {{ <{nutriment_uri}> ?p ?o }}
        WHERE {{ <{nutriment_uri}> ?p ?o }}
        """
        sparql_update(delete_query)

        # Insert new data
        nom_val = build_sparql_value(data.get('nom', 'Unknown'), 'string')
        dose_val = build_sparql_value(data.get('doseRecommandée', 0.0), 'float')
        unite_val = build_sparql_value(data.get('unitéDose', 'mg'), 'string')

        triples = f"""
            <{nutriment_uri}> a nutrition:Nutriment ;
                               nutrition:nom {nom_val} ;
                               nutrition:doseRecommandée {dose_val} ;
                               nutrition:unitéDose {unite_val} .
        """

        insert_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        INSERT DATA {{
            {triples}
        }}
        """

        success, error = sparql_update(insert_query)
        print("UPDATE NUTRIMENT CALLED WITH:", nutriment_id)
        print("REQUEST JSON:", request.json)
        return jsonify({"success": success, "error": error if not success else ""})
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
        condition_id = data.get('id')
        if not condition_id:
            condition_id = uuid.uuid4().hex[:8]  # short UUID only
        
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
@app.route('/api/conditions/<condition_id>', methods=['PUT'])
def update_condition(condition_id):
    """Update a medical condition safely"""
    try:
        data = request.json
        condition_uri = generate_uri("condition", condition_id)
        nom_val = build_sparql_value(data.get('nom', 'Unknown'), 'string')

        update_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        DELETE {{ <{condition_uri}> nutrition:nom ?oldNom }}
        INSERT {{ <{condition_uri}> nutrition:nom {nom_val} }}
        WHERE {{ <{condition_uri}> nutrition:nom ?oldNom }}
        """

        success, error = sparql_update(update_query)
        print("UPDATE CONDITION CALLED WITH:", condition_id)
        print("REQUEST JSON:", data)
        return jsonify({"success": success, "error": error if not success else ""})

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
    
@app.route('/api/allergies/<allergie_id>', methods=['PUT'])
def update_allergie(allergie_id):
    """Update an allergie"""
    try:
        data = request.json
        allergie_uri = generate_uri("allergie", allergie_id)
        print("UPDATE ALLERGIE URI:", allergie_uri)

        # Delete old data
        delete_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        DELETE {{ <{allergie_uri}> ?p ?o }}
        WHERE {{ <{allergie_uri}> ?p ?o }}
        """
        sparql_update(delete_query)

        # Insert new data
        nom_val = build_sparql_value(data.get('nom', 'Unknown'), 'string')
        type_val = build_sparql_value(data.get('typeAllergie', 'Inconnu'), 'string')

        triples = f"""
            <{allergie_uri}> a nutrition:Allergie ;
                             nutrition:nom {nom_val} ;
                             nutrition:typeAllergie {type_val} .
        """

        insert_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        INSERT DATA {{
            {triples}
        }}
        """
        print("Triples to insert:", triples)

        success, error = sparql_update(insert_query)
        print("UPDATE ALLERGIE CALLED WITH:", allergie_id)
        print("REQUEST JSON:", request.json)
        return jsonify({"success": success, "error": error if not success else ""})

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
        type_val = build_sparql_value(data.get('type', 'Unknown'), 'string')
        
        triples = f"""
            <{repas_uri}> a nutrition:Repas ;
                          nutrition:nom {nom_val} ;
                          nutrition:type {type_val} ."""

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
        new_type = data.get("type")

        if not new_name:
            return jsonify({"success": False, "error": "Nom manquant"}), 400

        clean_id = clean_repas_id(repas_id)
        repas_uri = generate_uri("repas", clean_id)

        # Construction sécurisée de la requête SPARQL
        type_line = ""
        if new_type:
            type_line = f'<{repas_uri}> nutrition:type "{new_type}"^^xsd:string .'
        
        # --- Requête SPARQL corrigée ---
        update_query = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

        DELETE {{
            <{repas_uri}> nutrition:nom ?oldName .
            <{repas_uri}> nutrition:type ?oldType .
        }}
        INSERT {{
            <{repas_uri}> nutrition:nom "{new_name}"^^xsd:string .
            {type_line}
        }}
        WHERE {{
            OPTIONAL {{ <{repas_uri}> nutrition:nom ?oldName . }}
            OPTIONAL {{ <{repas_uri}> nutrition:type ?oldType . }}
        }}
        """

        print("[DEBUG] SPARQL Update:", update_query)

        success, error = sparql_update(update_query)
        return jsonify({"success": success, "error": error if not success else ""}), 200 if success else 400

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
    """Recherche sémantique avancée avec gestion d'erreur améliorée"""
    try:
        data = request.json
        query_text = data.get('query', '').strip()
        
        if not query_text:
            return jsonify({"error": "La requête est requise"}), 400
        
        print(f"🎯 [Recherche] Requête reçue: '{query_text}'")
        
        # Analyse sémantique
        sparql_query_text = nutrition_parser.parse_query(query_text)
        
        if not sparql_query_text:
            return jsonify({
                "error": "Désolé, je n'ai pas pu analyser votre requête. Essayez de la reformuler.",
                "suggestions": [
                    "Quels aliments sont riches en fibres ?",
                    "Personnes de plus de 50 ans",
                    "Recettes faibles en calories",
                    "Aliments avec index glycémique bas"
                ]
            }), 400
        
        print(f"📊 [Recherche] Requête SPARQL générée:\n{sparql_query_text}")
        
        # Exécution
        results = sparql_query(sparql_query_text)
        
        if "error" in results:
            return jsonify({
                "error": f"Erreur lors de l'exécution: {results['error']}",
                "generated_sparql": sparql_query_text
            }), 400
            
        bindings = results.get("results", {}).get("bindings", [])
        
        return jsonify({
            "results": bindings,
            "generated_sparql": sparql_query_text,
            "original_query": query_text,
            "count": len(bindings),
            "success": True
        })
        
    except Exception as e:
        print(f"❌ [Recherche] Erreur: {str(e)}")
        return jsonify({
            "error": f"Erreur lors de la recherche: {str(e)}",
            "success": False
        }), 400

@app.route('/api/search-examples', methods=['GET'])
def get_search_examples():
    """Retourne des exemples de recherche par catégorie"""
    examples = {
        "personnes": [
            "Personnes de plus de 60 ans",
            "Utilisateurs pesant moins de 70kg", 
            "Jeunes de moins de 30 ans",
            "Personnes avec taille 175 cm"
        ],
        "aliments": [
            "Aliments riches en fibres",
            "Faible index glycémique",
            "Aliments moins de 200 calories",
            "Riche en protéines"
        ],
        "recettes": [
            "Recettes pour diabétiques",
            "Plats végétariens",
            "Recettes rapides",
            "Cuisine santé"
        ],
        "activités": [
            "Activités pour brûler des calories",
            "Exercices cardio",
            "Sports d'endurance"
        ]
    }
    return jsonify(examples)

@app.route('/api/search-stats', methods=['GET'])
def get_search_stats():
    """Statistiques sur les données disponibles"""
    stats_query = """
    PREFIX nutrition: <http://www.semanticweb.org/user/ontologies/2025/8/nutrition#>
    SELECT ?type (COUNT(?entity) as ?count) WHERE {
        ?entity a ?class .
        BIND(REPLACE(STR(?class), ".*#", "") AS ?type)
    } GROUP BY ?type
    """
    
    results = sparql_query(stats_query)
    stats = {}
    
    for binding in results.get("results", {}).get("bindings", []):
        stats[binding['type']['value']] = int(binding['count']['value'])
    
    return jsonify(stats)


def build_sparql_from_natural_language(query_text):
    """Fonction principale avec SpaCy intégré"""
    return nutrition_parser.parse_query(query_text)

def build_sparql_from_natural_language_old(query_text):
    """Ancienne fonction (pour backup)"""
    # Détection des intentions et entités
    words = query_text.split()
    
    # Détection du type d'entité recherché - AMÉLIORATION ICI
    entity_type = None
    
    # Détection plus précise des entités
    if any(word in query_text for word in ["recette", "recettes", "préparer", "cuisiner", "plat", "repas"]):
        entity_type = "Recette"
    elif any(word in query_text for word in ["activité", "activités", "sport", "exercice", "entraînement"]):
        entity_type = "ActivitePhysique"
    elif any(word in query_text for word in ["personne", "utilisateur", "patient", "user", "individu"]):
        entity_type = "Personne"
    elif any(word in query_text for word in ["aliment", "nourriture", "food", "manger", "fruit", "légume", "viande"]):
        entity_type = "Aliment"
    
    # Si aucun type n'est détecté, on essaie une recherche multi-entités
    if entity_type is None:
        return build_multi_entity_search(query_text)
    
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
    
    # Pour les PERSONNES, on a des critères spécifiques
    if entity_type == "Personne":
        additional_selects.extend(["?âge", "?poids", "?taille"])
        additional_triples.extend([
            "?entity nutrition:âge ?âge .",
            "?entity nutrition:poids ?poids .", 
            "?entity nutrition:taille ?taille ."
        ])
        
        # Recherche par nom de personne
        if "appel" in query_text or "nommé" in query_text or "nomme" in query_text or "prénom" in query_text:
            name_match = re.search(r'(appel[ée]s?|nomm[ée]s?|prénom)\s+([^,.!?]+)', query_text)
            if name_match:
                person_name = name_match.group(2).strip()
                filters.append(f'REGEX(?nom, "{person_name}", "i")')
        
        # Filtres spécifiques aux personnes
        if any(word in query_text for word in ["âge", "vieille", "jeune"]):
            if "jeune" in query_text:
                filters.append("?âge <= 30")
                order_by = "?âge"
            elif "vieille" in query_text or "âgé" in query_text:
                filters.append("?âge >= 60")
                order_by = "DESC(?âge)"
    
    # Pour les ALIMENTS (garder votre logique existante mais l'adapter)
    elif entity_type == "Aliment":
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

        # Recherche par nom d'aliment
        if "appel" in query_text or "nommé" in query_text or "nomme" in query_text:
            name_match = re.search(r'(appel[ée]s?|nomm[ée]s?)\s+([^,.!?]+)', query_text)
            if name_match:
                food_name = name_match.group(2).strip()
                filters.append(f'REGEX(?nom, "{food_name}", "i")')
    
    # Pour les RECETTES et ACTIVITÉS (logique simplifiée)
    elif entity_type in ["Recette", "ActivitePhysique"]:
        # Recherche par nom
        if "appel" in query_text or "nommé" in query_text or "nomme" in query_text:
            name_match = re.search(r'(appel[ée]s?|nomm[ée]s?)\s+([^,.!?]+)', query_text)
            if name_match:
                item_name = name_match.group(2).strip()
                filters.append(f'REGEX(?nom, "{item_name}", "i")')
    
    # Construction de la requête finale selon le type d'entité
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
    
    # Calcul du score de pertinence
    base_query += """
        BIND(1.0 AS ?score)
        BIND("" AS ?details)
    """
    
    base_query += f"}} ORDER BY {order_by} LIMIT 20"
    
    return base_query

def build_multi_entity_search(query_text):
    """Recherche dans plusieurs types d'entités quand le type n'est pas clair"""
    
    base_query = f"""
    PREFIX nutrition: <{ONTOLOGY_PREFIX}>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    SELECT ?id ?nom ?type ?score ?details ?calories ?indexGlycemique ?teneurFibres ?teneurSodium WHERE {{
    {{
        # Recherche dans les aliments
        ?entity a nutrition:Aliment ;
                nutrition:nom ?nom .
        BIND("Aliment" AS ?type)
        BIND(STRAFTER(STR(?entity), "#") AS ?id)
        OPTIONAL {{ ?entity nutrition:calories ?calories }}
        OPTIONAL {{ ?entity nutrition:indexGlycémique ?indexGlycemique }}
        OPTIONAL {{ ?entity nutrition:teneurFibres ?teneurFibres }}
        OPTIONAL {{ ?entity nutrition:teneurSodium ?teneurSodium }}
    }}
    UNION
    {{
        # Recherche dans les personnes
        ?entity a nutrition:Personne ;
                nutrition:nom ?nom .
        BIND("Personne" AS ?type)
        BIND(STRAFTER(STR(?entity), "#") AS ?id)
        BIND("" AS ?calories)
        BIND("" AS ?indexGlycemique) 
        BIND("" AS ?teneurFibres)
        BIND("" AS ?teneurSodium)
    }}
    UNION
    {{
        # Recherche dans les recettes
        ?entity a nutrition:Recette ;
                nutrition:nom ?nom .
        BIND("Recette" AS ?type)
        BIND(STRAFTER(STR(?entity), "#") AS ?id)
        BIND("" AS ?calories)
        BIND("" AS ?indexGlycemique)
        BIND("" AS ?teneurFibres)
        BIND("" AS ?teneurSodium)
    }}
    UNION
    {{
        # Recherche dans les activités
        ?entity a nutrition:ActivitePhysique ;
                nutrition:nom ?nom .
        BIND("Activité" AS ?type)
        BIND(STRAFTER(STR(?entity), "#") AS ?id)
        BIND("" AS ?calories)
        BIND("" AS ?indexGlycemique)
        BIND("" AS ?teneurFibres)
        BIND("" AS ?teneurSodium)
    }}
    
    # Filtre par nom si spécifié
    """
    
    # Recherche par nom
    name_match = re.search(r'(appel[ée]s?|nomm[ée]s?|prénom|qui s\'appelle)\s+([^,.!?]+)', query_text)
    if name_match:
        search_name = name_match.group(2).strip()
        base_query += f'    FILTER(REGEX(?nom, "{search_name}", "i"))\n'
    
    base_query += """
        BIND(1.0 AS ?score)
        BIND("" AS ?details)
    }} ORDER BY ?type ?nom LIMIT 20
    """
    
    return base_query

@app.route('/api/search-suggestions', methods=['GET'])
def get_search_suggestions():
    """Get search suggestions based on common queries"""
    suggestions = [
        "Personnes vieux ?",
        "Personnes Jeunes ?",
        "Personnes de taille 183 cm ?",
        "Moins de 200 calories ",
        "Activités physiques pour brûler des calories",

        
    ]
    return jsonify(suggestions)

if __name__ == '__main__':
    app.run(debug=True, port=5000)