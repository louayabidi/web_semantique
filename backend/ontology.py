from rdflib import Graph, Namespace, RDF, RDFS, OWL, Literal, URIRef
from rdflib.namespace import XSD

class NutritionOntology:
    def __init__(self):
        self.g = Graph()
        self.ns = Namespace("http://www.nutrition-wellness.org/ontology#")
        self.g.bind("nutrition", self.ns)
        self.g.bind("owl", OWL)
        self.g.bind("rdf", RDF)
        self.g.bind("rdfs", RDFS)

        self._create_ontology()

    def _create_ontology(self):
        self.g.add((self.ns.Personne, RDF.type, OWL.Class))
        self.g.add((self.ns.Personne, RDFS.label, Literal("Personne", lang="fr")))

        self.g.add((self.ns.Aliment, RDF.type, OWL.Class))
        self.g.add((self.ns.Aliment, RDFS.label, Literal("Aliment", lang="fr")))

        self.g.add((self.ns.Nutriment, RDF.type, OWL.Class))
        self.g.add((self.ns.Nutriment, RDFS.label, Literal("Nutriment", lang="fr")))

        self.g.add((self.ns.Repas, RDF.type, OWL.Class))
        self.g.add((self.ns.Repas, RDFS.label, Literal("Repas", lang="fr")))

        self.g.add((self.ns.RegimeAlimentaire, RDF.type, OWL.Class))
        self.g.add((self.ns.RegimeAlimentaire, RDFS.label, Literal("Régime Alimentaire", lang="fr")))

        self.g.add((self.ns.ActivitePhysique, RDF.type, OWL.Class))
        self.g.add((self.ns.ActivitePhysique, RDFS.label, Literal("Activité Physique", lang="fr")))

        self.g.add((self.ns.ProgrammeBienEtre, RDF.type, OWL.Class))
        self.g.add((self.ns.ProgrammeBienEtre, RDFS.label, Literal("Programme Bien-Être", lang="fr")))

        self.g.add((self.ns.Sommeil, RDF.type, OWL.Class))
        self.g.add((self.ns.Sommeil, RDFS.label, Literal("Sommeil", lang="fr")))

        self.g.add((self.ns.Hydratation, RDF.type, OWL.Class))
        self.g.add((self.ns.Hydratation, RDFS.label, Literal("Hydratation", lang="fr")))

        self.g.add((self.ns.EtatDeSante, RDF.type, OWL.Class))
        self.g.add((self.ns.EtatDeSante, RDFS.label, Literal("État de Santé", lang="fr")))

        self.g.add((self.ns.Objectif, RDF.type, OWL.Class))
        self.g.add((self.ns.Objectif, RDFS.label, Literal("Objectif", lang="fr")))

        self.g.add((self.ns.ProfessionnelDeSante, RDF.type, OWL.Class))
        self.g.add((self.ns.ProfessionnelDeSante, RDFS.label, Literal("Professionnel de Santé", lang="fr")))

        self._create_object_properties()
        self._create_data_properties()

    def _create_object_properties(self):
        self.g.add((self.ns.aEtatDeSante, RDF.type, OWL.ObjectProperty))
        self.g.add((self.ns.aEtatDeSante, RDFS.domain, self.ns.Personne))
        self.g.add((self.ns.aEtatDeSante, RDFS.range, self.ns.EtatDeSante))

        self.g.add((self.ns.aObjectif, RDF.type, OWL.ObjectProperty))
        self.g.add((self.ns.aObjectif, RDFS.domain, self.ns.Personne))
        self.g.add((self.ns.aObjectif, RDFS.range, self.ns.Objectif))

        self.g.add((self.ns.consomme, RDF.type, OWL.ObjectProperty))
        self.g.add((self.ns.consomme, RDFS.domain, self.ns.Personne))
        self.g.add((self.ns.consomme, RDFS.range, self.ns.Aliment))

        self.g.add((self.ns.contient, RDF.type, OWL.ObjectProperty))
        self.g.add((self.ns.contient, RDFS.domain, self.ns.Aliment))
        self.g.add((self.ns.contient, RDFS.range, self.ns.Nutriment))

        self.g.add((self.ns.pratique, RDF.type, OWL.ObjectProperty))
        self.g.add((self.ns.pratique, RDFS.domain, self.ns.Personne))
        self.g.add((self.ns.pratique, RDFS.range, self.ns.ActivitePhysique))

        self.g.add((self.ns.suit, RDF.type, OWL.ObjectProperty))
        self.g.add((self.ns.suit, RDFS.domain, self.ns.Personne))
        self.g.add((self.ns.suit, RDFS.range, self.ns.RegimeAlimentaire))

    def _create_data_properties(self):
        self.g.add((self.ns.nom, RDF.type, OWL.DatatypeProperty))
        self.g.add((self.ns.nom, RDFS.range, XSD.string))

        self.g.add((self.ns.age, RDF.type, OWL.DatatypeProperty))
        self.g.add((self.ns.age, RDFS.domain, self.ns.Personne))
        self.g.add((self.ns.age, RDFS.range, XSD.integer))

        self.g.add((self.ns.poids, RDF.type, OWL.DatatypeProperty))
        self.g.add((self.ns.poids, RDFS.domain, self.ns.Personne))
        self.g.add((self.ns.poids, RDFS.range, XSD.decimal))

        self.g.add((self.ns.taille, RDF.type, OWL.DatatypeProperty))
        self.g.add((self.ns.taille, RDFS.domain, self.ns.Personne))
        self.g.add((self.ns.taille, RDFS.range, XSD.decimal))

        self.g.add((self.ns.calories, RDF.type, OWL.DatatypeProperty))
        self.g.add((self.ns.calories, RDFS.domain, self.ns.Aliment))
        self.g.add((self.ns.calories, RDFS.range, XSD.decimal))

        self.g.add((self.ns.proteines, RDF.type, OWL.DatatypeProperty))
        self.g.add((self.ns.proteines, RDFS.range, XSD.decimal))

        self.g.add((self.ns.glucides, RDF.type, OWL.DatatypeProperty))
        self.g.add((self.ns.glucides, RDFS.range, XSD.decimal))

        self.g.add((self.ns.lipides, RDF.type, OWL.DatatypeProperty))
        self.g.add((self.ns.lipides, RDFS.range, XSD.decimal))

    def add_person_instance(self, person_data):
        person_uri = self.ns[f"Personne_{person_data['id']}"]
        self.g.add((person_uri, RDF.type, self.ns.Personne))
        self.g.add((person_uri, self.ns.nom, Literal(person_data['nom'])))
        self.g.add((person_uri, self.ns.age, Literal(person_data.get('age', 0), datatype=XSD.integer)))
        if person_data.get('poids'):
            self.g.add((person_uri, self.ns.poids, Literal(person_data['poids'], datatype=XSD.decimal)))
        if person_data.get('taille'):
            self.g.add((person_uri, self.ns.taille, Literal(person_data['taille'], datatype=XSD.decimal)))

    def add_food_instance(self, food_data):
        food_uri = self.ns[f"Aliment_{food_data['id']}"]
        self.g.add((food_uri, RDF.type, self.ns.Aliment))
        self.g.add((food_uri, self.ns.nom, Literal(food_data['nom'])))
        self.g.add((food_uri, self.ns.calories, Literal(food_data.get('calories', 0), datatype=XSD.decimal)))
        self.g.add((food_uri, self.ns.proteines, Literal(food_data.get('proteines', 0), datatype=XSD.decimal)))
        self.g.add((food_uri, self.ns.glucides, Literal(food_data.get('glucides', 0), datatype=XSD.decimal)))
        self.g.add((food_uri, self.ns.lipides, Literal(food_data.get('lipides', 0), datatype=XSD.decimal)))

    def execute_sparql(self, query):
        return self.g.query(query)

    def serialize_ontology(self, format='turtle'):
        return self.g.serialize(format=format)

    def get_graph(self):
        return self.g
