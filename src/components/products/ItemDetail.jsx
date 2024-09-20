import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'


const ItemDetail = ({ product }) => {


    
    //se puede acceder a carrito desde aca sin problema ademas de que va a hacer falta.

    //tambien tenemos que hacer boton para vover como teniamos en spirit y hacerlo responsive como no jaja



    return (
        <div className='detail'>
            <div className='back-button nav-link'>
                
            </div>
            <section className='detail-section'>
                <img src={product.imagen} alt={product.image} />
                <h1>{product.nombre}</h1>
                <strong>${product.precio}</strong>
                <p>{product.description}</p>
                
            </section>
        </div>
    )
}

export default ItemDetail