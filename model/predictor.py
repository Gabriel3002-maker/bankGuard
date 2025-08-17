import joblib
import os

# Obtener ruta absoluta del archivo actual para cargar el modelo relativo a predictor.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ruta_modelo = os.path.join(BASE_DIR, 'detection_model.pkl')

modelo = joblib.load(ruta_modelo)


def predecir_mensaje(texto):
    prediccion = modelo.predict([texto])[0]
    probas = modelo.predict_proba([texto])[0]
    indice = list(modelo.classes_).index(prediccion)
    prob = probas[indice]
    return prediccion, prob
