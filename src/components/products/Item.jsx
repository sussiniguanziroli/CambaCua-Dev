import React, { useState } from 'react';
import { useCarrito } from '../../context/CarritoContext'; // Ajusta la ruta según tu estructura de carpetas
import ModalProducto from './ModalProducto';

const Item = ({ producto, notifyAgregado }) => {
    const { agregarAlCarrito } = useCarrito();
    const [cantidad, setCantidad] = useState(1);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddToCart = () => {
        if (cantidad < producto.stock) {
            // Ajusta la cantidad al máximo stock disponible
            

            // Muestra el mensaje de que se ha alcanzado el máximo disponible
            
            agregarAlCarrito(producto);
        } else if (cantidad > producto.stock) {
            alert(`Se ha agregado el máximo de productos disponibles (${producto.stock})`);
            agregarAlCarrito(producto);
            // Lógica para agregar al carrito
            // Aquí puedes manejar la adición de productos al carrito
            

        }

    };

    // me veo obligado a hacer una logica aparte para el trabajo con cantidades

    // Lógica para controlar el aumento de la cantidad
    const incrementQuantity = () => {
        if (cantidad < producto.stock) {
            setCantidad(cantidad + 1);
        } else {
            toast.info(`Se ha agregado el máximo de productos disponibles (${producto.stock})`);
        }
    };

    // Lógica para controlar la disminución de la cantidad
    const decrementQuantity = () => {
        setCantidad(cantidad > 1 ? cantidad - 1 : 1);
    };

    //MODAL LOGICA

    // Función para abrir el modal y seleccionar el producto
    const handleOpenModal = (producto) => {
        setSelectedProduct(producto);
        setIsModalOpen(true);
    };

    // Función para cerrar el modal
    const handleCloseModal = () => {
        setSelectedProduct(null);
        setIsModalOpen(false);
    };

    const handleAddToCartModal = (producto) => {
        agregarAlCarrito(producto);

    };


    return (
        <>
            <div className={`product-card ${producto.stock === 0 ? 'out-of-stock' : ''}`}>
                <div onClick={() => handleOpenModal(producto)} className="image-container">
                    {producto.stock === 0 ? (
                        <div>
                            <img src="https://congorrito.wordpress.com/wp-content/uploads/2010/09/agotado.gif" alt="agota3" />

                        </div>

                    ) : (
                        <img className="product-image" src={producto.imagen} alt={`${producto.nombre}`} />
                    )}

                </div>
                <div>
                    <h3 onClick={() => handleOpenModal(producto)} className="product-name">{producto.nombre}</h3>
                    <p className='product-category'>{producto.categoria}</p>
                    <strong className="product-price">${producto.precio}</strong>
                    
                    {producto.stock === 0 ? (
                        <div className="stock-status">Sin Stock</div>
                    ) : (
                        <button className="add-to-cart-button" onClick={() => { handleAddToCart(); notifyAgregado(); }}>Agregar al carrito</button>
                    )}

                </div>
            </div>
            {/* Modal para mostrar detalles del producto */}
            <ModalProducto
                producto={selectedProduct}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                addToCart={handleAddToCartModal}
                notifyAgregado={notifyAgregado}
            />
        </>
    );
};

export default Item;
