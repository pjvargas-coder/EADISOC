import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '../hooks/use-toast';

const PatientTests = ({ patient, onClose, onSave }) => {
  const { toast } = useToast();
  const [testData, setTestData] = useState({
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
  });

  useEffect(() => {
    if (patient && patient.pruebas) {
      setTestData(patient.pruebas);
    }
  }, [patient]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setTestData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setTestData(prev => ({
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

  const handleSave = () => {
    onSave(testData);
    toast({
      title: "Pruebas guardadas",
      description: "Los datos de las pruebas se han guardado correctamente",
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pruebas de {patient.nombre}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-6">
          {/* Pruebas Generales */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Pruebas Generales</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nice" className="text-sm">NICE</Label>
                <Input
                  id="nice"
                  type="number"
                  value={testData.nice}
                  onChange={(e) => handleInputChange('nice', formatNumberInput(e.target.value))}
                  placeholder="000"
                  maxLength="3"
                  className="text-center"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amse" className="text-sm">AMSE</Label>
                <Input
                  id="amse"
                  type="number"
                  value={testData.amse}
                  onChange={(e) => handleInputChange('amse', formatNumberInput(e.target.value))}
                  placeholder="000"
                  maxLength="3"
                  className="text-center"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="scq" className="text-sm">SCQ</Label>
                <Input
                  id="scq"
                  type="number"
                  value={testData.scq}
                  onChange={(e) => handleInputChange('scq', formatNumberInput(e.target.value))}
                  placeholder="000"
                  maxLength="3"
                  className="text-center"
                />
              </div>
            </div>
          </div>

          {/* WISC Scores */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">WISC</h3>
            <div className="grid grid-cols-5 gap-3">
              <div className="space-y-2">
                <Label htmlFor="icv" className="text-xs text-center block">ICV</Label>
                <Input
                  id="icv"
                  type="number"
                  value={testData.wisc.icv}
                  onChange={(e) => handleInputChange('wisc.icv', formatNumberInput(e.target.value))}
                  placeholder="000"
                  maxLength="3"
                  className="text-center text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ive" className="text-xs text-center block">IVE</Label>
                <Input
                  id="ive"
                  type="number"
                  value={testData.wisc.ive}
                  onChange={(e) => handleInputChange('wisc.ive', formatNumberInput(e.target.value))}
                  placeholder="000"
                  maxLength="3"
                  className="text-center text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imt" className="text-xs text-center block">IMT</Label>
                <Input
                  id="imt"
                  type="number"
                  value={testData.wisc.imt}
                  onChange={(e) => handleInputChange('wisc.imt', formatNumberInput(e.target.value))}
                  placeholder="000"
                  maxLength="3"
                  className="text-center text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ivp" className="text-xs text-center block">IVP</Label>
                <Input
                  id="ivp"
                  type="number"
                  value={testData.wisc.ivp}
                  onChange={(e) => handleInputChange('wisc.ivp', formatNumberInput(e.target.value))}
                  placeholder="000"
                  maxLength="3"
                  className="text-center text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cit" className="text-xs text-center block">CIT</Label>
                <Input
                  id="cit"
                  type="number"
                  value={testData.wisc.cit}
                  onChange={(e) => handleInputChange('wisc.cit', formatNumberInput(e.target.value))}
                  placeholder="000"
                  maxLength="3"
                  className="text-center text-sm"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
              Guardar Pruebas
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatientTests;