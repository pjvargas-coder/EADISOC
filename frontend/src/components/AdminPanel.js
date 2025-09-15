import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '../hooks/use-toast';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';

const AdminPanel = ({ diagnosticos: initialDiagnosticos, centros: initialCentros }) => {
  const [diagnosticos, setDiagnosticos] = useState(initialDiagnosticos || []);
  
  const [centrosEscolares, setCentrosEscolares] = useState(() => {
    if (Array.isArray(initialCentros)) {
      if (initialCentros.length > 0 && typeof initialCentros[0] === 'object') {
        return initialCentros.filter(c => c.tipo === 'escolar').map(c => c.nombre || c);
      }
      return initialCentros.slice();
    }
    return [
      'IES Joan Maria Thomas', 
      'CEIP Teringa', 
      'CEIP San Miguel', 
      'IES Es Quartó', 
      'CEIP Sa Graduada', 
      'IES Balàfia', 
      'CEIP Es Molinar'
    ];
  });

  const [centrosSalud, setCentrosSalud] = useState(() => {
    if (Array.isArray(initialCentros)) {
      if (initialCentros.length > 0 && typeof initialCentros[0] === 'object') {
        return initialCentros.filter(c => c.tipo === 'salud').map(c => c.nombre || c);
      }
      return [];
    }
    return [
      'Hospital Son Espases',
      'Hospital Son Llàtzer', 
      'IBSMIA',
      'Centro de Salud Manacor',
      'Hospital Mateu Orfila'
    ];
  });

  const [estados, setEstados] = useState([
    { value: "PENDIENTE", label: "Pendiente" },
    { value: "EN_SEGUIMIENTO", label: "En seguimiento" },
    { value: "ALTA", label: "Alta" },
    { value: "DERIVADO", label: "Derivado" }
  ]);

  const [cursosEscolares, setCursosEscolares] = useState([
    { value: "EI_3", label: "Educación Infantil 3 años", categoria: "Educación Infantil" },
    { value: "EI_4", label: "Educación Infantil 4 años", categoria: "Educación Infantil" },
    { value: "EI_5", label: "Educación Infantil 5 años", categoria: "Educación Infantil" },
    { value: "EP_1", label: "1º Primaria", categoria: "Educación Primaria" },
    { value: "EP_2", label: "2º Primaria", categoria: "Educación Primaria" },
    { value: "EP_3", label: "3º Primaria", categoria: "Educación Primaria" },
    { value: "EP_4", label: "4º Primaria", categoria: "Educación Primaria" },
    { value: "EP_5", label: "5º Primaria", categoria: "Educación Primaria" },
    { value: "EP_6", label: "6º Primaria", categoria: "Educación Primaria" },
    { value: "ESO_1", label: "1º ESO", categoria: "Educación Secundaria" },
    { value: "ESO_2", label: "2º ESO", categoria: "Educación Secundaria" },
    { value: "ESO_3", label: "3º ESO", categoria: "Educación Secundaria" },
    { value: "ESO_4", label: "4º ESO", categoria: "Educación Secundaria" },
    { value: "BACH_1", label: "1º Bachillerato", categoria: "Bachillerato" },
    { value: "BACH_2", label: "2º Bachillerato", categoria: "Bachillerato" },
    { value: "FP_BASICA_1", label: "1º FP Básica", categoria: "Formación Profesional" },
    { value: "FP_BASICA_2", label: "2º FP Básica", categoria: "Formación Profesional" },
    { value: "FP_GRADO_MEDIO_1", label: "1º FP Grado Medio", categoria: "Formación Profesional" },
    { value: "FP_GRADO_MEDIO_2", label: "2º FP Grado Medio", categoria: "Formación Profesional" },
    { value: "FP_GRADO_SUPERIOR_1", label: "1º FP Grado Superior", categoria: "Formación Profesional" },
    { value: "FP_GRADO_SUPERIOR_2", label: "2º FP Grado Superior", categoria: "Formación Profesional" },
    { value: "UNIVERSIDAD", label: "Universidad", categoria: "Educación Superior" },
    { value: "NO_ESCOLARIZADO", label: "No escolarizado", categoria: "Otros" },
    { value: "EDUCACION_ESPECIAL", label: "Educación Especial", categoria: "Otros" }
  ]);
  
  const [newDiagnostico, setNewDiagnostico] = useState('');
  const [newCentroEscolar, setNewCentroEscolar] = useState('');
  const [newCentroSalud, setNewCentroSalud] = useState('');
  const [newEstadoValue, setNewEstadoValue] = useState('');
  const [newEstadoLabel, setNewEstadoLabel] = useState('');
  const [newCursoValue, setNewCursoValue] = useState('');
  const [newCursoLabel, setNewCursoLabel] = useState('');
  const [newCursoCategoria, setNewCursoCategoria] = useState('');

  const [editingDiagnostico, setEditingDiagnostico] = useState(null);
  const [editingCentroEscolar, setEditingCentroEscolar] = useState(null);
  const [editingCentroSalud, setEditingCentroSalud] = useState(null);
  const [editingEstado, setEditingEstado] = useState(null);
  const [editingCurso, setEditingCurso] = useState(null);
  
  const { toast } = useToast();

  // Funciones para Diagnósticos
  const handleAddDiagnostico = () => {
    if (!newDiagnostico.trim()) {
      toast({ title: "Error", description: "El diagnóstico no puede estar vacío", variant: "destructive" });
      return;
    }
    if (diagnosticos.includes(newDiagnostico.trim())) {
      toast({ title: "Error", description: "Este diagnóstico ya existe", variant: "destructive" });
      return;
    }
    setDiagnosticos(prev => [...prev, newDiagnostico.trim()]);
    setNewDiagnostico('');
    toast({ title: "Diagnóstico añadido", description: "El diagnóstico se ha añadido correctamente" });
  };

  const handleEditDiagnostico = (index, oldValue) => {
    setEditingDiagnostico({ index, value: oldValue });
  };

  const handleSaveDiagnostico = () => {
    if (!editingDiagnostico.value.trim()) {
      toast({ title: "Error", description: "El diagnóstico no puede estar vacío", variant: "destructive" });
      return;
    }
    setDiagnosticos(prev => prev.map((diag, index) => 
      index === editingDiagnostico.index ? editingDiagnostico.value.trim() : diag
    ));
    setEditingDiagnostico(null);
    toast({ title: "Diagnóstico actualizado", description: "El diagnóstico se ha actualizado correctamente" });
  };

  const handleDeleteDiagnostico = (diagnostico) => {
    setDiagnosticos(prev => prev.filter(d => d !== diagnostico));
    toast({ title: "Diagnóstico eliminado", description: "El diagnóstico se ha eliminado correctamente", variant: "destructive" });
  };

  // Funciones para Estados
  const handleAddEstado = () => {
    if (!newEstadoValue.trim() || !newEstadoLabel.trim()) {
      toast({ title: "Error", description: "Valor y etiqueta son obligatorios", variant: "destructive" });
      return;
    }
    if (estados.some(e => e.value === newEstadoValue.trim())) {
      toast({ title: "Error", description: "Este estado ya existe", variant: "destructive" });
      return;
    }
    setEstados(prev => [...prev, { value: newEstadoValue.trim().toUpperCase(), label: newEstadoLabel.trim() }]);
    setNewEstadoValue('');
    setNewEstadoLabel('');
    toast({ title: "Estado añadido", description: "El estado se ha añadido correctamente" });
  };

  const handleEditEstado = (index, estado) => {
    setEditingEstado({ index, value: estado.value, label: estado.label });
  };

  const handleSaveEstado = () => {
    if (!editingEstado.value.trim() || !editingEstado.label.trim()) {
      toast({ title: "Error", description: "Valor y etiqueta son obligatorios", variant: "destructive" });
      return;
    }
    setEstados(prev => prev.map((estado, index) => 
      index === editingEstado.index 
        ? { value: editingEstado.value.trim().toUpperCase(), label: editingEstado.label.trim() }
        : estado
    ));
    setEditingEstado(null);
    toast({ title: "Estado actualizado", description: "El estado se ha actualizado correctamente" });
  };

  const handleDeleteEstado = (estadoValue) => {
    setEstados(prev => prev.filter(e => e.value !== estadoValue));
    toast({ title: "Estado eliminado", description: "El estado se ha eliminado correctamente", variant: "destructive" });
  };

  // Funciones para Centros Escolares
  const handleAddCentroEscolar = () => {
    if (!newCentroEscolar.trim()) {
      toast({ title: "Error", description: "El centro no puede estar vacío", variant: "destructive" });
      return;
    }
    if (centrosEscolares.includes(newCentroEscolar.trim())) {
      toast({ title: "Error", description: "Este centro ya existe", variant: "destructive" });
      return;
    }
    setCentrosEscolares(prev => [...prev, newCentroEscolar.trim()]);
    setNewCentroEscolar('');
    toast({ title: "Centro añadido", description: "El centro se ha añadido correctamente" });
  };

  const handleEditCentroEscolar = (index, oldValue) => {
    setEditingCentroEscolar({ index, value: oldValue });
  };

  const handleSaveCentroEscolar = () => {
    if (!editingCentroEscolar.value.trim()) {
      toast({ title: "Error", description: "El centro no puede estar vacío", variant: "destructive" });
      return;
    }
    setCentrosEscolares(prev => prev.map((centro, index) => 
      index === editingCentroEscolar.index ? editingCentroEscolar.value.trim() : centro
    ));
    setEditingCentroEscolar(null);
    toast({ title: "Centro actualizado", description: "El centro se ha actualizado correctamente" });
  };

  const handleDeleteCentroEscolar = (centro) => {
    setCentrosEscolares(prev => prev.filter(c => c !== centro));
    toast({ title: "Centro eliminado", description: "El centro se ha eliminado correctamente", variant: "destructive" });
  };

  // Funciones para Centros de Salud
  const handleAddCentroSalud = () => {
    if (!newCentroSalud.trim()) {
      toast({ title: "Error", description: "El centro no puede estar vacío", variant: "destructive" });
      return;
    }
    if (centrosSalud.includes(newCentroSalud.trim())) {
      toast({ title: "Error", description: "Este centro ya existe", variant: "destructive" });
      return;
    }
    setCentrosSalud(prev => [...prev, newCentroSalud.trim()]);
    setNewCentroSalud('');
    toast({ title: "Centro añadido", description: "El centro se ha añadido correctamente" });
  };

  const handleEditCentroSalud = (index, oldValue) => {
    setEditingCentroSalud({ index, value: oldValue });
  };

  const handleSaveCentroSalud = () => {
    if (!editingCentroSalud.value.trim()) {
      toast({ title: "Error", description: "El centro no puede estar vacío", variant: "destructive" });
      return;
    }
    setCentrosSalud(prev => prev.map((centro, index) => 
      index === editingCentroSalud.index ? editingCentroSalud.value.trim() : centro
    ));
    setEditingCentroSalud(null);
    toast({ title: "Centro actualizado", description: "El centro se ha actualizado correctamente" });
  };

  const handleDeleteCentroSalud = (centro) => {
    setCentrosSalud(prev => prev.filter(c => c !== centro));
    toast({ title: "Centro eliminado", description: "El centro se ha eliminado correctamente", variant: "destructive" });
  };

  // Funciones para Cursos Escolares
  const handleAddCurso = () => {
    if (!newCursoValue.trim() || !newCursoLabel.trim() || !newCursoCategoria.trim()) {
      toast({ title: "Error", description: "Todos los campos son obligatorios", variant: "destructive" });
      return;
    }
    if (cursosEscolares.some(c => c.value === newCursoValue.trim())) {
      toast({ title: "Error", description: "Este curso ya existe", variant: "destructive" });
      return;
    }
    setCursosEscolares(prev => [...prev, { 
      value: newCursoValue.trim().toUpperCase(), 
      label: newCursoLabel.trim(),
      categoria: newCursoCategoria.trim()
    }]);
    setNewCursoValue('');
    setNewCursoLabel('');
    setNewCursoCategoria('');
    toast({ title: "Curso añadido", description: "El curso se ha añadido correctamente" });
  };

  const handleEditCurso = (index, curso) => {
    setEditingCurso({ index, value: curso.value, label: curso.label, categoria: curso.categoria });
  };

  const handleSaveCurso = () => {
    if (!editingCurso.value.trim() || !editingCurso.label.trim() || !editingCurso.categoria.trim()) {
      toast({ title: "Error", description: "Todos los campos son obligatorios", variant: "destructive" });
      return;
    }
    setCursosEscolares(prev => prev.map((curso, index) => 
      index === editingCurso.index 
        ? { 
            value: editingCurso.value.trim().toUpperCase(), 
            label: editingCurso.label.trim(),
            categoria: editingCurso.categoria.trim()
          }
        : curso
    ));
    setEditingCurso(null);
    toast({ title: "Curso actualizado", description: "El curso se ha actualizado correctamente" });
  };

  const handleDeleteCurso = (cursoValue) => {
    setCursosEscolares(prev => prev.filter(c => c.value !== cursoValue));
    toast({ title: "Curso eliminado", description: "El curso se ha eliminado correctamente", variant: "destructive" });
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Panel de Administración</h2>
        <p className="text-gray-600">Gestionar desplegables del sistema</p>
      </div>

      <Tabs defaultValue="diagnosticos" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="diagnosticos">Diagnósticos</TabsTrigger>
          <TabsTrigger value="estados">Estados</TabsTrigger>
          <TabsTrigger value="centros-escolares">Centros Escolares</TabsTrigger>
          <TabsTrigger value="centros-salud">Centros Salud</TabsTrigger>
          <TabsTrigger value="cursos-escolares">Cursos Escolares</TabsTrigger>
        </TabsList>

        <div className="min-h-[600px] max-h-[600px] overflow-y-auto">
          
          <TabsContent value="diagnosticos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Añadir Nuevo Diagnóstico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Ej: TEA grado 4"
                    value={newDiagnostico}
                    onChange={(e) => setNewDiagnostico(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleAddDiagnostico}>
                    Añadir Diagnóstico
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Diagnósticos del Sistema ({diagnosticos.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {diagnosticos.map((diagnostico, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      {editingDiagnostico && editingDiagnostico.index === index ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={editingDiagnostico.value}
                            onChange={(e) => setEditingDiagnostico({...editingDiagnostico, value: e.target.value})}
                            className="flex-1"
                          />
                          <Button size="sm" onClick={handleSaveDiagnostico}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingDiagnostico(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="font-medium">{diagnostico}</span>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditDiagnostico(index, diagnostico)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteDiagnostico(diagnostico)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estados" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Añadir Nuevo Estado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="estadoValue">Valor</Label>
                    <Input
                      id="estadoValue"
                      placeholder="Ej: REVISION"
                      value={newEstadoValue}
                      onChange={(e) => setNewEstadoValue(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="estadoLabel">Etiqueta</Label>
                    <Input
                      id="estadoLabel"
                      placeholder="Ej: En revisión"
                      value={newEstadoLabel}
                      onChange={(e) => setNewEstadoLabel(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={handleAddEstado} className="w-full">
                  Añadir Estado
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estados del Sistema ({estados.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {estados.map((estado, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      {editingEstado && editingEstado.index === index ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            placeholder="Valor"
                            value={editingEstado.value}
                            onChange={(e) => setEditingEstado({...editingEstado, value: e.target.value})}
                            className="flex-1"
                          />
                          <Input
                            placeholder="Etiqueta"
                            value={editingEstado.label}
                            onChange={(e) => setEditingEstado({...editingEstado, label: e.target.value})}
                            className="flex-1"
                          />
                          <Button size="sm" onClick={handleSaveEstado}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingEstado(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div>
                            <span className="font-medium">{estado.label}</span>
                            <span className="text-gray-500 ml-2">({estado.value})</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditEstado(index, estado)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteEstado(estado.value)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="centros-escolares" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Añadir Nuevo Centro Escolar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Ej: CEIP Nuevo Centro"
                    value={newCentroEscolar}
                    onChange={(e) => setNewCentroEscolar(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleAddCentroEscolar}>
                    Añadir Centro
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Centros Escolares ({centrosEscolares.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {centrosEscolares.map((centro, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      {editingCentroEscolar && editingCentroEscolar.index === index ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={editingCentroEscolar.value}
                            onChange={(e) => setEditingCentroEscolar({...editingCentroEscolar, value: e.target.value})}
                            className="flex-1"
                          />
                          <Button size="sm" onClick={handleSaveCentroEscolar}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingCentroEscolar(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="font-medium">{centro}</span>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCentroEscolar(index, centro)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCentroEscolar(centro)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="centros-salud" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Añadir Nuevo Centro de Salud
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Ej: Hospital Son Llàtzer"
                    value={newCentroSalud}
                    onChange={(e) => setNewCentroSalud(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleAddCentroSalud}>
                    Añadir Centro
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Centros de Salud ({centrosSalud.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {centrosSalud.map((centro, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      {editingCentroSalud && editingCentroSalud.index === index ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={editingCentroSalud.value}
                            onChange={(e) => setEditingCentroSalud({...editingCentroSalud, value: e.target.value})}
                            className="flex-1"
                          />
                          <Button size="sm" onClick={handleSaveCentroSalud}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingCentroSalud(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="font-medium">{centro}</span>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCentroSalud(index, centro)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCentroSalud(centro)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cursos-escolares" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Añadir Nuevo Curso Escolar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cursoValue">Código</Label>
                    <Input
                      id="cursoValue"
                      placeholder="Ej: EP_7"
                      value={newCursoValue}
                      onChange={(e) => setNewCursoValue(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cursoLabel">Nombre del Curso</Label>
                    <Input
                      id="cursoLabel"
                      placeholder="Ej: 7º Primaria"
                      value={newCursoLabel}
                      onChange={(e) => setNewCursoLabel(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cursoCategoria">Categoría</Label>
                    <select
                      id="cursoCategoria"
                      value={newCursoCategoria}
                      onChange={(e) => setNewCursoCategoria(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar categoría</option>
                      <option value="Educación Infantil">Educación Infantil</option>
                      <option value="Educación Primaria">Educación Primaria</option>
                      <option value="Educación Secundaria">Educación Secundaria</option>
                      <option value="Bachillerato">Bachillerato</option>
                      <option value="Formación Profesional">Formación Profesional</option>
                      <option value="Educación Superior">Educación Superior</option>
                      <option value="Otros">Otros</option>
                    </select>
                  </div>
                </div>
                <Button onClick={handleAddCurso} className="w-full">
                  Añadir Curso
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cursos Escolares ({cursosEscolares.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Educación Infantil', 'Educación Primaria', 'Educación Secundaria', 'Bachillerato', 'Formación Profesional', 'Educación Superior', 'Otros'].map(categoria => {
                    const cursosDeCategoria = cursosEscolares.filter(c => c.categoria === categoria);
                    if (cursosDeCategoria.length === 0) return null;
                    
                    return (
                      <div key={categoria} className="space-y-2">
                        <h4 className="font-semibold text-gray-700 border-b pb-1">{categoria}</h4>
                        {cursosDeCategoria.map((curso, index) => {
                          const globalIndex = cursosEscolares.findIndex(c => c.value === curso.value);
                          return (
                            <div key={curso.value} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg ml-4">
                              {editingCurso && editingCurso.index === globalIndex ? (
                                <div className="flex items-center gap-2 flex-1">
                                  <Input
                                    placeholder="Código"
                                    value={editingCurso.value}
                                    onChange={(e) => setEditingCurso({...editingCurso, value: e.target.value})}
                                    className="flex-1"
                                  />
                                  <Input
                                    placeholder="Nombre"
                                    value={editingCurso.label}
                                    onChange={(e) => setEditingCurso({...editingCurso, label: e.target.value})}
                                    className="flex-1"
                                  />
                                  <select
                                    value={editingCurso.categoria}
                                    onChange={(e) => setEditingCurso({...editingCurso, categoria: e.target.value})}
                                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                                  >
                                    <option value="Educación Infantil">Educación Infantil</option>
                                    <option value="Educación Primaria">Educación Primaria</option>
                                    <option value="Educación Secundaria">Educación Secundaria</option>
                                    <option value="Bachillerato">Bachillerato</option>
                                    <option value="Formación Profesional">Formación Profesional</option>
                                    <option value="Educación Superior">Educación Superior</option>
                                    <option value="Otros">Otros</option>
                                  </select>
                                  <Button size="sm" onClick={handleSaveCurso}>
                                    <Save className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => setEditingCurso(null)}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <div>
                                    <span className="font-medium">{curso.label}</span>
                                    <span className="text-gray-500 ml-2">({curso.value})</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditCurso(globalIndex, curso)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteCurso(curso.value)}
                                      className="text-red-600 hover:text-red-900"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </div>
      </Tabs>
    </div>
  );
};

export default AdminPanel;