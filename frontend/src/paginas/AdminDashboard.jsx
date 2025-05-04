import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useAutenticacion } from '../contexto/ContextoAutenticacion';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, BarChart, Bar } from 'recharts';
import { useEffect, useState } from 'react';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import GroupIcon from '@mui/icons-material/Group';

const COLORES_PASTEL = ['#1976d2', '#43a047'];

export default function AdminDashboard({ modoAdmin = true }) {
  // KPIs (usar datos reales si están disponibles, si no, usar placeholder)
  const [totalVehiculos, setTotalVehiculos] = useState(6);
  const [vehiculosDisponibles, setVehiculosDisponibles] = useState(4);
  const [reservasActivas, setReservasActivas] = useState(2);
  const [ingresosMensuales, setIngresosMensuales] = useState(4320); // Placeholder
  const [clientesTotales, setClientesTotales] = useState(5);
  // Datos para gráficos (placeholders)
  const datosIngresos = [
    { mes: 'Ene', ingresos: 3100 },
    { mes: 'Feb', ingresos: 2900 },
    { mes: 'Mar', ingresos: 2700 },
    { mes: 'Abr', ingresos: 3600 },
    { mes: 'May', ingresos: 4100 },
    { mes: 'Jun', ingresos: 3700 },
    { mes: 'Jul', ingresos: 3400 },
    { mes: 'Ago', ingresos: 3900 },
    { mes: 'Sep', ingresos: 4200 }
  ];
  const datosVehiculosPopulares = [
    { nombre: 'Toyota Corolla', alquileres: 15 },
    { nombre: 'Honda CR-V', alquileres: 12 },
    { nombre: 'Mercedes-Benz E-Class', alquileres: 9 },
    { nombre: 'Ford Mustang', alquileres: 8 },
    { nombre: 'Nissan Leaf', alquileres: 6 }
  ];
  const reservasRecientes = [
    { id: 1, cliente: 'Jane Smith', vehiculo: 'Toyota Corolla', fechas: '2023-06-10 - 2023-06-15', estado: 'Completada', importe: 225 },
    { id: 2, cliente: 'John Doe', vehiculo: 'Mercedes-Benz E-Class', fechas: '2023-07-05 - 2023-07-10', estado: 'Completada', importe: 600 },
    { id: 3, cliente: 'Robert Johnson', vehiculo: 'Honda CR-V', fechas: '2023-08-15 - 2023-08-20', estado: 'Cancelada', importe: 325 },
    { id: 4, cliente: 'Emily Davis', vehiculo: 'Ford Mustang', fechas: '2023-09-01 - 2023-09-05', estado: 'Activa', importe: 380 },
    { id: 5, cliente: 'Michael Wilson', vehiculo: 'Nissan Leaf', fechas: '2023-09-15 - 2023-09-18', estado: 'Confirmada', importe: 180 }
  ];

  // Colores para los estados
  const colorEstado = (estado) => {
    switch (estado) {
      case 'Completada': return 'success.main';
      case 'Activa': return 'info.main';
      case 'Confirmada': return 'primary.main';
      case 'Cancelada': return 'error.main';
      default: return 'grey.500';
    }
  };

  return (

    <Box sx={{ flex: 1, minWidth: 0, minHeight: '100vh', bgcolor: '#f5f6fa', p: { xs: 1, md: 3 }, overflowX: 'auto', width: '100%' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Resumen del Panel</Typography>
      {/* KPIs */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Paper elevation={3} sx={{ flex: 1, minWidth: 220, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: 'background.paper' }}>
          <Typography variant="subtitle2" color="text.secondary">Vehículos Totales</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{totalVehiculos}</Typography>
          <Typography variant="caption" color="text.secondary">{vehiculosDisponibles} disponibles actualmente</Typography>
        </Paper>
        <Paper elevation={3} sx={{ flex: 1, minWidth: 220, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: 'background.paper' }}>
          <Typography variant="subtitle2" color="text.secondary">Reservas Activas</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{reservasActivas}</Typography>
          <Typography variant="caption" color="text.secondary">6 reservas totales</Typography>
        </Paper>
        <Paper elevation={3} sx={{ flex: 1, minWidth: 220, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: 'background.paper' }}>
          <Typography variant="subtitle2" color="text.secondary">Ingresos Mensuales</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>${ingresosMensuales}</Typography>
          <Typography variant="caption" color="success.main">+5.1% respecto al mes pasado</Typography>
        </Paper>
        <Paper elevation={3} sx={{ flex: 1, minWidth: 220, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: 'background.paper' }}>
          <Typography variant="subtitle2" color="text.secondary">Clientes Totales</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{clientesTotales}</Typography>
          <Typography variant="caption" color="success.main">+2 nuevos clientes este mes</Typography>
        </Paper>
      </Box>
      {/* Gráficos */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Paper elevation={3} sx={{ flex: 2, minWidth: 320, p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Ingresos Mensuales</Typography>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={datosIngresos} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="ingresos" stroke="#1976d2" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
        <Paper elevation={3} sx={{ flex: 2, minWidth: 320, p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Vehículos Populares</Typography>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={datosVehiculosPopulares} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="alquileres" fill="#ff9800" radius={[8, 8, 0, 0]} name="Alquileres" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>
      {/* Tabla de reservas recientes */}
      <Paper elevation={3} sx={{ width: '100%', maxWidth: '100%', p: 2, bgcolor: 'background.paper', mt: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Reservas Recientes</Typography>
        <Box sx={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: 8, textAlign: 'left' }}>ID</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Cliente</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Vehículo</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Fechas</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Estado</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Importe</th>
              </tr>
            </thead>
            <tbody>
              {reservasRecientes.map((res) => (
                <tr key={res.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: 8 }}>#{res.id}</td>
                  <td style={{ padding: 8 }}>{res.cliente}</td>
                  <td style={{ padding: 8 }}>{res.vehiculo}</td>
                  <td style={{ padding: 8 }}>{res.fechas}</td>
                  <td style={{ padding: 8 }}>
                    <span style={{
                      background: colorEstado(res.estado),
                      color: '#fff',
                      borderRadius: 8,
                      padding: '2px 10px',
                      fontSize: 13,
                      fontWeight: 600
                    }}>{res.estado}</span>
                  </td>
                  <td style={{ padding: 8 }}>${res.importe}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Paper>
    </Box>
  );
}

