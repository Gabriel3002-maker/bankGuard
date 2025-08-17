import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import joblib

# Cargar datos
df = pd.read_csv('datasets.csv')

# Definir pipeline de entrenamiento
pipeline = Pipeline([
    ('tfidf', TfidfVectorizer()),
    ('clf', LogisticRegression(max_iter=1000))
])

# Entrenar modelo
pipeline.fit(df['texto'], df['etiqueta'])

# Guardar modelo entrenado
joblib.dump(pipeline, 'detection_model.pkl')

print("Modelo entrenado y guardado en detection_model.pkl")
