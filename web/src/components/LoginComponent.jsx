import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
const LoginComponent = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mensaje, setMensaje] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();

        AuthService.login({ email, password })
            .then(() => {
                navigate('/productos');
                window.location.reload();
            })
            .catch(error => {
                console.log(error);
                setMensaje("Credenciales incorrectas");
            });
    };

    return (
        <div className="container mt-5">
            <div className="card col-md-6 offset-md-3 shadow">
                <div className="card-header bg-primary text-white text-center">
                    <h3>Iniciar Sesión - LevelUp</h3>
                </div>
                <div className="card-body">
                    <form onSubmit={handleLogin}>
                        <div className="form-group mb-3">
                            <label>Email:</label>
                            <input 
                                type="email" 
                                className="form-control" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="form-group mb-3">
                            <label>Contraseña:</label>
                            <input 
                                type="password" 
                                className="form-control" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                        </div>
                        {mensaje && <div className="alert alert-danger">{mensaje}</div>}
                        <button className="btn btn-primary w-100">Ingresar</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginComponent;
