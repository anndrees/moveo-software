import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

export default function Pagina404() {
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
          mt: { xs: 0, md: 8 },
          textAlign: 'center'
        }}
      >
        <Typography variant="h1" sx={{ mb: 1, fontWeight: 900, color: 'primary.main', fontSize: 80 }}>
          404
        </Typography>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
          Página no encontrada
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          La página que buscas no existe o ha sido movida.
        </Typography>
        <Button component={Link} to="/" variant="contained" color="primary">
          Volver al inicio
        </Button>
      </Paper>
    </Box>
  );
}
