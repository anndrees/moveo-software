import React, { useEffect, useState } from "react";
import ModalReserva from "../componentes/ModalReserva";
import { useParams, useNavigate } from "react-router-dom";
import SelectorDanosVehiculo from "../componentes/SelectorDanosVehiculo";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Divider,
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Select,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Snackbar,
  TextField,
  MenuItem,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  DirectionsCar as DirectionsCarIcon,
  LocalGasStation as LocalGasStationIcon,
  Speed as SpeedIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Build as BuildIcon,
  Description as DescriptionIcon,
  AttachMoney as AttachMoneyIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Delete as DeleteIcon,
  ReportProblem as ReportProblemIcon,
  LocationOn as LocationOnIcon,
  EventAvailable as EventAvailableIcon,
  CalendarToday as CalendarTodayIcon,
  Add as AddIcon,
  ColorLens as ColorLensIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

// Componente para mostrar las especificaciones del vehículo
const EspecificacionesVehiculo = ({ vehiculo }) => {
  if (!vehiculo) {
    console.log("No hay datos del vehículo");
    return null;
  }

  // Asegurarse de que las propiedades existan
  const especificaciones = [
    {
      icon: <DirectionsCarIcon fontSize="small" color="action" />,
      primary: "Matrícula",
      secondary: vehiculo.matricula || vehiculo.placa || "No especificada",
    },
    {
      icon: <LocalGasStationIcon fontSize="small" color="action" />,
      primary: "Combustible",
      secondary:
        vehiculo.tipo_combustible || vehiculo.combustible || "No especificado",
    },
    {
      icon: <DirectionsCarIcon fontSize="small" color="action" />,
      primary: "Tipo de vehículo",
      secondary: vehiculo.tipo_vehiculo || vehiculo.tipo || "No especificado",
    },
    {
      icon: <SpeedIcon fontSize="small" color="action" />,
      primary: "Tipo de caja",
      secondary: vehiculo.tipo_caja || vehiculo.caja || "No especificada",
    },
    {
      icon: <CalendarTodayIcon fontSize="small" color="action" />,
      primary: "Año",
      secondary:
        vehiculo.anio || vehiculo.anio_fabricacion || "No especificado",
    },
    {
      icon: <ColorLensIcon fontSize="small" color="action" />,
      primary: "Color",
      secondary: vehiculo.color || "No especificado",
    },
    ...((vehiculo.caracteristicas || vehiculo.equipamiento) &&
    Array.isArray(vehiculo.caracteristicas || vehiculo.equipamiento)
      ? [
          {
            icon: <BuildIcon fontSize="small" color="action" />,
            primary: "Características",
            secondary: (vehiculo.caracteristicas || vehiculo.equipamiento).join(
              ", "
            ),
          },
        ]
      : []),
  ].filter(
    (item) =>
      item.secondary &&
      item.secondary !== "No especificado" &&
      item.secondary !== "undefined personas"
  );

  if (especificaciones.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" fontStyle="italic">
        No hay especificaciones disponibles
      </Typography>
    );
  }

  return (
    <List dense disablePadding>
      {especificaciones.map((item, index) => (
        <ListItem
          key={index}
          disableGutters
          sx={{
            py: 1,
            "&:not(:last-child)": {
              borderBottom: "1px solid",
              borderColor: "divider",
              pb: 1.5,
              mb: 1,
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: "text.secondary" }}>
            {item.icon}
          </ListItemIcon>
          <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
            <Typography
              variant="caption"
              color="text.secondary"
              lineHeight={1.2}
            >
              {item.primary}
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {item.secondary}
            </Typography>
          </Box>
        </ListItem>
      ))}
    </List>
  );
};

// Componente para mostrar el estado del vehículo
const EstadoVehiculo = ({ vehiculo }) => {
  if (!vehiculo) return null;

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "disponible":
        return "success";
      case "en_mantenimiento":
        return "warning";
      case "alquilado":
        return "info";
      case "ocupado":
        return "error";
      default:
        return "default";
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case "disponible":
        return <CheckCircleIcon color="success" />;
      case "en_mantenimiento":
        return <BuildIcon color="warning" />;
      case "alquilado":
      case "ocupado":
        return <WarningIcon color="error" />;
      default:
        return <ErrorIcon color="action" />;
    }
  };

  return (
    <Box display="flex" alignItems="center" gap={1}>
      {getEstadoIcon(vehiculo.estado)}
      <Chip
        label={
          vehiculo.estado ? vehiculo.estado.replace("_", " ") : "Desconocido"
        }
        color={getEstadoColor(vehiculo.estado)}
        size="small"
      />
    </Box>
  );
};

export default function AdminVehiculoDetalle() {
  // Estado para el modal de reserva
  const [modalReservaAbierta, setModalReservaAbierta] = useState(false);
  const [clientesReserva, setClientesReserva] = useState([]);
  const [guardandoReserva, setGuardandoReserva] = useState(false);
  const [erroresReserva, setErroresReserva] = useState({});

  // Cargar clientes solo la primera vez que se abre el modal
  useEffect(() => {
    if (modalReservaAbierta && clientesReserva.length === 0) {
      const token = localStorage.getItem('token');
      fetch('http://localhost:8000/api/clientes?per_page=100', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(resp => resp.json())
        .then(data => setClientesReserva(data.data || []));
    }
  }, [modalReservaAbierta, clientesReserva.length]);

  // Función para guardar la reserva desde el modal
  const guardarReservaDesdeVehiculo = async (reserva) => {
    setGuardandoReserva(true);
    setErroresReserva({});
    try {
      const token = localStorage.getItem('token');
      // Calcular el precio total
      let precio_total = undefined;
      if (vehiculo && vehiculo.precio_dia && reserva.fecha_inicio && reserva.fecha_fin) {
        const inicio = dayjs(reserva.fecha_inicio);
        const fin = dayjs(reserva.fecha_fin);
        const dias = fin.diff(inicio, 'day') + 1;
        precio_total = dias > 0 ? dias * vehiculo.precio_dia : vehiculo.precio_dia;
      }
      const datosAEnviar = {
        ...reserva,
        vehiculo_id: vehiculo.id,
        cliente_type: 'App\\Models\\Cliente',
        fecha_inicio: reserva.fecha_inicio ? dayjs(reserva.fecha_inicio).format('YYYY-MM-DD') : '',
        fecha_fin: reserva.fecha_fin ? dayjs(reserva.fecha_fin).format('YYYY-MM-DD') : '',
        precio_total,
      };


      console.log('Datos enviados al backend para crear reserva:', datosAEnviar);
      const resp = await fetch('http://localhost:8000/api/reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(datosAEnviar),
      });
      if (!resp.ok) {
        let mensaje = 'Error al guardar reserva';
        try {
          const errorData = await resp.json();
          console.error('Respuesta de error del backend:', errorData);
          if (errorData && (errorData.mensaje || errorData.errores)) {
            mensaje = errorData.mensaje || (Array.isArray(errorData.errores) ? errorData.errores.join(', ') : JSON.stringify(errorData.errores));
            setErroresReserva(errorData.errores || {});
          } else if (errorData && errorData.error) {
            mensaje = errorData.error;
          }
        } catch (e) {
          console.error('Error parseando la respuesta del backend:', e);
        }
        throw new Error(mensaje);
      }
      setModalReservaAbierta(false);
      setErroresReserva({});
      // Aquí podrías recargar la lista de reservas del vehículo si la tienes
      setSnackbar({ abierto: true, mensaje: 'Reserva creada correctamente', severidad: 'success' });
    } catch (e) {
      setSnackbar({ abierto: true, mensaje: e.message || 'Error al guardar reserva', severidad: 'error' });
    } finally {
      setGuardandoReserva(false);
    }
  };

  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [vehiculoEditando, setVehiculoEditando] = useState(null);
  const [imagenEliminada, setImagenEliminada] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Copia editable del vehículo al abrir el modal
  useEffect(() => {
    if (modalEditarAbierto && vehiculo) {
      setVehiculoEditando({ ...vehiculo });
      setImagenEliminada(false);
    }
  }, [modalEditarAbierto]);

  const manejarCambio = (e) => {
    if (e.target.name === "imagen") {
      // Si es input file
      if (e.target.files && e.target.files[0]) {
        setVehiculoEditando({ ...vehiculoEditando, imagen: e.target.files[0] });
        setImagenEliminada(false);
      }
      return;
    }
    // Características (checkboxes)
    if (
      e.target.name === "caracteristicas" &&
      e.target.dataset?.caracteristica
    ) {
      const caracteristica = e.target.dataset.caracteristica;
      const valor = e.target.dataset.valor === "true";
      setVehiculoEditando((prev) => ({
        ...prev,
        caracteristicas: {
          ...prev.caracteristicas,
          [caracteristica]: valor,
        },
      }));
      return;
    }
    // Otros campos
    const nuevoEstado = {
      ...vehiculoEditando,
      [e.target.name]: e.target.value,
    };
    setVehiculoEditando(nuevoEstado);
  };

  const manejarGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      console.log('[GUARDAR] Iniciando guardar vehículo...');
      const token = localStorage.getItem("token");
      const formData = new FormData();
      // Solo los campos editables y válidos:
      const camposEditables = [
        "matricula",
        "modelo",
        "tipo",
        // "localizacion",
        "precio_dia",
        "descripcion",
        "caracteristicas",
        "color",
        "kilometraje",
        "fecha_proximo_mantenimiento",
        "estado",
      ];
      camposEditables.forEach((clave) => {
        const valor = vehiculoEditando[clave];
        if (valor !== undefined && valor !== null) {
          formData.append(clave, valor);
        }
      });
      // Imagen: lógica completa
      if (imagenEliminada) {
        formData.append("eliminar_imagen", "1"); // El backend debe interpretar esto
      } else if (
        vehiculoEditando.imagen &&
        typeof vehiculoEditando.imagen !== "string"
      ) {
        formData.append("imagen", vehiculoEditando.imagen);
      }
      formData.append("_method", "PUT");
      // LOG de todos los datos que se van a enviar
      console.log("[DEBUG] FormData que se enviará al backend:");
      for (const par of formData.entries()) {
        console.log("  ", par[0], ":", par[1]);
      }
      console.log('[GUARDAR] Enviando fetch PUT/POST al backend...');
      const respuesta = await fetch(
        `http://localhost:8000/api/vehiculos/${vehiculo.id}`,
        {
          method: "POST", // Laravel requiere POST para FormData en update
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      console.log('[GUARDAR] Respuesta HTTP:', respuesta.status, respuesta.statusText);
      if (!respuesta.ok) {
        const data = await respuesta.json();
        console.error('[GUARDAR] Error en respuesta:', data);
        throw new Error(data.message || "Error al guardar los cambios");
      }
      const data = await respuesta.json();
      console.log('[GUARDAR] Vehículo actualizado correctamente. Respuesta:', data);
      setSnackbar({
        abierto: true,
        mensaje: "Vehículo actualizado correctamente",
        severidad: "success",
      });
      setModalEditarAbierto(false);
      setVehiculoEditando(null);
      // Actualizar los datos del vehículo sin recargar la página
      try {
        const token = localStorage.getItem("token");
        const respuesta = await fetch(
          `http://localhost:8000/api/vehiculos/${vehiculo.id}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (respuesta.ok) {
          const datosActualizados = await respuesta.json();
          setVehiculo(datosActualizados.data || datosActualizados);
        }
      } catch (error) {
        // Si falla la recarga, solo muestra el mensaje de éxito
      }
    } catch (e) {
      setSnackbar({ abierto: true, mensaje: e.message, severidad: "error" });
    } finally {
      setGuardando(false);
    }
  };

  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const esMovil = useMediaQuery(theme.breakpoints.down("md"));

  const [vehiculo, setVehiculo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [tabActual, setTabActual] = useState(0);
  const [dialogoEliminar, setDialogoEliminar] = useState(false);
  const [snackbar, setSnackbar] = useState({
    abierto: false,
    mensaje: "",
    severidad: "success",
  });

  // Obtener datos del vehículo
  useEffect(() => {
    const obtenerVehiculo = async () => {
      try {
        setCargando(true);
        const token = localStorage.getItem("token");
        const respuesta = await fetch(
          `http://localhost:8000/api/vehiculos/${id}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!respuesta.ok) {
          throw new Error("No se pudo cargar la información del vehículo");
        }

        const datos = await respuesta.json();
        console.log("Datos del vehículo:", datos);
        setVehiculo(datos);
      } catch (error) {
        console.error("Error al obtener el vehículo:", error);
        setError(error.message || "Error al cargar el vehículo");
        setSnackbar({
          abierto: true,
          mensaje: error.message || "Error al cargar el vehículo",
          severidad: "error",
        });
      } finally {
        setCargando(false);
      }
    };

    obtenerVehiculo();
  }, [id]);

  const handleEliminarClick = () => {
    setDialogoEliminar(true);
  };

  const confirmarEliminar = async () => {
    try {
      const token = localStorage.getItem("token");
      const respuesta = await fetch(
        `http://localhost:8000/api/vehiculos/${id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!respuesta.ok) {
        throw new Error("No se pudo eliminar el vehículo");
      }

      setSnackbar({
        abierto: true,
        mensaje: "Vehículo eliminado correctamente",
        severidad: "success",
      });

      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        navigate("/admin/vehiculos");
      }, 1500);
    } catch (error) {
      console.error("Error al eliminar el vehículo:", error);
      setSnackbar({
        abierto: true,
        mensaje: error.message || "Error al eliminar el vehículo",
        severidad: "error",
      });
    } finally {
      setDialogoEliminar(false);
    }
  };

  const handleSnackbarCerrar = () => {
    setSnackbar((prev) => ({ ...prev, abierto: false }));
  };

  if (cargando) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!vehiculo) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        No se encontró el vehículo solicitado
      </Alert>
    );
  }

  return (
    <Box sx={{ p: esMovil ? 2 : 4 }}>
      {/* Encabezado */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ color: "text.primary" }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: 600, mb: 0.5 }}
            >
              {vehiculo.marca} {vehiculo.modelo}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <EstadoVehiculo vehiculo={vehiculo} />
              <Typography variant="body2" color="text.secondary">
                ID: {vehiculo.id}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Contenido principal */}
      <Grid container spacing={3}>
        {/* Columna izquierda */}
        <Grid item xs={12} md={8}>
          {/* Imagen principal */}
          <Card
            sx={{ mb: 3, borderRadius: 2, overflow: "hidden", boxShadow: 2 }}
          >
            <Box
              sx={{
                height: 400,
                backgroundImage: vehiculo.imagen
                  ? `url(${vehiculo.imagen})`
                  : "linear-gradient(45deg, #f5f5f5 25%, #e0e0e0 25%, #e0e0e0 50%, #f5f5f5 50%, #f5f5f5 75%, #e0e0e0 75%, #e0e0e0 100%)",
                backgroundSize: vehiculo.imagen ? "cover" : "20px 20px",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "flex-start",
                backgroundColor: "#f5f5f5",
                position: "relative",
                p: 3,
              }}
            >
              <Box
                sx={{
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  color: "white",
                  p: 2,
                  borderRadius: 1,
                  width: "100%",
                  maxWidth: "80%",
                }}
              >
                <Typography variant="h5" fontWeight={600}>
                  {vehiculo.marca} {vehiculo.modelo}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {vehiculo.tipo_vehiculo || vehiculo.tipo || "Vehículo"}
                </Typography>
              </Box>

              {!vehiculo.imagen && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                    color: "text.secondary",
                  }}
                >
                  <DirectionsCarIcon sx={{ fontSize: 80, mb: 1 }} />
                  <Typography>Imagen no disponible</Typography>
                </Box>
              )}
            </Box>
          </Card>

          {/* Descripción */}
          {vehiculo.descripcion && (
            <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Descripción
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  {vehiculo.descripcion}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Sección de daños del vehículo */}
          <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ReportProblemIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Registro de Daños
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <SelectorDanosVehiculo vehiculoId={id} />
            </CardContent>
          </Card>
        </Grid>

        {/* Columna derecha */}
        <Grid item xs={12} md={4}>
          {/* Acciones rápidas */}
          <Card
            sx={{ mb: 3, borderRadius: 2, boxShadow: 2, overflow: "hidden" }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Acciones
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={<EditIcon />}
                    onClick={() => setModalEditarAbierto(true)}
                  >
                    Editar Vehículo
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleEliminarClick}
                  >
                    Eliminar Vehículo
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Mantenimiento */}
          <Card
            sx={{ mb: 2, borderRadius: 2, boxShadow: 2, overflow: "hidden" }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                MANTENIMIENTO
              </Typography>
              <Divider sx={{ mb: 1.5 }} />

              <Box mb={2} display="flex" alignItems="flex-start" gap={1.5}>
                <EventIcon fontSize="small" color="action" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    component="div"
                  >
                    Último mantenimiento
                  </Typography>
                  <Typography variant="body2" fontWeight={500} component="div">
                    {vehiculo.fecha_ultimo_mantenimiento
                      ? dayjs(vehiculo.fecha_ultimo_mantenimiento).format("LL")
                      : "No registrado"}
                  </Typography>
                </Box>
              </Box>

              <Box mb={2} display="flex" alignItems="flex-start" gap={1.5}>
                <BuildIcon fontSize="small" color="warning" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    component="div"
                  >
                    Próximo mantenimiento
                  </Typography>
                  <Typography variant="body2" fontWeight={500} component="div">
                    {vehiculo.proximo_mantenimiento_km
                      ? `${vehiculo.proximo_mantenimiento_km.toLocaleString()} km`
                      : "No programado"}
                  </Typography>
                </Box>
              </Box>

              <Box mb={2} display="flex" alignItems="flex-start" gap={1.5}>
                <SpeedIcon fontSize="small" color="action" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    component="div"
                  >
                    Kilometraje actual
                  </Typography>
                  <Typography variant="body2" fontWeight={500} component="div">
                    {vehiculo.kilometraje
                      ? `${vehiculo.kilometraje.toLocaleString()} km`
                      : "No especificado"}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Especificaciones del vehículo */}
          <Card
            sx={{ mb: 3, borderRadius: 2, boxShadow: 2, overflow: "hidden" }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <BuildIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Especificaciones
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <EspecificacionesVehiculo vehiculo={vehiculo} />
            </CardContent>
          </Card>

          {/* Próximas reservas */}
          <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Próximas Reservas
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setModalReservaAbierta(true)}
                >
                  Nueva Reserva
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography
                variant="body2"
                color="text.secondary"
                fontStyle="italic"
              >
                No hay reservas programadas para este vehículo.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={dialogoEliminar} onClose={() => setDialogoEliminar(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar este vehículo? Esta acción no
            se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoEliminar(false)}>Cancelar</Button>
          <Button onClick={confirmarEliminar} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de reserva */}
      <ModalReserva
        abierta={modalReservaAbierta}
        alCerrar={() => setModalReservaAbierta(false)}
        alGuardar={guardarReservaDesdeVehiculo}
        vehiculos={[vehiculo].filter(Boolean)}
        clientes={clientesReserva}
        vehiculoIdFijo={vehiculo?.id}
        modo="crear"
        cargando={guardandoReserva}
        errores={erroresReserva}
      />

      {/* Modal de edición de vehículo */}
      <Dialog
        open={modalEditarAbierto}
        onClose={() => setModalEditarAbierto(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <EditIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" component="span" sx={{ fontWeight: 700 }}>
              Editar vehículo
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: "block", mt: 0.5 }}
            >
              Modifica la información y guarda los cambios
            </Typography>
          </Box>
        </DialogTitle>
        <form onSubmit={manejarGuardar}>
          <DialogContent dividers>
            {vehiculoEditando && (
              <Box>
                <Box display="flex" flexDirection="column" gap={1.5}>
                  {/* Campo imagen */}
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Imagen del vehículo
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      {/* Vista previa imagen */}
                      {(() => {
                        let urlPorDefecto = "/img/vehiculo-default.jpg";
                        let previewUrl = "";
                        let motivo = "";
                        if (imagenEliminada) {
                          previewUrl = urlPorDefecto;
                          motivo = "imagenEliminada=true (por defecto)";
                        } else if (vehiculoEditando.imagen instanceof File) {
                          previewUrl = URL.createObjectURL(vehiculoEditando.imagen);
                          motivo = "vehiculoEditando.imagen es File (nueva imagen subida)";
                        } else if (typeof vehiculoEditando.imagen === "string" && vehiculoEditando.imagen) {
                          previewUrl = vehiculoEditando.imagen;
                          motivo = "vehiculoEditando.imagen es string (imagen original)";
                        } else if (vehiculo.imagen) {
                          previewUrl = vehiculo.imagen;
                          motivo = "vehiculo.imagen (imagen actual del vehículo)";
                        } else {
                          previewUrl = urlPorDefecto;
                          motivo = "ninguna imagen, uso por defecto";
                        }
                        console.log("[PREVIEW IMG] url:", previewUrl, "motivo:", motivo, { imagenEliminada, vehiculoEditandoImg: vehiculoEditando.imagen, vehiculoImg: vehiculo.imagen });
                        return (
                          <img
                            src={previewUrl}
                            alt="Vista previa"
                            style={{
                              width: 80,
                              height: 54,
                              objectFit: "cover",
                              borderRadius: 6,
                              border: "1px solid #eee",
                              background: "#fafafa",
                            }}
                            onError={(e) => {
                              if (!e.target.dataset.fallback) {
                                e.target.src = "/storage/default.png";
                                e.target.dataset.fallback = "true";
                              }
                            }}
                          />
                        );
                      })()}

                      <Button
                        variant="outlined"
                        component="label"
                        size="small"
                        sx={{ mr: 1 }}
                        disabled={imagenEliminada}
                        onClick={() => {console.log('[BOTÓN] Click en Cambiar imagen')}}
                      >
                        Cambiar imagen
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          name="imagen"
                          onChange={e => { console.log('[INPUT FILE] Imagen seleccionada:', e.target.files?.[0]); manejarCambio(e); }}
                        />
                      </Button>
                      <Button
                        variant="text"
                        color="error"
                        size="small"
                        onClick={() => {
                          console.log('[BOTÓN] Click en Eliminar imagen');
                          setVehiculoEditando((prev) => ({
                            ...prev,
                            imagen: null,
                          }));
                          setImagenEliminada(true);
                        }}
                        disabled={
                          imagenEliminada ||
                          (!vehiculoEditando.imagen && !vehiculo.imagen)
                        }
                      >
                        Eliminar imagen
                      </Button>
                      {imagenEliminada && (
                        <Button
                          variant="text"
                          color="primary"
                          size="small"
                          onClick={() => {
                            console.log('[BOTÓN] Click en Restaurar imagen');
                            setImagenEliminada(false);
                            setVehiculoEditando((prev) => ({
                              ...prev,
                              imagen: vehiculo.imagen || "",
                            }));
                          }}
                        >
                          Restaurar imagen
                        </Button>
                      )}
                    </Box>
                  </Box>
                  <TextField
                    margin="dense"
                    label="Matrícula"
                    name="matricula"
                    value={
                      vehiculoEditando.matricula || vehiculoEditando.placa || ""
                    }
                    onChange={manejarCambio}
                    fullWidth
                    required
                  />
                  <TextField
                    margin="dense"
                    label="Modelo"
                    name="modelo"
                    value={vehiculoEditando.modelo || ""}
                    onChange={manejarCambio}
                    fullWidth
                    required
                  />
                  <TextField
                    margin="dense"
                    label="Precio por día"
                    name="precio_dia"
                    type="number"
                    value={vehiculoEditando.precio_dia || ""}
                    onChange={manejarCambio}
                    fullWidth
                    inputProps={{ min: 0, step: "0.01" }}
                  />
                  <TextField
                    margin="dense"
                    label="Descripción"
                    name="descripcion"
                    value={vehiculoEditando.descripcion || ""}
                    onChange={manejarCambio}
                    fullWidth
                    multiline
                    minRows={3}
                    maxRows={8}
                  />
                  <TextField
                    margin="dense"
                    label="Color"
                    name="color"
                    value={vehiculoEditando.color || ""}
                    onChange={manejarCambio}
                    fullWidth
                    required
                  />
                  <TextField
                    margin="dense"
                    label="Kilometraje"
                    name="kilometraje"
                    type="number"
                    value={vehiculoEditando.kilometraje || ""}
                    onChange={manejarCambio}
                    fullWidth
                    inputProps={{ min: 0 }}
                  />
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Características
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(200px, 1fr))",
                        gap: 2,
                      }}
                    >
                      {[
                        "Aire Acondicionado",
                        "GPS",
                        "Bluetooth",
                        "Cámara de Retroceso",
                        "Sensores de Estacionamiento",
                        "Control de Crucero",
                      ].map((caracteristica) => (
                        <FormControlLabel
                          key={caracteristica}
                          control={
                            <Checkbox
                              checked={
                                vehiculoEditando?.caracteristicas?.[
                                  caracteristica
                                ] || false
                              }
                              onChange={() => {
                                const event = {
                                  target: {
                                    name: "caracteristicas",
                                    dataset: {
                                      caracteristica,
                                      valor:
                                        !vehiculoEditando?.caracteristicas?.[
                                          caracteristica
                                        ],
                                    },
                                  },
                                };
                                manejarCambio(event);
                              }}
                            />
                          }
                          label={caracteristica}
                        />
                      ))}
                    </Box>
                  </Box>
                  <Box sx={{ mt: 1.5 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Tipo *
                    </Typography>
                    <Select
                      name="tipo"
                      value={vehiculoEditando.tipo || ""}
                      onChange={manejarCambio}
                      fullWidth
                    >
                      <MenuItem value="SUV">SUV</MenuItem>
                      <MenuItem value="Economy">Economy</MenuItem>
                      <MenuItem value="Luxury">Luxury</MenuItem>
                      <MenuItem value="Compact">Compact</MenuItem>
                      <MenuItem value="Sedan">Sedan</MenuItem>
                      <MenuItem value="Convertible">Convertible</MenuItem>
                      <MenuItem value="Pickup">Pickup</MenuItem>
                      <MenuItem value="Van">Van</MenuItem>
                      <MenuItem value="Otro">Otro</MenuItem>
                    </Select>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <DatePicker
                      label="Próximo mantenimiento"
                      value={
                        vehiculoEditando.fecha_proximo_mantenimiento
                          ? dayjs(vehiculoEditando.fecha_proximo_mantenimiento)
                          : null
                      }
                      onChange={(nuevaFecha) =>
                        manejarCambio({
                          target: {
                            name: "fecha_proximo_mantenimiento",
                            value: nuevaFecha
                              ? nuevaFecha.format("YYYY-MM-DD")
                              : "",
                          },
                        })
                      }
                      format="DD-MM-YYYY"
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Estado *
                    </Typography>
                    <Select
                      name="estado"
                      value={vehiculoEditando.estado || ""}
                      onChange={manejarCambio}
                      fullWidth
                    >
                      <MenuItem value="disponible">Disponible</MenuItem>
                      <MenuItem value="ocupado">Ocupado</MenuItem>
                      <MenuItem value="en_mantenimiento">
                        En mantenimiento
                      </MenuItem>
                      <MenuItem value="alquilado">Alquilado</MenuItem>
                    </Select>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setModalEditarAbierto(false)}
              color="inherit"
              disabled={guardando}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.abierto}
        autoHideDuration={6000}
        onClose={handleSnackbarCerrar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarCerrar}
          severity={snackbar.severidad}
          sx={{ width: "100%" }}
        >
          {snackbar.mensaje}
        </Alert>
      </Snackbar>
    </Box>
  );
}
