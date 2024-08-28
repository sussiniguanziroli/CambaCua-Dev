// src/components/Carrito.jsx
import React, { useState } from 'react';
import { useCarrito } from '../context/CarritoContext';
import { FaTrashAlt, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Carrito = () => {
    const { carrito, eliminarDelCarrito, actualizarCantidad, vaciarCarrito } = useCarrito();

    const handleCantidadChange = (id, e) => {
        const cantidad = parseInt(e.target.value, 10);
        if (cantidad > 0) {
            actualizarCantidad(id, cantidad);
        }
    };

    const notifyEliminar = () => toast.error("Producto Eliminado!");
    const notifyVaciar = () => toast.error("Carrito Vacio!");
    

    return (
        <div className="carrito">
            <h1>Carrito de Compras</h1>
            <ToastContainer 
            autoClose={1500}/>
            <Link className='boton-volver' to="/productos"><FaArrowLeft /> Atras</Link>

            {carrito.length === 0 ? (
                <p>El carrito está vacío</p>
            ) : (
                <div>
                    {carrito.map(item => (
                        <div key={item.id} className="carrito-item">
                            <div className='carrito-first-item'>
                                
                                <h2>{item.nombre}</h2>
                                <img src={item.imagen} alt={item.nombre} />
                            </div>
                            <p>Precio: ${item.precio}</p>
                            <input
                                type="number"
                                className="cantidad-input"
                                value={item.cantidad}
                                onChange={(e) => handleCantidadChange(item.id, e)}
                            />
                            <div className='price-delete'>
                                <p className="total-price">Total: ${item.precio * item.cantidad}</p>
                                <button className="eliminar-button" onClick={() => {eliminarDelCarrito(item.id);notifyEliminar();}}>
                                    <FaTrashAlt /> Eliminar
                                </button>
                            </div>

                        </div>
                    ))}
                    <button className="vaciar-carrito-button" onClick={() => {vaciarCarrito(); notifyVaciar();}} >Vaciar Carrito</button>
                </div>

            )}
        </div>
    );
};

export default Carrito;
