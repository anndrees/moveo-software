import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { Link } from 'react-router-dom';
import { useAutenticacion } from '../contexto/ContextoAutenticacion';

export default function AdminVehiculos() {
  const [vista, setVista] = useState('lista'); // 'lista' o 'cuadricula'

  const { usuario, cargando } = useAutenticacion();
  const [vehiculos, setVehiculos] = useState([]);
  const [cargandoVehiculos, setCargandoVehiculos] = useState(true);
  const [error, setError] = useState(null);
  const [abrirModal, setAbrirModal] = useState(false);
  const [vehiculoActual, setVehiculoActual] = useState(null);
  const [snackbar, setSnackbar] = useState({ abierto: false, mensaje: '', severidad: 'success' });
  const [eliminandoId, setEliminandoId] = useState(null);

  // Ruta base de la API
  const RUTA_API = import.meta.env.DEV ? 'http://localhost:8000' : '';

  const obtenerVehiculos = async () => {
  setCargandoVehiculos(true);
  try {
    const token = localStorage.getItem('token');
    const respuesta = await fetch(`${RUTA_API}/api/vehiculos`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!respuesta.ok) throw new Error('Error al obtener vehículos');
    const data = await respuesta.json();
    setVehiculos(data);
  } catch (err) {
    setError('No se pudieron cargar los vehículos');
  } finally {
    setCargandoVehiculos(false);
  }
};

  useEffect(() => {
    if (usuario && usuario.rol === 'admin') obtenerVehiculos();
  }, [usuario]);

  const [erroresFormulario, setErroresFormulario] = useState({});

  const abrirCrear = () => {
    setVehiculoActual({ matricula: '', modelo: '', tipo: 'SUV', imagen: '', localizacion: '', estado: 'disponible', fecha_proximo_mantenimiento: '' });
    setErroresFormulario({});
    setAbrirModal(true);
  };
  const abrirEditar = (vehiculo) => {
    setVehiculoActual({ ...vehiculo });
    setErroresFormulario({});
    setAbrirModal(true);
  };
  const cerrarModal = () => {
    setVehiculoActual(null);
    setAbrirModal(false);
  };
  const manejarCambio = (e) => {
    const { name, value, files } = e.target;
    if (name === 'imagen' && files && files.length > 0) {
      setVehiculoActual({ ...vehiculoActual, imagen: files[0] });
    } else {
      setVehiculoActual({ ...vehiculoActual, [name]: value });
    }
    setErroresFormulario((prev) => ({ ...prev, [name]: '' }));
  };
  const validarFormulario = () => {
    const errores = {};
    if (!vehiculoActual.matricula) errores.matricula = 'La matrícula es obligatoria';
    if (!vehiculoActual.modelo) errores.modelo = 'El modelo es obligatorio';
    if (!vehiculoActual.tipo) errores.tipo = 'El tipo es obligatorio';
    if (!vehiculoActual.localizacion) errores.localizacion = 'La localización es obligatoria';
    if (!vehiculoActual.estado) errores.estado = 'El estado es obligatorio';
    return errores;
  };

  const guardarVehiculo = async () => {
    const errores = validarFormulario();
    if (Object.keys(errores).length > 0) {
      setErroresFormulario(errores);
      return;
    }
    try {
      const esNuevo = !vehiculoActual.id;
      const url = esNuevo
        ? `${RUTA_API}/api/vehiculos`
        : `${RUTA_API}/api/vehiculos/${vehiculoActual.id}`;
      const token = localStorage.getItem('token');
      const formData = new FormData();
      Object.entries(vehiculoActual).forEach(([key, value]) => {
  if (key === 'imagen' && typeof value === 'string') {
    // No enviar la imagen si es string (ya existe en el backend)
    return;
  }
  if (value !== undefined && value !== null) {
    formData.append(key, value);
  }
});
      if (!esNuevo) formData.append('_method', 'PUT');
      const respuesta = await fetch(url, {
        method: 'POST', // Laravel requiere POST para FormData en update
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
      if (!respuesta.ok) throw new Error('Error al guardar vehículo');
      setSnackbar({ abierto: true, mensaje: esNuevo ? 'Vehículo creado' : 'Vehículo actualizado', severidad: 'success' });
      cerrarModal();
      obtenerVehiculos();
    } catch (err) {
      setSnackbar({ abierto: true, mensaje: 'Error al guardar vehículo', severidad: 'error' });
    }
  };
  const eliminarVehiculo = async (id) => {
    setEliminandoId(id);
    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`${RUTA_API}/api/vehiculos/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!respuesta.ok) throw new Error('Error al eliminar vehículo');
      setSnackbar({ abierto: true, mensaje: 'Vehículo eliminado', severidad: 'success' });
      obtenerVehiculos();
    } catch (err) {
      setSnackbar({ abierto: true, mensaje: 'Error al eliminar vehículo', severidad: 'error' });
    } finally {
      setEliminandoId(null);
    }
  };

  if (cargando) return <div className="text-center mt-5"><div className="spinner-border" role="status"><span className="visually-hidden">Cargando...</span></div></div>;
  if (!usuario || usuario.rol !== 'admin') return <div className="alert alert-danger mt-5 text-center">No tienes permiso para ver esta página.</div>;

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', bgcolor: { xs: '#f5f5f5', md: 'linear-gradient(120deg, #e3f2fd 0%, #f5f5f5 100%)' }, px: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Paper elevation={8} sx={{ p: { xs: 3, md: 5 }, maxWidth: 1000, width: '100%', borderRadius: 3, boxShadow: { xs: 6, md: 12 }, textAlign: 'center', mt: 4 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          Gestión de Vehículos
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Button variant="contained" color="primary" onClick={abrirCrear}>Nuevo vehículo</Button>
          <Box>
            <Button
              variant={vista === 'lista' ? 'contained' : 'outlined'}
              color="secondary"
              sx={{ mr: 1 }}
              onClick={() => setVista('lista')}
              startIcon={<VisibilityIcon />}
            >
              Lista
            </Button>
            <Button
              variant={vista === 'cuadricula' ? 'contained' : 'outlined'}
              color="secondary"
              onClick={() => setVista('cuadricula')}
              startIcon={<ViewModuleIcon />}
            >
              Cuadrícula
            </Button>
          </Box>
        </Box>
        {vista === 'lista' ? (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.100' }}>
                <TableRow>
                  <TableCell>Imagen</TableCell>
                  <TableCell>Matrícula</TableCell>
                  <TableCell>Modelo</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Localización</TableCell>
                  <TableCell>Próximo mantenimiento</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cargandoVehiculos ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">Cargando vehículos...</TableCell>
                  </TableRow>
                ) : vehiculos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No hay vehículos registrados.</TableCell>
                  </TableRow>
                ) : (
                  vehiculos.map((vehiculo) => (
                    <TableRow key={vehiculo.id}>
                      <TableCell>
                        <img
  src={vehiculo.imagen ? vehiculo.imagen : '/storage/default.png'}
  alt={vehiculo.modelo}
  style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6 }}
  onError={e => {
    if (!e.target.dataset.fallback) {
      e.target.src = '/storage/default.png';
      e.target.dataset.fallback = "true";
    }
  }}
/>
                      </TableCell>
                      <TableCell>{vehiculo.matricula}</TableCell>
                      <TableCell>{vehiculo.modelo}</TableCell>
                      <TableCell>{vehiculo.tipo}</TableCell>
                      <TableCell>{vehiculo.localizacion}</TableCell>
                      <TableCell>{vehiculo.fecha_proximo_mantenimiento || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={vehiculo.estado.charAt(0).toUpperCase() + vehiculo.estado.slice(1)}
                          color={vehiculo.estado === 'disponible' ? 'success' : vehiculo.estado === 'ocupado' ? 'error' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1, flexWrap: 'nowrap' }}>
                          <IconButton component={Link} to={`/admin/vehiculos/${vehiculo.id}`} color="info" size="small" title="Ver detalle">
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton color="warning" size="small" onClick={() => abrirEditar(vehiculo)} title="Editar">
                            <EditIcon />
                          </IconButton>
                          <IconButton color="error" size="small" onClick={() => eliminarVehiculo(vehiculo.id)} disabled={eliminandoId === vehiculo.id} title="Eliminar">
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', mt: 3 }}>
            {cargandoVehiculos ? (
              <Typography sx={{ mt: 4 }}>Cargando vehículos...</Typography>
            ) : vehiculos.length === 0 ? (
              <Typography sx={{ mt: 4 }}>No hay vehículos registrados.</Typography>
            ) : (
              vehiculos.map((vehiculo) => (
                <Paper key={vehiculo.id} elevation={4} sx={{ width: 260, p: 2, borderRadius: 3, boxShadow: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  <Box sx={{ width: '100%', height: 120, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', borderRadius: 2, overflow: 'hidden' }}>
                    <img
  src={vehiculo.imagen ? vehiculo.imagen : '/storage/default.png'}
  alt={vehiculo.modelo}
  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
  onError={e => {
    if (!e.target.dataset.fallback) {
      e.target.src = '/storage/default.png';
      e.target.dataset.fallback = "true";
    }
  }}
/>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{vehiculo.matricula}</Typography>
                  <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 0.5 }}>{vehiculo.modelo}</Typography>
                  <Typography variant="body2" sx={{ color: 'primary.main', mb: 0.5 }}>{vehiculo.tipo}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Ubicación: {vehiculo.localizacion}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Próx. mant.: {vehiculo.fecha_proximo_mantenimiento || '-'}</Typography>
                  <Chip
                    label={vehiculo.estado.charAt(0).toUpperCase() + vehiculo.estado.slice(1)}
                    color={vehiculo.estado === 'disponible' ? 'success' : vehiculo.estado === 'ocupado' ? 'error' : 'warning'}
                    size="small"
                    sx={{ mt: 1, mb: 1 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <IconButton component={Link} to={`/admin/vehiculos/${vehiculo.id}`} color="info" size="small" title="Ver detalle">
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton color="warning" size="small" onClick={() => abrirEditar(vehiculo)} title="Editar">
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" size="small" onClick={() => eliminarVehiculo(vehiculo.id)} disabled={eliminandoId === vehiculo.id} title="Eliminar">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Paper>
              ))
            )}
          </Box>
        )}
      </Paper>
    {/* MODAL para crear/editar vehículo */}
    <Dialog open={abrirModal} onClose={cerrarModal} maxWidth="sm" fullWidth>
      <DialogTitle>{vehiculoActual && vehiculoActual.id ? 'Editar vehículo' : 'Nuevo vehículo'}</DialogTitle>
      <DialogContent>
          <>
            <TextField
              margin="dense"
              label="Matrícula *"
              name="matricula"
              value={vehiculoActual?.matricula || ''}
              onChange={manejarCambio}
              error={!!erroresFormulario.matricula}
              helperText={erroresFormulario.matricula}
              fullWidth
            />
            <TextField
              margin="dense"
              label="Modelo *"
              name="modelo"
              value={vehiculoActual?.modelo || ''}
              onChange={manejarCambio}
              error={!!erroresFormulario.modelo}
              helperText={erroresFormulario.modelo}
              fullWidth
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Tipo *</Typography>
              <Select
                name="tipo"
                value={vehiculoActual?.tipo || ''}
                onChange={manejarCambio}
                error={!!erroresFormulario.tipo}
                fullWidth
              >
                <MenuItem value="SUV">SUV</MenuItem>
                <MenuItem value="Economy">Economy</MenuItem>
                <MenuItem value="Luxury">Luxury</MenuItem>
                <MenuItem value="Compact">Compact</MenuItem>
                <MenuItem value="Sedan">Sedan</MenuItem>
                <MenuItem value="Convertible">Convertible</MenuItem>
                <MenuItem value="Pickup">Pickup</MenuItem>
                <MenuItem value="Van">Van</MenuItem>
                <MenuItem value="Otro">Otro</MenuItem>
              </Select>
              {erroresFormulario.tipo && <Typography color="error">{erroresFormulario.tipo}</Typography>}
            </Box>
            <TextField
              margin="dense"
              label="Localización *"
              name="localizacion"
              value={vehiculoActual?.localizacion || ''}
              onChange={manejarCambio}
              error={!!erroresFormulario.localizacion}
              helperText={erroresFormulario.localizacion}
              fullWidth
            />
            <Box sx={{ mt: 2 }}>
              <DatePicker
                label="Próximo mantenimiento"
                value={vehiculoActual?.fecha_proximo_mantenimiento ? dayjs(vehiculoActual.fecha_proximo_mantenimiento) : null}
                onChange={nuevaFecha => manejarCambio({ target: { name: 'fecha_proximo_mantenimiento', value: nuevaFecha ? nuevaFecha.format('YYYY-MM-DD') : '' } })}
                format="DD-MM-YYYY"
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Estado *</Typography>
              <Select
                name="estado"
                value={vehiculoActual?.estado || ''}
                onChange={manejarCambio}
                error={!!erroresFormulario.estado}
                fullWidth
              >
                <MenuItem value="disponible">Disponible</MenuItem>
<MenuItem value="ocupado">Ocupado</MenuItem>
<MenuItem value="en_mantenimiento">En mantenimiento</MenuItem>
<MenuItem value="alquilado">Alquilado</MenuItem>
              </Select>
            </Box>
            {/* Campo de imagen al final con estilos mejorados */}
            <Box sx={{ mt: 3, mb: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Imagen</Typography>
              <label htmlFor="input-imagen-vehiculo">
                <input
                  id="input-imagen-vehiculo"
                  type="file"
                  name="imagen"
                  accept="image/*"
                  onChange={manejarCambio}
                  style={{ display: 'none' }}
                />
                <Button variant="outlined" component="span" sx={{ mr: 2 }}>
                  Seleccionar imagen
                </Button>
                <span style={{ fontSize: 14, color: '#666' }}>
                  {vehiculoActual?.imagen && typeof vehiculoActual.imagen !== 'string'
                    ? vehiculoActual.imagen.name
                    : vehiculoActual?.imagen && typeof vehiculoActual.imagen === 'string'
                      ? 'Imagen actual'
                      : 'Ningún archivo seleccionado'}
                </span>
              </label>
              {/* Previsualización de imagen */}
              {(vehiculoActual?.imagen && typeof vehiculoActual.imagen === 'string') && (
                <Box sx={{ mt: 1 }}>
                  <img src={vehiculoActual.imagen} alt="Previsualización" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                </Box>
              )}
              {(vehiculoActual?.imagen && typeof vehiculoActual.imagen !== 'string') && (
                <Box sx={{ mt: 1 }}>
                  <img src={URL.createObjectURL(vehiculoActual.imagen)} alt="Previsualización" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                </Box>
              )}
            </Box>
            {Object.values(erroresFormulario).some(Boolean) && (
              <Typography color="error" sx={{ mt: 2 }}>
                Por favor, revisa los campos obligatorios marcados con *
              </Typography>
            )}
          </>
       </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModal}>Cancelar</Button>
          <Button variant="contained" onClick={guardarVehiculo}>
            {vehiculoActual?.id ? 'Guardar cambios' : 'Crear vehículo'}
          </Button>
        </DialogActions>
    </Dialog>
  </Box>
  );
}
