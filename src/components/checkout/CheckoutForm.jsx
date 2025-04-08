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
        onNext(formData);
    };

    return (
        <div className="checkout-form-container">
            <h2>Datos de Envío</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="nombre">Nombre y Apellido</label>
                    <input
                        type="text"
                        name="nombre"
                        id="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Ej: Juan Pérez"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="telefono">Teléfono</label>
                    <input
                        type="tel"
                        name="telefono"
                        id="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="Ej: 1123456789"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="email">Correo Electrónico</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Ej: correo@ejemplo.com"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="direccion">Dirección de Entrega</label>
                    <input
                        type="text"
                        name="direccion"
                        id="direccion"
                        value={formData.direccion}
                        onChange={handleChange}
                        placeholder="Calle, número, extra (dpto, local, etc)"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="dni">DNI</label>
                    <input
                        type="number"
                        name="dni"
                        id="dni"
                        value={formData.dni}
                        onChange={handleChange}
                        placeholder="Sin puntos ni guiones"
                        required
                    />
                </div>

                <button type="submit" className="checkout-button">Siguiente</button>
            </form>
        </div>
    );
};

export default CheckoutForm;
