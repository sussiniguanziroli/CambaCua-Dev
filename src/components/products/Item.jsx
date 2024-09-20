import React, { useState } from 'react';
import { useCarrito } from '../../context/CarritoContext'; // Ajusta la ruta según tu estructura de carpetas
import ModalProducto from './ModalProducto';
import Swal from 'sweetalert2'




const Item = ({ producto, notifyAgregado, notifyCarrito, notifyCopiar }) => {
    const { agregarAlCarrito, carrito } = useCarrito();
    const [cantidad, setCantidad] = useState(1);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    let cartItems = carrito;

    

    const existsInCart = cartItems.some(item => item.id === producto.id);

    const handleAddToCart = () => {

        if (existsInCart) {
            // Mostrar alerta usando Toastify
            Swal.fire({
                title: "Producto ya en carrito",
                text: "Para agregar mas de uno, debes seleccionar la cantidad desde el carrito!",
                icon: "info",
                confirmButtonColor: '#0b369c',
            });
        } else {
            // Lógica para agregar el producto al carrito
            agregarAlCarrito(producto);
            notifyAgregado();
        }



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

        if (existsInCart) {
            // Mostrar alerta usando Toastify
            notifyCarrito();
        } else {
            // Lógica para agregar el producto al carrito
            agregarAlCarrito(producto);
            notifyAgregado();
        }

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
                        <button className="add-to-cart-button" onClick={handleAddToCart}>
                            {existsInCart ? "En carrito" : "Agregar al carrito"}
                        </button>
                    )}

                </div>
            </div>
            {/* Modal para mostrar detalles del producto */}
            <ModalProducto
                producto={selectedProduct}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                addToCart={handleAddToCartModal}
                existsInCart={existsInCart}
                notifyCopiar={notifyCopiar}
            />
        </>
    );
};

export default Item;
