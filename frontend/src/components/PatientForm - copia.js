import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '../hooks/use-toast';

const PatientForm = ({ patient, onSave, onCancel, diagnosticos, centros }) => {
  const { toast } = useToast();
  
  // Normalizar centros para evitar el error de objetos
  const centrosNormalizados = React.useMemo(() => {
    if (!centros) return [];
    
    // Si centros es un array de objetos con {nombre, tipo}
    if (Array.isArray(centros) && centros.length > 0 && typeof centros[0] === 'object' && centros[0].nombre) {
      return centros.map(c => c.nombre);
    }
    
    // Si centros es un array simple de strings
    if (Array.isArray(centros)) {
      return centros;
    }
    
    // Fallback a centros predeterminados
    return [
      'IES Joan Maria Thomas', 
      'CEIP Teringa', 
      'CEIP San Miguel', 
      'IES Es Quartó', 
      'CEIP Sa Graduada', 
      'IES Balàfia', 
      'CEIP Es Molinar'
    ];
  }, [centros]);

  // Cursos escolares organizados por categoría
  const cursosEscolares = [
    // Educación Infantil
    { value: "EI_3", label: "Educación Infantil 3 años", categoria: "Educación Infantil" },
    { value: "EI_4", label: "Educación Infantil 4 años", categoria: "Educación Infantil" },
    { value: "EI_5", label: "Educación Infantil 5 años", categoria: "Educación Infantil" },
    
    // Educación Primaria
    { value: "EP_1", label: "1º Primaria", categoria: "Educación Primaria" },
    { value: "EP_2", label: "2º Primaria", categoria: "Educación Primaria" },
    { value: "EP_3", label: "3º Primaria", categoria: "Educación Primaria" },
    { value: "EP_4", label: "4º Primaria", categoria: "Educación Primaria" },
    { value: "EP_5", label: "5º Primaria", categoria: "Educación Primaria" },
    { value: "EP_6", label: "6º Primaria", categoria: "Educación Primaria" },
    
    // Educación Secundaria Obligatoria
    { value: "ESO_1", label: "1º ESO", categoria: "Educación Secundaria" },
    { value: "ESO_2", label: "2º ESO", categoria: "Educación Secundaria" },
    { value: "ESO_3", label: "3º ESO", categoria: "Educación Secundaria" },
    { value: "ESO_4", label: "4º ESO", categoria: "Educación Secundaria" },
    
    // Bachillerato
    { value: "BACH_1", label: "1º Bachillerato", categoria: "Bachillerato" },
    { value: "BACH_2", label: "2º Bachillerato", categoria: "Bachillerato" },
    
    // Formación Profesional
    { value: "FP_BASICA_1", label: "1º FP Básica", categoria: "Formación Profesional" },
    { value: "FP_BASICA_2", label: "2º FP Básica", categoria: "Formación Profesional" },
    { value: "FP_GRADO_MEDIO_1", label: "1º FP Grado Medio", categoria: "Formación Profesional" },
    { value: "FP_GRADO_MEDIO_2", label: "2º FP Grado Medio", categoria: "Formación Profesional" },
    { value: "FP_GRADO_SUPERIOR_1", label: "1º FP Grado Superior", categoria: "Formación Profesional" },
    { value: "FP_GRADO_SUPERIOR_2", label: "2º FP Grado Superior", categoria: "Formación Profesional" },
    
    // Otros
    { value: "UNIVERSIDAD", label: "Universidad", categoria: "Educación Superior" },
    { value: "NO_ESCOLARIZADO", label: "No escolarizado", categoria: "Otros" },
    { value: "EDUCACION_ESPECIAL", label: "Educación Especial", categoria: "Otros" }
  ];

  const [formData, setFormData] = useState({
    nombre: '',
    fechaNacimiento: '',
    diagnostico: '',
    estado: 'PENDIENTE',
    centroEscolar: '',
    centroSalud: '',
    cursoEscolar: '',
    derivacion: '',
    protocoloEscolar: false,
    pruebas: {
      nice: '',
      amse: '',
      scq: '',
      wisc: {
        icv: '',
        ive: '',
        imt: '',
        ivp: '',
        cit: ''
      }
    }
  });

  useEffect(() => {
    if (patient) {
      setFormData({
        ...patient,
        fechaNacimiento: patient.fechaNacimiento || '',
        cursoEscolar: patient.cursoEscolar || ''
      });
    }
  }, [patient]);

  const calculateAge = (birthDate) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const patientData = {
      ...formData,
      edad: calculateAge(formData.fechaNacimiento)
    };
    
    onSave(patientData);
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child, subChild] = field.split('.');
      if (subChild) {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [subChild]: value
            }
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const formatNumberInput = (value, maxDigits = 3) => {
    if (value === '') return '';
    const numValue = parseInt(value);
    if (isNaN(numValue)) return '';
    return Math.min(Math.max(0, numValue), Math.pow(10, maxDigits) - 1).toString();
  };

  // Organizar cursos por categoría para el desplegable
  const categorias = [...new Set(cursosEscolares.map(c => c.categoria))];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Personal */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Información Personal</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre completo *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              placeholder="APELLIDO1 APELLIDO2, NOMBRE"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
            <Input
              id="fechaNacimiento"
              type="date"
              value={formData.fechaNacimiento}
              onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Información Médica */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Información Médica</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="diagnostico">Diagnóstico *</Label>
            <select
              id="diagnostico"
              value={formData.diagnostico}
              onChange={(e) => handleInputChange('diagnostico', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar diagnóstico</option>
              {diagnosticos && diagnosticos.map((diag, index) => (
                <option key={index} value={diag}>{diag}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="estado">Estado *</Label>
            <select
              id="estado"
              value={formData.estado}
              onChange={(e) => handleInputChange('estado', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN_SEGUIMIENTO">En seguimiento</option>
              <option value="ALTA">Alta</option>
              <option value="DERIVADO">Derivado</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="derivacion">Derivación</Label>
          <Input
            id="derivacion"
            value={formData.derivacion}
            onChange={(e) => handleInputChange('derivacion', e.target.value)}
            placeholder="Ej: Pediatría, IBSMIA, etc."
          />
        </div>
      </div>

      {/* Información Educativa */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Información Educativa</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="centroEscolar">Centro Escolar</Label>
            <select
              id="centroEscolar"
              value={formData.centroEscolar}
              onChange={(e) => handleInputChange('centroEscolar', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar centro</option>
              {centrosNormalizados.map((centro, index) => (
                <option key={index} value={centro}>{centro}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cursoEscolar">Curso Escolar</Label>
            <select
              id="cursoEscolar"
              value={formData.cursoEscolar}
              onChange={(e) => handleInputChange('cursoEscolar', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar curso</option>
              {categorias.map(categoria => (
                <optgroup key={categoria} label={categoria}>
                  {cursosEscolares
                    .filter(curso => curso.categoria === categoria)
                    .map(curso => (
                      <option key={curso.value} value={curso.value}>
                        {curso.label}
                      </option>
                    ))
                  }
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="centroSalud">Centro de Salud</Label>
            <Input
              id="centroSalud"
              value={formData.centroSalud}
              onChange={(e) => handleInputChange('centroSalud', e.target.value)}
              placeholder="Ej: Hospital Son Espases"
            />
          </div>

          <div className="flex items-center space-x-2 pt-6">
            <input
              type="checkbox"
              id="protocoloEscolar"
              checked={formData.protocoloEscolar}
              onChange={(e) => handleInputChange('protocoloEscolar', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <Label htmlFor="protocoloEscolar">Protocolo Escolar</Label>
          </div>
        </div>
      </div>

      {/* Pruebas Médicas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Pruebas Médicas</h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nice">NICE</Label>
            <Input
              id="nice"
              type="number"
              value={formData.pruebas.nice}
              onChange={(e) => handleInputChange('pruebas.nice', formatNumberInput(e.target.value))}
              placeholder="000"
              maxLength="3"
              className="text-center"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amse">AMSE</Label>
            <Input
              id="amse"
              type="number"
              value={formData.pruebas.amse}
              onChange={(e) => handleInputChange('pruebas.amse', formatNumberInput(e.target.value))}
              placeholder="000"
              maxLength="3"
              className="text-center"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="scq">SCQ</Label>
            <Input
              id="scq"
              type="number"
              value={formData.pruebas.scq}
              onChange={(e) => handleInputChange('pruebas.scq', formatNumberInput(e.target.value))}
              placeholder="000"
              maxLength="3"
              className="text-center"
            />
          </div>
        </div>
        
        {/* WISC Sub-pruebas */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">WISC V</h4>
          <div className="grid grid-cols-5 gap-2">
            <div className="space-y-1">
              <Label htmlFor="icv" className="text-xs">ICV</Label>
              <Input
                id="icv"
                type="number"
                value={formData.pruebas.wisc.icv}
                onChange={(e) => handleInputChange('pruebas.wisc.icv', formatNumberInput(e.target.value))}
                placeholder="000"
                maxLength="3"
                className="text-center text-sm"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="ive" className="text-xs">IVE</Label>
              <Input
                id="ive"
                type="number"
                value={formData.pruebas.wisc.ive}
                onChange={(e) => handleInputChange('pruebas.wisc.ive', formatNumberInput(e.target.value))}
                placeholder="000"
                maxLength="3"
                className="text-center text-sm"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="imt" className="text-xs">IMT</Label>
              <Input
                id="imt"
                type="number"
                value={formData.pruebas.wisc.imt}
                onChange={(e) => handleInputChange('pruebas.wisc.imt', formatNumberInput(e.target.value))}
                placeholder="000"
                maxLength="3"
                className="text-center text-sm"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="ivp" className="text-xs">IVP</Label>
              <Input
                id="ivp"
                type="number"
                value={formData.pruebas.wisc.ivp}
                onChange={(e) => handleInputChange('pruebas.wisc.ivp', formatNumberInput(e.target.value))}
                placeholder="000"
                maxLength="3"
                className="text-center text-sm"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="cit" className="text-xs">CIT</Label>
              <Input
                id="cit"
                type="number"
                value={formData.pruebas.wisc.cit}
                onChange={(e) => handleInputChange('pruebas.wisc.cit', formatNumberInput(e.target.value))}
                placeholder="000"
                maxLength="3"
                className="text-center text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          {patient ? 'Actualizar Paciente' : 'Crear Paciente'}
        </Button>
      </div>
    </form>
  );
};

export default PatientForm;