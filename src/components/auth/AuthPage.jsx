import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaGoogle } from 'react-icons/fa';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nombre, setNombre] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const { login, register, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
                Swal.fire("¡Éxito!", "Has iniciado sesión correctamente.", "success");
                navigate('/');
            } else {
                await register(email, password, nombre);
                Swal.fire("¡Éxito!", "Tu cuenta ha sido creada. ¡Bienvenido!", "success");
                navigate('/');
            }
        } catch (err) {
            setError(err.message);
            Swal.fire("Error", "No se pudo completar la operación. Verifica tus datos.", "error");
        }
        setLoading(false);
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setGoogleLoading(true);
        try {
            await loginWithGoogle();
            Swal.fire("¡Éxito!", "Has iniciado sesión con Google.", "success");
            navigate('/');
        } catch (err) {
            setError(err.message);
            Swal.fire("Error de Google", "No se pudo iniciar sesión con Google.", "error");
        }
        setGoogleLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-form-wrapper">
                <h2>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
                {error && <p className="auth-error">{error}</p>}
                
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <label>Nombre</label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading || googleLoading} className="auth-button">
                        {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
                    </button>
                </form>

                <div className="separator"><span>O</span></div>

                <button onClick={handleGoogleSignIn} disabled={loading || googleLoading} className="google-button">
                    <FaGoogle className="google-icon" />
                    {googleLoading ? 'Cargando...' : 'Continuar con Google'}
                </button>

                <button onClick={() => setIsLogin(!isLogin)} className="auth-toggle-button">
                    {isLogin ? '¿No tienes una cuenta? Regístrate' : '¿Ya tienes una cuenta? Inicia sesión'}
                </button>
            </div>
        </div>
    );
};

export default AuthPage;
