// src/components/Carrito.jsx
import React from 'react';
import { useCarrito } from '../context/CarritoContext';

const Carrito = () => {
    const { carrito, eliminarDelCarrito, actualizarCantidad, vaciarCarrito } = useCarrito();

    const handleCantidadChange = (id, e) => {
        const cantidad = parseInt(e.target.value, 10);
        if (cantidad >= 0) {
            actualizarCantidad(id, cantidad);
        }
    };

    return (
        <div className="carrito">
            <h1>Carrito de Compras</h1>
            {carrito.length === 0 ? (
                <p>El carrito está vacío</p>
            ) : (
                <div>
                    {carrito.map(item => (
                        <div key={item.id} className="carrito-item">
                            <h2>{item.nombre}</h2>
                            <p>Precio: ${item.precio}</p>
                            <input
                                type="number"
                                value={item.cantidad}
                                onChange={(e) => handleCantidadChange(item.id, e)}
                            />
                            <p>Total: ${item.precio * item.cantidad}</p>
                            <button onClick={() => eliminarDelCarrito(item.id)}>Eliminar</button>
                        </div>
                    ))}
                    <button onClick={vaciarCarrito}>Vaciar Carrito</button>
                </div>
            )}
        </div>
    );
};

export default Carrito;
