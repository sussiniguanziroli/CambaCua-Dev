import React from "react";
import { NavLink } from "react-router-dom";

const getPromoDescription = (promo) => {
    if (!promo) return null;
    switch (promo.type) {
        case 'percentage_discount': return `${promo.value}% OFF`;
        case '2x1': return `2x1`;
        case 'second_unit_discount': return `${promo.value}% 2da U.`;
        default: return "Promo";
    }
};

const LandingCard = ({ product }) => {
    const isOutOfStock = product.hasVariations
        ? !product._hasAnyVariationStock
        : product._displayStock === 0;

    const displayPrice = product.hasVariations
        ? product._displayPrice !== null
            ? `Desde $${product._displayPrice?.toFixed(2)}`
            : 'Ver Opciones'
        : `$${product._displayPrice?.toFixed(2)}`;
    
    const cardImage = product.imagen ||
                      (product.hasVariations && product.variationsList?.[0]?.imagen) ||
                      "https://placehold.co/400x400/E0E0E0/808080?text=No+Image";
    
    const promoDescription = getPromoDescription(product.promocion);

    return (
        <div className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
            <NavLink to={`/producto/${product.id}`} className="image-container">
                {promoDescription && <div className="promo-badge">{promoDescription}</div>}
                <img
                    className="product-image"
                    src={cardImage}
                    alt={product.nombre}
                />
            </NavLink>
            <div className="product-info">
                <p className="product-category">{product.categoria}</p>
                <h3 className="product-name">{product.nombre}</h3>
                <strong className="product-price">{displayPrice}</strong>
                {isOutOfStock ? (
                    <div className="stock-status">Sin Stock</div>
                ) : (
                    <NavLink to={`/producto/${product.id}`} className="add-to-cart-button">
                        {product.hasVariations ? "Ver Opciones" : "Ver Producto"}
                    </NavLink>
                )}
            </div>
        </div>
    );
};

export default LandingCard;
