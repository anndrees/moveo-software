import { Navigate } from 'react-router-dom';
import { useAutenticacion } from '../contexto/ContextoAutenticacion';

export default function RutaPrivada({ children, soloAdmin = false }) {
  const { usuario, cargando } = useAutenticacion();
  if (cargando) return <div className="text-center mt-5"><div className="spinner-border" role="status"><span className="visually-hidden">Cargando...</span></div></div>;
  if (!usuario) return <Navigate to="/login" replace />;
  if (soloAdmin && usuario.rol !== 'admin') return <Navigate to="/" replace />;

  // Bloqueo por perfil incompleto
  const camposObligatorios = [
    usuario?.nombre,
    usuario?.apellidos,
    usuario?.email,
    usuario?.telefono,
    usuario?.documento_identidad
  ];
  const perfilIncompleto = camposObligatorios.some(v => !v) || usuario.primera_visita;

  // Detectar ruta destino para evitar bucles infinitos
  const rutaDestino = window.location.pathname;
  const esRutaPerfil = usuario.rol === 'admin'
    ? rutaDestino.startsWith('/admin/profile')
    : rutaDestino.startsWith('/client/profile');

  if (perfilIncompleto && !esRutaPerfil) {
    // Redirigir a su perfil para completar datos
    return <Navigate to={usuario.rol === 'admin' ? '/admin/profile' : '/client/profile'} replace />;
  }

  return children;
}
