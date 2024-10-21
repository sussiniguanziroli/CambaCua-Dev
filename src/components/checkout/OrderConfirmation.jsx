import React from 'react';
import { collection, addDoc, Timestamp, writeBatch, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Swal from 'sweetalert2';
import { useCarrito } from '../../context/CarritoContext';

const OrderConfirmation = ({ formData, paymentMethod }) => {

    const { carrito, calcularTotal, vaciarCarrito } = useCarrito();

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
        const stockDisponible = await verificarYActualizarStock();

        if (!stockDisponible) {
            Swal.fire({
                title: "Stock insuficiente",
                text: "Lo sentimos, no hay suficiente stock para uno o más productos en tu carrito.",
                icon: "error"
            });
            return;
        }

        try {
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

            Swal.fire({
                title: "Pedido Enviado con Éxito!",
                text: `Tu número de pedido es: ${docRef.id}. Gracias por tu compra!`,
                icon: "success"
            });
        } catch (error) {
            Swal.fire({
                title: "Error",
                text: "Ocurrió un problema al procesar tu pedido.",
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
            <p>Método de Pago: {paymentMethod}</p>
            <p>Total: ${calcularTotal()}</p>

            <button onClick={handleConfirmOrder} className="checkout-button">Confirmar Pedido</button>
        </div>
    );
};

export default OrderConfirmation;
