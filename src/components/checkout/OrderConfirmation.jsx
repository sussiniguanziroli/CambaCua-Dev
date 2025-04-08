import React, { useState, useEffect } from 'react';
import { collection, addDoc, Timestamp, writeBatch, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Swal from 'sweetalert2';
import { useCarrito } from '../../context/CarritoContext';
import { useNavigate } from 'react-router-dom';

const OrderConfirmation = ({ formData, paymentMethod }) => {
    const { carrito, calcularTotal, vaciarCarrito } = useCarrito();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (paymentMethod === 'Transferencia Bancaria') {
            Swal.fire({
                title: 'Pago por Transferencia',
                text: 'Al confirmar el pedido se te brindarán los datos bancarios para realizar la transferencia.',
                icon: 'info',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#3085d6'
            });
        }
    }, [paymentMethod]);

    const verificarYActualizarStock = async () => {
        const batch = writeBatch(db);
        let stockDisponible = true;

        for (const item of carrito) {
            const productoRef = doc(db, 'productos', item.id);
            const productoSnap = await getDoc(productoRef);

            if (productoSnap.exists()) {
                const productoData = productoSnap.data();
                const stockActual = productoData.stock;

                if (item.cantidad > stockActual) {
                    stockDisponible = false;
                    break;
                } else {
                    batch.update(productoRef, {
                        stock: stockActual - item.cantidad
                    });
                }
            } else {
                stockDisponible = false;
                break;
            }
        }

        if (stockDisponible) {
            await batch.commit();
        }

        return stockDisponible;
    };

    const handleConfirmOrder = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const stockDisponible = await verificarYActualizarStock();

            if (!stockDisponible) {
                setIsSubmitting(false);
                Swal.fire({
                    title: "Stock insuficiente",
                    text: "Lo sentimos, no hay suficiente stock para uno o más productos en tu carrito.",
                    icon: "error"
                });
                return;
            }

            const pedido = {
                ...formData,
                productos: carrito,
                total: calcularTotal(),
                fecha: Timestamp.now(),
                estado: 'Pendiente',
                metodoPago: paymentMethod
            };

            const docRef = await addDoc(collection(db, 'pedidos'), pedido);
            vaciarCarrito();

            await Swal.fire({
                title: "¡Pedido Confirmado!",
                text: `Tu pedido #${docRef.id} ha sido registrado correctamente`,
                icon: "success",
                timer: 2000,
                showConfirmButton: false
            });

            navigate(`/order-summary/${docRef.id}`);

        } catch (error) {
            console.error("Error en handleConfirmOrder:", error);
            setIsSubmitting(false);
            Swal.fire({
                title: "Error",
                text: "Ocurrió un problema al procesar tu pedido. Por favor intenta nuevamente.",
                icon: "error"
            });
        }
    };

    

    return (
        <div className="order-confirmation-container">
            <h2>Confirmar Pedido</h2>



            <section>
                <div className="checkout-items">
                    {carrito.map(item => (
                        <div key={item.id} className="checkout-item">
                            <div className="product-details">
                                <img src={item.imagen} alt={item.nombre} />
                                <div className="product-info">
                                    <h3>{item.nombre}</h3>
                                    <h6>Precio unitario: ${item.precio}</h6>
                                    <p>Cantidad: {item.cantidad}</p>
                                </div>
                            </div>
                            <div className="product-price">
                                ${item.precio * item.cantidad}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="checkout-total">
                    <h2>Total: ${calcularTotal()}</h2>
                    <h2>Datos de Envio:</h2>
                </div>
            </section>
            <p>Nombre: {formData.nombre}</p>
            <p>Dirección: {formData.direccion}</p>
            <p>Total: ${calcularTotal()}</p>

            {/* ⚠️ Cartel informativo sobre el costo del envío */}
            <div style={{
                backgroundColor: '#fff9e6',
                border: '1px solid #ffe58f',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '1.5rem',
                color: '#8c6d1f',
                fontSize: '1rem'
            }}>
                Envío desde <strong>$1500</strong> hasta <strong>$3000</strong> dependiendo de la zona.
            </div>

            {paymentMethod === 'Transferencia Bancaria' && (
                <div style={{
                    backgroundColor: '#e6f7ff',
                    border: '1px solid #91d5ff',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem',
                    color: '#0050b3',
                    fontSize: '1rem'
                }}>
                    Al confirmar el pedido, se te brindarán los datos bancarios para realizar la transferencia.
                </div>
            )}

            <div className="payment-buttons">
                <button
                    onClick={() => navigate(-1)}
                    className="checkout-button"
                    disabled={isSubmitting}
                >
                    Volver
                </button>

                <button
                    onClick={handleConfirmOrder}
                    className={`checkout-button ${isSubmitting ? 'loading' : ''}`}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <span className="button-loader"></span>
                    ) : (
                        "Confirmar Pedido"
                    )}
                </button>
            </div>

            
        </div>
    );
};

export default OrderConfirmation;
