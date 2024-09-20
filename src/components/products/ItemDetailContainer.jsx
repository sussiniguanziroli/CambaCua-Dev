import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom';
import ItemDetail from './ItemDetail';
import { doc, getDoc } from "firebase/firestore";
import { db } from '../../firebase/config'
import { GridLoader } from 'react-spinners';
import { IoMdArrowRoundBack } from "react-icons/io";
import { NavLink } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaMinus, FaPlus, FaShoppingCart, FaTimes, FaTrashAlt } from 'react-icons/fa';

const ItemDetailContainer = () => {

    let { itemId } = useParams();
    let [producto, setProducto] = useState(undefined);

    useEffect(() => {

        const documentRef = doc(db, "productos", itemId);
        getDoc(documentRef)
            .then(res => {
                setProducto({ ...res.data(), id: res.id });
            });

    }, [itemId])

    const notifyDetailAgregado = () => toast.success("Producto agregado al carrito!");

    


    return (
        <main className='item-detail-loading'>
            
            <ToastContainer
                autoClose={1500}

                position="top-left"
            />
            <NavLink className="back-button" to="/productos"><IoMdArrowRoundBack /></NavLink>
            {producto ?
                <ItemDetail notifyDetailAgregado={notifyDetailAgregado} product={producto} />
                : <div className='loader'>
                    <GridLoader color="#0b369c" size={25} margin={2} />
                </div>}
        </main>
    )
}

export default ItemDetailContainer