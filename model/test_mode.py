import re
from predictor import predecir_mensaje


def limpiar_mensaje(texto: str) -> str:
    """
    Limpia y normaliza el texto para mejorar la predicción.
    - Convierte a minúsculas.
    - Elimina caracteres especiales innecesarios.
    - Reemplaza múltiples espacios por uno solo.
    """
    texto = texto.lower()
    # eliminar caracteres raros
    texto = re.sub(r"[^a-záéíóúüñ0-9\s]", " ", texto)
    texto = re.sub(r"\s+", " ", texto)
    texto = texto.strip()
    return texto


# Ejemplo de uso
mensaje = "Envio documentos envio lo que acordamos  y me realizas el pago"
mensaje_limpio = limpiar_mensaje(mensaje)

etiqueta, prob = predecir_mensaje(mensaje_limpio)
print(f"Mensaje limpio: {mensaje_limpio}")
print(f"Etiqueta: {etiqueta}, Confianza: {prob:.2f}")
