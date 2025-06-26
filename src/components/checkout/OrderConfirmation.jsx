import React, { useState, useEffect } from 'react';
import { collection, addDoc, Timestamp, writeBatch, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Swal from 'sweetalert2';
import { useCarrito } from '../../context/CarritoContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DeliveryCostCalculator from '../utils/DeliveryCostCalculator';

const OrderConfirmation = ({ formData, paymentMethod, deliveryCost, setDeliveryCost }) => {
    const { carrito, calcularTotal, vaciarCarrito } = useCarrito();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const productsTotal = calcularTotal();

    useEffect(() => {
        if (!currentUser) {
            Swal.fire({
                title: 'Necesitas iniciar sesión',
                text: 'Para finalizar la compra, por favor inicia sesión o crea una cuenta.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Ir a Iniciar Sesión',
                cancelButtonText: 'Volver',
            }).then((result) => {
                if (result.isConfirmed) navigate('/auth');
                else navigate('/carrito');
            });
        }
    }, [currentUser, navigate]);

    const handleConfirmOrder = async () => {
        if (carrito.length > 0 && deliveryCost === 0) {
            Swal.fire('Costo de Envío', 'Por favor, calcula el costo de envío antes de continuar.', 'info');
            return;
        }
        if (isSubmitting || !currentUser) return;
        
        setIsSubmitting(true);
        
        const batch = writeBatch(db);
        let stockInsuficiente = false;

        // 1. Verify stock for all products
        for (const item of carrito) {
            const productoRef = doc(db, 'productos', item.id);
            try {
                const productoSnap = await getDoc(productoRef);
                if (productoSnap.exists()) {
                    const stockActual = productoSnap.data().stock;
                    if (item.cantidad > stockActual) {
                        stockInsuficiente = true;
                        Swal.fire('Stock insuficiente', `No hay suficiente stock para ${item.nombre}. Solo quedan ${stockActual} unidades.`, 'error');
                        break; 
                    }
                    // Prepare stock update
                    batch.update(productoRef, { stock: stockActual - item.cantidad });
                } else {
                    stockInsuficiente = true;
                    Swal.fire('Producto no encontrado', `El producto ${item.nombre} ya no está disponible.`, 'error');
                    break;
                }
            } catch (error) {
                console.error("Error verifying stock:", error);
                stockInsuficiente = true;
                Swal.fire('Error', 'No se pudo verificar el stock. Intenta de nuevo.', 'error');
                break;
            }
        }

        if (stockInsuficiente) {
            setIsSubmitting(false);
            return;
        }

        // 2. If stock is sufficient, create the order object
        const pedido = {
            userId: currentUser.uid,
            email: currentUser.email,
            ...formData,
            productos: carrito,
            total: productsTotal,
            costoEnvio: deliveryCost,
            fecha: Timestamp.now(),
            estado: 'Pendiente',
            metodoPago: paymentMethod,
        };

        try {
            // 3. Add the order to the 'pedidos' collection
            const docRef = await addDoc(collection(db, 'pedidos'), pedido);
            
            // 4. Commit the stock updates
            await batch.commit();

            // 5. Clear the cart
            vaciarCarrito();

            // 6. Show success message and navigate
            await Swal.fire({
                title: "¡Pedido Confirmado!",
                text: `Tu pedido #${docRef.id} ha sido registrado correctamente.`,
                icon: "success",
                timer: 2500,
                showConfirmButton: false,
            });

            navigate(`/order-summary/${docRef.id}`);

        } catch (error) {
            console.error("Error al confirmar el pedido:", error);
            setIsSubmitting(false);
            Swal.fire("Error", "Ocurrió un problema al procesar tu pedido. Por favor intenta nuevamente.", "error");
        }
    };

    return (
        <div className="order-confirmation-container">
            <h2>Confirmar Pedido</h2>
            <div className="order-summary-details">
                <h3>Resumen de Productos</h3>
                <div className="checkout-items">
                    {carrito.map(item => (
                        <div key={item.id} className="checkout-item">
                            <div className="product-details">
                                <img src={item.imagen} alt={item.nombre} />
                                <div className="product-info">
                                    <h3>{item.nombre}</h3>
                                    <p>Cant: {item.cantidad}</p>
                                </div>
                            </div>
                            <div className="product-price">${(item.precio * item.cantidad).toLocaleString('es-AR')}</div>
                        </div>
                    ))}
                </div>

                <div className="order-total-summary">
                    <div className="total-row grand-total">
                        <span>Total de Productos:</span>
                        <span>${productsTotal.toLocaleString('es-ar')}</span>
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
                <button onClick={() => navigate(-1)} className="checkout-button secondary" disabled={isSubmitting}>
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
