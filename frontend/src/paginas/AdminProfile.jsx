import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import ReactCountryFlag from 'react-country-flag';
import { useState, useEffect } from 'react';
import { useAutenticacion } from '../contexto/ContextoAutenticacion';
import PestanasPerfil from '../componentes/PestanasPerfil.jsx';
import CambiarContrasenaDialog from '../componentes/CambiarContrasenaDialog.jsx';
import HistorialReservasTabla from '../componentes/HistorialReservasTabla.jsx';
import Avatar from '@mui/material/Avatar';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';

const codigosPais = [
  { codigo: '+34', pais: 'ES', nombre: 'España' },
  { codigo: '+33', pais: 'FR', nombre: 'Francia' },
  { codigo: '+39', pais: 'IT', nombre: 'Italia' },
  { codigo: '+44', pais: 'GB', nombre: 'Reino Unido' },
  { codigo: '+49', pais: 'DE', nombre: 'Alemania' },
  { codigo: '+31', pais: 'NL', nombre: 'Países Bajos' },
  { codigo: '+32', pais: 'BE', nombre: 'Bélgica' },
  { codigo: '+41', pais: 'CH', nombre: 'Suiza' },
];

export default function PerfilAdmin() {
  const { usuario } = useAutenticacion();
  const [pestanaActiva, setPestanaActiva] = useState(0);
  const [nombre, setNombre] = useState(usuario?.nombre || '');
  const [apellidos, setApellidos] = useState(usuario?.apellidos || '');
  const [correo, setCorreo] = useState(usuario?.email || '');
  const [codigoPais, setCodigoPais] = useState(usuario?.telefono?.match(/^\+\d+/)?.[0] || '+34');
  const [telefono, setTelefono] = useState(usuario?.telefono ? usuario.telefono.replace(/^\+\d+\s*/, '') : '');
  const [documentoIdentidad, setDocumentoIdentidad] = useState(usuario?.documento_identidad || '');
  const [direccion, setDireccion] = useState(usuario?.direccion || '');
  const [numeroCarnet, setNumeroCarnet] = useState(usuario?.numero_carnet || usuario?.documento_identidad || '');
  const [fechaCaducidadCarnet, setFechaCaducidadCarnet] = useState(usuario?.fecha_caducidad_carnet ? usuario.fecha_caducidad_carnet.slice(0, 10) : '');
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [deshabilitado, setDeshabilitado] = useState(false);
  const [abrirDialogoContrasena, setAbrirDialogoContrasena] = useState(false);
  const [reservas, setReservas] = useState([]);
  const [cargandoReservas, setCargandoReservas] = useState(false);
  const [mensajeHistorial, setMensajeHistorial] = useState(null);

  useEffect(() => {
    if (pestanaActiva === 2 && reservas.length === 0 && !cargandoReservas) {
      obtenerHistorialReservas();
    }
    // eslint-disable-next-line
  }, [pestanaActiva]);

  const obtenerHistorialReservas = async () => {
    setCargandoReservas(true);
    setMensajeHistorial(null);
    try {
      const token = localStorage.getItem('token');
      const urlApi = import.meta.env.DEV ? 'http://localhost:8000/api' : '/api';
      const resp = await fetch(`${urlApi}/usuarios/historial-reservas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      if (!resp.ok) {
        setMensajeHistorial(data?.mensaje || 'No se pudo cargar el historial.');
        setReservas([]);
      } else {
        setReservas(Array.isArray(data) ? data : []);
      }
    } catch {
      setMensajeHistorial('No se pudo conectar con el servidor.');
    } finally {
      setCargandoReservas(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setExito(null);
    setCargando(true);
    try {
      const token = localStorage.getItem('token');
      const urlApi = import.meta.env.DEV ? 'http://localhost:8000/api' : '/api';
      if (!correo || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) {
        setError('Por favor, introduce un correo electrónico válido.');
        setCargando(false);
        return;
      }
      const resp = await fetch(`${urlApi}/usuarios/completar-perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre,
          apellidos,
          email: correo,
          telefono: `${codigoPais} ${telefono}`,
          documento_identidad: documentoIdentidad,
          direccion,
          numero_carnet: numeroCarnet,
          fecha_caducidad_carnet: fechaCaducidadCarnet
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        // Errores personalizados según respuesta del backend
        if (data?.errors) {
          // Laravel validation errors
          const mensajes = Object.values(data.errors).flat().join(' ');
          if (/email.*(existe|ya est[aá] en uso|ya ha sido registrado)/i.test(mensajes)) {
            setError('El correo electrónico ya está registrado.');
          } else {
            setError(mensajes);
          }
        } else if (data?.mensaje) {
          setError(data.mensaje);
        } else if (data?.error) {
          setError(data.error);
        } else if (resp.status === 409) {
          setError('Error al guardar datos.');
        } else {
          setError('Error al guardar datos.');
        }
        setCargando(false);
        return;
      }
      setExito(data?.mensaje || 'Perfil actualizado correctamente');
      setDeshabilitado(true);
      window.location.reload();
    } catch (e) {
      if (e.name === 'TypeError' && e.message && e.message.toLowerCase().includes('fetch')) {
        setError('No se pudo conectar con el servidor. Verifica tu conexión o contacta al administrador.');
      } else {
        setError(e.message);
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f6fa', p: { xs: 1, md: 4 } }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, maxWidth: 1400, mx: 'auto', mt: 3 }}>
        {/* Columna lateral */}
        <Paper sx={{ width: { xs: '100%', md: 320 }, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', mb: { xs: 2, md: 0 } }} elevation={4}>
          {/* Avatar y datos básicos */}
          <Avatar sx={{ width: 100, height: 100, mb: 2, fontSize: 40, bgcolor: '#e3e3e3', color: '#1976d2' }}>
            {usuario?.nombre ? usuario.nombre[0].toUpperCase() : <PersonIcon fontSize="inherit" />}
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{usuario?.nombre} {usuario?.apellidos}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Cuenta Administrador
          </Typography>
          <Box sx={{ width: '100%', mb: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>{usuario?.email}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>{usuario?.telefono}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HomeIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>{usuario?.direccion || 'Sin dirección'} </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CreditCardIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>{usuario?.numero_carnet || usuario?.documento_identidad || 'Sin carnet'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarMonthIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>{usuario?.fecha_caducidad_carnet ? usuario.fecha_caducidad_carnet.slice(0,10) : 'Sin fecha de caducidad'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CreditCardIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>{usuario?.documento_identidad || 'Sin documento'}</Typography>
            </Box>
          </Box>
        </Paper>

        {/* Columna principal */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <PestanasPerfil pestanaActiva={pestanaActiva} onCambiar={setPestanaActiva} opciones={["Cuenta", "Seguridad", "Historial de reservas"]} />

          {/* PESTAÑA CUENTA */}
          {pestanaActiva === 0 && (
            <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, boxShadow: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Información personal
              </Typography>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {exito && <Alert severity="success" sx={{ mb: 2 }}>{exito}</Alert>}
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <TextField label="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required margin="normal" disabled={deshabilitado} />
                <TextField label="Apellidos" value={apellidos} onChange={e => setApellidos(e.target.value)} required margin="normal" disabled={deshabilitado} />
                <TextField label="Correo electrónico" type="email" value={correo} onChange={e => setCorreo(e.target.value)} required margin="normal" disabled={deshabilitado} />
                <TextField label="Teléfono" value={telefono} onChange={e => setTelefono(e.target.value)} required margin="normal" disabled={deshabilitado}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TextField select value={codigoPais} onChange={e => setCodigoPais(e.target.value)} variant="standard" sx={{ minWidth: 70 }} disabled={deshabilitado}>
                          {codigosPais.map(opcion => (
                            <MenuItem key={opcion.codigo} value={opcion.codigo}>
                              <ReactCountryFlag countryCode={opcion.pais} svg style={{ width: 20, marginRight: 4 }} />
                              {opcion.codigo}
                            </MenuItem>
                          ))}
                        </TextField>
                      </InputAdornment>
                    ),
                  }}
                />
                <Box sx={{ position: 'relative', width: '100%' }}>
                  <TextField
                    label="Documento de identidad"
                    value={documentoIdentidad}
                    onChange={e => setDocumentoIdentidad(e.target.value)}
                    required
                    margin="normal"
                    disabled={!!usuario?.documento_identidad}
                    InputProps={{
                      sx: usuario?.documento_identidad ? { cursor: 'not-allowed', backgroundColor: '#f5f5f5' } : {},
                      endAdornment: !!usuario?.documento_identidad ? (
                        <Tooltip
                          title={<span style={{ fontSize: 12, color: '#333' }}>Para cambiar este campo, contacta con un superadministrador</span>}
                          arrow
                          placement="top"
                          componentsProps={{
                            tooltip: {
                              sx: {
                                bgcolor: '#f9fafb',
                                color: '#333',
                                boxShadow: 1,
                                borderRadius: 2,
                                px: 1.5,
                                py: 0.5,
                                fontSize: 12,
                                border: '1px solid #e0e0e0',
                              }
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, cursor: 'pointer' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                          </Box>
                        </Tooltip>
                      ) : undefined
                    }}
                  />
                </Box>
                <TextField label="Dirección" value={direccion} onChange={e => setDireccion(e.target.value)} margin="normal" fullWidth required={true} disabled={deshabilitado} />
                <TextField label="N.º carnet de conducir" value={numeroCarnet} onChange={e => setNumeroCarnet(e.target.value)} margin="normal" fullWidth required={true} disabled={deshabilitado} />
                <TextField label="Fecha caducidad carnet" type="date" value={fechaCaducidadCarnet} onChange={e => setFechaCaducidadCarnet(e.target.value)} margin="normal" fullWidth required={true} disabled={deshabilitado} InputLabelProps={{ shrink: true }} />
                <Box sx={{ gridColumn: { xs: '1', md: '1 / span 2' }, display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button type="submit" variant="contained" color="primary" disabled={cargando || deshabilitado} startIcon={cargando ? <CircularProgress size={20} color="inherit" /> : null}>
                    {cargando ? 'Guardando...' : 'Guardar cambios'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          )}

          {/* PESTAÑA SEGURIDAD */}
          {pestanaActiva === 1 && (
            <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, boxShadow: 3, minHeight: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Button variant="outlined" color="primary" onClick={() => setAbrirDialogoContrasena(true)}>
                Cambiar contraseña
              </Button>
              <CambiarContrasenaDialog abierto={abrirDialogoContrasena} onCerrar={() => setAbrirDialogoContrasena(false)} onExito={setExito} />
            </Paper>
          )}

          {/* PESTAÑA HISTORIAL */}
          {pestanaActiva === 2 && (
            <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, boxShadow: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Historial de reservas
              </Typography>
              {cargandoReservas ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : mensajeHistorial ? (
                <Alert severity="error">{mensajeHistorial}</Alert>
              ) : (
                <HistorialReservasTabla reservas={reservas} />
              )}
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
}
