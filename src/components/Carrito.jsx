// src/components/Carrito.jsx
import React, { useState } from 'react';
import { useCarrito } from '../context/CarritoContext';
import { FaTrashAlt, FaArrowLeft, FaPlus, FaMinus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Carrito = () => {
    const { calcularTotal, carrito, eliminarDelCarrito, actualizarCantidad, vaciarCarrito } = useCarrito();

    const notifyEliminar = () => toast.error("Producto Eliminado!");
    const notifyVaciar = () => toast.error("Carrito Vacio!");


    const obtenerStockDisponible = async (id) => {
        const docRef = doc(db, "productos", id); // Asumiendo que tienes una colección llamada 'productos'
        const docSnap = await getDoc(docRef);
    
        if (docSnap.exists()) {
            return docSnap.data().stock;
        } else {
            console.error("No such document!");
            return 0; // O cualquier valor que consideres apropiado en caso de que el producto no exista
        }
    };


    const handleCantidadChangeMobile = (id, e) => {
        const cantidad = parseInt(e.target.value, 10);
        const stockDisponible = obtenerStockDisponible(id);

        if (cantidad > stockDisponible) {
            actualizarCantidad(id, stockDisponible);
            // Aquí puedes mostrar una notificación de que se ha alcanzado el stock máximo
            toast.info(`Se ha alcanzado el máximo de productos disponibles (${stockDisponible})`);
        } else if (cantidad > 0) {
            actualizarCantidad(id, cantidad);
        } else {
            eliminarDelCarrito(id);
            notifyEliminar();
        }
    };




    return (
        <div className="carrito">
            <h1>Carrito de Compras</h1>
            <ToastContainer
                autoClose={1500} />
            <Link className='boton-volver' to="/productos"><FaArrowLeft /> Atras</Link>

            {carrito.length === 0 ? (
                <p className='carrito-vacio'>El carrito está vacío</p>
            ) : (
                <div>
                    {carrito.map(item => (
                        <div key={item.id} className="carrito-item">
                            <div className='carrito-first-item'>

                                <h2>{item.nombre}</h2>
                                <img src={item.imagen} alt={item.nombre} />
                            </div>
                            <p>Precio: ${item.precio}</p>
                            <div className='quantity-imput'>
                                <button onClick={() => handleCantidadChangeMobile(item.id, { target: { value: item.cantidad - 1 } })}><FaMinus /></button>
                                <input
                                    type="number"
                                    className="cantidad-input"
                                    value={item.cantidad}
                                    onChange={(e) => handleCantidadChangeMobile(item.id, e)}
                                />
                                <button onClick={() => handleCantidadChangeMobile(item.id, { target: { value: item.cantidad + 1 } })}><FaPlus /></button>
                            </div>
                            <div className='price-delete'>
                                <p className="total-price">Subtotal: ${item.precio * item.cantidad}</p>
                                <button className="eliminar-button" onClick={() => { eliminarDelCarrito(item.id); notifyEliminar(); }}>
                                    <FaTrashAlt /> Eliminar
                                </button>
                            </div>

                        </div>
                    ))}
                    <strong className='total-compra'>Total Compra: ${(calcularTotal()).toFixed(2)}</strong>
                    <button className="vaciar-carrito-button" onClick={() => { vaciarCarrito(); notifyVaciar(); }} >Vaciar Carrito</button>
                    <Link to="/checkout"><button className='carrito-button-comprar'>Continuar Compra</button></Link>

                </div>

            )}
        </div>
    );
};

export default Carrito;
