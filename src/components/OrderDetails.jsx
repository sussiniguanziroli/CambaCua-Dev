import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaSearch, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

const OrderHistoryItem = ({ order }) => (
    <div className="order-history-item">
        <div className="order-info">
            <span className="order-id">Pedido #{order.id.substring(0, 8)}...</span>
            <span className="order-date">{order.fecha}</span>
        </div>
        <div className="order-details-right">
            <span className="order-total">${order.total.toFixed(2)}</span>
            <span className={`status-badge ${order.estado.toLowerCase()}`}>{order.estado}</span>
            <Link to={`/order-summary/${order.id}`} className="details-link">Ver Detalles</Link>
        </div>
    </div>
);

const OrderDetails = () => {
    const { currentUser } = useAuth();
    const [allOrders, setAllOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('date-desc');

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const fetchOrders = async () => {
            setLoading(true);
            setError('');
            try {
                const q1 = query(collection(db, "pedidos"), where("userId", "==", currentUser.uid));
                const q2 = query(collection(db, "pedidos_completados"), where("userId", "==", currentUser.uid));

                const [pedidosSnap, completadosSnap] = await Promise.all([
                    getDocs(q1),
                    getDocs(q2)
                ]);

                const fetchedOrders = [];
                pedidosSnap.forEach(doc => fetchedOrders.push({ id: doc.id, ...doc.data() }));
                completadosSnap.forEach(doc => fetchedOrders.push({ id: doc.id, ...doc.data() }));

                const formattedOrders = fetchedOrders.map(order => ({
                    ...order,
                    fecha: new Date(order.fecha.seconds * 1000)
                }));
                
                setAllOrders(formattedOrders);

            } catch (err) {
                console.error("Error fetching user orders:", err);
                setError('No se pudieron cargar tus compras. Inténtalo de nuevo.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [currentUser]);

    const filteredAndSortedOrders = useMemo(() => {
        let orders = [...allOrders];

        if (searchTerm) {
            orders = orders.filter(order => order.id.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        orders.sort((a, b) => {
            switch (sortOption) {
                case 'date-asc':
                    return a.fecha - b.fecha;
                case 'total-desc':
                    return b.total - a.total;
                case 'total-asc':
                    return a.total - b.total;
                case 'date-desc':
                default:
                    return b.fecha - a.fecha;
            }
        });
        
        return orders.map(order => ({...order, fecha: order.fecha.toLocaleDateString('es-AR')}));

    }, [allOrders, searchTerm, sortOption]);

    if (loading) {
        return <div className="order-details-container"><div className='css-loader'></div><h5 className="loader">Cargando tus compras...</h5></div>;
    }

    if (error) {
        return <div className="order-details-container"><p className="error-message">{error}</p></div>;
    }

    return (
        <div className="order-details-container my-purchases-container">
            <div className="my-purchases-header">
                <h2>Mis Compras</h2>
                <p>Aquí encontrarás el historial de todos tus pedidos.</p>
            </div>

            <div className="controls-bar">
                <div className="search-control">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Buscar por N° de pedido..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="sort-control">
                    <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                        <option value="date-desc">Más Recientes</option>
                        <option value="date-asc">Más Antiguas</option>
                        <option value="total-desc">Mayor Total</option>
                        <option value="total-asc">Menor Total</option>
                    </select>
                </div>
            </div>

            <div className="order-history-list">
                {filteredAndSortedOrders.length > 0 ? (
                    filteredAndSortedOrders.map(order => <OrderHistoryItem key={order.id} order={order} />)
                ) : (
                    <div className="no-orders-found">
                        {searchTerm 
                            ? <p>No se encontraron pedidos que coincidan con tu búsqueda.</p>
                            : <p>Aún no has realizado ninguna compra.</p>
                        }
                        <Link to="/productos" className="shop-now-button">Ir a la Tienda</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderDetails;