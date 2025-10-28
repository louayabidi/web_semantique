class SimpleQueryTranslator:
    def question_to_sparql(self, question):
        question_lower = question.lower()
        
        if "diabète" in question_lower or "diabétique" in question_lower:
            return self._get_sparql_for_condition("DiabèteType2")
        elif "hypertension" in question_lower:
            return self._get_sparql_for_condition("HypertensionArtérielle")
        else:
            return self._default_query(question)
    
    def _get_sparql_for_condition(self, condition):
        return f"""
        PREFIX nutrition: <http://www.semanticweb.org/user/ontologies/2025/8/nutrition#>
        SELECT ?aliment ?nom ?calories
        WHERE {{
            ?aliment a nutrition:Aliment .
            ?aliment nutrition:nom ?nom .
            ?aliment nutrition:estRecommandéPour nutrition:{condition} .
            OPTIONAL {{ ?aliment nutrition:Calories ?calories }} .
        }}
        """
    
    def _default_query(self, question):
        return f"""
        PREFIX nutrition: <http://www.semanticweb.org/user/ontologies/2025/8/nutrition#>
        SELECT ?subject ?nom ?type
        WHERE {{
            ?subject a ?type .
            ?subject nutrition:nom ?nom .
            FILTER(CONTAINS(LCASE(?nom), LCASE("{question}")))
        }}
        LIMIT 10
        """