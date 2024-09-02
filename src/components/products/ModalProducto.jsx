import React, { useEffect, useRef } from 'react';
import Flickity from 'flickity';
import "flickity/css/flickity.css";
import { FiShoppingCart } from 'react-icons/fi';

const ModalProducto = ({ producto, isOpen, onClose, addToCart, notifyAgregado }) => {
    const modalRef = useRef();
    const flickityRef = useRef(null);

    const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            onClose();
        }
    };

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } 
        if (flickityRef.current) {
            new Flickity(flickityRef.current, {
                cellAlign: 'center', // Centrar las imágenes
                contain: true,
                pageDots: false,
                prevNextButtons: true,
            });
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    if (!isOpen) return null;

    

    return (
        <div className="modal fade-in-up">
            <div className="modal-content" ref={modalRef}>
                <span className="close-button" onClick={onClose}>&times;</span>

                <div className="modal-header">
                    <h2>{producto.nombre}</h2>
                    <button onClick={() => {addToCart(producto); notifyAgregado()}} className="add-to-cart">
                        <FiShoppingCart size={20} /> Agregar al carrito
                    </button>
                </div>
            
                <div className="carousel" ref={flickityRef}>
                    {[producto.imagen, producto.imagenB, producto.imagenC].filter(Boolean).map((img, index) => (
                        <div key={index} className="carousel-cell">
                            <img className="product-image" src={img} alt={`${producto.nombre} - Imagen ${index + 1}`} />
                        </div>
                    ))}
                </div>

                <div className="modal-body">
                    <p>{producto.descripcion}</p>
                    <p className="product-price">Precio: ${producto.precio}</p>
                    <p className="product-details">
                        <strong>Categoría:</strong> {producto.categoria} <br />
                        <strong>Subcategoría:</strong> {producto.subcategoria} <br />
                        <strong>Disponibilidad:</strong> {producto.stock}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ModalProducto;
