from rdflib import Graph, Namespace, RDF, RDFS, OWL
from typing import List, Dict, Any
import os

NUTRITION_NS = Namespace("http://www.semanticweb.org/user/ontologies/2025/8/nutrition#")

class OntologyLoader:
    def __init__(self, ontology_path: str = "ontology/nutrition.owl"):
        self.graph = Graph()
        self.ontology_path = ontology_path
        self.loaded = False
        
    def load_ontology(self):
        if not self.loaded:
            try:
                file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", self.ontology_path)
                self.graph.parse(file_path, format="xml")
                self.loaded = True
                print(f"✓ Ontology loaded successfully: {len(self.graph)} triples")
            except Exception as e:
                print(f"⚠ Warning: Could not parse OWL file ({str(e)})")
                print(f"  Loading empty graph and creating basic structure from file...")
                try:
                    self._load_basic_structure()
                    self.loaded = True
                    print(f"✓ Basic ontology structure loaded: {len(self.graph)} triples")
                except Exception as fallback_error:
                    print(f"✗ Error: Could not load ontology: {fallback_error}")
                    self.loaded = False
        return self.graph
    
    def _load_basic_structure(self):
        from rdflib import Literal
        for class_name in ["Aliment", "Recette", "Nutriment", "GroupeAlimentaire", "Allergie", "Objectif", "Personne", "ConditionMédicale", "ProgrammeBienEtre", "ActivitéPhysique"]:
            class_uri = NUTRITION_NS[class_name]
            self.graph.add((class_uri, RDF.type, OWL.Class))
            self.graph.add((class_uri, RDFS.label, Literal(class_name)))
        
        for prop_name in ["contient", "appartientÀGroupe", "estComposéDe", "estRecommandéPour", "aAllergie", "Vise", "aCondition"]:
            prop_uri = NUTRITION_NS[prop_name]
            self.graph.add((prop_uri, RDF.type, OWL.ObjectProperty))
            self.graph.add((prop_uri, RDFS.label, Literal(prop_name)))
        
        for data_prop in ["nom", "Calories", "quantité", "description"]:
            prop_uri = NUTRITION_NS[data_prop]
            self.graph.add((prop_uri, RDF.type, OWL.DatatypeProperty))
            self.graph.add((prop_uri, RDFS.label, Literal(data_prop)))
        
        self._sync_with_database()
    
    def _sync_with_database(self):
        from rdflib import Literal
        try:
            from app.core.database import SessionLocal
            from app.models.nutrition import Aliment, Recette, Nutriment, GroupeAlimentaire, Allergie, Objectif
            
            db = SessionLocal()
            try:
                for groupe in db.query(GroupeAlimentaire).all():
                    groupe_uri = NUTRITION_NS[f"GroupeAlimentaire_{groupe.id}"]
                    self.graph.add((groupe_uri, RDF.type, NUTRITION_NS["GroupeAlimentaire"]))
                    self.graph.add((groupe_uri, RDF.type, OWL.NamedIndividual))
                    self.graph.add((groupe_uri, NUTRITION_NS["nom"], Literal(groupe.nom)))
                    if groupe.description:
                        self.graph.add((groupe_uri, NUTRITION_NS["description"], Literal(groupe.description)))
                
                for aliment in db.query(Aliment).limit(100).all():
                    aliment_uri = NUTRITION_NS[f"Aliment_{aliment.id}"]
                    self.graph.add((aliment_uri, RDF.type, NUTRITION_NS["Aliment"]))
                    self.graph.add((aliment_uri, RDF.type, OWL.NamedIndividual))
                    self.graph.add((aliment_uri, NUTRITION_NS["nom"], Literal(aliment.nom)))
                    if aliment.calories:
                        self.graph.add((aliment_uri, NUTRITION_NS["Calories"], Literal(aliment.calories)))
                    if aliment.description:
                        self.graph.add((aliment_uri, NUTRITION_NS["description"], Literal(aliment.description)))
                    if aliment.groupe_id:
                        groupe_uri = NUTRITION_NS[f"GroupeAlimentaire_{aliment.groupe_id}"]
                        self.graph.add((aliment_uri, NUTRITION_NS["appartientÀGroupe"], groupe_uri))
                
                for recette in db.query(Recette).limit(50).all():
                    recette_uri = NUTRITION_NS[f"Recette_{recette.id}"]
                    self.graph.add((recette_uri, RDF.type, NUTRITION_NS["Recette"]))
                    self.graph.add((recette_uri, RDF.type, OWL.NamedIndividual))
                    self.graph.add((recette_uri, NUTRITION_NS["nom"], Literal(recette.nom)))
                    if recette.description:
                        self.graph.add((recette_uri, NUTRITION_NS["description"], Literal(recette.description)))
                
                print(f"  Synced {db.query(Aliment).count()} aliments, {db.query(GroupeAlimentaire).count()} groupes from database")
            finally:
                db.close()
        except Exception as e:
            print(f"  Could not sync with database: {e}")
    
    def get_classes(self) -> List[str]:
        classes = []
        for subj in self.graph.subjects(RDF.type, OWL.Class):
            class_name = str(subj).split("#")[-1]
            if class_name and not class_name.startswith("_"):
                classes.append(class_name)
        return sorted(classes)
    
    def get_properties(self) -> Dict[str, List[str]]:
        properties = {
            "object_properties": [],
            "data_properties": []
        }
        
        for subj in self.graph.subjects(RDF.type, OWL.ObjectProperty):
            prop_name = str(subj).split("#")[-1]
            if prop_name:
                properties["object_properties"].append(prop_name)
        
        for subj in self.graph.subjects(RDF.type, OWL.DatatypeProperty):
            prop_name = str(subj).split("#")[-1]
            if prop_name:
                properties["data_properties"].append(prop_name)
        
        return properties
    
    def get_individuals(self) -> List[str]:
        individuals = []
        for subj in self.graph.subjects(RDF.type, OWL.NamedIndividual):
            individual_name = str(subj).split("#")[-1]
            if individual_name:
                individuals.append(individual_name)
        return sorted(individuals)
    
    def get_class_hierarchy(self) -> Dict[str, Any]:
        hierarchy = {}
        
        for subj, obj in self.graph.subject_objects(RDFS.subClassOf):
            subclass = str(subj).split("#")[-1]
            superclass = str(obj).split("#")[-1] if "#" in str(obj) else None
            
            if subclass and superclass and not subclass.startswith("_"):
                if superclass not in hierarchy:
                    hierarchy[superclass] = []
                hierarchy[superclass].append(subclass)
        
        return hierarchy
    
    def add_instance_to_graph(self, class_name: str, instance_id: int, properties: Dict[str, Any]):
        instance_uri = NUTRITION_NS[f"{class_name}_{instance_id}"]
        class_uri = NUTRITION_NS[class_name]
        
        self.graph.add((instance_uri, RDF.type, class_uri))
        self.graph.add((instance_uri, RDF.type, OWL.NamedIndividual))
        
        for prop_name, value in properties.items():
            if value is not None:
                prop_uri = NUTRITION_NS[prop_name]
                if isinstance(value, (str, int, float)):
                    from rdflib import Literal
                    self.graph.add((instance_uri, prop_uri, Literal(value)))
                else:
                    self.graph.add((instance_uri, prop_uri, NUTRITION_NS[str(value)]))
        
        return instance_uri

ontology_loader = OntologyLoader()
