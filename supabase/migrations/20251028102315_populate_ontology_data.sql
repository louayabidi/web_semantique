/*
  # Insertion des données de l'ontologie
  
  ## Description
  Cette migration insère toutes les données de l'ontologie OWL dans la base de données :
  - Groupes alimentaires (2 entrées)
  - Aliments (10 entrées)
  - Nutriments (10 entrées)
  - Activités physiques (14 entrées)
  - Objectifs (10 entrées)
  - Conditions médicales (10 entrées)
  - Allergies (10 entrées)
  - Préférences alimentaires (3 entrées)
  - Programmes bien-être (10 entrées)
  - Recettes (2 entrées)
  - Relations entre les entités
*/

-- Groupes alimentaires
INSERT INTO groupes_alimentaires (nom, description) VALUES
('Fruits', 'Aliments riches en vitamines et fibres naturelles'),
('Légumes', 'Aliments végétaux riches en nutriments et faibles en calories')
ON CONFLICT (nom) DO NOTHING;

-- Aliments
INSERT INTO aliments (nom, calories, index_glycemique, riche_en_fibres, index_glycemique_eleve, description) VALUES
('Pomme', 52, 38, true, false, 'Fruit riche en fibres et vitamine C'),
('Banane', 89, 52, true, false, 'Fruit énergétique riche en potassium'),
('Poulet Grillé', 165, 0, false, false, 'Source de protéines maigres'),
('Saumon', 208, 0, false, false, 'Poisson riche en oméga-3'),
('Riz Complet', 111, 50, true, false, 'Glucides complexes et fibres'),
('Brocoli', 34, 15, true, false, 'Légume riche en vitamines et minéraux'),
('Oeuf', 155, 0, false, false, 'Protéines complètes et vitamines'),
('Lait', 42, 30, false, false, 'Source de calcium et protéines'),
('Pain Complet', 247, 74, true, false, 'Glucides complexes'),
('Amandes', 579, 15, true, false, 'Noix riches en bonnes graisses'),
('Soda', 140, 85, false, true, 'Boisson sucrée à éviter'),
('Pain Blanc', 265, 95, false, true, 'Glucides simples à index glycémique élevé'),
('Lentilles', 116, 32, true, false, 'Légumineuses riches en protéines et fibres'),
('Flocons Avoine', 389, 55, true, false, 'Céréales complètes riches en fibres')
ON CONFLICT (nom) DO NOTHING;

-- Nutriments
INSERT INTO nutriments (nom, type_nutriment, dose_recommandee, unite_dose, description) VALUES
('Vitamine C', 'Vitamine', 90.0, 'mg', 'Antioxydant, renforce le système immunitaire'),
('Calcium', 'Minéral', 1000.0, 'mg', 'Essentiel pour les os et les dents'),
('Fer', 'Minéral', 18.0, 'mg', 'Transport de l''oxygène dans le sang'),
('Protéine Whey', 'Protéine', 30.0, 'g', 'Protéine rapide pour la récupération musculaire'),
('Glucides Complexes', 'Glucide', 130.0, 'g', 'Énergie durable'),
('Oméga-3', 'Lipide', 1.6, 'g', 'Acides gras essentiels pour le cœur'),
('Vitamine D', 'Vitamine', 15.0, 'mcg', 'Absorption du calcium et santé osseuse'),
('Magnésium', 'Minéral', 400.0, 'mg', 'Fonction musculaire et nerveuse'),
('Fibres', 'Glucide', 25.0, 'g', 'Digestion et satiété'),
('Zinc', 'Minéral', 11.0, 'mg', 'Système immunitaire et cicatrisation')
ON CONFLICT (nom) DO NOTHING;

-- Activités physiques
INSERT INTO activites_physiques (nom, type_activite, duree_activite, niveau_difficulte, frequence_recommandee, calories_brulees, description) VALUES
('Course À Pied', 'Cardio', 30.0, 'Moyen', '3-4 fois/semaine', 300, 'Excellent pour le système cardiovasculaire'),
('Natation', 'Cardio', 45.0, 'Moyen', '2-3 fois/semaine', 400, 'Sport complet sans impact'),
('Vélo', 'Cardio', 60.0, 'Facile', '3-5 fois/semaine', 350, 'Bon pour les articulations'),
('Marche Rapide', 'Cardio', 30.0, 'Facile', 'Quotidien', 150, 'Accessible à tous'),
('Escalade', 'Fitness', 60.0, 'Difficile', '1-2 fois/semaine', 500, 'Force et endurance'),
('Aérobic', 'Fitness', 45.0, 'Moyen', '3 fois/semaine', 350, 'Cardio et coordination'),
('Zumba', 'Fitness', 45.0, 'Facile', '2-3 fois/semaine', 400, 'Danse fitness'),
('Pilates', 'Fitness', 50.0, 'Facile', '2-3 fois/semaine', 250, 'Renforcement musculaire doux'),
('Tai Chi', 'Yoga', 30.0, 'Facile', '3-4 fois/semaine', 150, 'Arts martiaux doux, équilibre'),
('Randonnée', 'Cardio', 120.0, 'Moyen', '1 fois/semaine', 450, 'Nature et endurance'),
('Course Cardio', 'Cardio', 30.0, 'Moyen', '3 fois/semaine', 320, 'Séance cardio intensive'),
('Séance Muscu', 'Musculation', 60.0, 'Moyen', '3-4 fois/semaine', 250, 'Développement musculaire'),
('Yoga Détente', 'Yoga', 45.0, 'Facile', '2-3 fois/semaine', 180, 'Relaxation et souplesse'),
('Fitness Intensif', 'Fitness', 30.0, 'Difficile', '3 fois/semaine', 450, 'HIIT et cardio intense')
ON CONFLICT (nom) DO NOTHING;

-- Objectifs
INSERT INTO objectifs (nom, objectif_bien_etre, description) VALUES
('Perdre 5kg', 'Perte de poids', 'Objectif de perte de poids modérée'),
('Gagner Masse Musculaire', 'Gain musculaire', 'Développement de la masse musculaire'),
('Améliorer Endurance', 'Performance', 'Augmenter la capacité cardiovasculaire'),
('Réduire Stress', 'Bien-être mental', 'Diminuer le niveau de stress quotidien'),
('Améliorer Sommeil', 'Bien-être', 'Qualité et durée du sommeil'),
('Stabiliser Poids', 'Maintien', 'Maintenir un poids santé stable'),
('Augmenter Énergie', 'Vitalité', 'Améliorer le niveau d''énergie quotidien'),
('Améliorer Digestion', 'Santé digestive', 'Optimiser le système digestif'),
('Renforcer Os', 'Santé osseuse', 'Augmenter la densité osseuse'),
('Améliorer Peau', 'Beauté', 'Améliorer l''apparence de la peau')
ON CONFLICT (nom) DO NOTHING;

-- Conditions médicales
INSERT INTO conditions_medicales (nom, type_condition, description) VALUES
('Diabète Type 2', 'Diabète', 'Résistance à l''insuline'),
('Hypertension Artérielle', 'Hypertension', 'Pression artérielle élevée'),
('Obésité Sévère', 'Obésité', 'IMC > 35'),
('Grossesse Trimestre 2', 'Grossesse', 'Deuxième trimestre de grossesse'),
('Diabète Type 1', 'Diabète', 'Absence de production d''insuline'),
('Hypertension Légère', 'Hypertension', 'Pression légèrement élevée'),
('Obésité Modérée', 'Obésité', 'IMC entre 30 et 35'),
('Grossesse Trimestre 1', 'Grossesse', 'Premier trimestre de grossesse'),
('Grossesse Trimestre 3', 'Grossesse', 'Troisième trimestre de grossesse'),
('Obésité Légère', 'Obésité', 'IMC entre 25 et 30')
ON CONFLICT (nom) DO NOTHING;

-- Allergies
INSERT INTO allergies (nom, type_allergie, description) VALUES
('Allergie Arachides', 'Arachides', 'Réaction allergique aux arachides'),
('Allergie Lactose', 'Lactose', 'Intolérance au lactose'),
('Allergie Gluten', 'Gluten', 'Maladie cœliaque ou sensibilité'),
('Allergie Fruits De Mer', 'Fruits de mer', 'Allergie aux crustacés et mollusques'),
('Allergie Oeufs', 'Oeufs', 'Réaction aux protéines d''œuf'),
('Allergie Soja', 'Soja', 'Allergie aux produits à base de soja'),
('Allergie Noix', 'Noix', 'Allergie aux fruits à coque'),
('Allergie Poisson', 'Poisson', 'Allergie aux poissons'),
('Allergie Blé', 'Blé', 'Allergie au blé'),
('Allergie Lait', 'Lait', 'Allergie aux protéines du lait')
ON CONFLICT (nom) DO NOTHING;

-- Préférences alimentaires
INSERT INTO preferences_alimentaires (nom, type_preference, description) VALUES
('Végétarien', 'Régime', 'Pas de viande ni poisson'),
('Sans Gluten', 'Intolérance', 'Évite tous les produits contenant du gluten'),
('Sans Lactose', 'Intolérance', 'Évite les produits laitiers')
ON CONFLICT (nom) DO NOTHING;

-- Programmes bien-être
INSERT INTO programmes_bien_etre (nom, description, duree_semaines) VALUES
('Programme Perte Poids', 'Programme complet pour perdre du poids sainement', 12),
('Programme Maintien', 'Programme pour maintenir un poids stable', 8),
('Programme Masse Musculaire', 'Programme pour développer la masse musculaire', 16),
('Programme Détox', 'Programme de détoxification du corps', 4),
('Programme Énergie', 'Programme pour augmenter l''énergie quotidienne', 6),
('Programme Sportif', 'Programme pour sportifs confirmés', 12),
('Programme Sénior', 'Programme adapté aux personnes âgées', 8),
('Programme Fitness', 'Programme de remise en forme générale', 10),
('Programme Végétarien', 'Programme basé sur une alimentation végétarienne', 8),
('Programme Équilibré', 'Programme d''alimentation équilibrée', 12)
ON CONFLICT (nom) DO NOTHING;

-- Recettes
INSERT INTO recettes (nom, instructions, temps_preparation, niveau_difficulte) VALUES
('Salade Épinards', 'Mélanger épinards frais, tomates cerises, et vinaigrette légère', 10, 'Facile'),
('Smoothie Vert', 'Mixer épinards, banane, pomme et eau de coco', 5, 'Facile')
ON CONFLICT (nom) DO NOTHING;

-- Relations: Aliments contiennent des nutriments
INSERT INTO aliments_nutriments (aliment_id, nutriment_id, quantite)
SELECT a.id, n.id, 50.0
FROM aliments a, nutriments n
WHERE a.nom = 'Pomme' AND n.nom = 'Vitamine C'
ON CONFLICT DO NOTHING;

INSERT INTO aliments_nutriments (aliment_id, nutriment_id, quantite)
SELECT a.id, n.id, 2.5
FROM aliments a, nutriments n
WHERE a.nom = 'Pomme' AND n.nom = 'Fibres'
ON CONFLICT DO NOTHING;

INSERT INTO aliments_nutriments (aliment_id, nutriment_id, quantite)
SELECT a.id, n.id, 120.0
FROM aliments a, nutriments n
WHERE a.nom = 'Lait' AND n.nom = 'Calcium'
ON CONFLICT DO NOTHING;

INSERT INTO aliments_nutriments (aliment_id, nutriment_id, quantite)
SELECT a.id, n.id, 2.0
FROM aliments a, nutriments n
WHERE a.nom = 'Saumon' AND n.nom = 'Oméga-3'
ON CONFLICT DO NOTHING;

INSERT INTO aliments_nutriments (aliment_id, nutriment_id, quantite)
SELECT a.id, n.id, 25.0
FROM aliments a, nutriments n
WHERE a.nom = 'Poulet Grillé' AND n.nom = 'Protéine Whey'
ON CONFLICT DO NOTHING;

INSERT INTO aliments_nutriments (aliment_id, nutriment_id, quantite)
SELECT a.id, n.id, 3.0
FROM aliments a, nutriments n
WHERE a.nom = 'Brocoli' AND n.nom = 'Fibres'
ON CONFLICT DO NOTHING;

INSERT INTO aliments_nutriments (aliment_id, nutriment_id, quantite)
SELECT a.id, n.id, 90.0
FROM aliments a, nutriments n
WHERE a.nom = 'Brocoli' AND n.nom = 'Vitamine C'
ON CONFLICT DO NOTHING;

INSERT INTO aliments_nutriments (aliment_id, nutriment_id, quantite)
SELECT a.id, n.id, 7.0
FROM aliments a, nutriments n
WHERE a.nom = 'Lentilles' AND n.nom = 'Fibres'
ON CONFLICT DO NOTHING;

INSERT INTO aliments_nutriments (aliment_id, nutriment_id, quantite)
SELECT a.id, n.id, 4.0
FROM aliments a, nutriments n
WHERE a.nom = 'Flocons Avoine' AND n.nom = 'Fibres'
ON CONFLICT DO NOTHING;

-- Relations: Aliments recommandés pour conditions
INSERT INTO aliments_recommandes_conditions (aliment_id, condition_id)
SELECT a.id, c.id
FROM aliments a, conditions_medicales c
WHERE a.nom = 'Brocoli' AND c.nom = 'Diabète Type 2'
ON CONFLICT DO NOTHING;

INSERT INTO aliments_recommandes_conditions (aliment_id, condition_id)
SELECT a.id, c.id
FROM aliments a, conditions_medicales c
WHERE a.nom = 'Saumon' AND c.nom = 'Hypertension Artérielle'
ON CONFLICT DO NOTHING;

INSERT INTO aliments_recommandes_conditions (aliment_id, condition_id)
SELECT a.id, c.id
FROM aliments a, conditions_medicales c
WHERE a.nom = 'Lentilles' AND c.nom = 'Diabète Type 2'
ON CONFLICT DO NOTHING;

INSERT INTO aliments_recommandes_conditions (aliment_id, condition_id)
SELECT a.id, c.id
FROM aliments a, conditions_medicales c
WHERE a.nom = 'Flocons Avoine' AND c.nom = 'Obésité Modérée'
ON CONFLICT DO NOTHING;

-- Relations: Aliments contre-indiqués pour conditions
INSERT INTO aliments_contre_indiques_conditions (aliment_id, condition_id)
SELECT a.id, c.id
FROM aliments a, conditions_medicales c
WHERE a.nom = 'Soda' AND c.nom = 'Diabète Type 2'
ON CONFLICT DO NOTHING;

INSERT INTO aliments_contre_indiques_conditions (aliment_id, condition_id)
SELECT a.id, c.id
FROM aliments a, conditions_medicales c
WHERE a.nom = 'Pain Blanc' AND c.nom = 'Diabète Type 1'
ON CONFLICT DO NOTHING;

INSERT INTO aliments_contre_indiques_conditions (aliment_id, condition_id)
SELECT a.id, c.id
FROM aliments a, conditions_medicales c
WHERE a.nom = 'Soda' AND c.nom = 'Obésité Sévère'
ON CONFLICT DO NOTHING;

-- Relations: Programmes visent des objectifs
UPDATE programmes_bien_etre SET objectif_id = (SELECT id FROM objectifs WHERE nom = 'Perdre 5kg')
WHERE nom = 'Programme Perte Poids';

UPDATE programmes_bien_etre SET objectif_id = (SELECT id FROM objectifs WHERE nom = 'Gagner Masse Musculaire')
WHERE nom = 'Programme Masse Musculaire';

UPDATE programmes_bien_etre SET objectif_id = (SELECT id FROM objectifs WHERE nom = 'Stabiliser Poids')
WHERE nom = 'Programme Maintien';

UPDATE programmes_bien_etre SET objectif_id = (SELECT id FROM objectifs WHERE nom = 'Augmenter Énergie')
WHERE nom = 'Programme Énergie';

-- Relations: Programmes incluent des activités
INSERT INTO programmes_activites (programme_id, activite_id, frequence_semaine)
SELECT p.id, a.id, 3
FROM programmes_bien_etre p, activites_physiques a
WHERE p.nom = 'Programme Perte Poids' AND a.nom = 'Course À Pied'
ON CONFLICT DO NOTHING;

INSERT INTO programmes_activites (programme_id, activite_id, frequence_semaine)
SELECT p.id, a.id, 2
FROM programmes_bien_etre p, activites_physiques a
WHERE p.nom = 'Programme Perte Poids' AND a.nom = 'Natation'
ON CONFLICT DO NOTHING;

INSERT INTO programmes_activites (programme_id, activite_id, frequence_semaine)
SELECT p.id, a.id, 4
FROM programmes_bien_etre p, activites_physiques a
WHERE p.nom = 'Programme Masse Musculaire' AND a.nom = 'Séance Muscu'
ON CONFLICT DO NOTHING;

INSERT INTO programmes_activites (programme_id, activite_id, frequence_semaine)
SELECT p.id, a.id, 3
FROM programmes_bien_etre p, activites_physiques a
WHERE p.nom = 'Programme Fitness' AND a.nom = 'Fitness Intensif'
ON CONFLICT DO NOTHING;

INSERT INTO programmes_activites (programme_id, activite_id, frequence_semaine)
SELECT p.id, a.id, 4
FROM programmes_bien_etre p, activites_physiques a
WHERE p.nom = 'Programme Sénior' AND a.nom = 'Tai Chi'
ON CONFLICT DO NOTHING;

-- Relations: Recettes composées d'aliments
INSERT INTO recettes_aliments (recette_id, aliment_id, quantite, unite)
SELECT r.id, a.id, 100, 'g'
FROM recettes r, aliments a
WHERE r.nom = 'Smoothie Vert' AND a.nom = 'Pomme'
ON CONFLICT DO NOTHING;

INSERT INTO recettes_aliments (recette_id, aliment_id, quantite, unite)
SELECT r.id, a.id, 1, 'unité'
FROM recettes r, aliments a
WHERE r.nom = 'Smoothie Vert' AND a.nom = 'Banane'
ON CONFLICT DO NOTHING;

-- Associer les aliments aux groupes alimentaires
UPDATE aliments SET groupe_alimentaire_id = (SELECT id FROM groupes_alimentaires WHERE nom = 'Fruits')
WHERE nom IN ('Pomme', 'Banane');

UPDATE aliments SET groupe_alimentaire_id = (SELECT id FROM groupes_alimentaires WHERE nom = 'Légumes')
WHERE nom IN ('Brocoli', 'Lentilles');
