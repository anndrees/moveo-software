import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export default function ClienteReservas() {
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
          maxWidth: 600,
          width: '100%',
          mx: 2,
          borderRadius: 3,
          boxShadow: { xs: 6, md: 12 },
          mt: { xs: 0, md: 8 },
          textAlign: 'center'
        }}
      >
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          Detalle de mi Vehículo Reservado
        </Typography>
        <Typography variant="body1">
          Mostrando información para el vehículo con ID: 
        </Typography>
      </Paper>
    </Box>
  );
}
