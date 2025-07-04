
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  Plus, 
  Search, 
  DollarSign, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';

const Pagos = () => {
  const { clientes, prestamos, pagos, addPago, updatePrestamo, getClienteById } = useData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    prestamoId: '',
    numeroCuota: '',
    monto: '',
    fechaPago: '',
    metodoPago: 'efectivo',
    observaciones: ''
  });

  // Obtener préstamos activos con cuotas pendientes
  const prestamosConCuotasPendientes = prestamos.filter(prestamo => {
    return prestamo.estado === 'activo' && 
           prestamo.cronograma && 
           prestamo.cronograma.some(cuota => !cuota.pagado);
  });

  const filteredPagos = pagos.filter(pago => {
    const prestamo = prestamos.find(p => p.id === pago.prestamoId);
    const cliente = prestamo ? getClienteById(prestamo.clienteId) : null;
    const clienteNombre = cliente ? 
      (cliente.tipoPersona === 'natural' ? 
        `${cliente.nombres} ${cliente.apellidos}` : 
        cliente.razonSocial) : '';
    
    return clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
           pago.prestamoId.toString().includes(searchTerm);
  });

  const resetForm = () => {
    setFormData({
      prestamoId: '',
      numeroCuota: '',
      monto: '',
      fechaPago: '',
      metodoPago: 'efectivo',
      observaciones: ''
    });
  };

  const handlePrestamoChange = (prestamoId) => {
    setFormData({...formData, prestamoId, numeroCuota: '', monto: ''});
  };

  const handleCuotaChange = (numeroCuota) => {
    const prestamo = prestamos.find(p => p.id === parseInt(formData.prestamoId));
    if (prestamo && prestamo.cronograma) {
      const cuota = prestamo.cronograma.find(c => c.numeroCuota === parseInt(numeroCuota));
      if (cuota) {
        setFormData({
          ...formData, 
          numeroCuota, 
          monto: cuota.cuota.toString()
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const prestamo = prestamos.find(p => p.id === parseInt(formData.prestamoId));
      if (!prestamo) {
        throw new Error('Préstamo no encontrado');
      }

      // Registrar el pago
      const nuevoPago = {
        ...formData,
        prestamoId: parseInt(formData.prestamoId),
        numeroCuota: parseInt(formData.numeroCuota),
        monto: parseFloat(formData.monto)
      };

      addPago(nuevoPago);

      // Actualizar el cronograma del préstamo
      const cronogramaActualizado = prestamo.cronograma.map(cuota => {
        if (cuota.numeroCuota === parseInt(formData.numeroCuota)) {
          return {
            ...cuota,
            pagado: true,
            fechaPago: formData.fechaPago,
            montoPagado: parseFloat(formData.monto)
          };
        }
        return cuota;
      });

      updatePrestamo(prestamo.id, { cronograma: cronogramaActualizado });

      toast({
        title: "Pago registrado",
        description: "El pago ha sido registrado exitosamente",
      });

      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al registrar el pago",
        variant: "destructive",
      });
    }
  };

  const getCuotasPendientes = (prestamoId) => {
    const prestamo = prestamos.find(p => p.id === parseInt(prestamoId));
    if (!prestamo || !prestamo.cronograma) return [];
    
    return prestamo.cronograma.filter(cuota => !cuota.pagado);
  };

  const getEstadoCuota = (cuota) => {
    const fechaVencimiento = new Date(cuota.fechaVencimiento);
    const hoy = new Date();
    
    if (cuota.pagado) {
      return { estado: 'Pagado', clase: 'status-al-dia', icon: CheckCircle };
    } else if (fechaVencimiento < hoy) {
      return { estado: 'Vencido', clase: 'status-vencido', icon: AlertCircle };
    } else {
      const proximaSemana = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);
      if (fechaVencimiento <= proximaSemana) {
        return { estado: 'Por vencer', clase: 'status-por-vencer', icon: Clock };
      } else {
        return { estado: 'Pendiente', clase: 'status-pendiente', icon: Clock };
      }
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>Pagos - Sistema de Préstamos</title>
        <meta name="description" content="Registro y seguimiento de pagos con validaciones automáticas y actualización de cronogramas" />
      </Helmet>

      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Pagos</h1>
            <p className="text-gray-400">Registro y seguimiento de pagos de préstamos</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                onClick={resetForm}
              >
                <Plus className="w-4 h-4 mr-2" />
                Registrar Pago
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-effect border-white/20 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">Registrar Nuevo Pago</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Préstamo */}
                <div>
                  <Label className="text-white">Préstamo</Label>
                  <Select
                    value={formData.prestamoId}
                    onChange={(e) => handlePrestamoChange(e.target.value)}
                    required
                  >
                    <option value="">Seleccionar préstamo</option>
                    {prestamosConCuotasPendientes.map(prestamo => {
                      const cliente = getClienteById(prestamo.clienteId);
                      const clienteNombre = cliente ? 
                        (cliente.tipoPersona === 'natural' ? 
                          `${cliente.nombres} ${cliente.apellidos}` : 
                          cliente.razonSocial) : 'Cliente no encontrado';
                      
                      return (
                        <option key={prestamo.id} value={prestamo.id}>
                          #{prestamo.id.toString().slice(-6)} - {clienteNombre} - S/ {prestamo.monto?.toLocaleString()}
                        </option>
                      );
                    })}
                  </Select>
                </div>

                {/* Cuota */}
                {formData.prestamoId && (
                  <div>
                    <Label className="text-white">Cuota a Pagar</Label>
                    <Select
                      value={formData.numeroCuota}
                      onChange={(e) => handleCuotaChange(e.target.value)}
                      required
                    >
                      <option value="">Seleccionar cuota</option>
                      {getCuotasPendientes(formData.prestamoId).map(cuota => (
                        <option key={cuota.numeroCuota} value={cuota.numeroCuota}>
                          Cuota {cuota.numeroCuota} - Vence: {new Date(cuota.fechaVencimiento).toLocaleDateString()} - S/ {cuota.cuota?.toFixed(2)}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}

                {/* Monto y Fecha */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Monto del Pago (S/)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.monto}
                      onChange={(e) => setFormData({...formData, monto: e.target.value})}
                      className="glass-effect border-white/20 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-white">Fecha de Pago</Label>
                    <Input
                      type="date"
                      value={formData.fechaPago}
                      onChange={(e) => setFormData({...formData, fechaPago: e.target.value})}
                      className="glass-effect border-white/20 text-white"
                      required
                    />
                  </div>
                </div>

                {/* Método de Pago */}
                <div>
                  <Label className="text-white">Método de Pago</Label>
                  <Select
                    value={formData.metodoPago}
                    onChange={(e) => setFormData({...formData, metodoPago: e.target.value})}
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia Bancaria</option>
                    <option value="deposito">Depósito Bancario</option>
                    <option value="cheque">Cheque</option>
                  </Select>
                </div>

                {/* Observaciones */}
                <div>
                  <Label className="text-white">Observaciones</Label>
                  <Input
                    value={formData.observaciones}
                    onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                    className="glass-effect border-white/20 text-white"
                    placeholder="Observaciones adicionales..."
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                  >
                    Registrar Pago
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-effect border-white/10">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por cliente o ID de préstamo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 glass-effect border-white/20 text-white"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cuotas por Vencer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <span>Cuotas por Vencer (Próximos 7 días)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-gray-300">Cliente</TableHead>
                      <TableHead className="text-gray-300">Préstamo</TableHead>
                      <TableHead className="text-gray-300">Cuota</TableHead>
                      <TableHead className="text-gray-300">Fecha Venc.</TableHead>
                      <TableHead className="text-gray-300">Monto</TableHead>
                      <TableHead className="text-gray-300">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prestamos.map(prestamo => {
                      if (!prestamo.cronograma) return null;
                      
                      const hoy = new Date();
                      const proximaSemana = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);
                      const cuotasPorVencer = prestamo.cronograma.filter(cuota => {
                        const fechaVencimiento = new Date(cuota.fechaVencimiento);
                        return !cuota.pagado && fechaVencimiento >= hoy && fechaVencimiento <= proximaSemana;
                      });

                      return cuotasPorVencer.map(cuota => {
                        const cliente = getClienteById(prestamo.clienteId);
                        const estadoCuota = getEstadoCuota(cuota);
                        const IconoEstado = estadoCuota.icon;

                        return (
                          <TableRow key={`${prestamo.id}-${cuota.numeroCuota}`} className="border-white/10 hover:bg-white/5">
                            <TableCell className="text-white">
                              {cliente ? (
                                cliente.tipoPersona === 'natural' ? 
                                  `${cliente.nombres} ${cliente.apellidos}` : 
                                  cliente.razonSocial
                              ) : 'Cliente no encontrado'}
                            </TableCell>
                            <TableCell className="text-white font-mono">
                              #{prestamo.id.toString().slice(-6)}
                            </TableCell>
                            <TableCell className="text-white">
                              Cuota {cuota.numeroCuota}
                            </TableCell>
                            <TableCell className="text-white">
                              {new Date(cuota.fechaVencimiento).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <DollarSign className="w-4 h-4 text-green-400" />
                                <span className="text-white font-semibold">
                                  S/ {cuota.cuota?.toFixed(2)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <IconoEstado className="w-4 h-4" />
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${estadoCuota.clase}`}>
                                  {estadoCuota.estado}
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      });
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Historial de Pagos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Historial de Pagos ({filteredPagos.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-gray-300">Fecha</TableHead>
                      <TableHead className="text-gray-300">Cliente</TableHead>
                      <TableHead className="text-gray-300">Préstamo</TableHead>
                      <TableHead className="text-gray-300">Cuota</TableHead>
                      <TableHead className="text-gray-300">Monto</TableHead>
                      <TableHead className="text-gray-300">Método</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPagos.map((pago) => {
                      const prestamo = prestamos.find(p => p.id === pago.prestamoId);
                      const cliente = prestamo ? getClienteById(prestamo.clienteId) : null;
                      
                      return (
                        <TableRow key={pago.id} className="border-white/10 hover:bg-white/5">
                          <TableCell className="text-white">
                            {new Date(pago.fechaPago).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-white">
                            {cliente ? (
                              cliente.tipoPersona === 'natural' ? 
                                `${cliente.nombres} ${cliente.apellidos}` : 
                                cliente.razonSocial
                            ) : 'Cliente no encontrado'}
                          </TableCell>
                          <TableCell className="text-white font-mono">
                            #{pago.prestamoId.toString().slice(-6)}
                          </TableCell>
                          <TableCell className="text-white">
                            Cuota {pago.numeroCuota}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-4 h-4 text-green-400" />
                              <span className="text-white font-semibold">
                                S/ {pago.monto?.toFixed(2)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium border border-blue-500/30 capitalize">
                              {pago.metodoPago}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                
                {filteredPagos.length === 0 && (
                  <div className="text-center py-8">
                    <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No se encontraron pagos registrados</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Pagos;
