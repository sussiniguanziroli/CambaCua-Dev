import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import ItemDetail from './ItemDetail';
import {doc, getDoc } from "firebase/firestore";
import {db} from '../../firebase/config'


const ItemDetailContainer = () => {

    let { itemId } = useParams();
    let [producto, setProducto] = useState(undefined);

    useEffect(() => {

        const documentRef = doc(db, "productos", itemId);
        getDoc(documentRef)
            .then(res => {
                setProducto({...res.data(), id: res.id});
            });

    }, [itemId])


  return (
    <div className='item-detail-loading'>{producto ? 
        <ItemDetail product={producto}/>
        : <div className='gif-carga-item'></div> }</div>
  )
}

export default ItemDetailContainer