import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [view, setView] = useState('tienda');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [cart, setCart] = useState([]);
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    fetch('http://TU_IP_PUBLICA_AWS:3000/productos')
      .then(res => res.json()).then(data => setProductos(data));
  }, []);

  const total = cart.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);

  const agregarAlCarrito = (p) => {
    const existe = cart.find(i => i.id_producto === p.id_producto);
    if (existe) setCart(cart.map(i => i.id_producto === p.id_producto ? {...i, cantidad: i.cantidad + 1} : i));
    else setCart([...cart, {...p, cantidad: 1}]);
  };

  const finalizarCompra = async () => {
    if (!user) return setView('login');
    const res = await fetch('http://TU_IP_PUBLICA_AWS:3000/boletas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
      body: JSON.stringify({ total, productos: cart })
    });
    if (res.ok) { setCart([]); alert('Compra exitosa'); setView('historial'); }
  };

  return (
    <div className="bg-light min-vh-100">
      <nav className="navbar navbar-dark bg-dark px-4 mb-4">
        <span className="navbar-brand pointer" onClick={() => setView('tienda')}>LevelUp Gamer</span>
        <div>
          <button className="btn btn-outline-light me-2" onClick={() => setView('tienda')}>Tienda</button>
          {!user ? (
            <button className="btn btn-primary" onClick={() => setView('registro')}>Registrarse</button>
          ) : (
            <button className="btn btn-info" onClick={() => setView('historial')}>Mis Compras</button>
          )}
          <button className="btn btn-warning ms-2" onClick={() => setView('carrito')}>🛒 ({cart.length})</button>
        </div>
      </nav>

      <div className="container">
        {view === 'tienda' && (
          <div className="row">
            {productos.map(p => (
              <div key={p.id_producto} className="col-md-4 mb-3">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <h5>{p.nombre}</h5>
                    <p className="text-muted small">{p.descripcion}</p>
                    <h5 className="text-primary">${p.precio}</h5>
                    <button className="btn btn-success w-100" onClick={() => agregarAlCarrito(p)}>Comprar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'registro' && (
          <div className="card mx-auto p-4 shadow" style={{maxWidth: '400px'}}>
            <h3>Crear Cuenta</h3>
            <input type="text" id="reg-nom" placeholder="Nombre" className="form-control mb-2" />
            <input type="email" id="reg-em" placeholder="Email" className="form-control mb-2" />
            <input type="password" id="reg-pass" placeholder="Password" className="form-control mb-3" />
            <button className="btn btn-primary w-100" onClick={async () => {
               const nombre = document.getElementById('reg-nom').value;
               const email = document.getElementById('reg-em').value;
               const password = document.getElementById('reg-pass').value;
               const res = await fetch('http://TU_IP_PUBLICA_AWS:3000/registro', {
                 method: 'POST',
                 headers: {'Content-Type': 'application/json'},
                 body: JSON.stringify({nombre, email, password})
               });
               if (res.ok) setView('login');
            }}>Registrar</button>
          </div>
        )}

        {view === 'carrito' && (
          <div className="card p-4 shadow">
            <h3>Tu Pedido</h3>
            {cart.map(item => (
              <div key={item.id_producto} className="d-flex justify-content-between border-bottom py-2">
                <span>{item.nombre} x{item.cantidad}</span>
                <span>${item.precio * item.cantidad}</span>
              </div>
            ))}
            <h4 className="mt-3">Total: ${total}</h4>
            <button className="btn btn-success w-100 mt-3" onClick={finalizarCompra}>Pagar y Generar Boleta</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;