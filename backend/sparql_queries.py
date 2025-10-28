class SparqlQueries:
    def __init__(self, base_uri="http://www.semanticweb.org/user/ontologies/2025/8/nutrition#"):
        self.base_uri = base_uri
        self.prefix = f"""
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        PREFIX nutrition: <{self.base_uri}>
        """
    
    def get_all_personnes(self):
        return f"""
        {self.prefix}
        SELECT ?personne ?nom ?age ?poids
        WHERE {{
            ?personne rdf:type nutrition:Personne .
            OPTIONAL {{ ?personne nutrition:nom ?nom }} .
            OPTIONAL {{ ?personne nutrition:âge ?age }} .
            OPTIONAL {{ ?personne nutrition:poids ?poids }} .
        }}
        """
    
    def create_personne(self, personne_id, nom, age, poids):
        return f"""
        {self.prefix}
        INSERT DATA {{
            nutrition:{personne_id} rdf:type nutrition:Personne .
            nutrition:{personne_id} nutrition:nom "{nom}" .
            nutrition:{personne_id} nutrition:âge {age} .
            nutrition:{personne_id} nutrition:poids {poids} .
        }}
        """
    
    def get_all_aliments(self):
        return f"""
        {self.prefix}
        SELECT ?aliment ?nom ?calories
        WHERE {{
            ?aliment rdf:type nutrition:Aliment .
            OPTIONAL {{ ?aliment nutrition:nom ?nom }} .
            OPTIONAL {{ ?aliment nutrition:Calories ?calories }} .
        }}
        """
    
    def create_aliment(self, aliment_id, nom, calories):
        return f"""
        {self.prefix}
        INSERT DATA {{
            nutrition:{aliment_id} rdf:type nutrition:Aliment .
            nutrition:{aliment_id} nutrition:nom "{nom}" .
            nutrition:{aliment_id} nutrition:Calories {calories} .
        }}
        """