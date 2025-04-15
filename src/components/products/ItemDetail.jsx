import React, { useEffect, useRef, useContext } from 'react'; // Añadido useContext si no estaba
import Flickity from 'flickity';
import "flickity/css/flickity.css"; // Asegúrate que este CSS se cargue
import { FiShoppingCart } from 'react-icons/fi';
import Swal from 'sweetalert2'; // Para notificaciones "ya en carrito"

// Importar el hook del contexto del carrito
import { useCarrito } from '../../context/CarritoContext'; // Ajusta la ruta si es necesario

const ItemDetail = ({ product }) => { // Recibe el producto de ItemDetailContainer
    const { agregarAlCarrito, carrito } = useCarrito(); // Obtener funciones y estado del carrito
    const flickityRef = useRef(null);
    const flktyInstance = useRef(null);

    // Inicializar Flickity
    useEffect(() => {
        if (flickityRef.current && !flktyInstance.current) {
            flktyInstance.current = new Flickity(flickityRef.current, {
                cellAlign: 'center',
                contain: true,
                pageDots: true,
                prevNextButtons: true,
                wrapAround: true
            });
        } else if (flktyInstance.current) {
            // Reajustar si ya existe (útil si el componente no se desmonta)
            flktyInstance.current.resize();
        }

        // Limpieza (opcional, ver comentario en ModalProducto)
        // return () => {
        //     if (flktyInstance.current) {
        //         flktyInstance.current.destroy();
        //         flktyInstance.current = null;
        //     }
        // };
    }, [product]); // Dependencia: product (por si cambia la página sin desmontar)

    // Comprobar si el producto ya está en el carrito
    const existsInCart = carrito.some(item => item.id === product.id);

    // Manejador para añadir al carrito (lógica similar a la original)
    const handleAddToCart = () => {
        if (existsInCart) {
            Swal.fire({
                title: "Producto ya en carrito",
                text: "Puedes ajustar la cantidad desde el carrito.", // Mensaje ligeramente ajustado
                icon: "info",
                confirmButtonColor: '#0b369c', // Usar variable SCSS si es posible anular estilos de Swal
                customClass: { // Aplicar clase para Poppins si se define globalmente para Swal
                    popup: 'swal2-popup'
                }
            });
        } else {
            agregarAlCarrito(product);
            // Podríamos añadir un toast aquí si quisiéramos, pero Swal ya notifica el 'ya existe'
            // Ejemplo con toast (necesitaría importar toast y pasar notify como prop si no está global)
            // notifyDetailAgregado(); // -> Esta prop venía de ItemDetailContainer, podría usarse
            // O usar Swal también para éxito:
            Swal.fire({
                title: "¡Agregado!",
                text: `${product.nombre} se ha añadido al carrito.`,
                icon: "success",
                timer: 1500, // Cierre automático
                showConfirmButton: false,
                customClass: { popup: 'swal2-popup' }
            });
        }
    };

    // Filtrar imágenes válidas
    const imagenesCarousel = [product.imagen, product.imagenB, product.imagenC].filter(Boolean);
    const fallbackImage = "https://via.placeholder.com/400?text=Imagen+no+disponible"; // URL de imagen por defecto

    return (
        // Contenedor principal del contenido de esta página
        <div className="item-detail-page-content">

            {/* Contenedor para el layout de 2 columnas */}
            <div className="detail-main-area">

                {/* Columna Izquierda: Carrusel */}
                <div className="detail-carousel-column">
                    <div className="carousel" ref={flickityRef}>
                        {imagenesCarousel.length > 0 ? (
                            imagenesCarousel.map((img, index) => (
                                <div key={index} className="carousel-cell">
                                    <img
                                        src={img}
                                        alt={`${product.nombre} - Imagen ${index + 1}`}
                                    />
                                </div>
                            ))
                        ) : (
                            // Placeholder si no hay imágenes
                            <div className="carousel-cell">
                                <img src={fallbackImage} alt="Imagen no disponible" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Columna Derecha: Información */}
                <div className="detail-body-column">

                    {/* Título del Producto */}
                    <h1 className="product-title">{product.nombre}</h1>

                    {/* Precio */}
                    <p className="product-price">${product.precio}</p>

                    {/* Botón Añadir o Estado Sin Stock */}
                    <div className="detail-actions">
                        {product.stock > 0 ? (
                            <button
                                onClick={handleAddToCart}
                                className="add-to-cart-button-detail" // Clase específica para este botón
                                disabled={existsInCart}
                            >
                                <FiShoppingCart size={18} />
                                {existsInCart ? "En carrito" : "Agregar al carrito"}
                            </button>
                        ) : (
                            <div className="stock-status">Sin Stock</div>
                        )}
                        {/* Mostrar stock disponible si es relevante */}
                        {product.stock > 0 && (
                            <p className="stock-available">Disponibles: {product.stock}</p>
                        )}
                    </div>


                    {/* Descripción */}
                    <div className="product-description">
                        <h3>Descripción</h3>
                        <p>{product.descripcion || "Descripción no disponible."}</p>
                    </div>


                    {/* Detalles Adicionales */}
                    <div className="product-details">
                        <h3>Detalles</h3>
                        {product.categoria && (
                            <p className="detail-item"><strong>Categoría:</strong> {product.categoria}</p>
                        )}
                        {product.subcategoria && (
                            <p className="detail-item"><strong>Subcategoría:</strong> {product.subcategoria}</p>
                        )}
                        {/* Añade más detalles aquí si es necesario, envueltos en <p className="detail-item"> */}
                    </div>

                </div> {/* Fin Columna Derecha */}
            </div> {/* Fin Contenedor Principal Layout */}
        </div> // Fin Contenedor Página
    );
};

export default ItemDetail;