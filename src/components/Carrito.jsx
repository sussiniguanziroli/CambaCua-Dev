/*
  File: Carrito.jsx
  Description: Displays the shopping cart items to the user.
  Status: CRITICAL FIX APPLIED. Total calculation is now performed
          inside the component to ensure it uses the correct, fetched prices.
*/
import React, { useEffect, useState } from 'react';
import { useCarrito } from '../context/CarritoContext';
import { useAuth } from '../context/AuthContext';
import { FaTrashAlt, FaArrowLeft, FaPlus, FaMinus } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const Carrito = () => {
    // Removed `calcularTotal` as it will be handled locally
    const { carrito, eliminarDelCarrito, actualizarCantidad, vaciarCarrito } = useCarrito();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [productosInfo, setProductosInfo] = useState({});

    useEffect(() => {
        const cargarDatosFaltantes = async () => {
            const nuevosDatos = {};
            for (const item of carrito) {
                const itemKey = item.id + (item.variationId || '');
                if (!productosInfo[itemKey] && (!item.name || !item.imageUrl || item.price === null || item.price === undefined)) {
                    const ref = doc(db, 'productos', item.id);
                    const snap = await getDoc(ref);
                    if (snap.exists()) {
                        const data = snap.data();
                        if (data.hasVariations && item.variationId) {
                            const variacion = data.variationsList.find(v => v.id === item.variationId);
                            if (variacion) {
                                nuevosDatos[itemKey] = { name: data.nombre, imageUrl: variacion.imagen || data.imagen, price: variacion.precio, attributes: variacion.attributes || {} };
                            }
                        } else {
                            nuevosDatos[itemKey] = { name: data.nombre, imageUrl: data.imagen, price: data.precio };
                        }
                    }
                }
            }
            if (Object.keys(nuevosDatos).length > 0) {
                setProductosInfo(prev => ({ ...prev, ...nuevosDatos }));
            }
        };
        if (carrito.length > 0) {
            cargarDatosFaltantes();
        }
    }, [carrito, productosInfo]);
    
    // CORRECTED: Calculate total locally to ensure correct prices are used.
    const totalCompra = carrito.reduce((acc, item) => {
        const itemKey = item.id + (item.variationId || '');
        const info = productosInfo[itemKey] || {};
        const precio = item.price ?? info.price ?? 0;
        return acc + (precio * item.quantity);
    }, 0);

    const handleContinuarCompra = () => {
        if (!currentUser) {
            Swal.fire({
                title: 'Inicio de Sesión Requerido',
                text: 'Para continuar con la compra, por favor inicia sesión o crea una cuenta.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Iniciar Sesión',
                cancelButtonText: 'Cancelar',
            }).then((result) => {
                if (result.isConfirmed) navigate('/auth');
            });
        } else {
            navigate('/checkout');
        }
    };

    const obtenerStockDisponible = async (productId, variationId = null) => {
        try {
            const productRef = doc(db, 'productos', productId);
            const productSnap = await getDoc(productRef);
            if (productSnap.exists()) {
                const data = productSnap.data();
                if (data.hasVariations === true && variationId && data.variationsList) {
                    const variation = data.variationsList.find(v => v.id === variationId);
                    return variation ? (variation.stock || 0) : 0;
                }
                return data.stock || 0;
            }
            return 0;
        } catch (error) {
            console.error("Error obteniendo stock:", error);
            toast.error("Error al verificar stock.");
            return 0;
        }
    };

    const handleCantidadChange = async (itemId, nuevaCantidad, variationId = null) => {
        const cantidad = parseInt(nuevaCantidad, 10);
        if (isNaN(cantidad) || cantidad <= 0) {
            eliminarDelCarrito(itemId, variationId);
            toast.success("Producto eliminado del carrito.");
        } else {
            const stockDisponible = await obtenerStockDisponible(itemId, variationId);
            if (cantidad > stockDisponible) {
                actualizarCantidad(itemId, stockDisponible, variationId);
                toast.warn(`Stock máximo disponible: ${stockDisponible} unidades.`);
            } else {
                actualizarCantidad(itemId, cantidad, variationId);
            }
        }
    };

    const handleVaciarCarrito = () => {
        Swal.fire({
            title: '¿Vaciar Carrito?',
            text: "Se eliminarán todos los productos de tu carrito.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, vaciar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                vaciarCarrito();
                toast.error("Carrito vaciado con éxito.");
            }
        });
    };

    return (
        <div className="carrito-page">
            <ToastContainer position="top-center" autoClose={2000} hideProgressBar newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
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
                        {carrito.map(item => {
                            const itemKey = item.id + (item.variationId || '');
                            const info = productosInfo[itemKey] || {};
                            const nombre = item.name || info.name || 'Cargando...';
                            const imagen = item.imageUrl || info.imageUrl || 'https://placehold.co/100x100/eee/ccc?text=...';
                            const precio = item.price ?? info.price ?? 0;
                            const attrs = item.attributes || info.attributes || {};

                            return (
                                <div key={itemKey} className="carrito-item">
                                    <img src={imagen} alt={nombre} className="item-image"/>
                                    <div className="item-details">
                                        <h2 className="item-name">{nombre}</h2>
                                        {item.hasVariations && Object.keys(attrs).length > 0 && (
                                            <p className="item-variation-attrs">
                                                {Object.entries(attrs).map(([key, value]) => `${key}: ${value}`).join(' | ')}
                                            </p>
                                        )}
                                        <p className="item-price">Precio: ${precio.toFixed(2)}</p>
                                        <div className="item-quantity">
                                            <label htmlFor={`cantidad-${itemKey}`}>Cantidad:</label>
                                            <div className="quantity-controls">
                                                 <button onClick={() => handleCantidadChange(item.id, item.quantity - 1, item.variationId)} aria-label="Restar uno">
                                                    <FaMinus />
                                                </button>
                                                <input
                                                    id={`cantidad-${itemKey}`}
                                                    type="number"
                                                    className="cantidad-input"
                                                    value={item.quantity}
                                                    onChange={(e) => handleCantidadChange(item.id, e.target.value, item.variationId)}
                                                    aria-label="Cantidad"
                                                    min="1"
                                                />
                                                <button onClick={() => handleCantidadChange(item.id, item.quantity + 1, item.variationId)} aria-label="Sumar uno">
                                                    <FaPlus />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="item-subtotal">Subtotal: <strong>${(precio * item.quantity).toFixed(2)}</strong></p>
                                    </div>
                                    <button className="item-delete-button" onClick={() => eliminarDelCarrito(item.id, item.variationId)} aria-label={`Eliminar ${nombre}`}>
                                        <FaTrashAlt />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    <div className="carrito-summary">
                         <div className="total-section">
                             <span className="total-label">Total Compra:</span>
                             {/* Use the locally calculated total */}
                             <span className="total-amount">${totalCompra.toFixed(2)}</span>
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
