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
    const { carrito, eliminarDelCarrito, actualizarCantidad, vaciarCarrito, calcularTotal } = useCarrito();
    const { currentUser } = useAuth(); 
    const navigate = useNavigate(); 
    const [productosInfo, setProductosInfo] = useState({});

    useEffect(() => {
        const cargarDatosFaltantes = async () => {
            const nuevosDatos = {};
            for (const item of carrito) {
                if (!item.name || !item.imageUrl || !item.price) {
                    const ref = doc(db, 'productos', item.id);
                    const snap = await getDoc(ref);
                    if (snap.exists()) {
                        const data = snap.data();
                        if (data.hasVariations && item.variationId) {
                            const variacion = data.variationsList.find(v => v.id === item.variationId);
                            if (variacion) {
                                nuevosDatos[item.id + (item.variationId || '')] = {
                                    name: data.nombre,
                                    imageUrl: variacion.imagen || data.imagen,
                                    price: variacion.precio,
                                    attributes: variacion.attributes || {},
                                    hasVariations: true
                                };
                            }
                        } else {
                            nuevosDatos[item.id] = {
                                name: data.nombre,
                                imageUrl: data.imagen,
                                price: data.precio,
                                hasVariations: false
                            };
                        }
                    }
                }
            }
            setProductosInfo(prev => ({ ...prev, ...nuevosDatos }));
        };
        cargarDatosFaltantes();
    }, [carrito]);

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

    const obtenerStockDisponible = async (productId, variationId = null) => {
        try {
            const productRef = doc(db, 'productos', productId);
            const productSnap = await getDoc(productRef);

            if (productSnap.exists()) {
                const data = productSnap.data();
                if (data.hasVariations && variationId && data.variationsList) {
                    const variation = data.variationsList.find(v => v.id === variationId);
                    return variation ? variation.stock : 0;
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
            toast.error("Producto eliminado");
        } else {
            const stockDisponible = await obtenerStockDisponible(itemId, variationId); 
            if (cantidad > stockDisponible) {
                actualizarCantidad(itemId, stockDisponible, variationId); 
                toast.info(`Máximo stock disponible: ${stockDisponible}`);
            } else {
                actualizarCantidad(itemId, cantidad, variationId); 
            }
        }
    };

    const handleInputChange = (itemId, event, variationId = null) => {
        const valorInput = event.target.value;
        const cantidad = parseInt(valorInput, 10);
        if (!isNaN(cantidad) && cantidad > 0) {
            handleCantidadChange(itemId, cantidad, variationId); 
        } else if (valorInput === "") {

        } else if (!isNaN(cantidad) && cantidad <= 0) {
            eliminarDelCarrito(itemId, variationId); 
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
                        {carrito.map(item => {
                            const fallback = productosInfo[item.id + (item.variationId || '')] || productosInfo[item.id] || {};
                            const nombre = item.name || fallback.name || 'Producto';
                            const imagen = item.imageUrl || fallback.imageUrl || '';
                            const precio = item.price ?? fallback.price ?? 0;
                            const attrs = item.attributes || fallback.attributes || {};
                            const hasVars = item.hasVariations ?? fallback.hasVariations;

                            return (
                                <div key={item.id + (item.variationId || '')} className="carrito-item">
                                    <img src={imagen} alt={nombre} className="item-image"/>
                                    <div className="item-details">
                                        <h2 className="item-name">{nombre}</h2>
                                        {hasVars && attrs && Object.keys(attrs).length > 0 && (
                                            <p className="item-variation-attrs">
                                                {Object.entries(attrs).map(([key, value]) => (
                                                    `${key}: ${value}`
                                                )).join(' | ')}
                                            </p>
                                        )}
                                        <p className="item-price">Precio: ${precio.toFixed(2)}</p>
                                        <div className="item-quantity">
                                            <label htmlFor={`cantidad-${item.id}-${item.variationId || ''}`}>Cantidad:</label>
                                            <div className="quantity-controls">
                                                 <button onClick={() => handleCantidadChange(item.id, item.quantity - 1, item.variationId)} aria-label="Restar uno">
                                                    <FaMinus />
                                                </button>
                                                <input
                                                    id={`cantidad-${item.id}-${item.variationId || ''}`}
                                                    type="number"
                                                    className="cantidad-input"
                                                    value={item.quantity}
                                                    onChange={(e) => handleInputChange(item.id, e, item.variationId)}
                                                    aria-label="Cantidad"
                                                    min="1"
                                                    max={item.stock} 
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
