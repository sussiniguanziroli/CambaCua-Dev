/*
  File: CarritoContext.jsx
  Description: Manages the global state of the shopping cart.
  Status: CRITICAL FIX APPLIED. The `calcularTotal` function now safely
          handles null or undefined prices to prevent NaN errors.
*/
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
                }];
            }
        });
    };

    // CORRECTED FUNCTION
    const calcularTotal = () => {
        return carrito.reduce((acc, prod) => {
            const price = prod.price || 0; // Fallback to 0 if price is null/undefined
            return acc + (price * prod.quantity);
        }, 0);
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
        <CarritoContext.Provider value={{ carrito, agregarAlCarrito, eliminarDelCarrito, actualizarCantidad, vaciarCarrito, calcularTotal }}>
            {children}
        </CarritoContext.Provider>
    );
};
