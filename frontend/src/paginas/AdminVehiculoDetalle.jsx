import { useParams } from 'react-router-dom';
export default function AdminVehiculoDetalle() {
  const { id } = useParams();
  return (
    <div className="container mt-5">
      <h2>Detalle del Vehículo</h2>
      <p>Mostrando información para el vehículo con ID: <b>{id}</b></p>
{/* Ejemplo de imagen del vehículo */}
{/*
  <img src={vehiculo?.imagen ? vehiculo.imagen : '/storage/default.png'} alt={vehiculo?.modelo || 'Vehículo'} onError={e => { e.target.src = '/storage/default.png'; }} style={{ width: 120, height: 80, objectFit: 'cover' }} />
*/}
    </div>
  );
}
