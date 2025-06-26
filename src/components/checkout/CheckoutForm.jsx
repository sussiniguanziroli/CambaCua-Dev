import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AddressAutocompleteWrapper from './AdressAutocomplete'; // Import the new wrapper component
import Swal from 'sweetalert2';

const CheckoutForm = ({ onNext }) => {
    const { currentUser } = useAuth();
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        direccion: '',
        placeId: '',
        indicaciones: '',
        dni: ''
    });

    // This is the single, clean point of communication from the autocomplete component.
    const handleAddressSelect = ({ address, placeId }) => {
        setFormData(prev => ({
            ...prev,
            direccion: address,
            placeId: placeId,
        }));
    };
    
    // Standard handler for all other simple form inputs.
    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    useEffect(() => {
        if (currentUser) {
            setFormData(prevData => ({ ...prevData, nombre: currentUser.displayName || prevData.nombre }));
        }
    }, [currentUser]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.placeId) {
            Swal.fire({
                icon: 'warning',
                title: 'Dirección no válida',
                text: 'Por favor, busca y selecciona una dirección de la lista de sugerencias para continuar.',
            });
            return;
        }
        onNext(formData);
    };

    return (
        <div className="checkout-form-container">
            <h2>Datos de Envío</h2>
            <form onSubmit={handleSubmit} autoComplete="off">
                <div>
                    <label>Nombre y Apellido</label>
                    <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
                </div>
                <div>
                    <label>Teléfono</label>
                    <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Ej: 3794123456" required />
                </div>
                <div>
                    <label>Dirección</label>
                    {/* The new, stable component is used here */}
                    <AddressAutocompleteWrapper onPlaceSelect={handleAddressSelect} />
                </div>
                <div>
                    <label>Indicaciones Adicionales (Opcional)</label>
                    <input type="text" name="indicaciones" value={formData.indicaciones} onChange={handleChange} placeholder="Ej: Piso 5, Dpto A / Portón negro" />
                </div>
                <div>
                    <label>DNI</label>
                    <input type="number" name="dni" value={formData.dni} onChange={handleChange} required />
                </div>
                <button type="submit" className="checkout-button">Siguiente</button>
            </form>
        </div>
    );
};

export default CheckoutForm;
