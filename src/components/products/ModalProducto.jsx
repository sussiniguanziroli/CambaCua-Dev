import React, { useEffect, useRef } from 'react';
import Flickity from 'flickity';
import "flickity/css/flickity.css"; // Asegúrate que este CSS se cargue globalmente o aquí
import { FiShoppingCart, FiShare2, FiCopy } from 'react-icons/fi';
import { FaTimes } from 'react-icons/fa'; // Icono para cerrar

const ModalProducto = ({ producto, isOpen, onClose, addToCart, existsInCart, notifyCopiar }) => {
    const modalRef = useRef();
    const flickityRef = useRef(null); // Ref para el elemento HTML del carrusel
    const flktyInstance = useRef(null); // Ref para guardar la instancia de Flickity

    // Lógica para cerrar el modal al hacer clic fuera del contenido
    const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            onClose(); // Llama a la función pasada por props para cerrar
        }
    };

    // Efecto para manejar la inicialización/destrucción de Flickity y listeners
    useEffect(() => {
        let timerId = null; // Para guardar el ID del setTimeout

        if (isOpen) {
            // Añadir listener para clic fuera cuando el modal está abierto
            document.addEventListener('mousedown', handleClickOutside);

            // Inicializar Flickity usando setTimeout para esperar el renderizado completo
            timerId = setTimeout(() => {
                // Solo inicializar si el elemento existe y NO hay una instancia activa
                if (flickityRef.current && !flktyInstance.current) {
                    flktyInstance.current = new Flickity(flickityRef.current, {
                        cellAlign: 'center',
                        contain: true,
                        pageDots: true,
                        prevNextButtons: true,
                        wrapAround: true
                        // imagesLoaded: true // Podría ser útil si las imágenes cargan lento
                    });
                     // Forzar un resize inicial después de inicializar
                     flktyInstance.current.resize();
                }
            }, 0); // El delay de 0ms es suficiente para diferir la ejecución

        } else {
            // Limpieza cuando el modal se cierra (isOpen es false)
            document.removeEventListener('mousedown', handleClickOutside);

            // Destruir instancia de Flickity si existe al cerrar explícitamente
            if (flktyInstance.current) {
                 try {
                      flktyInstance.current.destroy();
                 } catch (error) {
                      console.error("Error destroying Flickity on close:", error);
                 }
                flktyInstance.current = null; // Limpiar la referencia
            }
        }

        // Función de limpieza del efecto (se ejecuta al desmontar o ANTES de re-ejecutar si isOpen cambia)
        return () => {
            clearTimeout(timerId); // Limpiar el timeout si el componente se desmonta antes de que se ejecute
            document.removeEventListener('mousedown', handleClickOutside); // Asegurar quitar listener

            // Destruir la instancia de Flickity también aquí por si se desmonta estando abierto
            if (flktyInstance.current) {
                 try {
                      flktyInstance.current.destroy();
                 } catch (error) {
                      console.error("Error destroying Flickity on cleanup:", error);
                 }
                flktyInstance.current = null;
            }
        };
    }, [isOpen]); // La dependencia crucial es isOpen

    // --- Renderizado del Componente ---

    // No renderizar nada si no está abierto o no hay producto
    if (!isOpen || !producto) return null;

    // Lógica para compartir y copiar (sin cambios)
    const urlProducto = `${window.location.origin}/producto/${producto.id}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(urlProducto)
            .then(() => notifyCopiar())
            .catch((error) => console.error('Error al copiar el enlace:', error));
    };

    const handleNativeShare = () => {
        if (navigator.share) {
            navigator.share({ title: producto.nombre, text: `Mira este producto: ${producto.nombre}`, url: urlProducto })
            .then(() => console.log('Compartido exitosamente'))
            .catch((error) => console.error('Error al compartir:', error));
        } else {
             handleCopyLink();
             alert('Tu navegador no soporta la función de compartir. Se ha copiado el enlace.');
        }
    };

    // Preparar imágenes para el carrusel
    const imagenesCarousel = [producto.imagen, producto.imagenB, producto.imagenC].filter(Boolean);
    const fallbackImage = "https://via.placeholder.com/400?text=Imagen+no+disponible"; // Reemplaza con tu imagen por defecto

    // Estructura JSX (sin cambios respecto a la versión anterior con columnas)
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
                            {producto.stock > 0 ? (
                                <button onClick={() => addToCart(producto)} className="add-to-cart" disabled={existsInCart}>
                                    <FiShoppingCart size={18} /> {existsInCart ? "En carrito" : "Agregar al carrito"}
                                </button>
                            ) : (
                                <div className="stock-status">Sin Stock</div>
                            )}
                        </div>
                        <div className="modal-body">
                            <p className="product-price">${producto.precio}</p>
                            <p>{producto.descripcion}</p>
                             <div className="product-details">
                                {producto.categoria && (<><strong>Categoría:</strong> {producto.categoria}<br /></>)}
                                {producto.subcategoria && (<><strong>Subcategoría:</strong> {producto.subcategoria}<br /></>)}
                                <strong>Disponibilidad:</strong> {producto.stock > 0 ? `${producto.stock} unidades` : 'Agotado'}
                             </div>
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