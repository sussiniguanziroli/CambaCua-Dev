import React from 'react'; // No se necesita useState/useEffect aquí ahora
import { useCarrito } from '../context/CarritoContext';
import { FaTrashAlt, FaArrowLeft, FaPlus, FaMinus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify'; // Mantenemos Toastify para notificaciones de cantidad
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2'; // Para confirmación de vaciar carrito
import { doc, getDoc } from 'firebase/firestore'; // Solo necesitamos getDoc y doc
import { db } from '../firebase/config';

const Carrito = () => {
    // Obtenemos lo necesario del contexto
    const { carrito, eliminarDelCarrito, actualizarCantidad, vaciarCarrito, calcularTotal } = useCarrito();

    // --- LÓGICA DE STOCK Y CANTIDAD (Simplificada) ---
    const obtenerStockDisponible = async (productoId) => {
        // Esta función se mantiene igual, se llama bajo demanda
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

    // Manejador de cambio de cantidad (directo, sin input event)
    const handleCantidadChange = async (itemId, nuevaCantidad) => {
        const cantidad = parseInt(nuevaCantidad, 10);

        if (isNaN(cantidad) || cantidad <= 0) {
            // Eliminar si la cantidad es 0 o inválida
            eliminarDelCarrito(itemId);
            toast.error("Producto eliminado");
        } else {
            // Verificar stock antes de actualizar
            const stockDisponible = await obtenerStockDisponible(itemId);
            if (cantidad > stockDisponible) {
                actualizarCantidad(itemId, stockDisponible);
                toast.info(`Máximo stock disponible: ${stockDisponible}`);
            } else {
                actualizarCantidad(itemId, cantidad);
            }
        }
    };

     // Manejador Input Cantidad (si se mantiene el input)
     const handleInputChange = (itemId, event) => {
          const valorInput = event.target.value;
          // Validar si es número y mayor a 0 antes de llamar a handleCantidadChange
          // O manejar la lógica directamente aquí
          const cantidad = parseInt(valorInput, 10);
          if (!isNaN(cantidad) && cantidad > 0) {
               handleCantidadChange(itemId, cantidad); // Llama a la lógica principal
          } else if (valorInput === "") {
              // Permitir borrar el input, pero no actualizar a vacío/cero inmediatamente
              // Quizás manejar en onBlur o con un botón "Actualizar"
          } else if (!isNaN(cantidad) && cantidad <= 0) {
             // Si escribe 0 o menos, eliminar item
             eliminarDelCarrito(itemId);
             toast.error("Producto eliminado");
          }
     };

    // Manejador para Vaciar Carrito (con confirmación Swal)
    const handleVaciarCarrito = () => {
        Swal.fire({
            title: '¿Vaciar Carrito?',
            text: "Se eliminarán todos los productos.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0b369c', // Azul Cambacua
            cancelButtonColor: '#dc3545', // Rojo Peligro
            confirmButtonText: 'Sí, vaciar',
            cancelButtonText: 'Cancelar',
            customClass: { popup: 'swal2-popup' } // Aplicar fuente Poppins
        }).then((result) => {
            if (result.isConfirmed) {
                vaciarCarrito();
                toast.error("Carrito vaciado");
            }
        });
    };

    // --- RENDER ---
    return (
        <div className="carrito-page"> {/* Clase contenedora de página */}
             {/* Contenedor Toastify */}
             <ToastContainer
                 position="top-center" // Posición más centrada en móvil
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

            {/* Botón Volver */}
            <Link className='boton-volver' to="/productos">
                <FaArrowLeft /> <span>Volver a Productos</span>
            </Link>

            <h1>Carrito de Compras</h1>

            {carrito.length === 0 ? (
                <div className="empty-cart-container">
                     {/* Podrías añadir un ícono aquí */}
                    <p className='carrito-vacio'>Tu carrito está vacío.</p>
                    <Link to="/productos" className="boton-seguir-comprando">
                        Ver Productos
                    </Link>
                </div>
            ) : (
                // Contenedor principal del contenido del carrito
                <div className="carrito-content">
                    {/* Lista de Items */}
                    <div className="carrito-items-list">
                        {carrito.map(item => (
                            <div key={item.id} className="carrito-item">
                                <img src={item.imagen} alt={item.nombre} className="item-image"/>
                                <div className="item-details">
                                    <h2 className="item-name">{item.nombre}</h2>
                                    <p className="item-price">Precio: ${item.precio}</p>
                                    {/* Controles de Cantidad */}
                                    <div className="item-quantity">
                                        <label htmlFor={`cantidad-${item.id}`}>Cantidad:</label>
                                        <div className="quantity-controls">
                                             <button onClick={() => handleCantidadChange(item.id, item.cantidad - 1)} aria-label="Restar uno">
                                                <FaMinus />
                                            </button>
                                            {/* Input numérico */}
                                            <input
                                                id={`cantidad-${item.id}`}
                                                type="number"
                                                className="cantidad-input"
                                                value={item.cantidad}
                                                 // Usar onChange validado o onBlur para actualizar
                                                 onChange={(e) => handleInputChange(item.id, e)}
                                                aria-label="Cantidad"
                                                min="1" // Mínimo 1 en el input HTML
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

                    {/* Resumen y Acciones */}
                    <div className="carrito-summary">
                         <div className="total-section">
                             <span className="total-label">Total Compra:</span>
                             <span className="total-amount">${(calcularTotal()).toFixed(2)}</span>
                         </div>
                         <div className="actions-section">
                             <button className="vaciar-carrito-button" onClick={handleVaciarCarrito}>
                                 Vaciar Carrito
                             </button>
                             <Link to="/checkout" className="checkout-link">
                                 <button className='carrito-button-comprar'>Continuar Compra</button>
                             </Link>
                         </div>
                     </div>
                </div>
            )}
        </div>
    );
};

export default Carrito;