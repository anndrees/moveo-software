// Página de registro
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registrarUsuario } from '../servicios/autenticacion';
import { useAutenticacion } from '../contexto/ContextoAutenticacion';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

export default function PaginaRegistro() {
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const { login } = useAutenticacion();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const res = await registrarUsuario({ nombre, apellidos, email, password });
      login(res.usuario, res.token);
      if (res.usuario.rol === 'admin') {
        navigate('/admin');
      } else {
        navigate('/client');
      }
    } catch (err) {
      // Mostrar todos los errores de validación de la API
      if (typeof err === 'object' && err !== null) {
        if (err.errores) {
          // Buscar el primer mensaje del array de errores
          const primerMensaje = Array.isArray(err.errores)
            ? err.errores[0]
            : Object.values(err.errores).flat()[0];
          if (primerMensaje) {
            setError(primerMensaje);
            return;
          }
        }
        if (err.mensaje) setError(err.mensaje);
      } else {
        setError('Error desconocido');
      }
    } finally {
      setCargando(false);
    }
  };

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
          maxWidth: 430,
          width: '100%',
          mx: 2,
          borderRadius: 3,
          boxShadow: { xs: 6, md: 12 },
          mt: { xs: 0, md: 8 }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
            <LockOutlinedIcon fontSize="large" />
          </Avatar>
          <Typography component="h1" variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
            Registro
          </Typography>
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
             <TextField
              margin="normal"
              fullWidth
              id="nombre"
              label="Nombre"
              name="nombre"
              autoComplete="given-name"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              required
              size="large"
            />
            <TextField
              margin="normal"
              fullWidth
              id="apellidos"
              label="Apellidos"
              name="apellidos"
              autoComplete="family-name"
              value={apellidos}
              onChange={e => setApellidos(e.target.value)}
              required
              size="large"
            />
            <TextField
              margin="normal"
              fullWidth
              id="email"
              label="Correo electrónico"
              name="email"
              autoComplete="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              size="large"
            />
            <TextField
              margin="normal"
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              size="large"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, fontWeight: 600, fontSize: 18, py: 1.5 }}
              disabled={cargando}
              startIcon={cargando ? <CircularProgress size={22} color="inherit" /> : null}
            >
              {cargando ? 'Registrando...' : 'Registrarse'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
