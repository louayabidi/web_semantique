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
        SELECT ?aliment ?nom ?calories ?indexGlycémique ?indiceSatiété ?scoreNutritionnel
            ?groupe ?nutriment ?recommandation ?contreIndication
            ?estRicheEnFibres ?estIndexGlycemiqueEleve
        WHERE {{
            ?aliment a nutrition:Aliment .
            
            OPTIONAL {{ ?aliment nutrition:nom ?nom . }}
            OPTIONAL {{ ?aliment nutrition:Calories ?calories . }}
            OPTIONAL {{ ?aliment nutrition:indexGlycémique ?indexGlycémique . }}
            OPTIONAL {{ ?aliment nutrition:indiceSatiété ?indiceSatiété . }}
            OPTIONAL {{ ?aliment nutrition:scoreNutritionnel ?scoreNutritionnel . }}
            
            # Relations
            OPTIONAL {{ ?aliment nutrition:appartientÀGroupe ?groupe . }}
            OPTIONAL {{ ?aliment nutrition:contient ?nutriment . }}
            OPTIONAL {{ ?aliment nutrition:estRecommandéPour ?recommandation . }}
            OPTIONAL {{ ?aliment nutrition:estContreIndiquéPour ?contreIndication . }}
            
            # Sous-classes
            OPTIONAL {{ 
                ?aliment a nutrition:AlimentRicheEnFibres .
                BIND("true" as ?estRicheEnFibres)
            }}
            OPTIONAL {{ 
                ?aliment a nutrition:AlimentÀIndexGlycémiqueÉlevé .
                BIND("true" as ?estIndexGlycemiqueEleve)
            }}
        }}
        ORDER BY ?nom
        """
    
   # Dans votre fichier sparql.py
    def create_aliment(self, aliment_id: str, aliment):
        """Crée un aliment COMPLET avec toutes ses relations"""
        
        clean_id = self.clean_id(aliment_id)
        
        sparql = f"""
        {self.prefix}
        INSERT DATA {{
            nutrition:{clean_id} a nutrition:Aliment ;
                nutrition:nom "{aliment.nom}" ;
                nutrition:Calories {aliment.calories} ;
                nutrition:indexGlycémique {aliment.indexGlycémique} ;
                nutrition:indiceSatiété {aliment.indiceSatiété} ;
                nutrition:scoreNutritionnel {aliment.scoreNutritionnel} .
        """
        
        # AJOUTER TOUTES LES RELATIONS
        # Groupes alimentaires
        for groupe in aliment.groupes:
            clean_groupe = self.clean_id(groupe)
            sparql += f"    nutrition:{clean_id} nutrition:appartientÀGroupe nutrition:{clean_groupe} .\n"
        
        # Nutriments
        for nutriment in aliment.nutriments:
            clean_nutriment = self.clean_id(nutriment)
            sparql += f"    nutrition:{clean_id} nutrition:contient nutrition:{clean_nutriment} .\n"
        
        # Recommandations
        for reco in aliment.recommandations:
            clean_reco = self.clean_id(reco)
            sparql += f"    nutrition:{clean_id} nutrition:estRecommandéPour nutrition:{clean_reco} .\n"
        
        # Contre-indications
        for contre in aliment.contre_indications:
            clean_contre = self.clean_id(contre)
            sparql += f"    nutrition:{clean_id} nutrition:estContreIndiquéPour nutrition:{clean_contre} .\n"
        
        # Sous-classes spéciales
        if aliment.est_riche_en_fibres:
            sparql += f"    nutrition:{clean_id} a nutrition:AlimentRicheEnFibres .\n"
        
        if aliment.est_index_glycemique_eleve:
            sparql += f"    nutrition:{clean_id} a nutrition:AlimentÀIndexGlycémiqueÉlevé .\n"
        
        sparql += "}"
        return sparql

    def clean_id(self, text: str) -> str:
        """Nettoie un ID pour SPARQL"""
        return text.replace(" ", "_").replace("'", "").replace(",", "")
    