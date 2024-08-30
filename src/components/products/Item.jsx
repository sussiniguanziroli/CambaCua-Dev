import React, { useEffect, useRef, useState } from 'react';
import Flickity from 'flickity';
import 'flickity/css/flickity.css'; // Importa los estilos de Flickity
import { useCarrito } from '../../context/CarritoContext'; // Ajusta la ruta según tu estructura de carpetas

const Item = ({ producto, notify, handleOpenModal }) => {
    const { agregarAlCarrito } = useCarrito();
    const [cantidad, setCantidad] = useState(1);
    const flickityRef = useRef(null);

    useEffect(() => {
        if (flickityRef.current) {
            new Flickity(flickityRef.current, {
                cellAlign: 'left',
                contain: true,
                pageDots: false,
                prevNextButtons: true,
            });
        }
    }, []);

    const handleAddToCart = () => {
        agregarAlCarrito(producto, cantidad);
    };

    return (
        <div key={producto.id} className='product-card' >
            <div className="carousel" ref={flickityRef}>
                {[producto.imagen, producto.imagenB, producto.imagenC].filter(Boolean).map((img, index) => (
                    <div key={index} className="carousel-cell">
                        <img className="product-image" src={img} alt={`${producto.nombre} - Imagen ${index + 1}`} />
                    </div>
                ))}
            </div>
            <div>
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
                <button className="add-to-cart-button" onClick={() => { handleAddToCart(); notify(); }}>Agregar al carrito</button>
            </div>
        </div>
    );
};

export default Item;
