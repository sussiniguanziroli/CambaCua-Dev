import React, { useEffect, useState } from 'react';
import { doc, getDoc, writeBatch, setDoc, deleteDoc, increment } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaEllipsisV, FaTags, FaGift, FaWhatsapp, FaHandshake } from 'react-icons/fa';
import Swal from 'sweetalert2';

const OrderSummary = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const [aliasCopied, setAliasCopied] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const getPromoDescription = (item) => {
        if (!item.promocion) return null;
        switch (item.promocion.type) {
            case 'percentage_discount': return `${item.promocion.value}% OFF`;
            case '2x1': return `Promo 2x1`;
            case 'second_unit_discount': return `${item.promocion.value}% en 2da unidad`;
            default: return "Promo";
        }
    };

    const handleCancelOrder = async () => {
        setMenuOpen(false);
        const cancellableStatuses = ['Pendiente', 'Pagado', 'Programado'];
        if (!cancellableStatuses.includes(order.estado)) {
            Swal.fire('No se puede cancelar', 'Este pedido ya ha sido procesado o cancelado.', 'info');
            return;
        }

        const result = await Swal.fire({
            title: '¿Estás seguro de que quieres cancelar?',
            html: `<p>Esta acción no se puede deshacer. Los productos del pedido serán devueltos al stock y se te reintegrarán los puntos usados.</p>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, cancelar el pedido',
            cancelButtonText: 'No, conservar mi pedido',
        });

        if (!result.isConfirmed) return;

        const { value: reason } = await Swal.fire({
            title: 'Motivo de la cancelación',
            input: 'textarea',
            inputLabel: 'Tu opinión nos ayuda a mejorar. ¿Por qué cancelas tu pedido?',
            inputPlaceholder: 'Ej: Me equivoqué de producto...',
            showCancelButton: true,
            confirmButtonText: 'Confirmar cancelación',
            cancelButtonText: 'Volver atrás',
            inputValidator: (value) => !value && '¡Es necesario que escribas un motivo!',
        });

        if (reason) {
            Swal.fire({ title: 'Procesando cancelación...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

            try {
                const batch = writeBatch(db);
                const originalOrderRef = doc(db, 'pedidos', orderId);
                const originalOrderSnap = await getDoc(originalOrderRef);

                if (!originalOrderSnap.exists()) throw new Error("El pedido ya no se encuentra en la lista de pendientes.");
                
                const orderDataToCancel = originalOrderSnap.data();

                if (orderDataToCancel.puntosDescontados > 0) {
                    const userRef = doc(db, 'users', orderDataToCancel.userId);
                    batch.update(userRef, { score: increment(orderDataToCancel.puntosDescontados) });
                }

                for (const item of orderDataToCancel.productos) {
                    const productRef = doc(db, 'productos', item.id);
                    const productSnap = await getDoc(productRef);
                    if (productSnap.exists()) {
                        const productData = productSnap.data();
                        if (productData.hasVariations && item.variationId) {
                            const newVariationsList = productData.variationsList.map(v => v.id === item.variationId ? { ...v, stock: (v.stock || 0) + item.quantity } : v);
                            batch.update(productRef, { variationsList: newVariationsList });
                        } else {
                            batch.update(productRef, { stock: increment(item.quantity) });
                        }
                    }
                }

                const cancelledOrderRef = doc(db, 'pedidos_completados', orderId);
                const cancelledOrderData = { ...orderDataToCancel, estado: 'Cancelado', canceladoPor: 'cliente', motivoCancelacion: reason, fechaCancelacion: new Date() };
                batch.set(cancelledOrderRef, cancelledOrderData);
                batch.delete(originalOrderRef);
                
                await batch.commit();
                
                Swal.fire('¡Pedido Cancelado!', 'Tu pedido ha sido cancelado.', 'success');
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
                const docRefs = [ doc(db, 'pedidos', orderId), doc(db, 'pedidos_completados', orderId) ];
                let orderData = null;
                for (const ref of docRefs) {
                    const docSnap = await getDoc(ref);
                    if (docSnap.exists()) {
                        orderData = { id: docSnap.id, ...docSnap.data() };
                        break;
                    }
                }
                setOrder(orderData ? {
                    ...orderData,
                    fecha: new Date(orderData.fecha.seconds * 1000).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                } : null);
            } catch (error) {
                console.error("Error fetching order:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    const copyToClipboard = (text, setCopiedState) => {
        navigator.clipboard.writeText(text);
        setCopiedState(true);
        setTimeout(() => setCopiedState(false), 2000);
    };

    const generarMensajeWhatsApp = (order) => {
        const resumenURL = `${window.location.origin}/order-summary/${order.id}`;
        let mensaje = `*📦 Pedido Nº ${order.id}*\n\n`;
        mensaje += `¡Confirmo el pedido!\n\n`;
        mensaje += `🔁 *Acceder nuevamente al resumen:*\n${resumenURL}\n\n`;
        mensaje += `💳 *Método de Pago:* ${order.metodoPago}\n`;
        mensaje += `💰 *Total a Pagar:* $${order.total.toFixed(2)}\n\n`;
        mensaje += `👤 *Datos del Cliente*\n`;
        mensaje += `📍 Nombre: ${order.nombre}\n`;
        mensaje += `🏠 Dirección: ${order.direccion}\n`;
        if (order.telefono) mensaje += `📞 Teléfono: ${order.telefono}\n`;
        if (order.email) mensaje += `📧 Email: ${order.email}\n\n`;
        mensaje += `🛒 *Productos*\n`;
        order.productos.forEach((item) => {
            mensaje += `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
        });
        mensaje += `\n📎 *Adjunto comprobante:*`;
        return encodeURIComponent(mensaje);
    };

    if (loading) { return <div className="order-summary-loading"><div className="css-loader"></div><h3>Cargando...</h3></div>; }
    if (!order) { return <div className="order-summary-error"><h2>Pedido no encontrado</h2><button onClick={() => navigate('/')}>Volver</button></div>; }

    const canCancel = ['Pendiente', 'Pagado', 'Programado'].includes(order.estado);

    return (
        <div className="order-summary-container">
            <div className="summary-actions-header">
                <button onClick={() => navigate(-1)} className="summary-back-button"><FaArrowLeft /> Volver</button>
                {canCancel && (
                    <div className="order-options-menu">
                        <button onClick={() => setMenuOpen(!menuOpen)} className="options-button"><FaEllipsisV /></button>
                        {menuOpen && ( <div className="options-dropdown"><button onClick={handleCancelOrder} className="cancel-button">Cancelar Pedido</button></div> )}
                    </div>
                )}
            </div>

            <div className="order-header">
                <h2>Resumen de tu Pedido</h2>
                <div className="order-id-section"><p>Número: <strong>{order.id}</strong></p><button onClick={() => copyToClipboard(orderId, setCopied)} className={`copy-button ${copied ? 'copied' : ''}`}>{copied ? '✓ Copiado!' : 'Copiar'}</button></div>
            </div>

            <div className="info-banner info-banner-info">Puedes usar este código en "Mis Compras" para ver el estado de tu pedido.</div>

            <div className="order-status"><span className={`status-badge ${order.estado?.toLowerCase()}`}>{order.estado}</span></div>

            {order.motivoCancelacion && (<div className="order-section"><h3>Motivo de Cancelación</h3><div className="order-detail"><span>{order.motivoCancelacion}</span></div></div>)}

            <div className="order-section">
                <h3>Detalles del Pedido</h3>
                <div className="order-detail"><strong>Fecha:</strong><span>{order.fecha}</span></div>
                <div className="order-detail"><strong>Subtotal:</strong><span>${order.subtotalBruto.toFixed(2)}</span></div>
                {order.descuentoPromociones > 0 && (<div className="order-detail promo-discount"><strong><FaTags /> Descuento Promociones:</strong><span>-${order.descuentoPromociones.toFixed(2)}</span></div>)}
                {order.descuentoConvenio > 0 && (<div className="order-detail convenio-discount"><strong><FaHandshake /> Descuento Convenio:</strong><span>-${order.descuentoConvenio.toFixed(2)}</span></div>)}
                {order.puntosDescontados > 0 && (<div className="order-detail points-discount"><strong><FaGift /> Descuento por Puntos:</strong><span>-${order.puntosDescontados.toFixed(2)}</span></div>)}
                <div className="order-detail grand-total"><strong>Total a Pagar:</strong><span>${order.total.toFixed(2)}</span></div>
                {order.costoEnvio > 0 && (<div className="order-detail"><strong>Costo Envío:</strong><span>${order.costoEnvio.toFixed(2)}</span></div>)}
                <div className="order-detail"><strong>Método de Pago:</strong><span>{order.metodoPago}</span></div>
            </div>
            
            {order.costoEnvio > 0 && (<div className="delivery-cost-final-notice"><p>El costo del envío se abona al repartidor.</p></div>)}

            <div className="order-section">
                <h3>Productos</h3>
                <div className="order-products">
                    {order.productos.map((item, index) => {
                        const promoDescription = getPromoDescription(item);
                        let discountedPrice = null;
                        let lineItemSubtotal = item.price * item.quantity;
                        
                        if (item.promocion) {
                            switch (item.promocion.type) {
                                case 'percentage_discount':
                                    discountedPrice = item.price * (1 - item.promocion.value / 100);
                                    lineItemSubtotal = discountedPrice * item.quantity;
                                    break;
                                case '2x1':
                                    const pairs2x1 = Math.floor(item.quantity / 2);
                                    lineItemSubtotal = (item.quantity - pairs2x1) * item.price;
                                    break;
                                case 'second_unit_discount':
                                    const pairs2ndUnit = Math.floor(item.quantity / 2);
                                    const discountAmount = pairs2ndUnit * item.price * (item.promocion.value / 100);
                                    lineItemSubtotal -= discountAmount;
                                    break;
                                default:
                                    break;
                            }
                        }

                        return (
                            <div key={`${item.id}-${item.variationId || index}`} className="product-item">
                                <img src={item.imageUrl} alt={item.name} className="product-image"/>
                                <div className="product-info">
                                    <h4>{item.name}</h4>
                                    {item.hasVariations && item.attributes && (<p className="product-variation-attrs">{Object.entries(item.attributes).map(([key, value]) => `${key}: ${value}`).join(' | ')}</p>)}
                                    {promoDescription && <span className="promo-badge-summary">{promoDescription}</span>}
                                    <div className="product-meta">
                                        {discountedPrice !== null ? (
                                            <span className="price-container">
                                                <span className="original-price-crossed">${item.price?.toFixed(2)}</span>
                                                <span className="final-price">${discountedPrice.toFixed(2)} c/u</span>
                                            </span>
                                        ) : (
                                            <span>${item.price?.toFixed(2)} c/u</span>
                                        )}
                                        <span>Cant: {item.quantity}</span>
                                    </div>
                                </div>
                                <div className="product-subtotal">${lineItemSubtotal.toFixed(2)}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {order.metodoPago === 'Transferencia Bancaria' && order.estado !== 'Cancelado' && (
                <div className="order-section">
                    <h3>Información para Transferencia</h3>
                    <div className="order-detail"><div className="alias-row"><div><strong>Alias MP:</strong><span> cambacuavet.mp</span></div><button onClick={() => copyToClipboard('cambacuavet.mp', setAliasCopied)} className={`copy-alias-button ${aliasCopied ? 'copied' : ''}`}>{aliasCopied ? '✓ Copiado' : 'Copiar'}</button></div></div>
                    <div className="order-detail"><strong>Nombre:</strong><span>Maria Celeste Guanziroli Stefani</span></div>
                </div>
            )}

            <div className="order-section">
                <h3>Datos de Envío</h3>
                <div className="order-detail"><strong>Nombre:</strong><span>{order.nombre}</span></div>
                <div className="order-detail"><strong>Dirección:</strong><span>{order.direccion}</span></div>
                {order.indicaciones && (<div className="order-detail"><strong>Indicaciones:</strong><span>{order.indicaciones}</span></div>)}
                {order.telefono && (<div className="order-detail"><strong>Teléfono:</strong><span>{order.telefono}</span></div>)}
                {order.email && (<div className="order-detail"><strong>Email:</strong><span>{order.email}</span></div>)}
            </div>

            <div className="order-actions">
                <button onClick={() => navigate('/miscompras')} className="action-button secondary">Ver mis compras</button>
                {order.metodoPago === 'Transferencia Bancaria' && order.estado !== 'Cancelado' && (
                    <a
                        href={`https://wa.me/543795048310?text=${generarMensajeWhatsApp(order)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-button whatsapp"
                    >
                        <FaWhatsapp /> Ir a WhatsApp para Enviar Comprobante
                    </a>
                )}
            </div>
        </div>
    );
};

export default OrderSummary;
