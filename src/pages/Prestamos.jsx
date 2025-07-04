import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Plus, Search, Eye, Download, CreditCard, UserPlus, ArrowLeft } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { generarPDF } from '@/utils/pdfGenerator';
import PrestamoForm from '@/components/prestamos/PrestamoForm';
import ClienteForm from '@/components/clientes/ClienteForm';

const Prestamos = () => {
  const { clientes, prestamos, addPrestamo, getClienteById } = useData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cronogramaDialog, setCronogramaDialog] = useState(false);
  const [selectedPrestamo, setSelectedPrestamo] = useState(null);
  const [activeTab, setActiveTab] = useState('prestamo');
  const [formData, setFormData] = useState({
    clienteId: '',
    monto: '',
    tasaInteres: '',
    plazo: '',
    fechaInicio: '',
    tipoInteres: 'simple',
    observaciones: ''
  });

  const filteredPrestamos = prestamos.filter(prestamo => {
    const cliente = getClienteById(prestamo.clienteId);
    const clienteNombre = cliente ? 
      (cliente.tipoPersona === 'natural' ? `${cliente.nombres} ${cliente.apellidos}` : cliente.razonSocial) : '';
    
    return clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) || prestamo.id.toString().includes(searchTerm);
  });

  const calcularCronograma = (monto, tasaInteres, plazo, fechaInicio, tipoInteres) => {
    const cronograma = [];
    const montoTotal = parseFloat(monto);
    const tasa = parseFloat(tasaInteres) / 100;
    const numCuotas = parseInt(plazo);
    const fechaBase = new Date(fechaInicio);
    
    if (tipoInteres === 'simple') {
      const interesTotal = montoTotal * tasa * (numCuotas / 12);
      const montoConInteres = montoTotal + interesTotal;
      const cuotaMensual = montoConInteres / numCuotas;
      const interesPorCuota = interesTotal / numCuotas;
      const capitalPorCuota = montoTotal / numCuotas;

      for (let i = 1; i <= numCuotas; i++) {
        const fechaVencimiento = new Date(fechaBase);
        fechaVencimiento.setMonth(fechaBase.getMonth() + i);
        cronograma.push({
          numeroCuota: i,
          fechaVencimiento: fechaVencimiento.toISOString().split('T')[0],
          capital: capitalPorCuota,
          interes: interesPorCuota,
          cuota: cuotaMensual,
          pagado: false, fechaPago: null, montoPagado: 0
        });
      }
    } else { // Interés compuesto (Francés)
      const tasaMensual = tasa / 12;
      const cuotaMensual = montoTotal * (tasaMensual * Math.pow(1 + tasaMensual, numCuotas)) / (Math.pow(1 + tasaMensual, numCuotas) - 1);
      let saldoPendiente = montoTotal;

      for (let i = 1; i <= numCuotas; i++) {
        const interes = saldoPendiente * tasaMensual;
        const capital = cuotaMensual - interes;
        saldoPendiente -= capital;

        const fechaVencimiento = new Date(fechaBase);
        fechaVencimiento.setMonth(fechaBase.getMonth() + i);
        
        cronograma.push({
          numeroCuota: i,
          fechaVencimiento: fechaVencimiento.toISOString().split('T')[0],
          capital: capital,
          interes: interes,
          cuota: cuotaMensual,
          pagado: false, fechaPago: null, montoPagado: 0
        });
      }
    }
    return cronograma;
  };

  const resetForm = () => {
    setFormData({ clienteId: '', monto: '', tasaInteres: '', plazo: '', fechaInicio: '', tipoInteres: 'simple', observaciones: '' });
    setActiveTab('prestamo');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.clienteId) {
        toast({ title: "Error", description: "Por favor, seleccione un cliente.", variant: "destructive" });
        return;
      }
      const cronograma = calcularCronograma(formData.monto, formData.tasaInteres, formData.plazo, formData.fechaInicio, formData.tipoInteres);
      const nuevoPrestamo = { ...formData, monto: parseFloat(formData.monto), tasaInteres: parseFloat(formData.tasaInteres), plazo: parseInt(formData.plazo), cronograma };
      const prestamoCreado = addPrestamo(nuevoPrestamo);
      const cliente = getClienteById(formData.clienteId);
      generarPDF(prestamoCreado, cliente, cronograma);
      toast({ title: "Préstamo registrado", description: "El préstamo ha sido registrado y el PDF ha sido generado." });
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({ title: "Error", description: "Ocurrió un error al registrar el préstamo.", variant: "destructive" });
    }
  };

  const handleClienteCreado = (nuevoCliente) => {
    setFormData({ ...formData, clienteId: nuevoCliente.id.toString() });
    setActiveTab('prestamo');
  };

  const verCronograma = (prestamo) => {
    setSelectedPrestamo(prestamo);
    setCronogramaDialog(true);
  };

  const descargarPDF = (prestamo) => {
    const cliente = getClienteById(prestamo.clienteId);
    generarPDF(prestamo, cliente, prestamo.cronograma);
    toast({ title: "PDF generado", description: "El documento ha sido descargado exitosamente." });
  };

  const getEstadoPrestamo = (prestamo) => {
    if (!prestamo.cronograma) return { estado: 'Pendiente', clase: 'status-pendiente' };
    const hoy = new Date();
    const cuotasVencidas = prestamo.cronograma.filter(c => !c.pagado && new Date(c.fechaVencimiento) < hoy);
    const todasPagadas = prestamo.cronograma.every(c => c.pagado);

    if (todasPagadas) return { estado: 'Pagado', clase: 'status-al-dia' };
    if (cuotasVencidas.length > 0) return { estado: 'Vencido', clase: 'status-vencido' };
    
    const cuotasPorVencer = prestamo.cronograma.filter(c => !c.pagado && new Date(c.fechaVencimiento) >= hoy && new Date(c.fechaVencimiento) <= new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000));
    if (cuotasPorVencer.length > 0) return { estado: 'Por vencer', clase: 'status-por-vencer' };

    return { estado: 'Al día', clase: 'status-al-dia' };
  };

  return (
    <Layout>
      <Helmet>
        <title>Préstamos - Sistema de Préstamos</title>
        <meta name="description" content="Gestión completa de préstamos con cálculo automático de cronogramas y generación de documentos PDF" />
      </Helmet>

      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Préstamos</h1>
            <p className="text-gray-400">Gestión de préstamos y cronogramas de pago</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(isOpen) => { setDialogOpen(isOpen); if (!isOpen) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Préstamo
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-effect border-white/20 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">Nuevo Préstamo</DialogTitle>
              </DialogHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-800/80">
                  <TabsTrigger value="prestamo"><CreditCard className="w-4 h-4 mr-2" />Préstamo</TabsTrigger>
                  <TabsTrigger value="cliente"><UserPlus className="w-4 h-4 mr-2" />Nuevo Cliente</TabsTrigger>
                </TabsList>
                <TabsContent value="prestamo" className="mt-4">
                  <PrestamoForm formData={formData} setFormData={setFormData} clientes={clientes} handleSubmit={handleSubmit} />
                </TabsContent>
                <TabsContent value="cliente" className="mt-4">
                  <ClienteForm onClienteCreado={handleClienteCreado} onCancel={() => setActiveTab('prestamo')} />
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-effect border-white/10">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input placeholder="Buscar por cliente o ID de préstamo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 glass-effect border-white/20 text-white" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Lista de Préstamos ({filteredPrestamos.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-gray-300">ID</TableHead>
                      <TableHead className="text-gray-300">Cliente</TableHead>
                      <TableHead className="text-gray-300">Monto</TableHead>
                      <TableHead className="text-gray-300">Tasa</TableHead>
                      <TableHead className="text-gray-300">Plazo</TableHead>
                      <TableHead className="text-gray-300">Estado</TableHead>
                      <TableHead className="text-gray-300">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPrestamos.map((prestamo) => {
                      const cliente = getClienteById(prestamo.clienteId);
                      const estadoPrestamo = getEstadoPrestamo(prestamo);
                      return (
                        <TableRow key={prestamo.id} className="border-white/10 hover:bg-white/5">
                          <TableCell className="text-white font-mono">#{prestamo.id.toString().slice(-6)}</TableCell>
                          <TableCell><div className="text-white">{cliente ? (cliente.tipoPersona === 'natural' ? `${cliente.nombres} ${cliente.apellidos}` : cliente.razonSocial) : 'Cliente no encontrado'}</div></TableCell>
                          <TableCell><div className="text-white font-semibold">S/ {prestamo.monto?.toLocaleString()}</div></TableCell>
                          <TableCell><div className="text-white">{prestamo.tasaInteres}%</div></TableCell>
                          <TableCell><div className="text-white">{prestamo.plazo} meses</div></TableCell>
                          <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium border ${estadoPrestamo.clase}`}>{estadoPrestamo.estado}</span></TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={() => verCronograma(prestamo)} className="border-white/20 text-white hover:bg-white/10"><Eye className="w-4 h-4" /></Button>
                              <Button size="sm" variant="outline" onClick={() => descargarPDF(prestamo)} className="border-green-500/20 text-green-400 hover:bg-green-500/10"><Download className="w-4 h-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {filteredPrestamos.length === 0 && (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No se encontraron préstamos</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Dialog open={cronogramaDialog} onOpenChange={setCronogramaDialog}>
          <DialogContent className="glass-effect border-white/20 max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Cronograma de Pagos - Préstamo #{selectedPrestamo?.id.toString().slice(-6)}</DialogTitle>
            </DialogHeader>
            {selectedPrestamo && (
              <div className="space-y-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10">
                        <TableHead className="text-gray-300">Cuota</TableHead>
                        <TableHead className="text-gray-300">Fecha Venc.</TableHead>
                        <TableHead className="text-gray-300">Capital</TableHead>
                        <TableHead className="text-gray-300">Interés</TableHead>
                        <TableHead className="text-gray-300">Cuota Total</TableHead>
                        <TableHead className="text-gray-300">Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPrestamo.cronograma?.map((cuota) => (
                        <TableRow key={cuota.numeroCuota} className="border-white/10">
                          <TableCell className="text-white font-medium">{cuota.numeroCuota}</TableCell>
                          <TableCell className="text-white">{new Date(cuota.fechaVencimiento).toLocaleDateString()}</TableCell>
                          <TableCell className="text-white">S/ {cuota.capital?.toFixed(2)}</TableCell>
                          <TableCell className="text-white">S/ {cuota.interes?.toFixed(2)}</TableCell>
                          <TableCell className="text-white font-semibold">S/ {cuota.cuota?.toFixed(2)}</TableCell>
                          <TableCell>
                            {cuota.pagado ? (
                              <span className="status-al-dia px-2 py-1 rounded-full text-xs font-medium border">Pagado</span>
                            ) : (
                              <span className="status-pendiente px-2 py-1 rounded-full text-xs font-medium border">Pendiente</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Prestamos;