from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services.sparql_service import sparql_service

router = APIRouter(prefix="/semantic", tags=["semantic"])

class SPARQLQuery(BaseModel):
    query: str

class NLQuery(BaseModel):
    query: str

@router.post("/sparql")
def execute_sparql(sparql_query: SPARQLQuery) -> Dict[str, Any]:
    try:
        results = sparql_service.execute_sparql(sparql_query.query)
        return {
            "query": sparql_query.query,
            "results": results,
            "count": len(results)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/nl-search")
def natural_language_search(nl_query: NLQuery) -> Dict[str, Any]:
    try:
        result = sparql_service.natural_language_to_sparql(nl_query.query)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/ontology/classes")
def get_ontology_classes() -> Dict[str, List[str]]:
    from app.services.ontology_loader import ontology_loader
    try:
        ontology_loader.load_ontology()
        classes = ontology_loader.get_classes()
        hierarchy = ontology_loader.get_class_hierarchy()
        
        return {
            "classes": classes,
            "hierarchy": hierarchy,
            "count": len(classes)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ontology/properties")
def get_ontology_properties() -> Dict[str, List[str]]:
    from app.services.ontology_loader import ontology_loader
    try:
        ontology_loader.load_ontology()
        properties = ontology_loader.get_properties()
        
        return properties
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ontology/individuals")
def get_ontology_individuals() -> Dict[str, Any]:
    from app.services.ontology_loader import ontology_loader
    try:
        ontology_loader.load_ontology()
        individuals = ontology_loader.get_individuals()
        
        return {
            "individuals": individuals,
            "count": len(individuals)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
