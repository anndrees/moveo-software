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
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import CircularProgress from '@mui/material/CircularProgress';
import { useAutenticacion } from '../contexto/ContextoAutenticacion';

export default function ClienteReservas() {
  const { usuario } = useAutenticacion();
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerReservas = async () => {
      setCargando(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const urlApi = import.meta.env.DEV ? 'http://localhost:8000/api' : '/api';
        // Se asume que existe un endpoint que devuelve todas las reservas del usuario autenticado
        const respuesta = await fetch(`${urlApi}/usuarios/historial-reservas`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const datos = await respuesta.json();
        setReservas(Array.isArray(datos) ? datos : []);
      } catch (e) {
        setError('No se pudieron cargar tus reservas.');
      } finally {
        setCargando(false);
      }
    };
    obtenerReservas();
  }, []);

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
          Mis Reservas
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Aquí puedes ver todas las reservas que has realizado.
        </Typography>
        {cargando ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ my: 2 }}>{error}</Typography>
        ) : reservas.length === 0 ? (
          <Typography color="text.secondary" sx={{ my: 2 }}>No tienes reservas registradas.</Typography>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Vehículo</TableCell>
                  <TableCell>Fecha inicio</TableCell>
                  <TableCell>Fecha fin</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Total (€)</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reservas.map((reserva) => (
                  <TableRow key={reserva.uuid || reserva.id || `${reserva.vehiculo?.matricula}-${reserva.fecha_inicio}` }>
                    <TableCell>
                      {reserva.vehiculo?.matricula || '-'}<br/>
                      <span style={{ color: '#888', fontSize: 13 }}>{reserva.vehiculo?.modelo || ''}</span>
                    </TableCell>
                    <TableCell>{reserva.fecha_inicio ? new Date(reserva.fecha_inicio).toLocaleDateString('es-ES') : ''}</TableCell>
                    <TableCell>{reserva.fecha_fin ? new Date(reserva.fecha_fin).toLocaleDateString('es-ES') : ''}</TableCell>
                    <TableCell>{reserva.estado}</TableCell>
                    <TableCell>{reserva.total ? reserva.total.toFixed(2) : '0.00'}</TableCell>
                    <TableCell>
                      <IconButton color="primary" title="Ver detalle" disabled>
                        <SearchIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}

