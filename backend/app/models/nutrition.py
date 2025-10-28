from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.core.database import Base

aliment_nutriment = Table('aliment_nutriment', Base.metadata,
    Column('aliment_id', Integer, ForeignKey('aliments.id')),
    Column('nutriment_id', Integer, ForeignKey('nutriments.id'))
)

recette_aliment = Table('recette_aliment', Base.metadata,
    Column('recette_id', Integer, ForeignKey('recettes.id')),
    Column('aliment_id', Integer, ForeignKey('aliments.id'))
)

personne_allergie = Table('personne_allergie', Base.metadata,
    Column('personne_id', Integer, ForeignKey('personnes.id')),
    Column('allergie_id', Integer, ForeignKey('allergies.id'))
)

class GroupeAlimentaire(Base):
    __tablename__ = "groupes_alimentaires"
    
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, unique=True, nullable=False, index=True)
    description = Column(Text)
    
    aliments = relationship("Aliment", back_populates="groupe")

class Nutriment(Base):
    __tablename__ = "nutriments"
    
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, unique=True, nullable=False, index=True)
    type = Column(String)
    dose_recommandee = Column(Float)
    unite_dose = Column(String)
    
    aliments = relationship("Aliment", secondary=aliment_nutriment, back_populates="nutriments")

class Aliment(Base):
    __tablename__ = "aliments"
    
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False, index=True)
    calories = Column(Integer)
    index_glycemique = Column(Integer)
    indice_satiete = Column(Float)
    score_nutritionnel = Column(Float)
    description = Column(Text)
    image_url = Column(String)
    groupe_id = Column(Integer, ForeignKey('groupes_alimentaires.id'))
    
    groupe = relationship("GroupeAlimentaire", back_populates="aliments")
    nutriments = relationship("Nutriment", secondary=aliment_nutriment, back_populates="aliments")
    recettes = relationship("Recette", secondary=recette_aliment, back_populates="aliments")

class Recette(Base):
    __tablename__ = "recettes"
    
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False, index=True)
    description = Column(Text)
    instructions = Column(Text)
    temps_preparation = Column(Integer)
    niveau_difficulte = Column(String)
    calories_totales = Column(Integer)
    image_url = Column(String)
    
    aliments = relationship("Aliment", secondary=recette_aliment, back_populates="recettes")

class Allergie(Base):
    __tablename__ = "allergies"
    
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, unique=True, nullable=False, index=True)
    type_allergie = Column(String)
    description = Column(Text)
    
    personnes = relationship("Personne", secondary=personne_allergie, back_populates="allergies")

class Objectif(Base):
    __tablename__ = "objectifs"
    
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, unique=True, nullable=False, index=True)
    description = Column(Text)
    objectif_bien_etre = Column(String)

class Personne(Base):
    __tablename__ = "personnes"
    
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False)
    age = Column(Integer)
    genre = Column(String)
    poids = Column(Float)
    taille = Column(Float)
    niveau_energie = Column(Integer)
    niveau_stress = Column(Integer)
    objectif_poids = Column(String)
    user_id = Column(Integer, ForeignKey('users.id'))
    
    allergies = relationship("Allergie", secondary=personne_allergie, back_populates="personnes")
