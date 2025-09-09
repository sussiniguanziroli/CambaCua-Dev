import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaSearch, FaChevronDown, FaChevronUp, FaGift, FaTags, FaHandshake, FaTicketAlt } from 'react-icons/fa';
import CouponRedeemer from './utils/CouponRedeemer';

const getPromoDescription = (item) => {
    if (!item.promocion) return null;
    switch (item.promocion.type) {
        case 'percentage_discount': return `${item.promocion.value}% OFF`;
        case '2x1': return `Promo 2x1`;
        case 'second_unit_discount': return `${item.promocion.value}% en 2da unidad`;
        default: return "Promo";
    }
};

const OrderProductItem = ({ item }) => {
    const promoDescription = getPromoDescription(item);
    return (
        <div className="order-product-item">
            <img src={item.imageUrl} alt={item.name} className="product-image"/>
            <div className="product-info">
                <h4>{item.name}</h4>
                {item.hasVariations && item.attributes && (<p className="product-variation-attrs">{Object.entries(item.attributes).map(([key, value]) => `${key}: ${value}`).join(' | ')}</p>)}
                {promoDescription && <span className="promo-badge-details">{promoDescription}</span>}
                <div className="product-meta"><span>${item.price?.toFixed(2)} c/u</span><span>Cant: {item.quantity}</span></div>
            </div>
            <div className="product-subtotal">${(item.price * item.quantity)?.toFixed(2)}</div>
        </div>
    );
};

const OrderHistoryItem = ({ order }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="order-history-item">
            <div className="order-summary-header" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="order-info">
                    <span className="order-id">Pedido #{order.id.substring(0, 8)}...</span>
                    <span className="order-date">{order.fecha}</span>
                </div>
                <div className="order-details-right">
                    <span className="order-total">${order.total.toFixed(2)}</span>
                    <span className={`status-badge ${order.estado.toLowerCase()}`}>{order.estado}</span>
                    <button className="expand-button">{isExpanded ? <FaChevronUp /> : <FaChevronDown />}</button>
                </div>
            </div>
            {isExpanded && (
                <div className="order-details-expanded">
                    <div className="expanded-section">
                        <h4>Productos del Pedido:</h4>
                        <div className="order-products-list">{order.productos.map((item, index) => (<OrderProductItem key={`${item.id}-${item.variationId || index}`} item={item} />))}</div>
                    </div>
                    <div className="expanded-section">
                        <h4>Detalles de Envío:</h4>
                        <p><strong>Nombre:</strong> {order.nombre}</p>
                        <p><strong>Dirección:</strong> {order.direccion}</p>
                        {order.indicaciones && <p><strong>Indicaciones:</strong> {order.indicaciones}</p>}
                        <p><strong>Método de Pago:</strong> {order.metodoPago}</p>
                        {order.costoEnvio > 0 && <p><strong>Costo de Envío:</strong> ${order.costoEnvio.toFixed(2)}</p>}
                    </div>
                     {(order.descuentoPromociones > 0 || order.puntosDescontados > 0 || order.descuentoConvenio > 0) && (
                         <div className="expanded-section">
                            <h4>Descuentos Aplicados</h4>
                            {order.descuentoPromociones > 0 && (
                                <p className="discount-details promo-discount-details">
                                    <FaTags /> <strong>Promociones:</strong> -${order.descuentoPromociones.toFixed(2)}
                                </p>
                            )}
                            {order.descuentoConvenio > 0 && (
                                <p className="discount-details convenio-discount-details">
                                    <FaHandshake /> <strong>Convenio:</strong> -${order.descuentoConvenio.toFixed(2)}
                                </p>
                            )}
                            {order.puntosDescontados > 0 && (
                                <p className="discount-details points-discount-details">
                                    <FaGift /> <strong>Puntos Usados:</strong> -${order.puntosDescontados.toFixed(2)}
                                </p>
                            )}
                        </div>
                    )}
                    <Link to={`/order-summary/${order.id}`} className="details-link">Ver Resumen Completo</Link>
                </div>
            )}
        </div>
    );
};

const OrderDetails = () => {
    const { currentUser } = useAuth();
    const [allOrders, setAllOrders] = useState([]);
    const [userScore, setUserScore] = useState(0);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('date-desc');
    const [isRedeemerOpen, setIsRedeemerOpen] = useState(false);

    useEffect(() => {
        if (!currentUser) { setLoading(false); return; }

        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const userRef = doc(db, "users", currentUser.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) { 
                    setUserScore(userSnap.data().score || 0);
                    setUserRole(userSnap.data().role || 'baseCustomer');
                }

                const q1 = query(collection(db, "pedidos"), where("userId", "==", currentUser.uid));
                const q2 = query(collection(db, "pedidos_completados"), where("userId", "==", currentUser.uid));
                const [pedidosSnap, completadosSnap] = await Promise.all([getDocs(q1), getDocs(q2)]);
                
                const fetchedOrders = [];
                pedidosSnap.forEach(doc => fetchedOrders.push({ id: doc.id, ...doc.data() }));
                completadosSnap.forEach(doc => fetchedOrders.push({ id: doc.id, ...doc.data() }));
                
                const formattedOrders = fetchedOrders.map(order => ({ ...order, fecha: new Date(order.fecha.seconds * 1000) }));
                setAllOrders(formattedOrders);

            } catch (err) {
                console.error("Error fetching user data:", err);
                setError('No se pudieron cargar tus datos. Inténtalo de nuevo.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser]);

    const handleRedemptionSuccess = (pointsAdded) => {
        setUserScore(prevScore => prevScore + pointsAdded);
    };

    const filteredAndSortedOrders = useMemo(() => {
        let orders = [...allOrders];
        if (searchTerm) { orders = orders.filter(order => order.id.toLowerCase().includes(searchTerm.toLowerCase())); }
        orders.sort((a, b) => {
            switch (sortOption) {
                case 'date-asc': return a.fecha - b.fecha;
                case 'total-desc': return b.total - a.total;
                case 'total-asc': return a.total - b.total;
                case 'date-desc': default: return b.fecha - a.fecha;
            }
        });
        return orders.map(order => ({...order, fecha: order.fecha.toLocaleDateString('es-AR')}));
    }, [allOrders, searchTerm, sortOption]);

    if (loading) { return <div className="order-details-container"><div className='css-loader'></div><h5 className="loader">Cargando...</h5></div>; }
    if (error) { return <div className="order-details-container"><p className="error-message">{error}</p></div>; }

    return (
        <>
            <div className="order-details-container my-purchases-container">
                <div className="my-purchases-header">
                    <h2>Mis Compras</h2>
                    <p>Aquí encontrarás el historial de todos tus pedidos.</p>
                </div>
                
                {userRole === 'convenioCustomer' && (
                    <div className="convenio-banner">
                        <FaHandshake />
                        <span>¡Convenio Activo! 10% OFF</span>
                    </div>
                )}

                <div className="user-panel">
                    <div className="score-display">
                         <FaGift />
                         <div className="score-text">
                            <span>Tus Puntos</span>
                            <strong>{userScore}</strong>
                         </div>
                    </div>
                    <div className="redeem-action">
                        <button className="redeem-btn" onClick={() => setIsRedeemerOpen(true)}>
                            <FaTicketAlt /> Canjear Cupón
                        </button>
                    </div>
                </div>


                <div className="controls-bar">
                    <div className="search-control">
                        <FaSearch />
                        <input type="text" placeholder="Buscar por N° de pedido..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
                            {searchTerm ? <p>No se encontraron pedidos.</p> : <p>Aún no has realizado ninguna compra.</p> }
                            <Link to="/productos" className="shop-now-button">Ir a la Tienda</Link>
                        </div>
                    )}
                </div>
            </div>
            <CouponRedeemer 
                isOpen={isRedeemerOpen} 
                onClose={() => setIsRedeemerOpen(false)}
                onRedemptionSuccess={handleRedemptionSuccess}
            />
        </>
    );
};

export default OrderDetails;
