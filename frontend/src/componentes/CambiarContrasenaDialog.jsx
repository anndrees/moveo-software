import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';

export default function CambiarContrasenaDialog({ abierto, onCerrar, onExito }) {
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleCambiar = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);
    const token = localStorage.getItem('token');
    const urlApi = import.meta.env.DEV ? 'http://localhost:8000/api' : '/api';
    try {
      const resp = await fetch(`${urlApi}/usuarios/cambiar-contrasena`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contrasena_actual: contrasenaActual,
          nueva_contrasena: nuevaContrasena,
          confirmar_contrasena: confirmarContrasena,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data?.mensaje || 'Error al cambiar la contraseña.');
        setCargando(false);
        return;
      }
      setContrasenaActual('');
      setNuevaContrasena('');
      setConfirmarContrasena('');
      setError(null);
      onExito(data?.mensaje || 'Contraseña cambiada correctamente.');
      onCerrar();
    } catch (e) {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Dialog open={abierto} onClose={onCerrar} maxWidth="xs" fullWidth>
      <DialogTitle>Cambiar contraseña</DialogTitle>
      <form onSubmit={handleCambiar}>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            label="Contraseña actual"
            type="password"
            fullWidth
            required
            margin="normal"
            value={contrasenaActual}
            onChange={e => setContrasenaActual(e.target.value)}
            disabled={cargando}
          />
          <TextField
            label="Nueva contraseña"
            type="password"
            fullWidth
            required
            margin="normal"
            value={nuevaContrasena}
            onChange={e => setNuevaContrasena(e.target.value)}
            disabled={cargando}
            inputProps={{ minLength: 8 }}
          />
          <TextField
            label="Confirmar nueva contraseña"
            type="password"
            fullWidth
            required
            margin="normal"
            value={confirmarContrasena}
            onChange={e => setConfirmarContrasena(e.target.value)}
            disabled={cargando}
            inputProps={{ minLength: 8 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCerrar} disabled={cargando}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={cargando}>Cambiar</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
