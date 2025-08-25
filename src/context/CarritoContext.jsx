import React, { createContext, useContext, useState } from 'react';

const CarritoContext = createContext();

export const useCarrito = () => useContext(CarritoContext);

export const CarritoProvider = ({ children }) => {
    const [carrito, setCarrito] = useState([]);

    const agregarAlCarrito = (producto, cantidad = 1) => {
        setCarrito(prevCarrito => {
            const isVariation = producto.hasVariations && producto.variationId;
            let productoEnCarrito;

            if (isVariation) {
                productoEnCarrito = prevCarrito.find(
                    item => item.id === producto.id && item.variationId === producto.variationId
                );
            } else {
                productoEnCarrito = prevCarrito.find(item => item.id === producto.id && !item.variationId);
            }

            if (productoEnCarrito) {
                return prevCarrito.map(item => {
                    const isMatching = isVariation
                        ? item.id === producto.id && item.variationId === producto.variationId
                        : item.id === producto.id && !item.variationId;

                    if (isMatching) {
                        return { ...item, quantity: item.quantity + cantidad };
                    }
                    return item;
                });
            } else {
                return [...prevCarrito, {
                    id: producto.id,
                    name: producto.name,
                    price: producto.price,
                    stock: producto.stock,
                    imageUrl: producto.imageUrl,
                    quantity: cantidad,
                    hasVariations: producto.hasVariations,
                    variationId: producto.variationId || null,
                    attributes: producto.attributes || null,
                    promocion: producto.promocion || null,
                    categoria: producto.categoria || null,
                }];
            }
        });
    };

    const calcularTotales = (productosInfo = {}) => {
        let subtotalBruto = 0;
        let descuentoPromociones = 0;
        const detailedCart = carrito.map(item => {
            const itemKey = item.id + (item.variationId || '');
            const info = productosInfo[itemKey] || {};
            const originalPrice = item.price ?? info.price ?? 0;
            const itemSubtotal = originalPrice * item.quantity;
            let itemPromoDiscount = 0;

            if (item.promocion) {
                switch (item.promocion.type) {
                    case 'percentage_discount':
                        itemPromoDiscount = itemSubtotal * (item.promocion.value / 100);
                        break;
                    case '2x1':
                        const pares2x1 = Math.floor(item.quantity / 2);
                        itemPromoDiscount = pares2x1 * originalPrice;
                        break;
                    case 'second_unit_discount':
                        const pares2daUnidad = Math.floor(item.quantity / 2);
                        itemPromoDiscount = pares2daUnidad * originalPrice * (item.promocion.value / 100);
                        break;
                    default:
                        break;
                }
            }
            
            subtotalBruto += itemSubtotal;
            descuentoPromociones += itemPromoDiscount;

            return {
                ...item,
                originalPrice: originalPrice,
                finalPrice: originalPrice - (itemPromoDiscount / item.quantity),
                promoDiscount: itemPromoDiscount,
                categoria: item.categoria ?? info.categoria,
            };
        });

        const totalNeto = subtotalBruto - descuentoPromociones;

        return {
            subtotalBruto,
            descuentoPromociones,
            totalNeto,
            detailedCart,
        };
    };

    const eliminarDelCarrito = (productoId, variationId = null) => {
        setCarrito(prevCarrito => prevCarrito.filter(item => {
            if (variationId) {
                return !(item.id === productoId && item.variationId === variationId);
            }
            return !(item.id === productoId && !item.variationId);
        }));
    };

    const actualizarCantidad = (productoId, nuevaCantidad, variationId = null) => {
        setCarrito(prevCarrito =>
            prevCarrito.map(item => {
                const isMatchingItem = item.id === productoId &&
                                       (variationId ? item.variationId === variationId : !item.variationId);

                if (isMatchingItem) {
                    if (nuevaCantidad <= 0) return null;
                    return { ...item, quantity: parseInt(nuevaCantidad, 10) };
                }
                return item;
            }).filter(Boolean)
        );
    };

    const vaciarCarrito = () => setCarrito([]);

    return (
        <CarritoContext.Provider value={{ carrito, agregarAlCarrito, eliminarDelCarrito, actualizarCantidad, vaciarCarrito, calcularTotales }}>
            {children}
        </CarritoContext.Provider>
    );
};
