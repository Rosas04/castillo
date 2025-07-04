import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';

const ClienteForm = ({ onClienteCreado, onCancel }) => {
  const { addCliente } = useData();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    nombres: '',
    apellidos: '',
    razonSocial: '',
    telefono: '',
    email: '',
    direccion: '',
    tipoPersona: 'natural'
  });

  const consultarDocumento = async () => {
    toast({
      title: "🚧 Esta función no está implementada aún",
      description: "¡Pero no te preocupes! ¡Puedes solicitarla en tu próximo prompt! 🚀",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.tipoDocumento === 'DNI' && formData.numeroDocumento.length !== 8) {
        toast({ title: "Error", description: "El DNI debe tener 8 dígitos.", variant: "destructive" });
        return;
      }
      if (formData.tipoDocumento === 'RUC' && formData.numeroDocumento.length !== 11) {
        toast({ title: "Error", description: "El RUC debe tener 11 dígitos.", variant: "destructive" });
        return;
      }

      const nuevoCliente = addCliente(formData);
      toast({
        title: "Cliente registrado",
        description: "El nuevo cliente ha sido registrado exitosamente.",
      });
      if (onClienteCreado) {
        onClienteCreado(nuevoCliente);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al registrar el cliente.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-white">Tipo de Persona</Label>
          <Select onValueChange={(value) => setFormData({...formData, tipoPersona: value})} value={formData.tipoPersona}>
            <SelectTrigger className="glass-effect border-white/20 text-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="natural">Persona Natural</SelectItem>
              <SelectItem value="juridica">Persona Jurídica</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-white">Tipo de Documento</Label>
          <Select onValueChange={(value) => setFormData({...formData, tipoDocumento: value})} value={formData.tipoDocumento}>
            <SelectTrigger className="glass-effect border-white/20 text-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="DNI">DNI</SelectItem>
              <SelectItem value="RUC">RUC</SelectItem>
              <SelectItem value="CE">Carnet de Extranjería</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-white">Número de Documento</Label>
        <div className="flex gap-2">
          <Input
            value={formData.numeroDocumento}
            onChange={(e) => setFormData({...formData, numeroDocumento: e.target.value})}
            placeholder="Ingrese el número de documento"
            className="glass-effect border-white/20 text-white"
            required
          />
          <Button type="button" onClick={consultarDocumento} variant="outline" className="border-white/20 text-white hover:bg-white/10">
            Consultar
          </Button>
        </div>
      </div>

      {formData.tipoPersona === 'natural' ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-white">Nombres</Label>
            <Input value={formData.nombres} onChange={(e) => setFormData({...formData, nombres: e.target.value})} className="glass-effect border-white/20 text-white" required />
          </div>
          <div>
            <Label className="text-white">Apellidos</Label>
            <Input value={formData.apellidos} onChange={(e) => setFormData({...formData, apellidos: e.target.value})} className="glass-effect border-white/20 text-white" required />
          </div>
        </div>
      ) : (
        <div>
          <Label className="text-white">Razón Social</Label>
          <Input value={formData.razonSocial} onChange={(e) => setFormData({...formData, razonSocial: e.target.value})} className="glass-effect border-white/20 text-white" required />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-white">Teléfono</Label>
          <Input value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} className="glass-effect border-white/20 text-white" />
        </div>
        <div>
          <Label className="text-white">Email</Label>
          <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="glass-effect border-white/20 text-white" />
        </div>
      </div>

      <div>
        <Label className="text-white">Dirección</Label>
        <Input value={formData.direccion} onChange={(e) => setFormData({...formData, direccion: e.target.value})} className="glass-effect border-white/20 text-white" />
      </div>

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="border-white/20 text-white hover:bg-white/10">
            Cancelar
          </Button>
        )}
        <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          Registrar Cliente
        </Button>
      </div>
    </form>
  );
};

export default ClienteForm;