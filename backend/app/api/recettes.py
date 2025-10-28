from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.nutrition import Recette, Aliment
from app.schemas.nutrition import RecetteCreate, RecetteResponse
from app.api.auth import get_current_user, require_admin
from app.models.user import User

router = APIRouter(prefix="/recettes", tags=["recettes"])

@router.get("", response_model=List[RecetteResponse])
def get_recettes(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Recette)
    
    if search:
        query = query.filter(Recette.nom.ilike(f"%{search}%"))
    
    recettes = query.offset(skip).limit(limit).all()
    return recettes

@router.get("/{recette_id}", response_model=RecetteResponse)
def get_recette(recette_id: int, db: Session = Depends(get_db)):
    recette = db.query(Recette).filter(Recette.id == recette_id).first()
    if not recette:
        raise HTTPException(status_code=404, detail="Recette not found")
    return recette

@router.post("", response_model=RecetteResponse)
def create_recette(
    recette: RecetteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    new_recette = Recette(
        nom=recette.nom,
        description=recette.description,
        instructions=recette.instructions,
        temps_preparation=recette.temps_preparation,
        niveau_difficulte=recette.niveau_difficulte,
        calories_totales=recette.calories_totales,
        image_url=recette.image_url
    )
    
    if recette.aliment_ids:
        aliments = db.query(Aliment).filter(Aliment.id.in_(recette.aliment_ids)).all()
        new_recette.aliments = aliments
    
    db.add(new_recette)
    db.commit()
    db.refresh(new_recette)
    
    return new_recette

@router.put("/{recette_id}", response_model=RecetteResponse)
def update_recette(
    recette_id: int,
    recette: RecetteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    db_recette = db.query(Recette).filter(Recette.id == recette_id).first()
    if not db_recette:
        raise HTTPException(status_code=404, detail="Recette not found")
    
    for key, value in recette.model_dump(exclude={"aliment_ids"}).items():
        setattr(db_recette, key, value)
    
    if recette.aliment_ids:
        aliments = db.query(Aliment).filter(Aliment.id.in_(recette.aliment_ids)).all()
        db_recette.aliments = aliments
    
    db.commit()
    db.refresh(db_recette)
    
    return db_recette

@router.delete("/{recette_id}")
def delete_recette(
    recette_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    recette = db.query(Recette).filter(Recette.id == recette_id).first()
    if not recette:
        raise HTTPException(status_code=404, detail="Recette not found")
    
    db.delete(recette)
    db.commit()
    
    return {"message": "Recette deleted successfully"}
