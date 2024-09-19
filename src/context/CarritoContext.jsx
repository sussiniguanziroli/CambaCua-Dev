// src/context/CarritoContext.js
import React, { createContext, useContext, useState } from 'react';

const CarritoContext = createContext();

export const useCarrito = () => useContext(CarritoContext);

export const CarritoProvider = ({ children }) => {
    const [carrito, setCarrito] = useState([]);

    const agregarAlCarrito = (producto, cantidad = 1) => {
        setCarrito(prevCarrito => {
            // Verificar si el producto ya está en el carrito
            const productoEnCarrito = prevCarrito.find(item => item.id === producto.id);
    
            if (productoEnCarrito) {
                // Mostrar alerta si el producto ya está en el carrito
                
                return prevCarrito; // No agregamos el producto de nuevo
            }
    
            // Si no está en el carrito, lo agregamos con la cantidad inicial
            return [...prevCarrito, { ...producto, cantidad }];
        });
    };

    const calcularTotal = () => {
        return carrito.reduce((acc, prod) => acc + prod.precio * prod.cantidad, 0);
    }

    const eliminarDelCarrito = (productoId) => {
        setCarrito(prevCarrito => prevCarrito.filter(item => item.id !== productoId));
    };

    const actualizarCantidad = (productoId, cantidad) => {
        setCarrito(prevCarrito => 
            prevCarrito.map(item =>
                item.id === productoId ? { ...item, cantidad: cantidad } : item
            )
        );
    };

    const vaciarCarrito = () => setCarrito([]);

    return (
        <CarritoContext.Provider value={{ carrito, agregarAlCarrito, eliminarDelCarrito, actualizarCantidad, vaciarCarrito, calcularTotal }}>
            {children}
        </CarritoContext.Provider>
    );
};
