// Página de vehículos disponibles
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function PaginaVehiculos() {
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
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
          Vehículos disponibles
        </Typography>
        <div className="table-responsive">
          <table className="table table-striped table-bordered align-middle">
            <thead className="table-primary">
              <tr>
                <th>Matrícula</th>
                <th>Modelo</th>
                <th>Precio diario</th>
                <th>Localización</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1234-ABC</td>
                <td>Toyota Corolla</td>
                <td>35€</td>
                <td>Madrid</td>
                <td><span className="badge bg-success">Disponible</span></td>
                <td><button className="btn btn-sm btn-outline-primary">Reservar</button></td>
              </tr>
              <tr>
                <td>5678-DEF</td>
                <td>BMW Serie 3</td>
                <td>60€</td>
                <td>Barcelona</td>
                <td><span className="badge bg-danger">Ocupado</span></td>
                <td><button className="btn btn-sm btn-outline-secondary" disabled>Reservar</button></td>
              </tr>
              <tr>
                <td>9012-GHI</td>
                <td>Volkswagen Transporter</td>
                <td>80€</td>
                <td>Valencia</td>
                <td><span className="badge bg-success">Disponible</span></td>
                <td><button className="btn btn-sm btn-outline-primary">Reservar</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Paper>
    </Box>
  );
}
