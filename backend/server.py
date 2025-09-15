from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import os
import logging
import uuid
from pathlib import Path
from dotenv import load_dotenv

# Configuración
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'test_database')

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# FastAPI app
app = FastAPI(title="EADISOC API", description="Sistema de gestión de pacientes")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router con prefijo /api
api_router = APIRouter(prefix="/api")

# Modelos Pydantic

class WiscScores(BaseModel):
    icv: str = ""
    ive: str = ""
    imt: str = ""
    ivp: str = ""
    cit: str = ""

class PruebasMedicas(BaseModel):
    nice: str = ""
    amse: str = ""
    scq: str = ""
    wisc: WiscScores = WiscScores()

class NotaPaciente(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    fecha: str
    contenido: str

class PacienteBase(BaseModel):
    nombre: str
    fechaNacimiento: str
    diagnostico: str
    estado: str
    centroEscolar: str = ""
    centroSalud: str = ""
    derivacion: str = ""
    protocoloEscolar: bool = False
    pruebas: PruebasMedicas = PruebasMedicas()
    notas: List[NotaPaciente] = []

class PacienteCreate(PacienteBase):
    pass

class Paciente(PacienteBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    caso: str
    edad: int
    centro: str = ""  # Para compatibilidad

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Funciones auxiliares
def calculate_age(birth_date: str) -> int:
    """Calcula la edad basada en la fecha de nacimiento"""
    try:
        birth = datetime.strptime(birth_date, '%Y-%m-%d')
        today = datetime.now()
        age = today.year - birth.year
        if today.month < birth.month or (today.month == birth.month and today.day < birth.day):
            age -= 1
        return max(0, age)
    except:
        return 0

def generate_case_number() -> str:
    """Genera un número de caso único"""
    return str(uuid.uuid4().int)[:4]

# Endpoints básicos
@api_router.get("/")
async def root():
    return {"message": "EADISOC API - Sistema de Gestión de Pacientes"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Endpoints de Status Check (ejemplo original)
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Endpoints de Pacientes
@api_router.get("/patients", response_model=List[Paciente])
async def get_patients():
    """Obtener todos los pacientes"""
    try:
        patients = await db.patients.find().to_list(1000)
        return [Paciente(**patient) for patient in patients]
    except Exception as e:
        logging.error(f"Error getting patients: {e}")
        raise HTTPException(status_code=500, detail="Error al obtener pacientes")

@api_router.get("/patients/{patient_id}", response_model=Paciente)
async def get_patient(patient_id: str):
    """Obtener un paciente por ID"""
    try:
        patient = await db.patients.find_one({"id": patient_id})
        if patient is None:
            raise HTTPException(status_code=404, detail="Paciente no encontrado")
        return Paciente(**patient)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error getting patient {patient_id}: {e}")
        raise HTTPException(status_code=500, detail="Error al obtener paciente")

@api_router.post("/patients", response_model=Paciente)
async def create_patient(patient: PacienteCreate):
    """Crear un nuevo paciente"""
    try:
        # Calcular edad
        edad = calculate_age(patient.fechaNacimiento)
        
        # Generar número de caso
        caso = generate_case_number()
        
        # Crear objeto paciente completo
        patient_data = patient.dict()
        patient_data.update({
            "id": str(uuid.uuid4()),
            "caso": caso,
            "edad": edad,
            "centro": patient.centroEscolar  # Para compatibilidad
        })
        
        new_patient = Paciente(**patient_data)
        
        # Guardar en MongoDB
        await db.patients.insert_one(new_patient.dict())
        
        return new_patient
    except Exception as e:
        logging.error(f"Error creating patient: {e}")
        raise HTTPException(status_code=500, detail="Error al crear paciente")

@api_router.put("/patients/{patient_id}", response_model=Paciente)
async def update_patient(patient_id: str, patient_update: PacienteCreate):
    """Actualizar un paciente existente"""
    try:
        # Verificar que el paciente existe
        existing_patient = await db.patients.find_one({"id": patient_id})
        if existing_patient is None:
            raise HTTPException(status_code=404, detail="Paciente no encontrado")
        
        # Calcular edad actualizada
        edad = calculate_age(patient_update.fechaNacimiento)
        
        # Preparar datos actualizados
        update_data = patient_update.dict()
        update_data.update({
            "edad": edad,
            "centro": patient_update.centroEscolar  # Para compatibilidad
        })
        
        # Actualizar en MongoDB
        await db.patients.update_one(
            {"id": patient_id},
            {"$set": update_data}
        )
        
        # Obtener paciente actualizado
        updated_patient = await db.patients.find_one({"id": patient_id})
        return Paciente(**updated_patient)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating patient {patient_id}: {e}")
        raise HTTPException(status_code=500, detail="Error al actualizar paciente")

@api_router.delete("/patients/{patient_id}")
async def delete_patient(patient_id: str):
    """Eliminar un paciente"""
    try:
        result = await db.patients.delete_one({"id": patient_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Paciente no encontrado")
        return {"message": "Paciente eliminado correctamente"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting patient {patient_id}: {e}")
        raise HTTPException(status_code=500, detail="Error al eliminar paciente")

# Endpoints de Notas
@api_router.get("/patients/{patient_id}/notes", response_model=List[NotaPaciente])
async def get_patient_notes(patient_id: str):
    """Obtener notas de un paciente"""
    try:
        patient = await db.patients.find_one({"id": patient_id})
        if patient is None:
            raise HTTPException(status_code=404, detail="Paciente no encontrado")
        
        return patient.get("notas", [])
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error getting notes for patient {patient_id}: {e}")
        raise HTTPException(status_code=500, detail="Error al obtener notas")

@api_router.post("/patients/{patient_id}/notes", response_model=NotaPaciente)
async def add_patient_note(patient_id: str, note: NotaPaciente):
    """Añadir una nota a un paciente"""
    try:
        # Verificar que el paciente existe
        patient = await db.patients.find_one({"id": patient_id})
        if patient is None:
            raise HTTPException(status_code=404, detail="Paciente no encontrado")
        
        # Añadir la nota
        await db.patients.update_one(
            {"id": patient_id},
            {"$push": {"notas": note.dict()}}
        )
        
        return note
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error adding note to patient {patient_id}: {e}")
        raise HTTPException(status_code=500, detail="Error al añadir nota")

@api_router.put("/patients/{patient_id}/notes/{note_id}", response_model=NotaPaciente)
async def update_patient_note(patient_id: str, note_id: str, note_update: NotaPaciente):
    """Actualizar una nota específica"""
    try:
        # Actualizar la nota específica en el array
        result = await db.patients.update_one(
            {"id": patient_id, "notas.id": note_id},
            {"$set": {"notas.$": note_update.dict()}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Paciente o nota no encontrada")
        
        return note_update
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating note {note_id} for patient {patient_id}: {e}")
        raise HTTPException(status_code=500, detail="Error al actualizar nota")

# Endpoints para configuración
@api_router.get("/diagnosticos")
async def get_diagnosticos():
    """Obtener lista de diagnósticos"""
    diagnosticos = [
        "TEA grado 1", "TEA grado 2", "TEA grado 2-3", "TEA grado 3",
        "Rasgos TEA", "TDAH", "TDI", "Trastorno del aprendizaje",
        "Discapacidad intelectual", "Trastorno del lenguaje", "Sin diagnóstico"
    ]
    return {"diagnosticos": diagnosticos}

@api_router.get("/centros")
async def get_centros():
    """Obtener lista de centros"""
    centros = [
        "IES Joan Maria Thomas", "CEIP Teringa", "CEIP San Miguel",
        "IES Es Quartó", "CEIP Sa Graduada", "IES Balàfia", "CEIP Es Molinar"
    ]
    return {"centros": centros}

@api_router.get("/estados")
async def get_estados():
    """Obtener lista de estados"""
    estados = [
        {"value": "PENDIENTE", "label": "Pendiente"},
        {"value": "EN_SEGUIMIENTO", "label": "En seguimiento"},
        {"value": "ALTA", "label": "Alta"},
        {"value": "DERIVADO", "label": "Derivado"}
    ]
    return {"estados": estados}

# Endpoint para poblar datos de prueba
@api_router.post("/seed-data")
async def seed_database():
    """Poblar la base de datos con datos de prueba"""
    try:
        # Verificar si ya hay datos
        count = await db.patients.count_documents({})
        if count > 0:
            return {"message": f"La base de datos ya tiene {count} pacientes"}
        
        # Datos de prueba
        sample_patients = [
            {
                "id": "1",
                "caso": "1033",
                "nombre": "BLAZQUEZ MARTINEZ, LIDIA",
                "fechaNacimiento": "2012-08-04",
                "edad": 12,
                "diagnostico": "Rasgos TEA",
                "estado": "ALTA",
                "centro": "IES Joan Maria Thomas",
                "centroEscolar": "IES Joan Maria Thomas",
                "centroSalud": "IBSMIA",
                "derivacion": "IBSMIA",
                "protocoloEscolar": True,
                "pruebas": {
                    "nice": "17",
                    "amse": "",
                    "scq": "",
                    "wisc": {"icv": "89", "ive": "94", "imt": "88", "ivp": "69", "cit": "79"}
                },
                "notas": [
                    {
                        "id": "1",
                        "fecha": "2024-01-15",
                        "contenido": "Enero 2024: NRP: NICE 17, WISC V (2021): CV 84 VE 85..."
                    }
                ]
            },
            {
                "id": "2",
                "caso": "1046",
                "nombre": "SALAS IZQUIERDO, MILAN",
                "fechaNacimiento": "2023-01-30",
                "edad": 2,
                "diagnostico": "TEA grado 2-3",
                "estado": "EN_SEGUIMIENTO",
                "centro": "CEIP Teringa",
                "centroEscolar": "CEIP Teringa",
                "centroSalud": "Hospital Son Espases",
                "derivacion": "Pediatría",
                "protocoloEscolar": False,
                "pruebas": {
                    "nice": "14",
                    "amse": "85",
                    "scq": "22",
                    "wisc": {"icv": "0", "ive": "0", "imt": "0", "ivp": "0", "cit": "0"}
                },
                "notas": []
            },
            {
                "id": "3",
                "caso": "1050",
                "nombre": "GARCIA RODRIGUEZ, MARIA",
                "fechaNacimiento": "2015-03-15",
                "edad": 9,
                "diagnostico": "TDAH",
                "estado": "PENDIENTE",
                "centro": "CEIP San Miguel",
                "centroEscolar": "CEIP San Miguel",
                "centroSalud": "Centro de Salud Manacor",
                "derivacion": "Pediatría",
                "protocoloEscolar": True,
                "pruebas": {
                    "nice": "12",
                    "amse": "78",
                    "scq": "8",
                    "wisc": {"icv": "95", "ive": "88", "imt": "92", "ivp": "85", "cit": "90"}
                },
                "notas": []
            }
        ]
        
        # Insertar datos
        await db.patients.insert_many(sample_patients)
        
        return {"message": f"Se insertaron {len(sample_patients)} pacientes de prueba"}
    except Exception as e:
        logging.error(f"Error seeding database: {e}")
        raise HTTPException(status_code=500, detail="Error al poblar base de datos")

# Incluir router en la app
app.include_router(api_router)

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)