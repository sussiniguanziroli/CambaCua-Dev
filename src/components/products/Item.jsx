import React from 'react'

const Item = ( {producto} ) => {
    //Un item es donde tenemos recien la visual a nuestro gusto de lo que recibimos, luego veremos como hacer para toquetear un poquito. aca luego tenemos que agregar el botoncito de compra etc. 
    return (
        <div key={producto.id} className='product-card'>
            <img className="product-image" src={producto.imagen} alt={producto.nombre} />
            <h3 className="product-name" >{producto.nombre}</h3>
            <h4>{producto.categoria}</h4>
            <strong className="product-price" >${producto.precio}</strong>
            <button className="add-to-cart-button">Agregar al carrito</button>
        </div>
    )
}

export default Item