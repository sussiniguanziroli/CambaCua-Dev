import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config'; // Importa la configuración de Firebase
import { collection, getDocs, query, where } from 'firebase/firestore'; 
import ItemList from './ItemList';

const ItemListContainer = () => {
    const [productos, setProductos] = useState([]);

    useEffect(() => {
        const obtenerProductos = async () => {
            try {
                const q = query(collection(db, 'productos'), where('activo', '==', true));
                const snapshot = await getDocs(q);
                const productosFirebase = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProductos(productosFirebase);
            } catch (error) {
                console.error("Error obteniendo los productos: ", error);
            }
        };

        obtenerProductos();
    }, []);

    return (
        <div className='item-list-container'>
            <h1>Productos</h1>
            <ItemList productos={productos} />
        </div>
    );
};

export default ItemListContainer;
