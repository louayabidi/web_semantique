from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.nutrition import GroupeAlimentaire, Nutriment, Allergie, Objectif, Aliment, Recette
from app.core.security import get_password_hash

def init_database():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created successfully")
    
    db = SessionLocal()
    
    try:
        existing_admin = db.query(User).filter(User.username == "admin").first()
        if not existing_admin:
            admin_user = User(
                email="admin@nutrition.com",
                username="admin",
                hashed_password=get_password_hash("admin123"),
                is_admin=True,
                is_active=True
            )
            db.add(admin_user)
            print("✓ Admin user created (username: admin, password: admin123)")
        
        if db.query(GroupeAlimentaire).count() == 0:
            groupes = [
                GroupeAlimentaire(nom="Fruits", description="Fruits frais et secs"),
                GroupeAlimentaire(nom="Légumes", description="Légumes verts et racines"),
                GroupeAlimentaire(nom="Protéines", description="Viandes, poissons, œufs"),
                GroupeAlimentaire(nom="Céréales", description="Pains, pâtes, riz"),
                GroupeAlimentaire(nom="Produits laitiers", description="Lait, fromage, yaourt"),
            ]
            db.add_all(groupes)
            print("✓ Groupes alimentaires created")
        
        if db.query(Nutriment).count() == 0:
            nutriments = [
                Nutriment(nom="Protéine", type="Macronutriment", dose_recommandee=50.0, unite_dose="g"),
                Nutriment(nom="Glucide", type="Macronutriment", dose_recommandee=300.0, unite_dose="g"),
                Nutriment(nom="Lipide", type="Macronutriment", dose_recommandee=70.0, unite_dose="g"),
                Nutriment(nom="Vitamine C", type="Vitamine", dose_recommandee=80.0, unite_dose="mg"),
                Nutriment(nom="Vitamine D", type="Vitamine", dose_recommandee=15.0, unite_dose="µg"),
                Nutriment(nom="Calcium", type="Minéral", dose_recommandee=1000.0, unite_dose="mg"),
                Nutriment(nom="Fer", type="Minéral", dose_recommandee=14.0, unite_dose="mg"),
                Nutriment(nom="Fibres", type="Autre", dose_recommandee=25.0, unite_dose="g"),
            ]
            db.add_all(nutriments)
            print("✓ Nutriments created")
        
        if db.query(Allergie).count() == 0:
            allergies = [
                Allergie(nom="Gluten", type_allergie="Céréales", description="Intolérance au gluten"),
                Allergie(nom="Lactose", type_allergie="Produits laitiers", description="Intolérance au lactose"),
                Allergie(nom="Arachides", type_allergie="Fruits à coque", description="Allergie aux arachides"),
                Allergie(nom="Fruits de mer", type_allergie="Crustacés", description="Allergie aux fruits de mer"),
                Allergie(nom="Œufs", type_allergie="Protéines", description="Allergie aux œufs"),
            ]
            db.add_all(allergies)
            print("✓ Allergies created")
        
        if db.query(Objectif).count() == 0:
            objectifs = [
                Objectif(nom="Perte de poids", description="Réduction calorique contrôlée", objectif_bien_etre="Perdre 5-10kg"),
                Objectif(nom="Gain de masse musculaire", description="Augmentation des protéines", objectif_bien_etre="Gagner de la masse"),
                Objectif(nom="Améliorer l'énergie", description="Optimiser les glucides", objectif_bien_etre="Plus d'énergie"),
                Objectif(nom="Santé cardiovasculaire", description="Réduire les lipides saturés", objectif_bien_etre="Cœur en santé"),
            ]
            db.add_all(objectifs)
            print("✓ Objectifs created")
        
        db.commit()
        print("\n✓ Database initialized successfully!")
        print("=" * 50)
        print("Admin credentials:")
        print("  Username: admin")
        print("  Password: admin123")
        print("=" * 50)
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
