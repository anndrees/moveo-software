import { useState } from 'react';
import Box from '@mui/material/Box';
import MenuLateral from './MenuLateral';

export default function LayoutPrivado({ children, soloAdmin = false }) {
  // Por defecto, si es admin, modoAdmin=true; si no, modoAdmin=false
  const [modoAdmin, setModoAdmin] = useState(soloAdmin);

  return (
    <>
      <Box sx={{ display: 'flex', minHeight: '100vh', height: '100vh', width: '100vw', bgcolor: 'background.default' }}>
        <Box sx={{ width: 220, minWidth: 220, maxWidth: 220, height: '100vh', bgcolor: 'background.paper', boxShadow: 2, zIndex: 100 }}>
          <MenuLateral modoAdmin={modoAdmin} setModoAdmin={setModoAdmin} />
        </Box>
        <Box sx={{ flex: 1, height: '100vh', minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'auto', p: { xs: 1, md: 4 } }}>
          {children}
        </Box>
      </Box>
    </>
  );
}
