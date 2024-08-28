import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import ItemList from './ItemList';
import { FiSearch } from 'react-icons/fi'; // Importamos el icono de búsqueda
import { Link } from 'react-router-dom'; // Importar Link para la navegación
import { FaMinus, FaPlus, FaShoppingCart, FaTimes, FaTrashAlt } from 'react-icons/fa'; // Ejemplo de ícono
import { CarritoProvider, useCarrito } from '../../context/CarritoContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';





const ItemListContainer = () => {
    const { calcularTotal, carrito, eliminarDelCarrito, actualizarCantidad, vaciarCarrito } = useCarrito(CarritoProvider);
    const [productos, setProductos] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState(''); // Nuevo estado para subcategoría

    // Obtener productos desde Firebase
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
                setFilteredProducts(productosFirebase);
            } catch (error) {
                console.error("Error obteniendo los productos: ", error);
            }
        };

        obtenerProductos();
    }, []);

    // Obtener categorías desde Firebase
    useEffect(() => {
        const obtenerCategorias = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'categories'));
                const categoriesFirebase = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setCategories(categoriesFirebase);
            } catch (error) {
                console.error("Error obteniendo las categorías: ", error);
            }
        };

        obtenerCategorias();
    }, []);

    // Filtrar productos basado en categoría, subcategoría y búsqueda
    useEffect(() => {
        let filtered = productos;

        if (selectedCategory) {
            filtered = filtered.filter(producto => producto.categoryAdress === selectedCategory);
        }

        if (selectedSubcategory) {
            filtered = filtered.filter(producto => producto.subcategoria === selectedSubcategory);
        }

        if (searchTerm) {
            filtered = filtered.filter(producto =>
                producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredProducts(filtered);
    }, [searchTerm, selectedCategory, selectedSubcategory, productos]);

    //FUNCION PARA MENU FACHERISIMO EN DEKTOP

    const [isMenuHidden, setIsMenuHidden] = useState(true);

    const toggleMenuFachaCarrito = () => {
        setIsMenuHidden(!isMenuHidden);
    };

    const closeMenu = () => {
        setIsMenuHidden(true);
    };



    //TRAIGO ACA LA LOGICA DEL CARRITO PARA NO MANOSEAR MUCHO

    const handleCantidadChange = (id, e) => {
        const cantidad = parseInt(e.target.value, 10);
        if (cantidad >= 0) {
            actualizarCantidad(id, cantidad);
        }
    };

    const notifyEliminar = () => toast.error("Producto Eliminado!");
    const notifyVaciar = () => toast.error("Carrito Vacio!");


    return (
        <div className='item-list-container'>
            <div className='item-list-container-controls'>
                <h1>Productos</h1>

                {/* Botón de Carrito DESKTOP*/}
                <div className='carrito-button-container hiddenInMobile'>

                    <button onClick={toggleMenuFachaCarrito} className='carrito-button'><FaShoppingCart />
                        <strong>{carrito.length}</strong>
                    </button>

                </div>

                {/* Menú Lateral */}
                <div className={`carrito-menu-desk ${isMenuHidden ? 'hidden' : 'visible'}`}>
                    <button className='close-menu-button' onClick={closeMenu}>
                        <FaTimes />
                    </button>
                    <h2>Tu Carrito</h2>
                    {carrito.length === 0 ? (
                        <p>El carrito está vacío</p>
                    ) : (
                        <div>
                            {carrito.map(item => (
                                <div key={item.id} className="carrito-item-desk">
                                    <div className='carrito-first-item'>

                                        
                                        <img src={item.imagen} alt={item.nombre} />

                                        <h2>{item.nombre}</h2>
                                    </div>

                                    <p>Precio: ${item.precio}</p>
                                    <div className="cantidad-control">
                                        <button onClick={() => handleCantidadChange(item.id, { target: { value: item.cantidad - 1 } })}><FaMinus /></button>
                                        <input
                                            type="number"
                                            value={item.cantidad}
                                            onChange={(e) => handleCantidadChange(item.id, e)}
                                        />
                                        <button onClick={() => handleCantidadChange(item.id, { target: { value: item.cantidad + 1 } })}><FaPlus /></button>
                                    </div>
                                    <div className='precio-borrar'>
                                        <p className="total-price">Subtotal: ${item.precio * item.cantidad}</p>
                                        <button className="eliminar-button" onClick={() => { eliminarDelCarrito(item.id); notifyEliminar() }}>
                                            <FaTrashAlt />Eliminar
                                        </button>
                                    </div>

                                </div>
                            ))}
                            <strong className='total-compra'>Total Compra: ${(calcularTotal()).toFixed(2)}</strong>
                            <button className='button-vaciar' onClick={() => { vaciarCarrito(); notifyVaciar() }}>Vaciar Carrito</button>
                        </div>

                    )}
                </div>


                {/* Botón de Carrito MOBILE*/}
                <div className='carrito-button-container hiddenInDesktop'>
                    <Link className='cart-link' to="/carrito">
                        <button className='carrito-button'><FaShoppingCart />
                            <strong>{carrito.length}</strong>
                        </button>
                    </Link>
                </div>

                {/* Barra de búsqueda */}
                <div className="search-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Buscar productos"
                    />
                    <FiSearch className="search-icon" />
                </div>
                <div className='search-container'>
                    {/* Filtro de categorías */}
                    <select className='menu-categorias'
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setSelectedSubcategory(''); // Reiniciar subcategoría cuando se cambia la categoría
                        }}
                    >
                        <option value="">Todas las categorías</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.adress}>
                                {category.nombre}
                            </option>
                        ))}
                    </select>

                    {/* Filtro de subcategorías */}
                    {selectedCategory && (
                        <select className='menu-subcategorias'
                            value={selectedSubcategory}
                            onChange={(e) => setSelectedSubcategory(e.target.value)}
                        >
                            <option value="">Todas las subcategorías</option>
                            {categories.find(category => category.adress === selectedCategory)
                                ?.subcategorias.map(subcat => (
                                    <option key={subcat} value={subcat}>
                                        {subcat}
                                    </option>
                                ))}
                        </select>
                    )}
                </div>


            </div>

            <ItemList
                productos={filteredProducts}
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
                selectedSubcategory={selectedSubcategory}
            />
        </div>
    );
};

export default ItemListContainer;
