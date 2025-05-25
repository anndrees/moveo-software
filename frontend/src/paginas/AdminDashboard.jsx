import { Box, Paper, Typography, Button, CircularProgress } from '@mui/material';
import { useAutenticacion } from '../contexto/ContextoAutenticacion';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, BarChart, Bar } from 'recharts';
import { useEffect, useState } from 'react';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import GroupIcon from '@mui/icons-material/Group';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RefreshIcon from '@mui/icons-material/Refresh';

const COLORES_PASTEL = ['#1976d2', '#43a047'];

export default function AdminDashboard({ modoAdmin = true }) {
  // Estados para las estadísticas
  const [estadisticas, setEstadisticas] = useState({
    totalVehiculos: 0,
    vehiculosDisponibles: 0,
    reservasActivas: 0,
    ingresosMensuales: 0,
    totalClientes: 0,
    precios: {
      promedio: 0,
      minimo: 0,
      maximo: 0,
      rangos: { economico: 0, estandar: 0, premium: 0 }
    },
    vehiculosPopulares: [],
    ultimasReservas: []
  });
  
  const [cargando, setCargando] = useState(true);
  const { usuario } = useAutenticacion();
  const token = localStorage.getItem('token');
  // Datos para gráficos
  const datosRangosPrecios = [
    { name: 'Económicos', value: estadisticas.precios.rangos.economico, color: '#4caf50' },
    { name: 'Estándar', value: estadisticas.precios.rangos.estandar, color: '#2196f3' },
    { name: 'Premium', value: estadisticas.precios.rangos.premium, color: '#9c27b0' }
  ];
  
  const datosVehiculosPopulares = estadisticas.vehiculosPopulares.map(v => ({
    nombre: v.nombre,
    alquileres: v.total_reservas,
    ingresos: v.ingresos_totales
  }));
  
  // Datos de ejemplo para ingresos mensuales (se podrían obtener de la API)
  const datosIngresos = [
    { mes: 'Ene', ingresos: 3100 },
    { mes: 'Feb', ingresos: 2900 },
    { mes: 'Mar', ingresos: 2700 },
    { mes: 'Abr', ingresos: 3600 },
    { mes: 'May', ingresos: estadisticas.ingresosMensuales || 4100 },
    { mes: 'Jun', ingresos: 3700 }
  ];
  
  // Usar las reservas del estado
  const reservasRecientes = (estadisticas.ultimasReservas || []).map(reserva => ({
    id: reserva.id || 0,
    cliente: reserva.cliente || 'Cliente desconocido',
    vehiculo: reserva.vehiculo || 'Vehículo no especificado',
    fecha_inicio: reserva.fecha_inicio || '',
    fecha_fin: reserva.fecha_fin || '',
    fechas: `${reserva.fecha_inicio || ''} - ${reserva.fecha_fin || ''}`,
    estado: reserva.estado || 'desconocido',
    importe: typeof reserva.importe === 'number' ? reserva.importe : 0
  }));

  // Obtener estadísticas al cargar el componente o cuando cambie el token
  useEffect(() => {
    let isMounted = true;
    
    const obtenerEstadisticas = async () => {
      if (!token) {
        console.error('🔴 No hay token de autenticación disponible');
        console.log('🔍 Token en localStorage:', localStorage.getItem('token'));
        console.log('👤 Usuario en contexto:', usuario);
        if (isMounted) setCargando(false);
        return;
      }

      try {
        console.log('🔍 Iniciando solicitud de estadísticas...');
        
        // Usar URL relativa para evitar problemas de CORS
        const url = '/api/vehiculos/estadisticas/precios';
        
        console.log('🌐 URL de la API:', url);
        console.log('🔑 Token disponible:', token ? 'Sí' : 'No');
        
        const respuesta = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          credentials: 'include',
          mode: 'cors'
        });
        
        console.log('📡 Estado de la respuesta:', respuesta.status, respuesta.statusText);
        
        if (!respuesta.ok) {
          let errorData;
          try {
            errorData = await respuesta.json();
            console.error('❌ Error en la respuesta:', errorData);
          } catch (e) {
            const textError = await respuesta.text();
            console.error('❌ Error al procesar respuesta:', textError);
            throw new Error(`Error HTTP ${respuesta.status}: ${textError || respuesta.statusText}`);
          }
          throw new Error(errorData.message || `Error HTTP ${respuesta.status}`);
        }
        
        const datos = await respuesta.json();
        console.log('✅ Datos recibidos:', datos);
        
        if (isMounted) {
          setEstadisticas({
            totalVehiculos: datos.total_vehiculos || 0,
            vehiculosDisponibles: datos.vehiculos_disponibles || 0,
            reservasActivas: datos.reservas_activas || 0,
            ingresosMensuales: datos.ingresos_mensuales || 0,
            totalClientes: datos.total_clientes || 0,
            precios: {
              promedio: datos.precio_promedio || 0,
              minimo: datos.precio_minimo || 0,
              maximo: datos.precio_maximo || 0,
              rangos: datos.rangos_precios || { economico: 0, estandar: 0, premium: 0 }
            },
            vehiculosPopulares: datos.vehiculos_populares || [],
            ultimasReservas: datos.ultimas_reservas || []
          });
        }
        
      } catch (error) {
        console.error('❌ Error al obtener estadísticas:', error);
        // Mostrar un mensaje de error al usuario
        alert(`Error al cargar el dashboard: ${error.message}`);
      } finally {
        if (isMounted) setCargando(false);
      }
    };
    
    // Solo intentar cargar datos si hay un token
    if (token) {
      console.log('🔑 Token encontrado, obteniendo estadísticas...');
      obtenerEstadisticas();
    } else {
      console.log('⚠️ No se encontró token, no se pueden cargar las estadísticas');
      setCargando(false);
    }
    
    // Limpieza al desmontar el componente
    return () => {
      isMounted = false;
    };
  }, [token]);

  // Función para determinar el color según el estado
  const colorEstado = (estado) => {
    if (!estado) return '#757575';
    
    const estadoLower = estado.toLowerCase();
    switch(estadoLower) {
      case 'activa': 
      case 'en_curso':
        return '#1976d2';
      case 'completada': 
      case 'finalizada':
        return '#43a047';
      case 'cancelada': 
        return '#d32f2f';
      case 'pendiente': 
      case 'pendiente_de_pago':
        return '#ff9800';
      case 'confirmada':
        return '#7b1fa2';
      default: 
        console.warn(`Estado no reconocido: ${estado}`);
        return '#757575';
    }
  };

  if (cargando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (

    <Box sx={{ flex: 1, minWidth: 0, minHeight: '100vh', bgcolor: '#f5f6fa', p: { xs: 1, md: 3 }, overflowX: 'auto', width: '100%' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Resumen del Panel</Typography>
      {/* KPIs */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Paper elevation={3} sx={{ flex: 1, minWidth: 220, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <DirectionsCarIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="subtitle2" color="text.secondary">Vehículos Totales</Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{estadisticas.totalVehiculos}</Typography>
          <Typography variant="caption" color="text.secondary">
            {estadisticas.vehiculosDisponibles} disponibles actualmente
          </Typography>
        </Paper>
        
        <Paper elevation={3} sx={{ flex: 1, minWidth: 220, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AssignmentIndIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="subtitle2" color="text.secondary">Reservas Activas</Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{estadisticas.reservasActivas}</Typography>
          <Typography variant="caption" color="text.secondary">
            Ver todas las reservas
          </Typography>
        </Paper>
        
        <Paper elevation={3} sx={{ flex: 1, minWidth: 220, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="subtitle2" color="text.secondary">Ingresos Mensuales</Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            ${estadisticas.ingresosMensuales.toLocaleString()}
          </Typography>
          <Typography variant="caption" color="success.main">
            <TrendingUpIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
            Ver tendencia
          </Typography>
        </Paper>
        
        <Paper elevation={3} sx={{ flex: 1, minWidth: 220, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <GroupIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="subtitle2" color="text.secondary">Clientes Totales</Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{estadisticas.totalClientes}</Typography>
          <Typography variant="caption" color="text.secondary">
            Gestionar clientes
          </Typography>
        </Paper>
      </Box>
      {/* Gráficos */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Paper elevation={3} sx={{ flex: 2, minWidth: 320, p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Ingresos Mensuales</Typography>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={datosIngresos} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                labelStyle={{ color: '#333', fontWeight: 'bold' }}
              />
              <Line 
                type="monotone" 
                dataKey="ingresos" 
                stroke="#1976d2" 
                strokeWidth={2} 
                dot={{ r: 4, fill: '#1976d2' }}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
        
        <Paper elevation={3} sx={{ flex: 1, minWidth: 300, p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Distribución por Precio</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={datosRangosPrecios}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {datosRangosPrecios.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} vehículos`, 'Cantidad']}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
        
        <Paper elevation={3} sx={{ flex: 2, minWidth: 320, p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Vehículos Populares</Typography>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart 
              data={datosVehiculosPopulares} 
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              barGap={0}
              barCategoryGap="15%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="nombre" stroke="#666" />
              <YAxis yAxisId="left" orientation="left" stroke="#ff9800" />
              <YAxis yAxisId="right" orientation="right" stroke="#9c27b0" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                formatter={(value, name) => {
                  if (name === 'Ingresos') {
                    return [`$${value.toLocaleString()}`, name];
                  }
                  return [value, name];
                }}
              />
              <Legend />
              <Bar 
                yAxisId="left"
                dataKey="alquileres" 
                fill="#ff9800" 
                radius={[4, 4, 0, 0]} 
                name="Alquileres"
                maxBarSize={40}
              />
              <Bar 
                yAxisId="right"
                dataKey="ingresos" 
                fill="#9c27b0" 
                radius={[4, 4, 0, 0]} 
                name="Ingresos"
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
        
        <Paper elevation={3} sx={{ flex: 1, minWidth: 300, p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Resumen de Precios</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Precio Promedio</Typography>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                ${estadisticas.precios.promedio.toFixed(2)}/día
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Rango de Precios</Typography>
              <Typography variant="body1">
                ${estadisticas.precios.minimo.toFixed(2)} - ${estadisticas.precios.maximo.toFixed(2)}/día
              </Typography>
            </Box>
            <Box sx={{ mt: 'auto' }}>
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<LocalOfferIcon />}
                onClick={() => {}}
                fullWidth
              >
                Gestionar Precios
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
      {/* Tabla de reservas recientes */}
      <Paper elevation={3} sx={{ width: '100%', maxWidth: '100%', p: 2, bgcolor: 'background.paper', mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Reservas Recientes</Typography>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => {}}
            startIcon={<RefreshIcon />}
          >
            Actualizar
          </Button>
        </Box>
        
        {reservasRecientes.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <Typography>No hay reservas recientes</Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e0e0e0' }}>ID</th>
                  <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e0e0e0' }}>Cliente</th>
                  <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e0e0e0' }}>Vehículo</th>
                  <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e0e0e0' }}>Fechas</th>
                  <th style={{ textAlign: 'right', padding: '12px', borderBottom: '1px solid #e0e0e0' }}>Importe</th>
                  <th style={{ textAlign: 'center', padding: '12px', borderBottom: '1px solid #e0e0e0' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {reservasRecientes.map((reserva) => (
                  <tr key={reserva.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px' }}>#{reserva.id.toString().padStart(4, '0')}</td>
                    <td style={{ padding: '12px' }}>{reserva.cliente}</td>
                    <td style={{ padding: '12px' }}>{reserva.vehiculo}</td>
                    <td style={{ padding: '12px' }}>{reserva.fechas}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 500 }}>
                      ${typeof reserva.importe === 'number' ? reserva.importe.toFixed(2) : '0.00'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <Box 
                        component="span" 
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: `${colorEstado(reserva.estado)}1a`,
                          color: colorEstado(reserva.estado),
                          textTransform: 'capitalize'
                        }}
                      >
                        {reserva.estado}
                      </Box>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
