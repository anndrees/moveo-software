import React, { useEffect, useState } from 'react';
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
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
// Íconos para tipos de mantenimiento
import BuildIcon from '@mui/icons-material/Build'; // Para reparación
import VisibilityIcon from '@mui/icons-material/Visibility'; // Para inspección
import SettingsIcon from '@mui/icons-material/Settings'; // Para configuración general
import LocalCarWashIcon from '@mui/icons-material/LocalCarWash'; // Para lavado
import HandymanIcon from '@mui/icons-material/Handyman'; // Para mantenimiento
import EngineeringIcon from '@mui/icons-material/Engineering'; // Para revisión
import DescriptionIcon from '@mui/icons-material/Description'; // Para otros tipos
import SearchIcon from "@mui/icons-material/Search";
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ClearIcon from '@mui/icons-material/Clear';
import PersonIcon from '@mui/icons-material/Person';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import Pagination from '@mui/material/Pagination';

export default function AdminMantenimientos() {
  const [mantenimientos, setMantenimientos] = useState({
    data: [],
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  });
  const [filtros, setFiltros] = useState({
    matricula: '',
    costo: '',
    taller: '',
    estado: '',
    tipo: ''
  });
  const [vehiculos, setVehiculos] = useState([]);
  const [abrirModal, setAbrirModal] = useState(false);
  const [mantenimientoActual, setMantenimientoActual] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [snackbar, setSnackbar] = useState({ abierto: false, mensaje: '', severidad: 'success' });

  const token = localStorage.getItem('token');
  const urlApi = import.meta.env.DEV ? 'http://localhost:8000/api' : '/api';

  // Función para manejar cambios en los filtros
  const manejarCambioFiltro = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      matricula: '',
      costo: '',
      taller: '',
      estado: '',
      tipo: ''
    });
    obtenerMantenimientos(1);
  };

  // Función para manejar la búsqueda
  const manejarBuscar = (e) => {
    e.preventDefault();
    obtenerMantenimientos(1);
  };

  // Función para limpiar la búsqueda
  const limpiarBusqueda = (e) => {
    e?.preventDefault(); // Prevenir comportamiento por defecto si se llama desde un evento
    
    // Limpiamos los filtros
    const nuevosFiltros = {
      matricula: '',
      costo: '',
      realizado_por: ''
    };
    
    // Actualizamos el estado de los filtros
    setFiltros(nuevosFiltros);
    
    // Realizamos la búsqueda con los filtros vacíos
    const params = new URLSearchParams();
    params.append('page', 1);
    
    // Hacemos la petición directamente para evitar problemas con el estado asíncrono
    fetch(`${urlApi}/mantenimientos?${params.toString()}`, {
      headers: { 
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
    })
    .then(resp => {
      if (!resp.ok) throw new Error('Error al obtener mantenimientos');
      return resp.json();
    })
    .then(data => {
      setMantenimientos(data);
      setPaginaActual(1);
    })
    .catch(error => {
      setError(error.message);
    });
  };

  useEffect(() => {
    obtenerMantenimientos(paginaActual);
    obtenerVehiculos();
  }, [paginaActual]);

  const obtenerMantenimientos = async (pagina = 1) => {
    setCargando(true);
    try {
      // Construir los parámetros de búsqueda
      const params = new URLSearchParams();
      params.append('page', pagina);
      
      // Agregar filtros si existen
      if (filtros.matricula) params.append('matricula', filtros.matricula);
      if (filtros.costo) {
        // Reemplazar coma por punto para el formato numérico
        const costoNormalizado = filtros.costo.replace(',', '.');
        params.append('costo', costoNormalizado);
      }
      if (filtros.taller) params.append('taller', filtros.taller);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.tipo) params.append('tipo', filtros.tipo);
      
      const url = `${urlApi}/mantenimientos?${params.toString()}`;
      
      const resp = await fetch(url, {
        headers: { 
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
      });
      
      if (!resp.ok) throw new Error('Error al obtener mantenimientos');
      
      const data = await resp.json();
      setMantenimientos({
        data: data.data || [],
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
        per_page: data.per_page || 10,
        total: data.total || 0
      });
      setPaginaActual(data.current_page || 1);
    } catch (e) {
      console.error('Error al cargar mantenimientos:', e);
      setError('Error al cargar mantenimientos');
      setSnackbar({
        abierto: true,
        mensaje: 'Error al cargar los mantenimientos',
        severidad: 'error'
      });
    } finally {
      setCargando(false);
    }
  };

  const obtenerVehiculos = async () => {
    try {
      setCargando(true);
      const resp = await fetch(`${urlApi}/vehiculos?todos=1`, {  // Añadido ?todos=1 para asegurar que se obtengan todos los vehículos
        headers: { 
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
      });
      
      if (!resp.ok) {
        throw new Error('Error al cargar vehículos');
      }
      
      const data = await resp.json();
      const listaVehiculos = Array.isArray(data) ? data : (data.data || []);
      
      console.log('Vehículos cargados:', listaVehiculos); // Para depuración
      setVehiculos(listaVehiculos);
      return listaVehiculos; // Devolvemos la lista para usarla si es necesario
    } catch (e) {
      console.error('Error al obtener vehículos:', e);
      setError('Error al cargar vehículos: ' + e.message);
      setVehiculos([]);
      return [];
    } finally {
      setCargando(false);
    }
  };

  const [erroresFormulario, setErroresFormulario] = useState({});

  const abrirCrear = () => {
    setMantenimientoActual({
      titulo: '',
      descripcion: '',
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: '',
      tipo: '',
      costo: '',
      estado: 'programado',
      taller: '',
      factura_numero: '',
      vehiculo_id: '',
      kilometraje: '',
      observaciones: ''
    });
    setErroresFormulario({});
    setAbrirModal(true);
  };

  const abrirEditar = async (mantenimiento) => {
    try {
      setCargando(true);
      
      // Primero nos aseguramos de tener los vehículos más recientes
      const vehiculosActualizados = await obtenerVehiculos();
      
      // Convertir el ID a número para evitar problemas de comparación
      const vehiculoId = parseInt(mantenimiento.vehiculo_id, 10);
      
      // Buscar el vehículo por ID
      const vehiculoEncontrado = vehiculosActualizados.find(v => v.id === vehiculoId);
      
      // Preparar los datos del mantenimiento para el formulario
      const mantenimientoCompleto = {
        ...mantenimiento,
        titulo: mantenimiento.titulo || '',
        descripcion: mantenimiento.descripcion || '',
        fecha_inicio: mantenimiento.fecha_inicio || new Date().toISOString().split('T')[0],
        fecha_fin: mantenimiento.fecha_fin || '',
        tipo: mantenimiento.tipo || '',
        costo: mantenimiento.costo || '',
        estado: mantenimiento.estado || 'programado',
        taller: mantenimiento.taller || '',
        factura_numero: mantenimiento.factura_numero || '',
        // Si no se encuentra el vehículo, establecer como cadena vacía
        vehiculo_id: vehiculoEncontrado ? vehiculoId.toString() : '',
        kilometraje: mantenimiento.kilometraje || '',
        observaciones: mantenimiento.observaciones || ''
      };
      
      // Si no encontramos el vehículo, mostrar un mensaje pero permitir la edición
      if (!vehiculoEncontrado) {
        console.warn('No se encontró el vehículo con ID:', vehiculoId);
        console.log('Vehículos disponibles:', vehiculosActualizados.map(v => v.id));
        
        setSnackbar({
          abierto: true,
          mensaje: `El vehículo con ID ${vehiculoId} no está disponible. Por favor, seleccione otro vehículo.`,
          severidad: 'warning',
          autoHideDuration: 10000
        });
      }
      
      setMantenimientoActual(mantenimientoCompleto);
      setErroresFormulario({});
      setAbrirModal(true);
      
    } catch (error) {
      console.error('Error al abrir el mantenimiento para editar:', error);
      setSnackbar({
        abierto: true,
        mensaje: 'Error al cargar los datos del mantenimiento. Por favor, intente nuevamente.',
        severidad: 'error'
      });
    } finally {
      setCargando(false);
    }
  };

  const cerrarModal = () => {
    setMantenimientoActual(null);
    setAbrirModal(false);
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setMantenimientoActual((prev) => ({ ...prev, [name]: value }));
    setErroresFormulario((prev) => ({ ...prev, [name]: '' }));
  };

  const manejarFecha = (nuevaFecha) => {
    setMantenimientoActual((prev) => ({ ...prev, fecha: nuevaFecha }));
    setErroresFormulario((prev) => ({ ...prev, fecha: '' }));
  };

  const validarFormulario = () => {
    const errores = {};
    // Validar campos obligatorios
    if (!mantenimientoActual.vehiculo_id) {
      errores.vehiculo_id = 'El vehículo es obligatorio';
    } else {
      // Verificar que el vehículo exista en la lista
      const vehiculoExiste = vehiculos.some(v => v.id === mantenimientoActual.vehiculo_id);
      // Si el vehículo no existe, mostramos una advertencia pero permitimos continuar
      if (!vehiculoExiste) {
        console.warn('Validación: El vehículo seleccionado no está en la lista actual');
        // No mostramos error para permitir la edición, pero mostramos un mensaje informativo
        setSnackbar({
          abierto: true,
          mensaje: 'El vehículo asociado no está disponible. Por favor, seleccione otro vehículo.',
          severidad: 'warning',
          autoHideDuration: 6000
        });
      }
    }
    
    if (!mantenimientoActual.titulo) errores.titulo = 'El título es obligatorio';
    if (!mantenimientoActual.fecha_inicio) errores.fecha_inicio = 'La fecha de inicio es obligatoria';
    if (!mantenimientoActual.tipo) errores.tipo = 'El tipo es obligatorio';
    if (mantenimientoActual.costo === '' || mantenimientoActual.costo === null) errores.costo = 'El costo es obligatorio';
    if (!mantenimientoActual.estado) errores.estado = 'El estado es obligatorio';
    
    // Validar formato de fechas
    if (mantenimientoActual.fecha_inicio && mantenimientoActual.fecha_fin) {
      const fechaInicio = new Date(mantenimientoActual.fecha_inicio);
      const fechaFin = new Date(mantenimientoActual.fecha_fin);
      if (fechaFin < fechaInicio) {
        errores.fecha_fin = 'La fecha fin no puede ser anterior a la fecha de inicio';
      }
    }
    
    // Validar que el costo sea un número válido
    if (mantenimientoActual.costo !== '' && isNaN(parseFloat(mantenimientoActual.costo))) {
      errores.costo = 'El costo debe ser un número válido';
    }
    
    return errores;
  };

  const guardarMantenimiento = async () => {
    const errores = validarFormulario();
    if (Object.keys(errores).length > 0) {
      setErroresFormulario(errores);
      return;
    }
    
    setCargando(true);
    setError('');
    
    try {
      // Preparar los datos para enviar al servidor
      const datosEnvio = {
        ...mantenimientoActual,
        // Convertir campos numéricos
        costo: parseFloat(mantenimientoActual.costo) || 0,
        kilometraje: mantenimientoActual.kilometraje ? parseInt(mantenimientoActual.kilometraje, 10) : null,
        mano_obra: parseFloat(mantenimientoActual.mano_obra) || 0,
        materiales: parseFloat(mantenimientoActual.materiales) || 0,
        // Asegurar que las fechas tengan el formato correcto
        fecha_inicio: mantenimientoActual.fecha_inicio,
        fecha_fin: mantenimientoActual.fecha_fin || null,
        // Asegurar que los campos opcionales sean null si están vacíos
        taller: mantenimientoActual.taller || null,
        factura_numero: mantenimientoActual.factura_numero || null,
        descripcion: mantenimientoActual.descripcion || null,
        observaciones: mantenimientoActual.observaciones || null,
        // El campo 'documentos' se manejará por separado
      };
      
      // Eliminar campos que no deben enviarse al servidor
      delete datosEnvio.id; // El ID va en la URL
      
      const metodo = mantenimientoActual.id ? 'PUT' : 'POST';
      const url = mantenimientoActual.id 
        ? `${urlApi}/mantenimientos/${mantenimientoActual.id}` 
        : `${urlApi}/mantenimientos`;
        
      const resp = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(datosEnvio),
      });
      if (!resp.ok) {
        let mensaje = 'Error al guardar mantenimiento';
        try {
          const errorData = await resp.json();
          if (errorData && (errorData.mensaje || errorData.errores)) {
            mensaje = errorData.mensaje || (Array.isArray(errorData.errores) ? errorData.errores.join(', ') : JSON.stringify(errorData.errores));
          }
        } catch {}
        throw new Error(mensaje);
      }
      cerrarModal();
      obtenerMantenimientos();
    } catch (e) {
      setError(e.message || 'Error al guardar mantenimiento');
    } finally {
      setCargando(false);
    }
  };

  const eliminarMantenimiento = async (id) => {
    setCargando(true);
    setError('');
    try {
      const resp = await fetch(`${urlApi}/mantenimientos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error('Error al eliminar mantenimiento');
      setEliminando(null);
      obtenerMantenimientos();
    } catch (e) {
      setError('Error al eliminar mantenimiento');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', bgcolor: '#f5f5f5', py: 4 }}>
      <Paper elevation={8} sx={{ p: 3, maxWidth: 1200, margin: '0 auto', borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h4" fontWeight={700}>Gestión de Mantenimientos</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={abrirCrear}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Nuevo mantenimiento
            </Button>
          </Box>
          
          <Paper elevation={2} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Box component="form" onSubmit={manejarBuscar} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                <TextField
                  size="small"
                  name="matricula"
                  label="Matrícula"
                  placeholder="Buscar por matrícula"
                  value={filtros.matricula}
                  onChange={manejarCambioFiltro}
                  sx={{ minWidth: 200, bgcolor: 'white' }}
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
                  name="costo"
                  label="Costo mínimo"
                  placeholder="0.00"
                  value={filtros.costo}
                  onChange={(e) => {
                    // Solo permitir números y un punto decimal
                    const cleanValue = e.target.value.replace(/[^0-9.]/g, '');
                    setFiltros(prev => ({
                      ...prev,
                      costo: cleanValue
                    }));
                  }}
                  sx={{ minWidth: 180, bgcolor: 'white' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">€</InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  size="small"
                  name="taller"
                  label="Taller"
                  placeholder="Nombre del taller"
                  value={filtros.taller}
                  onChange={manejarCambioFiltro}
                  sx={{ minWidth: 220, bgcolor: 'white' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BuildIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />

                <FormControl size="small" sx={{ minWidth: 200, bgcolor: 'white' }}>
                  <InputLabel>Tipo de mantenimiento</InputLabel>
                  <Select
                    name="tipo"
                    value={filtros.tipo}
                    onChange={manejarCambioFiltro}
                    label="Tipo de mantenimiento"
                  >
                    <MenuItem value="">
                      <em>Todos los tipos</em>
                    </MenuItem>
                    <MenuItem value="revision">Revisión</MenuItem>
                    <MenuItem value="reparacion">Reparación</MenuItem>
                    <MenuItem value="mantenimiento">Mantenimiento</MenuItem>
                    <MenuItem value="inspeccion">Inspección</MenuItem>
                    <MenuItem value="lavado">Lavado</MenuItem>
                    <MenuItem value="otro">Otro</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 200, bgcolor: 'white' }}>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    name="estado"
                    value={filtros.estado}
                    onChange={manejarCambioFiltro}
                    label="Estado"
                  >
                    <MenuItem value="">
                      <em>Todos los estados</em>
                    </MenuItem>
                    <MenuItem value="programado">Programado</MenuItem>
                    <MenuItem value="en_progreso">En progreso</MenuItem>
                    <MenuItem value="completado">Completado</MenuItem>
                    <MenuItem value="cancelado">Cancelado</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 1 }}>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={limpiarFiltros}
                  startIcon={<ClearIcon />}
                >
                  Limpiar filtros
                </Button>
                
                <Button 
                  variant="contained" 
                  color="primary" 
                  type="submit"
                  startIcon={<SearchIcon />}
                >
                  Buscar
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
        {error && <Typography color="error">{error}</Typography>}
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Vehículo</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cargando ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">Cargando mantenimientos...</TableCell>
                </TableRow>
              ) : mantenimientos.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">No hay mantenimientos registrados.</TableCell>
                </TableRow>
              ) : (
                mantenimientos.data.map((mantenimiento) => {
                  // Icono según tipo
                  let iconoTipo = null;
                  const estiloIcono = { verticalAlign: 'middle', fontSize: '1.2rem', marginRight: 1 };
                  
                  switch(mantenimiento.tipo) {
                    case 'inspeccion':
                      iconoTipo = <SearchIcon sx={{ ...estiloIcono, color: '#1976d2' }} />;
                      break;
                    case 'reparacion':
                      iconoTipo = <BuildIcon sx={{ ...estiloIcono, color: '#d32f2f' }} />;
                      break;
                    case 'mantenimiento':
                      iconoTipo = <HandymanIcon sx={{ ...estiloIcono, color: '#388e3c' }} />;
                      break;
                    case 'revision':
                      iconoTipo = <EngineeringIcon sx={{ ...estiloIcono, color: '#7b1fa2' }} />;
                      break;
                    case 'lavado':
                      iconoTipo = <LocalCarWashIcon sx={{ ...estiloIcono, color: '#0288d1' }} />;
                      break;
                    default:
                      iconoTipo = <DescriptionIcon sx={{ ...estiloIcono, color: '#757575' }} />;
                  }
                  
                  // Estado pill
                  let colorEstado = '#e0e0e0', textoEstado = '';
                  const estado = mantenimiento.estado.toLowerCase().replace('_', ' ');
                  
                  switch(estado) {
                    case 'completado':
                      colorEstado = '#a5e5a5';
                      textoEstado = 'Completado';
                      break;
                    case 'en progreso':
                    case 'en_progreso':
                      colorEstado = '#a4c9f7';
                      textoEstado = 'En progreso';
                      break;
                    case 'programado':
                      colorEstado = '#ffe49c';
                      textoEstado = 'Programado';
                      break;
                    case 'cancelado':
                      colorEstado = '#ffcdd2';
                      textoEstado = 'Cancelado';
                      break;
                    default:
                      // Convertir a formato de título (primera letra mayúscula, resto minúsculas)
                      textoEstado = estado
                        .split(' ')
                        .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
                        .join(' ');
                  }
                  return (
                    <TableRow key={mantenimiento.id}>
                      <TableCell>{mantenimiento.vehiculo?.matricula || ''} {mantenimiento.vehiculo?.modelo ? `(${mantenimiento.vehiculo.modelo})` : ''}</TableCell>
                      <TableCell>{dayjs(mantenimiento.fecha).format('DD-MM-YYYY')}</TableCell>
                      <TableCell>
                        <span style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                          {iconoTipo}
                          <span style={{ marginLeft: 4, whiteSpace: 'nowrap' }}>
                            {mantenimiento.tipo?.charAt(0)?.toUpperCase() + mantenimiento.tipo?.slice(1) || ''}
                          </span>
                        </span>
                      </TableCell>
                      <TableCell>
                        <span style={{
                          background: colorEstado,
                          color: '#222',
                          borderRadius: 12,
                          padding: '2px 12px',
                          fontWeight: 600,
                          fontSize: 13,
                          display: 'inline-block'
                        }}>
                          {textoEstado}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                          <IconButton color="info" size="small" disabled><VisibilityIcon fontSize="small" /></IconButton>
                          <IconButton color="primary" size="small" onClick={() => abrirEditar(mantenimiento)}><EditIcon fontSize="small" /></IconButton>
                          <IconButton color="error" size="small" onClick={() => setEliminando(mantenimiento.id)}><DeleteIcon fontSize="small" /></IconButton>
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <Box display="flex" justifyContent="center" mt={2} mb={2}>
            <Pagination
              count={mantenimientos.last_page}
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
          <DialogTitle>{mantenimientoActual?.id ? 'Editar mantenimiento' : 'Nuevo mantenimiento'}</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Vehículo *</Typography>
                <Select
                  name="vehiculo_id"
                  value={mantenimientoActual?.vehiculo_id || ''}
                  onChange={manejarCambio}
                  error={!!erroresFormulario.vehiculo_id}
                  fullWidth
                >
                  <MenuItem value="">Selecciona un vehículo</MenuItem>
                  {vehiculos.map((v) => (
                    <MenuItem key={v.id} value={v.id}>{v.matricula} {v.modelo ? `(${v.modelo})` : ''}</MenuItem>
                  ))}
                </Select>
              </Box>
              
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Título *</Typography>
                <TextField
                  name="titulo"
                  value={mantenimientoActual?.titulo || ''}
                  onChange={manejarCambio}
                  error={!!erroresFormulario.titulo}
                  helperText={erroresFormulario.titulo}
                  fullWidth
                />
              </Box>
              
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Fecha Inicio *</Typography>
                  <DatePicker
                    label="Fecha Inicio *"
                    value={mantenimientoActual?.fecha_inicio ? dayjs(mantenimientoActual.fecha_inicio) : null}
                    onChange={(date) => manejarCambio({ target: { name: 'fecha_inicio', value: date?.format('YYYY-MM-DD') || '' } })}
                    format="DD/MM/YYYY"
                    slotProps={{ 
                      textField: { 
                        fullWidth: true, 
                        error: !!erroresFormulario.fecha_inicio, 
                        helperText: erroresFormulario.fecha_inicio 
                      } 
                    }}
                  />
                </Box>
                
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Fecha Fin</Typography>
                  <DatePicker
                    label="Fecha Fin"
                    value={mantenimientoActual?.fecha_fin ? dayjs(mantenimientoActual.fecha_fin) : null}
                    onChange={(date) => manejarCambio({ target: { name: 'fecha_fin', value: date?.format('YYYY-MM-DD') || '' } })}
                    format="DD/MM/YYYY"
                    slotProps={{ 
                      textField: { 
                        fullWidth: true 
                      } 
                    }}
                  />
                </Box>
              </LocalizationProvider>
              
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Tipo *</Typography>
                <Select
                  name="tipo"
                  value={mantenimientoActual?.tipo || ''}
                  onChange={manejarCambio}
                  error={!!erroresFormulario.tipo}
                  fullWidth
                >
                  <MenuItem value="">Selecciona un tipo</MenuItem>
                  <MenuItem value="revision">Revisión</MenuItem>
                  <MenuItem value="reparacion">Reparación</MenuItem>
                  <MenuItem value="mantenimiento">Mantenimiento</MenuItem>
                  <MenuItem value="inspeccion">Inspección</MenuItem>
                  <MenuItem value="lavado">Lavado</MenuItem>
                  <MenuItem value="otro">Otro</MenuItem>
                </Select>
              </Box>
              

              
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Costo (€) *</Typography>
                <TextField
                  name="costo"
                  type="number"
                  value={mantenimientoActual?.costo || ''}
                  onChange={manejarCambio}
                  error={!!erroresFormulario.costo}
                  helperText={erroresFormulario.costo}
                  fullWidth
                  inputProps={{ step: '0.01', min: '0' }}
                />
              </Box>
              
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Estado *</Typography>
                <Select
                  name="estado"
                  value={mantenimientoActual?.estado || 'programado'}
                  onChange={manejarCambio}
                  error={!!erroresFormulario.estado}
                  fullWidth
                >
                  <MenuItem value="programado">Programado</MenuItem>
                  <MenuItem value="en_progreso">En progreso</MenuItem>
                  <MenuItem value="completado">Completado</MenuItem>
                  <MenuItem value="cancelado">Cancelado</MenuItem>
                </Select>
              </Box>
              
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Taller</Typography>
                <TextField
                  name="taller"
                  value={mantenimientoActual?.taller || ''}
                  onChange={manejarCambio}
                  fullWidth
                />
              </Box>
              
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Nº Factura</Typography>
                <TextField
                  name="factura_numero"
                  value={mantenimientoActual?.factura_numero || ''}
                  onChange={manejarCambio}
                  fullWidth
                />
              </Box>
              

              
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Kilometraje</Typography>
                <TextField
                  name="kilometraje"
                  type="number"
                  value={mantenimientoActual?.kilometraje || ''}
                  onChange={manejarCambio}
                  fullWidth
                  inputProps={{ min: '0' }}
                />
              </Box>
              
              <Box gridColumn="1 / -1">
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Descripción</Typography>
                <TextField
                  name="descripcion"
                  value={mantenimientoActual?.descripcion || ''}
                  onChange={manejarCambio}
                  multiline
                  rows={3}
                  fullWidth
                />
              </Box>
              
              <Box gridColumn="1 / -1">
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Observaciones</Typography>
                <TextField
                  name="observaciones"
                  value={mantenimientoActual?.observaciones || ''}
                  onChange={manejarCambio}
                  multiline
                  rows={3}
                  fullWidth
                />
              </Box>
              

              
              {/* Sección para subir documentos */}
              <Box gridColumn="1 / -1">
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Documentos adjuntos</Typography>
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    // Aquí iría la lógica para manejar la subida de archivos
                    console.log('Archivos seleccionados:', e.target.files);
                  }}
                />
              </Box>
            </Box>
            
            {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
            {Object.values(erroresFormulario).some(Boolean) && (
              <Typography color="error" sx={{ mt: 2 }}>
                Por favor, revisa los campos obligatorios marcados con *
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={cerrarModal}>Cancelar</Button>
            <Button variant="contained" onClick={guardarMantenimiento} disabled={cargando}>
              {mantenimientoActual?.id ? 'Guardar cambios' : 'Crear mantenimiento'}
            </Button>

          </DialogActions>
        </Dialog>
        {/* Confirmación de eliminación */}
        <Dialog open={!!eliminando} onClose={() => setEliminando(null)}>
          <DialogTitle>¿Eliminar mantenimiento?</DialogTitle>
          <DialogActions>
            <Button onClick={() => setEliminando(null)}>Cancelar</Button>
            <Button color="error" onClick={() => eliminarMantenimiento(eliminando)} disabled={cargando}>
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
}
