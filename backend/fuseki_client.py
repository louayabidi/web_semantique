import requests
from SPARQLWrapper import SPARQLWrapper, JSON

class FusekiClient:
    def __init__(self):
        self.query_endpoint = "http://localhost:3030/nutrition/query"
        self.update_endpoint = "http://localhost:3030/nutrition/update"
        self.data_endpoint = "http://localhost:3030/nutrition/data"
    
    def execute_query(self, sparql_query):
        """Exécute une requête SELECT et retourne les résultats JSON"""
        try:
            sparql = SPARQLWrapper(self.query_endpoint)
            sparql.setQuery(sparql_query)
            sparql.setReturnFormat(JSON)
            results = sparql.query().convert()
            return results
        except Exception as e:
            print(f"Erreur requête SPARQL: {e}")
            return {"results": {"bindings": []}}
    
    def execute_update(self, sparql_update):
        """Exécute une requête UPDATE (INSERT/DELETE)"""
        try:
            headers = {'Content-Type': 'application/sparql-update'}
            response = requests.post(
                self.update_endpoint, 
                data=sparql_update, 
                headers=headers
            )
            return response.status_code == 200
        except Exception as e:
            print(f"Erreur update SPARQL: {e}")
            return False
    
    def load_ontology(self, owl_file_path):
        """Charge l'ontologie OWL dans Fuseki"""
        try:
            with open(owl_file_path, 'r', encoding='utf-8') as file:
                owl_data = file.read()
            
            headers = {'Content-Type': 'application/rdf+xml'}
            response = requests.post(
                self.data_endpoint,
                data=owl_data,
                headers=headers
            )
            print(f"Ontologie chargée: {response.status_code == 200}")
            return response.status_code == 200
        except Exception as e:
            print(f"Erreur chargement ontologie: {e}")
            return False