import sys
import os
sys.path.append(os.path.dirname(__file__))

from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.nutrition import (
    Aliment, Recette, Nutriment, GroupeAlimentaire, 
    Allergie, Objectif
)
from app.core.security import get_password_hash

Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    if db.query(Aliment).count() > 0:
        print("Database already seeded!")
        sys.exit(0)
    
    if not db.query(User).filter(User.username == "admin").first():
        admin = User(
            username="admin",
            email="admin@nutrition.com",
            hashed_password=get_password_hash("admin123"),
            is_admin=True,
            is_active=True
        )
        db.add(admin)
    
    if not db.query(User).filter(User.username == "user").first():
        user = User(
            username="user",
            email="user@nutrition.com",
            hashed_password=get_password_hash("user123"),
            is_admin=False,
            is_active=True
        )
        db.add(user)
    
    db.commit()
    
    groupes_data = [
        ("Fruits", "Fruits frais et secs"),
        ("Légumes", "Légumes frais et cuits"),
        ("Protéines", "Viandes, poissons, œufs"),
        ("Produits laitiers", "Lait, fromages, yaourts"),
        ("Céréales", "Pain, pâtes, riz"),
        ("Matières grasses", "Huiles, beurre")
    ]
    for nom, desc in groupes_data:
        if not db.query(GroupeAlimentaire).filter(GroupeAlimentaire.nom == nom).first():
            db.add(GroupeAlimentaire(nom=nom, description=desc))
    db.commit()
    
    nutriments = [
        Nutriment(nom="Protéines", unite_dose="g", dose_recommandee=50.0),
        Nutriment(nom="Glucides", unite_dose="g", dose_recommandee=300.0),
        Nutriment(nom="Lipides", unite_dose="g", dose_recommandee=70.0),
        Nutriment(nom="Fibres", unite_dose="g", dose_recommandee=25.0),
        Nutriment(nom="Vitamine C", unite_dose="mg", dose_recommandee=90.0),
        Nutriment(nom="Calcium", unite_dose="mg", dose_recommandee=1000.0),
        Nutriment(nom="Fer", unite_dose="mg", dose_recommandee=18.0)
    ]
    for nutriment in nutriments:
        db.add(nutriment)
    db.commit()
    
    aliments = [
        Aliment(nom="Pomme", calories=52, description="Fruit riche en fibres", groupe_id=1),
        Aliment(nom="Banane", calories=89, description="Riche en potassium", groupe_id=1),
        Aliment(nom="Orange", calories=47, description="Riche en vitamine C", groupe_id=1),
        Aliment(nom="Carotte", calories=41, description="Riche en bêta-carotène", groupe_id=2),
        Aliment(nom="Brocoli", calories=34, description="Riche en vitamines", groupe_id=2),
        Aliment(nom="Épinards", calories=23, description="Riche en fer", groupe_id=2),
        Aliment(nom="Poulet", calories=165, description="Protéines maigres", groupe_id=3),
        Aliment(nom="Saumon", calories=208, description="Riche en oméga-3", groupe_id=3),
        Aliment(nom="Œufs", calories=155, description="Protéines complètes", groupe_id=3),
        Aliment(nom="Lait", calories=42, description="Riche en calcium", groupe_id=4),
        Aliment(nom="Yaourt", calories=59, description="Probiotiques", groupe_id=4),
        Aliment(nom="Fromage", calories=402, description="Riche en calcium", groupe_id=4),
        Aliment(nom="Pain complet", calories=247, description="Fibres et glucides", groupe_id=5),
        Aliment(nom="Riz brun", calories=111, description="Glucides complexes", groupe_id=5),
        Aliment(nom="Pâtes", calories=131, description="Source d'énergie", groupe_id=5),
        Aliment(nom="Huile d'olive", calories=884, description="Graisses saines", groupe_id=6),
        Aliment(nom="Avocat", calories=160, description="Graisses mono-insaturées", groupe_id=6)
    ]
    for aliment in aliments:
        db.add(aliment)
    db.commit()
    
    allergies = [
        Allergie(nom="Gluten", description="Intolérance au gluten"),
        Allergie(nom="Lactose", description="Intolérance au lactose"),
        Allergie(nom="Arachides", description="Allergie aux cacahuètes"),
        Allergie(nom="Fruits à coque", description="Noix, amandes, etc.")
    ]
    for allergie in allergies:
        db.add(allergie)
    db.commit()
    
    objectifs = [
        Objectif(nom="Perte de poids", description="Réduire la masse corporelle"),
        Objectif(nom="Prise de masse", description="Augmenter la masse musculaire"),
        Objectif(nom="Maintien", description="Maintenir le poids actuel"),
        Objectif(nom="Santé cardiovasculaire", description="Améliorer la santé du cœur")
    ]
    for objectif in objectifs:
        db.add(objectif)
    db.commit()
    
    recettes = [
        Recette(
            nom="Salade César",
            description="Salade classique avec poulet grillé",
            instructions="Mélanger laitue, poulet, parmesan, croûtons et sauce César"
        ),
        Recette(
            nom="Smoothie aux fruits",
            description="Boisson énergétique aux fruits",
            instructions="Mixer banane, fraises, yaourt et lait"
        ),
        Recette(
            nom="Saumon grillé",
            description="Pavé de saumon avec légumes",
            instructions="Griller le saumon, servir avec brocoli et riz"
        )
    ]
    for recette in recettes:
        db.add(recette)
    db.commit()
    
    print("✓ Database seeded successfully!")
    print(f"  - {db.query(GroupeAlimentaire).count()} groupes alimentaires")
    print(f"  - {db.query(Aliment).count()} aliments")
    print(f"  - {db.query(Nutriment).count()} nutriments")
    print(f"  - {db.query(Recette).count()} recettes")
    print(f"  - {db.query(Allergie).count()} allergies")
    print(f"  - {db.query(Objectif).count()} objectifs")
    print(f"  - {db.query(User).count()} users")
    
except Exception as e:
    print(f"Error seeding database: {e}")
    db.rollback()
finally:
    db.close()
