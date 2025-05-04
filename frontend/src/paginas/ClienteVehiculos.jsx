import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export default function ClienteVehiculos() {
  return (
    <Box sx={{ minHeight: '100vh', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: { xs: '#f5f5f5', md: 'linear-gradient(120deg, #e3f2fd 0%, #f5f5f5 100%)' }, px: 2 }}>
      <Paper elevation={8} sx={{ p: { xs: 3, md: 5 }, maxWidth: 800, width: '100%', borderRadius: 3, boxShadow: { xs: 6, md: 12 }, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          Mis Vehículos Reservados
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Aquí puedes ver los vehículos que tienes actualmente reservados.
        </Typography>
        <Box sx={{ bgcolor: '#e3f2fd', borderRadius: 2, p: 4, minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', fontSize: 18 }}>
          {/* Aquí irá la tabla de tus vehículos reservados */}
{/* Ejemplo de renderizado de imagen de vehículo con fallback */}
{/*
  <img src={vehiculo.imagen ? vehiculo.imagen : '/storage/default.png'} alt={vehiculo.modelo} onError={e => { e.target.src = '/storage/default.png'; }} style={{ width: 100, height: 70, objectFit: 'cover' }} />
*/}
        </Box>
      </Paper>
    </Box>
  );
}
