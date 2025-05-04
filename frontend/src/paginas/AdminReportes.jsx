import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { useEffect, useState } from 'react';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BuildIcon from '@mui/icons-material/Build';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';

export default function AdminReportes() {
  const [totalVehiculos, setTotalVehiculos] = useState(0);
  const [totalVehiculosDisponibles, setTotalVehiculosDisponibles] = useState(0);
  const [totalVehiculosReservados, setTotalVehiculosReservados] = useState(0);
  const [totalVehiculosMantenimiento, setTotalVehiculosMantenimiento] = useState(0);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerDatosVehiculos = async () => {
      setCargando(true);
      try {
        const token = localStorage.getItem('token');
        const urlApi = import.meta.env.DEV ? 'http://localhost:8000/api' : '/api';
        const resp = await fetch(`${urlApi}/vehiculos`, { headers: { Authorization: `Bearer ${token}` } });
        const datos = await resp.json();
        if (Array.isArray(datos)) {
          setTotalVehiculos(datos.length);
          setTotalVehiculosDisponibles(datos.filter(v => v.estado === 'disponible').length);
          setTotalVehiculosReservados(datos.filter(v => v.estado === 'reservado').length);
          setTotalVehiculosMantenimiento(datos.filter(v => v.estado === 'mantenimiento').length);
        }
      } catch (e) {
        
      } finally {
        setCargando(false);
      }
    };
    obtenerDatosVehiculos();
  }, []);

  const datosBarras = [
    {
      nombre: 'Disponibles',
      cantidad: totalVehiculosDisponibles,
    },
    {
      nombre: 'Reservados',
      cantidad: totalVehiculosReservados,
    },
    {
      nombre: 'En mantenimiento',
      cantidad: totalVehiculosMantenimiento,
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: { xs: '#f5f5f5', md: 'linear-gradient(120deg, #e3f2fd 0%, #f5f5f5 100%)' }, px: 2 }}>
      <Paper elevation={8} sx={{ p: { xs: 3, md: 5 }, maxWidth: 850, width: '100%', borderRadius: 3, boxShadow: { xs: 6, md: 12 }, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          Estadísticas de la Flota
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Consulta reportes y estadísticas de tu flota.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4, flexWrap: 'wrap' }}>
          <Paper elevation={3} sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 2, minWidth: 140, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <DirectionsCarIcon sx={{ fontSize: 30, mb: 1 }} />
            <Typography variant="subtitle2">Total vehículos</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{totalVehiculos}</Typography>
          </Paper>
          <Paper elevation={3} sx={{ bgcolor: 'success.main', color: 'success.contrastText', p: 2, minWidth: 140, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <AssignmentIndIcon sx={{ fontSize: 30, mb: 1 }} />
            <Typography variant="subtitle2">Disponibles</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{totalVehiculosDisponibles}</Typography>
          </Paper>
          <Paper elevation={3} sx={{ bgcolor: 'warning.main', color: 'warning.contrastText', p: 2, minWidth: 140, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <DirectionsCarIcon sx={{ fontSize: 30, mb: 1 }} />
            <Typography variant="subtitle2">Reservados</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{totalVehiculosReservados}</Typography>
          </Paper>
          <Paper elevation={3} sx={{ bgcolor: 'error.main', color: 'error.contrastText', p: 2, minWidth: 140, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <BuildIcon sx={{ fontSize: 30, mb: 1 }} />
            <Typography variant="subtitle2">En mantenimiento</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{totalVehiculosMantenimiento}</Typography>
          </Paper>
        </Box>
        <Box sx={{ bgcolor: '#e3f2fd', borderRadius: 2, p: 3, minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', fontSize: 18 }}>
          {cargando ? (
            <div className="text-center w-100"><div className="spinner-border" role="status"><span className="visually-hidden">Cargando...</span></div></div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={datosBarras} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="cantidad" fill="#1976d2" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

