import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductoService from '../services/ProductoService';

const ListaProductos = () => {
    const [productos, setProductos] = useState([]);

    useEffect(() => {
        listarProductos();
    }, []);

    const listarProductos = () => {
        ProductoService.getAllProductos()
            .then(response => {
                setProductos(response.data);
            })
            .catch(error => {
                console.log(error);
            });
    };

    const deleteProducto = (id) => {
        if(window.confirm("¿Eliminar?")) {
            ProductoService.deleteProducto(id)
                .then(() => listarProductos())
                .catch(error => console.log(error));
        }
    };

    return (
        <div className="container p-4">
            <h2 className="text-center mb-4">Inventario Level-Up Gamer</h2>
            <Link to="/add-producto" className="btn btn-primary mb-3">Agregar Producto</Link>
            <table className="table table-bordered table-striped">
                <thead className="table-dark">
                    <tr>
                        <th>ID</th><th>Nombre</th><th>Precio</th><th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        productos.map(p => (
                            <tr key={p.id_producto}> {/* OJO: Tu BD usa id_producto, no id */}
                                <td>{p.id_producto}</td> 
                                <td>{p.nombre}</td>
                                <td>${p.precio}</td>
                                <td>
                                    <button className="btn btn-danger" onClick={() => deleteProducto(p.id_producto)}>Eliminar</button>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    );
};

export default ListaProductos;
