import React, { useState } from 'react';

const PaymentMethod = ({ onBack, onNext , paymentMethod, setPaymentMethod}) => {
   

    const handleSelectPayment = (e) => {
        setPaymentMethod(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (paymentMethod) {
            onNext(paymentMethod);  // Pasa el método de pago al siguiente componente
        } else {
            alert('Por favor selecciona un método de pago.');
        }
    };

    return (
        <div className="payment-method-container">
            <h2>Selecciona un Método de Pago</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    <input
                        type="radio"
                        name="payment"
                        value="mercadopago"
                        checked={paymentMethod === 'mercadopago'}
                        onChange={handleSelectPayment}
                    />
                    MercadoPago
                </label>
                <label>
                    <input
                        type="radio"
                        name="payment"
                        value="transferencia"
                        checked={paymentMethod === 'transferencia'}
                        onChange={handleSelectPayment}
                    />
                    Transferencia Bancaria
                </label>

                <div className="payment-buttons">
                    <button type="button" onClick={onBack} className="checkout-button">Atrás</button>
                    <button type="submit" className="checkout-button">Confirmar y Pagar</button>
                </div>
            </form>
        </div>
    );
};

export default PaymentMethod;
