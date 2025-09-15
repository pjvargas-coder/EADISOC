import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useToast } from '../hooks/use-toast';
import { Plus, Edit, Save, X } from 'lucide-react';

const PatientNotes = ({ patient, onClose, onUpdateNotes }) => {
  const [notes, setNotes] = useState(patient.notas || []);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editNoteContent, setEditNoteContent] = useState('');
  const { toast } = useToast();

  const handleAddNote = () => {
    if (!newNoteContent.trim()) {
      toast({
        title: "Error",
        description: "El contenido de la nota no puede estar vacío",
        variant: "destructive"
      });
      return;
    }

    const newNote = {
      id: Date.now().toString(),
      fecha: new Date().toISOString().split('T')[0],
      contenido: newNoteContent.trim()
    };

    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    onUpdateNotes(patient.id, updatedNotes);
    setNewNoteContent('');
    setIsAddingNote(false);
    
    toast({
      title: "Nota añadida",
      description: "La nota se ha añadido correctamente",
    });
  };

  const handleEditNote = (noteId) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setEditNoteContent(note.contenido);
      setEditingNoteId(noteId);
    }
  };

  const handleSaveEdit = (noteId) => {
    if (!editNoteContent.trim()) {
      toast({
        title: "Error",
        description: "El contenido de la nota no puede estar vacío",
        variant: "destructive"
      });
      return;
    }

    const updatedNotes = notes.map(note => 
      note.id === noteId 
        ? { ...note, contenido: editNoteContent.trim() }
        : note
    );
    
    setNotes(updatedNotes);
    onUpdateNotes(patient.id, updatedNotes);
    setEditingNoteId(null);
    setEditNoteContent('');
    
    toast({
      title: "Nota actualizada",
      description: "La nota se ha actualizado correctamente",
    });
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditNoteContent('');
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMonthYear = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Notas de {patient.nombre}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-6">
          {/* Patient Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Paciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Caso:</span> {patient.caso}
                </div>
                <div>
                  <span className="font-semibold">Edad:</span> {patient.edad} años
                </div>
                <div>
                  <span className="font-semibold">Diagnóstico:</span> {patient.diagnostico}
                </div>
                <div>
                  <span className="font-semibold">Estado:</span> {patient.estado}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add New Note */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Añadir Nueva Nota</span>
                {!isAddingNote && (
                  <Button 
                    onClick={() => setIsAddingNote(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Nueva Nota
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            {isAddingNote && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-note">Contenido de la nota</Label>
                  <Textarea
                    id="new-note"
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Ej: Enero 2024: NRP: NICE 17, WISC V (2021): CV 84 VE 85 RF 79 MT 67 VP 83 CIT 76..."
                    rows={4}
                    className="resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddNote} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Guardar Nota
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsAddingNote(false);
                      setNewNoteContent('');
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Notes List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Historial de Notas ({notes.length})
            </h3>
            
            {notes.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8 text-gray-500">
                  No hay notas registradas para este paciente
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => (
                  <Card key={note.id} className="border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="space-y-1">
                        <CardTitle className="text-sm font-medium">
                          {formatDate(note.fecha)}
                        </CardTitle>
                        <p className="text-xs text-gray-500">
                          Creado el {formatDate(note.fecha)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditNote(note.id)}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {editingNoteId === note.id ? (
                        <div className="space-y-3">
                          <Textarea
                            value={editNoteContent}
                            onChange={(e) => setEditNoteContent(e.target.value)}
                            rows={4}
                            className="resize-none"
                          />
                          <div className="flex gap-2">
                            <Button 
                              size="sm"
                              onClick={() => handleSaveEdit(note.id)}
                              className="flex items-center gap-2"
                            >
                              <Save className="h-4 w-4" />
                              Guardar
                            </Button>
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                          {note.contenido}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatientNotes;