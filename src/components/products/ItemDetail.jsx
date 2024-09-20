import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'


const ItemDetail = ({ product }) => {


    
    



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