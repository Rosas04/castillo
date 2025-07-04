
import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData debe ser usado dentro de DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [clientes, setClientes] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [pagos, setPagos] = useState([]);

  useEffect(() => {
    // Cargar datos del localStorage
    const savedClientes = localStorage.getItem('prestamos_clientes');
    const savedPrestamos = localStorage.getItem('prestamos_prestamos');
    const savedPagos = localStorage.getItem('prestamos_pagos');

    if (savedClientes) setClientes(JSON.parse(savedClientes));
    if (savedPrestamos) setPrestamos(JSON.parse(savedPrestamos));
    if (savedPagos) setPagos(JSON.parse(savedPagos));
  }, []);

  const saveToStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const addCliente = (cliente) => {
    const newCliente = { ...cliente, id: Date.now() };
    const updatedClientes = [...clientes, newCliente];
    setClientes(updatedClientes);
    saveToStorage('prestamos_clientes', updatedClientes);
    return newCliente;
  };

  const updateCliente = (id, clienteData) => {
    const updatedClientes = clientes.map(c => 
      c.id === id ? { ...c, ...clienteData } : c
    );
    setClientes(updatedClientes);
    saveToStorage('prestamos_clientes', updatedClientes);
  };

  const deleteCliente = (id) => {
    const updatedClientes = clientes.filter(c => c.id !== id);
    setClientes(updatedClientes);
    saveToStorage('prestamos_clientes', updatedClientes);
  };

  const addPrestamo = (prestamo) => {
    const newPrestamo = { 
      ...prestamo, 
      id: Date.now(),
      fechaCreacion: new Date().toISOString(),
      estado: 'activo'
    };
    const updatedPrestamos = [...prestamos, newPrestamo];
    setPrestamos(updatedPrestamos);
    saveToStorage('prestamos_prestamos', updatedPrestamos);
    return newPrestamo;
  };

  const updatePrestamo = (id, prestamoData) => {
    const updatedPrestamos = prestamos.map(p => 
      p.id === id ? { ...p, ...prestamoData } : p
    );
    setPrestamos(updatedPrestamos);
    saveToStorage('prestamos_prestamos', updatedPrestamos);
  };

  const addPago = (pago) => {
    const newPago = { 
      ...pago, 
      id: Date.now(),
      fechaRegistro: new Date().toISOString()
    };
    const updatedPagos = [...pagos, newPago];
    setPagos(updatedPagos);
    saveToStorage('prestamos_pagos', updatedPagos);
    return newPago;
  };

  const getClienteById = (id) => {
    return clientes.find(c => c.id === id);
  };

  const getPrestamosByCliente = (clienteId) => {
    return prestamos.filter(p => p.clienteId === clienteId);
  };

  const getPagosByPrestamo = (prestamoId) => {
    return pagos.filter(p => p.prestamoId === prestamoId);
  };

  const value = {
    clientes,
    prestamos,
    pagos,
    addCliente,
    updateCliente,
    deleteCliente,
    addPrestamo,
    updatePrestamo,
    addPago,
    getClienteById,
    getPrestamosByCliente,
    getPagosByPrestamo
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
