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
import BuildIcon from '@mui/icons-material/Build';
import SearchIcon from '@mui/icons-material/Search';
import HandymanIcon from '@mui/icons-material/Handyman';
import SettingsIcon from '@mui/icons-material/Settings';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

export default function AdminMantenimientos() {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [abrirModal, setAbrirModal] = useState(false);
  const [mantenimientoActual, setMantenimientoActual] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const urlApi = import.meta.env.DEV ? 'http://localhost:8000/api' : '/api';

  useEffect(() => {
    obtenerMantenimientos();
    obtenerVehiculos();
  }, []);

  const obtenerMantenimientos = async () => {
    setCargando(true);
    try {
      const resp = await fetch(`${urlApi}/mantenimientos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      setMantenimientos(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('Error al cargar mantenimientos');
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

  const [erroresFormulario, setErroresFormulario] = useState({});

  const abrirCrear = () => {
    setMantenimientoActual({
      fecha: '',
      tipo: '',
      costo: '',
      estado: '',
      realizado_por: '',
      vehiculo_id: '',
    });
    setErroresFormulario({});
    setAbrirModal(true);
  };

  const abrirEditar = (mantenimiento) => {
    setMantenimientoActual({ ...mantenimiento, fecha: dayjs(mantenimiento.fecha) });
    setErroresFormulario({});
    setAbrirModal(true);
  };

  const cerrarModal = () => {
    setMantenimientoActual(null);
    setAbrirModal(false);
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setMantenimientoActual((prev) => ({ ...prev, [name]: value }));
    setErroresFormulario((prev) => ({ ...prev, [name]: '' }));
  };

  const manejarFecha = (nuevaFecha) => {
    setMantenimientoActual((prev) => ({ ...prev, fecha: nuevaFecha }));
    setErroresFormulario((prev) => ({ ...prev, fecha: '' }));
  };

  const validarFormulario = () => {
    const errores = {};
    if (!mantenimientoActual.vehiculo_id) errores.vehiculo_id = 'El vehículo es obligatorio';
    if (!mantenimientoActual.fecha) errores.fecha = 'La fecha es obligatoria';
    if (!mantenimientoActual.tipo) errores.tipo = 'El tipo es obligatorio';
    if (!mantenimientoActual.costo) errores.costo = 'El costo es obligatorio';
    if (!mantenimientoActual.estado) errores.estado = 'El estado es obligatorio';
    if (!mantenimientoActual.realizado_por) errores.realizado_por = 'El campo es obligatorio';
    return errores;
  };

  const guardarMantenimiento = async () => {
    const errores = validarFormulario();
    if (Object.keys(errores).length > 0) {
      setErroresFormulario(errores);
      return;
    }
    setCargando(true);
    setError('');
    try {
      const metodo = mantenimientoActual.id ? 'PUT' : 'POST';
      const url = mantenimientoActual.id ? `${urlApi}/mantenimientos/${mantenimientoActual.id}` : `${urlApi}/mantenimientos`;
      const resp = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...mantenimientoActual,
          fecha: mantenimientoActual.fecha ? dayjs(mantenimientoActual.fecha).format('YYYY-MM-DD') : '',
        }),
      });
      if (!resp.ok) {
        let mensaje = 'Error al guardar mantenimiento';
        try {
          const errorData = await resp.json();
          if (errorData && (errorData.mensaje || errorData.errores)) {
            mensaje = errorData.mensaje || (Array.isArray(errorData.errores) ? errorData.errores.join(', ') : JSON.stringify(errorData.errores));
          }
        } catch {}
        throw new Error(mensaje);
      }
      cerrarModal();
      obtenerMantenimientos();
    } catch (e) {
      setError(e.message || 'Error al guardar mantenimiento');
    } finally {
      setCargando(false);
    }
  };

  const eliminarMantenimiento = async (id) => {
    setCargando(true);
    setError('');
    try {
      const resp = await fetch(`${urlApi}/mantenimientos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error('Error al eliminar mantenimiento');
      setEliminando(null);
      obtenerMantenimientos();
    } catch (e) {
      setError('Error al eliminar mantenimiento');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', bgcolor: '#f5f5f5', py: 4 }}>
      <Paper elevation={8} sx={{ p: 3, maxWidth: 1200, margin: '0 auto', borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" fontWeight={700}>Gestión de Mantenimientos</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={abrirCrear}>
            Nuevo mantenimiento
          </Button>
        </Box>
        {error && <Typography color="error">{error}</Typography>}
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Vehículo</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Costo</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Realizado por</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mantenimientos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">No hay mantenimientos registrados.</TableCell>
                </TableRow>
              )}
              {mantenimientos.map((mantenimiento) => {
                // Icono según tipo
                let iconoTipo = null;
                if (mantenimiento.tipo === 'inspección') {
                  iconoTipo = <SearchIcon sx={{ verticalAlign: 'middle', color: '#1976d2' }} fontSize="small" />;
                } else if (mantenimiento.tipo === 'reparación') {
                  iconoTipo = <BuildIcon sx={{ verticalAlign: 'middle', color: '#d32f2f' }} fontSize="small" />;
                } else if (mantenimiento.tipo === 'mantenimiento regular') {
                  iconoTipo = <HandymanIcon sx={{ verticalAlign: 'middle', color: '#388e3c' }} fontSize="small" />;
                } else {
                  iconoTipo = <SettingsIcon sx={{ verticalAlign: 'middle', color: '#757575' }} fontSize="small" />;
                }
                // Estado pill
                let colorEstado = '#e0e0e0', textoEstado = '';
                if (mantenimiento.estado === 'completado') {
                  colorEstado = '#a5e5a5'; textoEstado = 'Completado';
                } else if (mantenimiento.estado === 'en progreso') {
                  colorEstado = '#a4c9f7'; textoEstado = 'En progreso';
                } else if (mantenimiento.estado === 'programado') {
                  colorEstado = '#ffe49c'; textoEstado = 'Programado';
                } else {
                  textoEstado = mantenimiento.estado;
                }
                return (
                  <TableRow key={mantenimiento.id}>
                    <TableCell>{mantenimiento.id}</TableCell>
                    <TableCell>{mantenimiento.vehiculo?.matricula || ''} {mantenimiento.vehiculo?.modelo ? `(${mantenimiento.vehiculo.modelo})` : ''}</TableCell>
                    <TableCell>{dayjs(mantenimiento.fecha).format('DD-MM-YYYY')}</TableCell>
                    <TableCell>
  <span style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
    {iconoTipo}
    <span style={{ marginLeft: 4, whiteSpace: 'nowrap' }}>
      {mantenimiento.tipo.charAt(0).toUpperCase() + mantenimiento.tipo.slice(1)}
    </span>
  </span>
</TableCell>
                    
                    <TableCell>{mantenimiento.costo} €</TableCell>
                    <TableCell>
                      <span style={{
                        background: colorEstado,
                        color: '#222',
                        borderRadius: 12,
                        padding: '2px 12px',
                        fontWeight: 600,
                        fontSize: 13,
                        display: 'inline-block'
                      }}>{textoEstado}</span>
                    </TableCell>
                    <TableCell>{mantenimiento.realizado_por}</TableCell>
                    <TableCell align="center">
  <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, flexWrap: 'nowrap' }}>
    <IconButton color="info" disabled><VisibilityIcon /></IconButton>
    <IconButton color="primary" onClick={() => abrirEditar(mantenimiento)}><EditIcon /></IconButton>
    <IconButton color="error" onClick={() => setEliminando(mantenimiento.id)}><DeleteIcon /></IconButton>
  </span>
</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Modal Crear/Editar */}
        <Dialog open={abrirModal} onClose={cerrarModal} maxWidth="sm" fullWidth>
          <DialogTitle>{mantenimientoActual?.id ? 'Editar mantenimiento' : 'Nuevo mantenimiento'}</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Vehículo *</Typography>
              <Select
                name="vehiculo_id"
                value={mantenimientoActual?.vehiculo_id || ''}
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
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Fecha *</Typography>
              <DatePicker
                label="Fecha *"
                value={mantenimientoActual?.fecha ? dayjs(mantenimientoActual.fecha) : null}
                onChange={manejarFecha}
                format="DD-MM-YYYY"
                slotProps={{ textField: { fullWidth: true, error: !!erroresFormulario.fecha, helperText: erroresFormulario.fecha } }}
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Tipo *</Typography>
              <Select
                name="tipo"
                value={mantenimientoActual?.tipo || ''}
                onChange={manejarCambio}
                error={!!erroresFormulario.tipo}
                fullWidth
              >
                <MenuItem value="">Selecciona un tipo</MenuItem>
                <MenuItem value="inspección">Inspección</MenuItem>
                <MenuItem value="reparación">Reparación</MenuItem>
                <MenuItem value="mantenimiento regular">Mantenimiento regular</MenuItem>
              </Select>
            </Box>
            <TextField
              margin="dense"
              label="Costo (€) *"
              name="costo"
              type="number"
              value={mantenimientoActual?.costo || ''}
              onChange={manejarCambio}
              error={!!erroresFormulario.costo}
              helperText={erroresFormulario.costo}
              fullWidth
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Estado *</Typography>
              <Select
                name="estado"
                value={mantenimientoActual?.estado || ''}
                onChange={manejarCambio}
                error={!!erroresFormulario.estado}
                fullWidth
              >
                <MenuItem value="">Selecciona un estado</MenuItem>
                <MenuItem value="completado">Completado</MenuItem>
                <MenuItem value="en progreso">En progreso</MenuItem>
                <MenuItem value="programado">Programado</MenuItem>
              </Select>
            </Box>
            <TextField
              margin="dense"
              label="Realizado por *"
              name="realizado_por"
              value={mantenimientoActual?.realizado_por || ''}
              onChange={manejarCambio}
              error={!!erroresFormulario.realizado_por}
              helperText={erroresFormulario.realizado_por}
              fullWidth
            />
            {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
            {Object.values(erroresFormulario).some(Boolean) && (
              <Typography color="error" sx={{ mt: 2 }}>
                Por favor, revisa los campos obligatorios marcados con *
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={cerrarModal}>Cancelar</Button>
            <Button variant="contained" onClick={guardarMantenimiento} disabled={cargando}>
              {mantenimientoActual?.id ? 'Guardar cambios' : 'Crear mantenimiento'}
            </Button>

          </DialogActions>
        </Dialog>
        {/* Confirmación de eliminación */}
        <Dialog open={!!eliminando} onClose={() => setEliminando(null)}>
          <DialogTitle>¿Eliminar mantenimiento?</DialogTitle>
          <DialogActions>
            <Button onClick={() => setEliminando(null)}>Cancelar</Button>
            <Button color="error" onClick={() => eliminarMantenimiento(eliminando)} disabled={cargando}>
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
}
