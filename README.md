# 🏦 BankGuard  
### Detector Open Source de Fugas de Información Bancaria con NLP (Español)

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)
![NLP](https://img.shields.io/badge/NLP-SpaCy-orange.svg)
![Open Source](https://img.shields.io/badge/Open%20Source-Community--Driven-purple.svg)

**BankGuard** es un proyecto **open source** para la detección automática de **información bancaria sensible** en texto en español, utilizando **Procesamiento de Lenguaje Natural (NLP)** y reglas inteligentes.  

Está pensado como una herramienta de **prevención**, **aprendizaje** y **experimentación**, ideal para desarrolladores, estudiantes y equipos de seguridad.

---

## 🎯 Objetivo del Proyecto

Reducir el riesgo de **fugas de información sensible** (cuentas bancarias, tarjetas, documentos, etc.) antes de que sean enviadas por correo u otros canales digitales.

---

## ✨ Características Principales

### 🔍 Detección Inteligente (NLP)
- Análisis de texto en **español**
- Identificación de datos bancarios y personales
- Uso combinado de **SpaCy + Regex**
- Explicación clara de cada detección

### 🚨 Evaluación de Riesgo
- Clasificación automática:
  - 🟢 Bajo
  - 🟡 Medio
  - 🔴 Alto
- Nivel de confianza por patrón detectado

### 🌐 Integración
- API REST con **FastAPI**
- Extensión para **Gmail (Chrome / Edge)**
- Respuestas JSON simples y estándar

---

## 🧠 Tipos de Información Detectada

| Tipo | Ejemplo | Nivel de Riesgo |
|-----|--------|----------------|
| Cuenta Bancaria | 123456789012 | 🔴 Alto |
| Tarjeta de Crédito | 4111-1111-1111-1111 | 🔴 Alto |
| Cédula / RUT | 12.345.678-9 | 🟡 Medio |
| Email Corporativo | usuario@banco.com | 🟡 Medio |
| Teléfono | +56 9 1234 5678 | 🟢 Bajo |

---

## 🏗️ Arquitectura del Proyecto

bankGuard/
├── server/ # Backend FastAPI
│ ├── app.py # API principal
│ ├── model/
│ │ ├── detector.py # Lógica NLP
│ │ └── patterns.json # Patrones sensibles
│ └── requirements.txt
├── gmail-filter-extension/ # Extensión Gmail
│ ├── manifest.json
│ ├── popup.html
│ ├── popup.js
│ └── content.js
└── README.md


---

## 🚀 Instalación Rápida

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/Gabriel3002-maker/bankGuard.git
cd bankGuard

python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

pip install -r requirements.txt
python -m spacy download es_core_news_sm







