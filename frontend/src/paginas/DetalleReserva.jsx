import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Paper, 
  Typography, 
  IconButton, 
  Divider, 
  Chip, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Print as PrintIcon,
  DirectionsCar as DirectionsCarIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Euro as EuroIcon,
  CreditCard as CreditCardIcon,
  Security as SecurityIcon,
  Note as NoteIcon,
  Timeline as TimelineIcon,
  LocalGasStation as LocalGasStationIcon,
  Speed as SpeedIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es');

// Componente para mostrar estadísticas de la reserva
const EstadisticasReserva = ({ reserva }) => {
  if (!reserva) return null;
  
  const estadisticas = [
    { icon: <DirectionsCarIcon />, primary: 'Kilómetros incluidos', secondary: 'Sin límite' },
    { icon: <LocalGasStationIcon />, primary: 'Combustible', secondary: 'Depósito completo / Depósito completo' },
    { icon: <SecurityIcon />, primary: 'Seguro', secondary: 'A todo riesgo con franquicia' },
    { icon: <PersonIcon />, primary: 'Conductores', secondary: '1 conductor incluido' },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Detalles Adicionales</Typography>
        <Divider sx={{ mb: 2 }} />
        <List>
          {estadisticas.map((item, index) => (
            <ListItem key={index} disableGutters>
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.primary} 
                primaryTypographyProps={{ variant: 'body2' }}
                secondary={item.secondary}
                secondaryTypographyProps={{ variant: 'body2', color: 'text.primary' }}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

// Componente para mostrar el progreso de la reserva
const ProgresoReserva = ({ reserva }) => {
  if (!reserva) return null;
  
  const fechaInicio = dayjs(reserva.fecha_inicio);
  const fechaFin = dayjs(reserva.fecha_fin);
  const hoy = dayjs();
  const totalDias = fechaFin.diff(fechaInicio, 'day') + 1;
  const diasTranscurridos = hoy.diff(fechaInicio, 'day') + 1;
  const porcentaje = Math.min(100, Math.max(0, (diasTranscurridos / totalDias) * 100));
  
  const getEstado = () => {
    if (hoy.isBefore(fechaInicio)) return 'Pendiente';
    if (hoy.isAfter(fechaFin)) return 'Finalizada';
    return 'En curso';
  };
  
  const getColorEstado = () => {
    const estado = getEstado();
    switch (estado) {
      case 'Pendiente': return 'info';
      case 'En curso': return 'warning';
      case 'Finalizada': return 'success';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Progreso de la Reserva</Typography>
          <Chip 
            label={getEstado()} 
            color={getColorEstado()}
            size="small"
          />
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {fechaInicio.format('DD MMM')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {fechaFin.format('DD MMM YYYY')}
            </Typography>
          </Box>
          <Box sx={{ position: 'relative', height: 10, bgcolor: 'divider', borderRadius: 5, overflow: 'hidden' }}>
            <Box 
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${porcentaje}%`,
                bgcolor: 'primary.main',
                transition: 'width 0.3s ease-in-out'
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Día {Math.min(diasTranscurridos, totalDias)} de {totalDias}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {porcentaje.toFixed(0)}% completado
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {diasTranscurridos <= 0 ? 0 : Math.min(diasTranscurridos, totalDias)}
              </Typography>
              <Typography variant="caption" color="text.secondary">Días transcurridos</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {Math.max(0, totalDias - diasTranscurridos)}
              </Typography>
              <Typography variant="caption" color="text.secondary">Días restantes</Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default function DetalleReserva() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [reserva, setReserva] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const printRef = useRef();
  
  const urlApi = 'http://localhost:8000/api';
  const token = localStorage.getItem('token');
  

  
  // Función para manejar el cambio de pestaña
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Función para manejar la edición de la reserva
  const handleEditarReserva = () => {
    navigate(`/admin/reservations/edit/${id}`);
  };
  
  // Función para abrir el diálogo de cancelación
  const abrirDialogoCancelacion = () => {
    setOpenCancelDialog(true);
  };

  // Función para cerrar el diálogo de cancelación
  const cerrarDialogoCancelacion = () => {
    setOpenCancelDialog(false);
    setError('');
  };

  // Función para manejar la cancelación de la reserva
  const handleCancelarReserva = async () => {
    setCancelando(true);
    setError('');
    
    try {
      // Usamos el endpoint correcto según la convención REST
      const response = await fetch(`${urlApi}/reservas/${id}/cancelar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(
          responseData.message || 
          `Error al cancelar la reserva (${response.status} ${response.statusText})`
        );
      }
      
      // Actualizar el estado con los datos de la reserva actualizada
      setReserva(prev => ({
        ...prev,
        estado: 'cancelada',
        ...responseData
      }));
      
      // Cerrar el diálogo después de un breve retraso
      setTimeout(() => {
        setOpenCancelDialog(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error al cancelar la reserva:', error);
      setError(
        error.message.includes('Failed to fetch') 
          ? 'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
          : error.message || 'Ocurrió un error al cancelar la reserva'
      );
    } finally {
      setCancelando(false);
    }
  };
  
  // Estados para el diálogo de finalización
  const [openFinalizarDialog, setOpenFinalizarDialog] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const [errorFinalizar, setErrorFinalizar] = useState('');

  // Función para abrir el diálogo de finalización
  const abrirDialogoFinalizacion = () => {
    setOpenFinalizarDialog(true);
  };

  // Función para cerrar el diálogo de finalización
  const cerrarDialogoFinalizacion = () => {
    setOpenFinalizarDialog(false);
    setErrorFinalizar('');
  };

  // Función para manejar la finalización de la reserva
  const handleCompletarReserva = async () => {
    setFinalizando(true);
    setErrorFinalizar('');
    
    try {
      const response = await fetch(`${urlApi}/reservas/${id}/finalizar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(
          responseData.message || 
          `Error al finalizar la reserva (${response.status} ${response.statusText})`
        );
      }
      
      // Actualizar el estado con los datos de la reserva actualizada
      setReserva(prev => ({
        ...prev,
        estado: 'finalizada',
        ...responseData.reserva
      }));
      
      // Cerrar el diálogo después de un breve retraso
      setTimeout(() => {
        setOpenFinalizarDialog(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error al finalizar la reserva:', error);
      setErrorFinalizar(
        error.message.includes('Failed to fetch') 
          ? 'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
          : error.message || 'Ocurrió un error al finalizar la reserva'
      );
    } finally {
      setFinalizando(false);
    }
  };
  
  // Estados para el diálogo de eliminación
  const [openEliminarDialog, setOpenEliminarDialog] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState('');

  // Función para abrir el diálogo de eliminación
  const abrirDialogoEliminacion = () => {
    setOpenEliminarDialog(true);
  };

  // Función para cerrar el diálogo de eliminación
  const cerrarDialogoEliminacion = () => {
    setOpenEliminarDialog(false);
    setErrorEliminar('');
  };

  // Función para manejar la eliminación de la reserva
  const handleEliminarReserva = async () => {
    setEliminando(true);
    setErrorEliminar('');
    
    try {
      const response = await fetch(`${urlApi}/reservas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(
          responseData.message || 
          `Error al eliminar la reserva (${response.status} ${response.statusText})`
        );
      }
      
      // Redirigir a la lista de reservas después de un breve retraso
      setTimeout(() => {
        navigate('/admin/reservations');
      }, 1000);
      
    } catch (error) {
      console.error('Error al eliminar la reserva:', error);
      setErrorEliminar(
        error.message.includes('Failed to fetch') 
          ? 'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
          : error.message || 'Ocurrió un error al eliminar la reserva'
      );
    } finally {
      setEliminando(false);
    }
  };
  
  // Función para formatear fechas
  const formatearFecha = (fecha) => {
    return dayjs(fecha).format('DD/MM/YYYY');
  };
  
  // Función para calcular la duración en días
  const calcularDuracion = (fechaInicio, fechaFin) => {
    return dayjs(fechaFin).diff(dayjs(fechaInicio), 'day') + 1;
  };
  
  // Función para formatear moneda
  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(monto);
  };
  
  // Función para manejar la finalización de la reserva (alias para mantener compatibilidad)
  const handleFinalizarReserva = handleCompletarReserva;
  
  // Función para renderizar el botón de acción según el estado de la reserva
  const renderBotonAccion = () => {
    if (!reserva) return null;
    
    const hoy = dayjs();
    const fechaInicio = dayjs(reserva.fecha_inicio);
    const fechaFin = dayjs(reserva.fecha_fin);
    
    if (reserva.estado === 'cancelada') {
      return (
        <Button 
          variant="contained" 
          color="error" 
          startIcon={<CancelIcon />}
          disabled
          sx={{ mt: 2 }}
        >
          Reserva Cancelada
        </Button>
      );
    } else if (reserva.estado === 'finalizada') {
      return (
        <Button 
          variant="contained" 
          color="success" 
          startIcon={<CheckCircleIcon />}
          disabled
          sx={{ mt: 2 }}
        >
          Reserva Finalizada
        </Button>
      );
    } else if (hoy.isAfter(fechaFin)) {
      return (
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<CheckCircleIcon />}
          onClick={handleFinalizarReserva}
          sx={{ mt: 2 }}
        >
          Marcar como Finalizada
        </Button>
      );
    } else if (hoy.isBefore(fechaInicio)) {
      return (
        <Button 
          variant="contained" 
          color="error" 
          startIcon={<CancelIcon />}
          onClick={abrirDialogoCancelacion}
          fullWidth
          sx={{ mt: 2 }}
          disabled={reserva?.estado === 'cancelada'}
        >
          {reserva?.estado === 'cancelada' ? 'Reserva Cancelada' : 'Cancelar Reserva'}
        </Button>
      );
    } else {
      return (
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<CheckCircleIcon />}
          onClick={handleFinalizarReserva}
          sx={{ mt: 2 }}
        >
          Marcar como Finalizada
        </Button>
      );
    }
  };

  useEffect(() => {
    const obtenerReserva = async () => {
      try {
        const resp = await fetch(`${urlApi}/reservas/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
        
        if (!resp.ok) {
          throw new Error('No se pudo cargar la reserva');
        }
        
        const data = await resp.json();
        setReserva(data);
      } catch (error) {
        setError(error.message || 'Error al cargar la reserva');
      } finally {
        setCargando(false);
      }
    };

    obtenerReserva();
  }, [id, token, urlApi]);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'confirmada':
        return 'success';
      case 'pendiente':
        return 'warning';
      case 'cancelada':
        return 'error';
      case 'en_curso':
        return 'info';
      case 'finalizada':
        return 'primary';
      default:
        return 'default';
    }
  };

  if (cargando) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!reserva) {
    return (
      <Box p={3}>
        <Typography>No se encontró la reserva solicitada</Typography>
      </Box>
    );
  }

  const renderDialogoCancelacion = () => (
    <Dialog
      open={openCancelDialog}
      onClose={cerrarDialogoCancelacion}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningIcon color="warning" />
        Confirmar cancelación
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          ¿Está seguro de que desea cancelar esta reserva? Esta acción no se puede deshacer.
          {error && (
            <Box color="error.main" mt={2}>
              {error}
            </Box>
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button 
          onClick={cerrarDialogoCancelacion} 
          disabled={cancelando}
          color="inherit"
        >
          Volver
        </Button>
        <Button 
          onClick={handleCancelarReserva} 
          color="error" 
          variant="contained"
          disabled={cancelando}
          startIcon={cancelando ? <CircularProgress size={20} /> : <CancelIcon />}
        >
          {cancelando ? 'Cancelando...' : 'Sí, cancelar'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderDialogoFinalizacion = () => (
    <Dialog
      open={openFinalizarDialog}
      onClose={cerrarDialogoFinalizacion}
      aria-labelledby="finalizar-dialog-title"
      aria-describedby="finalizar-dialog-description"
    >
      <DialogTitle id="finalizar-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CheckCircleIcon color="info" />
        Confirmar finalización
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="finalizar-dialog-description">
          ¿Está seguro de que desea marcar esta reserva como finalizada?
          {errorFinalizar && (
            <Box color="error.main" mt={2}>
              {errorFinalizar}
            </Box>
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button 
          onClick={cerrarDialogoFinalizacion} 
          disabled={finalizando}
          color="inherit"
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleCompletarReserva} 
          color="primary" 
          variant="contained"
          disabled={finalizando}
          startIcon={finalizando ? <CircularProgress size={20} /> : <CheckCircleIcon />}
        >
          {finalizando ? 'Finalizando...' : 'Sí, finalizar'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderDialogoEliminacion = () => (
    <Dialog
      open={openEliminarDialog}
      onClose={cerrarDialogoEliminacion}
      aria-labelledby="eliminar-dialog-title"
      aria-describedby="eliminar-dialog-description"
    >
      <DialogTitle id="eliminar-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningIcon color="error" />
        Confirmar eliminación
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="eliminar-dialog-description">
          ¿Está seguro de que desea eliminar esta reserva? Esta acción no se puede deshacer.
          {errorEliminar && (
            <Box color="error.main" mt={2}>
              {errorEliminar}
            </Box>
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button 
          onClick={cerrarDialogoEliminacion} 
          disabled={eliminando}
          color="inherit"
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleEliminarReserva} 
          color="error" 
          variant="contained"
          disabled={eliminando}
          startIcon={eliminando ? <CircularProgress size={20} /> : <DeleteIcon />}
        >
          {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      {renderDialogoCancelacion()}
      {renderDialogoFinalizacion()}
      {renderDialogoEliminacion()}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Reserva #{reserva.id}
        </Typography>
        <Chip 
          label={reserva.estado.replace('_', ' ').toUpperCase()} 
          color={getEstadoColor(reserva.estado)}
          sx={{ ml: 2, textTransform: 'capitalize' }}
        />
        <Box flexGrow={1} />
      </Box>

      <Grid container spacing={3}>
        {/* Columna principal */}
        <Grid item xs={12} md={8} lg={9}>
          {/* Tarjeta de información del vehículo */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Detalles de la reserva</Typography>
              <Divider sx={{ mb: 2 }} />
              
              {/* Sección de información del vehículo */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box sx={{ mr: 3 }}>
                  <Avatar 
                    src={reserva.vehiculo?.imagen || '/placeholder-vehicle.jpg'} 
                    alt={reserva.vehiculo?.modelo} 
                    sx={{ width: 120, height: 80, borderRadius: 1 }}
                    variant="rounded"
                  />
                </Box>
                <Box>
                  <Typography variant="h6">
                    {reserva.vehiculo?.marca} {reserva.vehiculo?.modelo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {reserva.vehiculo?.matricula} • {reserva.vehiculo?.anio}
                  </Typography>
                  <Chip 
                    label={reserva.vehiculo?.categoria?.nombre || 'Sin categoría'} 
                    color="primary" 
                    size="small" 
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>
              
              {reserva.observaciones && (
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Observaciones</Typography>
                  <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                    {reserva.observaciones}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Sección de fechas */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Fechas de alquiler</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Fecha de inicio</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EventIcon color="action" sx={{ mr: 1 }} />
                    <Typography>{dayjs(reserva.fecha_inicio).format('LL')}</Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Fecha de fin</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EventIcon color="action" sx={{ mr: 1 }} />
                    <Typography>{dayjs(reserva.fecha_fin).format('LL')}</Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Chip 
                  icon={<CalendarTodayIcon />}
                  label={`${dayjs(reserva.fecha_fin).diff(dayjs(reserva.fecha_inicio), 'day') + 1} días de alquiler`}
                  color="primary"
                  variant="outlined"
                  sx={{ mt: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
          
          {/* Sección de seguro y extras */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Seguro y Extras</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Seguro</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <SecurityIcon color="action" sx={{ mr: 1 }} />
                    <Typography>
                      {reserva.seguro ? reserva.seguro.charAt(0).toUpperCase() + reserva.seguro.slice(1) : 'No especificado'}
                    </Typography>
                  </Box>
                </Grid>
                {reserva.observaciones && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">Observaciones</Typography>
                    <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                      {reserva.observaciones}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Lado derecho - Acciones e información del vehículo */}
        <Grid item xs={12} md={4} lg={3}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Acciones</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box display="flex" flexDirection="column" gap={2}>
                <Button 
                  variant="outlined" 
                  color="primary"
                  onClick={() => navigate(`/admin/vehiculos/${reserva.vehiculo?.id}`)}
                  fullWidth
                  startIcon={<DirectionsCarIcon />}
                >
                  Ver vehículo
                </Button>
                
                <Button 
                  variant="outlined" 
                  color="warning"
                  onClick={() => handleEditarReserva()}
                  fullWidth
                  startIcon={<EditIcon />}
                >
                  Editar reserva
                </Button>
                
                <Button 
                  variant="contained" 
                  color="error"
                  onClick={abrirDialogoCancelacion}
                  fullWidth
                  startIcon={<CancelIcon />}
                  disabled={reserva?.estado === 'cancelada'}
                >
                  {reserva?.estado === 'cancelada' ? 'Reserva Cancelada' : 'Cancelar Reserva'}
                </Button>
                
                <Button 
                  variant="contained" 
                  color="success"
                  onClick={abrirDialogoFinalizacion}
                  fullWidth
                  startIcon={<CheckCircleIcon />}
                  disabled={reserva.estado === 'finalizada' || reserva.estado === 'cancelada'}
                >
                  {reserva.estado === 'finalizada' ? 'Reserva Finalizada' : 'Marcar como Finalizada'}
                </Button>
                
                <Divider sx={{ my: 1 }} />
                
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={abrirDialogoEliminacion}
                  fullWidth
                  startIcon={<DeleteIcon />}
                >
                  Eliminar reserva
                </Button>
                
                <Button 
                  variant="outlined" 
                  color="primary"
                  onClick={() => navigate(`/admin/clientes/${reserva.cliente?.id}`)}
                  fullWidth
                >
                  Ver cliente
                </Button>
              </Box>
            </CardContent>
          </Card>
          
          {/* Información del vehículo */}
          {reserva.vehiculo && (
            <Card elevation={3} sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Vehículo</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Marca / Modelo</Typography>
                  <Typography variant="body1">
                    {reserva.vehiculo.marca} {reserva.vehiculo.modelo}
                  </Typography>
                </Box>
                
                <Box mt={2}>
                  <Typography variant="subtitle2" color="textSecondary">Matrícula</Typography>
                  <Typography variant="body1">{reserva.vehiculo.matricula}</Typography>
                </Box>
                
                <Box mt={2}>
                  <Typography variant="subtitle2" color="textSecondary">Año</Typography>
                  <Typography variant="body1">{reserva.vehiculo.anio}</Typography>
                </Box>
                
                <Box mt={2}>
                  <Typography variant="subtitle2" color="textSecondary">Precio por día</Typography>
                  <Typography variant="body1">
                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(reserva.vehiculo.precio_dia)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
