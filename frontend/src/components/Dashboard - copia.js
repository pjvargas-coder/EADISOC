import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useToast } from '../hooks/use-toast';
import { mockPatients, estados, diagnosticos, centros } from '../data/mockPatients';
import { patientService, configService, seedService, handleApiError } from '../services/api';
import { User, LogOut, Plus, Search, X, FileText, Users, Settings, RefreshCw, Database, Wifi, WifiOff, Lock, Unlock, AlertTriangle } from 'lucide-react';
import PatientForm from './PatientForm';
import PatientNotes from './PatientNotes';
import AdminPanel from './AdminPanel';
import UserManagement from './UserManagement';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isPatientFormOpen, setIsPatientFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [selectedPatientForNotes, setSelectedPatientForNotes] = useState(null);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [useBackend, setUseBackend] = useState(true);

  // Sistema de bloqueo de edición
  const [lockedPatients, setLockedPatients] = useState(new Map()); // patientId -> {userId, userName, timestamp}
  const [showLockAlert, setShowLockAlert] = useState(false);
  const [lockAlertMessage, setLockAlertMessage] = useState('');

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
        (patient.centro && patient.centro.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (patient.centroEscolar && patient.centroEscolar.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = !statusFilter || patient.estado === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [patients, searchTerm, statusFilter]);

  // Cargar pacientes al montar el componente
  useEffect(() => {
    loadPatients();
    // Simular carga inicial de datos mock
    setPatients(mockPatients);
    setIsLoading(false);
  }, [useBackend]);

  // Limpiar bloqueos expirados (5 minutos)
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      const newLockedPatients = new Map();
      
      lockedPatients.forEach((lockInfo, patientId) => {
        if (now - lockInfo.timestamp < 5 * 60 * 1000) { // 5 minutos
          newLockedPatients.set(patientId, lockInfo);
        }
      });
      
      if (newLockedPatients.size !== lockedPatients.size) {
        setLockedPatients(newLockedPatients);
      }
    }, 30000); // Revisar cada 30 segundos

    return () => clearInterval(cleanupInterval);
  }, [lockedPatients]);

  const loadPatients = async () => {
    setIsLoading(true);
    
    if (useBackend) {
      try {
        const response = await patientService.getAllPatients();
        setPatients(response.data);
        setIsConnected(true);
        
        if (response.data.length === 0) {
          toast({
            title: "Base de datos vacía",
            description: "¿Quieres cargar datos de prueba?",
            action: (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadSeedData}
              >
                Cargar datos
              </Button>
            ),
          });
        }
      } catch (error) {
        console.error('Error loading patients from API:', error);
        setIsConnected(false);
        
        toast({
          title: "Sin conexión al servidor",
          description: "Usando datos locales temporales",
          variant: "destructive",
        });
        setPatients(mockPatients);
        setUseBackend(false);
      }
    } else {
      setPatients(mockPatients);
      setIsConnected(false);
    }
    
    setIsLoading(false);
  };

  const loadSeedData = async () => {
    try {
      const response = await seedService.seedDatabase();
      toast({
        title: "Datos cargados",
        description: response.data.message,
      });
      await loadPatients();
    } catch (error) {
      toast({
        title: "Error",
        description: handleApiError(error, "Error al cargar datos de prueba"),
        variant: "destructive",
      });
    }
  };

  const toggleDataSource = () => {
    setUseBackend(!useBackend);
    toast({
      title: "Cambiando fuente de datos",
      description: useBackend ? "Usando datos locales" : "Conectando al servidor...",
    });
  };

  // Funciones del sistema de bloqueo
  const isPatientLocked = (patientId) => {
    const lockInfo = lockedPatients.get(patientId);
    if (!lockInfo) return false;
    
    // Verificar si el bloqueo ha expirado (5 minutos)
    const now = Date.now();
    if (now - lockInfo.timestamp > 5 * 60 * 1000) {
      // Bloqueo expirado, removerlo
      const newLockedPatients = new Map(lockedPatients);
      newLockedPatients.delete(patientId);
      setLockedPatients(newLockedPatients);
      return false;
    }
    
    return true;
  };

  const isPatientLockedByCurrentUser = (patientId) => {
    const lockInfo = lockedPatients.get(patientId);
    return lockInfo && lockInfo.userId === user.username;
  };

  const lockPatient = (patientId) => {
    const newLockedPatients = new Map(lockedPatients);
    newLockedPatients.set(patientId, {
      userId: user.username,
      userName: user.name,
      timestamp: Date.now()
    });
    setLockedPatients(newLockedPatients);
  };

  const unlockPatient = (patientId) => {
    const newLockedPatients = new Map(lockedPatients);
    newLockedPatients.delete(patientId);
    setLockedPatients(newLockedPatients);
  };

  const canUserEditPatient = (patientId) => {
    if (!isPatientLocked(patientId)) return true;
    return isPatientLockedByCurrentUser(patientId);
  };

  const getLockInfo = (patientId) => {
    return lockedPatients.get(patientId);
  };

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
    if (!canUserEditPatient(patient.id)) {
      const lockInfo = getLockInfo(patient.id);
      setLockAlertMessage(`Este paciente está siendo editado por ${lockInfo.userName}. Inténtalo más tarde.`);
      setShowLockAlert(true);
      return;
    }

    // Bloquear el paciente para edición
    lockPatient(patient.id);
    
    setEditingPatient(patient);
    setIsPatientFormOpen(true);
  };

  const handleTogglePatientLock = (patient) => {
    if (isPatientLockedByCurrentUser(patient.id)) {
      unlockPatient(patient.id);
      toast({
        title: "Paciente desbloqueado",
        description: `${patient.nombre} está disponible para edición`,
      });
    } else if (!isPatientLocked(patient.id)) {
      lockPatient(patient.id);
      toast({
        title: "Paciente bloqueado",
        description: `${patient.nombre} bloqueado para tu edición`,
      });
    } else {
      const lockInfo = getLockInfo(patient.id);
      setLockAlertMessage(`Este paciente está siendo editado por ${lockInfo.userName}.`);
      setShowLockAlert(true);
    }
  };

  const handleSavePatient = async (patientData) => {
    try {
      if (useBackend && isConnected) {
        if (editingPatient) {
          const response = await patientService.updatePatient(editingPatient.id, patientData);
          setPatients(prev => prev.map(p => 
            p.id === editingPatient.id ? response.data : p
          ));
          toast({
            title: "Paciente actualizado",
            description: "Los datos del paciente se han actualizado correctamente",
          });
        } else {
          const response = await patientService.createPatient(patientData);
          setPatients(prev => [response.data, ...prev]);
          toast({
            title: "Paciente creado",
            description: "El nuevo paciente se ha añadido correctamente",
          });
        }
      } else {
        if (editingPatient) {
          setPatients(prev => prev.map(p => 
            p.id === editingPatient.id 
              ? { ...patientData, id: editingPatient.id, caso: editingPatient.caso }
              : p
          ));
          toast({
            title: "Paciente actualizado",
            description: "Los datos del paciente se han actualizado correctamente (datos locales)",
          });
        } else {
          const newPatient = {
            ...patientData,
            id: Date.now().toString(),
            caso: Math.floor(Math.random() * 9000 + 1000).toString(),
          };
          setPatients(prev => [newPatient, ...prev]);
          toast({
            title: "Paciente creado",
            description: "El nuevo paciente se ha añadido correctamente (datos locales)",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: handleApiError(error, "Error al guardar paciente"),
        variant: "destructive",
      });
    }
    
    // Desbloquear paciente al terminar la edición
    if (editingPatient) {
      unlockPatient(editingPatient.id);
    }
    
    setIsPatientFormOpen(false);
    setEditingPatient(null);
  };

  const handleCancelPatientForm = () => {
    // Desbloquear paciente si se cancela la edición
    if (editingPatient) {
      unlockPatient(editingPatient.id);
    }
    
    setIsPatientFormOpen(false);
    setEditingPatient(null);
  };

  const handleDeletePatient = async (patientId) => {
    if (!canUserEditPatient(patientId)) {
      const lockInfo = getLockInfo(patientId);
      setLockAlertMessage(`Este paciente está siendo editado por ${lockInfo.userName}. No se puede eliminar.`);
      setShowLockAlert(true);
      return;
    }

    if (!window.confirm('¿Estás seguro de que quieres eliminar este paciente?')) {
      return;
    }

    try {
      if (useBackend && isConnected) {
        await patientService.deletePatient(patientId);
        setPatients(prev => prev.filter(p => p.id !== patientId));
        toast({
          title: "Paciente eliminado",
          description: "El paciente se ha eliminado correctamente",
        });
      } else {
        setPatients(prev => prev.filter(p => p.id !== patientId));
        toast({
          title: "Paciente eliminado",
          description: "El paciente se ha eliminado correctamente (datos locales)",
        });
      }
      
      // Limpiar bloqueo si existía
      unlockPatient(patientId);
    } catch (error) {
      toast({
        title: "Error",
        description: handleApiError(error, "Error al eliminar paciente"),
        variant: "destructive",
      });
    }
  };

  const handleUpdateNotes = async (patientId, updatedNotes) => {
    if (!canUserEditPatient(patientId)) {
      const lockInfo = getLockInfo(patientId);
      setLockAlertMessage(`Este paciente está siendo editado por ${lockInfo.userName}.`);
      setShowLockAlert(true);
      return;
    }

    try {
      if (useBackend && isConnected) {
        setPatients(prev => prev.map(p => 
          p.id === patientId 
            ? { ...p, notas: updatedNotes }
            : p
        ));
      } else {
        setPatients(prev => prev.map(p => 
          p.id === patientId 
            ? { ...p, notas: updatedNotes }
            : p
        ));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al actualizar notas",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
  };

  const exportData = () => {
    toast({
      title: "Exportando datos",
      description: "Funcionalidad de exportación en desarrollo",
    });
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'EN_SEGUIMIENTO':
        return 'bg-blue-100 text-blue-800';
      case 'ALTA':
        return 'bg-green-100 text-green-800';
      case 'DERIVADO':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (estado) => {
    const statusMap = {
      'PENDIENTE': 'Pendiente',
      'EN_SEGUIMIENTO': 'En seguimiento',
      'ALTA': 'Alta',
      'DERIVADO': 'Derivado'
    };
    return statusMap[estado] || estado;
  };

  const getLockButtonStyle = (patient) => {
    if (isPatientLockedByCurrentUser(patient.id)) {
      return 'text-green-600 hover:text-green-800';
    } else if (isPatientLocked(patient.id)) {
      return 'text-red-600 hover:text-red-800';
    } else {
      return 'text-gray-400 hover:text-gray-600';
    }
  };

  const getLockIcon = (patient) => {
    if (isPatientLockedByCurrentUser(patient.id)) {
      return <Unlock className="h-4 w-4" />;
    } else {
      return <Lock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">EADISOC</h1>
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <div className="flex items-center text-green-600">
                    <Wifi className="h-4 w-4 mr-1" />
                    <span className="text-sm">Conectado</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <WifiOff className="h-4 w-4 mr-1" />
                    <span className="text-sm">Sin conexión</span>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleDataSource}
                  className="text-xs"
                >
                  {useBackend ? 'API' : 'Local'}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Bienvenido, <strong>{user.name}</strong>
              </span>
              
              {user.role === 'admin' && (
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsUserManagementOpen(true)}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Usuarios
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAdminPanelOpen(true)}
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Admin
                  </Button>
                </div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={loadPatients}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Actualizar
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-1" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pacientes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <User className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendientes}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En Seguimiento</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.enSeguimiento}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Alta</p>
                  <p className="text-2xl font-bold text-green-600">{stats.alta}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, caso, diagnóstico, centro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="PENDIENTE">Pendientes</option>
                <option value="EN_SEGUIMIENTO">En seguimiento</option>
                <option value="ALTA">Alta</option>
                <option value="DERIVADO">Derivado</option>
              </select>
              
              {(searchTerm || statusFilter) && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              {useBackend && isConnected && (
                <Button variant="outline" size="sm" onClick={loadSeedData}>
                  <Database className="h-4 w-4 mr-1" />
                  Datos prueba
                </Button>
              )}
              
              <Button variant="outline" size="sm" onClick={exportData}>
                <FileText className="h-4 w-4 mr-1" />
                Exportar
              </Button>
              
              <Button onClick={handleAddPatient}>
                <Plus className="h-4 w-4 mr-1" />
                Nuevo Paciente
              </Button>
            </div>
          </div>
        </div>

        {/* Patients Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Lista de Pacientes ({filteredPatients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Caso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Edad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diagnóstico
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Centro
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium">No hay pacientes</p>
                          <p className="text-sm">
                            {searchTerm || statusFilter 
                              ? 'No se encontraron pacientes con los filtros aplicados' 
                              : 'Añade el primer paciente para comenzar'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTogglePatientLock(patient)}
                            className={getLockButtonStyle(patient)}
                            title={
                              isPatientLockedByCurrentUser(patient.id) 
                                ? 'Desbloqueado para tu edición - Click para desbloquear' 
                                : isPatientLocked(patient.id)
                                ? `Bloqueado por ${getLockInfo(patient.id)?.userName} - Click para ver detalles`
                                : 'Disponible para edición - Click para bloquear'
                            }
                          >
                            {getLockIcon(patient)}
                          </Button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {patient.caso}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.nombre}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {patient.edad} años
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {patient.diagnostico}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(patient.estado)}>
                            {getStatusLabel(patient.estado)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {patient.centroEscolar || patient.centro || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedPatientForNotes(patient)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditPatient(patient)}
                              disabled={isPatientLocked(patient.id) && !isPatientLockedByCurrentUser(patient.id)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePatient(patient.id)}
                              className="text-red-600 hover:text-red-900"
                              disabled={isPatientLocked(patient.id) && !isPatientLockedByCurrentUser(patient.id)}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Alert Dialog para bloqueos */}
      {showLockAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-500 mr-3" />
              <h3 className="text-lg font-semibold">Paciente Bloqueado</h3>
            </div>
            <p className="text-gray-700 mb-6">{lockAlertMessage}</p>
            <div className="flex justify-end">
              <Button onClick={() => setShowLockAlert(false)}>
                Entendido
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
      {isPatientFormOpen && (
        <Dialog open={isPatientFormOpen} onOpenChange={handleCancelPatientForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPatient ? 'Editar Paciente' : 'Nuevo Paciente'}
              </DialogTitle>
            </DialogHeader>
            <PatientForm
              patient={editingPatient}
              onSave={handleSavePatient}
              onCancel={handleCancelPatientForm}
              diagnosticos={diagnosticos}
              centros={centros}
            />
          </DialogContent>
        </Dialog>
      )}

      {selectedPatientForNotes && (
        <PatientNotes
          patient={selectedPatientForNotes}
          onClose={() => setSelectedPatientForNotes(null)}
          onUpdateNotes={handleUpdateNotes}
        />
      )}

      {isUserManagementOpen && (
        <Dialog open={isUserManagementOpen} onOpenChange={setIsUserManagementOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gestión de Usuarios</DialogTitle>
            </DialogHeader>
            <UserManagement />
          </DialogContent>
        </Dialog>
      )}

      {isAdminPanelOpen && (
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
      )}
    </div>
  );
};

export default Dashboard;