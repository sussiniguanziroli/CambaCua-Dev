import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useNavigate, useParams } from 'react-router-dom';

const OrderSummary = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                // Buscar primero en 'pedidos'
                const pedidosRef = doc(db, 'pedidos', orderId);
                const pedidosSnap = await getDoc(pedidosRef);

                if (pedidosSnap.exists()) {
                    processOrderData(pedidosSnap);
                    return;
                }

                // Si no está en 'pedidos', buscar en 'pedidos_completados'
                const completadosRef = doc(db, 'pedidos_completados', orderId);
                const completadosSnap = await getDoc(completadosRef);

                if (completadosSnap.exists()) {
                    processOrderData(completadosSnap, true);
                    return;
                }

                // Si no está en ninguna colección
                setOrder(null);

            } catch (error) {
                console.error("Error fetching order:", error);
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

        fetchOrder();
    }, [orderId]);

    const copyOrderId = () => {
        navigator.clipboard.writeText(orderId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="order-summary-loading">
                <div className="css-loader"></div>
                <h3>Preparando tu pedido con cuidado...</h3>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="order-summary-error">
                <h2>Pedido no encontrado</h2>
                <button 
                    onClick={() => navigate('/')}
                    className="back-button"
                >
                    Volver al inicio
                </button>
            </div>
        );
    }

    return (
        <div className="order-summary-container">
            <div className="order-header">
                <h2>Resumen de tu Pedido</h2>
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
                <h3>Detalles del Pedido</h3>
                <div className="order-detail">
                    <strong>Fecha:</strong>
                    <span>{order.fecha}</span>
                </div>
                <div className="order-detail">
                    <strong>Total:</strong>
                    <span>${order.total}</span>
                </div>
                <div className="order-detail">
                    <strong>Método de Pago:</strong>
                    <span>{order.metodoPago}</span>
                </div>
            </div>

            <div className="order-section">
                <h3>Productos</h3>
                <div className="order-products">
                    {order.productos.map((item, index) => (
                        <div key={index} className="product-item">
                            <img 
                                src={item.imagen} 
                                alt={item.nombre} 
                                className="product-image"
                            />
                            <div className="product-info">
                                <h4>{item.nombre}</h4>
                                <div className="product-meta">
                                    <span>${item.precio} c/u</span>
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

            <div className="order-section">
                <h3>Datos de Envío</h3>
                <div className="order-detail">
                    <strong>Nombre:</strong>
                    <span>{order.nombre}</span>
                </div>
                <div className="order-detail">
                    <strong>Dirección:</strong>
                    <span>{order.direccion}</span>
                </div>
                {order.telefono && (
                    <div className="order-detail">
                        <strong>Teléfono:</strong>
                        <span>{order.telefono}</span>
                    </div>
                )}
                {order.email && (
                    <div className="order-detail">
                        <strong>Email:</strong>
                        <span>{order.email}</span>
                    </div>
                )}
            </div>

            <div className="order-actions">
                <button 
                    onClick={() => navigate('/')}
                    className="action-button primary"
                >
                    Volver al Inicio
                </button>
                <button 
                    onClick={() => navigate('/mis-pedidos')}
                    className="action-button secondary"
                >
                    Ver mis pedidos
                </button>
            </div>
        </div>
    );
};

export default OrderSummary;