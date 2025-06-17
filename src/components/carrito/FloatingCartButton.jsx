import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCarrito } from '../../context/CarritoContext';
import { FaShoppingCart } from 'react-icons/fa';

const FloatingCartButton = () => {
    const { carrito } = useCarrito();
    const location = useLocation();
    
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);

    const hiddenPaths = ['/checkout', '/order-summary'];
    
    const shouldShowButton = !hiddenPaths.some(path => location.pathname.startsWith(path));

    if (totalItems === 0 || !shouldShowButton) {
        return null;
    }

    return (
        <Link to="/carrito" className="floating-cart-link">
            <FaShoppingCart />
            <span className="cart-item-count">{totalItems}</span>
        </Link>
    );
};

export default FloatingCartButton;
