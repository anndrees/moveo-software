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
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Pagination from '@mui/material/Pagination';

import React, { useEffect, useState } from 'react';

export default function AdminClientes() {
  const [filtros, setFiltros] = useState({
    nombre: '',
    email: '',
    telefono: '',
    documento_identidad: ''
  });
  
  const [clientes, setClientes] = useState({
    data: [],
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0
  });
  const [abrirModal, setAbrirModal] = useState(false);
  const [clienteActual, setClienteActual] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [snackbar, setSnackbar] = useState({ abierto: false, mensaje: '', severidad: 'success' });

  const token = localStorage.getItem('token');
  const urlApi = import.meta.env.DEV ? 'http://localhost:8000/api' : '/api';

  useEffect(() => {
    obtenerClientes(paginaActual);
  }, [paginaActual]);

  // Manejar búsqueda
  const manejarBuscar = (e) => {
    e.preventDefault();
    obtenerClientes(1); // Volver a la primera página al realizar una nueva búsqueda
  };

  // Limpiar filtros y realizar búsqueda
  const limpiarFiltros = (e) => {
    e?.preventDefault();
    
    // Crear un objeto con todos los filtros vacíos
    const filtrosLimpios = {
      nombre: '',
      email: '',
      telefono: '',
      documento_identidad: ''
    };
    
    // Actualizar el estado de los filtros
    setFiltros(filtrosLimpios);
    
    // Realizar la búsqueda con los filtros vacíos
    const params = new URLSearchParams({
      page: 1,
      per_page: 12,
      ...filtrosLimpios
    });
    
    obtenerClientes(1, params);
  };

  const obtenerClientes = async (pagina = 1, parametrosBusqueda = null) => {
    setCargando(true);
    try {
      // Usar los parámetros proporcionados o construir desde los filtros actuales
      const params = parametrosBusqueda || new URLSearchParams({
        page: pagina,
        per_page: 12,
        ...(filtros.nombre && { nombre: filtros.nombre }),
        ...(filtros.email && { email: filtros.email }),
        ...(filtros.telefono && { telefono: filtros.telefono }),
        ...(filtros.documento_identidad && { documento_identidad: filtros.documento_identidad })
      });
      
      console.log(`Obteniendo clientes, página ${pagina}...`);
      const resp = await fetch(`${urlApi}/clientes?${params.toString()}`, {
        headers: { 
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
      });
      
      console.log('Respuesta recibida, estado:', resp.status);
      
      if (!resp.ok) {
        throw new Error(`Error HTTP: ${resp.status}`);
      }
      
      const data = await resp.json();
      console.log('Datos recibidos:', data);
      
      // Convertir el objeto de datos a array si es necesario
      let clientesData = [];
      if (Array.isArray(data.data)) {
        clientesData = data.data;
      } else if (data.data && typeof data.data === 'object') {
        // Si data es un objeto, convertirlo a array
        clientesData = Object.values(data.data);
      }
      
      // Actualizar el estado con los datos formateados
      setClientes({
        data: clientesData,
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
        per_page: data.per_page || 12,
        total: data.total || clientesData.length
      });
      
      console.log('Clientes actualizados:', clientesData);
      
    } catch (e) {
      console.error('Error al cargar clientes:', e);
      setError('Error al cargar los clientes');
      setSnackbar({
        abierto: true,
        mensaje: 'Error al cargar los clientes: ' + e.message,
        severidad: 'error'
      });
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
      tipo_documento: 'dni',
      fecha_nacimiento: '',
      direccion: '',
      codigo_postal: '',
      ciudad: '',
      pais: 'España',
      notas: ''
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
    if (!clienteActual.nombre?.trim()) errores.nombre = 'El nombre es obligatorio';
    if (!clienteActual.apellidos?.trim()) errores.apellidos = 'Los apellidos son obligatorios';
    if (!clienteActual.email?.trim()) errores.email = 'El email es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(clienteActual.email)) {
      errores.email = 'El email no es válido';
    }
    if (!clienteActual.telefono?.trim()) errores.telefono = 'El teléfono es obligatorio';
    if (!clienteActual.documento_identidad?.trim()) errores.documento_identidad = 'El documento es obligatorio';
    if (!clienteActual.tipo_documento) errores.tipo_documento = 'El tipo de documento es obligatorio';
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
  
  // Función para manejar el cambio en el filtro de búsqueda
  const manejarCambioFiltro = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Si hay un filtro aplicado, volvemos a la primera página
    if (value) {
      setPaginaActual(1);
    }
  };
  
  // Aplicar filtro a los clientes
  const clientesFiltrados = filtro 
    ? clientes.data.filter(c =>
        (c.nombre + ' ' + (c.apellidos || '') + ' ' + (c.email || '') + ' ' + (c.documento_identidad || ''))
          .toLowerCase()
          .includes(filtro.toLowerCase())
      )
    : clientes.data;

  const paises = ['España', 'Portugal', 'Francia', 'Reino Unido', 'Italia', 'Alemania', 'Estados Unidos', 'México', 'Argentina', 'Chile', 'Colombia', 'Perú', 'Otro'];
  const tiposDocumento = [
    { valor: 'dni', etiqueta: 'DNI/NIE' },
    { valor: 'pasaporte', etiqueta: 'Pasaporte' },
    { valor: 'otro', etiqueta: 'Otro' }
  ];

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', bgcolor: '#f5f5f5', py: 4 }}>
      <Paper elevation={8} sx={{ p: 3, maxWidth: 1400, margin: '0 auto', borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, gap: 2, mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>Clientes</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={abrirCrear} sx={{ alignSelf: { xs: 'stretch', md: 'auto' } }}>
            Añadir cliente
          </Button>
        </Box>
        {/* Sección de búsqueda */}
        <Paper elevation={2} sx={{ p: 2, mb: 3, mt: 2 }}>
          <form onSubmit={manejarBuscar}>
            <Box display="flex" flexWrap="wrap" gap={2} alignItems="flex-end">
              <TextField
                size="small"
                name="nombre"
                label="Nombre"
                placeholder="Buscar por nombre"
                value={filtros.nombre}
                onChange={manejarCambioFiltro}
                sx={{ minWidth: 200, bgcolor: 'white' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                size="small"
                name="email"
                label="Email"
                placeholder="Buscar por email"
                value={filtros.email}
                onChange={manejarCambioFiltro}
                sx={{ minWidth: 250, bgcolor: 'white' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                size="small"
                name="telefono"
                label="Teléfono"
                placeholder="Buscar por teléfono"
                value={filtros.telefono}
                onChange={manejarCambioFiltro}
                sx={{ minWidth: 180, bgcolor: 'white' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                size="small"
                name="documento_identidad"
                label="Documento de identidad"
                placeholder="Buscar por documento"
                value={filtros.documento_identidad}
                onChange={manejarCambioFiltro}
                sx={{ minWidth: 220, bgcolor: 'white' }}
              />
              
              <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
                <Button 
                  onClick={limpiarFiltros}
                  variant="outlined"
                  color="inherit"
                  disabled={!filtros.nombre && !filtros.email && !filtros.telefono && !filtros.documento_identidad}
                >
                  Limpiar Filtros
                </Button>
                <Button type="submit" variant="contained" color="primary" startIcon={<SearchIcon />}>
                  Buscar
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
        
        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
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
              {cargando ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">Cargando clientes...</TableCell>
                </TableRow>
              ) : clientes.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">No hay clientes registrados</TableCell>
                </TableRow>
              ) : (
                clientes.data.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell sx={{ fontWeight: 600 }}>{cliente.id}</TableCell>
                    <TableCell>
                      <Typography fontWeight={700}>{cliente.nombre} {cliente.apellidos}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">{cliente.email}</Typography>
                        </Box>
                        {cliente.telefono && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">{cliente.telefono}</Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{cliente.documento_identidad || '--'}</TableCell>
                    <TableCell>{cliente.created_at ? new Date(cliente.created_at).toLocaleDateString() : '--'}</TableCell>
                    <TableCell>{cliente.total_reservas || 0}</TableCell>
                    <TableCell align="center">
                      <IconButton color="primary" size="small" onClick={() => abrirEditar(cliente)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton color="error" size="small" onClick={() => setEliminando(cliente.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <Box display="flex" justifyContent="center" mt={2} mb={2}>
            <Pagination
              count={clientes.last_page}
              page={paginaActual}
              onChange={(event, page) => setPaginaActual(page)}
              color="primary"
              showFirstButton
              showLastButton
              disabled={cargando}
            />
          </Box>
        </TableContainer>

        {/* Modal Crear/Editar */}
        <Dialog open={abrirModal} onClose={cerrarModal} maxWidth="md" fullWidth>
          <DialogTitle>{clienteActual?.id ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Información personal</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Nombre *"
                  name="nombre"
                  value={clienteActual?.nombre || ''}
                  onChange={manejarCambio}
                  error={!!erroresFormulario.nombre}
                  helperText={erroresFormulario.nombre}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Apellidos *"
                  name="apellidos"
                  value={clienteActual?.apellidos || ''}
                  onChange={manejarCambio}
                  error={!!erroresFormulario.apellidos}
                  helperText={erroresFormulario.apellidos}
                  fullWidth
                  margin="normal"
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  select
                  label="Tipo de documento *"
                  name="tipo_documento"
                  value={clienteActual?.tipo_documento || 'dni'}
                  onChange={manejarCambio}
                  error={!!erroresFormulario.tipo_documento}
                  helperText={erroresFormulario.tipo_documento}
                  sx={{ minWidth: '200px' }}
                  margin="normal"
                >
                  {tiposDocumento.map((tipo) => (
                    <MenuItem key={tipo.valor} value={tipo.valor}>
                      {tipo.etiqueta}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Número de documento *"
                  name="documento_identidad"
                  value={clienteActual?.documento_identidad || ''}
                  onChange={manejarCambio}
                  error={!!erroresFormulario.documento_identidad}
                  helperText={erroresFormulario.documento_identidad}
                  fullWidth
                  margin="normal"
                />
              </Box>

              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Información de contacto</Typography>
              
              <TextField
                label="Email *"
                name="email"
                type="email"
                value={clienteActual?.email || ''}
                onChange={manejarCambio}
                error={!!erroresFormulario.email}
                helperText={erroresFormulario.email}
                fullWidth
                margin="normal"
              />

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <TextField
                  select
                  label="Código"
                  value={codigoPais}
                  onChange={(e) => setCodigoPais(e.target.value)}
                  sx={{ 
                    minWidth: '140px',
                    '& .MuiInputBase-root': {
                      height: '56px',
                      display: 'flex',
                      alignItems: 'center'
                    }
                  }}
                  margin="normal"
                >
                  <MenuItem value="+34">+34 (ES)</MenuItem>
                  <MenuItem value="+351">+351 (PT)</MenuItem>
                  <MenuItem value="+33">+33 (FR)</MenuItem>
                  <MenuItem value="+39">+39 (IT)</MenuItem>
                  <MenuItem value="+49">+49 (DE)</MenuItem>
                  <MenuItem value="+44">+44 (UK)</MenuItem>
                  <MenuItem value="+1">+1 (US/CA)</MenuItem>
                  <MenuItem value="+52">+52 (MX)</MenuItem>
                  <MenuItem value="+54">+54 (AR)</MenuItem>
                  <MenuItem value="+56">+56 (CL)</MenuItem>
                  <MenuItem value="+57">+57 (CO)</MenuItem>
                  <MenuItem value="+51">+51 (PE)</MenuItem>
                </TextField>
                <TextField
                  label="Teléfono *"
                  name="telefono"
                  type="tel"
                  value={clienteActual?.telefono || ''}
                  onChange={manejarCambio}
                  error={!!erroresFormulario.telefono}
                  helperText={erroresFormulario.telefono}
                  fullWidth
                  margin="normal"
                  sx={{
                    '& .MuiInputBase-root': {
                      height: '56px',
                      display: 'flex',
                      alignItems: 'center'
                    }
                  }}
                />
              </Box>

              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Dirección</Typography>
              
              <TextField
                label="Dirección"
                name="direccion"
                value={clienteActual?.direccion || ''}
                onChange={manejarCambio}
                fullWidth
                margin="normal"
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Código postal"
                  name="codigo_postal"
                  value={clienteActual?.codigo_postal || ''}
                  onChange={manejarCambio}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Ciudad"
                  name="ciudad"
                  value={clienteActual?.ciudad || ''}
                  onChange={manejarCambio}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  select
                  label="País"
                  name="pais"
                  value={clienteActual?.pais || 'España'}
                  onChange={manejarCambio}
                  fullWidth
                  margin="normal"
                >
                  {paises.map((pais) => (
                    <MenuItem key={pais} value={pais}>
                      {pais}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <TextField
                label="Notas adicionales"
                name="notas"
                value={clienteActual?.notas || ''}
                onChange={manejarCambio}
                multiline
                rows={3}
                fullWidth
                margin="normal"
              />
            </Box>
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
