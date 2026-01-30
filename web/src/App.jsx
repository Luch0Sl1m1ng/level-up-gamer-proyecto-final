import { useEffect, useMemo, useState } from "react";

function App() {
  const [view, setView] = useState("tienda");
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [boletas, setBoletas] = useState([]);

  const [loadingProductos, setLoadingProductos] = useState(false);
  const [errorProductos, setErrorProductos] = useState(null);

  const [loadingBoletas, setLoadingBoletas] = useState(false);
  const [errorBoletas, setErrorBoletas] = useState(null);

  // Admin
  const [adminMsg, setAdminMsg] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editCodigo, setEditCodigo] = useState("");
  const [editNombre, setEditNombre] = useState("");
  const [editPrecio, setEditPrecio] = useState("");

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const API_BASE = "http://54.242.30.23:3000";

  const authHeaders = useMemo(() => {
    return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
  }, [user]);


  const safeArray = (x) => (Array.isArray(x) ? x : []);

  const normalizeBoleta = (b) => {
    const id =
      b?.id_boleta ?? b?.id ?? b?.idBoleta ?? b?.boleta_id ?? b?.id_boleta_compra;

    const fecha =
      b?.fecha ?? b?.created_at ?? b?.fecha_boleta ?? b?.createdAt ?? b?.timestamp;

    const total =
      b?.total ?? b?.monto_total ?? b?.total_boleta ?? b?.monto ?? b?.valor_total;

    return { id_boleta: id ?? null, fecha: fecha ?? null, total: total ?? null };
  };

  const fetchJson = async (url, options = {}) => {
    const res = await fetch(url, options);
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
    return { ok: res.ok, status: res.status, data };
  };


  const cargarProductos = async () => {
    setLoadingProductos(true);
    setErrorProductos(null);
    try {
      const { ok, status, data } = await fetchJson(`${API_BASE}/productos`);
      if (!ok) throw new Error(`HTTP ${status}`);
      setProductos(safeArray(data));
    } catch (e) {
      setProductos([]);
      setErrorProductos(e.message || "Error cargando productos");
    } finally {
      setLoadingProductos(false);
    }
  };


  const cargarBoletas = async () => {
    setErrorBoletas(null);

    if (!user?.token) {
      setBoletas([]);
      return;
    }

    setLoadingBoletas(true);
    try {
      const { ok, status, data } = await fetchJson(`${API_BASE}/boletas`, {
        headers: { ...authHeaders },
      });
      if (!ok) throw new Error(`HTTP ${status}`);

      const normalizadas = safeArray(data).map(normalizeBoleta);
      const limpias = normalizadas.filter(
        (b) => b.id_boleta != null || b.fecha != null || b.total != null
      );

      setBoletas(limpias);
    } catch (e) {
      setBoletas([]);
      setErrorBoletas(e.message || "Error cargando boletas");
    } finally {
      setLoadingBoletas(false);
    }
  };

  useEffect(() => {
    cargarProductos();

  }, []);

  useEffect(() => {
    if (view === "historial") cargarBoletas();
    if (view === "admin") setAdminMsg(null);

  }, [view, user]);


  const registrar = async (e) => {
    e.preventDefault();

    const payload = {
      nombre: e.target.nom.value,
      email: e.target.em.value,
      password: e.target.pass.value,
    };

    const { ok, status, data } = await fetchJson(`${API_BASE}/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (ok) {
      alert("¡Cliente registrado!");
      setView("login");
    } else {
      alert(`Error registrando usuario (HTTP ${status})\n${JSON.stringify(data)}`);
    }
  };

  const login = async (e) => {
    e.preventDefault();

    const payload = {
      email: e.target.em.value,
      password: e.target.pass.value,
    };

    const { ok, status, data } = await fetchJson(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (ok) {
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      setView("tienda");
    } else {
      alert(`Credenciales inválidas (HTTP ${status})\n${JSON.stringify(data)}`);
    }
  };


  const finalizarCompra = async () => {
    if (!user?.token) {
      alert("Debes iniciar sesión para finalizar la compra.");
      setView("login");
      return;
    }

    const total = carrito.reduce((acc, p) => acc + Number(p.precio), 0);

    const { ok, status, data } = await fetchJson(`${API_BASE}/boletas`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ total }),
    });

    if (ok) {
      alert(`Compra Exitosa. Total: $${total}. Boleta guardada.`);
      setCarrito([]);
      setView("historial");
      cargarBoletas();
    } else {
      alert(`Error guardando boleta (HTTP ${status})\n${JSON.stringify(data)}`);
    }
  };




  const crearProducto = async (e) => {
    e.preventDefault();
    setAdminMsg(null);

    if (user?.rol !== "vendedor") {
      setAdminMsg("Acceso denegado: solo vendedor.");
      return;
    }

    const payload = {
      codigo: e.target.codigo.value,
      nombre: e.target.nombre.value,
      precio: Number(e.target.precio.value),
    };

    const { ok, status, data } = await fetchJson(`${API_BASE}/productos`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify(payload),
    });

    if (ok) {
      setAdminMsg("✅ Producto creado.");
      e.target.reset();
      await cargarProductos();
    } else {
      setAdminMsg(`❌ Error creando producto (HTTP ${status}): ${JSON.stringify(data)}`);
    }
  };

  const eliminarProducto = async (id) => {
    setAdminMsg(null);
    if (!confirm("¿Eliminar este producto?")) return;

    const { ok, status, data } = await fetchJson(`${API_BASE}/productos/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders },
    });

    if (ok) {
      setAdminMsg("✅ Producto eliminado.");
      await cargarProductos();
    } else {
      setAdminMsg(`❌ Error eliminando (HTTP ${status}): ${JSON.stringify(data)}`);
    }
  };

  const iniciarEdicion = (p) => {
    setEditId(p.id_producto);
    setEditCodigo(p.codigo ?? "");
    setEditNombre(p.nombre ?? "");
    setEditPrecio(p.precio != null ? String(p.precio) : "");
    setAdminMsg(null);
  };

  const cancelarEdicion = () => {
    setEditId(null);
    setEditCodigo("");
    setEditNombre("");
    setEditPrecio("");
  };

  const guardarEdicion = async () => {
    setAdminMsg(null);

    if (!editCodigo?.trim()) {
      setAdminMsg("❌ El código no puede estar vacío.");
      return;
    }

    const payload = {
      codigo: editCodigo.trim(),
      nombre: editNombre,
      precio: Number(editPrecio),
    };

    const { ok, status, data } = await fetchJson(`${API_BASE}/productos/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify(payload),
    });

    if (ok) {
      setAdminMsg("✅ Producto actualizado.");
      cancelarEdicion();
      await cargarProductos();
    } else {
      setAdminMsg(`❌ Error actualizando (HTTP ${status}): ${JSON.stringify(data)}`);
    }
  };

  return (
    <div className="bg-light min-vh-100">
      <nav className="navbar navbar-dark bg-dark px-4 mb-4 shadow">
        <span className="navbar-brand fw-bold">LevelUp Gamer</span>

        <div className="ms-auto">
          <button className="btn btn-outline-light btn-sm me-2" onClick={() => setView("tienda")}>
            Tienda
          </button>

          <button className="btn btn-warning btn-sm me-2 fw-bold" onClick={() => setView("carrito")}>
            🛒 ({carrito.length})
          </button>

          {user?.token && (
            <button className="btn btn-info btn-sm me-2" onClick={() => setView("historial")}>
              Historial
            </button>
          )}

          {user?.rol === "vendedor" && (
            <button className="btn btn-success btn-sm me-2" onClick={() => setView("admin")}>
              Inventario
            </button>
          )}

          {!user?.token ? (
            <>
              <button className="btn btn-primary btn-sm me-2" onClick={() => setView("login")}>
                Login
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setView("registro")}>
                Registro
              </button>
            </>
          ) : (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => {
                localStorage.clear();
                setUser(null);
                setBoletas([]);
                setView("tienda");
              }}
            >
              Salir
            </button>
          )}
        </div>
      </nav>

      <div className="container">
        {/* LOGIN */}
        {view === "login" && (
          <div className="card p-4 shadow-sm mx-auto" style={{ maxWidth: "350px" }}>
            <h5>Login</h5>
            <form onSubmit={login}>
              <input name="em" className="form-control mb-2" placeholder="Email" required />
              <input
                name="pass"
                type="password"
                className="form-control mb-3"
                placeholder="Contraseña"
                required
              />
              <button className="btn btn-primary w-100">Ingresar</button>
            </form>
          </div>
        )}

        {/* REGISTRO */}
        {view === "registro" && (
          <div className="card p-4 shadow-sm mx-auto" style={{ maxWidth: "350px" }}>
            <h5>Registro de Cliente</h5>
            <form onSubmit={registrar}>
              <input name="nom" className="form-control mb-2" placeholder="Nombre" required />
              <input name="em" className="form-control mb-2" placeholder="Email" required />
              <input
                name="pass"
                type="password"
                className="form-control mb-3"
                placeholder="Contraseña"
                required
              />
              <button className="btn btn-primary w-100">Crear Cuenta</button>
            </form>
          </div>
        )}

        {/* TIENDA */}
        {view === "tienda" && (
          <>
            {loadingProductos && <div className="alert alert-info">Cargando productos...</div>}
            {errorProductos && <div className="alert alert-danger">Error: {errorProductos}</div>}

            {!loadingProductos && !errorProductos && productos.length === 0 && (
              <div className="alert alert-warning">No hay productos registrados todavía.</div>
            )}

            <div className="row">
              {productos.map((p) => (
                <div key={p.id_producto} className="col-md-4 mb-4">
                  <div className="card shadow-sm p-3 text-center border-0">
                    <h6>{p.nombre}</h6>
                    <p className="text-primary fw-bold">${p.precio}</p>
                    <button className="btn btn-success btn-sm w-100" onClick={() => setCarrito([...carrito, p])}>
                      Añadir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* CARRITO */}
        {view === "carrito" && (
          <div className="card p-4 shadow border-0 mx-auto" style={{ maxWidth: "600px" }}>
            <h4>Tu Carrito</h4>

            {carrito.length === 0 ? (
              <div className="alert alert-warning mt-3">Tu carrito está vacío.</div>
            ) : (
              <>
                {carrito.map((p, i) => (
                  <div key={i} className="d-flex justify-content-between border-bottom py-2">
                    <span>{p.nombre}</span>
                    <span>${p.precio}</span>
                  </div>
                ))}
                <h5 className="text-end mt-3">
                  Total: ${carrito.reduce((acc, p) => acc + Number(p.precio), 0)}
                </h5>
                <button className="btn btn-warning w-100 mt-3 fw-bold" onClick={finalizarCompra}>
                  FINALIZAR COMPRA
                </button>
              </>
            )}
          </div>
        )}

        {/* HISTORIAL */}
        {view === "historial" && (
          <div className="card p-4 shadow">
            <h4>Mis Boletas</h4>

            {loadingBoletas && <div className="alert alert-info">Cargando boletas...</div>}
            {errorBoletas && <div className="alert alert-danger">Error: {errorBoletas}</div>}

            {!loadingBoletas && !errorBoletas && boletas.length === 0 && (
              <div className="alert alert-warning mt-3">Aún no tienes boletas registradas.</div>
            )}

            {!loadingBoletas && !errorBoletas && boletas.length > 0 && (
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {boletas.map((b, idx) => (
                    <tr key={b.id_boleta ?? idx}>
                      <td>{b.id_boleta ?? "-"}</td>
                      <td>{b.fecha ? new Date(b.fecha).toLocaleString("es-CL") : "-"}</td>
                      <td>{b.total != null ? `$${b.total}` : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ADMIN */}
        {view === "admin" && (
          <div className="card p-4 shadow">
            <h4>Inventario (Vendedor)</h4>

            {user?.rol !== "vendedor" ? (
              <div className="alert alert-danger mt-3">Acceso denegado: solo vendedor.</div>
            ) : (
              <>
                {adminMsg && <div className="alert alert-secondary mt-3">{adminMsg}</div>}

                {/* Crear producto */}
                <form onSubmit={crearProducto} className="row g-2 align-items-end mt-2">
                  <div className="col-md-3">
                    <label className="form-label">Código</label>
                    <input name="codigo" className="form-control" placeholder="Ej: PRD-001" required />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Nombre</label>
                    <input name="nombre" className="form-control" placeholder="Ej: Control PS5" required />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Precio</label>
                    <input name="precio" type="number" className="form-control" placeholder="Ej: 59990" required />
                  </div>

                  <div className="col-md-12 mt-2">
                    <button className="btn btn-success w-100">Crear</button>
                  </div>
                </form>

                <hr />

                {/* Lista + Edit/Delete */}
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th className="text-end">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productos.map((p) => (
                        <tr key={p.id_producto}>
                          <td>{p.id_producto}</td>

                          <td style={{ width: 170 }}>
                            {editId === p.id_producto ? (
                              <input
                                className="form-control"
                                value={editCodigo}
                                onChange={(e) => setEditCodigo(e.target.value)}
                              />
                            ) : (
                              p.codigo ?? "-"
                            )}
                          </td>

                          <td>
                            {editId === p.id_producto ? (
                              <input
                                className="form-control"
                                value={editNombre}
                                onChange={(e) => setEditNombre(e.target.value)}
                              />
                            ) : (
                              p.nombre
                            )}
                          </td>

                          <td style={{ width: 160 }}>
                            {editId === p.id_producto ? (
                              <input
                                type="number"
                                className="form-control"
                                value={editPrecio}
                                onChange={(e) => setEditPrecio(e.target.value)}
                              />
                            ) : (
                              `$${p.precio}`
                            )}
                          </td>

                          <td className="text-end" style={{ width: 220 }}>
                            {editId === p.id_producto ? (
                              <>
                                <button className="btn btn-primary btn-sm me-2" onClick={guardarEdicion} type="button">
                                  Guardar
                                </button>
                                <button className="btn btn-secondary btn-sm" onClick={cancelarEdicion} type="button">
                                  Cancelar
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="btn btn-outline-primary btn-sm me-2"
                                  onClick={() => iniciarEdicion(p)}
                                  type="button"
                                >
                                  Editar
                                </button>
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => eliminarProducto(p.id_producto)}
                                  type="button"
                                >
                                  Eliminar
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {productos.length === 0 && (
                    <div className="alert alert-warning">No hay productos cargados.</div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
