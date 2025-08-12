/*
  File: OrderSummary.jsx
  Description: Displays the summary of a completed order.
  Status: CRITICAL FIX APPLIED. Users can now cancel orders with the
          status 'Programado' (Scheduled).
*/
import React, { useEffect, useState } from 'react';
import { doc, getDoc, writeBatch, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaEllipsisV } from 'react-icons/fa';
import Swal from 'sweetalert2';

const OrderSummary = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();
    const [aliasCopied, setAliasCopied] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const copyAlias = () => {
        navigator.clipboard.writeText("cambacuavet.mp");
        setAliasCopied(true);
        setTimeout(() => setAliasCopied(false), 2000);
    };

    const generarMensajeWhatsApp = (order) => {
        const resumenURL = `https://www.cambacuavetshop.com.ar/order-summary/${order.id}`;
        let mensaje = `*📦 Pedido Nº ${order.id}*\n\n`;
        mensaje += `¡Hola! Confirmo mi pedido.\n\n`;
        mensaje += `*Total Productos:* $${order.total.toLocaleString('es-AR')}\n`;
        if (order.costoEnvio > 0) {
            mensaje += `*Costo de Envío:* $${order.costoEnvio.toLocaleString('es-AR')} (Se abona al repartidor)\n`;
        }
        mensaje += `*Método de Pago (Productos):* ${order.metodoPago}\n\n`;
        mensaje += `*Mis Datos:*\n`;
        mensaje += `Nombre: ${order.nombre}\n`;
        mensaje += `Dirección: ${order.direccion}\n`;
        if (order.indicaciones) mensaje += `Indicaciones: ${order.indicaciones}\n\n`;
        mensaje += `*Resumen del Pedido en la web:*\n${resumenURL}\n\n`;
        mensaje += `Adjunto mi comprobante de pago:`;

        return encodeURIComponent(mensaje);
    };

    const handleCancelOrder = async () => {
        setMenuOpen(false);

        // CORRECTED: Allow cancellation for 'Programado' status
        const cancellableStatuses = ['Pendiente', 'Pagado', 'Programado'];
        if (!cancellableStatuses.includes(order.estado)) {
            Swal.fire('No se puede cancelar', 'Este pedido ya ha sido procesado o cancelado.', 'info');
            return;
        }

        const result = await Swal.fire({
            title: '¿Estás seguro de que quieres cancelar?',
            html: `<p>Esta acción no se puede deshacer. Los productos del pedido serán devueltos al stock.</p><p>Recibirás una notificación por correo sobre el estado de tu cancelación.</p>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, cancelar el pedido',
            cancelButtonText: 'No, conservar mi pedido',
            reverseButtons: true
        });

        if (!result.isConfirmed) return;

        const { value: reason } = await Swal.fire({
            title: 'Motivo de la cancelación',
            input: 'textarea',
            inputLabel: 'Tu opinión nos ayuda a mejorar. ¿Por qué cancelas tu pedido?',
            inputPlaceholder: 'Ej: Me equivoqué de producto, ya no lo necesito...',
            showCancelButton: true,
            confirmButtonText: 'Confirmar cancelación',
            cancelButtonText: 'Volver atrás',
            inputValidator: (value) => {
                if (!value) {
                    return '¡Es necesario que escribas un motivo para continuar!';
                }
            }
        });

        if (reason) {
            Swal.fire({
                title: 'Procesando cancelación...',
                text: 'Por favor, espera un momento.',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            try {
                const batch = writeBatch(db);
                const originalOrderRef = doc(db, 'pedidos', orderId);
                const originalOrderSnap = await getDoc(originalOrderRef);

                if (!originalOrderSnap.exists()) {
                    throw new Error("El pedido ya no se encuentra en la lista de pendientes. Puede que ya haya sido procesado por un administrador.");
                }

                for (const item of order.productos) {
                    const productRef = doc(db, 'productos', item.id);
                    const productSnap = await getDoc(productRef);

                    if (productSnap.exists()) {
                        const productData = productSnap.data();
                        if (productData.hasVariations === true && item.variationId && productData.variationsList) {
                            const newVariationsList = productData.variationsList.map(v =>
                                v.id === item.variationId ? { ...v, stock: (v.stock || 0) + item.quantity } : v
                            );
                            batch.update(productRef, { variationsList: newVariationsList });
                        } else {
                            batch.update(productRef, { stock: (productData.stock || 0) + item.quantity });
                        }
                    }
                }

                const cancelledOrderRef = doc(db, 'pedidos_completados', orderId);
                const orderDataToCancel = originalOrderSnap.data();
                const cancelledOrderData = {
                    ...orderDataToCancel,
                    estado: 'Cancelado',
                    canceladoPor: 'cliente',
                    motivoCancelacion: reason,
                    fechaCancelacion: new Date()
                };

                batch.set(cancelledOrderRef, cancelledOrderData);
                batch.delete(originalOrderRef);

                await batch.commit();

                Swal.fire('¡Pedido Cancelado!', 'Tu pedido ha sido cancelado con éxito. El stock ha sido restaurado.', 'success');
                setOrder(prev => ({ ...prev, estado: 'Cancelado', motivoCancelacion: reason }));

            } catch (error) {
                console.error("Error al cancelar el pedido:", error);
                Swal.fire('Error', `Hubo un problema al cancelar tu pedido: ${error.message}`, 'error');
            }
        }
    };

    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true);
            try {
                const docRefs = [
                    doc(db, 'pedidos', orderId),
                    doc(db, 'pedidos_completados', orderId),
                ];

                let orderData = null;
                for (const ref of docRefs) {
                    const docSnap = await getDoc(ref);
                    if (docSnap.exists()) {
                        orderData = { id: docSnap.id, ...docSnap.data() };
                        break;
                    }
                }

                if (orderData) {
                    setOrder({
                        ...orderData,
                        fecha: new Date(orderData.fecha.seconds * 1000).toLocaleDateString('es-ES', {
                            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        }),
                    });
                } else {
                    setOrder(null);
                }
            } catch (error) {
                console.error("Error fetching order:", error);
            } finally {
                setLoading(false);
            }
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
                <button onClick={() => navigate('/')} className="back-button">
                    Volver al inicio
                </button>
            </div>
        );
    }

    // CORRECTED: Allow cancellation for 'Programado' status
    const canCancel = order && ['Pendiente', 'Pagado', 'Programado'].includes(order.estado);

    return (
        <div className="order-summary-container">
            <div className="summary-actions-header">
                <button onClick={() => navigate(-1)} className="summary-back-button">
                    <FaArrowLeft /> Volver
                </button>
                {canCancel && (
                    <div className="order-options-menu">
                        <button onClick={() => setMenuOpen(!menuOpen)} className="options-button">
                            <FaEllipsisV />
                        </button>
                        {menuOpen && (
                            <div className="options-dropdown">
                                <button onClick={handleCancelOrder} className="cancel-button">
                                    Cancelar Pedido
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="order-header">
                <h2>Resumen de tu Pedido</h2>
                <div className="order-id-section">
                    <p>Número: <strong>{order.id}</strong></p>
                    <button onClick={copyOrderId} className={`copy-button ${copied ? 'copied' : ''}`}>
                        {copied ? '✓ Copiado!' : 'Copiar Código'}
                    </button>
                </div>
            </div>

            <div className="info-banner info-banner-info">
                Puedes copiar este código y en la sección de "Mis Compras", usarlo para buscar tu pedido y ver su estado.
            </div>

            <div className="order-status">
                <span className={`status-badge ${order.estado?.toLowerCase()}`}>
                    {order.estado}
                </span>
            </div>

            {order.motivoCancelacion && (
                 <div className="order-section">
                    <h3>Motivo de Cancelación</h3>
                    <div className="order-detail">
                       <span>{order.motivoCancelacion}</span>
                    </div>
                </div>
            )}

            <div className="order-section">
                <h3>Detalles del Pedido</h3>
                <div className="order-detail">
                    <strong>Fecha:</strong>
                    <span>{order.fecha}</span>
                </div>
                <div className="order-detail">
                    <strong>Total Productos:</strong>
                    <span>${order.total.toLocaleString('es-AR')}</span>
                </div>
                {order.costoEnvio > 0 && (
                     <div className="order-detail">
                        <strong>Costo Envío:</strong>
                        <span>${order.costoEnvio.toLocaleString('es-AR')}</span>
                    </div>
                )}
                <div className="order-detail">
                    <strong>Método de Pago:</strong>
                    <span>{order.metodoPago}</span>
                </div>
            </div>
            
             {order.costoEnvio > 0 && (
                <div className="delivery-cost-final-notice">
                    <p>El costo del envío se abona en efectivo o transferencia directamente al repartidor al momento de la entrega.</p>
                </div>
            )}

            <div className="order-section">
                <h3>Productos</h3>
                <div className="order-products">
                    {order.productos.map((item, index) => (
                        <div key={item.id + (item.variationId || '')} className="product-item">
                            <img src={item.imageUrl} alt={item.name} className="product-image"/>
                            <div className="product-info">
                                <h4>{item.name}</h4>
                                {item.hasVariations && item.attributes && (
                                    <p className="product-variation-attrs">
                                        {Object.entries(item.attributes).map(([key, value]) => `${key}: ${value}`).join(' | ')}
                                    </p>
                                )}
                                <div className="product-meta">
                                    <span>${item.price?.toFixed(2)} c/u</span>
                                    <span>Cant: {item.quantity}</span>
                                </div>
                            </div>
                            <div className="product-subtotal">
                                ${(item.price * item.quantity)?.toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {order.metodoPago === 'Transferencia Bancaria' && order.estado !== 'Cancelado' && (
                <div className="order-section">
                    <h3>Información para Transferencia</h3>
                    <div className="order-detail">
                        <div className="alias-row">
                            <div>
                                <strong>Alias MP:</strong>
                                <span> cambacuavet.mp</span>
                            </div>
                            <button onClick={copyAlias} className={`copy-alias-button ${aliasCopied ? 'copied' : ''}`}>
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
                 {order.indicaciones && (
                    <div className="order-detail">
                        <strong>Indicaciones:</strong>
                        <span>{order.indicaciones}</span>
                    </div>
                )}
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
                {order.estado !== 'Cancelado' && (
                     <a href={`https://wa.me/543795048310?text=${generarMensajeWhatsApp(order)}`} target="_blank" rel="noopener noreferrer" className="action-button whatsapp">
                        Ir a WhatsApp para Enviar Comprobante
                    </a>
                )}
            </div>
        </div>
    );
};

export default OrderSummary;
