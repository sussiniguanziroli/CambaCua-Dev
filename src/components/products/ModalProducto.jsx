import React, { useEffect, useRef } from 'react';
import Flickity from 'flickity';
import "flickity/css/flickity.css";
import { FiShoppingCart, FiShare2, FiCopy } from 'react-icons/fi';
import { FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const ModalProducto = ({ producto, isOpen, onClose, addToCart, existsInCart, notifyCopiar }) => {
    const modalRef = useRef();
    const flickityRef = useRef(null);
    const flktyInstance = useRef(null);
    const navigate = useNavigate();

    const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            onClose();
        }
    };

    useEffect(() => {
        let timerId = null;

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            timerId = setTimeout(() => {
                if (flickityRef.current && !flktyInstance.current) {
                    flktyInstance.current = new Flickity(flickityRef.current, {
                        cellAlign: 'center',
                        contain: true,
                        pageDots: true,
                        prevNextButtons: true,
                        wrapAround: true,
                        imagesLoaded: true
                    });
                    flktyInstance.current.resize();
                }
            }, 0);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
            if (flktyInstance.current) {
                try {
                    flktyInstance.current.destroy();
                } catch (error) {
                    console.error("Error destroying Flickity on close:", error);
                }
                flktyInstance.current = null;
            }
        }

        return () => {
            clearTimeout(timerId);
            document.removeEventListener('mousedown', handleClickOutside);
            if (flktyInstance.current) {
                try {
                    flktyInstance.current.destroy();
                } catch (error) {
                    console.error("Error destroying Flickity on cleanup:", error);
                }
                flktyInstance.current = null;
            }
        };
    }, [isOpen]);

    if (!isOpen || !producto) return null;

    const urlProducto = `${window.location.origin}/producto/${producto.id}`; // Changed to /producto/:id

    const handleCopyLink = () => {
        const el = document.createElement('textarea');
        el.value = urlProducto;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        notifyCopiar();
    };

    const handleNativeShare = () => {
        if (navigator.share) {
            navigator.share({ title: producto.nombre, text: `Mira este producto: ${producto.nombre}`, url: urlProducto })
                .then(() => console.log('Compartido exitosamente'))
                .catch((error) => console.error('Error al compartir:', error));
        } else {
            handleCopyLink();
            Swal.fire({
                title: "Función no soportada",
                text: "Tu navegador no soporta la función de compartir. Se ha copiado el enlace al portapapeles.",
                icon: "info",
                confirmButtonColor: '#0b369c',
            });
        }
    };

    const imagenesCarousel = [producto.imagen, producto.imagenB, producto.imagenC].filter(Boolean);
    const fallbackImage = "https://placehold.co/400x400/E0E0E0/808080?text=Imagen+no+disponible";

    return (
        <div className={`modal ${isOpen ? 'fade-in-up' : ''}`}>
            <div className="modal-content" ref={modalRef}>
                <button className="close-button" onClick={onClose} aria-label="Cerrar modal">
                    <FaTimes />
                </button>
                <div className="modal-main-area">
                    <div className="modal-carousel-column">
                        <div className="carousel" ref={flickityRef}>
                            {imagenesCarousel.length > 0 ? (
                                imagenesCarousel.map((img, index) => (
                                    <div key={index} className="carousel-cell">
                                        <img src={img} alt={`${producto.nombre} - Imagen ${index + 1}`} />
                                    </div>
                                ))
                            ) : (
                                <div className="carousel-cell">
                                    <img src={fallbackImage} alt="Producto sin imagen" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="modal-body-column">
                        <div className="modal-header">
                            <h2>{producto.nombre}</h2>
                            {producto.hasVariations ? (
                                <button
                                    onClick={() => { onClose(); navigate(`/producto/${producto.id}`); }} // Changed to /producto/:id
                                    className="add-to-cart"
                                >
                                    Ver Detalles y Opciones
                                </button>
                            ) : producto.stock > 0 ? (
                                <button onClick={() => addToCart(producto)} className="add-to-cart" disabled={existsInCart}>
                                    <FiShoppingCart size={18} /> {existsInCart ? "En carrito" : "Agregar al carrito"}
                                </button>
                            ) : (
                                <div className="stock-status">Sin Stock</div>
                            )}
                        </div>
                        <div className="modal-body">
                            {producto.hasVariations ? (
                                <p className="info-message">Este producto tiene variaciones (ej. talla, color). Por favor, haz clic en "Ver Detalles y Opciones" para seleccionarlas.</p>
                            ) : (
                                <>
                                    <p className="product-price">${producto.precio}</p>
                                    <p>{producto.descripcion}</p>
                                    <div className="product-details">
                                        {producto.categoria && (<><strong>Categoría:</strong> {producto.categoria}<br /></>)}
                                        {producto.subcategoria && (<><strong>Subcategoría:</strong> {producto.subcategoria}<br /></>)}
                                        <strong>Disponibilidad:</strong> {producto.stock > 0 ? `${producto.stock} unidades` : 'Agotado'}
                                    </div>
                                </>
                            )}
                            <div className="share-buttons">
                                <button onClick={handleNativeShare}><FiShare2 /> Compartir</button>
                                <button onClick={handleCopyLink} className="hiddenInMobile"><FiCopy /> Copiar Enlace</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalProducto;
