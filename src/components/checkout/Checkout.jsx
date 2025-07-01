import React, { useState } from 'react';
import CheckoutForm from './CheckoutForm';
import PaymentMethod from './PaymentMethod';
import OrderConfirmation from './OrderConfirmation';

const Checkout = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [deliveryCost, setDeliveryCost] = useState(0);

    const handleNextStep = (data) => {
        if (currentStep === 1) {
            setFormData(data);
        }
        if (currentStep === 2) {
            setPaymentMethod(data);
        }
        setCurrentStep(currentStep + 1);
    };

    const handlePreviousStep = () => {
        setCurrentStep(currentStep - 1);
    };

    return (
        <div className="checkout-container">
            {currentStep === 1 && <CheckoutForm onNext={handleNextStep} />}
            {currentStep === 2 && <PaymentMethod paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} onBack={handlePreviousStep} onNext={handleNextStep} />}
            {currentStep === 3 && (
                <OrderConfirmation
                    formData={formData}
                    paymentMethod={paymentMethod}
                    deliveryCost={deliveryCost}
                    setDeliveryCost={setDeliveryCost}
                    onBack={handlePreviousStep} // <-- This prop is now passed
                />
            )}
        </div>
    );
};

export default Checkout;
