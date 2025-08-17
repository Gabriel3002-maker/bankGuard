from flask import Flask, request, jsonify
from flasgger import Swagger, swag_from
from flask_cors import CORS
from predictor import predecir_mensaje
from models.db_manager_sqlalchemy import crear_tabla, guardar_correo

app = Flask(__name__)
CORS(app)  # Permite CORS para todas las rutas y orígenes
Swagger(app)

crear_tabla()


@app.route('/analizar', methods=['POST'])
@swag_from({
    'tags': ['Análisis'],
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'id': {'type': 'string', 'example': '123abc'},
                    'asunto': {'type': 'string', 'example': 'Asunto del email'},
                    'remitente': {'type': 'string', 'example': 'juan@segurobank.com'},
                    'texto': {
                        'type': 'string',
                        'example': 'Texto del email a analizar'
                    }
                },
                'required': ['texto']
            }
        }
    ],
    'responses': {
        200: {
            'description': 'Resultado de la detección y posible guardado',
            'schema': {
                'type': 'object',
                'properties': {
                    'etiqueta': {'type': 'string', 'example': 'filtracion'},
                    'confianza': {'type': 'number', 'format': 'float', 'example': 0.87},
                    'guardado': {'type': 'boolean', 'example': True}
                }
            }
        }
    }
})
def analizar():
    data = request.get_json()
    texto = data.get('texto', '')
    correo_id = data.get('id')
    asunto = data.get('asunto', 'Sin asunto')
    remitente = data.get('remitente', 'Desconocido')

    etiqueta, prob = predecir_mensaje(texto)

    guardado = False
    if etiqueta in ["sospechoso", "filtracion"]:
        guardar_correo(correo_id, asunto, remitente,
                       texto, etiqueta, float(prob))
        guardado = True

    return jsonify({'etiqueta': etiqueta, 'confianza': prob, 'guardado': guardado})


if __name__ == '__main__':
    app.run(port=5000, debug=True)
