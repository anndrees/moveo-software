import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export default function HistorialReservasTabla({ reservas }) {
  if (!reservas?.length) {
    return <Typography sx={{ mt: 2, mb: 1, color: 'text.secondary', textAlign: 'center' }}>No hay reservas previas.</Typography>;
  }
  return (
    <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 2 }}>
      <Table size="small" aria-label="historial de reservas">
        <TableHead>
          <TableRow>
            <TableCell>Fecha inicio</TableCell>
            <TableCell>Fecha fin</TableCell>
            <TableCell>Vehículo</TableCell>
            <TableCell>Estado</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reservas.map((reserva) => (
            <TableRow key={reserva.id}>
              <TableCell>{reserva.fecha_inicio?.slice(0,10)}</TableCell>
              <TableCell>{reserva.fecha_fin?.slice(0,10)}</TableCell>
              <TableCell>{reserva.vehiculo?.marca} {reserva.vehiculo?.modelo} ({reserva.vehiculo?.matricula})</TableCell>
              <TableCell>{reserva.estado || 'Desconocido'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
