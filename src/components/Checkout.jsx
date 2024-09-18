import React, { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { CarritoProvider, useCarrito } from '../context/CarritoContext';
import Swal from 'sweetalert2'

const Checkout = () => {
    const { carrito, calcularTotal } = useCarrito(CarritoProvider);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const pedido = {
                ...formData,
                productos: carrito,
                total: calcularTotal(),
                fecha: Timestamp.now(),
            };

            await addDoc(collection(db, 'pedidos'), pedido);


            Swal.fire({
                title: "Pedido Enviado con Exito!",
                text: "Lo enviaremos a la brevedad, muchas gracias!",
                icon: "success",
                confirmButtonColor: '#0b369c',
            });
        } catch (error) {
            console.error("Error al enviar el pedido: ", error);
            Swal.fire({
                title: "Pedido no ha sido enviado",
                text: "intente nuevamente",
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
}

export default Checkout;
