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

                productoEnCarrito = prevCarrito.find(item => item.id === producto.id);
            }

            if (productoEnCarrito) {

                return prevCarrito.map(item => {
                    if (isVariation && item.id === producto.id && item.variationId === producto.variationId) {
                        return { ...item, quantity: item.quantity + cantidad };
                    } else if (!isVariation && item.id === producto.id) {
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

    const calcularTotal = () => {
        return carrito.reduce((acc, prod) => acc + prod.price * prod.quantity, 0);
    };

    const eliminarDelCarrito = (productoId, variationId = null) => {
        setCarrito(prevCarrito => prevCarrito.filter(item => {
            if (item.hasVariations && variationId) {
                return !(item.id === productoId && item.variationId === variationId);
            }
            return item.id !== productoId;
        }));
    };

    const actualizarCantidad = (productoId, nuevaCantidad, variationId = null) => {
        setCarrito(prevCarrito =>
            prevCarrito.map(item => {
                const isMatchingItem = item.id === productoId &&
                                       (item.hasVariations ? item.variationId === variationId : true);

                if (isMatchingItem) {

                    const finalQuantity = Math.min(nuevaCantidad, item.stock);
                    return { ...item, quantity: finalQuantity };
                }
                return item;
            })
        );
    };

    const vaciarCarrito = () => setCarrito([]);

    return (
        <CarritoContext.Provider value={{ carrito, agregarAlCarrito, eliminarDelCarrito, actualizarCantidad, vaciarCarrito, calcularTotal }}>
            {children}
        </CarritoContext.Provider>
    );
};