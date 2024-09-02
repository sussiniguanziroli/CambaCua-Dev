import React, { useState } from 'react';
import { useCarrito } from '../../context/CarritoContext'; // Ajusta la ruta según tu estructura de carpetas
import ModalProducto from './ModalProducto';

const Item = ({ producto, notifyAgregado }) => {
    const { agregarAlCarrito } = useCarrito();
    const [cantidad, setCantidad] = useState(1);

   
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddToCart = () => {
        agregarAlCarrito(producto, cantidad);
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
            <div key={producto.id} className='product-card'>
                <div onClick={() => handleOpenModal(producto)} className="image-container">
                    <img className="product-image" src={producto.imagen} alt={`${producto.nombre}`} />
                </div>
                <div>
                    <h3 onClick={() => handleOpenModal(producto)} className="product-name">{producto.nombre}</h3>
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
                    <button className="add-to-cart-button" onClick={() => { handleAddToCart(); notifyAgregado(); }}>Agregar al carrito</button>
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
