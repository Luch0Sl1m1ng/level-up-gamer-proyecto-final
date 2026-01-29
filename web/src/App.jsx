import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [view, setView] = useState('tienda');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [cart, setCart] = useState([]);
  const [productos, setProductos] = useState([]);
  const [boletas, setBoletas] = useState([]);
  

  const IP_AWS = 'http://54.90.162.162:3000';

  useEffect(() => {
    fetch(`${IP_AWS}/productos`)
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(err => console.error("Error cargando productos:", err));
  }, []);



  const manejarRegistro = async (e) => {
    e.preventDefault();
    const nombre = e.target.nom.value;
    const email = e.target.em.value;
    const pass = e.target.pass.value;

    if (!nombre || !email || !pass) return alert("¡No puedes dejar campos vacíos!");
    
    const res = await fetch(`${IP_AWS}/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password: pass })
    });

    if (res.ok) {
      alert("Registro exitoso, ahora inicia sesión");
      setView('login');
    } else {
      alert("Error en el registro");
    }
  };

  const manejarLogin = async (e) => {
    e.preventDefault();
    const email = e.target.em.value;
    const pass = e.target.pass.value;

    if (!email || !pass) return alert("Ingresa tus credenciales");

    const res = await fetch(`${IP_AWS}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      setView('tienda');
    } else {
      alert("Correo o contraseña incorrectos");
    }
  };

  const finalizarCompra = async () => {
    if (!user) return setView('login');
    const total = cart.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
    
    const res = await fetch(`${IP_AWS}/boletas`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}` 
      },
      body: JSON.stringify({ total, productos: cart })
    });

    if (res.ok) {
      alert("¡Compra realizada! Boleta generada.");
      setCart([]);
      setView('tienda');
    }
  };



  return (
    <div className="bg-light min-vh-100">
      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 shadow">
        <span className="navbar-brand fw-bold">LevelUp Gamer</span>
        <div className="ms-auto">
          <button className="btn btn-outline-light me-2" onClick={() => setView('tienda')}>Tienda</button>
          {!user ? (
            <>
              <button className="btn btn-outline-light me-2" onClick={() => setView('login')}>Login</button>
              <button className="btn btn-primary" onClick={() => setView('registro')}>Registrarse</button>
            </>
          ) : (
            <>
              {user.rol === 'vendedor' && (
                <button className="btn btn-info me-2" onClick={() => setView('inventario')}>Inventario</button>
              )}
              <button className="btn btn-danger" onClick={() => { localStorage.clear(); setUser(null); setView('tienda'); }}>Salir</button>
            </>
          )}
          <button className="btn btn-warning ms-2" onClick={() => setView('carrito')}>🛒 ({cart.length})</button>
        </div>
      </nav>

      <div className="container mt-5">
        {/* VISTA TIENDA */}
        {view === 'tienda' && (
          <div className="row">
            {productos.map(p => (
              <div key={p.id_producto} className="col-md-4 mb-4">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-body">
                    <h5 className="card-title fw-bold">{p.nombre}</h5>
                    <p className="card-text text-muted small">{p.descripcion}</p>
                    <h5 className="text-primary fw-bold">${p.precio}</h5>
                    <button className="btn btn-success w-100 mt-2" onClick={() => {
                      const exists = cart.find(item => item.id_producto === p.id_producto);
                      if (exists) setCart(cart.map(item => item.id_producto === p.id_producto ? {...item, cantidad: item.cantidad + 1} : item));
                      else setCart([...cart, {...p, cantidad: 1}]);
                    }}>Añadir</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VISTA REGISTRO */}
        {view === 'registro' && (
          <div className="card p-4 mx-auto shadow" style={{maxWidth: '400px'}}>
            <h3 className="text-center mb-4">Crear Cuenta</h3>
            <form onSubmit={manejarRegistro}>
              <input name="nom" type="text" placeholder="Nombre completo" className="form-control mb-3" required />
              <input name="em" type="email" placeholder="Correo electrónico" className="form-control mb-3" required />
              <input name="pass" type="password" placeholder="Contraseña (mín. 6)" className="form-control mb-3" required minLength="6" />
              <button type="submit" className="btn btn-primary w-100">Registrarme</button>
            </form>
          </div>
        )}

        {/* VISTA INVENTARIO (ADMIN) */}
        {view === 'inventario' && (
          <div className="card p-4 shadow">
            <h2 className="mb-4">Inventario Level-Up Gamer</h2>
            <button className="btn btn-primary mb-3" style={{width: '180px'}}>Agregar Producto</button>
            <table className="table table-hover">
              <thead className="table-dark">
                <tr>
                  <th>ID</th><th>Nombre</th><th>Precio</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map(p => (
                  <tr key={p.id_producto}>
                    <td>{p.id_producto}</td><td>{p.nombre}</td><td>${p.precio}</td>
                    <td><button className="btn btn-sm btn-danger">Eliminar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* VISTA CARRITO */}
        {view === 'carrito' && (
          <div className="card p-4 shadow mx-auto" style={{maxWidth: '600px'}}>
            <h3>Tu Carrito</h3>
            <hr />
            {cart.length === 0 ? <p>El carrito está vacío</p> : (
              <>
                {cart.map(item => (
                  <div key={item.id_producto} className="d-flex justify-content-between mb-2">
                    <span>{item.nombre} (x{item.cantidad})</span>
                    <span>${item.precio * item.cantidad}</span>
                  </div>
                ))}
                <hr />
                <h4 className="text-end">Total: ${cart.reduce((acc, p) => acc + (p.precio * p.cantidad), 0)}</h4>
                <button className="btn btn-success w-100 mt-3" onClick={finalizarCompra}>Finalizar Compra y Generar Boleta</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;