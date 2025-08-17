from sqlalchemy import create_engine, Column, String, Float, Text, DateTime, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Configuración de la base de datos
DATABASE_URL = "postgresql+psycopg2://sucode:sucode@localhost:5432/banksecureguard"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class Correo(Base):
    __tablename__ = "correos"

    id = Column(Integer, primary_key=True,
                autoincrement=True)  # Clave primaria
    id_mensaje = Column(String, index=True, nullable=True)  # Ya no es único
    asunto = Column(Text)
    remitente = Column(Text)
    cuerpo = Column(Text)
    etiqueta = Column(String)
    confianza = Column(Float)
    fecha_analisis = Column(DateTime, default=datetime.utcnow)


def crear_tabla():
    Base.metadata.create_all(bind=engine)


def guardar_correo(id_mensaje, asunto, remitente, cuerpo, etiqueta, confianza):
    session = SessionLocal()
    try:
        # ⚠️ Siempre guarda uno nuevo, sin sobrescribir
        correo = Correo(
            id_mensaje=id_mensaje,
            asunto=asunto,
            remitente=remitente,
            cuerpo=cuerpo,
            etiqueta=etiqueta,
            confianza=confianza,
            fecha_analisis=datetime.utcnow()
        )
        session.add(correo)
        session.commit()
    except Exception as e:
        session.rollback()
        print(f"Error guardando correo: {e}")
    finally:
        session.close()
