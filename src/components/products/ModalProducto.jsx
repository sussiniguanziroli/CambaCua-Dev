import React, { useEffect, useRef } from 'react';
import Flickity from 'flickity';
import "flickity/css/flickity.css";
import { FiShoppingCart, FiShare2, FiCopy } from 'react-icons/fi';


const ModalProducto = ({ producto, isOpen, onClose, addToCart, existsInCart, notifyCopiar }) => {
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
                cellAlign: 'center',
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

    const urlProducto = `${window.location.origin}/producto/${producto.id}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(urlProducto)
            .then(() => {
                notifyCopiar();
            })
            .catch((error) => {
                console.error('Error al copiar el enlace:', error);
            });
    };

    const handleNativeShare = () => {
        if (navigator.share) {
            navigator.share({
                title: producto.nombre,
                text: `Mira este producto: ${producto.nombre}`,
                url: urlProducto
            })
            .then(() => console.log('Compartido exitosamente'))
            .catch((error) => console.error('Error al compartir:', error));
        } else {
            alert('Tu navegador no soporta la función de compartir nativa.');
        }
    };

    return (
        <div className="modal fade-in-up">
            <div className="modal-content" ref={modalRef}>
                <span className="close-button" onClick={onClose}>&times;</span>

                <div className="modal-header">
                    <h2>{producto.nombre}</h2>
                    {producto.stock === 0 ? (
                        <div className="stock-status">Sin Stock</div>
                    ) : (
                        <button onClick={() => { addToCart(producto) }} className="add-to-cart">
                            <FiShoppingCart size={20} /> {existsInCart ? "En carrito" : "Agregar al carrito"}
                        </button>
                    )}
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

                    {/* Render condicional del botón de compartir */}
                    <div className="share-buttons">
                        <button className="hiddenInDesktop" onClick={handleNativeShare}>
                            <FiShare2 size={20} /> Compartir
                        </button>
                        <button className="hiddenInMobile" onClick={handleCopyLink}>
                            <FiCopy size={20} /> Copiar Enlace
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalProducto;
