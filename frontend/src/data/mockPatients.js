// Mock data for patients
export const mockPatients = [
  {
    id: "1033",
    caso: "1033",
    nombre: "BLAZQUEZ MARTINEZ, LIDIA",
    fechaNacimiento: "2012-08-04",
    edad: 12,
    diagnostico: "Rasgos TEA",
    estado: "ALTA",
    centro: "IES Joan Maria Thomas", // Para compatibilidad
    centroEscolar: "IES Joan Maria Thomas",
    centroSalud: "IBSMIA",
    derivacion: "IBSMIA",
    protocoloEscolar: true,
    pruebas: {
      nice: 17,
      amse: "",
      scq: "",
      wisc: {
        icv: 89,
        ive: 94,
        imt: 88,
        ivp: 69,
        cit: 79
      }
    },
    notas: [
      {
        id: "1",
        fecha: "2024-01-15",
        contenido: "Enero 2024: NRP: NICE 17, WISC V (2021): CV 84 VE 85 RF 79 MT 67 VP 83 CIT 76, SDQ colegio: + TDAH. SDQ padres: + TDAH + conducta + compañeros -ADH colegio: Negativo. ADH padres: +. En seguimiento y tratamiento por IBSMIA desde 2018."
      },
      {
        id: "2",
        fecha: "2024-02-10",
        contenido: "Febrero 2024 se realiza 1ª visita en NRP a petición de IBSMIA por CI límite con funcionamiento como TDI leve junto con TDAH + trastorno del aprendizaje + tics. Solicito protocolo escolar."
      }
    ]
  },
  {
    id: "1046",
    caso: "1046",
    nombre: "SALAS IZQUIERDO, MILAN",
    fechaNacimiento: "2023-01-30",
    edad: 2,
    diagnostico: "TEA grado 2-3",
    estado: "EN_SEGUIMIENTO",
    centro: "CEIP Teringa", // Para compatibilidad
    centroEscolar: "CEIP Teringa",
    centroSalud: "Hospital Son Espases",
    derivacion: "Pediatría",
    protocoloEscolar: false,
    pruebas: {
      nice: 14,
      amse: 85,
      scq: 22,
      wisc: {
        icv: 0,
        ive: 0,
        imt: 0,
        ivp: 0,
        cit: 0
      }
    },
    notas: []
  },
  {
    id: "1050",
    caso: "1050",
    nombre: "GARCIA RODRIGUEZ, MARIA",
    fechaNacimiento: "2015-03-15",
    edad: 9,
    diagnostico: "TDAH",
    estado: "PENDIENTE",
    centro: "CEIP San Miguel", // Para compatibilidad
    centroEscolar: "CEIP San Miguel",
    centroSalud: "Centro de Salud Manacor",
    derivacion: "Pediatría",
    protocoloEscolar: true,
    pruebas: {
      nice: 12,
      amse: 78,
      scq: 8,
      wisc: {
        icv: 95,
        ive: 88,
        imt: 92,
        ivp: 85,
        cit: 90
      }
    },
    notas: []
  }
];

export const diagnosticos = [
  "TEA grado 1",
  "TEA grado 2",
  "TEA grado 2-3",  
  "TEA grado 3",
  "Rasgos TEA",
  "TDAH",
  "TDI",
  "Trastorno del aprendizaje",
  "Discapacidad intelectual",
  "Trastorno del lenguaje",
  "Sin diagnóstico"
];

export const estados = [
  { value: "PENDIENTE", label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  { value: "EN_SEGUIMIENTO", label: "En seguimiento", color: "bg-blue-100 text-blue-800" },
  { value: "ALTA", label: "Alta", color: "bg-green-100 text-green-800" },
  { value: "DERIVADO", label: "Derivado", color: "bg-purple-100 text-purple-800" }
];

export const centros = [
  // Centros Escolares
  { nombre: "IES Joan Maria Thomas", tipo: "escolar" },
  { nombre: "CEIP Teringa", tipo: "escolar" }, 
  { nombre: "CEIP San Miguel", tipo: "escolar" },
  { nombre: "IES Es Quartó", tipo: "escolar" },
  { nombre: "CEIP Sa Graduada", tipo: "escolar" },
  { nombre: "IES Balàfia", tipo: "escolar" },
  { nombre: "CEIP Es Molinar", tipo: "escolar" },
  
  // Centros de Salud
  { nombre: "Hospital Son Espases", tipo: "salud" },
  { nombre: "Centro de Salud Manacor", tipo: "salud" },
  { nombre: "Hospital Can Misses", tipo: "salud" },
  { nombre: "Centro de Salud Inca", tipo: "salud" },
  { nombre: "IBSMIA", tipo: "salud" },
  { nombre: "Hospital Mateu Orfila", tipo: "salud" },
  { nombre: "Centro de Salud Ciutadella", tipo: "salud" }
];