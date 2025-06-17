import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

const ProtectedRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div>Cargando...</div>; 
    }

    if (!currentUser) {
        Swal.fire({
            title: 'Inicio de Sesión Requerido',
            text: 'Debes iniciar sesión para continuar con la compra.',
            icon: 'info',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#0b369c'
        });
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
