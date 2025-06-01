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
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CircularProgress from '@mui/material/CircularProgress';
import { useAutenticacion } from '../contexto/ContextoAutenticacion';

export default function ClienteVehiculos() {
  const { usuario } = useAutenticacion();
  const [vehiculos, setVehiculos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerVehiculosReservados = async () => {
      setCargando(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const urlApi = import.meta.env.DEV ? 'http://localhost:8000/api' : '/api';
        // Se asume que existe un endpoint que devuelve los vehículos reservados por el usuario autenticado
        const respuesta = await fetch(`${urlApi}/usuarios/vehiculos-reservados`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const datos = await respuesta.json();
        setVehiculos(Array.isArray(datos) ? datos : []);
      } catch (e) {
        setError('No se pudieron cargar tus vehículos reservados.');
      } finally {
        setCargando(false);
      }
    };
    obtenerVehiculosReservados();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: { xs: '#f5f5f5', md: 'linear-gradient(120deg, #e3f2fd 0%, #f5f5f5 100%)' }, px: 2 }}>
      <Paper elevation={8} sx={{ p: { xs: 3, md: 5 }, maxWidth: 900, width: '100%', borderRadius: 3, boxShadow: { xs: 6, md: 12 }, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          Mis Vehículos Reservados
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Aquí puedes ver la información de los vehículos que tienes actualmente reservados.
        </Typography>
        {cargando ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ my: 2 }}>{error}</Typography>
        ) : vehiculos.length === 0 ? (
          <Typography color="text.secondary" sx={{ my: 2 }}>No tienes vehículos reservados actualmente.</Typography>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Matrícula</TableCell>
                  <TableCell>Modelo</TableCell>
                  <TableCell>Marca</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Fecha inicio</TableCell>
                  <TableCell>Fecha fin</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vehiculos.map((vehiculo) => (
                  <TableRow key={vehiculo.uuid || vehiculo.id || `${vehiculo.matricula}-${vehiculo.modelo}` }>
                    <TableCell>{vehiculo.matricula}</TableCell>
                    <TableCell>{vehiculo.modelo}</TableCell>
                    <TableCell>{vehiculo.marca}</TableCell>
                    <TableCell>{vehiculo.tipo}</TableCell>
                    <TableCell>{vehiculo.estado}</TableCell>
                    <TableCell>{vehiculo.fecha_inicio ? new Date(vehiculo.fecha_inicio).toLocaleDateString('es-ES') : ''}</TableCell>
                    <TableCell>{vehiculo.fecha_fin ? new Date(vehiculo.fecha_fin).toLocaleDateString('es-ES') : ''}</TableCell>
                    <TableCell>
                      <IconButton color="primary" title="Ver detalle" disabled>
                        <DirectionsCarIcon />
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

