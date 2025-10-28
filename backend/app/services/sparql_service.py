from rdflib import Graph
from typing import Dict, Any, List
import json
from app.services.ontology_loader import ontology_loader

class SPARQLService:
    def __init__(self):
        self.graph = None
    
    def initialize(self):
        if self.graph is None:
            self.graph = ontology_loader.load_ontology()
    
    def execute_sparql(self, query: str) -> List[Dict[str, Any]]:
        self.initialize()
        
        try:
            results = self.graph.query(query)
            
            result_list = []
            for row in results:
                row_dict = {}
                for var in results.vars:
                    value = row[var]
                    if value:
                        value_str = str(value)
                        if "#" in value_str:
                            value_str = value_str.split("#")[-1]
                        row_dict[str(var)] = value_str
                result_list.append(row_dict)
            
            return result_list
        except Exception as e:
            raise ValueError(f"SPARQL query error: {str(e)}")
    
    def natural_language_to_sparql(self, nl_query: str) -> Dict[str, Any]:
        nl_lower = nl_query.lower().strip()
        
        templates = {
            "produits_categorie": {
                "keywords": ["produits", "aliments", "catégorie", "groupe"],
                "patterns": ["catégorie", "groupe"],
                "query_template": """
                PREFIX nutrition: <http://www.semanticweb.org/user/ontologies/2025/8/nutrition#>
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                
                SELECT DISTINCT ?aliment ?groupe
                WHERE {{
                    ?aliment rdf:type nutrition:Aliment .
                    ?aliment nutrition:appartientÀGroupe ?groupe .
                    ?groupe rdf:type nutrition:GroupeAlimentaire .
                }}
                """
            },
            "recettes_diabete": {
                "keywords": ["recettes", "diabète", "diabétiques", "diabetique"],
                "patterns": ["diabète", "diabétiques"],
                "query_template": """
                PREFIX nutrition: <http://www.semanticweb.org/user/ontologies/2025/8/nutrition#>
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                
                SELECT DISTINCT ?recette ?aliment
                WHERE {{
                    ?recette rdf:type nutrition:Recette .
                    ?recette nutrition:estComposéDe ?aliment .
                    ?aliment nutrition:estRecommandéPour ?condition .
                    ?condition rdf:type nutrition:Diabète .
                }}
                """
            },
            "nutriments_aliment": {
                "keywords": ["nutriments", "vitamines", "minéraux", "contient"],
                "patterns": ["nutriments", "vitamines"],
                "query_template": """
                PREFIX nutrition: <http://www.semanticweb.org/user/ontologies/2025/8/nutrition#>
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                
                SELECT DISTINCT ?aliment ?nutriment
                WHERE {{
                    ?aliment rdf:type nutrition:Aliment .
                    ?aliment nutrition:contient ?nutriment .
                    ?nutriment rdf:type nutrition:Nutriment .
                }}
                """
            },
            "allergies": {
                "keywords": ["allergies", "allergène", "allergènes", "sans"],
                "patterns": ["allergie", "allergène"],
                "query_template": """
                PREFIX nutrition: <http://www.semanticweb.org/user/ontologies/2025/8/nutrition#>
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                
                SELECT DISTINCT ?allergie ?type
                WHERE {{
                    ?allergie rdf:type nutrition:Allergie .
                    OPTIONAL {{ ?allergie nutrition:typeAllergie ?type . }}
                }}
                """
            },
            "objectifs": {
                "keywords": ["objectifs", "perte", "poids", "masse", "musculaire"],
                "patterns": ["objectif", "perte", "masse"],
                "query_template": """
                PREFIX nutrition: <http://www.semanticweb.org/user/ontologies/2025/8/nutrition#>
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                
                SELECT DISTINCT ?objectif ?description
                WHERE {{
                    ?objectif rdf:type nutrition:Objectif .
                    OPTIONAL {{ ?objectif nutrition:objectifBienEtre ?description . }}
                }}
                """
            },
            "liste_classes": {
                "keywords": ["classes", "liste", "types", "quoi"],
                "patterns": ["classes", "types"],
                "query_template": """
                PREFIX owl: <http://www.w3.org/2002/07/owl#>
                PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                
                SELECT DISTINCT ?class
                WHERE {{
                    ?class rdf:type owl:Class .
                }}
                LIMIT 50
                """
            }
        }
        
        matched_template = None
        for template_name, template_info in templates.items():
            if any(keyword in nl_lower for keyword in template_info["keywords"]):
                matched_template = template_info
                break
        
        if matched_template:
            sparql_query = matched_template["query_template"].strip()
            results = self.execute_sparql(sparql_query)
            
            return {
                "natural_language": nl_query,
                "sparql_query": sparql_query,
                "results": results,
                "matched_template": template_name if matched_template else "default"
            }
        else:
            default_query = """
            PREFIX nutrition: <http://www.semanticweb.org/user/ontologies/2025/8/nutrition#>
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX owl: <http://www.w3.org/2002/07/owl#>
            
            SELECT DISTINCT ?individual ?type
            WHERE {
                ?individual rdf:type owl:NamedIndividual .
                ?individual rdf:type ?type .
            }
            LIMIT 20
            """
            
            results = self.execute_sparql(default_query)
            
            return {
                "natural_language": nl_query,
                "sparql_query": default_query,
                "results": results,
                "matched_template": "default",
                "message": "No specific template matched. Showing sample individuals from ontology."
            }

sparql_service = SPARQLService()
