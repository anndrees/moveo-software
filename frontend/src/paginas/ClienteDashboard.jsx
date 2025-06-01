import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from 'react-router-dom';
import { useAutenticacion } from '../contexto/ContextoAutenticacion';

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
          maxWidth: 1100,
          width: '100%',
          mx: 2,
          borderRadius: 3,
          boxShadow: { xs: 6, md: 12 },
          mt: { xs: 0, md: 8 },
          textAlign: 'center',
          background: 'linear-gradient(120deg, #e8f5e9 0%, #e3f2fd 100%)',
        }}
      >
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: '#1565c0' }}>
          Panel de Cliente
        </Typography>
        <Typography variant="h6" sx={{ mb: 1, color: '#333' }}>
          ¡Bienvenido, {usuario?.nombre || 'Cliente'}!
        </Typography>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="body2"><b>Correo:</b> {usuario?.email}</Typography>
            <Typography variant="body2"><b>Rol:</b> {usuario?.rol}</Typography>
          </Box>
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
              <Paper elevation={2} sx={{ p: 3, minWidth: 180, textAlign: 'center', bgcolor: '#fff' }}>
                <AssignmentTurnedInIcon color="primary" sx={{ fontSize: 38 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{reservas.length}</Typography>
                <Typography variant="body2" color="text.secondary">Reservas totales</Typography>
              </Paper>
              <Paper elevation={2} sx={{ p: 3, minWidth: 180, textAlign: 'center', bgcolor: '#fff' }}>
                <EventAvailableIcon color="success" sx={{ fontSize: 38 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{reservasActivas.length}</Typography>
                <Typography variant="body2" color="text.secondary">Reservas activas</Typography>
              </Paper>
              <Paper elevation={2} sx={{ p: 3, minWidth: 180, textAlign: 'center', bgcolor: '#fff' }}>
                <DirectionsCarIcon color="info" sx={{ fontSize: 38 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{vehiculosDestacados.length}</Typography>
                <Typography variant="body2" color="text.secondary">Vehículos destacados</Typography>
              </Paper>
            </Box>
            <Divider sx={{ my: 2 }} />
            {/* Actividad reciente */}
            <Typography variant="h6" sx={{ mb: 1, mt: 2, textAlign: 'left', color: '#1565c0' }}>Actividad reciente</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
              {actividadReciente.length === 0 ? (
                <Typography color="text.secondary">No hay actividad reciente.</Typography>
              ) : (
                actividadReciente.map((reserva, idx) => (
                  <Paper key={reserva.uuid || reserva.id || `${reserva.vehiculo?.matricula || ''}-${reserva.fecha_inicio || idx}`}
                    sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#f8fafc' }}>
                    <DirectionsCarIcon color="action" />
                    <Box sx={{ flex: 1, textAlign: 'left' }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {reserva.vehiculo?.matricula || 'Vehículo'} - {reserva.vehiculo?.modelo || ''}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Estado: {reserva.estado} | Inicio: {reserva.fecha_inicio ? new Date(reserva.fecha_inicio).toLocaleDateString('es-ES') : ''}
                      </Typography>
                    </Box>
                    <Button variant="outlined" size="small" color="primary" disabled>Ver</Button>
                  </Paper>
                ))
              )}
            </Box>
            {/* Vehículos destacados */}
            <Box sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Vehículos destacados</Typography>
              {vehiculosDestacados.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No hay vehículos destacados en este momento.</Typography>
              ) : (
                <Box component="ul" sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', listStyle: 'none', p: 0, m: 0 }}>
                  {vehiculosDestacados.map((vehiculo, idx) => (
                    <li key={vehiculo.uuid || vehiculo.id || `${vehiculo.matricula || ''}-${vehiculo.modelo || idx}`}>
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
