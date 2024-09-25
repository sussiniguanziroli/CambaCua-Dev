import React, { useState } from 'react';
import CheckoutForm from './CheckoutForm';
import PaymentMethod from './PaymentMethod';
import OrderConfirmation from './OrderConfirmation';

const Checkout = () => {
    const [currentStep, setCurrentStep] = useState(1); // Controla el paso del proceso
    const [formData, setFormData] = useState(null); // Almacena los datos del formulario
    const [paymentMethod, setPaymentMethod] = useState(null); // Almacena el método de pago

    const handleNextStep = (data) => {
        if (currentStep === 1) {
            setFormData(data);  // Guarda los datos del formulario en el primer paso
        }
        if (currentStep === 2) {
            setPaymentMethod(data);  // Guarda el método de pago en el segundo paso
        }
        setCurrentStep(currentStep + 1); // Avanza al siguiente paso
    };

    const handlePreviousStep = () => {
        setCurrentStep(currentStep - 1); // Vuelve al paso anterior
    };

    return (
        <div className="checkout-container">
            {currentStep === 1 && <CheckoutForm onNext={handleNextStep} />}
            {currentStep === 2 && <PaymentMethod onBack={handlePreviousStep} onNext={handleNextStep} />}
            {currentStep === 3 && (
                <OrderConfirmation
                    formData={formData}
                    paymentMethod={paymentMethod}
                />
            )}
        </div>
    );
};

export default Checkout;
