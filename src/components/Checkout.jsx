import React, { useState } from 'react';
import { useCarrito } from '../context/CarritoContext';
import { db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';

const Checkout = () => {
    const { carrito, calcularTotal, vaciarCarrito } = useCarrito();
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        email: '',
        direccion: '',
        dni: '',
    });
    const [mensaje, setMensaje] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (Object.values(formData).some(field => !field)) {
            setMensaje('Por favor, completa todos los campos.');
            return;
        }

        try {
            const docRef = await addDoc(collection(db, 'pedidos'), {
                ...formData,
                items: carrito,
                total: calcularTotal(),
                fecha: new Date(),
            });
            setMensaje(`¡Pedido realizado con éxito! ID del pedido: ${docRef.id}`);
            vaciarCarrito();
        } catch (error) {
            console.error('Error al crear el pedido:', error);
            setMensaje('Hubo un error al procesar tu pedido.');
        }
    };

    return (
        <div className="checkout-container">
            <h2>Resumen del Pedido</h2>
            <div className="checkout-items">
                {carrito.map((item) => (
                    <div key={item.id} className="checkout-item">
                        <span>{item.nombre}</span>
                        <span>{item.cantidad} x ${item.precio}</span>
                    </div>
                ))}
            </div>
            <div className="checkout-total">
                <h3>Total: ${calcularTotal()}</h3>
            </div>

            <form className="checkout-form" onSubmit={handleSubmit}>
                <h2>Datos de Entrega</h2>
                <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="telefono"
                    placeholder="Teléfono"
                    value={formData.telefono}
                    onChange={handleChange}
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="direccion"
                    placeholder="Dirección de entrega"
                    value={formData.direccion}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="dni"
                    placeholder="DNI"
                    value={formData.dni}
                    onChange={handleChange}
                />
                <button type="submit" className="checkout-button">Finalizar Compra</button>
            </form>

            {mensaje && <p className="checkout-message">{mensaje}</p>}
        </div>
    );
};

export default Checkout;
