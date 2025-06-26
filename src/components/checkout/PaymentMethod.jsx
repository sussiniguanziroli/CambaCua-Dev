import React, { useEffect } from 'react';
import Swal from 'sweetalert2';
import { useCarrito } from '../../context/CarritoContext';

const PaymentMethod = ({ paymentMethod, setPaymentMethod, onNext, onBack }) => {
    const { calcularTotal } = useCarrito();
    const total = calcularTotal();
    const LIMITE_EFECTIVO = 70000;
    const efectivoDeshabilitado = total > LIMITE_EFECTIVO;

    useEffect(() => {
        if (efectivoDeshabilitado && paymentMethod === 'Efectivo') {
            setPaymentMethod('Transferencia Bancaria');
            Swal.fire({
                title: 'Método de pago no disponible',
                text: `El pago en efectivo solo está disponible para compras de hasta $${LIMITE_EFECTIVO.toLocaleString('es-AR')}. Se ha seleccionado "Transferencia Bancaria".`,
                icon: 'info',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#3085d6'
            });
        }
    }, [efectivoDeshabilitado, paymentMethod, setPaymentMethod]);

    const handleChange = (e) => {
        const metodo = e.target.value;
        setPaymentMethod(metodo);

        if (metodo === 'Efectivo' && !efectivoDeshabilitado) {
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
                <div className="payment-option">
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

                <div className={`payment-option ${efectivoDeshabilitado ? 'disabled' : ''}`}>
                    <label>
                        <input
                            type="radio"
                            name="payment"
                            value="Efectivo"
                            checked={paymentMethod === 'Efectivo'}
                            onChange={handleChange}
                            disabled={efectivoDeshabilitado}
                        />
                        Efectivo
                    </label>
                    {efectivoDeshabilitado && (
                        <span className="disabled-reason">
                            (No disponible en compras mayores a ${LIMITE_EFECTIVO.toLocaleString('es-AR')})
                        </span>
                    )}
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
