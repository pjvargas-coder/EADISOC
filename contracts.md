# EADISOC - Contracts y Especificaciones del Sistema

## 🎯 Funcionalidades Implementadas (Frontend con Mocks)

### ✅ Sistema de Autenticación
- **Login**: Usuarios predefinidos (admin/admin123, doctor1/doctor123, usuario1/usuario123)
- **Roles**: Administrador, Doctor, Usuario
- **Persistencia**: LocalStorage para mantener sesión

### ✅ Dashboard Principal
- **Estadísticas**: Total pacientes, Pendientes, En seguimiento, Alta
- **Búsqueda**: Por nombre, caso, diagnóstico, centro
- **Filtros**: Por estado de paciente
- **Botón limpiar**: Para resetear búsqueda y filtros
- **Exportar a Word**: Reemplaza JSON/Excel según solicitud

### ✅ Gestión de Pacientes (Mock)
- **Lista de pacientes**: 3 pacientes de ejemplo con datos realistas
- **Campos principales**: Caso, Nombre, Fecha Nac., Edad, Diagnóstico, Estado, Centro
- **Campos adicionales implementados**:
  - `derivacion`: Cambió de "Deriva de" a "Derivación"
  - `protocoloEscolar`: Nuevo campo Sí/No
  - Edad calculada automáticamente

### ✅ Pruebas Médicas (Estructura Lista)
```javascript
pruebas: {
  nice: "17",           // 3 dígitos, sin "Score"
  amse: "85",           // 3 dígitos, sin "Score"  
  scq: "22",            // 3 dígitos, sin "Score"
  wisc: {               // Cada apartado separado
    icv: "89",          // ICV
    ive: "94",          // IVE
    imt: "88",          // IMT
    ivp: "69",          // IVP
    cit: "79"           // CIT
  }
}
```

### ✅ Sistema de Notas (Estructura Lista)
```javascript
notas: [
  {
    id: "1",
    fecha: "2024-01-15",
    contenido: "Enero 2024: NRP: NICE 17, WISC V (2021): CV 84 VE 85..."
  }
]
```

### ✅ Botones de Administración
- **Usuarios**: Gestión de usuarios del sistema (solo admin)
- **Admin**: Panel para modificar desplegables (solo admin)

## 🔄 Datos Mock Actuales

### Pacientes de Ejemplo
1. **BLAZQUEZ MARTINEZ, LIDIA** - Caso 1033, 12 años, Rasgos TEA, ALTA
2. **SALAS IZQUIERDO, MILAN** - Caso 1046, 2 años, TEA grado 2-3, EN_SEGUIMIENTO
3. **GARCIA RODRIGUEZ, MARIA** - Caso 1050, 9 años, TDAH, PENDIENTE

### Diagnósticos Configurados
- TEA grado 1, 2, 2-3, 3
- Rasgos TEA
- TDAH, TDI
- Trastorno del aprendizaje
- Discapacidad intelectual
- Trastorno del lenguaje
- Sin diagnóstico

### Centros Educativos
- IES Joan Maria Thomas
- CEIP Teringa
- CEIP San Miguel
- IES Es Quartó
- CEIP Sa Graduada
- IES Balàfia
- CEIP Es Molinar

## 🚀 Funcionalidades Preparadas para Backend

### API Endpoints a Implementar
```
GET /api/patients - Listar pacientes
POST /api/patients - Crear paciente
PUT /api/patients/:id - Actualizar paciente  
DELETE /api/patients/:id - Eliminar paciente
GET /api/patients/:id/notes - Notas del paciente
POST /api/patients/:id/notes - Añadir nota
PUT /api/patients/:id/notes/:noteId - Editar nota
GET /api/diagnosticos - Lista de diagnósticos
POST /api/diagnosticos - Añadir diagnóstico
GET /api/centros - Lista de centros
POST /api/centros - Añadir centro
POST /api/export/word - Exportar a Word
```

### Modelos de Datos MongoDB
```javascript
Patient {
  caso: String,
  nombre: String,
  fechaNacimiento: Date,
  edad: Number, // calculado
  diagnostico: String,
  estado: Enum[PENDIENTE, EN_SEGUIMIENTO, ALTA, DERIVADO],
  centro: String,
  derivacion: String,
  protocoloEscolar: Boolean,
  pruebas: {
    nice: String,
    amse: String,
    scq: String,
    wisc: {
      icv: String,
      ive: String, 
      imt: String,
      ivp: String,
      cit: String
    }
  },
  createdAt: Date,
  updatedAt: Date
}

Note {
  patientId: ObjectId,
  fecha: Date,
  contenido: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 💾 Soporte Multi-Usuario
- Sistema preparado para 5 usuarios simultáneos
- Autenticación por roles
- Persistencia de sesión en localStorage
- Gestión de permisos por rol

## 📋 Mejoras Implementadas Según Solicitud

### ✅ Dashboard
- ❌ Eliminado: Exportar JSON/Excel  
- ✅ Añadido: Exportar a Word (con referencia a plantilla acta eadisoc A.docx)

### ✅ Buscador
- ✅ Añadido: Botón "Limpiar" 
- ❌ Eliminado: "Centro por protocolo escolar"

### ✅ Formulario Paciente (Preparado)
- ✅ Ancho aumentado (max-w-4xl)
- ✅ Fecha nacimiento con calendario
- ✅ Edad calculada automáticamente
- ✅ Diagnóstico con desplegable
- ✅ "Deriva de" → "Derivación"
- ✅ Nuevo campo "Protocolo Escolar (Sí/No)"

### ✅ Pruebas Médicas (Preparado)
- ✅ Celdas al lado del título
- ✅ Tamaño 3 dígitos
- ✅ Eliminado "Score" de nombres (NICE, AMSE, SCQ)
- ✅ WISC separado por apartados (ICV, IVE, IMT, IVP, CIT)

### ✅ Sistema de Notas (Preparado)
- ✅ Pantalla de notas con formato solicitado
- ✅ Crear nuevas notas
- ✅ Editar notas existentes  
- ✅ Fecha automática de creación

### ✅ Panel Administrativo (Preparado)
- ✅ Modificar desplegables de diagnósticos
- ✅ Modificar desplegables de centros
- ✅ Botón "Admin" en dashboard para acceso

## 🔧 Próximos Pasos para Backend
1. Implementar modelos MongoDB
2. Crear endpoints API REST
3. Integrar exportación a Word con plantilla
4. Conectar frontend con endpoints reales
5. Implementar autenticación JWT
6. Sistema de logs y auditoría

## ✨ Estado Actual
**Frontend completamente funcional con datos mock que replica exactamente el diseño y funcionalidad solicitada. Listo para integración con backend.**