import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

export default function PestanasPerfil({ pestanaActiva, onCambiar, opciones }) {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
      <Tabs
        value={pestanaActiva}
        onChange={(_, nueva) => onCambiar(nueva)}
        aria-label="Pestañas de perfil"
        variant="fullWidth"
        textColor="primary"
        indicatorColor="primary"
      >
        {opciones.map((op, idx) => (
          <Tab key={op} label={op} />
        ))}
      </Tabs>
    </Box>
  );
}
