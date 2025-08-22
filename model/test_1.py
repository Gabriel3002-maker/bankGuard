from sklearn.model_selection import train_test_split
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, ConfusionMatrixDisplay, roc_curve, auc
import matplotlib.pyplot as plt
import joblib

# Cargar datos
df = pd.read_csv('datasets.csv')

# Dividir datos en entrenamiento y prueba
X_train, X_test, y_train, y_test = train_test_split(
    df['texto'], df['etiqueta'], test_size=0.2, random_state=42)

# Definir pipeline de entrenamiento
pipeline = Pipeline([
    ('tfidf', TfidfVectorizer()),
    ('clf', LogisticRegression(max_iter=1000))
])

# Entrenar modelo
pipeline.fit(X_train, y_train)

# Predecir en datos de prueba
y_pred = pipeline.predict(X_test)
# Probabilidades para la clase positiva (si es binaria)
y_proba = pipeline.predict_proba(X_test)[:, 1]

# Evaluar con métricas
print("Reporte de clasificación:")
print(classification_report(y_test, y_pred))

# Matriz de confusión
cm = confusion_matrix(y_test, y_pred)
disp = ConfusionMatrixDisplay(confusion_matrix=cm)
disp.plot(cmap=plt.cm.Blues)
plt.title("Matriz de Confusión")
plt.show()

# Curva ROC y AUC (solo si es clasificación binaria)
if len(set(df['etiqueta'])) == 2:
    fpr, tpr, thresholds = roc_curve(y_test, y_proba)
    roc_auc = auc(fpr, tpr)

    plt.figure()
    plt.plot(fpr, tpr, color='darkorange', lw=2,
             label='ROC curve (AUC = %0.2f)' % roc_auc)
    plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('Tasa de Falsos Positivos')
    plt.ylabel('Tasa de Verdaderos Positivos')
    plt.title('Curva ROC')
    plt.legend(loc="lower right")
    plt.show()

# Guardar modelo entrenado
joblib.dump(pipeline, 'detection_model_1.pkl')

print("Modelo entrenado, evaluado y guardado en detection_model_1.pkl")
