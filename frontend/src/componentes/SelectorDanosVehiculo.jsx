import React, { useState, useEffect } from 'react';
import {
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon, Delete as DeleteIcon, WarningAmber as WarningAmberIcon } from '@mui/icons-material';
import { obtenerToken } from '../servicios/autenticacion';

const SelectorDanosVehiculo = ({ vehiculoId }) => {
  const [danos, setDanos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [danoSeleccionado, setDanoSeleccionado] = useState(null);
  const [notas, setNotas] = useState('');
  const [alerta, setAlerta] = useState({ abierta: false, mensaje: '', tipo: 'success' });
  const [danoAEliminar, setDanoAEliminar] = useState(null);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [posicionRelativa, setPosicionRelativa] = useState({ x: 0, y: 0 });
  
  // Valor fijo para la vista ya que ahora solo tenemos una imagen (debe coincidir con el backend)
  const VISTA_ACTUAL = 'vista_completa';

  // Cargar daños existentes
  useEffect(() => {
    if (vehiculoId) {
      cargarDanos();
    }
  }, [vehiculoId]);

  const cargarDanos = async () => {
    try {
      setCargando(true);
      const token = obtenerToken();
      const response = await fetch(`/api/vehiculos/${vehiculoId}/danos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('No se pudieron cargar los daños del vehículo');
      }
      
      const data = await response.json();
      setDanos(data.data || []);
    } catch (error) {
      console.error('Error al cargar daños:', error);
      setError('No se pudieron cargar los daños del vehículo');
    } finally {
      setCargando(false);
    }
  };

  const handleClickImagen = (event) => {
    if (!vehiculoId) return;
    
    const contenedor = event.currentTarget;
    const rectContenedor = contenedor.getBoundingClientRect();
    
    // Calcular la posición del click relativa al contenedor
    const x = event.clientX - rectContenedor.left;
    const y = event.clientY - rectContenedor.top;
    
    // Guardar posición relativa
    setPosicionRelativa({ x, y });
    
    // Calcular el porcentaje basado en el contenedor
    const porcentajeX = Math.round((x / rectContenedor.width) * 100);
    const porcentajeY = Math.round((y / rectContenedor.height) * 100);
    
    // Abrir diálogo para agregar notas
    setDanoSeleccionado({
      vista: VISTA_ACTUAL,
      posicion_x: porcentajeX,
      posicion_y: porcentajeY
    });
    setNotas('');
    setDialogoAbierto(true);
  };

  // Mostrar el modal de confirmación antes de eliminar
  const handleIntentarEliminarDano = (danoId) => {
    setDanoAEliminar(danoId);
    setModalEliminarAbierto(true);
  };

  // Eliminar daño tras confirmar en el modal
  const handleEliminarDano = async () => {
    if (!danoAEliminar) return;
    try {
      setCargando(true);
      const token = obtenerToken();
      const respuesta = await fetch(`/api/vehiculos/${vehiculoId}/danos/${danoAEliminar}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      if (!respuesta.ok) {
        throw new Error('Error al eliminar el daño');
      }
      setModalEliminarAbierto(false);
      setDanoAEliminar(null);
      await cargarDanos();
    } catch (error) {
      setModalEliminarAbierto(false);
      setDanoAEliminar(null);
      setAlerta({
        abierta: true,
        mensaje: 'Error al eliminar el daño. Por favor, inténtalo de nuevo.',
        tipo: 'error'
      });
    } finally {
      setCargando(false);
    }
  };


  const handleGuardarDano = async () => {
    if (!danoSeleccionado) return;
    
    try {
      setCargando(true);
      const token = obtenerToken();
      const datosDano = {
        ...danoSeleccionado,
        vista: VISTA_ACTUAL, // Usamos la constante definida
        notas: notas.trim()
      };
      
      const response = await fetch(`/api/vehiculos/${vehiculoId}/danos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(datosDano)
      });
      
      if (!response.ok) {
        throw new Error('Error al guardar el daño');
      }
      
      // Recargar la lista de daños
      await cargarDanos();
      
      setDialogoAbierto(false);
      setAlerta({
        abierta: true,
        mensaje: 'Daño registrado correctamente',
        tipo: 'success'
      });
    } catch (error) {
      console.error('Error al guardar el daño:', error);
      setAlerta({
        abierta: true,
        mensaje: 'Error al guardar el daño. Por favor, inténtalo de nuevo.',
        tipo: 'error'
      });
    } finally {
      setCargando(false);
    }
  };

  // Ruta de la imagen del vehículo con todas las vistas
  const obtenerImagenVehiculo = () => {
    return '/img/vehiculo-vista-completa.png';
  };

  // Obtener todos los daños (ya que solo hay una vista)
  const obtenerTodosLosDanos = () => {
    return danos.filter(dano => dano.vista === VISTA_ACTUAL);
  };

  if (cargando) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Registro de Daños
      </Typography>
      
      <Box
        position="relative"
        mt={2}
        width="100%"
        maxWidth="600px"
        mx="auto"
        onClick={handleClickImagen}
        sx={{ cursor: 'crosshair', display: 'block' }}
      >
        <img
          src={obtenerImagenVehiculo()}
          alt="Vehículo"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            aspectRatio: '3/2', // Puedes ajustar esto según la imagen real
            pointerEvents: 'none', // Para que los clics pasen al contenedor
            userSelect: 'none'
          }}
          draggable={false}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300" fill="none"><rect width="400" height="300" fill="%23f5f5f5"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="16" fill="%23999">Imagen no encontrada: vehiculo-vista-completa.png</text></svg>';
          }}
        />
        {/* Mostrar marcadores de daños existentes */}
        {obtenerTodosLosDanos().map((dano) => (
          <Tooltip key={dano.id} title={dano.notas || 'Sin notas'} arrow>
            <Box
              position="absolute"
              left={`${dano.posicion_x}%`}
              top={`${dano.posicion_y}%`}
              width={20}
              height={20}
              borderRadius="50%"
              bgcolor="error.main"
              display="flex"
              alignItems="center"
              justifyContent="center"
              sx={{
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                zIndex: 10,
                '&:hover': {
                  transform: 'translate(-50%, -50%) scale(1.2)',
                  transition: 'transform 0.2s'
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleIntentarEliminarDano(dano.id);
              }}
            >
              <DeleteIcon sx={{ color: 'white', fontSize: 14 }} />
            </Box>
          </Tooltip>
        ))}
      </Box>
      
      <Typography variant="body2" color="textSecondary" mt={2} textAlign="center">
        Haz clic en cualquier parte de la imagen para marcar un daño. Haz clic en un marcador existente para eliminarlo.
      </Typography>
      
      {/* Diálogo para agregar notas al daño */}
      <Dialog open={dialogoAbierto} onClose={() => setDialogoAbierto(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar daño</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Notas (opcional)"
            fullWidth
            multiline
            rows={4}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Describe el daño (ej: rayón en la puerta, abolladura en el guardabarros, etc.)"
          />
          <Box mt={2}>
            <Typography variant="body2" color="textSecondary">
              Posición: X: {danoSeleccionado?.posicion_x}%, Y: {danoSeleccionado?.posicion_y}%
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoAbierto(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleGuardarDano} color="primary" variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Modal de confirmación de eliminación */}
      <Dialog open={modalEliminarAbierto} onClose={() => setModalEliminarAbierto(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 0 }}>
          <WarningAmberIcon color="error" sx={{ fontSize: 28, mr: 1 }} />
          Confirmar eliminación
        </DialogTitle>
        <DialogContent sx={{ pb: 0 }}>
          <Typography variant="body1" sx={{ mb: 0.5 }}>
            ¿Está seguro de que desea eliminar este daño? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-end', px: 3, pb: 2 }}>
          <Button onClick={() => setModalEliminarAbierto(false)} color="inherit" sx={{ mr: 2 }}>
            CANCELAR
          </Button>
          <Button
            onClick={handleEliminarDano}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
            sx={{ boxShadow: 2 }}
          >
            SÍ, ELIMINAR
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar solo para errores */}
      <Snackbar
        open={alerta.abierta && alerta.tipo === 'error'}
        autoHideDuration={4000}
        onClose={() => setAlerta({ ...alerta, abierta: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setAlerta({ ...alerta, abierta: false })} severity={alerta.tipo} sx={{ width: '100%' }}>
          {alerta.mensaje}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SelectorDanosVehiculo;
