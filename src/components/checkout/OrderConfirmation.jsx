/*
  File: OrderConfirmation.jsx
  Description: Confirms and submits the final order.
  Status: FEATURE UPDATED. Points system is now a toggle (all or nothing)
          instead of a manual input, simplifying the user experience.
*/
import React, { useState, useEffect } from 'react';
import { collection, addDoc, Timestamp, writeBatch, doc, getDoc, increment } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Swal from 'sweetalert2';
import { useCarrito } from '../../context/CarritoContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DeliveryCostCalculator from '../utils/DeliveryCostCalculator';
import { isStoreOpen } from '../utils/isStoreOpen';
import { FaGift } from 'react-icons/fa';

const OrderConfirmation = ({ formData, paymentMethod, deliveryCost, setDeliveryCost, onBack }) => {
    const { carrito, vaciarCarrito } = useCarrito();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [productosInfo, setProductosInfo] = useState({});
    
    // State for points system
    const [userScore, setUserScore] = useState(0);
    const [applyPoints, setApplyPoints] = useState(false); // Replaces pointsToUse and discount

    const productsTotal = carrito.reduce((acc, item) => {
        const itemKey = item.id + (item.variationId || '');
        const info = productosInfo[itemKey] || {};
        const price = item.price ?? info.price ?? 0;
        return acc + (price * item.quantity);
    }, 0);

    // Fetch user points
    useEffect(() => {
        const fetchUserScore = async () => {
            if (currentUser) {
                const userRef = doc(db, 'users', currentUser.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setUserScore(userSnap.data().score || 0);
                }
            }
        };
        fetchUserScore();
    }, [currentUser]);

    useEffect(() => {
        const fetchMissingDetails = async () => {
            const newInfo = {};
            let needsUpdate = false;

            for (const item of carrito) {
                const itemKey = item.id + (item.variationId || '');
                if (!item.price || !item.name || !item.imageUrl) {
                    const productRef = doc(db, 'productos', item.id);
                    const productSnap = await getDoc(productRef);
                    if (productSnap.exists()) {
                        const productData = productSnap.data();
                        const fetchedDetails = {};
                        if (productData.hasVariations && item.variationId) {
                            const variation = productData.variationsList.find(v => v.id === item.variationId);
                            if (variation) {
                                fetchedDetails.price = variation.precio;
                                fetchedDetails.name = productData.nombre;
                                fetchedDetails.imageUrl = variation.imagen || productData.imagen;
                                fetchedDetails.attributes = variation.attributes;
                            }
                        } else {
                            fetchedDetails.price = productData.precio;
                            fetchedDetails.name = productData.nombre;
                            fetchedDetails.imageUrl = productData.imagen;
                        }
                        if (Object.keys(fetchedDetails).length > 0) {
                            newInfo[itemKey] = fetchedDetails;
                            needsUpdate = true;
                        }
                    }
                }
            }
            if (needsUpdate) {
                setProductosInfo(prev => ({ ...prev, ...newInfo }));
            }
        };
        if (carrito.length > 0) {
            fetchMissingDetails();
        }
    }, [carrito]);

    // Simplified discount calculation
    const maxDiscount = Math.min(userScore, productsTotal);
    const discountAmount = applyPoints ? maxDiscount : 0;
    const finalTotal = productsTotal - discountAmount;

    const proceedWithOrder = async (isScheduled = false) => {
        setIsSubmitting(true);
        const batch = writeBatch(db);
        let stockInsuficiente = false;

        const finalCarrito = carrito.map(item => {
            const itemKey = item.id + (item.variationId || '');
            const info = productosInfo[itemKey] || {};
            return {
                id: item.id, quantity: item.quantity, hasVariations: item.hasVariations ?? false,
                variationId: item.variationId || null, name: item.name ?? info.name ?? 'Nombre no disponible',
                price: item.price ?? info.price ?? 0, imageUrl: item.imageUrl ?? info.imageUrl ?? null,
                attributes: item.attributes ?? info.attributes ?? null, stock: item.stock ?? 0,
            };
        });

        try {
            for (const item of finalCarrito) {
                const productoRef = doc(db, 'productos', item.id);
                const productoSnap = await getDoc(productoRef);
                if (productoSnap.exists()) {
                    const productData = productoSnap.data();
                    let currentStock = 0;
                    if (productData.hasVariations === true && productData.variationsList) {
                        const variation = productData.variationsList.find(v => v.id === item.variationId);
                        if (variation) { currentStock = variation.stock || 0; } 
                        else { stockInsuficiente = true; throw new Error("Variation not found"); }
                    } else {
                        currentStock = productData.stock || 0;
                    }
                    if (item.quantity > currentStock) {
                        stockInsuficiente = true;
                        Swal.fire('Stock insuficiente', `No hay suficiente stock para ${item.name}. Solo quedan ${currentStock} unidades.`, 'error');
                        throw new Error("Insufficient stock");
                    }
                    if (productData.hasVariations === true && productData.variationsList) {
                        const newVariationsList = productData.variationsList.map(v => v.id === item.variationId ? { ...v, stock: v.stock - item.quantity } : v);
                        batch.update(productoRef, { variationsList: newVariationsList });
                    } else {
                        batch.update(productoRef, { stock: currentStock - item.quantity });
                    }
                } else {
                    stockInsuficiente = true;
                    Swal.fire('Producto no encontrado', `El producto ${item.name} ya no está disponible.`, 'error');
                    throw new Error("Product not found");
                }
            }

            const pedido = {
                userId: currentUser.uid, email: currentUser.email, ...formData,
                productos: finalCarrito, total: productsTotal,
                puntosDescontados: discountAmount, totalConDescuento: finalTotal,
                costoEnvio: deliveryCost, fecha: Timestamp.now(),
                estado: isScheduled ? 'Programado' : 'Pendiente',
                metodoPago: paymentMethod, programado: isScheduled,
            };
            
            if (discountAmount > 0) {
                const userRef = doc(db, 'users', currentUser.uid);
                batch.update(userRef, { score: increment(-discountAmount) });
            }

            const docRef = await addDoc(collection(db, 'pedidos'), pedido);
            await batch.commit();
            vaciarCarrito();
            await Swal.fire({ title: "¡Pedido Confirmado!", text: `Tu pedido #${docRef.id} ha sido registrado.`, icon: "success", timer: 2500, showConfirmButton: false });
            navigate(`/order-summary/${docRef.id}`);

        } catch (error) {
            console.error("Error confirming order:", error);
            if (!stockInsuficiente) {
                 Swal.fire("Error", "Ocurrió un problema al procesar tu pedido. Revisa la consola para más detalles.", "error");
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleConfirmOrder = async () => {
        if (carrito.length === 0) {
            Swal.fire('Carrito Vacío', 'No hay productos en tu carrito para confirmar el pedido.', 'info');
            return;
        }
        if (deliveryCost === 0 && formData.direccion) {
            Swal.fire('Costo de Envío', 'Por favor, calcula el costo de envío antes de continuar.', 'info');
            return;
        }
        if (isSubmitting || !currentUser) return;

        if (isStoreOpen()) {
            proceedWithOrder(false);
        } else {
            let confirmationHtml = `
                <p>Nuestro horario de atención ha finalizado.</p>
                <p>Tu pedido será preparado y enviado el próximo día hábil.</p>
                <div style="margin: 1.5em 0; padding: 0.5em; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">
                    <strong>Nuestros Horarios:</strong><br>
                    Lunes a Viernes: 9:00-12:30 y 17:00-21:00<br>
                    Sábados: 9:00-13:00
                </div>
            `;

            if (paymentMethod === 'Transferencia Bancaria') {
                confirmationHtml += `
                    <p><strong>Ya puedes realizar la transferencia</strong> para asegurar tu pedido. Lo prepararemos en cuanto abramos.</p>
                `;
            }

            const result = await Swal.fire({
                title: 'Pedido Fuera de Horario',
                html: confirmationHtml,
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Entendido, Confirmar Pedido',
                cancelButtonText: 'Cancelar',
            });

            if (result.isConfirmed) {
                proceedWithOrder(true);
            }
        }
    };

    return (
        <div className="order-confirmation-container">
            <h2>Confirmar Pedido</h2>
            <div className="order-summary-details">
                <h3>Resumen de Productos</h3>
                <div className="checkout-items">
                    {carrito.map(item => {
                        const itemKey = item.id + (item.variationId || '');
                        const info = productosInfo[itemKey] || {};
                        const price = item.price ?? info.price ?? 0;
                        const name = item.name ?? info.name ?? 'Cargando...';
                        const imageUrl = item.imageUrl ?? info.imageUrl ?? 'https://placehold.co/100x100/eee/ccc?text=...';
                        const attributes = item.attributes ?? info.attributes ?? {};
                        return (
                            <div key={itemKey} className="checkout-item">
                                <div className="product-details">
                                    <img src={imageUrl} alt={name} />
                                    <div className="product-info">
                                        <h3>{name}</h3>
                                        {item.hasVariations && attributes && Object.keys(attributes).length > 0 && (<p className="item-variation-attrs">{Object.entries(attributes).map(([key, value]) => `${key}: ${value}`).join(' | ')}</p>)}
                                        <p>Cant: {item.quantity}</p>
                                    </div>
                                </div>
                                <div className="product-price">${(price * item.quantity).toLocaleString('es-AR')}</div>
                            </div>
                        );
                    })}
                </div>

                <div className="points-discount-section">
                    <h4><FaGift /> Tienes {userScore} Puntos</h4>
                    {userScore > 0 && (
                        <>
                            <p>Puedes usar tus puntos para obtener un descuento de hasta ${maxDiscount.toLocaleString('es-ar')}.</p>
                            <button 
                                onClick={() => setApplyPoints(!applyPoints)} 
                                className={`points-toggle-button ${applyPoints ? 'active' : ''}`}
                            >
                                {applyPoints ? 'Quitar Descuento' : 'Usar Puntos'}
                            </button>
                        </>
                    )}
                </div>

                <div className="order-total-summary">
                    <div className="total-row">
                        <span>Subtotal:</span>
                        <span>${productsTotal.toLocaleString('es-ar')}</span>
                    </div>
                    {discountAmount > 0 && (
                        <div className="total-row discount">
                            <span>Descuento por Puntos:</span>
                            <span>-${discountAmount.toLocaleString('es-ar')}</span>
                        </div>
                    )}
                    <div className="total-row grand-total">
                        <span>Total de Productos:</span>
                        <span>${finalTotal.toLocaleString('es-ar')}</span>
                    </div>
                    <p className="payment-method-notice">A pagar por {paymentMethod}.</p>
                </div>
                
                {carrito.length > 0 && (
                     <DeliveryCostCalculator 
                        address={formData.direccion}
                        placeId={formData.placeId}
                        onCostCalculated={setDeliveryCost}
                    />
                )}
               
                {deliveryCost > 0 && (
                    <div className="delivery-cost-final-notice">
                        <p>El costo del envío de <strong>${deliveryCost.toLocaleString('es-AR')}</strong> se abona en efectivo o transferencia directamente al repartidor al momento de la entrega.</p>
                    </div>
                )}

                <h3>Datos de Entrega</h3>
                <p><strong>Nombre:</strong> {formData.nombre}</p>
                <p><strong>Dirección:</strong> {formData.direccion}</p>
                {formData.indicaciones && <p><strong>Indicaciones:</strong> {formData.indicaciones}</p>}
                <p><strong>Email:</strong> {currentUser?.email}</p>
                <p><strong>Teléfono:</strong> {formData.telefono}</p>
            </div>
            
            <div className="info-banner info-banner-email">
                Te mantendremos informado sobre cada paso de tu pedido a través de tu correo electrónico.
            </div>

            <div className="payment-buttons">
                <button onClick={onBack} className="checkout-button secondary" disabled={isSubmitting}>
                    Volver
                </button>
                <button onClick={handleConfirmOrder} className={`checkout-button ${isSubmitting ? 'loading' : ''}`} disabled={isSubmitting || !currentUser}>
                    {isSubmitting ? <span className="button-loader"></span> : "Confirmar Pedido"}
                </button>
            </div>
        </div>
    );
};

export default OrderConfirmation;
