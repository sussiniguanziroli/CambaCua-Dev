import React from 'react'
import Item from './Item'

const ItemList = ( {productos} ) => {
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