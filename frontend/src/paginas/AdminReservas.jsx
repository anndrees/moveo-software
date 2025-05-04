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
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

export default function AdminReservas() {
  const [reservas, setReservas] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [abrirModal, setAbrirModal] = useState(false);
  const [reservaActual, setReservaActual] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const urlApi = import.meta.env.DEV ? 'http://localhost:8000/api' : '/api';

  useEffect(() => {
    obtenerReservas();
    obtenerVehiculos();
    obtenerClientes();
  }, []);

  const obtenerReservas = async () => {
    setCargando(true);
    try {
      const resp = await fetch(`${urlApi}/reservas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      setReservas(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('Error al cargar reservas');
    } finally {
      setCargando(false);
    }
  };

  const obtenerVehiculos = async () => {
    try {
      const resp = await fetch(`${urlApi}/vehiculos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      setVehiculos(data);
    } catch (e) {
      setError('Error al cargar vehículos');
    }
  };

  const obtenerClientes = async () => {
    try {
      const resp = await fetch(`${urlApi}/clientes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      setClientes(data);
    } catch (e) {
      setError('Error al cargar clientes');
    }
  };

  const [erroresFormulario, setErroresFormulario] = useState({});

  const abrirCrear = () => {
    setReservaActual({
      vehiculo_id: '',
      cliente_id: '',
      fecha_inicio: '',
      fecha_fin: '',
      estado: '',
    });
    setErroresFormulario({});
    setAbrirModal(true);
  };

  const abrirEditar = (reserva) => {
    setReservaActual({ ...reserva, fecha_inicio: dayjs(reserva.fecha_inicio), fecha_fin: dayjs(reserva.fecha_fin) });
    setErroresFormulario({});
    setAbrirModal(true);
  };

  const cerrarModal = () => {
    setReservaActual(null);
    setAbrirModal(false);
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setReservaActual((prev) => ({ ...prev, [name]: value }));
    setErroresFormulario((prev) => ({ ...prev, [name]: '' }));
  };

  const manejarFechaInicio = (nuevaFecha) => {
    setReservaActual((prev) => ({ ...prev, fecha_inicio: nuevaFecha }));
    setErroresFormulario((prev) => ({ ...prev, fecha_inicio: '' }));
  };

  const manejarFechaFin = (nuevaFecha) => {
    setReservaActual((prev) => ({ ...prev, fecha_fin: nuevaFecha }));
    setErroresFormulario((prev) => ({ ...prev, fecha_fin: '' }));
  };

  const validarFormulario = () => {
    const errores = {};
    if (!reservaActual.vehiculo_id) errores.vehiculo_id = 'El vehículo es obligatorio';
    if (!reservaActual.cliente_id) errores.cliente_id = 'El cliente es obligatorio';
    if (!reservaActual.fecha_inicio) errores.fecha_inicio = 'La fecha de inicio es obligatoria';
    if (!reservaActual.fecha_fin) errores.fecha_fin = 'La fecha de fin es obligatoria';
    if (!reservaActual.estado) errores.estado = 'El estado es obligatorio';
    return errores;
  };

  const guardarReserva = async () => {
    const errores = validarFormulario();
    if (Object.keys(errores).length > 0) {
      setErroresFormulario(errores);
      return;
    }
    setCargando(true);
    setError('');
    try {
      const metodo = reservaActual.id ? 'PUT' : 'POST';
      const url = reservaActual.id ? `${urlApi}/reservas/${reservaActual.id}` : `${urlApi}/reservas`;
      const resp = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...reservaActual,
          fecha_inicio: reservaActual.fecha_inicio ? dayjs(reservaActual.fecha_inicio).format('YYYY-MM-DD') : '',
          fecha_fin: reservaActual.fecha_fin ? dayjs(reservaActual.fecha_fin).format('YYYY-MM-DD') : '',
        }),
      });
      if (!resp.ok) {
        let mensaje = 'Error al guardar reserva';
        try {
          const errorData = await resp.json();
          if (errorData && (errorData.mensaje || errorData.errores)) {
            mensaje = errorData.mensaje || (Array.isArray(errorData.errores) ? errorData.errores.join(', ') : JSON.stringify(errorData.errores));
          }
        } catch {}
        throw new Error(mensaje);
      }
      cerrarModal();
      obtenerReservas();
    } catch (e) {
      setError(e.message || 'Error al guardar reserva');
    } finally {
      setCargando(false);
    }
  };

  const eliminarReserva = async (id) => {
    setCargando(true);
    setError('');
    try {
      const resp = await fetch(`${urlApi}/reservas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error('Error al eliminar reserva');
      setEliminando(null);
      obtenerReservas();
    } catch (e) {
      setError('Error al eliminar reserva');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', bgcolor: '#f5f5f5', py: 4 }}>
      <Paper elevation={8} sx={{ p: 3, maxWidth: 1200, margin: '0 auto', borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" fontWeight={700}>Gestión de Reservas</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={abrirCrear}>
            Nueva reserva
          </Button>
        </Box>
        {error && <Typography color="error">{error}</Typography>}
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Vehículo</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Fecha inicio</TableCell>
                <TableCell>Fecha fin</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">No hay reservas registradas.</TableCell>
                </TableRow>
              )}
              {reservas.map((reserva) => (
                <TableRow key={reserva.id}>
                  <TableCell>{reserva.vehiculo?.matricula || ''} {reserva.vehiculo?.modelo ? `(${reserva.vehiculo.modelo})` : ''}</TableCell>
                  <TableCell>{reserva.cliente?.nombre || ''} {reserva.cliente?.apellidos || ''}</TableCell>
                  <TableCell>{dayjs(reserva.fecha_inicio).format('DD-MM-YYYY')}</TableCell>
                  <TableCell>{dayjs(reserva.fecha_fin).format('DD-MM-YYYY')}</TableCell>
                  <TableCell>{reserva.estado}</TableCell>
                  <TableCell align="center">
                    <IconButton color="info" disabled><VisibilityIcon /></IconButton>
                    <IconButton color="primary" onClick={() => abrirEditar(reserva)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => setEliminando(reserva.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Modal Crear/Editar */}
        <Dialog open={abrirModal} onClose={cerrarModal} maxWidth="sm" fullWidth>
          <DialogTitle>{reservaActual?.id ? 'Editar reserva' : 'Nueva reserva'}</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Vehículo *</Typography>
              <Select
                name="vehiculo_id"
                value={reservaActual?.vehiculo_id || ''}
                onChange={manejarCambio}
                error={!!erroresFormulario.vehiculo_id}
                fullWidth
              >
                <MenuItem value="">Selecciona un vehículo</MenuItem>
                {vehiculos.map((v) => (
                  <MenuItem key={v.id} value={v.id}>{v.matricula} {v.modelo ? `(${v.modelo})` : ''}</MenuItem>
                ))}
              </Select>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Cliente *</Typography>
              <Select
                name="cliente_id"
                value={reservaActual?.cliente_id || ''}
                onChange={manejarCambio}
                error={!!erroresFormulario.cliente_id}
                fullWidth
              >
                <MenuItem value="">Selecciona un cliente</MenuItem>
                {clientes.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.nombre} {c.apellidos}</MenuItem>
                ))}
              </Select>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Fecha inicio *</Typography>
              <DatePicker
                label="Fecha inicio *"
                value={reservaActual?.fecha_inicio ? dayjs(reservaActual.fecha_inicio) : null}
                onChange={manejarFechaInicio}
                format="DD-MM-YYYY"
                slotProps={{ textField: { fullWidth: true, error: !!erroresFormulario.fecha_inicio, helperText: erroresFormulario.fecha_inicio } }}
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Fecha fin *</Typography>
              <DatePicker
                label="Fecha fin *"
                value={reservaActual?.fecha_fin ? dayjs(reservaActual.fecha_fin) : null}
                onChange={manejarFechaFin}
                format="DD-MM-YYYY"
                slotProps={{ textField: { fullWidth: true, error: !!erroresFormulario.fecha_fin, helperText: erroresFormulario.fecha_fin } }}
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Estado *</Typography>
              <Select
                name="estado"
                value={reservaActual?.estado || ''}
                onChange={manejarCambio}
                error={!!erroresFormulario.estado}
                fullWidth
              >
                <MenuItem value="">Selecciona un estado</MenuItem>
                <MenuItem value="pendiente">Pendiente</MenuItem>
                <MenuItem value="confirmada">Confirmada</MenuItem>
                <MenuItem value="cancelada">Cancelada</MenuItem>
                <MenuItem value="finalizada">Finalizada</MenuItem>
              </Select>
            </Box>
            {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
            {Object.values(erroresFormulario).some(Boolean) && (
              <Typography color="error" sx={{ mt: 2 }}>
                Por favor, revisa los campos obligatorios marcados con *
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={cerrarModal}>Cancelar</Button>
            <Button variant="contained" onClick={guardarReserva} disabled={cargando}>
              {reservaActual?.id ? 'Guardar cambios' : 'Crear reserva'}
            </Button>

          </DialogActions>
        </Dialog>
        {/* Confirmación de eliminación */}
        <Dialog open={!!eliminando} onClose={() => setEliminando(null)}>
          <DialogTitle>¿Eliminar reserva?</DialogTitle>
          <DialogActions>
            <Button onClick={() => setEliminando(null)}>Cancelar</Button>
            <Button color="error" onClick={() => eliminarReserva(eliminando)} disabled={cargando}>
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
}
