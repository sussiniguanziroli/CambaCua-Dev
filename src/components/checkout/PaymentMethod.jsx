import React from 'react';
import Swal from 'sweetalert2';

const PaymentMethod = ({ paymentMethod, setPaymentMethod, onNext, onBack }) => {
    const handleChange = (e) => {
        const metodo = e.target.value;
        setPaymentMethod(metodo);

        if (metodo === 'Efectivo') {
            Swal.fire({
                title: 'Pago en Efectivo',
                text: 'Recordá que deberás abonar el total al motomandado cuando reciba el pedido.',
                icon: 'info',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#3085d6'
            });
        }

        if (metodo === 'Transferencia Bancaria') {
            Swal.fire({
                title: 'Pago por Transferencia',
                text: 'Al confirmar el pedido, se te mostrará la información de la cuenta para realizar la transferencia.',
                icon: 'info',
                confirmButtonText: 'Ok',
                confirmButtonColor: '#3085d6'
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onNext(paymentMethod);
    };

    return (
        <div className="payment-method-container">
            <h2>Seleccionar Método de Pago</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        <input
                            type="radio"
                            name="payment"
                            value="Transferencia Bancaria"
                            checked={paymentMethod === 'Transferencia Bancaria'}
                            onChange={handleChange}
                            required
                        />
                        Transferencia Bancaria
                    </label>
                </div>
                <div>
                    <label>
                        <input
                            type="radio"
                            name="payment"
                            value="Efectivo"
                            checked={paymentMethod === 'Efectivo'}
                            onChange={handleChange}
                        />
                        Efectivo
                    </label>
                </div>

                <div className="payment-buttons">
                    <button type="button" className="checkout-button" onClick={onBack}>
                        Volver
                    </button>
                    <button type="submit" className="checkout-button">
                        Siguiente
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PaymentMethod;
