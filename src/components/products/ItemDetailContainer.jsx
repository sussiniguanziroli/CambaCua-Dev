import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import ItemDetail from './ItemDetail'; 
import { doc, getDoc } from "firebase/firestore";
import { db } from '../../firebase/config'; 
import { GridLoader } from 'react-spinners'; 
import { IoMdArrowRoundBack } from "react-icons/io"; 
import { NavLink } from 'react-router-dom'; 
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

const ItemDetailContainer = () => {

    let { itemId } = useParams();

    let [producto, setProducto] = useState(undefined);

    useEffect(() => {

        const documentRef = doc(db, "productos", itemId);

        getDoc(documentRef)
            .then(res => {

                if (res.exists()) {
                    setProducto({ ...res.data(), id: res.id });
                } else {

                    console.log("No such product document!");
                    setProducto(null); 
                }
            })
            .catch(error => {

                console.error("Error fetching product details:", error);
                setProducto(null); 
                toast.error("Error al cargar los detalles del producto."); 
            });
    }, [itemId]); 

    const notifyDetailAgregado = () => toast.success("Producto agregado al carrito!");

    return (
        <main className='item-detail-loading'>
            {}
            <ToastContainer
                autoClose={1500} 
                position="top-left" 
            />
            {}
            <NavLink className="back-button" to="/productos"><IoMdArrowRoundBack /></NavLink>
            {}
            {producto === undefined ? (

                <div className='loader'>
                    <GridLoader color="#0b369c" size={25} margin={2} />
                </div>
            ) : producto === null ? (

                <div className='no-product-found'>
                    <p>El producto no está disponible.</p>
                </div>
            ) : (

                <ItemDetail notifyDetailAgregado={notifyDetailAgregado} product={producto} />
            )}
        </main>
    );
};

export default ItemDetailContainer;