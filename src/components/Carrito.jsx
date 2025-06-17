import React from 'react';
import { useCarrito } from '../context/CarritoContext';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { FaTrashAlt, FaArrowLeft, FaPlus, FaMinus } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const Carrito = () => {
    const { carrito, eliminarDelCarrito, actualizarCantidad, vaciarCarrito, calcularTotal } = useCarrito();
    const { currentUser } = useAuth(); // Get current user
    const navigate = useNavigate(); // Get navigate function

    const handleContinuarCompra = () => {
        if (!currentUser) {
            Swal.fire({
                title: 'Inicio de Sesión Requerido',
                text: 'Para continuar con la compra, por favor inicia sesión o crea una cuenta.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Iniciar Sesión',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#0b369c',
                cancelButtonColor: '#aaa'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/auth');
                }
            });
        } else {
            navigate('/checkout');
        }
    };
    
    // ... (rest of your functions: obtenerStockDisponible, handleCantidadChange, etc. remain the same)
    const obtenerStockDisponible = async (productoId) => {
        try {
            const productoRef = doc(db, 'productos', productoId);
            const productoSnapshot = await getDoc(productoRef);
            return productoSnapshot.exists() ? productoSnapshot.data().stock : 0;
        } catch (error) {
            console.error("Error obteniendo stock:", error);
            toast.error("Error al verificar stock.");
            return 0;
        }
    };

    const handleCantidadChange = async (itemId, nuevaCantidad) => {
        const cantidad = parseInt(nuevaCantidad, 10);
        if (isNaN(cantidad) || cantidad <= 0) {
            eliminarDelCarrito(itemId);
            toast.error("Producto eliminado");
        } else {
            const stockDisponible = await obtenerStockDisponible(itemId);
            if (cantidad > stockDisponible) {
                actualizarCantidad(itemId, stockDisponible);
                toast.info(`Máximo stock disponible: ${stockDisponible}`);
            } else {
                actualizarCantidad(itemId, cantidad);
            }
        }
    };

    const handleInputChange = (itemId, event) => {
        const valorInput = event.target.value;
        const cantidad = parseInt(valorInput, 10);
        if (!isNaN(cantidad) && cantidad > 0) {
            handleCantidadChange(itemId, cantidad);
        } else if (valorInput === "") {
            // No action needed on empty input
        } else if (!isNaN(cantidad) && cantidad <= 0) {
            eliminarDelCarrito(itemId);
            toast.error("Producto eliminado");
        }
    };

    const handleVaciarCarrito = () => {
        Swal.fire({
            title: '¿Vaciar Carrito?',
            text: "Se eliminarán todos los productos.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0b369c',
            cancelButtonColor: '#dc3545',
            confirmButtonText: 'Sí, vaciar',
            cancelButtonText: 'Cancelar',
            customClass: { popup: 'swal2-popup' }
        }).then((result) => {
            if (result.isConfirmed) {
                vaciarCarrito();
                toast.error("Carrito vaciado");
            }
        });
    };

    return (
        <div className="carrito-page">
            <ToastContainer
                 position="top-center"
                 autoClose={2000}
                 hideProgressBar
                 newestOnTop={false}
                 closeOnClick
                 rtl={false}
                 pauseOnFocusLoss
                 draggable
                 pauseOnHover
                 theme="colored"
            />
            <Link className='boton-volver' to="/productos">
                <FaArrowLeft /> <span>Volver a Productos</span>
            </Link>
            <h1>Carrito de Compras</h1>
            {carrito.length === 0 ? (
                <div className="empty-cart-container">
                    <p className='carrito-vacio'>Tu carrito está vacío.</p>
                    <Link to="/productos" className="boton-seguir-comprando">
                        Ver Productos
                    </Link>
                </div>
            ) : (
                <div className="carrito-content">
                    <div className="carrito-items-list">
                        {carrito.map(item => (
                            <div key={item.id} className="carrito-item">
                                <img src={item.imagen} alt={item.nombre} className="item-image"/>
                                <div className="item-details">
                                    <h2 className="item-name">{item.nombre}</h2>
                                    <p className="item-price">Precio: ${item.precio}</p>
                                    <div className="item-quantity">
                                        <label htmlFor={`cantidad-${item.id}`}>Cantidad:</label>
                                        <div className="quantity-controls">
                                             <button onClick={() => handleCantidadChange(item.id, item.cantidad - 1)} aria-label="Restar uno">
                                                <FaMinus />
                                            </button>
                                            <input
                                                id={`cantidad-${item.id}`}
                                                type="number"
                                                className="cantidad-input"
                                                value={item.cantidad}
                                                 onChange={(e) => handleInputChange(item.id, e)}
                                                aria-label="Cantidad"
                                                min="1"
                                            />
                                            <button onClick={() => handleCantidadChange(item.id, item.cantidad + 1)} aria-label="Sumar uno">
                                                <FaPlus />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="item-subtotal">Subtotal: <strong>${(item.precio * item.cantidad).toFixed(2)}</strong></p>
                                </div>
                                <button className="item-delete-button" onClick={() => eliminarDelCarrito(item.id)} aria-label={`Eliminar ${item.nombre}`}>
                                    <FaTrashAlt />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="carrito-summary">
                         <div className="total-section">
                             <span className="total-label">Total Compra:</span>
                             <span className="total-amount">${(calcularTotal()).toFixed(2)}</span>
                         </div>
                         <div className="actions-section">
                             <button className="vaciar-carrito-button" onClick={handleVaciarCarrito}>
                                 Vaciar Carrito
                             </button>
                             <button className='carrito-button-comprar' onClick={handleContinuarCompra}>
                                 Continuar Compra
                             </button>
                         </div>
                     </div>
                </div>
            )}
        </div>
    );
};

export default Carrito;
