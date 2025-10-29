import os

# Configuration Fuseki
FUSEKI_URL = os.getenv("FUSEKI_URL", "http://localhost:3030")
FUSEKI_USERNAME = os.getenv("FUSEKI_USERNAME", "admin")
FUSEKI_PASSWORD = os.getenv("FUSEKI_PASSWORD", "admin")
DATASET_NAME = "nutrition"

# Configuration Flask
DEBUG = os.getenv("DEBUG", "True") == "True"
PORT = int(os.getenv("PORT", 5000))
