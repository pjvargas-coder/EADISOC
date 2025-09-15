import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useToast } from '../hooks/use-toast';
import { mockPatients, estados, diagnosticos, centros } from '../data/mockPatients';
import { User, LogOut, Plus, Search, X, FileText, Users, Settings } from 'lucide-react';
import PatientForm from './PatientForm';
import PatientNotes from './PatientNotes';
import AdminPanel from './AdminPanel';
import UserManagement from './UserManagement';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [patients, setPatients] = useState(mockPatients);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isPatientFormOpen, setIsPatientFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [selectedPatientForNotes, setSelectedPatientForNotes] = useState(null);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Statistics
  const stats = useMemo(() => {
    const total = patients.length;
    const pendientes = patients.filter(p => p.estado === 'PENDIENTE').length;
    const enSeguimiento = patients.filter(p => p.estado === 'EN_SEGUIMIENTO').length;
    const alta = patients.filter(p => p.estado === 'ALTA').length;
    
    return { total, pendientes, enSeguimiento, alta };
  }, [patients]);

  // Filtered patients
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const matchesSearch = !searchTerm || 
        patient.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.caso.includes(searchTerm) ||
        patient.diagnostico.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.centro.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || patient.estado === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [patients, searchTerm, statusFilter]);

  // Event handlers
  const handleLogout = () => {
    logout();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
  };

  const handleAddPatient = () => {
    setEditingPatient(null);
    setIsPatientFormOpen(true);
  };

  const handleEditPatient = (patient) => {
    setEditingPatient(patient);
    setIsPatientFormOpen(true);
  };

  const handleSavePatient = (patientData) => {
    if (editingPatient) {
      // Update existing patient
      setPatients(prev => prev.map(p => 
        p.id === editingPatient.id 
          ? { ...patientData, id: editingPatient.id }
          : p
      ));
      toast({
        title: "Paciente actualizado",
        description: "Los datos del paciente se han actualizado correctamente",
      });
    } else {
      // Add new patient
      const newPatient = {
        ...patientData,
        id: Date.now().toString(),
        caso: Date.now().toString()
      };
      setPatients(prev => [...prev, newPatient]);
      toast({
        title: "Paciente añadido",
        description: "El paciente se ha añadido correctamente",
      });
    }
    setIsPatientFormOpen(false);
    setEditingPatient(null);
  };

  const handleDeletePatient = (patientId) => {
    setPatients(prev => prev.filter(p => p.id !== patientId));
    toast({
      title: "Paciente eliminado",
      description: "El paciente se ha eliminado correctamente",
      variant: "destructive"
    });
  };

  const handleViewNotes = (patient) => {
    setSelectedPatientForNotes(patient);
  };

  const handleUpdatePatientNotes = (patientId, notes) => {
    setPatients(prev => prev.map(p => 
      p.id === patientId 
        ? { ...p, notas: notes }
        : p
    ));
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setStatusFilter('');
  };

  const handleExportWord = () => {
    toast({
      title: "Exportando a Word",
      description: "Preparando documento según plantilla acta eadisoc A.docx...",
    });
  };

  const getStatusBadgeClass = (estado) => {
    const statusConfig = estados.find(e => e.value === estado);
    return statusConfig ? statusConfig.color : 'bg-gray-100 text-gray-800';
  };

  const formatDateEuropean = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-purple-700">
              Gestor de Pacientes EADISOC
            </h1>
            <div className="flex items-center space-x-4">
              {user.role === 'admin' && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsUserManagementOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Usuarios
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAdminPanelOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Admin
                  </Button>
                </>
              )}
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full">
                  <User className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">{user.name} ({user.role})</span>
              </div>
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de pacientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendientes}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En seguimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.enSeguimiento}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.alta}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar pacientes por nombre, caso, diagnóstico o centro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-48 p-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="">Todos los estados</option>
                {estados.map(estado => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </select>
              {(searchTerm || statusFilter) && (
                <Button 
                  variant="outline" 
                  onClick={handleClearSearch}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Limpiar
                </Button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleAddPatient} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Añadir Paciente
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExportWord}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Exportar a Word
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Patients List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Pacientes ({filteredPatients.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">CASO</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">NOMBRE</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">FECHA NAC.</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">EDAD</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">DIAGNÓSTICO</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">ESTADO</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">PROTOCOLO ESCOLAR</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{patient.caso}</td>
                      <td className="py-3 px-4">{patient.nombre}</td>
                      <td className="py-3 px-4">{formatDateEuropean(patient.fechaNacimiento)}</td>
                      <td className="py-3 px-4">{calculateAge(patient.fechaNacimiento)}</td>
                      <td className="py-3 px-4">{patient.diagnostico}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusBadgeClass(patient.estado)}>
                          {estados.find(e => e.value === patient.estado)?.label || patient.estado}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={patient.protocoloEscolar ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {patient.protocoloEscolar ? "Sí" : "No"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewNotes(patient)}
                          >
                            📝
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditPatient(patient)}
                          >
                            ✏️
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeletePatient(patient.id)}
                          >
                            🗑️
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredPatients.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No se encontraron pacientes con los criterios de búsqueda
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Dialogs */}
      <Dialog open={isPatientFormOpen} onOpenChange={setIsPatientFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPatient ? 'Editar Paciente' : 'Añadir Nuevo Paciente'}
            </DialogTitle>
          </DialogHeader>
          <PatientForm
            patient={editingPatient}
            onSave={handleSavePatient}
            onCancel={() => setIsPatientFormOpen(false)}
            diagnosticos={diagnosticos}
            centros={centros}
          />
        </DialogContent>
      </Dialog>

      {selectedPatientForNotes && (
        <PatientNotes
          patient={selectedPatientForNotes}
          onClose={() => setSelectedPatientForNotes(null)}
          onUpdateNotes={handleUpdatePatientNotes}
        />
      )}

      {user.role === 'admin' && (
        <>
          <Dialog open={isUserManagementOpen} onOpenChange={setIsUserManagementOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Gestión de Usuarios</DialogTitle>
              </DialogHeader>
              <UserManagement />
            </DialogContent>
          </Dialog>

          <Dialog open={isAdminPanelOpen} onOpenChange={setIsAdminPanelOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Panel de Administración</DialogTitle>
              </DialogHeader>
              <AdminPanel 
                diagnosticos={diagnosticos}
                centros={centros}
              />
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default Dashboard;