import React, { useState } from 'react';
import { useCarrito } from '../../context/CarritoContext'; // Ajusta la ruta según tu estructura de carpetas


const Item = ({ producto, notify }) => {
    const { agregarAlCarrito } = useCarrito();
    const [cantidad, setCantidad] = useState(1);

    const handleAddToCart = () => {
        agregarAlCarrito(producto, cantidad);
    };

    return (
        <div key={producto.id} className='product-card'>
            <img className="product-image" src={producto.imagen} alt={producto.nombre} />
            <h3 className="product-name">{producto.nombre}</h3>
            <p className='product-category'>{producto.categoria}</p>
            <strong className="product-price">${producto.precio}</strong>
            <div className="quantity-control">
                <button onClick={() => setCantidad(cantidad > 1 ? cantidad - 1 : 1)}>-</button>
                <input
                    type="number"
                    value={cantidad}
                    onChange={(e) => setCantidad(Number(e.target.value))}
                    min="1"
                />
                <button onClick={() => setCantidad(cantidad + 1)}>+</button>
            </div>
            <button className="add-to-cart-button" onClick={() => { handleAddToCart(); notify();}}>Agregar al carrito</button>
        </div>
    );
};

export default Item;
