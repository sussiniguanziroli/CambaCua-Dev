import React from 'react';
import { FaWhatsapp, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const DevolucionesReclamos = () => {
    const navigate = useNavigate();
    const phoneNumber = "543795049384";
    const message = encodeURIComponent("tuve un problema con un pedido y necesito soporte.");
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    return (
        <div className="order-summary-container">
            <div className="summary-actions-header">
                <button onClick={() => navigate(-1)} className="summary-back-button">
                    <FaArrowLeft /> Volver
                </button>
            </div>
            <div className="order-header">
                <h2>Devoluciones y Reclamos</h2>
            </div>
            <div className="order-section" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                <p style={{ fontSize: '1.1rem', color: '#4b5563', marginBottom: '2rem' }}>
                    Para cumplir con las políticas de protección al consumidor y garantizar tu satisfacción, 
                    procesamos todos los reclamos y solicitudes de devolución a través de nuestro canal de soporte oficial.
                </p>
                <a 
                    href={whatsappUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="action-button whatsapp"
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: '8px' }}
                >
                    <FaWhatsapp size={24} /> Contactar a Soporte
                </a>
            </div>
        </div>
    );
};

export default DevolucionesReclamos;