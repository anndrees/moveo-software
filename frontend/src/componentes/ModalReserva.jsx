import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import MenuItem from '@mui/material/MenuItem';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

export default function ModalReserva({
  abierta,
  alCerrar,
  alGuardar,
  vehiculos = [],
  clientes = [],
  vehiculoIdFijo = null,
  modo = 'crear',
  reservaInicial = null,
  cargando = false,
  errores = {},
}) {
  const [reserva, setReserva] = useState({
    vehiculo_id: vehiculoIdFijo || '',
    cliente_id: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: '',
  });

  useEffect(() => {
    if (reservaInicial) {
      setReserva({
        ...reservaInicial,
        fecha_inicio: reservaInicial.fecha_inicio ? dayjs(reservaInicial.fecha_inicio) : '',
        fecha_fin: reservaInicial.fecha_fin ? dayjs(reservaInicial.fecha_fin) : '',
      });
    } else {
      setReserva({
        vehiculo_id: vehiculoIdFijo || '',
        cliente_id: '',
        fecha_inicio: '',
        fecha_fin: '',
        estado: '',
      });
    }
  }, [abierta, reservaInicial, vehiculoIdFijo]);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setReserva((prev) => ({ ...prev, [name]: value }));
  };

  const manejarFechaInicio = (nuevaFecha) => {
    setReserva((prev) => ({ ...prev, fecha_inicio: nuevaFecha }));
  };
  const manejarFechaFin = (nuevaFecha) => {
    setReserva((prev) => ({ ...prev, fecha_fin: nuevaFecha }));
  };

  const [erroresLocales, setErroresLocales] = useState({});

  const manejarGuardar = (e) => {
    e.preventDefault();
    let nuevosErrores = {};
    if (reserva.fecha_inicio && reserva.fecha_fin) {
      const inicio = dayjs(reserva.fecha_inicio);
      const fin = dayjs(reserva.fecha_fin);
      if (fin.isBefore(inicio, 'day')) {
        nuevosErrores.fecha_fin = 'La fecha de fin no puede ser anterior a la fecha de inicio';
        nuevosErrores.fecha_inicio = 'La fecha de inicio no puede ser posterior a la fecha de fin';
      }
    }
    setErroresLocales(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;
    if (alGuardar) alGuardar(reserva);
  };

  return (
    <Dialog open={abierta} onClose={alCerrar} maxWidth="sm" fullWidth>
      <DialogTitle>{modo === 'editar' ? 'Editar reserva' : 'Nueva reserva'}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Vehículo *</Typography>
          <Autocomplete
            options={vehiculos}
            getOptionLabel={(v) => v && (v.matricula + (v.modelo ? ` (${v.modelo})` : ''))}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={vehiculos.find(v => v.id === reserva.vehiculo_id) || null}
            onChange={(_, value) => {
              setReserva(prev => ({ ...prev, vehiculo_id: value ? value.id : '' }));
            }}
            disabled={!!vehiculoIdFijo}
            filterOptions={(options, { inputValue }) =>
              options.filter(v =>
                v.matricula?.toLowerCase().includes(inputValue.toLowerCase()) ||
                v.modelo?.toLowerCase().includes(inputValue.toLowerCase())
              )
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Selecciona un vehículo"
                error={!!errores.vehiculo_id}
                helperText={errores.vehiculo_id}
                fullWidth
              />
            )}
            noOptionsText="No hay coincidencias"
            clearOnBlur
            selectOnFocus
            handleHomeEndKeys
          />
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Cliente *</Typography>
          <Autocomplete
            options={clientes}
            getOptionLabel={(c) => c && (`${c.nombre} ${c.apellidos} - ${c.documento_identidad || ''}`)}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={clientes.find(c => c.id === reserva.cliente_id) || null}
            onChange={(_, value) => {
              setReserva(prev => ({ ...prev, cliente_id: value ? value.id : '' }));
            }}
            filterOptions={(options, { inputValue }) =>
              options.filter(c =>
                (c.nombre + ' ' + c.apellidos).toLowerCase().includes(inputValue.toLowerCase()) ||
                (c.documento_identidad || '').toLowerCase().includes(inputValue.toLowerCase())
              )
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Selecciona un cliente"
                error={!!errores.cliente_id}
                helperText={errores.cliente_id}
                fullWidth
              />
            )}
            noOptionsText="No hay coincidencias"
            clearOnBlur
            selectOnFocus
            handleHomeEndKeys
          />
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Fecha inicio *</Typography>
          <DatePicker
            label="Fecha inicio *"
            value={reserva.fecha_inicio ? dayjs(reserva.fecha_inicio) : null}
            onChange={manejarFechaInicio}
            format="DD-MM-YYYY"
            shouldDisableDate={date => reserva.fecha_fin ? date.isAfter(dayjs(reserva.fecha_fin), 'day') : false}
            slotProps={{ textField: { fullWidth: true, error: !!(errores.fecha_inicio || erroresLocales.fecha_inicio), helperText: errores.fecha_inicio || erroresLocales.fecha_inicio } }}
          />
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Fecha fin *</Typography>
          <DatePicker
            label="Fecha fin *"
            value={reserva.fecha_fin ? dayjs(reserva.fecha_fin) : null}
            onChange={manejarFechaFin}
            format="DD-MM-YYYY"
            shouldDisableDate={date => reserva.fecha_inicio ? date.isBefore(dayjs(reserva.fecha_inicio), 'day') : false}
            slotProps={{ textField: { fullWidth: true, error: !!(errores.fecha_fin || erroresLocales.fecha_fin), helperText: errores.fecha_fin || erroresLocales.fecha_fin } }}
          />
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Estado *</Typography>
          <TextField
            select
            name="estado"
            label="Estado *"
            value={reserva.estado || ''}
            onChange={manejarCambio}
            error={!!errores.estado}
            helperText={errores.estado}
            fullWidth
          >
            <MenuItem value="">Selecciona un estado</MenuItem>
            <MenuItem value="pendiente">Pendiente</MenuItem>
            <MenuItem value="confirmada">Confirmada</MenuItem>
            <MenuItem value="cancelada">Cancelada</MenuItem>
            <MenuItem value="finalizada">Finalizada</MenuItem>
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={alCerrar} color="inherit" disabled={cargando}>
          Cancelar
        </Button>
        <Button onClick={manejarGuardar} variant="contained" color="primary" disabled={cargando}>
          {modo === 'editar' ? 'Guardar cambios' : 'Crear reserva'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
