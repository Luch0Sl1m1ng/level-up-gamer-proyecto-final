import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import ListaProductos from './components/ListaProductos';
import ProductoComponent from './components/ProductoComponent';
import LoginComponent from './components/LoginComponent';
import AuthService from './services/AuthService';

function App() {
  const usuario = AuthService.getCurrentUser();

  const cerrarSesion = () => {
    AuthService.logout();
    window.location.href = "/login";
  };

  return (
    <BrowserRouter>
      <nav className="navbar navbar-expand navbar-dark bg-dark px-4 mb-4">
        <Link to="/" className="navbar-brand">🎮 Level-Up Gamer</Link>
        <div className="navbar-nav ms-auto">
          {usuario ? (
            <>
              <li className="nav-item">
                <Link to={"/productos"} className="nav-link">Productos</Link>
              </li>
              <li className="nav-item">
                <button onClick={cerrarSesion} className="btn btn-outline-danger btn-sm ms-2">Salir</button>
              </li>
            </>
          ) : (
            <li className="nav-item">
              <Link to={"/login"} className="nav-link">Iniciar Sesión</Link>
            </li>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<ListaProductos />} />
        <Route path="/productos" element={<ListaProductos />} />
        <Route path="/add-producto" element={<ProductoComponent />} />
        <Route path="/edit-producto/:id" element={<ProductoComponent />} />
        <Route path="/login" element={<LoginComponent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;