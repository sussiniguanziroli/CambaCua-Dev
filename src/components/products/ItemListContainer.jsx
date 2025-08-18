import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import ItemList from './ItemList';
import { FiSearch } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { FaMinus, FaPlus, FaShoppingCart, FaTimes, FaTrashAlt } from 'react-icons/fa';
import { CarritoProvider, useCarrito } from '../../context/CarritoContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const ItemListContainer = () => {
    const { calcularTotales, carrito, eliminarDelCarrito, actualizarCantidad, vaciarCarrito } = useCarrito(CarritoProvider);
    const [productos, setProductos] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState([]);

    const location = useLocation();
    const queryParams = useQuery();
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState('');

    const [isMenuHidden, setIsMenuHidden] = useState(true);

    useEffect(() => {
        const newParams = new URLSearchParams(location.search);
        const categoryFromUrl = newParams.get('categoria') || '';
        const subcategoryFromUrl = newParams.get('subcategoria') || '';
        setSelectedCategory(categoryFromUrl);
        setSelectedSubcategory(subcategoryFromUrl);
    }, [location.search]);


    useEffect(() => {
        const obtenerProductos = async () => {
            try {
                const q = query(collection(db, 'productos'), where('activo', '==', true));
                const snapshot = await getDocs(q);
                const productosFirebase = snapshot.docs.map(doc => {
                    const data = doc.data();
                    let displayStock = data.stock;
                    let displayPrice = data.precio;
                    let hasAnyVariationStock = false;

                    if (data.hasVariations && Array.isArray(data.variationsList)) {
                        let totalStock = 0;
                        let minPrice = Infinity;

                        data.variationsList.forEach(variation => {
                            if (variation.activo && variation.stock > 0) {
                                hasAnyVariationStock = true;
                                totalStock += variation.stock;
                            }
                            if (variation.activo && variation.precio < minPrice) {
                                minPrice = variation.precio;
                            }
                        });

                        displayStock = hasAnyVariationStock ? totalStock : 0;
                        displayPrice = hasAnyVariationStock ? minPrice : null;
                    }

                    return {
                        id: doc.id,
                        ...data,
                        _displayStock: displayStock,
                        _displayPrice: displayPrice,
                        _hasAnyVariationStock: hasAnyVariationStock
                    };
                });
                setProductos(productosFirebase);
            } catch (error) {
                console.error("Error obteniendo los productos: ", error);
            }
        };

        obtenerProductos();
    }, []);

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

    useEffect(() => {
        let filtered = productos.filter(producto => {
            const matchesCategory = !selectedCategory || producto.categoryAdress === selectedCategory;
            const matchesSubcategory = !selectedSubcategory || producto.subcategoria === selectedSubcategory;

            const matchesSearch = !searchTerm ||
                producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (producto.descripcion && producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));

            return matchesCategory && matchesSubcategory && matchesSearch;
        });

        const productosConStock = filtered.filter(producto =>
            producto.hasVariations ? producto._hasAnyVariationStock : producto._displayStock > 0
        );
        const productosSinStock = filtered.filter(producto =>
            producto.hasVariations ? !producto._hasAnyVariationStock : producto._displayStock === 0
        );

        const productosOrdenados = [...productosConStock, ...productosSinStock];

        setFilteredProducts(productosOrdenados);
    }, [searchTerm, selectedCategory, selectedSubcategory, productos]);

    const handleCategoryClick = (categoryAdress) => {
        setSelectedCategory(categoryAdress);
        setSelectedSubcategory('');
    };

    const toggleMenuFachaCarrito = () => {
        setIsMenuHidden(!isMenuHidden);
    };

    const closeMenu = () => {
        setIsMenuHidden(true);
    };

    const obtenerStockDisponible = async (productoId, variationId = null) => {
        const productRef = doc(db, 'productos', productoId);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
            const data = productSnap.data();
            if (data.hasVariations && variationId) {
                const variation = data.variationsList.find(v => v.id === variationId);
                return variation ? variation.stock : 0;
            }
            return data.stock;
        }
        return 0;
    };

    const handleCantidadChangeDesktop = async (id, e, variationId = null) => {
        const cantidad = parseInt(e.target.value, 10);
        const stockDisponible = await obtenerStockDisponible(id, variationId);

        if (cantidad > stockDisponible) {
            actualizarCantidad(id, stockDisponible, variationId);
            toast.info(`Se ha alcanzado el máximo de productos disponibles (${stockDisponible})`);
        } else if (cantidad > 0) {
            actualizarCantidad(id, cantidad, variationId);
        } else {
            eliminarDelCarrito(id, variationId);
            notifyEliminar();
        }
    };

    const notifyEliminar = () => toast.error("Producto Eliminado!");
    const notifyVaciar = () => toast.error("Carrito Vacio!");

    const currentCategoryData = categories.find(cat => cat.adress === selectedCategory);
    const showSubcategories = currentCategoryData && currentCategoryData.subcategorias && currentCategoryData.subcategorias.length > 0;
    const { totalFinal } = calcularTotales();

    return (
        <div className='item-list-container'>
            <div className='item-list-container-controls'>
                <h1>Productos</h1>

                <div className='carrito-button-container hiddenInMobile'>
                    <button onClick={toggleMenuFachaCarrito} className='carrito-button'><FaShoppingCart />
                        <strong>{carrito.length}</strong>
                    </button>
                </div>

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
                                <div key={item.id + (item.variationId || '')} className="carrito-item-desk">
                                    <div className='carrito-first-item'>
                                        <img src={item.imageUrl} alt={item.name} />
                                        <h2>
                                            {item.name}
                                            {item.hasVariations && item.attributes && (
                                                <span className="text-sm text-gray-600 ml-2">
                                                    ({Object.values(item.attributes).join(', ')})
                                                </span>
                                            )}
                                        </h2>
                                    </div>
                                    <p>Precio: ${item.price?.toFixed(2)}</p>
                                    <div className="cantidad-control">
                                        <button onClick={() => handleCantidadChangeDesktop(item.id, { target: { value: item.quantity - 1 } }, item.variationId)}><FaMinus /></button>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => handleCantidadChangeDesktop(item.id, e, item.variationId)}
                                        />
                                        <button onClick={() => handleCantidadChangeDesktop(item.id, { target: { value: item.quantity + 1 } }, item.variationId)}><FaPlus /></button>
                                    </div>
                                    <div className='precio-borrar'>
                                        <p className="total-price">Subtotal: ${(item.price * item.quantity)?.toFixed(2)}</p>
                                        <button className="eliminar-button" onClick={() => { eliminarDelCarrito(item.id, item.variationId); notifyEliminar() }}>
                                            <FaTrashAlt />Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <strong className='total-compra'>Total Compra: ${totalFinal.toFixed(2)}</strong>
                            <button className='button-vaciar' onClick={() => { vaciarCarrito(); notifyVaciar() }}>Vaciar Carrito</button>
                            <Link to="/checkout"><button className='button-comprar'>Continuar Compra</button></Link>
                        </div>
                    )}
                </div>

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

                <div className="category-filters">
                    <button
                        className={`filter-button ${selectedCategory === '' ? 'active' : ''}`}
                        onClick={() => handleCategoryClick('')}
                    >
                        Ver Todos
                    </button>
                    {categories.map(category => (
                        <button
                            key={category.id}
                            className={`filter-button ${selectedCategory === category.adress ? 'active' : ''}`}
                            onClick={() => handleCategoryClick(category.adress)}
                        >
                            {category.nombre}
                        </button>
                    ))}
                </div>

                {showSubcategories && (
                    <div className="subcategory-filters">
                         <button
                            className={`filter-button-sub ${selectedSubcategory === '' ? 'active' : ''}`}
                            onClick={() => setSelectedSubcategory('')}
                        >
                            Todas
                        </button>
                        {currentCategoryData.subcategorias.map(subcat => (
                             <button
                                key={subcat}
                                className={`filter-button-sub ${selectedSubcategory === subcat ? 'active' : ''}`}
                                onClick={() => setSelectedSubcategory(subcat)}
                            >
                                {subcat}
                            </button>
                        ))}
                    </div>
                )}
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
