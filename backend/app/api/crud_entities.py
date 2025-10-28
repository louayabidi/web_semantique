from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.nutrition import Nutriment, GroupeAlimentaire, Allergie, Objectif
from app.schemas.nutrition import (
    NutrimentCreate, NutrimentResponse,
    GroupeAlimentaireCreate, GroupeAlimentaireResponse,
    AllergieCreate, AllergieResponse,
    ObjectifCreate, ObjectifResponse
)
from app.api.auth import require_admin, get_current_user
from app.models.user import User

router = APIRouter(tags=["entities"])

@router.get("/nutriments", response_model=List[NutrimentResponse])
def get_nutriments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Nutriment).offset(skip).limit(limit).all()

@router.post("/nutriments", response_model=NutrimentResponse)
def create_nutriment(
    nutriment: NutrimentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    new_nutriment = Nutriment(**nutriment.model_dump())
    db.add(new_nutriment)
    db.commit()
    db.refresh(new_nutriment)
    return new_nutriment

@router.get("/groupes-alimentaires", response_model=List[GroupeAlimentaireResponse])
def get_groupes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(GroupeAlimentaire).offset(skip).limit(limit).all()

@router.post("/groupes-alimentaires", response_model=GroupeAlimentaireResponse)
def create_groupe(
    groupe: GroupeAlimentaireCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    new_groupe = GroupeAlimentaire(**groupe.model_dump())
    db.add(new_groupe)
    db.commit()
    db.refresh(new_groupe)
    return new_groupe

@router.get("/allergies", response_model=List[AllergieResponse])
def get_allergies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Allergie).offset(skip).limit(limit).all()

@router.post("/allergies", response_model=AllergieResponse)
def create_allergie(
    allergie: AllergieCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    new_allergie = Allergie(**allergie.model_dump())
    db.add(new_allergie)
    db.commit()
    db.refresh(new_allergie)
    return new_allergie

@router.get("/objectifs", response_model=List[ObjectifResponse])
def get_objectifs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Objectif).offset(skip).limit(limit).all()

@router.post("/objectifs", response_model=ObjectifResponse)
def create_objectif(
    objectif: ObjectifCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    new_objectif = Objectif(**objectif.model_dump())
    db.add(new_objectif)
    db.commit()
    db.refresh(new_objectif)
    return new_objectif
