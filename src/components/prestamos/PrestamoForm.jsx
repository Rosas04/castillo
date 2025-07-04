import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PrestamoForm = ({ formData, setFormData, clientes, handleSubmit }) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label className="text-white">Cliente</Label>
        <Select onValueChange={(value) => setFormData({ ...formData, clienteId: value })} value={formData.clienteId} required>
          <SelectTrigger className="glass-effect border-white/20 text-white">
            <SelectValue placeholder="Seleccionar cliente" />
          </SelectTrigger>
          <SelectContent>
            {clientes.map(cliente => (
              <SelectItem key={cliente.id} value={cliente.id.toString()}>
                {cliente.tipoPersona === 'natural' ? `${cliente.nombres} ${cliente.apellidos}` : cliente.razonSocial} - {cliente.numeroDocumento}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-white">Monto del Préstamo (S/)</Label>
          <Input type="number" step="0.01" value={formData.monto} onChange={(e) => setFormData({ ...formData, monto: e.target.value })} className="glass-effect border-white/20 text-white" required />
        </div>
        <div>
          <Label className="text-white">Tasa de Interés Anual (%)</Label>
          <Input type="number" step="0.01" value={formData.tasaInteres} onChange={(e) => setFormData({ ...formData, tasaInteres: e.target.value })} className="glass-effect border-white/20 text-white" required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-white">Plazo (meses)</Label>
          <Input type="number" value={formData.plazo} onChange={(e) => setFormData({ ...formData, plazo: e.target.value })} className="glass-effect border-white/20 text-white" required />
        </div>
        <div>
          <Label className="text-white">Fecha de Inicio</Label>
          <Input type="date" value={formData.fechaInicio} onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })} className="glass-effect border-white/20 text-white" required />
        </div>
      </div>
      
      <div>
        <Label className="text-white">Tipo de Interés</Label>
        <Select onValueChange={(value) => setFormData({ ...formData, tipoInteres: value })} value={formData.tipoInteres}>
          <SelectTrigger className="glass-effect border-white/20 text-white"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="simple">Interés Simple</SelectItem>
            <SelectItem value="compuesto">Interés Compuesto</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-white">Observaciones</Label>
        <Input value={formData.observaciones} onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })} className="glass-effect border-white/20 text-white" placeholder="Observaciones adicionales..." />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
          Registrar Préstamo
        </Button>
      </div>
    </form>
  );
};

export default PrestamoForm;