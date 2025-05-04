import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "bootstrap/dist/css/bootstrap.min.css";
import { ProveedorAutenticacion } from './contexto/ContextoAutenticacion';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ProveedorAutenticacion>
      <App />
    </ProveedorAutenticacion>
  </StrictMode>,
)
