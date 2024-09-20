// src/components/Carrito.jsx
import React, { useEffect, useState } from 'react';
import { useCarrito } from '../context/CarritoContext';
import { FaTrashAlt, FaArrowLeft, FaPlus, FaMinus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { doc, getDoc, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase/config';

const Carrito = () => {
    const [productos, setProductos] = useState([]);
    const { calcularTotal, carrito, eliminarDelCarrito, actualizarCantidad, vaciarCarrito } = useCarrito();

    const notifyEliminar = () => toast.error("Producto Eliminado!");
    const notifyVaciar = () => toast.error("Carrito Vacio!");

    useEffect(() => {
        const obtenerProductos = async () => {
            try {
                const q = query(collection(db, 'productos'), where('activo', '==', true));
                const snapshot = await getDocs(q);
                const productosFirebase = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProductos(productosFirebase);
                setFilteredProducts(productosFirebase);
            } catch (error) {
                console.error("Error obteniendo los productos: ", error);
            }
        };

        obtenerProductos();
    }, []);

    useEffect(() => {
        const fetchStock = async () => {
            const stock = await obtenerStockDisponible(productos.id);
            setStockActual(stock); // Puedes almacenar el stock en el estado local
        };
        fetchStock();
    }, [productos.id]); // Consulta el stock cada vez que cambie el producto


    const obtenerStockDisponible = async (productoId) => {
        // Aquí realizas la consulta a Firebase para obtener el stock
        const productoRef = doc(db, 'productos', productoId);
        const productoSnapshot = await getDoc(productoRef);
        if (productoSnapshot.exists()) {
            return productoSnapshot.data().stock;
        } else {
            return 0; // Si no existe, retornas stock 0
        }
    };


    const handleCantidadChangeMobile = async (id, e) => {
        const cantidad = parseInt(e.target.value, 10);
        const stockDisponible = await obtenerStockDisponible(id); // Consulta del stock actual
    
        if (cantidad > stockDisponible) {
            actualizarCantidad(id, stockDisponible);
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
