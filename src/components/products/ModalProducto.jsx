import React, { useEffect, useRef } from 'react';
import Flickity from 'flickity';
import "flickity/css/flickity.css";
import { FiShoppingCart } from 'react-icons/fi';

const ModalProducto = ({ producto, isOpen, onClose, addToCart }) => {
    const modalRef = useRef();
    const flickityRef = useRef(null);

    // Cerrar modal al hacer clic fuera del contenido
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
                cellAlign: 'left',
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
                    <button onClick={() => addToCart(producto)} className="add-to-cart">
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
                    <p>Precio: ${producto.precio}</p>
                    {/* Aquí puedes agregar más información del producto */}
                </div>
            </div>
        </div>
    );
};

export default ModalProducto;
