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
from typing import Dict, List, Any, Optional, Tuple
import logging

# Configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

FUSEKI_URL = os.getenv("FUSEKI_URL", "http://localhost:3030")
FUSEKI_USERNAME = os.getenv("FUSEKI_USERNAME", "admin")
FUSEKI_PASSWORD = os.getenv("FUSEKI_PASSWORD", "admin")
DATASET_NAME = "nutrition"
SPARQL_QUERY_ENDPOINT = f"{FUSEKI_URL}/{DATASET_NAME}/sparql"
SPARQL_UPDATE_ENDPOINT = f"{FUSEKI_URL}/{DATASET_NAME}/update"
ONTOLOGY_PREFIX = "http://www.semanticweb.org/user/ontologies/2025/8/nutrition#"

# ==================== INTELLIGENCE ARTIFICIELLE AVANCÉE ====================

class AdvancedNutritionNLU:
    """NLU ultra-intelligent avec compréhension contextuelle"""
    
    def __init__(self):
        self.entity_keywords = {
            'aliment': ['aliment', 'nourriture', 'plat', 'fruit', 'légume', 'viande', 'poisson', 
                       'féculent', 'produit laitier', 'céréale', 'boisson', 'snack'],
            'recette': ['recette', 'préparation', 'cuisine', 'menu', 'repas', 'plat cuisiné', 
                       'dessert', 'entrée', 'salade', 'soupe'],
            'activité': ['activité', 'sport', 'exercice', 'entraînement', 'cardio', 'musculation',
                        'yoga', 'natation', 'course', 'marche', 'vélo'],
            'personne': ['personne', 'utilisateur', 'patient', 'client', 'moi', 'je', 'utilisateur_'],
            'nutriment': ['nutriment', 'vitamine', 'minéral', 'protéine', 'fibre', 'glucide',
                         'lipide', 'calcium', 'fer', 'magnésium'],
            'condition': ['condition', 'maladie', 'diabète', 'hypertension', 'obésité', 'allergie',
                         'intolérance', 'cholestérol', 'cardiaque']
        }
        
        self.intent_patterns = {
            'recherche': r'\b(quels|quel|quelle|montre|donne|cherche|trouve|recherche|quelles|affiche)\b',
            'comparaison': r'\b(compare|comparer|différence|meilleur|pire|plus|moins|mieux|pire)\b',
            'recommandation': r'\b(recommande|conseille|suggère|idée|conseil|propose|idéal)\b',
            'statistique': r'\b(combien|nombre|total|statistique|moyenne|quantité|pourcentage)\b',
            'composition': r'\b(composé|contient|ingrédient|composition|éléments|constitué)\b',
            'planification': r'\b(plan|programme|menu|semaine|jour|quotidien|horaire)\b'
        }
        
        self.attribute_mapping = {
            'calories': ['calorie', 'énergétique', 'énergie', 'brûler'],
            'glycémique': ['glycémique', 'ig', 'index glycémique', 'sucre', 'glucose'],
            'fibres': ['fibre', 'fibreux', 'digestion', 'transit'],
            'sodium': ['sodium', 'sel', 'salé', 'tension'],
            'protéines': ['protéine', 'muscle', 'protéique', 'acide aminé'],
            'lipides': ['lipide', 'graisse', 'gras', 'cholestérol'],
            'vitamines': ['vitamine', 'nutriment', 'minéral']
        }
        
        self.medical_conditions = {
            'diabète': ['diabète', 'diabétique', 'glycémie', 'insuline'],
            'hypertension': ['hypertension', 'tension', 'pression artérielle', 'sel'],
            'obésité': ['obésité', 'surpoids', 'maigrir', 'perte poids', 'minceur'],
            'cardio': ['cardiaque', 'cœur', 'cardiovasculaire', 'cholestérol'],
            'allergie': ['allergie', 'allergique', 'intolérance']
        }

    def analyze_query(self, query: str) -> Dict[str, Any]:
        """Analyse ultra-intelligente avec contexte sémantique"""
        query_lower = query.lower().strip()
        
        analysis = {
            'original_query': query,
            'entities': self._detect_entities(query_lower),
            'intent': self._detect_intent(query_lower),
            'attributes': self._detect_attributes(query_lower),
            'filters': self._detect_filters(query_lower),
            'comparisons': self._detect_comparisons(query_lower),
            'limit': self._detect_limit(query_lower),
            'context': self._analyze_context(query_lower),
            'proper_names': self._extract_proper_names(query)
        }
        
        return analysis

    def _detect_entities(self, query: str) -> List[str]:
        """Détection intelligente des entités avec scoring"""
        entities = []
        scores = {}
        
        for entity_type, keywords in self.entity_keywords.items():
            score = 0
            for keyword in keywords:
                if keyword in query:
                    score += 1
                    # Bonus pour les mots exacts
                    if f' {keyword} ' in f' {query} ':
                        score += 2
            
            if score > 0:
                scores[entity_type] = score
        
        # Trier par score et prendre les 2 meilleurs
        sorted_entities = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        entities = [entity for entity, score in sorted_entities[:2]]
        
        # Détection spéciale pour les noms propres
        if not entities and any(word.istitle() for word in query.split()):
            entities.append('personne')
            
        return entities if entities else ['aliment']

    def _detect_intent(self, query: str) -> str:
        """Détection d'intention avec priorité"""
        for intent, pattern in self.intent_patterns.items():
            if re.search(pattern, query):
                return intent
        return 'recherche'

    def _detect_attributes(self, query: str) -> List[str]:
        """Détection des attributs recherchés"""
        attributes = []
        for attr, keywords in self.attribute_mapping.items():
            if any(keyword in query for keyword in keywords):
                attributes.append(attr)
        return attributes

    def _detect_filters(self, query: str) -> List[str]:
        """Détection des conditions médicales"""
        filters = []
        for condition, keywords in self.medical_conditions.items():
            if any(keyword in query for keyword in keywords):
                filters.append(condition)
        return filters

    def _detect_comparisons(self, query: str) -> List[str]:
        """Détection des comparaisons"""
        comparisons = []
        low_patterns = ['faible', 'bas', 'peu', 'réduit', 'minime', 'léger']
        high_patterns = ['élevé', 'haut', 'beaucoup', 'important', 'fort', 'riche']
        
        if any(pattern in query for pattern in low_patterns):
            comparisons.append('faible')
        if any(pattern in query for pattern in high_patterns):
            comparisons.append('élevé')
            
        return comparisons

    def _detect_limit(self, query: str) -> int:
        """Détection de limite de résultats"""
        limit_match = re.search(r'\b(\d+)\s+(résultats?|items?)\b', query)
        return int(limit_match.group(1)) if limit_match else 10

    def _analyze_context(self, query: str) -> Dict[str, Any]:
        """Analyse contextuelle avancée"""
        context = {
            'time_context': self._extract_time_context(query),
            'quantity_context': self._extract_quantities(query),
            'goal_context': self._extract_goals(query),
            'restriction_context': self._extract_restrictions(query)
        }
        return context

    def _extract_time_context(self, query: str) -> str:
        """Extrait le contexte temporel"""
        if any(word in query for word in ['petit déjeuner', 'matin']):
            return 'morning'
        elif any(word in query for word in ['déjeuner', 'midi']):
            return 'lunch'
        elif any(word in query for word in ['dîner', 'soir']):
            return 'dinner'
        elif any(word in query for word in ['collation', 'goûter']):
            return 'snack'
        return 'any'

    def _extract_quantities(self, query: str) -> List[str]:
        """Extrait les quantités mentionnées"""
        quantities = re.findall(r'\b(\d+\s*(g|mg|kg|ml|calories?))\b', query)
        return [q[0] for q in quantities]

    def _extract_goals(self, query: str) -> List[str]:
        """Extrait les objectifs mentionnés"""
        goals = []
        goal_keywords = {
            'weight_loss': ['maigrir', 'perdre poids', 'minceur', 'régime'],
            'muscle_gain': ['muscle', 'musculation', 'prise masse', 'force'],
            'energy': ['énergie', 'vitalité', 'tonus', 'fatigue'],
            'health': ['santé', 'bien-être', 'équilibre', 'forme']
        }
        
        for goal, keywords in goal_keywords.items():
            if any(keyword in query for keyword in keywords):
                goals.append(goal)
                
        return goals

    def _extract_restrictions(self, query: str) -> List[str]:
        """Extrait les restrictions alimentaires"""
        restrictions = []
        restriction_keywords = {
            'vegetarian': ['végétarien', 'végétarienne'],
            'vegan': ['végan', 'végétalien'],
            'gluten_free': ['sans gluten', 'gluten'],
            'lactose_free': ['sans lactose', 'lactose'],
            'sugar_free': ['sans sucre', 'sucré']
        }
        
        for restriction, keywords in restriction_keywords.items():
            if any(keyword in query for keyword in keywords):
                restrictions.append(restriction)
                
        return restrictions

    def _extract_proper_names(self, query: str) -> List[str]:
        """Extrait les noms propres"""
        return re.findall(r'\b[A-Z][a-z]+\b', query)

class IntelligentSPARQLBuilder:
    """Builder SPARQL ultra-intelligent avec génération contextuelle"""
    
    def __init__(self):
        self.prefixes = f"""
        PREFIX nutrition: <{ONTOLOGY_PREFIX}>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        """

    def build_query(self, analysis: Dict[str, Any]) -> str:
        """Construit une requête SPARQL ultra-intelligente"""
        try:
            if analysis['intent'] == 'comparaison':
                return self._build_comparison_query(analysis)
            elif analysis['intent'] == 'recommandation':
                return self._build_recommendation_query(analysis)
            elif analysis['intent'] == 'statistique':
                return self._build_statistical_query(analysis)
            elif analysis['intent'] == 'planification':
                return self._build_planning_query(analysis)
            else:
                return self._build_advanced_search_query(analysis)
        except Exception as e:
            logger.error(f"Query building error: {e}")
            return self._build_fallback_query(analysis)

    def _build_advanced_search_query(self, analysis: Dict[str, Any]) -> str:
        """Construction de requête de recherche avancée"""
        entity_type = analysis['entities'][0] if analysis['entities'] else 'aliment'
        
        # Construction flexible selon le type d'entité
        query_components = {
            'select': self._build_advanced_select(analysis, entity_type),
            'where': self._build_advanced_where(analysis, entity_type),
            'filter': self._build_advanced_filters(analysis, entity_type),
            'order': self._build_advanced_order(analysis, entity_type),
            'limit': f"LIMIT {analysis['limit']}"
        }
        
        query = f"""
        {self.prefixes}
        {query_components['select']}
        WHERE {{
            {query_components['where']}
            {query_components['filter']}
        }}
        {query_components['order']}
        {query_components['limit']}
        """
        
        return self._optimize_query(query)

    def _build_advanced_select(self, analysis: Dict[str, Any], entity_type: str) -> str:
        """Construction SELECT avancée"""
        base_vars = "?id ?nom ?type ?score"
        
        # Variables dynamiques selon le type d'entité et les attributs
        dynamic_vars = self._get_dynamic_variables(analysis, entity_type)
        
        return f"SELECT {base_vars} {dynamic_vars}"

    def _get_dynamic_variables(self, analysis: Dict[str, Any], entity_type: str) -> str:
        """Retourne les variables dynamiques selon le contexte"""
        var_mapping = {
            'aliment': {
                'calories': '?calories',
                'glycémique': '?indexGlycemique',
                'fibres': '?teneurFibres', 
                'sodium': '?teneurSodium',
                'protéines': '?proteines',
                'lipides': '?lipides'
            },
            'personne': {
                'âge': '?âge',
                'poids': '?poids',
                'taille': '?taille',
                'objectif': '?objectifPoids'
            },
            'recette': {
                'description': '?description',
                'temps': '?tempsPreparation',
                'difficulté': '?niveauDifficulte'
            },
            'activité': {
                'durée': '?duree',
                'intensité': '?intensite',
                'calories_brûlées': '?caloriesBrulees'
            }
        }
        
        variables = []
        entity_vars = var_mapping.get(entity_type, {})
        
        # Ajouter les variables demandées
        for attr in analysis['attributes']:
            if attr in entity_vars:
                variables.append(entity_vars[attr])
        
        # Ajouter les variables contextuelles
        if analysis['context']['goal_context']:
            variables.append('?objectif')
        if analysis['context']['restriction_context']:
            variables.append('?restrictions')
            
        return " ".join(variables) if variables else ""

    def _build_advanced_where(self, analysis: Dict[str, Any], entity_type: str) -> str:
        """Construction WHERE avancée avec intelligence contextuelle"""
        entity_config = self._get_entity_config(entity_type)
        
        where = f"""
        ?entity a {entity_config['type']} ;
                nutrition:nom ?nom .
        BIND("{entity_type.capitalize()}" AS ?type)
        BIND(STRAFTER(STR(?entity), "#") AS ?id)
        """
        
        # Recherche textuelle intelligente
        where += self._build_smart_text_search(analysis)
        
        # Score de pertinence contextuel
        where += self._build_contextual_score(analysis)
        
        # Propriétés optionnelles intelligentes
        where += self._build_smart_optional_properties(analysis, entity_type)
        
        # Relations contextuelles
        where += self._build_contextual_relations(analysis, entity_type)
        
        return where

    def _get_entity_config(self, entity_type: str) -> Dict[str, str]:
        """Configuration des entités"""
        configs = {
            'aliment': {'type': 'nutrition:Aliment', 'name_prop': 'nutrition:nom'},
            'recette': {'type': 'nutrition:Recette', 'name_prop': 'nutrition:nom'},
            'activité': {'type': 'nutrition:ActivitePhysique', 'name_prop': 'nutrition:nom'},
            'personne': {'type': 'nutrition:Personne', 'name_prop': 'nutrition:nom'},
            'nutriment': {'type': 'nutrition:Nutriment', 'name_prop': 'nutrition:nom'},
            'condition': {'type': 'nutrition:ConditionMedicale', 'name_prop': 'nutrition:nom'}
        }
        return configs.get(entity_type, configs['aliment'])

    def _build_smart_text_search(self, analysis: Dict[str, Any]) -> str:
        """Recherche textuelle intelligente"""
        query = analysis['original_query']
        
        # Si recherche par nom propre, priorité aux personnes
        if analysis['proper_names']:
            names = analysis['proper_names']
            conditions = [f'REGEX(LCASE(?nom), "{name}", "i")' for name in names]
            return f"FILTER({' || '.join(conditions)})\n"
        
        # Recherche sémantique avancée
        words = self._extract_meaningful_words(query)
        if words:
            conditions = [f'REGEX(LCASE(?nom), "{word}", "i")' for word in words]
            return f"FILTER({' || '.join(conditions)})\n"
        
        return ""

    def _extract_meaningful_words(self, query: str) -> List[str]:
        """Extrait les mots significatifs d'une requête"""
        stop_words = {
            'quels', 'quel', 'quelle', 'quelles', 'donne', 'montre', 'recherche',
            'aliments', 'aliment', 'recettes', 'recette', 'activités', 'activité',
            'personnes', 'personne', 'pour', 'avec', 'sans', 'les', 'des', 'du', 'de',
            'est', 'son', 'ses', 'ces', 'cet', 'cette', 'dans', 'sur', 'par', 'au'
        }
        
        words = query.lower().split()
        meaningful = [word for word in words if word not in stop_words and len(word) > 2]
        
        # Si requête très courte, garder tous les mots significatifs
        if not meaningful and len(words) <= 3:
            meaningful = [word for word in words if len(word) > 1]
            
        return meaningful

    def _build_contextual_score(self, analysis: Dict[str, Any]) -> str:
        """Calcul de score contextuel"""
        score_parts = ["1.0"]  # Score de base
        
        # Bonus pour la correspondance exacte du nom
        if analysis['proper_names']:
            for name in analysis['proper_names']:
                score_parts.append(f'(IF(REGEX(LCASE(?nom), "{name}", "i"), 2.0, 0.0))')
        
        # Bonus pour les attributs recherchés
        for attr in analysis['attributes']:
            score_parts.append(f'(IF(BOUND(?{attr}), 0.5, 0.0))')
        
        # Bonus pour les filtres médicaux
        for medical_filter in analysis['filters']:
            score_parts.append(f'(IF(BOUND(?{medical_filter}), 1.0, 0.0))')
        
        return f"BIND({' + '.join(score_parts)} AS ?score)\n"

    def _build_smart_optional_properties(self, analysis: Dict[str, Any], entity_type: str) -> str:
        """Propriétés optionnelles intelligentes"""
        optional = ""
        
        property_mapping = {
            'aliment': [
                ('nutrition:calories', '?calories'),
                ('nutrition:indexGlycémique', '?indexGlycemique'),
                ('nutrition:teneurFibres', '?teneurFibres'),
                ('nutrition:teneurSodium', '?teneurSodium'),
                ('nutrition:teneurProteines', '?proteines'),
                ('nutrition:teneurLipides', '?lipides')
            ],
            'personne': [
                ('nutrition:âge', '?âge'),
                ('nutrition:poids', '?poids'),
                ('nutrition:taille', '?taille'),
                ('nutrition:objectifPoids', '?objectifPoids')
            ]
        }
        
        properties = property_mapping.get(entity_type, [])
        for prop, var in properties:
            # Ne récupérer que les propriétés pertinentes
            if self._is_property_relevant(prop, analysis):
                optional += f"OPTIONAL {{ ?entity {prop} {var} }}\n"
        
        return optional

    def _is_property_relevant(self, property: str, analysis: Dict[str, Any]) -> bool:
        """Détermine si une propriété est pertinente dans le contexte"""
        property_keywords = {
            'nutrition:calories': ['calorie', 'énergie'],
            'nutrition:indexGlycémique': ['glycémique', 'sucre'],
            'nutrition:teneurFibres': ['fibre', 'digestion'],
            'nutrition:teneurSodium': ['sodium', 'sel']
        }
        
        query = analysis['original_query'].lower()
        keywords = property_keywords.get(property, [])
        return any(keyword in query for keyword in keywords)

    def _build_advanced_filters(self, analysis: Dict[str, Any], entity_type: str) -> str:
        """Filtres avancés avec intelligence contextuelle"""
        filters = []
        
        # Filtres médicaux intelligents
        medical_filters = {
            'diabète': '?indexGlycemique <= 55',
            'hypertension': '?teneurSodium <= 150', 
            'obésité': '?calories <= 200'
        }
        
        for condition in analysis['filters']:
            if condition in medical_filters:
                filters.append(f'({medical_filters[condition]} || !BOUND(?{condition}))')
        
        # Filtres de comparaison contextuels
        if 'faible' in analysis['comparisons']:
            if 'calories' in analysis['attributes']:
                filters.append('(?calories <= 150 || !BOUND(?calories))')
            if 'glycémique' in analysis['attributes']:
                filters.append('(?indexGlycemique <= 55 || !BOUND(?indexGlycemique))')
                
        if 'élevé' in analysis['comparisons']:
            if 'calories' in analysis['attributes']:
                filters.append('(?calories >= 300)')
            if 'glycémique' in analysis['attributes']:
                filters.append('(?indexGlycemique >= 70)')
        
        # Filtres contextuels temporels
        time_filter = self._build_time_filter(analysis['context']['time_context'])
        if time_filter:
            filters.append(time_filter)
        
        return f"FILTER({' && '.join(filters)})\n" if filters else ""

    def _build_time_filter(self, time_context: str) -> str:
        """Filtre selon le contexte temporel"""
        time_mapping = {
            'morning': '?type = "Petit-déjeuner"',
            'lunch': '?type = "Déjeuner"', 
            'dinner': '?type = "Dîner"',
            'snack': '?type = "Collation"'
        }
        return time_mapping.get(time_context, "")

    def _build_contextual_relations(self, analysis: Dict[str, Any], entity_type: str) -> str:
        """Relations contextuelles intelligentes"""
        relations = ""
        
        # Relations pour les recommandations
        if analysis['intent'] == 'recommandation':
            if entity_type == 'aliment':
                relations += """
                OPTIONAL { 
                    ?entity nutrition:convientA ?condition .
                    ?condition nutrition:nom ?conditionNom 
                }
                """
        
        return relations

    def _build_advanced_order(self, analysis: Dict[str, Any], entity_type: str) -> str:
        """Ordre intelligent des résultats"""
        # Priorité au score de pertinence
        order = "ORDER BY DESC(?score)"
        
        # Ordre secondaire selon le contexte
        if 'faible' in analysis['comparisons']:
            if 'calories' in analysis['attributes']:
                order += " ?calories"
            elif 'glycémique' in analysis['attributes']:
                order += " ?indexGlycemique"
        elif 'élevé' in analysis['comparisons']:
            if 'calories' in analysis['attributes']:
                order += " DESC(?calories)"
            elif 'glycémique' in analysis['attributes']:
                order += " DESC(?indexGlycemique)"
        else:
            order += " ?nom"  # Ordre alphabétique par défaut
            
        return order

    def _build_comparison_query(self, analysis: Dict[str, Any]) -> str:
        """Requête de comparaison avancée"""
        # Implémentation des comparaisons entre entités
        return self._build_advanced_search_query(analysis)

    def _build_recommendation_query(self, analysis: Dict[str, Any]) -> str:
        """Requête de recommandation personnalisée"""
        # Implémentation des recommandations intelligentes
        return self._build_advanced_search_query(analysis)

    def _build_statistical_query(self, analysis: Dict[str, Any]) -> str:
        """Requête statistique avancée"""
        # Implémentation des aggregations
        return self._build_advanced_search_query(analysis)

    def _build_planning_query(self, analysis: Dict[str, Any]) -> str:
        """Requête de planification"""
        # Implémentation de la planification de repas
        return self._build_advanced_search_query(analysis)

    def _build_fallback_query(self, analysis: Dict[str, Any]) -> str:
        """Requête de fallback robuste"""
        return f"""
        {self.prefixes}
        SELECT ?id ?nom ?type ?score
        WHERE {{
            ?entity a nutrition:Aliment ;
                    nutrition:nom ?nom .
            BIND("Aliment" AS ?type)
            BIND(STRAFTER(STR(?entity), "#") AS ?id)
            BIND(1.0 AS ?score)
            FILTER(REGEX(LCASE(?nom), "{analysis['original_query']}", "i"))
        }}
        ORDER BY ?nom
        LIMIT 10
        """

    def _optimize_query(self, query: str) -> str:
        """Optimisation et nettoyage de la requête"""
        # Supprimer les lignes vides
        query = re.sub(r'\n\s*\n', '\n', query)
        # Supprimer les espaces superflus
        query = re.sub(r' +', ' ', query)
        return query.strip()

# ==================== SERVICES INTELLIGENTS ====================

nlu_engine = AdvancedNutritionNLU()
sparql_builder = IntelligentSPARQLBuilder()

def sparql_query(query):
    """Exécution de requête SPARQL avec gestion d'erreurs avancée"""
    try:
        logger.info(f"🤖 SPARQL Query:\n{query}")
        
        response = requests.post(
            SPARQL_QUERY_ENDPOINT,
            data={"query": query},
            headers={"Accept": "application/sparql-results+json"},
            auth=HTTPBasicAuth(FUSEKI_USERNAME, FUSEKI_PASSWORD),
            timeout=15
        )
        
        if response.status_code == 200:
            result = response.json()
            bindings = result.get('results', {}).get('bindings', [])
            logger.info(f"✅ Query returned {len(bindings)} results")
            return result
        else:
            logger.error(f"❌ SPARQL Error: {response.status_code}")
            return {"results": {"bindings": []}, "error": f"HTTP {response.status_code}"}
            
    except Exception as e:
        logger.error(f"💥 Query Exception: {str(e)}")
        return {"results": {"bindings": []}, "error": str(e)}

# ==================== ENDPOINTS ULTRA-INTELLIGENTS ====================

@app.route('/api/semantic-search', methods=['POST'])
def semantic_search():
    """Recherche sémantique ultra-intelligente"""
    try:
        data = request.json
        query_text = data.get('query', '').strip()
        
        if not query_text:
            return jsonify({"error": "La requête est requise"}), 400
        
        logger.info(f"🔍 Semantic search for: '{query_text}'")
        
        # Analyse NLP avancée
        analysis = nlu_engine.analyze_query(query_text)
        logger.info(f"🧠 Analysis: {analysis}")
        
        # Génération de requête intelligente
        sparql_query_text = sparql_builder.build_query(analysis)
        logger.info(f"⚡ Generated SPARQL")
        
        # Exécution
        results = sparql_query(sparql_query_text)
        
        if "error" in results:
            return jsonify({
                "error": f"Erreur technique: {results['error']}",
                "suggestions": get_intelligent_suggestions(query_text)
            }), 400
            
        # Formatage intelligent des résultats
        formatted_results = format_intelligent_results(results, analysis)
        
        response_data = {
            "results": formatted_results,
            "analysis": {
                "intent": analysis['intent'],
                "entities": analysis['entities'],
                "filters": analysis['filters'],
                "context": analysis['context']
            },
            "generated_sparql": sparql_query_text,
            "original_query": query_text,
            "result_count": len(formatted_results),
            "suggestions": get_intelligent_suggestions(query_text, formatted_results)
        }
        
        logger.info(f"🎯 Search completed: {len(formatted_results)} results")
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"💥 Semantic search error: {str(e)}")
        return jsonify({
            "error": "Erreur interne du système",
            "suggestions": get_intelligent_suggestions(query_text if 'query_text' in locals() else "")
        }), 500

def format_intelligent_results(results: Dict, analysis: Dict) -> List[Dict]:
    """Formatage intelligent des résultats avec contexte"""
    bindings = results.get('results', {}).get('bindings', [])
    formatted = []
    
    for binding in bindings:
        item = {'id': '', 'nom': '', 'type': '', 'score': 1.0}
        
        # Extraction de base
        for field in ['id', 'nom', 'type', 'score']:
            if field in binding:
                item[field] = binding[field].get('value', '')
        
        # Extraction contextuelle
        item.update(self._extract_contextual_data(binding, analysis))
        
        # Génération de description intelligente
        item['description'] = generate_intelligent_description(item, analysis)
        
        formatted.append(item)
    
    return formatted

def _extract_contextual_data(self, binding: Dict, analysis: Dict) -> Dict:
    """Extrait les données contextuelles pertinentes"""
    contextual_data = {}
    
    # Mapping des propriétés contextuelles
    context_mapping = {
        'calories': 'calories',
        'indexGlycemique': 'indexGlycémique', 
        'teneurFibres': 'fibres',
        'teneurSodium': 'sodium',
        'âge': 'âge',
        'poids': 'poids',
        'taille': 'taille'
    }
    
    for sparql_var, json_key in context_mapping.items():
        if sparql_var in binding:
            contextual_data[json_key] = binding[sparql_var].get('value')
    
    return contextual_data

def generate_intelligent_description(item: Dict, analysis: Dict) -> str:
    """Génère une description intelligente et contextuelle"""
    name = item.get('nom', '')
    entity_type = item.get('type', '').lower()
    
    # Description de base
    descriptions = {
        'aliment': f"🍎 {name}",
        'recette': f"👨‍🍳 {name}", 
        'activité': f"🏃 {name}",
        'personne': f"👤 {name}",
        'nutriment': f"💊 {name}",
        'condition': f"🏥 {name}"
    }
    
    description = descriptions.get(entity_type, f"📝 {name}")
    
    # Ajout d'informations contextuelles
    if entity_type == 'aliment':
        if item.get('calories'):
            description += f" | {item['calories']} kcal"
        if item.get('indexGlycémique'):
            description += f" | IG: {item['indexGlycémique']}"
    
    elif entity_type == 'personne':
        if item.get('âge'):
            description += f" | {item['âge']} ans"
        if item.get('poids'):
            description += f" | {item['poids']} kg"
    
    return description

def get_intelligent_suggestions(query: str, results: List = None) -> List[str]:
    """Génère des suggestions intelligentes basées sur le contexte"""
    base_suggestions = [
        "Rechercher des aliments riches en fibres et pauvres en calories",
        "Trouver des recettes adaptées pour le diabète",
        "Activités physiques pour brûler des calories efficacement",
        "Plan alimentaire équilibré pour une semaine"
    ]
    
    query_lower = query.lower()
    
    # Suggestions contextuelles
    if 'diabète' in query_lower:
        return [
            "Aliments à faible index glycémique",
            "Recettes sans sucre ajouté", 
            "Menus pour diabétiques",
            "Comment gérer la glycémie"
        ]
    elif 'poids' in query_lower or 'maigrir' in query_lower:
        return [
            "Aliments coupe-faim naturels",
            "Exercices pour perdre du poids",
            "Recettes hypocaloriques",
            "Plan de perte de poids"
        ]
    elif 'sport' in query_lower or 'activité' in query_lower:
        return [
            "Activités pour débutants",
            "Sports brûle-calories", 
            "Exercices à la maison",
            "Programme d'entraînement"
        ]
    
    return base_suggestions

@app.route('/api/search-suggestions', methods=['GET'])
def get_search_suggestions():
    """Suggestions de recherche intelligentes"""
    suggestions = [
        "Quels aliments sont riches en protéines et faibles en gras ?",
        "Montre-moi des recettes végétariennes équilibrées",
        "Activités physiques pour renforcer le cœur",
        "Aliments recommandés pour l'hypertension artérielle",
        "Comment calculer mes besoins caloriques journaliers ?",
        "Recettes sans gluten et sans lactose",
        "Plan d'entraînement pour la musculation",
        "Aliments riches en antioxydants et vitamines",
        "Menus pour une alimentation méditerranéenne",
        "Exercices pour améliorer la souplesse et la mobilité"
    ]
    return jsonify(suggestions)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check intelligent"""
    try:
        response = requests.get(
            f"{FUSEKI_URL}/$/ping",
            timeout=5,
            auth=HTTPBasicAuth(FUSEKI_USERNAME, FUSEKI_PASSWORD)
        )
        fuseki_ok = response.status_code == 200
        
        return jsonify({
            "status": "healthy" if fuseki_ok else "degraded",
            "backend": "ok",
            "fuseki": "ok" if fuseki_ok else "error",
            "timestamp": datetime.now().isoformat(),
            "version": "2.0-ultra-intelligent"
        })
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

# ==================== LANCEMENT ====================

if __name__ == '__main__':
    logger.info("🚀 Starting ULTRA-INTELLIGENT Nutrition API Server...")
    logger.info(f"📍 Fuseki URL: {FUSEKI_URL}")
    logger.info(f"📊 Dataset: {DATASET_NAME}")
    logger.info("💡 Features: Advanced NLU, Contextual SPARQL, Intelligent Results")
    
    app.run(debug=True, port=5000, host='0.0.0.0')