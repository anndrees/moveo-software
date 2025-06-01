import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';

const EditarVehiculo = () => {
  const { id } = useParams();
  const navegar = useNavigate();
  const [vehiculo, setVehiculo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ abierto: false, mensaje: '', severidad: 'success' });

  // Cargar datos actuales del vehículo
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
        if (!respuesta.ok) throw new Error('No se pudo cargar el vehículo');
        const datos = await respuesta.json();
        setVehiculo(datos);
      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    };
    obtenerVehiculo();
  }, [id]);

  const manejarCambio = (e) => {
    setVehiculo({ ...vehiculo, [e.target.name]: e.target.value });
  };

  const manejarGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`http://localhost:8000/api/vehiculos/${id}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(vehiculo),
      });
      if (!respuesta.ok) {
        const data = await respuesta.json();
        throw new Error(data.message || 'Error al guardar los cambios');
      }
      setSnackbar({ abierto: true, mensaje: 'Vehículo actualizado correctamente', severidad: 'success' });
      setTimeout(() => navegar(`/admin/vehiculos/${id}`), 1200);
    } catch (e) {
      setError(e.message);
      setSnackbar({ abierto: true, mensaje: e.message, severidad: 'error' });
    } finally {
      setGuardando(false);
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
      <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
    );
  }

  if (!vehiculo) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        No se encontró el vehículo solicitado
      </Alert>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 600, mx: 'auto' }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, boxShadow: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
          Editar Vehículo
        </Typography>
        <form onSubmit={manejarGuardar}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Marca"
                name="marca"
                value={vehiculo.marca || ''}
                onChange={manejarCambio}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Modelo"
                name="modelo"
                value={vehiculo.modelo || ''}
                onChange={manejarCambio}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Matrícula"
                name="matricula"
                value={vehiculo.matricula || vehiculo.placa || ''}
                onChange={manejarCambio}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Tipo de vehículo"
                name="tipo_vehiculo"
                value={vehiculo.tipo_vehiculo || vehiculo.tipo || ''}
                onChange={manejarCambio}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Tipo de combustible"
                name="tipo_combustible"
                value={vehiculo.tipo_combustible || vehiculo.combustible || ''}
                onChange={manejarCambio}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Capacidad de pasajeros"
                name="capacidad_pasajeros"
                type="number"
                value={vehiculo.capacidad_pasajeros || vehiculo.pasajeros || ''}
                onChange={manejarCambio}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Color"
                name="color"
                value={vehiculo.color || ''}
                onChange={manejarCambio}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Tipo de caja"
                name="tipo_caja"
                value={vehiculo.tipo_caja || vehiculo.caja || ''}
                onChange={manejarCambio}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Descripción"
                name="descripcion"
                value={vehiculo.descripcion || ''}
                onChange={manejarCambio}
                fullWidth
                multiline
                minRows={2}
                maxRows={6}
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" gap={2} mt={2}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={guardando}
                >
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => navegar(`/admin/vehiculos/${id}`)}
                  disabled={guardando}
                >
                  Cancelar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
      <Snackbar
        open={snackbar.abierto}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, abierto: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severidad} sx={{ width: '100%' }}>
          {snackbar.mensaje}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditarVehiculo;
