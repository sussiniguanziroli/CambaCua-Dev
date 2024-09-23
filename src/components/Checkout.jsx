import React, { useState } from 'react';
import { collection, addDoc, doc, updateDoc, getDoc, Timestamp, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';
import { CarritoProvider, useCarrito } from '../context/CarritoContext';
import Swal from 'sweetalert2';

const Checkout = () => {
    const { carrito, calcularTotal, vaciarCarrito } = useCarrito(CarritoProvider);
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        email: '',
        direccion: '',
        dni: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Función para verificar y actualizar el stock
    const verificarYActualizarStock = async () => {
        const batch = writeBatch(db);  // Firestore batch for atomic updates
        let stockDisponible = true;

        for (const item of carrito) {
            const productoRef = doc(db, 'productos', item.id); // Referencia al producto en Firestore
            const productoSnap = await getDoc(productoRef);

            if (productoSnap.exists()) {
                const productoData = productoSnap.data();
                const stockActual = productoData.stock;

                // Verificar si hay stock suficiente
                if (item.cantidad > stockActual) {
                    stockDisponible = false;
                    break;
                } else {
                    // Actualizar el stock en la base de datos
                    batch.update(productoRef, {
                        stock: stockActual - item.cantidad
                    });
                }
            } else {
                stockDisponible = false;
                break;
            }
        }

        // Si hay stock suficiente para todos los productos, hacer commit del batch
        if (stockDisponible) {
            await batch.commit();
        }

        return stockDisponible;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Verificar stock antes de proceder
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
                estado: 'pendiente' // Estado inicial del pedido
            };

            // Guardar el pedido en la base de datos
            await addDoc(collection(db, 'pedidos'), pedido);

            Swal.fire({
                title: "Pedido Enviado con Éxito!",
                text: "Lo enviaremos a la brevedad, muchas gracias!",
                icon: "success",
                confirmButtonColor: '#0b369c',
            });

            // Vaciar el carrito después de la compra
            vaciarCarrito();
        } catch (error) {
            console.error("Error al enviar el pedido: ", error);
            Swal.fire({
                title: "Error",
                text: "Ocurrió un problema al procesar tu pedido. Intenta nuevamente.",
                icon: "error"
            });
        }
    };

    return (
        <div className="checkout-container">
            <h2>Checkout</h2>

            <div className="checkout-items">
                {carrito.map(item => (
                    <div key={item.id} className="checkout-item">
                        <div className="product-details">
                            <img src={item.imagen} alt={item.nombre} />
                            <div className="product-info">
                                <h3>{item.nombre}</h3>
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

            <form className="checkout-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                />
                <input
                    type="tel"
                    name="telefono"
                    placeholder="Teléfono"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                    title="Por favor, ingresa un correo electrónico válido, por ejemplo: usuario@dominio.com"
                />
                <input
                    type="text"
                    name="direccion"
                    placeholder="Dirección de entrega"
                    value={formData.direccion}
                    onChange={handleChange}
                    required
                />
                <input
                    type="number"
                    name="dni"
                    placeholder="DNI"
                    value={formData.dni}
                    onChange={handleChange}
                    required
                />

                <button type="submit" className="checkout-button">Confirmar Pedido</button>
            </form>

            <div className="checkout-message">
                Envios solo dentro de Corrientes Capital
            </div>
        </div>
    );
};

export default Checkout;
