import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import Avatar from '@mui/material/Avatar';
import HomeIcon from '@mui/icons-material/Home';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import LogoutIcon from '@mui/icons-material/Logout';
import BuildIcon from '@mui/icons-material/Build';
import logo from '../assets/logo.svg';
import { useAutenticacion } from '../contexto/ContextoAutenticacion';

export default function MenuLateral({ modoAdmin, setModoAdmin }) {
  const { usuario, logout } = useAutenticacion();
  const navigate = useNavigate();
  const location = useLocation();

  // Menús según el modo
  const opcionesAdmin = [
    { texto: 'Dashboard', icono: <HomeIcon />, ruta: '/admin' },
    { texto: 'Vehículos', icono: <DirectionsCarIcon />, ruta: '/admin/vehicles' },
    { texto: 'Mantenimientos', icono: <BuildIcon />, ruta: '/admin/maintenance' },
    { texto: 'Reservas', icono: <AssignmentIndIcon />, ruta: '/admin/reservations' },
    { texto: 'Clientes', icono: <PeopleIcon />, ruta: '/admin/clients' },
    { texto: 'Reportes', icono: <BarChartIcon />, ruta: '/admin/reports' },
    { texto: 'Perfil', icono: <PeopleIcon />, ruta: '/admin/profile' },
  ];
  const opcionesCliente = [
    { texto: 'Inicio', icono: <HomeIcon />, ruta: '/client' },
    { texto: 'Mis vehículos', icono: <DirectionsCarIcon />, ruta: '/client/vehicles' },
    { texto: 'Reservas', icono: <AssignmentIndIcon />, ruta: '/client/reservations' },
    { texto: 'Perfil', icono: <PeopleIcon />, ruta: '/client/profile' },
  ];

  const menuActual = modoAdmin ? opcionesAdmin : opcionesCliente;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 230,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: 230, boxSizing: 'border-box', bgcolor: 'background.paper' },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
        <img src={logo} alt="Logo" style={{ width: 70, height: 70, marginBottom: 8, display: 'block' }} />
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
          MOVEO
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
          {usuario?.nombre}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled', mb: 2 }}>
          {usuario?.rol}
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuActual.map((opcion) => (
          <ListItem
            button            key={opcion.texto}
            component={Link}
            to={opcion.ruta}
            selected={location.pathname === opcion.ruta}
          >
            <ListItemIcon>{opcion.icono}</ListItemIcon>
            <ListItemText primary={opcion.texto} />
          </ListItem>
        ))}
      </List>
      {usuario?.rol === 'admin' && (
        <Box sx={{ px: 2, py: 2 }}>
          <Divider sx={{ mb: 1 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Modo administrador
          </Typography>
          <Switch
            checked={modoAdmin}
            onChange={e => {
              setModoAdmin(e.target.checked);
              if (e.target.checked) {
                navigate('/admin');
              } else {
                navigate('/client');
              }
            }}
            color="primary"
            sx={{ ml: 1 }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
            {modoAdmin ? 'Admin' : 'Cliente'}
          </Typography>
        </Box>
      )}
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ px: 2, pb: 2 }}>
        <Divider sx={{ mb: 1 }} />
        <button
          onClick={logout}
          style={{
            width: '100%',
            background: 'none',
            border: 'none',
            padding: 0,
            margin: 0,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'error.main',
              color: 'error.contrastText',
              borderRadius: 1,
              py: 1,
              fontWeight: 600,
              fontSize: 16,
              gap: 1,
              width: '100%',
              transition: 'background 0.2s',
              '&:hover': { bgcolor: 'error.dark' },
              cursor: 'pointer',
            }}
          >
            <LogoutIcon sx={{ mr: 1 }} />
            Cerrar sesión
          </Box>
        </button>
      </Box>
    </Drawer>
  );
}
