import React, { useState } from 'react';

const CheckoutForm = ({ onNext }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        email: '',
        direccion: '',
        dni: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onNext(formData);  // Pasa los datos al siguiente componente
    };

    return (
        <div className="checkout-form-container">
            <h2>Agregue sus Datos de Envío</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                />
                <input
                    type="tel"
                    name="telefono"
                    placeholder="Teléfono"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="direccion"
                    placeholder="Dirección de entrega"
                    value={formData.direccion}
                    onChange={handleChange}
                    required
                />
                <input
                    type="number"
                    name="dni"
                    placeholder="DNI"
                    value={formData.dni}
                    onChange={handleChange}
                    required
                />

                <button type="submit" className="checkout-button">Siguiente</button>
            </form>
        </div>
    );
};

export default CheckoutForm;
