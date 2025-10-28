from pydantic import BaseModel
from typing import List, Optional

class GroupeAlimentaireBase(BaseModel):
    nom: str
    description: Optional[str] = None

class GroupeAlimentaireCreate(GroupeAlimentaireBase):
    pass

class GroupeAlimentaireResponse(GroupeAlimentaireBase):
    id: int
    
    class Config:
        from_attributes = True

class NutrimentBase(BaseModel):
    nom: str
    type: Optional[str] = None
    dose_recommandee: Optional[float] = None
    unite_dose: Optional[str] = None

class NutrimentCreate(NutrimentBase):
    pass

class NutrimentResponse(NutrimentBase):
    id: int
    
    class Config:
        from_attributes = True

class AlimentBase(BaseModel):
    nom: str
    calories: Optional[int] = None
    index_glycemique: Optional[int] = None
    indice_satiete: Optional[float] = None
    score_nutritionnel: Optional[float] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    groupe_id: Optional[int] = None

class AlimentCreate(AlimentBase):
    nutriment_ids: List[int] = []

class AlimentResponse(AlimentBase):
    id: int
    groupe: Optional[GroupeAlimentaireResponse] = None
    nutriments: List[NutrimentResponse] = []
    
    class Config:
        from_attributes = True

class RecetteBase(BaseModel):
    nom: str
    description: Optional[str] = None
    instructions: Optional[str] = None
    temps_preparation: Optional[int] = None
    niveau_difficulte: Optional[str] = None
    calories_totales: Optional[int] = None
    image_url: Optional[str] = None

class RecetteCreate(RecetteBase):
    aliment_ids: List[int] = []

class RecetteResponse(RecetteBase):
    id: int
    aliments: List[AlimentResponse] = []
    
    class Config:
        from_attributes = True

class AllergieBase(BaseModel):
    nom: str
    type_allergie: Optional[str] = None
    description: Optional[str] = None

class AllergieCreate(AllergieBase):
    pass

class AllergieResponse(AllergieBase):
    id: int
    
    class Config:
        from_attributes = True

class ObjectifBase(BaseModel):
    nom: str
    description: Optional[str] = None
    objectif_bien_etre: Optional[str] = None

class ObjectifCreate(ObjectifBase):
    pass

class ObjectifResponse(ObjectifBase):
    id: int
    
    class Config:
        from_attributes = True

class PersonneBase(BaseModel):
    nom: str
    age: Optional[int] = None
    genre: Optional[str] = None
    poids: Optional[float] = None
    taille: Optional[float] = None
    niveau_energie: Optional[int] = None
    niveau_stress: Optional[int] = None
    objectif_poids: Optional[str] = None

class PersonneCreate(PersonneBase):
    allergie_ids: List[int] = []

class PersonneResponse(PersonneBase):
    id: int
    allergies: List[AllergieResponse] = []
    
    class Config:
        from_attributes = True
