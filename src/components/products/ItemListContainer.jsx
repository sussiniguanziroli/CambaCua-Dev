import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import ItemList from './ItemList';

const ItemListContainer = () => {
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

    return (
        <div className='item-list-container'>
            <div className='item-list-container-controls'>
                <h1>Productos</h1>

                {/* Barra de búsqueda */}
                <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                {/* Filtro de categorías */}
                <select
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
                    <select
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
