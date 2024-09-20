import React, { useContext } from 'react'
import { useCarrito } from '../../context/CarritoContext'
import Swal from 'sweetalert2'

const ItemDetail = ({ product, notifyDetailAgregado }) => {

    const { agregarAlCarrito, carrito } = useCarrito();

    //se puede acceder a carrito desde aca sin problema ademas de que va a hacer falta.

    //tambien tenemos que hacer boton para vover como teniamos en spirit y hacerlo responsive como no jaja

    let cartItems = carrito;
    const existsInCart = cartItems.some(item => item.id === product.id);


    const handleAddToCart = () => {

        if (existsInCart) {
            // Mostrar alerta usando Toastify
            Swal.fire({
                title: "Producto ya en carrito",
                text: "Para agregar mas de uno, debes seleccionar la cantidad desde el carrito!",
                icon: "info",
                confirmButtonColor: '#0b369c',
            });
        } else {
            // Lógica para agregar el producto al carrito
            agregarAlCarrito(product);
            notifyDetailAgregado();
        }



    };

    return (
        <div className='detail'>
            <div className='detail-img'>
                <img src={product.imagen} alt={product.image} />
            </div>
            <div className='detail-text'>
                <h1>{product.nombre}</h1>
                <p>{product.descripcion}</p>
                <strong>${product.precio}</strong>
                <p>Disponibilidad: {product.stock}</p>
                <div>
                    {product.stock === 0 ? (
                        <div className="stock-status">Sin Stock</div>
                    ) : (
                        <button className="add-to-cart-button-detail" onClick={handleAddToCart}>
                            {existsInCart ? "En carrito" : "Agregar al carrito"}
                        </button>
                    )}
                </div>
            </div>

        </div>
    )
}

export default ItemDetail