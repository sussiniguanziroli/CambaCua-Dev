import React from 'react'
import Item from './Item'
import { GridLoader } from 'react-spinners'

const ItemList = ({ productos, searchTerm, selectedCategory, selectedSubcategory }) => {
    return (
        <div className='item-list'>
            
            {productos.length > 0 ? (
                productos.map(producto => (
                    <Item key={producto.id} producto={producto} />
                ))
            ) : searchTerm || selectedCategory || selectedSubcategory  ? (
                <div className='no-results'>
                    <p>Ningún producto coincide con el criterio de búsqueda.</p>
                </div>
            ) : (
                <div className='loader'>
                    <GridLoader color="#0b369c" size={25} margin={2} />
                </div>
            )}
        </div>
    )
}

export default ItemList
