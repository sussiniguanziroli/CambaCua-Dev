import React, { useState } from 'react';
import { doc, getDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import Swal from 'sweetalert2';


const OrderDetails = () => {
  const [trackingCode, setTrackingCode] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleInputChange = (e) => {
    setTrackingCode(e.target.value);
    setError('');
  };

  const fetchOrderDetails = async () => {
    if (!trackingCode.trim()) {
      setError('Por favor ingresa un código de seguimiento');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Buscar primero en pedidos activos
      const orderRef = doc(db, 'pedidos', trackingCode);
      const orderSnap = await getDoc(orderRef);

      if (orderSnap.exists()) {
        processOrderData(orderSnap);
        return;
      }

      // Si no está en pedidos activos, buscar en completados
      const completedRef = doc(db, 'pedidos_completados', trackingCode);
      const completedSnap = await getDoc(completedRef);

      if (completedSnap.exists()) {
        processOrderData(completedSnap, true);
        return;
      }

      setError('No se encontró ningún pedido con ese código');
      setOrder(null);
    } catch (err) {
      console.error("Error fetching order:", err);
      setError('Error al buscar el pedido. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const processOrderData = (docSnap, isCompleted = false) => {
    const orderData = docSnap.data();
    setOrder({
      id: docSnap.id,
      ...orderData,
      fecha: new Date(orderData.fecha.seconds * 1000).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      estado: isCompleted ? 'Completado' : orderData.estado
    });
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(trackingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancelOrder = async () => {
    if (!order || order.estado !== 'Pendiente') {
      setError('Solo puedes cancelar pedidos en estado "Pendiente"');
      return;
    }

    const { isConfirmed } = await Swal.fire({
      title: '¿Cancelar pedido?',
      text: `¿Estás seguro que deseas cancelar el pedido #${order.id.substring(0, 8)}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, volver',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    });

    if (!isConfirmed) return;

    try {
      // Mover a pedidos_completados como Cancelado
      await setDoc(doc(db, 'pedidos_completados', order.id), {
        ...order,
        estado: 'Cancelado',
        fechaCancelacion: new Date()
      });

      // Eliminar de pedidos activos
      await deleteDoc(doc(db, 'pedidos', order.id));

      // Actualizar estado local
      setOrder(prev => ({
        ...prev,
        estado: 'Cancelado'
      }));

      Swal.fire({
        title: '¡Pedido cancelado!',
        text: 'El pedido ha sido cancelado exitosamente',
        icon: 'success',
        confirmButtonText: 'Entendido'
      });
    } catch (err) {
      console.error("Error canceling order:", err);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cancelar el pedido',
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
    }
  };

  return (
    <div className="order-details-container">
      <div className="order-search-section">
        <h2>Consulta tu Pedido</h2>
        <p>Ingresa tu código de seguimiento para ver el estado de tu pedido</p>
        
        <div className="search-input-group">
          <input
            type="text"
            placeholder="Ej: ABC123XYZ"
            value={trackingCode}
            onChange={handleInputChange}
            className="search-input"
          />
          <button 
            onClick={fetchOrderDetails} 
            disabled={loading || !trackingCode}
            className="search-button"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Buscando...
              </>
            ) : 'Buscar Pedido'}
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}
      </div>

      {order && (
        <div className="order-summary">
          <div className="order-header">
            <h3>Resumen del Pedido</h3>
            <div className="order-id-section">
              <p>Número: <strong>{order.id}</strong></p>
              <button
                onClick={copyOrderId}
                className={`copy-button ${copied ? 'copied' : ''}`}
              >
                {copied ? '✓ Copiado!' : 'Copiar Código'}
              </button>
            </div>
          </div>

          <div className="order-status">
            <span className={`status-badge ${order.estado.toLowerCase()}`}>
              {order.estado}
            </span>
          </div>

          <div className="order-section">
            <h4>Detalles del Pedido</h4>
            <div className="order-detail">
              <strong>Fecha:</strong>
              <span>{order.fecha}</span>
            </div>
            <div className="order-detail">
              <strong>Total:</strong>
              <span>${order.total.toFixed(2)}</span>
            </div>
            <div className="order-detail">
              <strong>Método de Pago:</strong>
              <span>{order.metodoPago}</span>
            </div>
          </div>

          <div className="order-section">
            <h4>Productos</h4>
            <div className="order-products">
              {order.productos.map((item, index) => (
                <div key={index} className="product-item">
                  <img 
                    src={item.imagen} 
                    alt={item.nombre} 
                    className="product-image"
                    loading="lazy"
                  />
                  <div className="product-info">
                    <h5>{item.nombre}</h5>
                    <div className="product-meta">
                      <span>${item.precio.toFixed(2)} c/u</span>
                      <span>Cant: {item.cantidad}</span>
                    </div>
                  </div>
                  <div className="product-subtotal">
                    ${(item.precio * item.cantidad).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {order.estado === 'Pendiente' && (
            <div className="order-actions">
              <button 
                onClick={handleCancelOrder}
                className="cancel-button"
              >
                Cancelar Pedido
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderDetails;