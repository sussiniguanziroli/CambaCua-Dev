import React from 'react'
import Item from './Item'

const ItemList = ( {productos} ) => {

    //en itemList solamente hacemos control de lo que se muestra en la pantalla, si productos, si grid, y condicionamos el entorno de donde luego vamos a tener nuestro grid ITEM

  return (
    <div className='productos-grid'>
        {
        productos.length > 0 ? 
        productos.map(producto => {
            return <Item producto={producto} />
        })
        : <p>No hay productos</p>
        }
    </div>
  )
}

export default ItemList