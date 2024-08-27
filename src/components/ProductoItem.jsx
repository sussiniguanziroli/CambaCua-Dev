// src/components/ProductoItem.jsx
import React from 'react';
import { useCarrito } from '../context/CarritoContext';

const ProductoItem = ({ producto }) => {
    const { agregarAlCarrito } = useCarrito();

    const handleAddToCart = () => {
        agregarAlCarrito(producto, 1);
    };

    return (
        <div className="producto-item">
            <h2>{producto.nombre}</h2>
            <p>Precio: ${producto.precio}</p>
            <button onClick={handleAddToCart}>Agregar al Carrito</button>
        </div>
    );
};

export default ProductoItem;
