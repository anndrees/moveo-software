import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import VisibilityIcon from '@mui/icons-material/Visibility';

import React, { useEffect, useState } from 'react';

export default function AdminClientes() {
  const [clientes, setClientes] = useState([]);
  const [abrirModal, setAbrirModal] = useState(false);
  const [clienteActual, setClienteActual] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const urlApi = import.meta.env.DEV ? 'http://localhost:8000/api' : '/api';

  useEffect(() => {
    obtenerClientes();
  }, []);

  const obtenerClientes = async () => {
    setCargando(true);
    try {
      const resp = await fetch(`${urlApi}/clientes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      // Filtrar sólo clientes con rol 'cliente' si la API devuelve usuarios de otros tipos
      setClientes(Array.isArray(data) ? data.filter(c => !c.rol || c.rol === 'cliente') : []);
    } catch (e) {
      setError('Error al cargar clientes');
    } finally {
      setCargando(false);
    }
  };

  const [erroresFormulario, setErroresFormulario] = useState({});
  const [codigoPais, setCodigoPais] = useState('+34');

  const abrirCrear = () => {
    setClienteActual({
      nombre: '',
      apellidos: '',
      email: '',
      telefono: '',
      documento_identidad: '',
    });
    setCodigoPais('+34');
    setErroresFormulario({});
    setAbrirModal(true);
  };

  const abrirEditar = (cliente) => {
    // Extraer código de país y número
    let codigo = '+34';
    let numero = '';
    if (cliente.telefono) {
      const match = cliente.telefono.match(/^(\+\d+)\s?(.*)$/);
      if (match) {
        codigo = match[1];
        numero = match[2];
      } else {
        numero = cliente.telefono;
      }
    }
    setClienteActual({ ...cliente, telefono: numero });
    setCodigoPais(codigo);
    setErroresFormulario({});
    setAbrirModal(true);
  };

  const cerrarModal = () => {
    setClienteActual(null);
    setAbrirModal(false);
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setClienteActual((prev) => ({ ...prev, [name]: value }));
    setErroresFormulario((prev) => ({ ...prev, [name]: '' }));
  };

  const validarFormulario = () => {
    const errores = {};
    if (!clienteActual.nombre) errores.nombre = 'El nombre es obligatorio';
    if (!clienteActual.apellidos) errores.apellidos = 'Los apellidos son obligatorios';
    if (!clienteActual.email) errores.email = 'El email es obligatorio';
    if (!clienteActual.telefono) errores.telefono = 'El teléfono es obligatorio';
    if (!clienteActual.documento_identidad) errores.documento_identidad = 'El documento es obligatorio';
    return errores;
  };

  const guardarCliente = async () => {
    const errores = validarFormulario();
    if (Object.keys(errores).length > 0) {
      setErroresFormulario(errores);
      return;
    }
    setCargando(true);
    setError('');
    try {
      // Unir código de país y teléfono
      const telefonoCompleto = (codigoPais || '+34') + ' ' + (clienteActual.telefono || '');
      const datosEnviar = { ...clienteActual, telefono: telefonoCompleto };
      const metodo = clienteActual.id ? 'PUT' : 'POST';
      const url = clienteActual.id ? `${urlApi}/clientes/${clienteActual.id}` : `${urlApi}/clientes`;
      const resp = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(datosEnviar),
      });
      if (!resp.ok) {
        let mensaje = 'Error al guardar cliente';
        try {
          const errorData = await resp.json();
          if (errorData && errorData.errores) {
            setErroresFormulario(prev => ({
              ...prev,
              ...Object.fromEntries(Object.entries(errorData.errores).map(([campo, arr]) => [campo, arr[0]]))
            }));
            mensaje = errorData.mensaje || 'Error de validación';
          } else if (errorData && errorData.mensaje) {
            mensaje = errorData.mensaje;
          }
        } catch {}
        throw new Error(mensaje);
      }
      cerrarModal();
      obtenerClientes();
    } catch (e) {
      setError(e.message || 'Error al guardar cliente');
    } finally {
      setCargando(false);
    }
  };

  const eliminarCliente = async (id) => {
    setCargando(true);
    setError('');
    try {
      let idApi = id;
      // Si el id empieza por 'C', es un cliente de la tabla clientes
      if (typeof id === 'string' && id.startsWith('C')) {
        idApi = id.substring(1);
      }
      const resp = await fetch(`${urlApi}/clientes/${idApi}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error('Error al eliminar cliente');
      setEliminando(null);
      obtenerClientes();
    } catch (e) {
      setError('Error al eliminar cliente');
    } finally {
      setCargando(false);
    }
  };


  // Estado para filtro de búsqueda
  const [filtro, setFiltro] = useState('');
  const clientesFiltrados = clientes.filter(c =>
    (c.nombre + ' ' + (c.apellidos || '') + ' ' + (c.email || '')).toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', bgcolor: '#f5f5f5', py: 4 }}>
      <Paper elevation={8} sx={{ p: 3, maxWidth: 1400, margin: '0 auto', borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, gap: 2, mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>Clientes</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={abrirCrear} sx={{ alignSelf: { xs: 'stretch', md: 'auto' } }}>
            Añadir cliente
          </Button>
        </Box>
        <TextField
          placeholder="Buscar clientes por nombre o email..."
          variant="outlined"
          size="small"
          fullWidth
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          sx={{ mb: 2 }}
        />
        {error && <Typography color="error">{error}</Typography>}
        <TableContainer component={Paper} sx={{ mt: 0, boxShadow: 0 }}>
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Contacto</TableCell>
                <TableCell>Documento</TableCell>
                <TableCell>Fecha alta</TableCell>
                <TableCell>Total reservas</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientesFiltrados.map(cliente => (
                <TableRow key={cliente.id}>
                  <TableCell sx={{ fontWeight: 600 }}>{cliente.id}</TableCell>
                  <TableCell>
                    <Typography fontWeight={700}>{cliente.nombre} {cliente.apellidos}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2">{cliente.email}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2">{cliente.telefono}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{cliente.documento_identidad || cliente.documento}</TableCell>
                  <TableCell>{cliente.fecha_alta ? new Date(cliente.fecha_alta).toLocaleDateString() : '--'}</TableCell>
                  <TableCell>{cliente.total_reservas ?? '--'}</TableCell>
                  <TableCell align="center">
                    <IconButton color="info" sx={{ mr: 1 }} onClick={() => abrirEditar(cliente)} aria-label="Ver">
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton color="primary" onClick={() => abrirEditar(cliente)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => setEliminando(cliente.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>


        {/* Modal Crear/Editar */}
        <Dialog open={abrirModal} onClose={cerrarModal} maxWidth="sm" fullWidth>
          <DialogTitle>{clienteActual?.id ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Nombre *"
              name="nombre"
              value={clienteActual?.nombre || ''}
              onChange={manejarCambio}
              error={!!erroresFormulario.nombre}
              helperText={erroresFormulario.nombre}
              fullWidth
            />
            <TextField
              margin="dense"
              label="Apellidos *"
              name="apellidos"
              value={clienteActual?.apellidos || ''}
              onChange={manejarCambio}
              error={!!erroresFormulario.apellidos}
              helperText={erroresFormulario.apellidos}
              fullWidth
            />
            <TextField
              margin="dense"
              label="Email *"
              name="email"
              type="email"
              value={clienteActual?.email || ''}
              onChange={manejarCambio}
              error={!!erroresFormulario.email}
              helperText={erroresFormulario.email}
              fullWidth
            />
            <TextField
              margin="dense"
              label="Teléfono *"
              name="telefono"
              value={clienteActual?.telefono || ''}
              onChange={manejarCambio}
              error={!!erroresFormulario.telefono}
              helperText={erroresFormulario.telefono}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TextField
                      select
                      value={codigoPais}
                      onChange={e => setCodigoPais(e.target.value)}
                      variant="standard"
                      sx={{ width: 70, mr: 1 }}
                      inputProps={{ style: { fontSize: 14, padding: 0 } }}
                    >
                      {[
                        { codigo: '+34', pais: 'ES', nombre: 'España' },
                        { codigo: '+33', pais: 'FR', nombre: 'Francia' },
                        { codigo: '+39', pais: 'IT', nombre: 'Italia' },
                        { codigo: '+44', pais: 'GB', nombre: 'Reino Unido' },
                        { codigo: '+49', pais: 'DE', nombre: 'Alemania' },
                        { codigo: '+31', pais: 'NL', nombre: 'Países Bajos' },
                        { codigo: '+32', pais: 'BE', nombre: 'Bélgica' },
                        { codigo: '+41', pais: 'CH', nombre: 'Suiza' },
                      ].map(op => (
                        <MenuItem key={op.codigo} value={op.codigo}>
                          <span style={{ fontSize: 14 }}>{op.codigo}</span>
                        </MenuItem>
                      ))}
                    </TextField>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              margin="dense"
              label="Documento de identidad *"
              name="documento_identidad"
              value={clienteActual?.documento_identidad || ''}
              onChange={manejarCambio}
              error={!!erroresFormulario.documento_identidad}
              helperText={erroresFormulario.documento_identidad}
              fullWidth
            />
            {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
            {Object.values(erroresFormulario).some(Boolean) && (
              <Typography color="error" sx={{ mt: 2 }}>
                Por favor, revisa los campos obligatorios marcados con *
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={cerrarModal}>Cancelar</Button>
            <Button variant="contained" onClick={guardarCliente} disabled={cargando}>
              {clienteActual?.id ? 'Guardar cambios' : 'Crear cliente'}
            </Button>

          </DialogActions>
        </Dialog>
        {/* Confirmación de eliminación */}
        <Dialog open={!!eliminando} onClose={() => setEliminando(null)}>
          <DialogTitle>¿Eliminar cliente?</DialogTitle>
          <DialogActions>
            <Button onClick={() => setEliminando(null)}>Cancelar</Button>
            <Button color="error" onClick={() => eliminarCliente(eliminando)} disabled={cargando}>
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
}
