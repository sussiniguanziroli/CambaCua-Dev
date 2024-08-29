import React, { useEffect, useRef, useState } from 'react';
import Flickity from 'flickity';
import 'flickity/css/flickity.css'; // Importa los estilos de Flickity
import { useCarrito } from '../../context/CarritoContext'; // Ajusta la ruta según tu estructura de carpetas


const Item = ({ producto, notify }) => {
    const { agregarAlCarrito } = useCarrito();
    const [cantidad, setCantidad] = useState(1);
    const flickityRef = useRef(null);


    useEffect(() => {
        if (flickityRef.current) {
            new Flickity(flickityRef.current, {
                cellAlign: 'left',
                contain: true,
                pageDots: false,  // Si no deseas que se muestren los puntos de navegación
                prevNextButtons: true // Para mostrar las flechas de navegación
            });
        }
    }, []);



    const handleAddToCart = () => {
        agregarAlCarrito(producto, cantidad);
    };

    return (
        <div key={producto.id} className='product-card'>
            <div className="carousel" ref={flickityRef}>
                {producto.imagen && (
                    <div className="carousel-cell">
                        <img className="product-image" src={producto.imagen} alt={`${producto.nombre} - Imagen 1`} />
                    </div>
                )}
                {producto.imagenB && (
                    <div className="carousel-cell">
                        <img className="product-image" src={producto.imagenB} alt={`${producto.nombre} - Imagen 2`} />
                    </div>
                )}
                {producto.imagenC && (
                    <div className="carousel-cell">
                        <img className="product-image" src={producto.imagenC} alt={`${producto.nombre} - Imagen 3`} />
                    </div>
                )}
            </div>

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
    );
};

export default Item;
