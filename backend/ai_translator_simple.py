class SimpleQueryTranslator:
    """
    Traducteur simplifié des questions utilisateurs vers des requêtes SPARQL
    Basé sur détection de mots-clés et contexte nutritionnel.
    """

    def question_to_sparql(self, question):
        question_lower = question.lower().strip()

        # ==================== CONDITIONS MÉDICALES ====================
        if any(k in question_lower for k in ["diabète type 1", "diabete type 1"]):
            return self._get_sparql_for_condition("DiabèteType1")
        elif any(k in question_lower for k in ["diabète type 2", "diabete type 2", "diabète", "diabetique"]):
            return self._get_sparql_for_condition("DiabèteType2")
        elif any(k in question_lower for k in ["hypertension", "tension", "haute pression"]):
            return self._get_sparql_for_condition("HypertensionArtérielle")
        elif any(k in question_lower for k in ["cholestérol", "cholesterol", "lipide élevé"]):
            return self._get_sparql_for_condition("Hypercholestérolémie")
        elif any(k in question_lower for k in ["obésité sévère", "obesite severe"]):
            return self._get_sparql_for_condition("ObésitéSévère")
        elif any(k in question_lower for k in ["obésité modérée", "obesite moderee"]):
            return self._get_sparql_for_condition("ObésitéModérée")
        elif any(k in question_lower for k in ["obésité", "obesite", "surpoids"]):
            return self._get_sparql_for_condition("ObésitéLégère")
        elif any(k in question_lower for k in ["grossesse", "enceinte"]):
            if any(k in question_lower for k in ["3eme", "3ème", "troisième"]):
                return self._get_sparql_for_condition("GrossesseTrimestre3")
            elif any(k in question_lower for k in ["2eme", "2ème", "deuxième"]):
                return self._get_sparql_for_condition("GrossesseTrimestre2")
            else:
                return self._get_sparql_for_condition("GrossesseTrimestre1")
        elif any(k in question_lower for k in ["maladie cardiaque", "cœur", "coeur"]):
            return self._get_sparql_for_condition("SantéCardiaque")
        elif any(k in question_lower for k in ["arthrite", "inflammation", "anti-inflammatoire"]):
            return self._get_sparql_for_condition("AntiInflammatoire")

        # ==================== ALLERGIES ====================
        elif any(k in question_lower for k in ["sans gluten", "intolérant gluten"]):
            return self._get_sparql_for_allergy("SansGluten")
        elif any(k in question_lower for k in ["sans lactose", "intolérant lactose"]):
            return self._get_sparql_for_allergy("SansLactose")
        elif any(k in question_lower for k in ["arachide", "cacahuète"]):
            return self._get_sparql_for_allergy("AllergieArachides")
        elif "gluten" in question_lower and "allerg" in question_lower:
            return self._get_sparql_for_allergy("AllergieGluten")
        elif "lait" in question_lower and "allerg" in question_lower:
            return self._get_sparql_for_allergy("AllergieLait")
        elif "soja" in question_lower and "allerg" in question_lower:
            return self._get_sparql_for_allergy("AllergieSoja")
        elif any(k in question_lower for k in ["œuf", "oeuf"]) and "allerg" in question_lower:
            return self._get_sparql_for_allergy("AllergieOeufs")
        elif any(k in question_lower for k in ["fruit de mer", "fruits de mer", "crevette", "moule"]) and "allerg" in question_lower:
            return self._get_sparql_for_allergy("AllergieFruitsDeMer")
        elif "noix" in question_lower and "allerg" in question_lower:
            return self._get_sparql_for_allergy("AllergieNoix")

        # ==================== RÉGIMES ALIMENTAIRES ====================
        elif any(k in question_lower for k in ["végétarien", "vegetarien"]):
            return self._get_sparql_for_preference("Végétarien")
        elif any(k in question_lower for k in ["végétalien", "vegan", "végane"]):
            return self._get_sparql_for_preference("Végétalien")
        elif "méditerranéen" in question_lower:
            return self._get_sparql_for_preference("RégimeMéditerranéen")
        elif "keto" in question_lower or "cétogène" in question_lower:
            return self._get_sparql_for_preference("RégimeCétogène")
        elif "paléo" in question_lower or "paleo" in question_lower:
            return self._get_sparql_for_preference("RégimePaléo")

        # ==================== CARACTÉRISTIQUES NUTRITIONNELLES ====================
        elif any(k in question_lower for k in ["riche en fibres", "fibres"]):
            return self._get_sparql_for_fibers()
        elif "index glycémique" in question_lower:
            if any(k in question_lower for k in ["élevé", "haut", "eleve"]):
                return self._get_sparql_for_high_glycemic_index()
            elif any(k in question_lower for k in ["bas", "faible"]):
                return self._get_sparql_for_low_glycemic_index()
            else:
                return self._get_sparql_for_glycemic_index()
        elif "calories" in question_lower or "calorique" in question_lower:
            if any(k in question_lower for k in ["faible", "léger", "light", "bas"]):
                return self._get_sparql_for_low_calories()
            elif any(k in question_lower for k in ["élevé", "beaucoup", "riche", "fort"]):
                return self._get_sparql_for_high_calories()
            else:
                return self._get_sparql_for_calories()

        # ==================== GROUPES ALIMENTAIRES ====================
        elif "fruit" in question_lower:
            return self._get_sparql_for_food_group("Fruits")
        elif "légume" in question_lower or "legume" in question_lower:
            return self._get_sparql_for_food_group("Légumes")
        elif "protéine" in question_lower or "proteine" in question_lower:
            return self._get_sparql_for_food_group("Protéines")
        elif "céréale" in question_lower or "cereale" in question_lower:
            return self._get_sparql_for_food_group("Céréales")
        elif "produit laitier" in question_lower or "laitier" in question_lower:
            return self._get_sparql_for_food_group("ProduitsLaitiers")

        # ==================== NUTRIMENTS ====================
        elif "vitamine c" in question_lower:
            return self._get_sparql_for_nutrient("VitamineC")
        elif "vitamine d" in question_lower:
            return self._get_sparql_for_nutrient("VitamineD")
        elif "vitamine b" in question_lower:
            return self._get_sparql_for_nutrient("VitamineB")
        elif "calcium" in question_lower:
            return self._get_sparql_for_nutrient("Calcium")
        elif "fer" in question_lower:
            return self._get_sparql_for_nutrient("Fer")
        elif "zinc" in question_lower:
            return self._get_sparql_for_nutrient("Zinc")
        elif "magnésium" in question_lower or "magnesium" in question_lower:
            return self._get_sparql_for_nutrient("Magnésium")
        elif "oméga" in question_lower or "omega" in question_lower:
            return self._get_sparql_for_nutrient("Oméga3")
        elif "antioxydant" in question_lower:
            return self._get_sparql_for_nutrient("Antioxydants")

        # ==================== OBJECTIFS / BIEN-ÊTRE ====================
        elif any(k in question_lower for k in ["perdre du poids", "maigrir", "régime minceur"]):
            return self._get_sparql_for_objective("PerdrePoids")
        elif any(k in question_lower for k in ["prendre du muscle", "masse musculaire", "musculation"]):
            return self._get_sparql_for_objective("GagnerMasseMusculaire")
        elif any(k in question_lower for k in ["énergie", "fatigue", "vitalité", "energie"]):
            return self._get_sparql_for_objective("AugmenterÉnergie")
        elif any(k in question_lower for k in ["digestion", "intestin", "ballonnement"]):
            return self._get_sparql_for_objective("AméliorerDigestion")
        elif any(k in question_lower for k in ["sommeil", "dormir", "insomnie"]):
            return self._get_sparql_for_objective("AméliorerSommeil")
        elif any(k in question_lower for k in ["stress", "anxiété", "calme"]):
            return self._get_sparql_for_objective("RéduireStress")
        elif any(k in question_lower for k in ["peau", "acné", "dermatite"]):
            return self._get_sparql_for_objective("AméliorerPeau")
        elif any(k in question_lower for k in ["os", "articulation"]):
            return self._get_sparql_for_objective("RenforcerOs")
        elif any(k in question_lower for k in ["mémoire", "cerveau", "concentration"]):
            return self._get_sparql_for_objective("AméliorerMémoire")

        # ==================== CAS PAR DÉFAUT ====================
        else:
            return self._default_query(question)

    # === Méthodes SPARQL (inchangées ou légèrement améliorées) ===
    def _get_sparql_for_condition(self, condition):
        return f"""
        PREFIX nutrition: <http://www.semanticweb.org/user/ontologies/2025/8/nutrition#>
        SELECT ?aliment ?nom ?calories ?indexGlycémique
        WHERE {{
            ?aliment a nutrition:Aliment ;
                     nutrition:nom ?nom ;
                     nutrition:estRecommandéPour nutrition:{condition} .
            OPTIONAL {{ ?aliment nutrition:Calories ?calories }}
            OPTIONAL {{ ?aliment nutrition:indexGlycémique ?indexGlycémique }}
        }}
        ORDER BY ?nom
        """

    def _get_sparql_for_allergy(self, allergy):
        return f"""
        PREFIX nutrition: <http://www.semanticweb.org/user/ontologies/2025/8/nutrition#>
        SELECT ?aliment ?nom ?calories
        WHERE {{
            ?aliment a nutrition:Aliment ;
                     nutrition:nom ?nom ;
                     nutrition:convientÀ nutrition:{allergy} .
            OPTIONAL {{ ?aliment nutrition:Calories ?calories }}
        }}
        ORDER BY ?nom
        """

    def _get_sparql_for_preference(self, preference):
        return f"""
        PREFIX nutrition: <http://www.semanticweb.org/user/ontologies/2025/8/nutrition#>
        SELECT ?aliment ?nom ?calories
        WHERE {{
            ?aliment nutrition:convientÀ nutrition:{preference} ;
                     nutrition:nom ?nom .
            OPTIONAL {{ ?aliment nutrition:Calories ?calories }}
        }}
        ORDER BY ?nom
        """

    def _get_sparql_for_fibers(self):
        return """
        PREFIX nutrition: <http://www.semanticweb.org/user/ontologies/2025/8/nutrition#>
        SELECT ?aliment ?nom ?calories
        WHERE {
            ?aliment a nutrition:AlimentRicheEnFibres ;
                     nutrition:nom ?nom .
            OPTIONAL { ?aliment nutrition:Calories ?calories }
        }
        ORDER BY ?nom
        """

    def _get_sparql_for_glycemic_index(self):
        return """
        PREFIX nutrition: <http://www.semanticweb.org/user/ontologies/2025/8/nutrition#>
        SELECT ?aliment ?nom ?indexGlycémique
        WHERE {
            ?aliment a nutrition:Aliment ;
                     nutrition:nom ?nom ;
                     nutrition:indexGlycémique ?indexGlycémique .
        }
        ORDER BY ?indexGlycémique
        """

    def _get_sparql_for_high_glycemic_index(self):
        return """
        PREFIX nutrition: <http://www.semanticweb.org/user/ontologies/2025/8/nutrition#>
        SELECT ?aliment ?nom ?indexGlycémique
        WHERE {
            ?aliment a nutrition:Aliment ;
                     nutrition:nom ?nom ;
                     nutrition:indexGlycémique ?indexGlycémique .
            FILTER(?indexGlycémique > 70)
        }
        ORDER BY DESC(?indexGlycémique)
        """

    def _get_sparql_for_low_glycemic_index(self):
        return """
        PREFIX nutrition: <http://www.semanticweb.org/user/ontologies/2025/8/nutrition#>
        SELECT ?aliment ?nom ?indexGlycémique
        WHERE {
            ?aliment a nutrition:Aliment ;
                     nutrition:nom ?nom ;
                     nutrition:indexGlycémique ?indexGlycémique .
            FILTER(?indexGlycémique < 55)
        }
        ORDER BY ?indexGlycémique
        """

    def _get_sparql_for_calories(self):
        return """
        PREFIX nutrition: <http://www.semanticweb.org/user/ontologies/2025/8/nutrition#>
        SELECT ?aliment ?nom ?calories
        WHERE {
            ?aliment a nutrition:Aliment ;
                     nutrition:nom ?nom ;
                     nutrition:Calories ?calories .
        }
        ORDER BY ?calories
        """

    def _get_sparql_for_low_calories(self):
        return """
        PREFIX nutrition: <http://www.semanticweb.org/user/ontologies/2025/8/nutrition#>
        SELECT ?aliment ?nom ?calories
        WHERE {
            ?aliment a nutrition:Aliment ;
                     nutrition:nom ?nom ;
                     nutrition:Calories ?calories .
            FILTER(?calories < 150)
        }
        ORDER BY ?calories
        """

    def _get_sparql_for_high_calories(self):
        return """
        PREFIX nutrition: <http://www.semanticweb.org/user/ontologies/2025/8/nutrition#>
        SELECT ?aliment ?nom ?calories
        WHERE {
            ?aliment a nutrition:Aliment ;
                     nutrition:nom ?nom ;
                     nutrition:Calories ?calories .
            FILTER(?calories > 250)
        }
        ORDER BY DESC(?calories)
        """

    def _get_sparql_for_food_group(self, group):
        return f"""
        PREFIX nutrition: <http://www.semanticweb.org/user/ontologies/2025/8/nutrition#>
        SELECT ?aliment ?nom ?calories
        WHERE {{
            ?aliment nutrition:appartientÀGroupe nutrition:{group} ;
                     nutrition:nom ?nom .
            OPTIONAL {{ ?aliment nutrition:Calories ?calories }}
        }}
        ORDER BY ?nom
        """

    def _get_sparql_for_nutrient(self, nutrient):
        return f"""
        PREFIX nutrition: <http://www.semanticweb.org/user/ontologies/2025/8/nutrition#>
        SELECT ?aliment ?nom ?calories
        WHERE {{
            ?aliment nutrition:contient nutrition:{nutrient} ;
                     nutrition:nom ?nom .
            OPTIONAL {{ ?aliment nutrition:Calories ?calories }}
        }}
        ORDER BY ?nom
        """

    def _get_sparql_for_objective(self, objective):
        return f"""
        PREFIX nutrition: <http://www.semanticweb.org/user/ontologies/2025/8/nutrition#>
        SELECT ?programme ?nom ?description
        WHERE {{
            ?programme nutrition:Vise nutrition:{objective} ;
                       nutrition:nom ?nom .
            OPTIONAL {{ ?programme nutrition:description ?description }}
        }}
        ORDER BY ?nom
        """

    def _default_query(self, question):
        return f"""
        PREFIX nutrition: <http://www.semanticweb.org/user/ontologies/2025/8/nutrition#>
        SELECT ?subject ?nom ?type
        WHERE {{
            ?subject a ?type ;
                     nutrition:nom ?nom .
            FILTER(CONTAINS(LCASE(?nom), LCASE("{question}")))
        }}
        LIMIT 10
        """
