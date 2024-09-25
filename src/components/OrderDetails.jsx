import React, { useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const OrderDetails = () => {
    
  const [trackingCode, setTrackingCode] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Maneja el cambio de código de seguimiento
  const handleInputChange = (e) => {
    setTrackingCode(e.target.value);
  };

  // Busca el pedido en Firebase
  const fetchOrderDetails = async () => {
    setLoading(true);
    setError('');

    try {
      const orderRef = doc(db, 'pedidos', trackingCode);
      const orderSnap = await getDoc(orderRef);

      if (orderSnap.exists()) {
        setOrder(orderSnap.data());
      } else {
        setError('No se encontró ningún pedido con ese código de seguimiento.');
      }
    } catch (err) {
      setError('Error al buscar el pedido. Intenta nuevamente.');
    }

    setLoading(false);
  };

  // Cancela el pedido si no está completado
  const handleCancelOrder = async () => {
    if (!order || order.estado === 'completado') {
      setError('No puedes cancelar un pedido que ya ha sido completado.');
      return;
    }

    try {
      const orderRef = doc(db, 'pedidos', trackingCode);
      await updateDoc(orderRef, { estado: 'cancelado' });
      setOrder({ ...order, estado: 'cancelado' });
      alert('Pedido cancelado exitosamente.');
    } catch (err) {
      setError('Hubo un problema al cancelar el pedido.');
    }
  };

  return (
    <div className="order-details-container">
      <h2>Consulta o Cancela tu Pedido</h2>
      
      <input
        type="text"
        placeholder="Ingresa el código de seguimiento"
        value={trackingCode}
        onChange={handleInputChange}
      />
      <button onClick={fetchOrderDetails} disabled={loading || !trackingCode}>
        {loading ? 'Buscando...' : 'Buscar Pedido'}
      </button>

      {error && <p className="error">{error}</p>}

      {order && (
        <div className="order-summary">
          <h3>Resumen del Pedido</h3>
          <p><strong>Código de Seguimiento:</strong> {trackingCode}</p>
          <p><strong>Estado:</strong> {order.estado}</p>
          <p><strong>Método de Pago:</strong> {order.metodoPago}</p>
          <p><strong>Productos:</strong></p>
          <ul>
            {order.productos.map((producto, index) => (
              <li key={index}>{producto.nombre} - {producto.cantidad} unidad(es)</li>
            ))}
          </ul>
          <p><strong>Total:</strong> ${order.total}</p>

          {order.estado !== 'completado' && order.estado !== 'cancelado' && (
            <button onClick={handleCancelOrder}>
              Cancelar Pedido
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
