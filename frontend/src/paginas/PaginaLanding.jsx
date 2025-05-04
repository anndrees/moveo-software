// Componente de la landing page
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function PaginaLanding() {
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
          maxWidth: 900,
          width: '100%',
          mx: 2,
          borderRadius: 3,
          boxShadow: { xs: 6, md: 12 },
          mt: { xs: 0, md: 8 },
          textAlign: 'center'
        }}
      >
        <Typography variant="h3" sx={{ mb: 2, fontWeight: 700, color: 'primary.main' }}>
          Bienvenido a MOVEO RENT A CAR
        </Typography>
        <Typography variant="h5" sx={{ mb: 4 }}>
          La mejor plataforma de gestión de flotas para empresas de rent a car.
        </Typography>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Vehículos destacados
        </Typography>
        <div className="row row-cols-1 row-cols-md-3 g-4">
          <div className="col">
            <div className="card h-100 shadow">
              <img src="https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=400&q=80" className="card-img-top" alt="Coche 1" />
              <div className="card-body">
                <h5 className="card-title">Toyota Corolla</h5>
                <p className="card-text">Económico, fiable y perfecto para ciudad. Desde <b>35€/día</b>.</p>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="card h-100 shadow">
              <img src="https://images.unsplash.com/photo-1511918984145-48de785d4c4e?auto=format&fit=crop&w=400&q=80" className="card-img-top" alt="Coche 2" />
              <div className="card-body">
                <h5 className="card-title">BMW Serie 3</h5>
                <p className="card-text">Confort y elegancia para tus viajes de negocios. Desde <b>60€/día</b>.</p>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="card h-100 shadow">
              <img src="https://images.unsplash.com/photo-1461632830798-3adb3034e4c8?auto=format&fit=crop&w=400&q=80" className="card-img-top" alt="Coche 3" />
              <div className="card-body">
                <h5 className="card-title">Volkswagen Transporter</h5>
                <p className="card-text">Ideal para grupos o traslados de empresa. Desde <b>80€/día</b>.</p>
              </div>
            </div>
          </div>
        </div>
      </Paper>
    </Box>
  );
}
