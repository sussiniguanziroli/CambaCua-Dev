import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa'; // Import the back icon

const OrderSummary = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();
    const [aliasCopied, setAliasCopied] = useState(false);


    const copyAlias = () => {
        navigator.clipboard.writeText("cambacuavet.mp");
        setAliasCopied(true);
        setTimeout(() => setAliasCopied(false), 2000);
    };


    const generarMensajeWhatsApp = (order) => {
        const resumenURL = `https://www.cambacuavetshop.com.ar/order-summary/${order.id}`;

        let mensaje = `*📦 Pedido Nº ${order.id}*\n\n`;
        mensaje += `¡Confirmo el pedido!\n\n`;

        mensaje += `🔁 *Acceder nuevamente al resumen:*\n${resumenURL}\n\n`;

        mensaje += `💳 *Método de Pago:* ${order.metodoPago}\n`;
        mensaje += `💰 *Total:* $${order.total}\n\n`;

        mensaje += `👤 *Datos del Cliente*\n`;
        mensaje += `📍 Nombre: ${order.nombre}\n`;
        mensaje += `🏠 Dirección: ${order.direccion}\n`;
        if (order.telefono) mensaje += `📞 Teléfono: ${order.telefono}\n`;
        if (order.email) mensaje += `📧 Email: ${order.email}\n\n`;

        mensaje += `🛒 *Productos*\n`;
        order.productos.forEach((item) => {
            mensaje += `• ${item.nombre} x${item.cantidad} - $${(item.precio * item.cantidad).toFixed(2)}\n`;
        });

        mensaje += `\n📎 *Adjunto comprobante:*`;

        return encodeURIComponent(mensaje);
    };


    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const pedidosRef = doc(db, 'pedidos', orderId);
                const pedidosSnap = await getDoc(pedidosRef);

                if (pedidosSnap.exists()) {
                    processOrderData(pedidosSnap);
                    return;
                }

                const completadosRef = doc(db, 'pedidos_completados', orderId);
                const completadosSnap = await getDoc(completadosRef);

                if (completadosSnap.exists()) {
                    processOrderData(completadosSnap);
                    return;
                }

                setOrder(null);

            } catch (error) {
                console.error("Error fetching order:", error);
            } finally {
                setLoading(false);
            }
        };

        const processOrderData = (docSnap) => {
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
                estado: orderData.estado
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
            <div className="summary-actions-header">
                 <button onClick={() => navigate(-1)} className="summary-back-button">
                    <FaArrowLeft /> Volver
                </button>
            </div>
           
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

            <div style={{
                backgroundColor: '#e6f7ff',
                border: '1px solid #91d5ff',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
                color: '#0050b3',
                fontSize: '1rem'
            }}>
                Puedes copiar este codigo y en la seccion de "Mis Compras", usarlo para buscar tu pedido, ver su estado o cancelarlo.          </div>

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
                    <span>${order.total.toFixed(2)}</span>
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
            {order.metodoPago === 'Transferencia Bancaria' && (
                <div className="order-section">
                    <h3>Información para Transferencia</h3>
                    <div className="order-detail">
                        <div className="alias-row">
                            <div>
                                <strong>Alias MP:</strong>
                                <span> cambacuavet.mp</span>
                            </div>
                            <button
                                onClick={copyAlias}
                                className={`copy-alias-button ${aliasCopied ? 'copied' : ''}`}
                            >
                                {aliasCopied ? '✓ Copiado' : 'Copiar'}
                            </button>
                        </div>
                    </div>


                    <div className="order-detail">
                        <strong>Nombre:</strong>
                        <span>Maria Celeste Guanziroli Stefani</span>
                    </div>
                </div>
            )}
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
                <a
                    href={`https://wa.me/543795048310?text=${generarMensajeWhatsApp(order)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-button whatsapp"
                >
                    Ir a WhatsApp para Enviar Comprobante
                </a>

            </div>
        </div>
    );
};

export default OrderSummary;
