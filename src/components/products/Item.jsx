import React from 'react'

const Item = ( {producto} ) => {
    //Un item es donde tenemos recien la visual a nuestro gusto de lo que recibimos, luego veremos como hacer para toquetear un poquito. aca luego tenemos que agregar el botoncito de compra etc. 
    return (
        <div key={producto.id} className='product'>
            <img src={producto.imagen} alt={producto.nombre} />
            <h2>{producto.nombre}</h2>
            <h4>${producto.precio}</h4>
            <p>{producto.descripcion}</p>
            <strong>{producto.categoria}</strong>
            <p>Cantidad: {producto.stock}</p>
        </div>
    )
}

export default Item