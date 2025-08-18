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

    const cardImage = producto.imagen ||
                      (producto.hasVariations && producto.variationsList && producto.variationsList[0] && producto.variationsList[0].imagen) ||
                      "https://placehold.co/400x400/E0E0E0/808080?text=No+Image";

    const getPromoBadgeText = (promo) => {
        if (!promo) return null;
        switch (promo.type) {
            case 'percentage_discount':
                return `${promo.value}% OFF`;
            case 'second_unit_discount':
                return `${promo.value}% 2da Unidad`;
            case '2x1':
                return '2x1';
            default:
                return null;
        }
    };

    const calculateDiscountedPrice = (price, promo) => {
        if (promo && promo.type === 'percentage_discount' && price) {
            return price * (1 - promo.value / 100);
        }
        return null;
    };

    const promoBadgeText = getPromoBadgeText(producto.promocion);
    const discountedPrice = calculateDiscountedPrice(producto._displayPrice, producto.promocion);

    const renderPrice = () => {
        const originalPrice = producto._displayPrice;

        if (producto.hasVariations) {
            if (originalPrice === Infinity || originalPrice === null) {
                return <strong className="product-price">Ver Opciones</strong>;
            }
            const discountedVariationPrice = calculateDiscountedPrice(originalPrice, producto.promocion);
            if (discountedVariationPrice !== null) {
                return (
                    <div className="price-container">
                        <strong className="product-price final-price">Desde ${discountedVariationPrice.toFixed(2)}</strong>
                        <span className="product-price original-price">Desde ${originalPrice.toFixed(2)}</span>
                    </div>
                );
            }
            return <strong className="product-price">Desde ${originalPrice.toFixed(2)}</strong>;
        }

        if (discountedPrice !== null) {
            return (
                <div className="price-container">
                    <strong className="product-price final-price">${discountedPrice.toFixed(2)}</strong>
                    <span className="product-price original-price">${originalPrice.toFixed(2)}</span>
                </div>
            );
        }
        return <strong className="product-price">${originalPrice?.toFixed(2)}</strong>;
    };

    return (
        <>
            <div className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
                <div onClick={() => handleOpenModal(producto)} className="image-container">
                    {promoBadgeText && <div className="promo-badge">{promoBadgeText}</div>}
                    <img className="product-image" src={cardImage} alt={`${producto.nombre}`} />
                </div>
                <div>
                    <h3 onClick={() => handleOpenModal(producto)} className="product-name">{producto.nombre}</h3>
                    <p className='product-category'>{producto.categoria}</p>
                    {renderPrice()}
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
