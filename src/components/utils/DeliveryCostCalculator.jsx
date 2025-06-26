import React, { useState } from 'react';
import { FaTruck } from 'react-icons/fa';

// The URL of the function you just deployed.
const FUNCTION_URL = 'https://us-central1-cambacuavet-d3dfc.cloudfunctions.net/calculateDeliveryCost';

const DeliveryCostCalculator = ({ address, placeId, onCostCalculated }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [calculatedCost, setCalculatedCost] = useState(null);
    const [error, setError] = useState('');

    const handleCalculateCost = async () => {
        if (!placeId) {
            setError('Por favor, selecciona una dirección válida de la lista.');
            return;
        }

        setIsLoading(true);
        setError('');
        setCalculatedCost(null);

        try {
            // Use a standard fetch POST request.
            const response = await fetch(FUNCTION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: { placeId: placeId } }),
            });

            const result = await response.json();

            if (!response.ok) {
                // Handle errors returned from the function.
                throw new Error(result.error || `Error del servidor: ${response.status}`);
            }
            
            const cost = result.data.cost;

            setCalculatedCost(cost);
            onCostCalculated(cost);

        } catch (apiError) {
            console.error("Error calling Firebase Function:", apiError);
            setError(apiError.message || 'No se pudo calcular el costo. Intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="delivery-calculator-container">
            <h4><FaTruck /> Costo de Envío</h4>
            <div className="delivery-address-info">
                <p>Calculado para la dirección:</p>
                <strong>{address}</strong>
            </div>
            <button onClick={handleCalculateCost} disabled={isLoading || !address} className="calculate-button">
                {isLoading ? <><span className="button-loader-small"></span>Calculando...</> : 'Calcular Costo de Envío'}
            </button>
            {error && <p className="delivery-error">{error}</p>}
            {calculatedCost !== null && !isLoading && (
                 <div className="delivery-cost-result">
                    <p>Costo de envío estimado:</p>
                    <span>${calculatedCost.toLocaleString('es-AR')}</span>
                </div>
            )}
        </div>
    );
};

export default DeliveryCostCalculator;

