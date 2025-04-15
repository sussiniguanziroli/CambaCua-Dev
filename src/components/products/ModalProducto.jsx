import React, { useEffect, useRef } from 'react';
import Flickity from 'flickity';
import "flickity/css/flickity.css"; // Asegúrate que este CSS se cargue
import { FiShoppingCart, FiShare2, FiCopy } from 'react-icons/fi';
import { FaTimes } from 'react-icons/fa'; // Importar el ícono para cerrar

const ModalProducto = ({ producto, isOpen, onClose, addToCart, existsInCart, notifyCopiar }) => {
    const modalRef = useRef();
    const flickityRef = useRef(null); // Ref para el elemento del carrusel
    const flktyInstance = useRef(null); // Ref para guardar la instancia de Flickity

    // Lógica para cerrar el modal al hacer clic fuera
    const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            onClose();
        }
    };

    // Efecto para inicializar/destruir Flickity y manejar clics fuera
    useEffect(() => {
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);

            // Inicializar Flickity solo si hay un elemento y no hay instancia previa
            if (flickityRef.current && !flktyInstance.current) {
                flktyInstance.current = new Flickity(flickityRef.current, {
                    cellAlign: 'center',
                    contain: true,
                    pageDots: true, // Habilitar puntos si se desean (estilizados en SCSS)
                    prevNextButtons: true, // Habilitar flechas (estilizadas en SCSS)
                    wrapAround: true // Permite hacer loop en el carrusel
                });
            } else if (flktyInstance.current) {
                // Si ya existe la instancia y se reabre el modal, reajustar Flickity
                 flktyInstance.current.resize();
            }

        } else {
            document.removeEventListener('mousedown', handleClickOutside);
            // Destruir instancia de Flickity al cerrar para liberar memoria
            // if (flktyInstance.current) {
            //     flktyInstance.current.destroy();
            //     flktyInstance.current = null;
            // }
            // Comentado destroy: A veces da problemas si el componente se desmonta/remonta rápido.
            // Si no se destruye, `resize` al reabrir suele ser suficiente.
        }

        // Función de limpieza para el event listener
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]); // Dependencia clave: isOpen

    // No renderizar nada si el modal no está abierto
    if (!isOpen || !producto) return null;

    // Construir la URL del producto para compartir/copiar
    const urlProducto = `${window.location.origin}/producto/${producto.id}`;

    // Manejador para copiar enlace
    const handleCopyLink = () => {
        navigator.clipboard.writeText(urlProducto)
            .then(() => {
                notifyCopiar(); // Llama a la notificación pasada por props
            })
            .catch((error) => {
                console.error('Error al copiar el enlace:', error);
                // Podrías añadir una notificación de error aquí
            });
    };

    // Manejador para compartir nativo
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
            // Fallback si el navegador no soporta share API (podría ser copiar enlace)
             handleCopyLink(); // O mostrar un mensaje al usuario
             alert('Tu navegador no soporta la función de compartir. Se ha copiado el enlace.');
        }
    };

    // Filtrar imágenes válidas (que no sean null o undefined)
    const imagenesCarousel = [producto.imagen, producto.imagenB, producto.imagenC].filter(Boolean);

    return (
        // El div .modal es el overlay oscuro (estilizado en SCSS)
        <div className={`modal ${isOpen ? 'fade-in-up' : ''}`}>
            {/* El div .modal-content es la ventana blanca (estilizada en SCSS) */}
            <div className="modal-content" ref={modalRef}>

                {/* Botón Cerrar Mejorado (usando ícono) */}
                <button className="close-button" onClick={onClose} aria-label="Cerrar modal">
                    <FaTimes />
                </button>

                {/* Contenedor Principal para el layout (flex en SCSS) */}
                <div className="modal-main-area">

                    {/* Columna Izquierda: Carrusel */}
                    <div className="modal-carousel-column">
                        <div className="carousel" ref={flickityRef}>
                            {imagenesCarousel.length > 0 ? (
                                imagenesCarousel.map((img, index) => (
                                    <div key={index} className="carousel-cell">
                                        <img
                                            src={img}
                                            alt={`${producto.nombre} - Imagen ${index + 1}`}
                                            // Podrías añadir onClick aquí si quieres hacer zoom o algo
                                        />
                                    </div>
                                ))
                            ) : (
                                // Placeholder si no hay imágenes
                                <div className="carousel-cell">
                                     <img src="URL_IMAGEN_POR_DEFECTO" alt="Producto sin imagen" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Columna Derecha: Información del Producto */}
                    <div className="modal-body-column">

                        {/* Header (ahora dentro de la columna derecha) */}
                        <div className="modal-header">
                            <h2>{producto.nombre}</h2>
                            {/* Lógica condicional para botón o estado 'Sin Stock' */}
                            {producto.stock > 0 ? (
                                <button
                                    onClick={() => addToCart(producto)} // Usa la función pasada por props
                                    className="add-to-cart"
                                    disabled={existsInCart} // Deshabilitar si ya está en carrito (opcional)
                                >
                                    <FiShoppingCart size={18} /> {/* Tamaño ícono */}
                                    {existsInCart ? "En carrito" : "Agregar al carrito"}
                                </button>
                            ) : (
                                <div className="stock-status">Sin Stock</div>
                            )}
                        </div>

                        {/* Cuerpo Principal (Descripción, Precio, Detalles) */}
                        <div className="modal-body">
                            {/* Precio */}
                            <p className="product-price">${producto.precio}</p>

                            {/* Descripción */}
                            <p>{producto.descripcion}</p>

                             {/* Detalles Adicionales */}
                             <div className="product-details">
                                {producto.categoria && (
                                     <><strong>Categoría:</strong> {producto.categoria}<br /></>
                                )}
                                {producto.subcategoria && (
                                     <><strong>Subcategoría:</strong> {producto.subcategoria}<br /></>
                                )}
                                <strong>Disponibilidad:</strong> {producto.stock > 0 ? `${producto.stock} unidades` : 'Agotado'}
                             </div>

                            {/* Botones de Compartir/Copiar */}
                            <div className="share-buttons">
                                {/* Botón Compartir Nativo (prioridad en móvil) */}
                                <button onClick={handleNativeShare}>
                                    <FiShare2 /> Compartir
                                </button>
                                {/* Botón Copiar Enlace (prioridad en desktop o fallback) */}
                                <button onClick={handleCopyLink} className="hiddenInMobile"> {/* Ocultar en móvil si se prefiere nativo */}
                                    <FiCopy /> Copiar Enlace
                                </button>
                             </div>
                        </div>
                    </div> {/* Fin Columna Derecha */}
                </div> {/* Fin Contenedor Principal */}
            </div> {/* Fin Modal Content */}
        </div> // Fin Modal Overlay
    );
};

export default ModalProducto;