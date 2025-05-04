import { useAutenticacion } from '../contexto/ContextoAutenticacion';
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';

export default function ClienteDashboard() {
  const { usuario } = useAutenticacion();
  const [reservas, setReservas] = useState([]);
  const [vehiculosDestacados, setVehiculosDestacados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navegar = useNavigate();

  useEffect(() => {
    const obtenerDatosDashboard = async () => {
      setCargando(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const urlApi = import.meta.env.DEV ? 'http://localhost:8000/api' : '/api';
        // Reservas del usuario
        const respReservas = await fetch(`${urlApi}/usuarios/historial-reservas`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const datosReservas = await respReservas.json();
        setReservas(Array.isArray(datosReservas) ? datosReservas : []);
        // Vehículos destacados
        const respVehiculos = await fetch(`${urlApi}/vehiculos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        let datosVehiculos = await respVehiculos.json();
        if (Array.isArray(datosVehiculos)) {
          setVehiculosDestacados(datosVehiculos.filter(v => v.destacado).slice(0, 3));
        } else {
          setVehiculosDestacados([]);
        }
      } catch (e) {
        setError('No se pudieron cargar los datos del dashboard.');
      } finally {
        setCargando(false);
      }
    };
    obtenerDatosDashboard();
  }, []);

  const reservasActivas = reservas.filter(r => r.estado === 'activa' || r.estado === 'en curso');
  const reservasFuturas = reservas.filter(r => {
    const hoy = new Date();
    return r.estado === 'pendiente' && new Date(r.fecha_inicio) > hoy;
  });
  const actividadReciente = reservas.slice(0, 3);
  const ultimaReserva = reservas.length > 0 ? reservas[0] : null;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: {
          xs: '#f5f5f5',
          md: 'linear-gradient(120deg, #e3f2fd 0%, #f5f5f5 100%)'
        },
        overflow: 'auto',
        px: 2
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: { xs: 3, md: 5 },
          maxWidth: 900,
          width: '100%',
          mx: 2,
          borderRadius: 3,
          boxShadow: { xs: 6, md: 12 },
          mt: { xs: 0, md: 8 },
          textAlign: 'center'
        }}
      >
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          Bienvenido, {usuario?.nombre || 'Cliente'}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Aquí puedes ver tus reservas y gestionar tu perfil.
        </Typography>
        <Box sx={{ mb: 3 }}>
          <Typography><b>Correo:</b> {usuario?.email}</Typography>
          <Typography><b>Rol:</b> {usuario?.rol}</Typography>
        </Box>
        <Divider sx={{ my: 2 }} />
        {cargando ? (
          <CircularProgress sx={{ my: 3 }} />
        ) : error ? (
          <Typography color="error" sx={{ my: 2 }}>{error}</Typography>
        ) : (
          <>
            {/* KPIs */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 3, flexWrap: 'wrap' }}>
              <Box sx={{ textAlign: 'center' }}>
                <AssignmentTurnedInIcon color="primary" sx={{ fontSize: 38 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{reservas.length}</Typography>
                <Typography variant="body2" color="text.secondary">Reservas totales</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <EventAvailableIcon color="success" sx={{ fontSize: 38 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{reservasActivas.length}</Typography>
                <Typography variant="body2" color="text.secondary">Reservas activas</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <ArrowForwardIcon color="warning" sx={{ fontSize: 38 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{reservasFuturas.length}</Typography>
                <Typography variant="body2" color="text.secondary">Próximas reservas</Typography>
              </Box>
            </Box>
            {/* Botones de navegación */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navegar('/mis-vehiculos')}
                sx={{ fontWeight: 600 }}
              >
                Ver mis vehículos reservados
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navegar('/client/reservations')}
                sx={{ fontWeight: 600 }}
              >
                Historial de reservas
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => navegar('/client/profile')}
                sx={{ fontWeight: 600 }}
              >
                Mi perfil
              </Button>
            </Box>
            {/* Actividad reciente */}
            <Box sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Actividad reciente</Typography>
              {actividadReciente.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No hay actividad reciente.</Typography>
              ) : (
                <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                  {actividadReciente.map((reserva) => (
                    <li key={reserva.id}>
                      <Paper elevation={0} sx={{ p: 1.5, mb: 1, bgcolor: '#f5f5f5', borderRadius: 2, textAlign: 'left' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{reserva.vehiculo?.marca} {reserva.vehiculo?.modelo} ({reserva.vehiculo?.matricula})</Typography>
                        <Typography variant="body2">Estado: <b>{reserva.estado}</b></Typography>
                        <Typography variant="body2">Desde: {reserva.fecha_inicio?.slice(0,10)}</Typography>
                        <Typography variant="body2">Hasta: {reserva.fecha_fin?.slice(0,10)}</Typography>
                      </Paper>
                    </li>
                  ))}
                </Box>
              )}
            </Box>
            {/* Vehículos destacados */}
            <Box sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Vehículos destacados</Typography>
              {vehiculosDestacados.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No hay vehículos destacados en este momento.</Typography>
              ) : (
                <Box component="ul" sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', listStyle: 'none', p: 0, m: 0 }}>
                  {vehiculosDestacados.map((vehiculo) => (
                    <li key={vehiculo.id}>
                      <Paper elevation={0} sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 2, minWidth: 200, textAlign: 'left' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{vehiculo.marca} {vehiculo.modelo}</Typography>
                        <Typography variant="body2">Matrícula: {vehiculo.matricula}</Typography>
                        <Typography variant="body2">Estado: {vehiculo.estado}</Typography>
                      </Paper>
                    </li>
                  ))}
                </Box>
              )}
            </Box>
            {/* Última reserva destacada */}
            {ultimaReserva && (
              <Box sx={{ bgcolor: '#e3f2fd', borderRadius: 2, p: 2, mb: 2, textAlign: 'left' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Última reserva destacada:</Typography>
                <Typography variant="body2">
                  {ultimaReserva.vehiculo?.marca} {ultimaReserva.vehiculo?.modelo} ({ultimaReserva.vehiculo?.matricula})<br />
                  Estado: <b>{ultimaReserva.estado}</b><br />
                  Desde: {ultimaReserva.fecha_inicio?.slice(0,10)}<br />
                  Hasta: {ultimaReserva.fecha_fin?.slice(0,10)}
                </Typography>
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
}

