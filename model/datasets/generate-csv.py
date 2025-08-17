import pandas as pd
import random
import os

# ==============================
# CONFIGURACIÓN
# ==============================
SEED_DIR = "semillas"
OUTPUT_DIR = "datasets_generados"
N_PARTS = 1
EXAMPLES_PER_PART = 100000
# ==============================

# Crear carpeta de salida
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Cargar semillas desde archivos
semillas = {}
for filename in os.listdir(SEED_DIR):
    if filename.endswith(".txt"):
        label = filename.replace(".txt", "").lower()
        with open(os.path.join(SEED_DIR, filename), "r", encoding="utf-8") as f:
            frases = [line.strip() for line in f if line.strip()]
            semillas[label] = frases

# Verificar clases cargadas
print("Clases cargadas:", list(semillas.keys()))

# Función para generar variaciones aleatorias


def generar_variacion(texto):
    sufijos = ["", " urgente", " revisa", " confidencial", " !", " 2025"]
    return texto + random.choice(sufijos)


# Generar CSVs
for part in range(1, N_PARTS+1):
    filas = []
    labels = list(semillas.keys())
    per_label = EXAMPLES_PER_PART // len(labels)

    for label in labels:
        for _ in range(per_label):
            frase = random.choice(semillas[label])
            frase = generar_variacion(frase)
            filas.append({"texto": frase, "etiqueta": label})

    # Mezclar aleatoriamente
    random.shuffle(filas)

    # Guardar CSV
    df = pd.DataFrame(filas)
    file_path = os.path.join(
        OUTPUT_DIR, f"dataset_filtraciones_1k_part{part}.csv")
    df.to_csv(file_path, index=False)
    print(f"✅ Archivo generado: {file_path} con {len(df)} filas")

print("\n🎉 Todos los CSVs han sido generados correctamente.")
