import React from 'react'

const Item = ( {producto} ) => {
    return (
        <div key={producto.id} className='product'>
            <img src={producto.producto.imagen} alt={producto.producto.nombre} />
            <h2>{producto.producto.nombre}</h2>
            <h4>${producto.producto.precio}</h4>
            <p>{producto.producto.descripcion}</p>
            <strong>{producto.categorias}</strong>
            <p>Cantidad: {producto.producto.stock}</p>
        </div>
    )
}

export default Item