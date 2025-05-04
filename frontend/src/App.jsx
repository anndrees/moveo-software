import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import PaginaLanding from './paginas/PaginaLanding';
import PaginaVehiculos from './paginas/PaginaVehiculos';
import PaginaSobreNosotros from './paginas/PaginaSobreNosotros';
import PaginaContacto from './paginas/PaginaContacto';
import PaginaLogin from './paginas/PaginaLogin';
import PaginaRegistro from './paginas/PaginaRegistro';

// Importar páginas de administración
import AdminDashboard from './paginas/AdminDashboard';
import AdminVehiculos from './paginas/AdminVehiculos';
import AdminVehiculoDetalle from './paginas/AdminVehiculoDetalle';
import AdminReservas from './paginas/AdminReservas';
import AdminClientes from './paginas/AdminClientes';
import AdminMantenimientos from './paginas/AdminMantenimientos';
import AdminReportes from './paginas/AdminReportes';
import PerfilAdmin from './paginas/AdminProfile';

// Importar páginas de cliente
import ClienteDashboard from './paginas/ClienteDashboard';
import ClienteVehiculos from './paginas/ClienteVehiculos';
import ClienteVehiculoDetalle from './paginas/ClienteVehiculoDetalle';
import ClienteReservas from './paginas/ClienteReservas';
import ClientePerfil from './paginas/ClientePerfil';
import Pagina404 from './paginas/Pagina404';

import BarraNavegacion from './componentes/BarraNavegacion';
import PiePagina from './componentes/PiePagina';
import RutaPrivada from './componentes/RutaPrivada';
import LayoutPrivado from './componentes/LayoutPrivado';

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <BrowserRouter>
      {/* Mostrar BarraNavegacion solo en rutas públicas */}
      <Routes>
        {/* Páginas públicas */}
        <Route path="/" element={
          <>
            <BarraNavegacion />
            <PaginaLanding />
          </>
        } />
        <Route path="/vehicles" element={
          <>
            <BarraNavegacion />
            <PaginaVehiculos />
          </>
        } />
        <Route path="/about" element={
          <>
            <BarraNavegacion />
            <PaginaSobreNosotros />
          </>
        } />
        <Route path="/contact" element={
          <>
            <BarraNavegacion />
            <PaginaContacto />
          </>
        } />
        <Route path="/login" element={
          <>
            <BarraNavegacion />
            <PaginaLogin />
          </>
        } />
        <Route path="/register" element={
          <>
            <BarraNavegacion />
            <PaginaRegistro />
          </>
        } />

        {/* Páginas de administración */}
        <Route path="/admin/profile" element={
          <RutaPrivada soloAdmin={true}>
            <LayoutPrivado soloAdmin={true}>
              <PerfilAdmin />
            </LayoutPrivado>
          </RutaPrivada>
        } />
        <Route path="/admin" element={
          <RutaPrivada soloAdmin={true}>
            <LayoutPrivado soloAdmin={true}>
              <AdminDashboard />
            </LayoutPrivado>
          </RutaPrivada>
        } />
        <Route path="/admin/vehicles" element={
          <RutaPrivada soloAdmin={true}>
            <LayoutPrivado soloAdmin={true}>
              <AdminVehiculos />
            </LayoutPrivado>
          </RutaPrivada>
        } />
        <Route path="/admin/vehicles/:id" element={
          <RutaPrivada soloAdmin={true}>
            <LayoutPrivado soloAdmin={true}>
              <AdminVehiculoDetalle />
            </LayoutPrivado>
          </RutaPrivada>
        } />
        <Route path="/admin/reservations" element={
          <RutaPrivada soloAdmin={true}>
            <LayoutPrivado soloAdmin={true}>
              <AdminReservas />
            </LayoutPrivado>
          </RutaPrivada>
        } />
        <Route path="/admin/clients" element={
          <RutaPrivada soloAdmin={true}>
            <LayoutPrivado soloAdmin={true}>
              <AdminClientes />
            </LayoutPrivado>
          </RutaPrivada>
        } />
        <Route path="/admin/maintenance" element={
          <RutaPrivada soloAdmin={true}>
            <LayoutPrivado soloAdmin={true}>
              <AdminMantenimientos />
            </LayoutPrivado>
          </RutaPrivada>
        } />
        <Route path="/admin/reports" element={
          <RutaPrivada soloAdmin={true}>
            <LayoutPrivado soloAdmin={true}>
              <AdminReportes />
            </LayoutPrivado>
          </RutaPrivada>
        } />

        {/* Páginas de cliente */}
        <Route path="/client" element={
          <RutaPrivada>
            <LayoutPrivado>
              <ClienteDashboard />
            </LayoutPrivado>
          </RutaPrivada>
        } />
<Route path="/client/vehicles" element={
  <RutaPrivada>
    <LayoutPrivado>
      <ClienteVehiculos />
    </LayoutPrivado>
  </RutaPrivada>
} />
<Route path="/client/vehicles/:id" element={
  <RutaPrivada>
    <LayoutPrivado>
      <ClienteVehiculoDetalle />
    </LayoutPrivado>
  </RutaPrivada>
} />
<Route path="/client/reservations" element={
  <RutaPrivada>
    <LayoutPrivado>
      <ClienteReservas />
    </LayoutPrivado>
  </RutaPrivada>
} />
<Route path="/client/profile" element={
  <RutaPrivada>
    <LayoutPrivado>
      <ClientePerfil />
    </LayoutPrivado>
  </RutaPrivada>
} />
        {/* Ruta 404 */}
        <Route path="*" element={<Pagina404 />} />
      </Routes>
       {/* Mostrar PiePagina solo en rutas públicas */}
       {['/', '/vehicles', '/about', '/contact', '/login', '/register'].includes(window.location.pathname) && <PiePagina />}
    </BrowserRouter>
    </LocalizationProvider>
  );
}

export default App;
