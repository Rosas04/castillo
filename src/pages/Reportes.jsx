
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  BarChart3, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Users,
  CreditCard,
  AlertTriangle,
  Download,
  Filter
} from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';

const Reportes = () => {
  const { clientes, prestamos, pagos, getClienteById } = useData();
  const { toast } = useToast();
  const [filtroFecha, setFiltroFecha] = useState('mes');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Cálculos generales
  const totalPrestado = prestamos.reduce((sum, p) => sum + (p.monto || 0), 0);
  const totalPagado = pagos.reduce((sum, p) => sum + (p.monto || 0), 0);
  const saldoPendiente = totalPrestado - totalPagado;
  const tasaRecuperacion = totalPrestado > 0 ? (totalPagado / totalPrestado) * 100 : 0;

  // Préstamos por estado
  const prestamosActivos = prestamos.filter(p => p.estado === 'activo').length;
  const prestamosPagados = prestamos.filter(p => {
    if (!p.cronograma) return false;
    return p.cronograma.every(cuota => cuota.pagado);
  }).length;

  // Cuotas vencidas
  const hoy = new Date();
  const cuotasVencidas = prestamos.reduce((total, prestamo) => {
    if (!prestamo.cronograma) return total;
    return total + prestamo.cronograma.filter(cuota => {
      const fechaVencimiento = new Date(cuota.fechaVencimiento);
      return !cuota.pagado && fechaVencimiento < hoy;
    }).length;
  }, 0);

  // Resumen mensual de deudas
  const obtenerResumenMensual = () => {
    const resumen = {};
    
    prestamos.forEach(prestamo => {
      if (!prestamo.cronograma) return;
      
      prestamo.cronograma.forEach(cuota => {
        const fecha = new Date(cuota.fechaVencimiento);
        const mesAno = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
        
        if (!resumen[mesAno]) {
          resumen[mesAno] = {
            totalEsperado: 0,
            totalPagado: 0,
            cuotasPendientes: 0,
            cuotasVencidas: 0
          };
        }
        
        resumen[mesAno].totalEsperado += cuota.cuota || 0;
        
        if (cuota.pagado) {
          resumen[mesAno].totalPagado += cuota.montoPagado || cuota.cuota || 0;
        } else {
          resumen[mesAno].cuotasPendientes += 1;
          if (fecha < hoy) {
            resumen[mesAno].cuotasVencidas += 1;
          }
        }
      });
    });
    
    return Object.entries(resumen)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 12);
  };

  const resumenMensual = obtenerResumenMensual();

  // Top clientes por monto
  const topClientes = clientes.map(cliente => {
    const prestamosCliente = prestamos.filter(p => p.clienteId === cliente.id);
    const totalPrestado = prestamosCliente.reduce((sum, p) => sum + (p.monto || 0), 0);
    const pagosCliente = pagos.filter(pago => {
      const prestamo = prestamos.find(p => p.id === pago.prestamoId);
      return prestamo && prestamo.clienteId === cliente.id;
    });
    const totalPagado = pagosCliente.reduce((sum, p) => sum + (p.monto || 0), 0);
    
    return {
      ...cliente,
      totalPrestado,
      totalPagado,
      saldoPendiente: totalPrestado - totalPagado,
      numPrestamos: prestamosCliente.length
    };
  })
  .filter(cliente => cliente.totalPrestado > 0)
  .sort((a, b) => b.totalPrestado - a.totalPrestado)
  .slice(0, 10);

  const exportarReporte = () => {
    toast({
      title: "🚧 Esta función no está implementada aún",
      description: "¡Pero no te preocupes! ¡Puedes solicitarla en tu próximo prompt! 🚀",
    });
  };

  const stats = [
    {
      title: 'Total Prestado',
      value: `S/ ${totalPrestado.toLocaleString()}`,
      icon: CreditCard,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-400'
    },
    {
      title: 'Total Recaudado',
      value: `S/ ${totalPagado.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/20',
      textColor: 'text-green-400'
    },
    {
      title: 'Saldo Pendiente',
      value: `S/ ${saldoPendiente.toLocaleString()}`,
      icon: AlertTriangle,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-500/20',
      textColor: 'text-yellow-400'
    },
    {
      title: 'Tasa de Recuperación',
      value: `${tasaRecuperacion.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/20',
      textColor: 'text-purple-400'
    }
  ];

  return (
    <Layout>
      <Helmet>
        <title>Reportes - Sistema de Préstamos</title>
        <meta name="description" content="Reportes completos y análisis de rendimiento del sistema de préstamos con visualización mensual de deudas" />
      </Helmet>

      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Reportes</h1>
            <p className="text-gray-400">Análisis y estadísticas del sistema de préstamos</p>
          </div>

          <Button 
            onClick={exportarReporte}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Reporte
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-effect border-white/10 hover:border-white/20 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <Icon className={`w-6 h-6 ${stat.textColor}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Resumen Mensual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Resumen Mensual de Deudas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-gray-300">Mes</TableHead>
                      <TableHead className="text-gray-300">Total Esperado</TableHead>
                      <TableHead className="text-gray-300">Total Pagado</TableHead>
                      <TableHead className="text-gray-300">Pendiente</TableHead>
                      <TableHead className="text-gray-300">Cuotas Vencidas</TableHead>
                      <TableHead className="text-gray-300">% Recuperación</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resumenMensual.map(([mesAno, datos]) => {
                      const fecha = new Date(mesAno + '-01');
                      const nombreMes = fecha.toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long' 
                      });
                      const porcentajeRecuperacion = datos.totalEsperado > 0 ? 
                        (datos.totalPagado / datos.totalEsperado) * 100 : 0;
                      
                      return (
                        <TableRow key={mesAno} className="border-white/10 hover:bg-white/5">
                          <TableCell className="text-white font-medium capitalize">
                            {nombreMes}
                          </TableCell>
                          <TableCell className="text-white">
                            S/ {datos.totalEsperado.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-green-400 font-semibold">
                            S/ {datos.totalPagado.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-yellow-400">
                            S/ {(datos.totalEsperado - datos.totalPagado).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {datos.cuotasVencidas > 0 ? (
                              <span className="text-red-400 font-semibold">
                                {datos.cuotasVencidas}
                              </span>
                            ) : (
                              <span className="text-gray-400">0</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-700 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-500 ${
                                    porcentajeRecuperacion >= 80 ? 'bg-green-500' :
                                    porcentajeRecuperacion >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(porcentajeRecuperacion, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-white text-sm">
                                {porcentajeRecuperacion.toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Clientes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Top 10 Clientes por Monto</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-gray-300">Cliente</TableHead>
                      <TableHead className="text-gray-300">Préstamos</TableHead>
                      <TableHead className="text-gray-300">Total Prestado</TableHead>
                      <TableHead className="text-gray-300">Total Pagado</TableHead>
                      <TableHead className="text-gray-300">Saldo Pendiente</TableHead>
                      <TableHead className="text-gray-300">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topClientes.map((cliente, index) => {
                      const porcentajePagado = cliente.totalPrestado > 0 ? 
                        (cliente.totalPagado / cliente.totalPrestado) * 100 : 0;
                      
                      return (
                        <TableRow key={cliente.id} className="border-white/10 hover:bg-white/5">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {index + 1}
                              </div>
                              <div className="text-white">
                                {cliente.tipoPersona === 'natural' ? 
                                  `${cliente.nombres} ${cliente.apellidos}` : 
                                  cliente.razonSocial}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-white">
                            {cliente.numPrestamos}
                          </TableCell>
                          <TableCell className="text-white font-semibold">
                            S/ {cliente.totalPrestado.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-green-400 font-semibold">
                            S/ {cliente.totalPagado.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-yellow-400">
                            S/ {cliente.saldoPendiente.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-700 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-500 ${
                                    porcentajePagado >= 80 ? 'bg-green-500' :
                                    porcentajePagado >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(porcentajePagado, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-white text-sm">
                                {porcentajePagado.toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                
                {topClientes.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No hay datos de clientes disponibles</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Estadísticas Adicionales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Estado de Préstamos */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="glass-effect border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Estado de Préstamos</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Préstamos Activos</span>
                  <span className="text-blue-400 font-semibold">{prestamosActivos}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Préstamos Pagados</span>
                  <span className="text-green-400 font-semibold">{prestamosPagados}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Cuotas Vencidas</span>
                  <span className="text-red-400 font-semibold">{cuotasVencidas}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Clientes</span>
                  <span className="text-purple-400 font-semibold">{clientes.length}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Métricas de Rendimiento */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="glass-effect border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Métricas de Rendimiento</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Promedio por Préstamo</span>
                  <span className="text-white font-semibold">
                    S/ {prestamos.length > 0 ? (totalPrestado / prestamos.length).toLocaleString() : '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Promedio por Cliente</span>
                  <span className="text-white font-semibold">
                    S/ {clientes.length > 0 ? (totalPrestado / clientes.length).toLocaleString() : '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Pagos Registrados</span>
                  <span className="text-white font-semibold">{pagos.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Promedio por Pago</span>
                  <span className="text-white font-semibold">
                    S/ {pagos.length > 0 ? (totalPagado / pagos.length).toLocaleString() : '0'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Reportes;
