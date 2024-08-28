// src/components/Carrito.jsx
import React, { useState } from 'react';
import { useCarrito } from '../context/CarritoContext';
import { FaTrashAlt, FaArrowLeft, FaPlus, FaMinus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Carrito = () => {
    const {calcularTotal, carrito, eliminarDelCarrito, actualizarCantidad, vaciarCarrito } = useCarrito();

    const notifyEliminar = () => toast.error("Producto Eliminado!");
    const notifyVaciar = () => toast.error("Carrito Vacio!");

    const handleCantidadChange = (id, e) => {
        const cantidad = parseInt(e.target.value, 10);
        if (cantidad > 0) {
            actualizarCantidad(id, cantidad);
        }
        else {
            eliminarDelCarrito(id);
            notifyEliminar();
        }
    };

    
    

    return (
        <div className="carrito">
            <h1>Carrito de Compras</h1>
            <ToastContainer 
            autoClose={1500}/>
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
                            <button onClick={() => handleCantidadChange(item.id, { target: { value: item.cantidad - 1 } })}><FaMinus /></button>
                            <input
                                type="number"
                                className="cantidad-input"
                                value={item.cantidad}
                                onChange={(e) => handleCantidadChange(item.id, e)}
                            />
                            <button onClick={() => handleCantidadChange(item.id, { target: { value: item.cantidad + 1 } })}><FaPlus /></button>
                            </div>
                            <div className='price-delete'>
                                <p className="total-price">Subtotal: ${item.precio * item.cantidad}</p>
                                <button className="eliminar-button" onClick={() => {eliminarDelCarrito(item.id);notifyEliminar();}}>
                                    <FaTrashAlt /> Eliminar
                                </button>
                            </div>

                        </div>
                    ))}
                    <strong className='total-compra'>Total Compra: ${(calcularTotal()).toFixed(2)}</strong>
                    <button className="vaciar-carrito-button" onClick={() => {vaciarCarrito(); notifyVaciar();}} >Vaciar Carrito</button>

                </div>

            )}
        </div>
    );
};

export default Carrito;
