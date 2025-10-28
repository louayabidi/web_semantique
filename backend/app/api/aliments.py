from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.nutrition import Aliment, Nutriment
from app.schemas.nutrition import AlimentCreate, AlimentResponse
from app.api.auth import get_current_user, require_admin
from app.models.user import User
from app.services.ontology_loader import ontology_loader

router = APIRouter(prefix="/aliments", tags=["aliments"])

@router.get("", response_model=List[AlimentResponse])
def get_aliments(
    skip: int = 0,
    limit: int = 100,
    groupe_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Aliment)
    
    if groupe_id:
        query = query.filter(Aliment.groupe_id == groupe_id)
    
    if search:
        query = query.filter(Aliment.nom.ilike(f"%{search}%"))
    
    aliments = query.offset(skip).limit(limit).all()
    return aliments

@router.get("/{aliment_id}", response_model=AlimentResponse)
def get_aliment(aliment_id: int, db: Session = Depends(get_db)):
    aliment = db.query(Aliment).filter(Aliment.id == aliment_id).first()
    if not aliment:
        raise HTTPException(status_code=404, detail="Aliment not found")
    return aliment

@router.post("", response_model=AlimentResponse)
def create_aliment(
    aliment: AlimentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    new_aliment = Aliment(
        nom=aliment.nom,
        calories=aliment.calories,
        index_glycemique=aliment.index_glycemique,
        indice_satiete=aliment.indice_satiete,
        score_nutritionnel=aliment.score_nutritionnel,
        description=aliment.description,
        image_url=aliment.image_url,
        groupe_id=aliment.groupe_id
    )
    
    if aliment.nutriment_ids:
        nutriments = db.query(Nutriment).filter(Nutriment.id.in_(aliment.nutriment_ids)).all()
        new_aliment.nutriments = nutriments
    
    db.add(new_aliment)
    db.commit()
    db.refresh(new_aliment)
    
    try:
        ontology_loader.load_ontology()
        properties = {
            "nom": aliment.nom,
            "Calories": aliment.calories
        }
        ontology_loader.add_instance_to_graph("Aliment", new_aliment.id, properties)
    except Exception as e:
        print(f"Warning: Could not add to ontology: {e}")
    
    return new_aliment

@router.put("/{aliment_id}", response_model=AlimentResponse)
def update_aliment(
    aliment_id: int,
    aliment: AlimentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    db_aliment = db.query(Aliment).filter(Aliment.id == aliment_id).first()
    if not db_aliment:
        raise HTTPException(status_code=404, detail="Aliment not found")
    
    for key, value in aliment.model_dump(exclude={"nutriment_ids"}).items():
        setattr(db_aliment, key, value)
    
    if aliment.nutriment_ids:
        nutriments = db.query(Nutriment).filter(Nutriment.id.in_(aliment.nutriment_ids)).all()
        db_aliment.nutriments = nutriments
    
    db.commit()
    db.refresh(db_aliment)
    
    return db_aliment

@router.delete("/{aliment_id}")
def delete_aliment(
    aliment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    aliment = db.query(Aliment).filter(Aliment.id == aliment_id).first()
    if not aliment:
        raise HTTPException(status_code=404, detail="Aliment not found")
    
    db.delete(aliment)
    db.commit()
    
    return {"message": "Aliment deleted successfully"}
