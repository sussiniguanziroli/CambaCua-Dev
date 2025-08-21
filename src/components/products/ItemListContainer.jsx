import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import ItemList from './ItemList';
import { FiSearch } from 'react-icons/fi';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const ItemListContainer = () => {
    const [productos, setProductos] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState([]);

    const location = useLocation();
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState('');

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
    
    const currentCategoryData = categories.find(cat => cat.adress === selectedCategory);
    const showSubcategories = currentCategoryData && currentCategoryData.subcategorias && currentCategoryData.subcategorias.length > 0;

    return (
        <div className='item-list-container'>
            <div className='item-list-container-controls'>
                <h1>Productos</h1>

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
