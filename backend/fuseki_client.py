import requests
from SPARQLWrapper import SPARQLWrapper, JSON

class FusekiClient:
    def __init__(self):
        self.query_endpoint = "http://localhost:3030/nutrition/query"
        self.update_endpoint = "http://localhost:3030/nutrition/update"
        self.data_endpoint = "http://localhost:3030/nutrition/data"
        
        # Configuration SPARQLWrapper pour les updates aussi
        self.sparql_update = SPARQLWrapper(self.update_endpoint)
    
    def execute_query(self, sparql_query):
        """Exécute une requête SELECT et retourne les résultats JSON"""
        try:
            print(f"🔍 EXECUTE_QUERY: {sparql_query[:100]}...")  # DEBUG
            sparql = SPARQLWrapper(self.query_endpoint)
            sparql.setQuery(sparql_query)
            sparql.setReturnFormat(JSON)
            results = sparql.query().convert()
            print(f"✅ QUERY RESULTS: {len(results['results']['bindings'])} éléments")  # DEBUG
            return results
        except Exception as e:
            print(f"❌ ERREUR REQUÊTE SPARQL: {e}")
            return {"results": {"bindings": []}}
    
    def execute_update(self, sparql_update):
        """Exécute une requête UPDATE (INSERT/DELETE) avec SPARQLWrapper"""
        try:
            print(f"🚀 EXECUTE_UPDATE: {sparql_update[:100]}...")  # DEBUG
            sparql = SPARQLWrapper(self.update_endpoint)
            sparql.setQuery(sparql_update)
            sparql.setMethod('POST')
            sparql.setReturnFormat(JSON)
            result = sparql.query()
            print(f"✅ UPDATE SUCCESS: {result}")  # DEBUG
            return True
        except Exception as e:
            print(f"❌ ERREUR UPDATE SPARQL: {e}")
            return False
    
    def execute_update_requests(self, sparql_update):
        """Alternative avec requests si SPARQLWrapper ne fonctionne pas"""
        try:
            print(f"🚀 EXECUTE_UPDATE_REQUESTS: {sparql_update[:100]}...")  # DEBUG
            headers = {'Content-Type': 'application/sparql-update'}
            response = requests.post(
                self.update_endpoint, 
                data=sparql_update, 
                headers=headers,
                timeout=30
            )
            print(f"📡 UPDATE RESPONSE - Status: {response.status_code}")  # DEBUG
            print(f"📡 UPDATE RESPONSE - Text: {response.text}")  # DEBUG
            return response.status_code == 200
        except Exception as e:
            print(f"❌ ERREUR UPDATE REQUESTS: {e}")
            return False