import React, { useState } from 'react'
import data from '../../data/productos.json'
import ItemList from './ItemList';

const ItemListContainer = () => {

    let [productos, setProductos] = useState([]);

    const pedirProductos = () => {
        return new Promise ((resolve, reject) => {
            resolve(data);
        })
    }

    pedirProductos()
        .then((res) => {
            setProductos(res);
        })

    
  return (
    <div className='item-list-container'>
        <h1>Productos</h1>
        <ItemList productos={productos} />
    </div>
    
  )
}

export default ItemListContainer