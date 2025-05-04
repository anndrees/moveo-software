import { useState } from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import ReactCountryFlag from 'react-country-flag';

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

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

export default function CompletarPerfilCliente({ usuario, onGuardado }) {
  const [nombre, setNombre] = useState(usuario?.nombre || '');
  const [apellidos, setApellidos] = useState(usuario?.apellidos || '');
  const [correo, setCorreo] = useState(usuario?.email || '');
  const [codigoPais, setCodigoPais] = useState(usuario?.telefono?.match(/^\+\d+/)?.[0] || '+34');
  const [telefono, setTelefono] = useState(usuario?.telefono ? usuario.telefono.replace(/^\+\d+\s*/, '') : '');
  const [documentoIdentidad, setDocumentoIdentidad] = useState(usuario?.documento_identidad || '');
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setExito(null);
    setCargando(true);
    try {
      const token = localStorage.getItem('token');
      const urlApi = import.meta.env.DEV ? 'http://localhost:8000/api' : '/api';
      // Validación básica de email
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
        body: JSON.stringify({ nombre, apellidos, email: correo, telefono: `${codigoPais} ${telefono}`, documento_identidad: documentoIdentidad }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        // Errores personalizados según respuesta del backend
        if (data?.errors) {
          // Laravel validation errors
          const mensajes = Object.values(data.errors).flat().join(' ');
          setError(mensajes);
        } else if (data?.mensaje) {
          setError(data.mensaje);
        } else if (data?.error) {
          setError(data.error);
        } else if (resp.status === 409) {
          setError('El correo electrónico ya está registrado.');
        } else {
          setError('Error al guardar datos.');
        }
        setCargando(false);
        return;
      }
      setExito(data?.mensaje || 'Perfil actualizado correctamente');
      setDeshabilitado(true);
      if (onGuardado) onGuardado();
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
    <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto', mt: 2 }}>
      <Paper elevation={6} sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Editar perfil
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Puedes actualizar tus datos personales. Todos los campos son obligatorios.
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {exito && <Alert severity="success" sx={{ mb: 2 }}>{exito}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Nombre"
            fullWidth
            required
            margin="normal"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            disabled={deshabilitado}
          />
          <TextField
            label="Apellidos"
            fullWidth
            required
            margin="normal"
            value={apellidos}
            onChange={e => setApellidos(e.target.value)}
            disabled={deshabilitado}
          />
          <TextField
            label="Correo electrónico"
            type="email"
            fullWidth
            required
            margin="normal"
            value={correo}
            onChange={e => setCorreo(e.target.value)}
            disabled={deshabilitado}
          />
          <TextField
            label="Teléfono"
            fullWidth
            required
            margin="normal"
            value={telefono}
            onChange={e => setTelefono(e.target.value)}
            disabled={deshabilitado}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TextField
                    select
                    value={codigoPais}
                    onChange={e => setCodigoPais(e.target.value)}
                    variant="standard"
                    sx={{ minWidth: 80 }}
                    disabled={deshabilitado}
                  >
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
              fullWidth
              required
              margin="normal"
              value={documentoIdentidad}
              onChange={e => setDocumentoIdentidad(e.target.value)}
              disabled={!!usuario?.documento_identidad}
              InputProps={{
                sx: usuario?.documento_identidad ? { cursor: 'not-allowed', backgroundColor: '#f5f5f5' } : {},
              }}
            />
            {!!usuario?.documento_identidad && (
              <Box sx={{
                position: 'absolute',
                top: 10,
                right: '-10px',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
              }}>
                <Box sx={{
                  bgcolor: '#fff',
                  border: '2px solid #1976d2',
                  color: '#1976d2',
                  px: 2,
                  py: 1,
                  borderRadius: '16px 16px 16px 0',
                  fontSize: 13,
                  fontWeight: 500,
                  boxShadow: 2,
                  maxWidth: 220,
                  whiteSpace: 'normal',
                }}>
                  Para cambiar este campo, contacta con un administrador
                </Box>
                <Box sx={{
                  width: 0,
                  height: 0,
                  borderLeft: '10px solid #1976d2',
                  borderTop: '10px solid transparent',
                  borderBottom: '10px solid transparent',
                  ml: '-2px',
                  mt: '8px',
                }} />
              </Box>
            )}
          </Box>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, fontWeight: 600 }}
            disabled={cargando || deshabilitado}
            startIcon={cargando ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {cargando ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
