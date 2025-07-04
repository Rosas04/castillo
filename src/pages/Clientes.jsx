import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  User, 
  Building, 
  Phone, 
  Mail,
  Users
} from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';

const Clientes = () => {
  const { clientes, addCliente, updateCliente, deleteCliente } = useData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
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

  const filteredClientes = clientes.filter(cliente =>
    (cliente.nombres && cliente.nombres.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (cliente.apellidos && cliente.apellidos.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (cliente.razonSocial && cliente.razonSocial.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (cliente.numeroDocumento && cliente.numeroDocumento.includes(searchTerm))
  );

  const resetForm = () => {
    setFormData({
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
    setEditingCliente(null);
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

      if (editingCliente) {
        updateCliente(editingCliente.id, formData);
        toast({
          title: "Cliente actualizado",
          description: "Los datos del cliente han sido actualizados exitosamente.",
        });
      } else {
        addCliente(formData);
        toast({
          title: "Cliente registrado",
          description: "El nuevo cliente ha sido registrado exitosamente.",
        });
      }

      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar la solicitud.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (cliente) => {
    setEditingCliente(cliente);
    setFormData(cliente);
    setDialogOpen(true);
  };

  const handleDelete = (id) => {
    deleteCliente(id);
    toast({
      title: "Cliente eliminado",
      description: "El cliente ha sido eliminado exitosamente.",
    });
  };

  const consultarDocumento = async () => {
    if (!formData.numeroDocumento) return;

    toast({
      title: "🚧 Esta función no está implementada aún",
      description: "¡Pero no te preocupes! ¡Puedes solicitarla en tu próximo prompt! 🚀",
    });
  };

  return (
    <Layout>
      <Helmet>
        <title>Clientes - Sistema de Préstamos</title>
        <meta name="description" content="Gestión completa de clientes con integración a APIs de RENIEC y SUNAT para validación de documentos" />
      </Helmet>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Clientes</h1>
            <p className="text-gray-400">Gestión de clientes y validación de documentos</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={(isOpen) => { setDialogOpen(isOpen); if (!isOpen) resetForm(); }}>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-effect border-white/20 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
                </DialogTitle>
              </DialogHeader>
              
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
                    <Button
                      type="button"
                      onClick={consultarDocumento}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Consultar
                    </Button>
                  </div>
                </div>

                {formData.tipoPersona === 'natural' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Nombres</Label>
                      <Input
                        value={formData.nombres}
                        onChange={(e) => setFormData({...formData, nombres: e.target.value})}
                        className="glass-effect border-white/20 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-white">Apellidos</Label>
                      <Input
                        value={formData.apellidos}
                        onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                        className="glass-effect border-white/20 text-white"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label className="text-white">Razón Social</Label>
                    <Input
                      value={formData.razonSocial}
                      onChange={(e) => setFormData({...formData, razonSocial: e.target.value})}
                      className="glass-effect border-white/20 text-white"
                      required
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Teléfono</Label>
                    <Input
                      value={formData.telefono}
                      onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                      className="glass-effect border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="glass-effect border-white/20 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white">Dirección</Label>
                  <Input
                    value={formData.direccion}
                    onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                    className="glass-effect border-white/20 text-white"
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
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    {editingCliente ? 'Actualizar' : 'Registrar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

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
                  placeholder="Buscar por nombre, apellido, razón social o documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 glass-effect border-white/20 text-white"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Lista de Clientes ({filteredClientes.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-gray-300">Tipo</TableHead>
                      <TableHead className="text-gray-300">Documento</TableHead>
                      <TableHead className="text-gray-300">Cliente</TableHead>
                      <TableHead className="text-gray-300">Contacto</TableHead>
                      <TableHead className="text-gray-300">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClientes.map((cliente) => (
                      <TableRow key={cliente.id} className="border-white/10 hover:bg-white/5">
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {cliente.tipoPersona === 'natural' ? (
                              <User className="w-4 h-4 text-blue-400" />
                            ) : (
                              <Building className="w-4 h-4 text-purple-400" />
                            )}
                            <span className="text-white capitalize">{cliente.tipoPersona}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-white">
                            <div className="font-medium">{cliente.tipoDocumento}</div>
                            <div className="text-sm text-gray-400">{cliente.numeroDocumento}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-white">
                            {cliente.tipoPersona === 'natural' ? (
                              <div>
                                <div className="font-medium">{cliente.nombres} {cliente.apellidos}</div>
                              </div>
                            ) : (
                              <div className="font-medium">{cliente.razonSocial}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {cliente.telefono && (
                              <div className="flex items-center space-x-1 text-sm text-gray-300">
                                <Phone className="w-3 h-3" />
                                <span>{cliente.telefono}</span>
                              </div>
                            )}
                            {cliente.email && (
                              <div className="flex items-center space-x-1 text-sm text-gray-300">
                                <Mail className="w-3 h-3" />
                                <span>{cliente.email}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(cliente)}
                              className="border-white/20 text-white hover:bg-white/10"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(cliente.id)}
                              className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {filteredClientes.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No se encontraron clientes</p>
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

export default Clientes;