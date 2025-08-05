import React, { useState } from 'react';
import { useCarrito } from '../../context/CarritoContext';
import ModalProducto from './ModalProducto';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const Item = ({ producto, notifyAgregado, notifyCarrito, notifyCopiar }) => {
    const { agregarAlCarrito, carrito } = useCarrito();
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const existsInCart = carrito.some(item => item.id === producto.id);

    const handleAddToCart = () => {
        if (producto.hasVariations) {
            navigate(`/producto/${producto.id}`);
            return;
        }

        if (existsInCart) {
            Swal.fire({
                title: "Producto ya en carrito",
                text: "Para agregar más de uno, debes seleccionar la cantidad desde el carrito!",
                icon: "info",
                confirmButtonColor: '#0b369c',
            });
        } else {
            agregarAlCarrito(producto);
            notifyAgregado();
        }
    };

    const handleOpenModal = (productData) => {
        if (productData.hasVariations) {
            navigate(`/producto/${productData.id}`);
        } else {
            setSelectedProduct(productData);
            setIsModalOpen(true);
        }
    };

    const handleCloseModal = () => {
        setSelectedProduct(null);
        setIsModalOpen(false);
    };

    const handleAddToCartModal = (productData) => {
        if (productData.hasVariations) {
            navigate(`/producto/${productData.id}`);
            return;
        }

        if (existsInCart) {
            notifyCarrito();
        } else {
            agregarAlCarrito(productData);
            notifyAgregado();
        }
    };

    const isOutOfStock = producto.hasVariations
        ? !producto._hasAnyVariationStock
        : producto._displayStock === 0;

    const displayPrice = producto.hasVariations
        ? producto._displayPrice !== Infinity && producto._displayPrice !== null
            ? `Desde $${producto._displayPrice?.toFixed(2)}`
            : 'Ver Opciones'
        : `$${producto._displayPrice?.toFixed(2)}`;

    // Determine the image to display on the product card
    // Prioritize product.imagen, then first variation's image, then fallback
    const cardImage = producto.imagen ||
                      (producto.hasVariations && producto.variationsList && producto.variationsList[0] && producto.variationsList[0].imagen) ||
                      "https://placehold.co/400x400/E0E0E0/808080?text=No+Image";


    return (
        <>
            <div className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
                <div onClick={() => handleOpenModal(producto)} className="image-container">
                    <img className="product-image" src={cardImage} alt={`${producto.nombre}`} />
                </div>
                <div>
                    <h3 onClick={() => handleOpenModal(producto)} className="product-name">{producto.nombre}</h3>
                    <p className='product-category'>{producto.categoria}</p>
                    <strong className="product-price">{displayPrice}</strong>

                    {isOutOfStock ? (
                        <div className="stock-status">Sin Stock</div>
                    ) : (
                        <button className="add-to-cart-button" onClick={handleAddToCart}>
                            {producto.hasVariations ? "Ver Opciones" : (existsInCart ? "En carrito" : "Agregar al carrito")}
                        </button>
                    )}
                </div>
            </div>
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
