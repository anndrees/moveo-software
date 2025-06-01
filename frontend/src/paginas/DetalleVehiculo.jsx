import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
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
  Paper,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Rating,
  Stack,
  LinearProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  DirectionsCar as DirectionsCarIcon,
  LocalGasStation as LocalGasStationIcon,
  People as PeopleIcon,
  Speed as SpeedIcon,
  ColorLens as ColorLensIcon,
  Build as BuildIcon,
  CalendarToday as CalendarTodayIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  EventBusy as EventBusyIcon,
  EventAvailable as EventAvailableIcon,
  AccessTime as AccessTimeIcon,
  AttachMoney as AttachMoneyIcon,
  LocalOffer as LocalOfferIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  StarHalf as StarHalfIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAutenticacion } from '../contexto/ContextoAutenticacion';

export default function DetalleVehiculo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const esMovil = useMediaQuery(theme.breakpoints.down('md'));
  const { usuario } = useAutenticacion();
  
  // Estados
  const [vehiculo, setVehiculo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [tabActual, setTabActual] = useState(0);
  const [dialogoEliminar, setDialogoEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [snackbar, setSnackbar] = useState({
    abierto: false,
    mensaje: '',
    severidad: 'success'
  });

  // Obtener datos del vehículo
  useEffect(() => {
    const obtenerVehiculo = async () => {
      try {
        setCargando(true);
        const token = localStorage.getItem('token');
        const respuesta = await fetch(`http://localhost:8000/api/vehiculos/${id}`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!respuesta.ok) {
          throw new Error('No se pudo cargar la información del vehículo');
        }
        
        const datos = await respuesta.json();
        setVehiculo(datos);
      } catch (error) {
        console.error('Error al obtener el vehículo:', error);
        setError(error.message || 'Error al cargar el vehículo');
        setSnackbar({
          abierto: true,
          mensaje: error.message || 'Error al cargar el vehículo',
          severidad: 'error'
        });
      } finally {
        setCargando(false);
      }
    };

    obtenerVehiculo();
  }, [id]);

  // Manejar cambio de pestaña
  const manejarCambioTab = (evento, nuevoValor) => {
    setTabActual(nuevoValor);
  };

  // Abrir diálogo de confirmación para eliminar
  const abrirDialogoEliminar = () => {
    setDialogoEliminar(true);
  };

  // Cerrar diálogo de confirmación
  const cerrarDialogoEliminar = () => {
    setDialogoEliminar(false);
  };

  // Manejar eliminación del vehículo
  const manejarEliminarVehiculo = async () => {
    try {
      setEliminando(true);
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`http://localhost:8000/api/vehiculos/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!respuesta.ok) {
        throw new Error('No se pudo eliminar el vehículo');
      }
      
      setSnackbar({
        abierto: true,
        mensaje: 'Vehículo eliminado correctamente',
        severidad: 'success'
      });
      
      // Redirigir a la lista de vehículos después de 1 segundo
      setTimeout(() => {
        navigate('/admin/vehiculos');
      }, 1000);
      
    } catch (error) {
      console.error('Error al eliminar el vehículo:', error);
      setSnackbar({
        abierto: true,
        mensaje: error.message || 'Error al eliminar el vehículo',
        severidad: 'error'
      });
    } finally {
      setEliminando(false);
      setDialogoEliminar(false);
    }
  };

  // Cerrar Snackbar
  const cerrarSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      abierto: false
    }));
  };

  // Función para formatear fechas
  const formatearFecha = (fecha) => {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Mostrar carga
  if (cargando) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  // Mostrar error
  if (error || !vehiculo) {
    return (
      <Box p={3}>
        <Typography color="error">{error || 'No se encontró el vehículo solicitado'}</Typography>
      </Box>
    );
  }

  // Componente de pestañas
  const TabsVehiculo = () => (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs 
        value={tabActual} 
        onChange={manejarCambioTab}
        variant={esMovil ? 'scrollable' : 'standard'}
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        <Tab label="Información General" />
        <Tab label="Especificaciones" />
        <Tab label="Mantenimiento" />
        <Tab label="Reservas" />
      </Tabs>
    </Box>
  );

  // Contenido de las pestañas
  const ContenidoTabs = () => {
    switch (tabActual) {
      case 0: // Información General
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Descripción</Typography>
                  <Typography variant="body1" color="text.secondary">
                    {vehiculo.descripcion || 'No hay descripción disponible.'}
                  </Typography>
                </CardContent>
              </Card>
              
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Características Principales</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" scope="row">Marca</TableCell>
                          <TableCell>{vehiculo.marca || 'No especificada'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">Modelo</TableCell>
                          <TableCell>{vehiculo.modelo || 'No especificado'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">Año</TableCell>
                          <TableCell>{vehiculo.anio || 'No especificado'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">Matrícula</TableCell>
                          <TableCell>{vehiculo.matricula || 'No especificada'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">Kilometraje</TableCell>
                          <TableCell>
                            {vehiculo.kilometraje ? `${vehiculo.kilometraje.toLocaleString()} km` : 'No especificado'}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">Precio por día</TableCell>
                          <TableCell>
                            {vehiculo.precio_dia ? `$${vehiculo.precio_dia.toFixed(2)}` : 'No especificado'}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Estado</Typography>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Chip 
                      label={vehiculo.estado ? vehiculo.estado.replace('_', ' ').toUpperCase() : 'SIN ESTADO'} 
                      color={
                        vehiculo.estado === 'disponible' ? 'success' : 
                        vehiculo.estado === 'en_mantenimiento' ? 'warning' :
                        vehiculo.estado === 'alquilado' ? 'error' : 'default'
                      }
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>Último Mantenimiento</Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {vehiculo.fecha_ultimo_mantenimiento 
                      ? formatearFecha(vehiculo.fecha_ultimo_mantenimiento)
                      : 'No registrado'}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom>Próximo Mantenimiento (km)</Typography>
                  <Box display="flex" alignItems="center">
                    <Box width="100%" mr={1}>
                      <LinearProgress 
                        variant="determinate" 
                        value={
                          vehiculo.kilometraje && vehiculo.proximo_mantenimiento_km
                            ? Math.min(100, (vehiculo.kilometraje / vehiculo.proximo_mantenimiento_km) * 100)
                            : 0
                        } 
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {vehiculo.kilometraje && vehiculo.proximo_mantenimiento_km
                        ? `${vehiculo.kilometraje.toLocaleString()} / ${vehiculo.proximo_mantenimiento_km.toLocaleString()} km`
                        : 'No especificado'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
              
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Acciones</Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/admin/vehiculos/editar/${vehiculo.id}`)}
                    sx={{ mb: 1 }}
                  >
                    Editar Vehículo
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    startIcon={<DeleteIcon />}
                    onClick={abrirDialogoEliminar}
                  >
                    Eliminar Vehículo
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );
        
      case 1: // Especificaciones
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Especificaciones Técnicas</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" scope="row">Tipo de Combustible</TableCell>
                          <TableCell>{vehiculo.tipo_combustible || 'No especificado'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">Tipo de Caja</TableCell>
                          <TableCell>{vehiculo.tipo_caja || 'No especificado'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">Capacidad de Pasajeros</TableCell>
                          <TableCell>
                            {vehiculo.capacidad_pasajeros ? `${vehiculo.capacidad_pasajeros} personas` : 'No especificada'}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" scope="row">Color</TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              {vehiculo.color && (
                                <>
                                  <Box 
                                    sx={{
                                      width: 20, 
                                      height: 20, 
                                      backgroundColor: vehiculo.color.toLowerCase(), 
                                      border: '1px solid #ddd',
                                      borderRadius: '50%',
                                      mr: 1
                                    }} 
                                  />
                                  <span>{vehiculo.color}</span>
                                </>
                              ) || 'No especificado'}
                            </Box>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">Aire Acondicionado</TableCell>
                          <TableCell>
                            {vehiculo.aire_acondicionado !== undefined 
                              ? (vehiculo.aire_acondicionado ? 'Sí' : 'No')
                              : 'No especificado'}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">Capacidad de Maletero</TableCell>
                          <TableCell>
                            {vehiculo.capacidad_maletero ? `${vehiculo.capacidad_maletero} L` : 'No especificada'}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
              
              {vehiculo.caracteristicas && (
                <Box mt={3}>
                  <Typography variant="subtitle1" gutterBottom>Características Adicionales</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {vehiculo.caracteristicas}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        );
        
      case 2: // Mantenimiento
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Historial de Mantenimiento</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {vehiculo.mantenimientos && vehiculo.mantenimientos.length > 0
                  ? 'Aquí se muestra el historial de mantenimientos del vehículo.'
                  : 'No hay registros de mantenimiento para este vehículo.'}
              </Typography>
              
              {vehiculo.mantenimientos && vehiculo.mantenimientos.length > 0 && (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableBody>
                      {vehiculo.mantenimientos.map((mantenimiento, index) => (
                        <TableRow key={index}>
                          <TableCell>{formatearFecha(mantenimiento.fecha)}</TableCell>
                          <TableCell>{mantenimiento.tipo}</TableCell>
                          <TableCell>{mantenimiento.descripcion}</TableCell>
                          <TableCell>
                            <Chip 
                              label={mantenimiento.estado} 
                              size="small"
                              color={
                                mantenimiento.estado === 'completado' ? 'success' :
                                mantenimiento.estado === 'pendiente' ? 'warning' : 'default'
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              
              <Box mt={3}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<BuildIcon />}
                  onClick={() => navigate(`/admin/mantenimientos/nuevo?vehiculo_id=${vehiculo.id}`)}
                >
                  Agregar Mantenimiento
                </Button>
              </Box>
            </CardContent>
          </Card>
        );
        
      case 3: // Reservas
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Reservas del Vehículo</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {vehiculo.reservas && vehiculo.reservas.length > 0
                  ? 'Historial de reservas para este vehículo.'
                  : 'No hay reservas registradas para este vehículo.'}
              </Typography>
              
              {vehiculo.reservas && vehiculo.reservas.length > 0 && (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableBody>
                      {vehiculo.reservas.map((reserva) => (
                        <TableRow 
                          key={reserva.id}
                          hover
                          sx={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/admin/reservas/${reserva.id}`)}
                        >
                          <TableCell>#{reserva.id}</TableCell>
                          <TableCell>
                            {reserva.cliente ? `${reserva.cliente.nombre} ${reserva.cliente.apellidos}` : 'Cliente no disponible'}
                          </TableCell>
                          <TableCell>
                            {new Date(reserva.fecha_inicio).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(reserva.fecha_fin).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={reserva.estado} 
                              size="small"
                              color={
                                reserva.estado === 'confirmada' ? 'success' :
                                reserva.estado === 'pendiente' ? 'warning' :
                                reserva.estado === 'cancelada' ? 'error' : 'default'
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              
              <Box mt={3}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<EventAvailableIcon />}
                  onClick={() => navigate(`/admin/reservas/nueva?vehiculo_id=${vehiculo.id}`)}
                >
                  Nueva Reserva
                </Button>
              </Box>
            </CardContent>
          </Card>
        );
        
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      {/* Encabezado */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {vehiculo.marca} {vehiculo.modelo} {vehiculo.anio ? `(${vehiculo.anio})` : ''}
        </Typography>
        <Chip 
          label={vehiculo.estado ? vehiculo.estado.replace('_', ' ').toUpperCase() : 'SIN ESTADO'} 
          color={
            vehiculo.estado === 'disponible' ? 'success' : 
            vehiculo.estado === 'en_mantenimiento' ? 'warning' :
            vehiculo.estado === 'alquilado' ? 'error' : 'default'
          }
          sx={{ ml: 2, textTransform: 'capitalize' }}
        />
      </Box>
      
      {/* Imagen principal */}
      <Card sx={{ mb: 3, overflow: 'hidden' }}>
        <Box 
          sx={{
            height: 300,
            backgroundImage: vehiculo.foto_principal 
              ? `url(${vehiculo.foto_principal})` 
              : 'linear-gradient(45deg, #f5f5f5 25%, #e0e0e0 25%, #e0e0e0 50%, #f5f5f5 50%, #f5f5f5 75%, #e0e0e0 75%, #e0e0e0 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          {!vehiculo.foto_principal && (
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center" 
              color="text.secondary"
              height="100%"
              width="100%"
              bgcolor="rgba(255, 255, 255, 0.8)"
            >
              <ImageIcon fontSize="large" />
              <Typography variant="subtitle1" mt={1}>
                Sin imagen del vehículo
              </Typography>
            </Box>
          )}
          
          {/* Precio por día */}
          <Box 
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              px: 2,
              py: 1,
              borderRadius: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Typography variant="caption" sx={{ opacity: 0.8 }}>Precio por día</Typography>
            <Typography variant="h5" fontWeight="bold">
              {vehiculo.precio_dia ? `$${vehiculo.precio_dia.toFixed(2)}` : 'N/A'}
            </Typography>
          </Box>
          
          {/* Estado */}
          <Box 
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              bgcolor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              px: 2,
              py: 1,
              borderRadius: 1
            }}
          >
            <Chip 
              label={vehiculo.estado ? vehiculo.estado.replace('_', ' ').toUpperCase() : 'SIN ESTADO'} 
              color={
                vehiculo.estado === 'disponible' ? 'success' : 
                vehiculo.estado === 'en_mantenimiento' ? 'warning' :
                vehiculo.estado === 'alquilado' ? 'error' : 'default'
              }
              size="small"
              sx={{ textTransform: 'capitalize' }}
            />
          </Box>
          
          {/* Galería de imágenes */}
          {vehiculo.fotos_adicionales && vehiculo.fotos_adicionales.length > 0 && (
            <Box 
              sx={{
                display: 'flex',
                overflowX: 'auto',
                width: '100%',
                p: 1,
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                '& > *': {
                  flex: '0 0 auto',
                  mr: 1,
                  '&:last-child': { mr: 0 }
                }
              }}
            >
              {vehiculo.fotos_adicionales.map((foto, index) => (
                <Box 
                  key={index}
                  sx={{
                    width: 80,
                    height: 60,
                    backgroundImage: `url(${foto})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: 1,
                    border: '2px solid white',
                    cursor: 'pointer',
                    '&:hover': {
                      opacity: 0.8
                    }
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
      </Card>
      
      {/* Pestañas */}
      <TabsVehiculo />
      
      {/* Contenido de las pestañas */}
      <ContenidoTabs />
      
      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={dialogoEliminar}
        onClose={cerrarDialogoEliminar}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <WarningIcon color="error" sx={{ verticalAlign: 'middle', mr: 1 }} />
          Confirmar eliminación
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Estás seguro de que deseas eliminar este vehículo? Esta acción no se puede deshacer y se eliminarán todos los datos asociados.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarDialogoEliminar} disabled={eliminando}>
            Cancelar
          </Button>
          <Button 
            onClick={manejarEliminarVehiculo} 
            color="error" 
            variant="contained"
            disabled={eliminando}
            startIcon={eliminando ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {eliminando ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.abierto}
        autoHideDuration={6000}
        onClose={cerrarSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={cerrarSnackbar} 
          severity={snackbar.severidad} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.mensaje}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// Componente de alerta personalizado para Snackbar
function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}
