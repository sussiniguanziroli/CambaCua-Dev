import React, { useState } from 'react';
import Item from './Item';
import { GridLoader } from 'react-spinners';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const ITEMS_PER_PAGE = 8; // Número de productos por página

const ItemList = ({ productos, searchTerm, selectedCategory, selectedSubcategory }) => {
    const [currentPage, setCurrentPage] = useState(1);


    // Calcular los índices de los productos a mostrar en la página actual
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = productos.slice(indexOfFirstItem, indexOfLastItem);



    // Calcular el número total de páginas
    const totalPages = Math.ceil(productos.length / ITEMS_PER_PAGE);

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const notifyAgregado = () => toast.success("Agregado al carrito");
    const notifyCarrito = () => toast.info("Producto ya agregado!");

    


    return (
        <div className='item-list-container'>
            <ToastContainer
                autoClose={1500}

                position="top-left"
            />
            <div className='item-list'>
                {currentItems.length > 0 ? (
                    currentItems.map(producto => (

                        <Item key={producto.id} notifyAgregado={notifyAgregado} notifyCarrito={notifyCarrito}  producto={producto} />

                    ))
                ) : searchTerm || selectedCategory || selectedSubcategory ? (
                    <div className='no-results'>
                        <p>Ningún producto coincide con el criterio de búsqueda.</p>
                    </div>
                ) : (
                    <div className='loader'>
                        <GridLoader color="#0b369c" size={25} margin={2} />
                    </div>
                )}
            </div>

            {/* Controles de paginación */}
            {productos.length > ITEMS_PER_PAGE && (
                <div className='pagination'>
                    <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                    >
                        <FiChevronLeft size={20} />
                    </button>
                    <span>{`Página ${currentPage} de ${totalPages}`}</span>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                    >
                        <FiChevronRight size={20} />
                    </button>
                </div>
            )}


        </div>
    );
}

export default ItemList;
