
import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  Users, 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  PieChart,
  Activity
} from 'lucide-react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';

const Dashboard = () => {
  const { clientes, prestamos, pagos } = useData();

  // Cálculos para estadísticas
  const totalClientes = clientes.length;
  const prestamosActivos = prestamos.filter(p => p.estado === 'activo').length;
  const totalPrestado = prestamos.reduce((sum, p) => sum + (p.monto || 0), 0);
  const totalPagado = pagos.reduce((sum, p) => sum + (p.monto || 0), 0);

  // Préstamos por vencer (próximos 7 días)
  const hoy = new Date();
  const proximaSemana = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const prestamosPorVencer = prestamos.filter(prestamo => {
    if (!prestamo.cronograma || prestamo.estado !== 'activo') return false;
    
    return prestamo.cronograma.some(cuota => {
      const fechaVencimiento = new Date(cuota.fechaVencimiento);
      return !cuota.pagado && fechaVencimiento >= hoy && fechaVencimiento <= proximaSemana;
    });
  }).length;

  const stats = [
    {
      title: 'Total Clientes',
      value: totalClientes,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-400'
    },
    {
      title: 'Préstamos Activos',
      value: prestamosActivos,
      icon: CreditCard,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/20',
      textColor: 'text-green-400'
    },
    {
      title: 'Total Prestado',
      value: `S/ ${totalPrestado.toLocaleString()}`,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/20',
      textColor: 'text-purple-400'
    },
    {
      title: 'Total Recaudado',
      value: `S/ ${totalPagado.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-500/20',
      textColor: 'text-yellow-400'
    }
  ];

  const alertas = [
    {
      tipo: 'vencimiento',
      titulo: 'Préstamos por vencer',
      descripcion: `${prestamosPorVencer} préstamos vencen en los próximos 7 días`,
      icon: Calendar,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20'
    },
    {
      tipo: 'sistema',
      titulo: 'Sistema actualizado',
      descripcion: 'Todas las funcionalidades están operativas',
      icon: Activity,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    }
  ];

  return (
    <Layout>
      <Helmet>
        <title>Dashboard - Sistema de Préstamos</title>
        <meta name="description" content="Panel principal del sistema de gestión de préstamos con estadísticas y resumen general" />
      </Helmet>

      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">Dashboard</h1>
          <p className="text-gray-400">Resumen general del sistema de préstamos</p>
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Alertas y Notificaciones */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="glass-effect border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <span>Alertas y Notificaciones</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {alertas.map((alerta, index) => {
                  const Icon = alerta.icon;
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${alerta.bgColor} border-white/10`}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className={`w-5 h-5 ${alerta.color} mt-0.5`} />
                        <div>
                          <h4 className="font-semibold text-white">{alerta.titulo}</h4>
                          <p className="text-sm text-gray-400">{alerta.descripcion}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>

          {/* Resumen Rápido */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="glass-effect border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <PieChart className="w-5 h-5 text-blue-400" />
                  <span>Resumen Rápido</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Tasa de recuperación</span>
                    <span className="text-white font-semibold">
                      {totalPrestado > 0 ? Math.round((totalPagado / totalPrestado) * 100) : 0}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Saldo pendiente</span>
                    <span className="text-white font-semibold">
                      S/ {(totalPrestado - totalPagado).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Por vencer</span>
                    <span className="text-yellow-400 font-semibold">
                      {prestamosPorVencer} préstamos
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Progreso de cobranza</span>
                    <span className="text-white">
                      {totalPrestado > 0 ? Math.round((totalPagado / totalPrestado) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${totalPrestado > 0 ? (totalPagado / totalPrestado) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors cursor-pointer">
                  <Users className="w-8 h-8 text-blue-400 mb-2" />
                  <h3 className="font-semibold text-white">Nuevo Cliente</h3>
                  <p className="text-sm text-gray-400">Registrar un nuevo cliente</p>
                </div>
                
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors cursor-pointer">
                  <CreditCard className="w-8 h-8 text-green-400 mb-2" />
                  <h3 className="font-semibold text-white">Nuevo Préstamo</h3>
                  <p className="text-sm text-gray-400">Crear un nuevo préstamo</p>
                </div>
                
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors cursor-pointer">
                  <DollarSign className="w-8 h-8 text-purple-400 mb-2" />
                  <h3 className="font-semibold text-white">Registrar Pago</h3>
                  <p className="text-sm text-gray-400">Registrar un nuevo pago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Dashboard;
