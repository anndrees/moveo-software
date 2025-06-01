import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Autocomplete from '@mui/material/Autocomplete';
import dayjs from 'dayjs';
import Pagination from '@mui/material/Pagination';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

// Formatea el estado: primera letra mayúscula y espacios
function formatearEstado(estado) {
  if (!estado) return '';
  return estado.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export default function AdminReservas() {
  const [filtros, setFiltros] = useState({
    matricula: '',
    cliente: '',
    estado: ''
  });
  
  const [reservas, setReservas] = useState({
    data: [],
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  });
  const [vehiculos, setVehiculos] = useState({
    data: [],
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  });
  const [clientes, setClientes] = useState({
    data: [],
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  });
  const [abrirModal, setAbrirModal] = useState(false);
  const [reservaActual, setReservaActual] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const urlApi = 'http://localhost:8000/api';

  useEffect(() => {
    obtenerReservas(paginaActual);
    obtenerVehiculos();
    obtenerClientes();
  }, [paginaActual]);

  // Manejar cambios en los filtros
  const manejarCambioFiltro = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar búsqueda
  const manejarBuscar = (e) => {
    e.preventDefault();
    obtenerReservas(1);
  };

  // Limpiar filtros y realizar búsqueda
  const limpiarFiltros = (e) => {
    e?.preventDefault();
    
    // Crear un objeto con todos los filtros vacíos
    const filtrosLimpios = {
      matricula: '',
      cliente: '',
      estado: ''
    };
    
    // Actualizar el estado de los filtros
    setFiltros(filtrosLimpios);
    
    // Realizar la búsqueda con los filtros vacíos
    const params = new URLSearchParams({
      page: 1,
      per_page: 10,
      ...filtrosLimpios
    });
    
    obtenerReservas(1, params);
  };

  const obtenerReservas = async (pagina = 1, parametrosBusqueda = null) => {
    setCargando(true);
    try {
      // Usar los parámetros proporcionados o construir desde los filtros actuales
      const params = parametrosBusqueda || new URLSearchParams({
        page: pagina,
        per_page: 10,
        ...(filtros.matricula && { matricula: filtros.matricula }),
        ...(filtros.cliente && { cliente: filtros.cliente }),
        ...(filtros.estado && { estado: filtros.estado })
      });
      
      const resp = await fetch(`${urlApi}/reservas?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error('Error al cargar reservas');
      const data = await resp.json();
      // Ajustar estado automáticamente según la fecha actual, salvo 'pendiente' o 'cancelada'
      const hoy = dayjs();
      const reservasAjustadas = (data.data || []).map(reserva => {
        if (['pendiente', 'cancelada'].includes(reserva.estado)) return reserva;
        const inicio = dayjs(reserva.fecha_inicio);
        const fin = dayjs(reserva.fecha_fin);
        let nuevoEstado = reserva.estado;
        if (hoy.isBefore(inicio, 'day')) {
          nuevoEstado = 'confirmada';
        } else if (hoy.isAfter(fin, 'day')) {
          nuevoEstado = 'finalizada';
        } else if ((hoy.isAfter(inicio.subtract(1, 'day'), 'day') && hoy.isBefore(fin.add(1, 'day'), 'day'))) {
          nuevoEstado = 'en_curso';
        }
        // Si el estado ha cambiado, devolver una copia con el nuevo estado
        return { ...reserva, estado: nuevoEstado };
      });
      setReservas({
        data: reservasAjustadas,
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
        per_page: data.per_page || 10,
        total: data.total || 0
      });
      setPaginaActual(data.current_page || 1);
    } catch (e) {
      console.error('Error al cargar reservas:', e);
      setError('Error al cargar reservas');
    } finally {
      setCargando(false);
    }
  };

  const obtenerVehiculos = async (pagina = 1) => {
    try {
      const resp = await fetch(`${urlApi}/vehiculos?page=${pagina}&per_page=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error('Error al cargar vehículos');
      const data = await resp.json();
      setVehiculos({
        data: data.data || [],
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
        per_page: data.per_page || 100,
        total: data.total || 0
      });
    } catch (e) {
      console.error('Error al cargar vehículos:', e);
      setError('Error al cargar vehículos');
    }
  };

  const obtenerClientes = async (pagina = 1) => {
    try {
      const resp = await fetch(`${urlApi}/clientes?page=${pagina}&per_page=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error('Error al cargar clientes');
      const data = await resp.json();
      setClientes({
        data: data.data || [],
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
        per_page: data.per_page || 100,
        total: data.total || 0
      });
    } catch (e) {
      console.error('Error al cargar clientes:', e);
      setError('Error al cargar clientes');
    }
  };

  const [erroresFormulario, setErroresFormulario] = useState({});

  const abrirCrear = () => {
    setReservaActual({
      vehiculo_id: '',
      cliente_id: '',
      fecha_inicio: '',
      fecha_fin: '',
      estado: '',
    });
    setErroresFormulario({});
    setAbrirModal(true);
  };

  const abrirEditar = (reserva) => {
    setReservaActual({ ...reserva, fecha_inicio: dayjs(reserva.fecha_inicio), fecha_fin: dayjs(reserva.fecha_fin) });
    setErroresFormulario({});
    setAbrirModal(true);
  };

  const cerrarModal = () => {
    setReservaActual(null);
    setAbrirModal(false);
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setReservaActual((prev) => ({ ...prev, [name]: value }));
    setErroresFormulario((prev) => ({ ...prev, [name]: '' }));
  };

  const manejarFechaInicio = (nuevaFecha) => {
    setReservaActual((prev) => ({ ...prev, fecha_inicio: nuevaFecha }));
    setErroresFormulario((prev) => ({ ...prev, fecha_inicio: '' }));
  };

  const manejarFechaFin = (nuevaFecha) => {
    setReservaActual((prev) => ({ ...prev, fecha_fin: nuevaFecha }));
    setErroresFormulario((prev) => ({ ...prev, fecha_fin: '' }));
  };

  const validarFormulario = () => {
    const errores = {};
    if (!reservaActual.vehiculo_id) errores.vehiculo_id = 'El vehículo es obligatorio';
    if (!reservaActual.cliente_id) errores.cliente_id = 'El cliente es obligatorio';
    if (!reservaActual.fecha_inicio) errores.fecha_inicio = 'La fecha de inicio es obligatoria';
    if (!reservaActual.fecha_fin) errores.fecha_fin = 'La fecha de fin es obligatoria';
    if (!reservaActual.estado) errores.estado = 'El estado es obligatorio';
    // Validación de rango de fechas
    if (reservaActual.fecha_inicio && reservaActual.fecha_fin) {
      const inicio = dayjs(reservaActual.fecha_inicio);
      const fin = dayjs(reservaActual.fecha_fin);
      if (fin.isBefore(inicio, 'day')) {
        errores.fecha_fin = 'La fecha de fin no puede ser anterior a la fecha de inicio';
        errores.fecha_inicio = 'La fecha de inicio no puede ser posterior a la fecha de fin';
      }
    }
    return errores;
  };

  const guardarReserva = async () => {
    const errores = validarFormulario();
    if (Object.keys(errores).length > 0) {
      setErroresFormulario(errores);
      return;
    }
    setCargando(true);
    setError('');
    try {
      const metodo = reservaActual.id ? 'PUT' : 'POST';
      const url = reservaActual.id ? `${urlApi}/reservas/${reservaActual.id}` : `${urlApi}/reservas`;
      // Calcular precio_total
      let precio_total;
      const vehiculo = vehiculos.data.find(v => v.id === reservaActual.vehiculo_id);
      if (vehiculo && vehiculo.precio_dia && reservaActual.fecha_inicio && reservaActual.fecha_fin) {
        const inicio = dayjs(reservaActual.fecha_inicio);
        const fin = dayjs(reservaActual.fecha_fin);
        const dias = fin.diff(inicio, 'day') + 1;
        precio_total = dias > 0 ? dias * vehiculo.precio_dia : vehiculo.precio_dia;
      }
      const resp = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...reservaActual,
          fecha_inicio: reservaActual.fecha_inicio ? dayjs(reservaActual.fecha_inicio).format('YYYY-MM-DD') : '',
          fecha_fin: reservaActual.fecha_fin ? dayjs(reservaActual.fecha_fin).format('YYYY-MM-DD') : '',
          precio_total,
        }),
      });
      if (!resp.ok) {
        let mensaje = 'Error al guardar reserva';
        try {
          const errorData = await resp.json();
          if (errorData && (errorData.mensaje || errorData.errores)) {
            mensaje = errorData.mensaje || (Array.isArray(errorData.errores) ? errorData.errores.join(', ') : JSON.stringify(errorData.errores));
          }
        } catch {}
        throw new Error(mensaje);
      }
      cerrarModal();
      obtenerReservas();
    } catch (e) {
      setError(e.message || 'Error al guardar reserva');
    } finally {
      setCargando(false);
    }
  };

  const eliminarReserva = async (id) => {
    setCargando(true);
    setError('');
    try {
      const resp = await fetch(`${urlApi}/reservas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error('Error al eliminar reserva');
      setEliminando(null);
      obtenerReservas();
    } catch (e) {
      setError('Error al eliminar reserva');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', bgcolor: '#f5f5f5', py: 4 }}>
      <Paper elevation={8} sx={{ p: 3, maxWidth: 1200, margin: '0 auto', borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" fontWeight={700}>Gestión de Reservas</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={abrirCrear}>
            Nueva reserva
          </Button>
        </Box>
        {error && <Typography color="error">{error}</Typography>}
        
        {/* Sección de búsqueda */}
        <Paper elevation={2} sx={{ p: 2, mb: 3, mt: 2 }}>
          <form onSubmit={manejarBuscar}>
            <Box display="flex" flexWrap="wrap" gap={2} alignItems="flex-end">
              <TextField
                size="small"
                name="matricula"
                label="Matrícula"
                placeholder="Buscar por matrícula"
                value={filtros.matricula}
                onChange={manejarCambioFiltro}
                sx={{ minWidth: 180, bgcolor: 'white' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DirectionsCarIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                size="small"
                name="cliente"
                label="Cliente"
                placeholder="Buscar por nombre de cliente"
                value={filtros.cliente}
                onChange={manejarCambioFiltro}
                sx={{ minWidth: 220, bgcolor: 'white' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                select
                size="small"
                name="estado"
                label="Estado"
                value={filtros.estado}
                onChange={manejarCambioFiltro}
                sx={{ minWidth: 180, bgcolor: 'white' }}
              >
                <MenuItem value="">Todos los estados</MenuItem>
                <MenuItem value="pendiente">Pendiente</MenuItem>
                <MenuItem value="confirmada">Confirmada</MenuItem>
                <MenuItem value="en_curso">En curso</MenuItem>
                <MenuItem value="completada">Completada</MenuItem>
                <MenuItem value="cancelada">Cancelada</MenuItem>
              </TextField>
              
              <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
                <Button 
                  onClick={limpiarFiltros}
                  variant="outlined"
                  color="inherit"
                  disabled={!filtros.matricula && !filtros.cliente && !filtros.estado}
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
        
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Vehículo</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Fecha inicio</TableCell>
                <TableCell>Fecha fin</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cargando ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">Cargando reservas...</TableCell>
                </TableRow>
              ) : reservas.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">No hay reservas registradas.</TableCell>
                </TableRow>
              ) : (
                reservas.data.map((reserva) => (
                  <TableRow key={reserva.id}>
                    <TableCell>{reserva.vehiculo?.matricula || ''} {reserva.vehiculo?.modelo ? `(${reserva.vehiculo.modelo})` : ''}</TableCell>
                    <TableCell>{reserva.cliente?.nombre || ''} {reserva.cliente?.apellidos || ''}</TableCell>
                    <TableCell>{dayjs(reserva.fecha_inicio).format('DD-MM-YYYY')}</TableCell>
                    <TableCell>{dayjs(reserva.fecha_fin).format('DD-MM-YYYY')}</TableCell>
                    <TableCell>
  <Chip 
    label={formatearEstado(reserva.estado)}
    color={
      reserva.estado === 'pendiente' ? 'default' :
      reserva.estado === 'confirmada' ? 'primary' :
      reserva.estado === 'en_curso' ? 'warning' :
      reserva.estado === 'finalizada' ? 'success' :
      reserva.estado === 'cancelada' ? 'error' : 'default'}
    variant={reserva.estado === 'pendiente' ? 'outlined' : 'filled'}
    sx={{ fontWeight: 600, fontSize: '0.95em', minWidth: 110 }}
  />
</TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="info" 
                        onClick={() => navigate(`/admin/reservations/${reserva.id}`)}
                        title="Ver detalles"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton 
                        color="primary" 
                        onClick={() => abrirEditar(reserva)}
                        title="Editar"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => setEliminando(reserva.id)}
                        title="Eliminar"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {/* Paginación */}
          <Box display="flex" justifyContent="center" mt={4} mb={2}>
            <Pagination
              count={reservas.last_page}
              page={paginaActual}
              onChange={(event, page) => setPaginaActual(page)}
              color="primary"
              shape="rounded"
              showFirstButton
              showLastButton
              disabled={cargando}
              sx={{
                '& .MuiPaginationItem-root': {
                  color: 'text.primary',
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                },
              }}
            />
            {reservas.last_page > 0 && (
              <Box 
                component="span" 
                sx={{ 
                  ml: 2, 
                  display: 'flex', 
                  alignItems: 'center',
                  color: 'text.secondary',
                  fontSize: '0.875rem'
                }}
              >
                {reservas.total} reservas en total
              </Box>
            )}
          </Box>
        </TableContainer>
        {/* Modal Crear/Editar */}
        <Dialog open={abrirModal} onClose={cerrarModal} maxWidth="sm" fullWidth>
          <DialogTitle>{reservaActual?.id ? 'Editar reserva' : 'Nueva reserva'}</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Vehículo *</Typography>
              <Autocomplete
  options={vehiculos.data}
  getOptionLabel={(v) => v && (v.matricula + (v.modelo ? ` (${v.modelo})` : ''))}
  isOptionEqualToValue={(option, value) => option.id === value.id}
  value={vehiculos.data.find(v => v.id === reservaActual?.vehiculo_id) || null}
  onChange={(_, nuevoVehiculo) => {
    setReservaActual(prev => ({ ...prev, vehiculo_id: nuevoVehiculo ? nuevoVehiculo.id : '' }));
    setErroresFormulario(prev => ({ ...prev, vehiculo_id: '' }));
  }}
  renderInput={(params) => (
    <TextField {...params} label="Vehículo *" error={!!erroresFormulario.vehiculo_id} helperText={erroresFormulario.vehiculo_id} fullWidth />
  )}
/>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Cliente *</Typography>
              <Autocomplete
  options={clientes.data}
  getOptionLabel={(c) => c && (c.nombre + (c.apellidos ? ` ${c.apellidos}` : '') + (c.documento_identidad ? ` (${c.documento_identidad})` : ''))}
  isOptionEqualToValue={(option, value) => option.id === value.id}
  value={clientes.data.find(c => c.id === reservaActual?.cliente_id) || null}
  onChange={(_, nuevoCliente) => {
    setReservaActual(prev => ({ ...prev, cliente_id: nuevoCliente ? nuevoCliente.id : '' }));
    setErroresFormulario(prev => ({ ...prev, cliente_id: '' }));
  }}
  renderInput={(params) => (
    <TextField {...params} label="Cliente *" error={!!erroresFormulario.cliente_id} helperText={erroresFormulario.cliente_id} fullWidth />
  )}
/>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Fecha inicio *</Typography>
              <DatePicker
  label="Fecha inicio *"
  value={reservaActual?.fecha_inicio ? dayjs(reservaActual.fecha_inicio) : null}
  onChange={manejarFechaInicio}
  format="DD-MM-YYYY"
  shouldDisableDate={date => reservaActual?.fecha_fin ? date.isAfter(dayjs(reservaActual.fecha_fin), 'day') : false}
  slotProps={{ textField: { fullWidth: true, error: !!erroresFormulario.fecha_inicio, helperText: erroresFormulario.fecha_inicio } }}
/>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Fecha fin *</Typography>
              <DatePicker
  label="Fecha fin *"
  value={reservaActual?.fecha_fin ? dayjs(reservaActual.fecha_fin) : null}
  onChange={manejarFechaFin}
  format="DD-MM-YYYY"
  shouldDisableDate={date => reservaActual?.fecha_inicio ? date.isBefore(dayjs(reservaActual.fecha_inicio), 'day') : false}
  slotProps={{ textField: { fullWidth: true, error: !!erroresFormulario.fecha_fin, helperText: erroresFormulario.fecha_fin } }}
/>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Estado *</Typography>
              <Select
                name="estado"
                value={reservaActual?.estado || ''}
                onChange={manejarCambio}
                error={!!erroresFormulario.estado}
                fullWidth
              >
                <MenuItem value="">Selecciona un estado</MenuItem>
                <MenuItem value="pendiente">Pendiente</MenuItem>
                <MenuItem value="confirmada">Confirmada</MenuItem>
                <MenuItem value="cancelada">Cancelada</MenuItem>
                <MenuItem value="finalizada">Finalizada</MenuItem>
              </Select>
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
            <Button variant="contained" onClick={guardarReserva} disabled={cargando}>
              {reservaActual?.id ? 'Guardar cambios' : 'Crear reserva'}
            </Button>

          </DialogActions>
        </Dialog>
        {/* Confirmación de eliminación */}
        <Dialog open={!!eliminando} onClose={() => setEliminando(null)}>
          <DialogTitle>¿Eliminar reserva?</DialogTitle>
          <DialogActions>
            <Button onClick={() => setEliminando(null)}>Cancelar</Button>
            <Button color="error" onClick={() => eliminarReserva(eliminando)} disabled={cargando}>
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
}
