import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';
import { Plus, Trash2, Edit, Save, X, Users, Shield, User } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([
    { id: '1', username: 'admin', role: 'admin', name: 'Administrador', active: true },
    { id: '2', username: 'usuario1', role: 'user', name: 'Usuario 1', active: true },
    { id: '3', username: 'usuario2', role: 'user', name: 'Usuario 2', active: true },
    { id: '4', username: 'usuario3', role: 'user', name: 'Usuario 3', active: true },
    { id: '5', username: 'usuario4', role: 'user', name: 'Usuario 4', active: false }
  ]);

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    role: 'user',
    password: '',
    active: true
  });

  const { toast } = useToast();

  const handleAddUser = () => {
    setFormData({
      username: '',
      name: '',
      role: 'user',
      password: '',
      active: true
    });
    setIsAddingUser(true);
  };

  const handleEditUser = (user) => {
    setFormData({
      username: user.username,
      name: user.name,
      role: user.role,
      password: '',
      active: user.active
    });
    setEditingUserId(user.id);
  };

  const handleSaveUser = () => {
    if (!formData.username.trim() || !formData.name.trim()) {
      toast({
        title: "Error",
        description: "Usuario y nombre son obligatorios",
        variant: "destructive"
      });
      return;
    }

    if (isAddingUser && !formData.password.trim()) {
      toast({
        title: "Error",
        description: "La contraseña es obligatoria para usuarios nuevos",
        variant: "destructive"
      });
      return;
    }

    // Check if username exists (only for new users or when changing username)
    const existingUser = users.find(u => 
      u.username === formData.username && 
      (isAddingUser || u.id !== editingUserId)
    );

    if (existingUser) {
      toast({
        title: "Error",
        description: "Este nombre de usuario ya existe",
        variant: "destructive"
      });
      return;
    }

    if (isAddingUser) {
      const newUser = {
        id: Date.now().toString(),
        username: formData.username.trim(),
        name: formData.name.trim(),
        role: formData.role,
        active: formData.active
      };
      
      setUsers(prev => [...prev, newUser]);
      toast({
        title: "Usuario añadido",
        description: "El usuario se ha añadido correctamente",
      });
    } else {
      setUsers(prev => prev.map(user => 
        user.id === editingUserId 
          ? {
              ...user,
              username: formData.username.trim(),
              name: formData.name.trim(),
              role: formData.role,
              active: formData.active
            }
          : user
      ));
      toast({
        title: "Usuario actualizado",
        description: "El usuario se ha actualizado correctamente",
      });
    }

    handleCancelEdit();
  };

  const handleDeleteUser = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user && user.username === 'admin') {
      toast({
        title: "Error",
        description: "No se puede eliminar el usuario administrador",
        variant: "destructive"
      });
      return;
    }

    setUsers(prev => prev.filter(user => user.id !== userId));
    toast({
      title: "Usuario eliminado",
      description: "El usuario se ha eliminado correctamente",
      variant: "destructive"
    });
  };

  const handleCancelEdit = () => {
    setIsAddingUser(false);
    setEditingUserId(null);
    setFormData({
      username: '',
      name: '',
      role: 'user',
      password: '',
      active: true
    });
  };

  const toggleUserStatus = (userId) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, active: !user.active }
        : user
    ));
    
    const user = users.find(u => u.id === userId);
    toast({
      title: user?.active ? "Usuario desactivado" : "Usuario activado",
      description: `${user?.name} ha sido ${user?.active ? 'desactivado' : 'activado'}`,
    });
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      default:
        return 'Usuario';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
        <p className="text-gray-600 mt-2">Administrar usuarios del sistema</p>
      </div>

      {/* Add/Edit User Form */}
      {(isAddingUser || editingUserId) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isAddingUser ? (
                <>
                  <Plus className="h-5 w-5" />
                  Añadir Nuevo Usuario
                </>
              ) : (
                <>
                  <Edit className="h-5 w-5" />
                  Editar Usuario
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de usuario</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))}
                  placeholder="usuario123"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  placeholder="Juan Pérez"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <select 
                  id="role"
                  value={formData.role || "user"} 
                  onChange={(e) => setFormData(prev => ({...prev, role: e.target.value}))}
                  className="w-full p-2 border border-gray-300 rounded-md bg-white"
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">
                  {isAddingUser ? 'Contraseña' : 'Nueva contraseña (opcional)'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                  placeholder={isAddingUser ? "Contraseña" : "Dejar vacío para no cambiar"}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData(prev => ({...prev, active: e.target.checked}))}
                className="rounded"
              />
              <Label htmlFor="active">Usuario activo</Label>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleSaveUser} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isAddingUser ? 'Crear Usuario' : 'Actualizar Usuario'}
              </Button>
              <Button variant="outline" onClick={handleCancelEdit}>
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add User Button */}
      {!isAddingUser && !editingUserId && (
        <div className="flex justify-end">
          <Button onClick={handleAddUser} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Añadir Usuario
          </Button>
        </div>
      )}

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Sistema ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-purple-100 text-purple-600 rounded-full">
                    {getRoleIcon(user.role)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{user.name}</span>
                      <Badge className={getRoleBadgeClass(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                      <Badge 
                        variant={user.active ? "default" : "secondary"}
                        className={user.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      >
                        {user.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">@{user.username}</div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => toggleUserStatus(user.id)}
                  >
                    {user.active ? "Desactivar" : "Activar"}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEditUser(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {user.username !== 'admin' && (
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;